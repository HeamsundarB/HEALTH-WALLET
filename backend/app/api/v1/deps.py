from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from typing import List, Callable
from app.db.session import get_db
from app.core.security import decode_access_token
from app.models.user import User, RoleName

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login", auto_error=False)

def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate authentication credentials or token has expired",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if not token:
        raise credentials_exception

    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exception

    user_id: Optional[int] = payload.get("sub")
    if user_id is None:
        raise credentials_exception

    user = db.query(User).filter(User.id == int(user_id)).first()
    if user is None:
        raise credentials_exception
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Inactive user account")

    return user

def require_roles(allowed_roles: List[RoleName]) -> Callable:
    def role_checker(current_user: User = Depends(get_current_user)) -> User:
        user_role_names = [ur.role.name for ur in current_user.roles]
        
        # SYSTEM_ADMIN is granted global access to all role endpoints
        if RoleName.SYSTEM_ADMIN in user_role_names:
            return current_user

        has_role = any(r in allowed_roles for r in user_role_names)
        if not has_role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Allowed role(s): {[r.value for r in allowed_roles]}."
            )
        return current_user

    return role_checker

require_doctor = require_roles([RoleName.DOCTOR])
