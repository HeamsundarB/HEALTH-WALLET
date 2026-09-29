import random
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.user import User
from app.models.patient_profile import PatientProfile
from app.schemas.patient_profile import PatientProfileUpdate, PatientProfileOut

def generate_synthetic_health_wallet_id(db: Session) -> str:
    """
    Generate synthetic Health Wallet ID format: HW-2026-XXXX-XXXX
    Includes collision checking & retry loop against UNIQUE constraint.
    """
    for _ in range(10):
        part1 = random.randint(1000, 9999)
        part2 = random.randint(1000, 9999)
        candidate = f"HW-2026-{part1}-{part2}"
        existing = db.query(PatientProfile).filter(PatientProfile.health_wallet_id == candidate).first()
        if not existing:
            return candidate
    raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="Unable to generate unique Health Wallet ID"
    )

class PatientService:
    @staticmethod
    def get_or_create_profile(db: Session, current_user: User) -> PatientProfileOut:
        profile = db.query(PatientProfile).filter(PatientProfile.user_id == current_user.id).first()
        if not profile:
            hw_id = generate_synthetic_health_wallet_id(db)
            profile = PatientProfile(
                user_id=current_user.id,
                health_wallet_id=hw_id,
                blood_group="O+",
            )
            db.add(profile)
            db.commit()
            db.refresh(profile)

        return PatientProfileOut(
            id=profile.id,
            user_id=profile.user_id,
            health_wallet_id=profile.health_wallet_id,
            email=current_user.email,
            full_name=current_user.full_name,
            phone_number=current_user.phone_number,
            dob=profile.dob,
            gender=profile.gender,
            address=profile.address,
            state=profile.state,
            blood_group=profile.blood_group,
            emergency_contact_name=profile.emergency_contact_name,
            emergency_contact_phone=profile.emergency_contact_phone,
            created_at=profile.created_at,
            updated_at=profile.updated_at,
        )

    @staticmethod
    def update_profile(db: Session, current_user: User, data: PatientProfileUpdate) -> PatientProfileOut:
        profile = db.query(PatientProfile).filter(PatientProfile.user_id == current_user.id).first()
        if not profile:
            hw_id = generate_synthetic_health_wallet_id(db)
            profile = PatientProfile(
                user_id=current_user.id,
                health_wallet_id=hw_id,
            )
            db.add(profile)

        update_dict = data.dict(exclude_unset=True)
        for key, val in update_dict.items():
            setattr(profile, key, val)

        db.commit()
        db.refresh(profile)

        return PatientProfileOut(
            id=profile.id,
            user_id=profile.user_id,
            health_wallet_id=profile.health_wallet_id,
            email=current_user.email,
            full_name=current_user.full_name,
            phone_number=current_user.phone_number,
            dob=profile.dob,
            gender=profile.gender,
            address=profile.address,
            state=profile.state,
            blood_group=profile.blood_group,
            emergency_contact_name=profile.emergency_contact_name,
            emergency_contact_phone=profile.emergency_contact_phone,
            created_at=profile.created_at,
            updated_at=profile.updated_at,
        )
