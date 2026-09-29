from datetime import datetime
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from typing import List, Dict, Any
from app.models.doctor_profile import DoctorProfile, DoctorCredential, VerificationStatus
from app.models.hospital_profile import HospitalProfile
from app.models.user import User, RoleName
from app.models.notification import NotificationType
from app.schemas.provider_search import ProviderVerificationReview, ProviderVerificationItem
from app.services.notification_service import NotificationService

class ProviderVerificationService:
    @staticmethod
    def get_pending_verifications(db: Session, admin_user: User) -> List[ProviderVerificationItem]:
        # Check SYSTEM_ADMIN role
        admin_roles = [ur.role.name for ur in admin_user.roles]
        if RoleName.SYSTEM_ADMIN not in admin_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access Denied: Only SYSTEM_ADMIN role can review provider verifications."
            )

        items: List[ProviderVerificationItem] = []

        # Pending Doctor Credentials
        pending_creds = db.query(DoctorCredential).filter(
            DoctorCredential.verification_status == VerificationStatus.PENDING
        ).all()
        for cred in pending_creds:
            doc_prof = db.query(DoctorProfile).filter(DoctorProfile.id == cred.doctor_profile_id).first()
            doc_user = db.query(User).filter(User.id == doc_prof.user_id).first() if doc_prof else None
            items.append(
                ProviderVerificationItem(
                    provider_type="DOCTOR",
                    id=doc_prof.id if doc_prof else cred.id,
                    name=doc_user.full_name if doc_user else "Synthetic Doctor",
                    identifier=cred.professional_id,
                    details=f"Specialization: {doc_prof.specialization if doc_prof else 'N/A'} | Qualification: {doc_prof.qualification if doc_prof else 'N/A'}",
                    verification_status=cred.verification_status,
                    submitted_at=cred.created_at.isoformat(),
                )
            )

        # Pending Hospital Profiles
        pending_hosps = db.query(HospitalProfile).filter(
            HospitalProfile.verification_status == VerificationStatus.PENDING
        ).all()
        for hosp in pending_hosps:
            items.append(
                ProviderVerificationItem(
                    provider_type="HOSPITAL",
                    id=hosp.id,
                    name=hosp.name,
                    identifier=hosp.registration_number,
                    details=f"City: {hosp.location_city}, {hosp.state} | Services: {hosp.services_summary or 'N/A'}",
                    verification_status=hosp.verification_status,
                    submitted_at=hosp.created_at.isoformat(),
                )
            )

        return items

    @staticmethod
    def review_provider(
        db: Session,
        admin_user: User,
        data: ProviderVerificationReview
    ) -> Dict[str, Any]:
        # Check SYSTEM_ADMIN role
        admin_roles = [ur.role.name for ur in admin_user.roles]
        if RoleName.SYSTEM_ADMIN not in admin_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access Denied: Only SYSTEM_ADMIN role can approve or reject provider verifications."
            )

        action_upper = data.action.upper()
        if action_upper not in ["APPROVE", "REJECT"]:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Invalid verification action. Must be 'APPROVE' or 'REJECT'."
            )

        new_status = VerificationStatus.VERIFIED if action_upper == "APPROVE" else VerificationStatus.REJECTED

        if data.provider_type.upper() == "DOCTOR":
            doc_prof = db.query(DoctorProfile).filter(DoctorProfile.id == data.provider_id).first()
            if not doc_prof:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Doctor profile #{data.provider_id} not found."
                )

            cred = db.query(DoctorCredential).filter(DoctorCredential.doctor_profile_id == doc_prof.id).first()
            if not cred:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Doctor credential record not found."
                )

            cred.verification_status = new_status
            cred.verified_at = datetime.utcnow()
            cred.verified_by_user_id = admin_user.id
            db.commit()

            # Notify doctor
            NotificationService.create_notification(
                db=db,
                user_id=doc_prof.user_id,
                notification_type=NotificationType.ACCOUNT_ACTIVITY,
                title=f"Provider Verification {new_status.value}",
                message=f"Your professional medical credentials ({cred.professional_id}) have been {new_status.value.lower()} by System Admin.",
                related_entity_type="doctor_profile",
                related_entity_id=doc_prof.id,
            )

            return {
                "message": f"Doctor professional credentials successfully set to {new_status.value}.",
                "provider_type": "DOCTOR",
                "doctor_id": doc_prof.id,
                "verification_status": new_status.value,
            }

        elif data.provider_type.upper() == "HOSPITAL":
            hosp = db.query(HospitalProfile).filter(HospitalProfile.id == data.provider_id).first()
            if not hosp:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Hospital profile #{data.provider_id} not found."
                )

            hosp.verification_status = new_status
            hosp.verified_at = datetime.utcnow()
            hosp.verified_by_user_id = admin_user.id
            db.commit()

            # Notify hospital admin
            NotificationService.create_notification(
                db=db,
                user_id=hosp.admin_user_id,
                notification_type=NotificationType.ACCOUNT_ACTIVITY,
                title=f"Hospital Verification {new_status.value}",
                message=f"Your hospital organization ({hosp.name}) registration has been {new_status.value.lower()} by System Admin.",
                related_entity_type="hospital_profile",
                related_entity_id=hosp.id,
            )

            return {
                "message": f"Hospital profile verification status set to {new_status.value}.",
                "provider_type": "HOSPITAL",
                "hospital_id": hosp.id,
                "verification_status": new_status.value,
            }

        else:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Invalid provider_type. Must be 'DOCTOR' or 'HOSPITAL'."
            )
