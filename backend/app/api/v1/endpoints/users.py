from fastapi import APIRouter, Depends, status
from app.models.user import User, RoleName
from app.schemas.user import UserOut
from app.api.v1.deps import get_current_user, require_roles

router = APIRouter()

@router.get(
    "/me",
    response_model=UserOut,
    status_code=status.HTTP_200_OK,
    summary="Get Current Authenticated User",
    description="Returns user profile and active roles for the currently authenticated JWT session."
)
def get_me(current_user: User = Depends(get_current_user)):
    return UserOut(
        id=current_user.id,
        email=current_user.email,
        full_name=current_user.full_name,
        phone_number=current_user.phone_number,
        is_active=current_user.is_active,
        is_verified=current_user.is_verified,
        roles=[ur.role.name for ur in current_user.roles],
        created_at=current_user.created_at,
    )

@router.get(
    "/admin-only-test",
    status_code=status.HTTP_200_OK,
    summary="Test Admin Role Access",
    description="Test endpoint restricted exclusively to SYSTEM_ADMIN role."
)
def admin_only_test(current_user: User = Depends(require_roles([RoleName.SYSTEM_ADMIN]))):
    return {"message": "Access granted to SYSTEM_ADMIN endpoint", "user": current_user.email}

@router.get(
    "/doctor-only-test",
    status_code=status.HTTP_200_OK,
    summary="Test Doctor Role Access",
    description="Test endpoint restricted exclusively to DOCTOR role."
)
def doctor_only_test(current_user: User = Depends(require_roles([RoleName.DOCTOR]))):
    return {"message": "Access granted to DOCTOR endpoint", "user": current_user.email}
