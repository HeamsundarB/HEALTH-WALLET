import datetime
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Integer
from sqlalchemy.orm import relationship
from app.models.base import BaseModel

class OTPVerification(BaseModel):
    __tablename__ = "otp_verifications"

    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    phone_or_email = Column(String(255), nullable=False)
    otp_hash = Column(String(255), nullable=False)
    purpose = Column(String(50), default="REGISTRATION", nullable=False)
    is_used = Column(Boolean, default=False, nullable=False)
    expires_at = Column(DateTime, nullable=False)

    user = relationship("User", back_populates="otps")
