from datetime import datetime
from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.consent import Consent, ConsentStatus, ConsentScope
from app.models.user import User, RoleName
from app.models.patient_profile import PatientProfile
from app.models.health_record import HealthRecord, RecordType
from app.models.notification import NotificationType
from app.schemas.consent import ConsentCreate, ConsentOut
from app.services.notification_service import NotificationService
from app.services.access_service import AccessEnforcementService, HEALTHCARE_ROLES

class ConsentService:
    @staticmethod
    def _format_consent_out(db: Session, consent: Consent) -> ConsentOut:
        patient = db.query(User).filter(User.id == consent.patient_user_id).first()
        requester = db.query(User).filter(User.id == consent.requester_user_id).first()
        profile = db.query(PatientProfile).filter(PatientProfile.user_id == consent.patient_user_id).first()

        return ConsentOut(
            id=consent.id,
            patient_user_id=consent.patient_user_id,
            requester_user_id=consent.requester_user_id,
            requester_name=requester.full_name if requester else "Synthetic Requester",
            patient_name=patient.full_name if patient else "Synthetic Patient",
            patient_health_wallet_id=profile.health_wallet_id if profile else None,
            requester_role=consent.requester_role,
            purpose=consent.purpose,
            scope=consent.scope,
            status=consent.status,
            start_at=consent.start_at,
            expires_at=consent.expires_at,
            sensitive_data_allowed=consent.sensitive_data_allowed if consent.sensitive_data_allowed is not None else False,
            requested_at=consent.requested_at,
            responded_at=consent.responded_at,
            revoked_at=consent.revoked_at,
            created_at=consent.created_at,
            updated_at=consent.updated_at,
        )

    @staticmethod
    def create_consent_request(
        db: Session,
        requester_user: User,
        data: ConsentCreate
    ) -> ConsentOut:
        # 1. Requester role verification (Must be healthcare role)
        user_roles = [ur.role.name for ur in requester_user.roles]
        if not any(r in HEALTHCARE_ROLES for r in user_roles):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only authenticated healthcare role accounts can request patient access."
            )
        primary_role = next((r for r in user_roles if r in HEALTHCARE_ROLES), user_roles[0])

        # 2. Find target patient by synthetic Health Wallet ID
        profile = db.query(PatientProfile).filter(
            PatientProfile.health_wallet_id == data.patient_health_wallet_id.strip()
        ).first()
        if not profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Target Synthetic Health Wallet ID not found."
            )

        if profile.user_id == requester_user.id:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Requester cannot request consent from themselves."
            )

        # 3. Check for existing active or pending consent (duplicate prevention)
        existing = db.query(Consent).filter(
            Consent.patient_user_id == profile.user_id,
            Consent.requester_user_id == requester_user.id,
            Consent.scope == data.scope,
            Consent.status.in_([ConsentStatus.REQUESTED, ConsentStatus.PENDING, ConsentStatus.APPROVED, ConsentStatus.ACTIVE])
        ).first()

        if existing:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"An active or pending consent request for scope '{data.scope.value}' already exists for this patient."
            )

        # 4. Create Consent entry
        new_consent = Consent(
            patient_user_id=profile.user_id,
            requester_user_id=requester_user.id,
            requester_role=primary_role,
            purpose=data.purpose.strip(),
            scope=data.scope,
            status=ConsentStatus.REQUESTED,
            start_at=data.start_at,
            expires_at=data.expires_at,
            sensitive_data_allowed=data.sensitive_data_allowed if data.sensitive_data_allowed is not None else False,
            requested_at=datetime.utcnow(),
        )
        db.add(new_consent)
        db.commit()
        db.refresh(new_consent)

        # Trigger notification for patient
        NotificationService.create_notification(
            db=db,
            user_id=profile.user_id,
            notification_type=NotificationType.CONSENT_REQUEST,
            title="New Access Request",
            message="A healthcare user has requested access to your synthetic Health Wallet records.",
            related_entity_type="consent",
            related_entity_id=new_consent.id
        )

        return ConsentService._format_consent_out(db, new_consent)

    @staticmethod
    def get_patient_consents(db: Session, patient_user: User) -> List[ConsentOut]:
        consents = db.query(Consent).filter(
            Consent.patient_user_id == patient_user.id
        ).order_by(Consent.created_at.desc()).all()
        return [ConsentService._format_consent_out(db, c) for c in consents]

    @staticmethod
    def get_requester_consents(db: Session, requester_user: User) -> List[ConsentOut]:
        consents = db.query(Consent).filter(
            Consent.requester_user_id == requester_user.id
        ).order_by(Consent.created_at.desc()).all()
        return [ConsentService._format_consent_out(db, c) for c in consents]

    @staticmethod
    def get_consent_by_id(db: Session, current_user: User, consent_id: int) -> ConsentOut:
        consent = db.query(Consent).filter(Consent.id == consent_id).first()
        if not consent:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Consent request record not found."
            )
        if consent.patient_user_id != current_user.id and consent.requester_user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access Denied: You do not have permission to view this consent."
            )
        return ConsentService._format_consent_out(db, consent)

    @staticmethod
    def approve_consent(db: Session, patient_user: User, consent_id: int) -> ConsentOut:
        consent = db.query(Consent).filter(Consent.id == consent_id).first()
        if not consent:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Consent request record not found."
            )

        if consent.patient_user_id != patient_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access Denied: You can only approve consent requests directed to your account."
            )

        if consent.status not in [ConsentStatus.REQUESTED, ConsentStatus.PENDING]:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Invalid status transition: Cannot approve a consent with status '{consent.status.value}'."
            )

        consent.status = ConsentStatus.APPROVED
        consent.responded_at = datetime.utcnow()
        if not consent.start_at:
            consent.start_at = datetime.utcnow()

        db.commit()
        db.refresh(consent)

        # Trigger notification for requester
        NotificationService.create_notification(
            db=db,
            user_id=consent.requester_user_id,
            notification_type=NotificationType.CONSENT_APPROVED,
            title="Access Approved",
            message="Your access request has been approved by the patient.",
            related_entity_type="consent",
            related_entity_id=consent.id
        )

        return ConsentService._format_consent_out(db, consent)

    @staticmethod
    def reject_consent(db: Session, patient_user: User, consent_id: int) -> ConsentOut:
        consent = db.query(Consent).filter(Consent.id == consent_id).first()
        if not consent:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Consent request record not found."
            )

        if consent.patient_user_id != patient_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access Denied: You can only reject consent requests directed to your account."
            )

        if consent.status not in [ConsentStatus.REQUESTED, ConsentStatus.PENDING]:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Invalid status transition: Cannot reject a consent with status '{consent.status.value}'."
            )

        consent.status = ConsentStatus.REJECTED
        consent.responded_at = datetime.utcnow()
        db.commit()
        db.refresh(consent)

        # Trigger notification for requester
        NotificationService.create_notification(
            db=db,
            user_id=consent.requester_user_id,
            notification_type=NotificationType.CONSENT_REJECTED,
            title="Access Request Rejected",
            message="Your access request has been rejected by the patient.",
            related_entity_type="consent",
            related_entity_id=consent.id
        )

        return ConsentService._format_consent_out(db, consent)

    @staticmethod
    def revoke_consent(db: Session, patient_user: User, consent_id: int) -> ConsentOut:
        consent = db.query(Consent).filter(Consent.id == consent_id).first()
        if not consent:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Consent request record not found."
            )

        if consent.patient_user_id != patient_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access Denied: You can only revoke consents associated with your account."
            )

        if consent.status not in [ConsentStatus.APPROVED, ConsentStatus.ACTIVE]:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Invalid status transition: Only APPROVED consents can be revoked (current: '{consent.status.value}')."
            )

        consent.status = ConsentStatus.REVOKED
        consent.revoked_at = datetime.utcnow()
        db.commit()
        db.refresh(consent)

        # Trigger notification for requester
        NotificationService.create_notification(
            db=db,
            user_id=consent.requester_user_id,
            notification_type=NotificationType.CONSENT_REVOKED,
            title="Access Revoked",
            message="Previously approved access has been revoked by the patient.",
            related_entity_type="consent",
            related_entity_id=consent.id
        )

        return ConsentService._format_consent_out(db, consent)

    @staticmethod
    def get_patient_records_for_requester(
        db: Session,
        requester_user: User,
        patient_hw_id: str
    ) -> List[HealthRecord]:
        profile = db.query(PatientProfile).filter(
            PatientProfile.health_wallet_id == patient_hw_id.strip()
        ).first()
        if not profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Target Synthetic Health Wallet ID not found."
            )

        # Central enforcement check using AccessEnforcementService
        AccessEnforcementService.check_patient_data_access(
            db=db,
            requester_user=requester_user,
            target_patient_user_id=profile.user_id,
            requested_scope=None
        )

        active_consent = db.query(Consent).filter(
            Consent.patient_user_id == profile.user_id,
            Consent.requester_user_id == requester_user.id,
            Consent.status.in_([ConsentStatus.APPROVED, ConsentStatus.ACTIVE])
        ).first()

        records_query = db.query(HealthRecord).filter(HealthRecord.patient_user_id == profile.user_id)
        if active_consent and active_consent.scope != ConsentScope.ALL_HEALTH_RECORDS:
            scope_map = {
                ConsentScope.LAB_TESTS: [RecordType.LAB_TEST],
                ConsentScope.PRESCRIPTIONS: [RecordType.PRESCRIPTION],
                ConsentScope.CONSULTATIONS: [RecordType.CONSULTATION],
                ConsentScope.DIAGNOSES: [RecordType.DIAGNOSIS],
                ConsentScope.TREATMENTS: [RecordType.TREATMENT],
                ConsentScope.IMAGING: [RecordType.IMAGING],
            }
            allowed_types = scope_map.get(active_consent.scope, [])
            records_query = records_query.filter(HealthRecord.record_type.in_(allowed_types))

        # Notification to patient
        NotificationService.create_notification(
            db=db,
            user_id=profile.user_id,
            notification_type=NotificationType.RECORD_ACCESS,
            title="Health Record Accessed",
            message="An authorized healthcare user accessed your synthetic health records.",
            related_entity_type="patient_profile",
            related_entity_id=profile.id
        )

        return records_query.order_by(HealthRecord.record_date.desc()).all()
