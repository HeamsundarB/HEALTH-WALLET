from fastapi import APIRouter, Depends, status, Path
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.models.user import User, RoleName
from app.schemas.consent import ConsentOut, ConsentCreate
from app.schemas.health_record import HealthRecordOut
from app.services.consent_service import ConsentService, HEALTHCARE_ROLES
from app.api.v1.deps import require_roles

router = APIRouter()

@router.post(
    "",
    response_model=ConsentOut,
    status_code=status.HTTP_201_CREATED,
    summary="Request Patient Health Wallet Access",
    description="Allows authenticated healthcare role users (Doctor, Lab, Pharmacy, Hospital) to create an access consent request for a synthetic patient Health Wallet ID."
)
def create_consent_request(
    data: ConsentCreate,
    current_user: User = Depends(require_roles(HEALTHCARE_ROLES)),
    db: Session = Depends(get_db)
):
    return ConsentService.create_consent_request(db, current_user, data)

@router.get(
    "",
    response_model=List[ConsentOut],
    status_code=status.HTTP_200_OK,
    summary="List Patient Consent Records",
    description="Returns all consent requests and active/revoked permissions directed strictly to the authenticated PATIENT."
)
def get_patient_consents(
    current_user: User = Depends(require_roles([RoleName.PATIENT])),
    db: Session = Depends(get_db)
):
    return ConsentService.get_patient_consents(db, current_user)

@router.get(
    "/requests",
    response_model=List[ConsentOut],
    status_code=status.HTTP_200_OK,
    summary="List Sent Healthcare Access Requests",
    description="Returns all access requests created by the authenticated healthcare role requester."
)
def get_requester_consents(
    current_user: User = Depends(require_roles(HEALTHCARE_ROLES)),
    db: Session = Depends(get_db)
):
    return ConsentService.get_requester_consents(db, current_user)

@router.post(
    "/{consent_id}/approve",
    response_model=ConsentOut,
    status_code=status.HTTP_200_OK,
    summary="Approve Access Consent",
    description="Approve a pending access request directed to the authenticated PATIENT account."
)
def approve_consent(
    consent_id: int = Path(..., description="ID of consent request to approve"),
    current_user: User = Depends(require_roles([RoleName.PATIENT])),
    db: Session = Depends(get_db)
):
    return ConsentService.approve_consent(db, current_user, consent_id)

@router.post(
    "/{consent_id}/reject",
    response_model=ConsentOut,
    status_code=status.HTTP_200_OK,
    summary="Reject Access Consent",
    description="Reject a pending access request directed to the authenticated PATIENT account."
)
def reject_consent(
    consent_id: int = Path(..., description="ID of consent request to reject"),
    current_user: User = Depends(require_roles([RoleName.PATIENT])),
    db: Session = Depends(get_db)
):
    return ConsentService.reject_consent(db, current_user, consent_id)

@router.post(
    "/{consent_id}/revoke",
    response_model=ConsentOut,
    status_code=status.HTTP_200_OK,
    summary="Revoke Active Consent",
    description="Revoke a previously approved access consent associated with the authenticated PATIENT account."
)
def revoke_consent(
    consent_id: int = Path(..., description="ID of active consent to revoke"),
    current_user: User = Depends(require_roles([RoleName.PATIENT])),
    db: Session = Depends(get_db)
):
    return ConsentService.revoke_consent(db, current_user, consent_id)

@router.get(
    "/{consent_id}",
    response_model=ConsentOut,
    status_code=status.HTTP_200_OK,
    summary="Get Specific Consent Record",
    description="Fetch single consent record by ID for patient or requester user."
)
def get_consent_by_id(
    consent_id: int = Path(..., description="ID of consent record"),
    current_user: User = Depends(require_roles([RoleName.PATIENT] + HEALTHCARE_ROLES)),
    db: Session = Depends(get_db)
):
    return ConsentService.get_consent_by_id(db, current_user, consent_id)


@router.get(
    "/patient-records/{patient_hw_id}",
    response_model=List[HealthRecordOut],
    status_code=status.HTTP_200_OK,
    summary="View Patient Records via Approved Consent",
    description="Allows authenticated healthcare role users to view a patient's synthetic health records ONLY IF an active APPROVED consent exists."
)
def get_patient_records_via_consent(
    patient_hw_id: str = Path(..., description="Synthetic Health Wallet ID of patient"),
    current_user: User = Depends(require_roles(HEALTHCARE_ROLES)),
    db: Session = Depends(get_db)
):
    return ConsentService.get_patient_records_for_requester(db, current_user, patient_hw_id)
