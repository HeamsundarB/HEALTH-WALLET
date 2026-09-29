from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.session import get_db
from app.models.user import User, RoleName
from app.models.health_record import RecordType
from app.schemas.health_record import HealthRecordOut, HealthRecordCreate, HealthRecordUpdate
from app.services.health_record_service import HealthRecordService
from app.api.v1.deps import require_roles

router = APIRouter()

@router.get(
    "",
    response_model=List[HealthRecordOut],
    status_code=status.HTTP_200_OK,
    summary="List Authenticated Patient Health Records",
    description="Returns chronological health records owned strictly by the authenticated PATIENT user. Supports optional record_type & title search filtering."
)
def get_health_records(
    record_type: Optional[RecordType] = Query(None, description="Filter by controlled record type"),
    search: Optional[str] = Query(None, description="Search term for title, description, or provider"),
    current_user: User = Depends(require_roles([RoleName.PATIENT])),
    db: Session = Depends(get_db)
):
    return HealthRecordService.get_patient_records(db, current_user, record_type, search)

@router.get(
    "/{record_id}",
    response_model=HealthRecordOut,
    status_code=status.HTTP_200_OK,
    summary="Get Specific Health Record",
    description="Retrieves a single synthetic health record by ID owned strictly by the authenticated PATIENT user."
)
def get_health_record(
    record_id: int,
    current_user: User = Depends(require_roles([RoleName.PATIENT])),
    db: Session = Depends(get_db)
):
    return HealthRecordService.get_patient_record_by_id(db, current_user, record_id)

@router.post(
    "",
    response_model=HealthRecordOut,
    status_code=status.HTTP_201_CREATED,
    summary="Create Synthetic Health Record",
    description="Creates a new synthetic health record for the authenticated PATIENT user."
)
def create_health_record(
    data: HealthRecordCreate,
    current_user: User = Depends(require_roles([RoleName.PATIENT])),
    db: Session = Depends(get_db)
):
    return HealthRecordService.create_patient_record(db, current_user, data)

@router.put(
    "/{record_id}",
    response_model=HealthRecordOut,
    status_code=status.HTTP_200_OK,
    summary="Update Synthetic Health Record",
    description="Updates an existing synthetic health record owned strictly by the authenticated PATIENT user."
)
def update_health_record(
    record_id: int,
    data: HealthRecordUpdate,
    current_user: User = Depends(require_roles([RoleName.PATIENT])),
    db: Session = Depends(get_db)
):
    return HealthRecordService.update_patient_record(db, current_user, record_id, data)

@router.delete(
    "/{record_id}",
    status_code=status.HTTP_200_OK,
    summary="Delete Synthetic Health Record",
    description="Deletes an existing synthetic health record owned strictly by the authenticated PATIENT user."
)
def delete_health_record(
    record_id: int,
    current_user: User = Depends(require_roles([RoleName.PATIENT])),
    db: Session = Depends(get_db)
):
    return HealthRecordService.delete_patient_record(db, current_user, record_id)
