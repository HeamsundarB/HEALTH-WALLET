from sqlalchemy.orm import Session
from typing import List, Optional
from app.models.doctor_profile import DoctorProfile, DoctorCredential, VerificationStatus
from app.models.hospital_profile import HospitalProfile, HospitalDepartment, DoctorHospitalMapping
from app.models.user import User
from app.schemas.doctor_profile import DoctorProfileOut
from app.schemas.hospital_profile import HospitalProfileOut
from app.services.doctor_service import DoctorService
from app.services.hospital_service import HospitalService

class ProviderSearchService:
    @staticmethod
    def search_doctors(
        db: Session,
        name: Optional[str] = None,
        specialization: Optional[str] = None,
        hospital_name: Optional[str] = None,
        location_city: Optional[str] = None,
        verified_only: bool = False,
    ) -> List[DoctorProfileOut]:
        query = db.query(DoctorProfile).join(User, DoctorProfile.user_id == User.id)

        if name and name.strip():
            query = query.filter(User.full_name.ilike(f"%{name.strip()}%"))

        if specialization and specialization.strip():
            query = query.filter(DoctorProfile.specialization.ilike(f"%{specialization.strip()}%"))

        if verified_only:
            query = query.join(DoctorCredential, DoctorProfile.id == DoctorCredential.doctor_profile_id).filter(
                DoctorCredential.verification_status == VerificationStatus.VERIFIED
            )

        if hospital_name and hospital_name.strip():
            query = query.join(DoctorHospitalMapping, DoctorProfile.id == DoctorHospitalMapping.doctor_profile_id)\
                .join(HospitalProfile, DoctorHospitalMapping.hospital_profile_id == HospitalProfile.id)\
                .filter(HospitalProfile.name.ilike(f"%{hospital_name.strip()}%"))

        if location_city and location_city.strip():
            query = query.join(DoctorHospitalMapping, DoctorProfile.id == DoctorHospitalMapping.doctor_profile_id)\
                .join(HospitalProfile, DoctorHospitalMapping.hospital_profile_id == HospitalProfile.id)\
                .filter(HospitalProfile.location_city.ilike(f"%{location_city.strip()}%"))

        doctors = query.distinct().order_by(DoctorProfile.experience_years.desc()).all()
        return [DoctorService._format_doctor_out(db, doc) for doc in doctors]

    @staticmethod
    def search_hospitals(
        db: Session,
        name: Optional[str] = None,
        location_city: Optional[str] = None,
        department_name: Optional[str] = None,
        verified_only: bool = False,
    ) -> List[HospitalProfileOut]:
        query = db.query(HospitalProfile)

        if name and name.strip():
            query = query.filter(HospitalProfile.name.ilike(f"%{name.strip()}%"))

        if location_city and location_city.strip():
            query = query.filter(HospitalProfile.location_city.ilike(f"%{location_city.strip()}%"))

        if verified_only:
            query = query.filter(HospitalProfile.verification_status == VerificationStatus.VERIFIED)

        if department_name and department_name.strip():
            query = query.join(HospitalDepartment, HospitalProfile.id == HospitalDepartment.hospital_profile_id)\
                .filter(HospitalDepartment.name.ilike(f"%{department_name.strip()}%"))

        hospitals = query.distinct().order_by(HospitalProfile.name.asc()).all()
        return [HospitalService._format_hospital_out(db, hosp) for hosp in hospitals]
