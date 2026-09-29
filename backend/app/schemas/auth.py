from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from app.models.user import RoleName
from app.schemas.user import UserOut

class UserRegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    full_name: str
    phone_number: Optional[str] = None
    role: RoleName = RoleName.PATIENT

class RegisterResponse(BaseModel):
    message: str
    user_id: int
    simulated_otp_code: Optional[str] = Field(
        default=None,
        description="PROTOTYPE SIMULATION ONLY: Provided in dev mode response for testing."
    )

class OTPVerifyRequest(BaseModel):
    user_id: int
    otp_code: str = Field(..., min_length=6, max_length=6)

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    refresh_token: Optional[str] = None
    user: UserOut

class RefreshTokenRequest(BaseModel):
    refresh_token: Optional[str] = None

class MessageResponse(BaseModel):
    message: str
