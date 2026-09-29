from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from typing import List, Optional
from app.models.hospital_profile import HospitalProfile, HospitalDepartment, DoctorHospitalMapping
from app.models.doctor_profile import DoctorProfile, DoctorCredential
from app.models.user import User
from app.schemas.hospital_profile import (
    HospitalProfileUpdate,
    HospitalProfileOut,
    HospitalDepartmentCreate,
    HospitalDepartmentOut,
    DoctorHospitalMappingCreate,
    DoctorHospitalMappingOut,
)

class HospitalService:
    @staticmethod
    def _format_hospital_out(db: Session, hosp: HospitalProfile) -> HospitalProfileOut:
        depts = db.query(HospitalDepartment).filter(HospitalDepartment.hospital_profile_id == hosp.id).all()
        doc_count = db.query(DoctorHospitalMapping).filter(
            DoctorHospitalMapping.hospital_profile_id == hosp.id,
            DoctorHospitalMapping.status == "ACTIVE"
        ).count()

        dept_outs = [HospitalDepartmentOut.model_validate(d) for d in depts]

        return HospitalProfileOut(
            id=hosp.id,
            admin_user_id=hosp.admin_user_id,
            name=hosp.name,
            registration_number=hosp.registration_number,
            address=hosp.address,
            location_city=hosp.location_city,
            state=hosp.state,
            contact_email=hosp.contact_email,
            contact_phone=hosp.contact_phone,
            working_hours=hosp.working_hours,
            services_summary=hosp.services_summary,
            verification_status=hosp.verification_status,
            verified_at=hosp.verified_at,
            departments=dept_outs,
            affiliated_doctors_count=doc_count,
            created_at=hosp.created_at,
            updated_at=hosp.updated_at,
        )

    @staticmethod
    def get_own_hospital_profile(db: Session, admin_user: User) -> HospitalProfileOut:
        profile = db.query(HospitalProfile).filter(HospitalProfile.admin_user_id == admin_user.id).first()
        if not profile:
            profile = HospitalProfile(
                admin_user_id=admin_user.id,
                name="Central Multispeciality Hospital",
                registration_number=f"HOSP-REG-{admin_user.id:04d}",
                address="45 Healthcare Boulevard, Medical District",
                location_city="Demo City",
                state="Karnataka",
                contact_email=admin_user.email,
                contact_phone="+91 80 1234 5678",
                working_hours="24/7 Emergency & OPD (08:00 AM - 08:00 PM)",
                services_summary="Emergency Care, Intensive Care (ICU), Cardiology, Diagnostics, Outpatient Surgery",
            )
            db.add(profile)
            db.flush()

            # Seed default departments
            default_depts = [
                HospitalDepartment(hospital_profile_id=profile.id, name="General Medicine", description="Internal medicine and primary clinical evaluations"),
                HospitalDepartment(hospital_profile_id=profile.id, name="Cardiology", description="Comprehensive heart health and cardiac diagnostics"),
                HospitalDepartment(hospital_profile_id=profile.id, name="Pediatrics", description="Child health and neonatal wellness"),
            ]
            db.add_all(default_depts)
            db.commit()
            db.refresh(profile)

        return HospitalService._format_hospital_out(db, profile)

    @staticmethod
    def update_own_hospital_profile(
        db: Session,
        admin_user: User,
        data: HospitalProfileUpdate
    ) -> HospitalProfileOut:
        profile = db.query(HospitalProfile).filter(HospitalProfile.admin_user_id == admin_user.id).first()
        if not profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Hospital profile not found."
            )

        if data.name is not None:
            profile.name = data.name.strip()
        if data.address is not None:
            profile.address = data.address.strip()
        if data.location_city is not None:
            profile.location_city = data.location_city.strip()
        if data.state is not None:
            profile.state = data.state.strip()
        if data.contact_email is not None:
            profile.contact_email = data.contact_email
        if data.contact_phone is not None:
            profile.contact_phone = data.contact_phone.strip()
        if data.working_hours is not None:
            profile.working_hours = data.working_hours.strip()
        if data.services_summary is not None:
            profile.services_summary = data.services_summary.strip()

        db.commit()
        db.refresh(profile)
        return HospitalService._format_hospital_out(db, profile)

    @staticmethod
    def add_department(
        db: Session,
        admin_user: User,
        data: HospitalDepartmentCreate
    ) -> HospitalDepartmentOut:
        profile = db.query(HospitalProfile).filter(HospitalProfile.admin_user_id == admin_user.id).first()
        if not profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Hospital profile not found."
            )

        new_dept = HospitalDepartment(
            hospital_profile_id=profile.id,
            name=data.name.strip(),
            description=data.description.strip() if data.description else None,
        )
        db.add(new_dept)
        db.commit()
        db.refresh(new_dept)
        return HospitalDepartmentOut.model_validate(new_dept)

    @staticmethod
    def assign_doctor_to_hospital(
        db: Session,
        admin_user: User,
        data: DoctorHospitalMappingCreate
    ) -> DoctorHospitalMappingOut:
        hosp = db.query(HospitalProfile).filter(HospitalProfile.admin_user_id == admin_user.id).first()
        if not hosp:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Hospital profile not found."
            )

        # Look up doctor credential by Professional ID
        cred = db.query(DoctorCredential).filter(
            DoctorCredential.professional_id == data.doctor_professional_id.strip()
        ).first()
        if not cred:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Doctor credential with Professional ID '{data.doctor_professional_id}' not found."
            )

        doc_profile = db.query(DoctorProfile).filter(DoctorProfile.id == cred.doctor_profile_id).first()
        doc_user = db.query(User).filter(User.id == doc_profile.user_id).first()

        dept = None
        if data.department_name:
            dept = db.query(HospitalDepartment).filter(
                HospitalDepartment.hospital_profile_id == hosp.id,
                HospitalDepartment.name == data.department_name.strip()
            ).first()

        # Check existing mapping
        existing = db.query(DoctorHospitalMapping).filter(
            DoctorHospitalMapping.doctor_profile_id == doc_profile.id,
            DoctorHospitalMapping.hospital_profile_id == hosp.id
        ).first()

        if existing:
            existing.status = "ACTIVE"
            if dept:
                existing.department_id = dept.id
            db.commit()
            db.refresh(existing)
            mapping_obj = existing
        else:
            mapping_obj = DoctorHospitalMapping(
                doctor_profile_id=doc_profile.id,
                hospital_profile_id=hosp.id,
                department_id=dept.id if dept else None,
                status="ACTIVE",
            )
            db.add(mapping_obj)
            db.commit()
            db.refresh(mapping_obj)

        return DoctorHospitalMappingOut(
            id=mapping_obj.id,
            doctor_profile_id=doc_profile.id,
            doctor_name=doc_user.full_name if doc_user else "Dr. Synthetic Doctor",
            specialization=doc_profile.specialization,
            hospital_profile_id=hosp.id,
            hospital_name=hosp.name,
            department_name=dept.name if dept else None,
            status=mapping_obj.status,
            joined_date=mapping_obj.joined_date,
        )

    @staticmethod
    def get_hospital_by_id(db: Session, hospital_id: int) -> HospitalProfileOut:
        profile = db.query(HospitalProfile).filter(HospitalProfile.id == hospital_id).first()
        if not profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Hospital profile #{hospital_id} not found."
            )
        return HospitalService._format_hospital_out(db, profile)
