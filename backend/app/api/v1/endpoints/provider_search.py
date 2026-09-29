from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.session import get_db
from app.schemas.doctor_profile import DoctorProfileOut
from app.schemas.hospital_profile import HospitalProfileOut
from app.services.provider_search_service import ProviderSearchService
from app.api.v1.deps import get_current_user
from app.models.user import User

router = APIRouter()

@router.get(
    "/doctors",
    response_model=List[DoctorProfileOut],
    status_code=status.HTTP_200_OK,
    summary="Search & Discover Doctors",
    description="Search doctor directory with filters by name, specialization, hospital, city location, and verification status."
)
def search_doctors(
    name: Optional[str] = Query(None, description="Doctor name filter"),
    specialization: Optional[str] = Query(None, description="Specialization filter"),
    hospital_name: Optional[str] = Query(None, description="Hospital name filter"),
    location_city: Optional[str] = Query(None, description="City location filter"),
    verified_only: bool = Query(False, description="Filter for VERIFIED doctors only"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return ProviderSearchService.search_doctors(
        db, name, specialization, hospital_name, location_city, verified_only
    )

@router.get(
    "/hospitals",
    response_model=List[HospitalProfileOut],
    status_code=status.HTTP_200_OK,
    summary="Search & Discover Hospitals",
    description="Search hospital directory with filters by name, city location, department specialty, and verification status."
)
def search_hospitals(
    name: Optional[str] = Query(None, description="Hospital name filter"),
    location_city: Optional[str] = Query(None, description="City location filter"),
    department_name: Optional[str] = Query(None, description="Department specialty filter"),
    verified_only: bool = Query(False, description="Filter for VERIFIED hospitals only"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return ProviderSearchService.search_hospitals(
        db, name, location_city, department_name, verified_only
    )
