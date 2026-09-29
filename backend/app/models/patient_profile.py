from sqlalchemy import Column, String, Date, ForeignKey, Integer
from sqlalchemy.orm import relationship
from app.models.base import BaseModel

class PatientProfile(BaseModel):
    __tablename__ = "patient_profiles"

    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, index=True, nullable=False)
    health_wallet_id = Column(String(50), unique=True, index=True, nullable=False)
    dob = Column(Date, nullable=True)
    gender = Column(String(20), nullable=True)
    address = Column(String(255), nullable=True)
    state = Column(String(100), nullable=True)
    blood_group = Column(String(10), nullable=True)
    emergency_contact_name = Column(String(255), nullable=True)
    emergency_contact_phone = Column(String(50), nullable=True)

    user = relationship("User", backref="patient_profile", uselist=False)
