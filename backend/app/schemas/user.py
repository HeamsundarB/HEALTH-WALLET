from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime
from app.models.user import RoleName

class RoleOut(BaseModel):
    id: int
    name: RoleName
    description: Optional[str] = None

    class Config:
        from_attributes = True

class UserOut(BaseModel):
    id: int
    email: EmailStr
    full_name: str
    phone_number: Optional[str] = None
    is_active: bool
    is_verified: bool
    roles: List[RoleName]
    created_at: datetime

    class Config:
        from_attributes = True
