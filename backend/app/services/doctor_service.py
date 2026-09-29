from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from typing import List, Optional
from app.models.doctor_profile import DoctorProfile, DoctorCredential, VerificationStatus
from app.models.hospital_profile import DoctorHospitalMapping, HospitalProfile
from app.models.user import User, RoleName
from app.schemas.doctor_profile import DoctorProfileUpdate, DoctorProfileOut, DoctorCredentialOut

class DoctorService:
    @staticmethod
    def _format_doctor_out(db: Session, doc: DoctorProfile) -> DoctorProfileOut:
        user = db.query(User).filter(User.id == doc.user_id).first()
        cred = db.query(DoctorCredential).filter(DoctorCredential.doctor_profile_id == doc.id).first()
        
        # Fetch active affiliated hospital names
        mappings = db.query(DoctorHospitalMapping).filter(
            DoctorHospitalMapping.doctor_profile_id == doc.id,
            DoctorHospitalMapping.status == "ACTIVE"
        ).all()
        hospital_names = []
        for m in mappings:
            h = db.query(HospitalProfile).filter(HospitalProfile.id == m.hospital_profile_id).first()
            if h:
                hospital_names.append(h.name)

        cred_out = None
        if cred:
            cred_out = DoctorCredentialOut(
                id=cred.id,
                professional_id=cred.professional_id,
                qualification_summary=cred.qualification_summary,
                certifications=cred.certifications,
                verification_status=cred.verification_status,
                verified_at=cred.verified_at,
            )

        return DoctorProfileOut(
            id=doc.id,
            user_id=doc.user_id,
            full_name=user.full_name if user else "Dr. Synthetic Doctor",
            email=user.email if user else "",
            specialization=doc.specialization,
            qualification=doc.qualification,
            experience_years=doc.experience_years,
            languages=doc.languages,
            consultation_type=doc.consultation_type,
            availability_info=doc.availability_info,
            bio=doc.bio,
            profile_image_url=doc.profile_image_url,
            credential=cred_out,
            affiliated_hospitals=hospital_names,
            created_at=doc.created_at,
            updated_at=doc.updated_at,
        )

    @staticmethod
    def get_own_doctor_profile(db: Session, current_user: User) -> DoctorProfileOut:
        profile = db.query(DoctorProfile).filter(DoctorProfile.user_id == current_user.id).first()
        if not profile:
            # Auto-initialize default profile for registered DOCTOR role
            profile = DoctorProfile(
                user_id=current_user.id,
                specialization="General Medicine",
                qualification="MBBS, MD",
                experience_years=5,
                bio="Dedicated healthcare professional committed to patient-centric digital care.",
                languages="English, Hindi",
                consultation_type="IN_PERSON_AND_ONLINE",
                availability_info="Mon - Fri (09:00 AM - 05:00 PM)",
            )
            db.add(profile)
            db.flush()

            # Seed synthetic credential
            cred = DoctorCredential(
                doctor_profile_id=profile.id,
                professional_id=f"DOC-SYNTHETIC-{profile.id:04d}",
                qualification_summary="MBBS, MD (Synthetic Prototype Credential)",
                certifications="Board Certified Specialist (Synthetic Prototype)",
                verification_status=VerificationStatus.PENDING,
            )
            db.add(cred)
            db.commit()
            db.refresh(profile)

        return DoctorService._format_doctor_out(db, profile)

    @staticmethod
    def update_own_doctor_profile(
        db: Session,
        current_user: User,
        data: DoctorProfileUpdate
    ) -> DoctorProfileOut:
        profile = db.query(DoctorProfile).filter(DoctorProfile.user_id == current_user.id).first()
        if not profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Doctor profile not found."
            )

        # Update allowed editable fields ONLY
        if data.bio is not None:
            profile.bio = data.bio.strip()
        if data.specialization is not None:
            profile.specialization = data.specialization.strip()
        if data.qualification is not None:
            profile.qualification = data.qualification.strip()
        if data.experience_years is not None:
            profile.experience_years = data.experience_years
        if data.languages is not None:
            profile.languages = data.languages.strip()
        if data.consultation_type is not None:
            profile.consultation_type = data.consultation_type.strip()
        if data.availability_info is not None:
            profile.availability_info = data.availability_info.strip()
        if data.profile_image_url is not None:
            profile.profile_image_url = data.profile_image_url.strip()

        db.commit()
        db.refresh(profile)
        return DoctorService._format_doctor_out(db, profile)

    @staticmethod
    def get_doctor_profile_by_id(db: Session, doctor_id: int) -> DoctorProfileOut:
        profile = db.query(DoctorProfile).filter(DoctorProfile.id == doctor_id).first()
        if not profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Doctor profile #{doctor_id} not found."
            )
        return DoctorService._format_doctor_out(db, profile)
