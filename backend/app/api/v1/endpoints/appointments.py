from fastapi import APIRouter, Depends, status, Path
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.models.user import User, RoleName
from app.api.v1.deps import get_current_user, require_roles
from app.schemas.appointment import AppointmentCreate, AppointmentOut
from app.schemas.consultation import ConsultationCreate, ConsultationOut
from app.services.appointment_service import AppointmentService
from app.services.consultation_service import ConsultationService

router = APIRouter()

@router.post(
    "",
    response_model=AppointmentOut,
    status_code=status.HTTP_201_CREATED,
    summary="Create New Appointment Request",
    description="Patient schedules an appointment request with a doctor."
)
def create_appointment(
    payload: AppointmentCreate,
    current_user: User = Depends(require_roles([RoleName.PATIENT])),
    db: Session = Depends(get_db)
):
    return AppointmentService.create_appointment(db, current_user, payload)

@router.get(
    "",
    response_model=List[AppointmentOut],
    status_code=status.HTTP_200_OK,
    summary="List Patient Appointments",
    description="Returns all appointments scheduled by the authenticated patient."
)
def get_patient_appointments(
    current_user: User = Depends(require_roles([RoleName.PATIENT])),
    db: Session = Depends(get_db)
):
    return AppointmentService.get_patient_appointments(db, current_user)

@router.get(
    "/doctor",
    response_model=List[AppointmentOut],
    status_code=status.HTTP_200_OK,
    summary="List Doctor Assigned Appointments",
    description="Returns all appointment requests assigned to the authenticated doctor."
)
def get_doctor_appointments(
    current_user: User = Depends(require_roles([RoleName.DOCTOR])),
    db: Session = Depends(get_db)
):
    return AppointmentService.get_doctor_appointments(db, current_user)

@router.get(
    "/{appointment_id}",
    response_model=AppointmentOut,
    status_code=status.HTTP_200_OK,
    summary="Get Appointment Details",
    description="Returns details for a single appointment if owned by current patient or assigned doctor."
)
def get_appointment_by_id(
    appointment_id: int = Path(..., description="ID of appointment"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return AppointmentService.get_appointment_by_id(db, current_user, appointment_id)

@router.post(
    "/{appointment_id}/cancel",
    response_model=AppointmentOut,
    status_code=status.HTTP_200_OK,
    summary="Cancel Appointment",
    description="Patient cancels an upcoming appointment."
)
def cancel_appointment(
    appointment_id: int = Path(..., description="ID of appointment to cancel"),
    current_user: User = Depends(require_roles([RoleName.PATIENT])),
    db: Session = Depends(get_db)
):
    return AppointmentService.cancel_appointment(db, current_user, appointment_id)

@router.post(
    "/{appointment_id}/confirm",
    response_model=AppointmentOut,
    status_code=status.HTTP_200_OK,
    summary="Confirm Appointment Request",
    description="Doctor confirms a requested appointment."
)
def confirm_appointment(
    appointment_id: int = Path(..., description="ID of appointment to confirm"),
    current_user: User = Depends(require_roles([RoleName.DOCTOR])),
    db: Session = Depends(get_db)
):
    return AppointmentService.confirm_appointment(db, current_user, appointment_id)

@router.post(
    "/{appointment_id}/reject",
    response_model=AppointmentOut,
    status_code=status.HTTP_200_OK,
    summary="Reject Appointment Request",
    description="Doctor declines a requested appointment."
)
def reject_appointment(
    appointment_id: int = Path(..., description="ID of appointment to reject"),
    current_user: User = Depends(require_roles([RoleName.DOCTOR])),
    db: Session = Depends(get_db)
):
    return AppointmentService.reject_appointment(db, current_user, appointment_id)

@router.post(
    "/{appointment_id}/complete",
    response_model=AppointmentOut,
    status_code=status.HTTP_200_OK,
    summary="Mark Appointment Completed",
    description="Doctor marks an appointment as completed."
)
def complete_appointment(
    appointment_id: int = Path(..., description="ID of appointment to mark completed"),
    current_user: User = Depends(require_roles([RoleName.DOCTOR])),
    db: Session = Depends(get_db)
):
    return AppointmentService.complete_appointment(db, current_user, appointment_id)

@router.post(
    "/{appointment_id}/consultation",
    response_model=ConsultationOut,
    status_code=status.HTTP_201_CREATED,
    summary="Create Consultation Notes",
    description="Doctor records clinical consultation notes for an appointment, updating status to COMPLETED and generating a Health Record."
)
def create_consultation_for_appointment(
    payload: ConsultationCreate,
    appointment_id: int = Path(..., description="ID of appointment"),
    current_user: User = Depends(require_roles([RoleName.DOCTOR])),
    db: Session = Depends(get_db)
):
    return ConsultationService.create_consultation(db, current_user, appointment_id, payload)
