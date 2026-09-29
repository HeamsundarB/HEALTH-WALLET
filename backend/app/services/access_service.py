from datetime import datetime, timezone
from typing import Optional, List
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.consent import Consent, ConsentStatus, ConsentScope
from app.models.user import User, RoleName

HEALTHCARE_ROLES = [
    RoleName.DOCTOR,
    RoleName.HOSPITAL_ADMIN,
    RoleName.HOSPITAL_STAFF,
    RoleName.LAB,
    RoleName.PHARMACY,
    RoleName.BLOOD_BANK,
]

def _to_naive_utc(dt: Optional[datetime]) -> Optional[datetime]:
    if dt is None:
        return None
    if dt.tzinfo is not None:
        return dt.astimezone(timezone.utc).replace(tzinfo=None)
    return dt

class AccessEnforcementService:
    @staticmethod
    def check_patient_data_access(
        db: Session,
        requester_user: Optional[User],
        target_patient_user_id: int,
        requested_scope: Optional[ConsentScope] = None,
        requested_purpose: Optional[str] = None,
        require_sensitive: bool = False,
    ) -> bool:
        """
        Centralized server-side authorization check for protected patient health information.
        Evaluates:
        1. Authentication requirement (401)
        2. Patient self-access (Always allowed)
        3. Patient-to-patient access restriction (403)
        4. Active, unexpired, matching consent requirement for healthcare roles
        5. Purpose, scope, expiry, and sensitive data authorization flags
        """
        if not requester_user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication required to access protected health records."
            )

        # 1. Patient accessing own data -> Always Allowed
        if requester_user.id == target_patient_user_id:
            return True

        # 2. Patient attempting to access another patient's data -> Denied
        user_roles = [ur.role.name for ur in requester_user.roles] if requester_user.roles else []
        is_patient = any(r in [RoleName.PATIENT, "PATIENT"] for r in user_roles)
        is_healthcare = any(r in HEALTHCARE_ROLES or r in [hr.value for hr in HEALTHCARE_ROLES] for r in user_roles)

        if is_patient and not is_healthcare:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access Denied: Patients cannot access health records of other patients."
            )

        # 3. Query DB for candidate active consents from target patient to requester
        now = datetime.utcnow()
        consents = db.query(Consent).filter(
            Consent.patient_user_id == target_patient_user_id,
            Consent.requester_user_id == requester_user.id,
            Consent.status.in_([ConsentStatus.APPROVED, ConsentStatus.ACTIVE, "APPROVED", "ACTIVE"])
        ).all()

        if not consents:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access Denied: No active or approved consent exists for this patient."
            )

        # Evaluate candidate consents
        expired = False
        scope_mismatch = False
        purpose_mismatch = False
        sensitive_denied = False
        valid_consent_found = False

        for consent in consents:
            exp_dt = _to_naive_utc(consent.expires_at)
            start_dt = _to_naive_utc(consent.start_at)

            # Check expiry
            if exp_dt and now > exp_dt:
                consent.status = ConsentStatus.EXPIRED
                db.commit()
                expired = True
                continue

            if start_dt and now < start_dt:
                continue

            # Scope Check:
            # Consent scope matches if consent has ALL_HEALTH_RECORDS or exact requested scope or no specific scope requested
            if requested_scope is not None:
                if consent.scope != ConsentScope.ALL_HEALTH_RECORDS and consent.scope != requested_scope:
                    scope_mismatch = True
                    continue

            # Purpose Check
            if requested_purpose:
                req_p = requested_purpose.strip().upper()
                c_p = consent.purpose.strip().upper()
                if req_p not in c_p and c_p not in req_p and c_p != "GENERAL_HEALTHCARE":
                    purpose_mismatch = True
                    continue

            # Sensitive Data Check
            if require_sensitive and not consent.sensitive_data_allowed:
                sensitive_denied = True
                continue

            # Valid consent found!
            valid_consent_found = True
            break

        if valid_consent_found:
            return True

        if expired:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access Denied: Consent for this patient has EXPIRED."
            )

        if scope_mismatch:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access Denied: Approved consent scope does not cover the requested record category."
            )

        if purpose_mismatch:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access Denied: Approved consent purpose does not match the requested purpose."
            )

        if sensitive_denied:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access Denied: Sensitive data access is not permitted under current consent."
            )

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access Denied: No matching active consent found for requested parameters."
        )
