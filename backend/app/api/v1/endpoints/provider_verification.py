from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.db.session import get_db
from app.models.user import User, RoleName
from app.schemas.provider_search import ProviderVerificationReview, ProviderVerificationItem
from app.services.provider_verification_service import ProviderVerificationService
from app.api.v1.deps import require_roles

router = APIRouter()

@router.get(
    "/pending",
    response_model=List[ProviderVerificationItem],
    status_code=status.HTTP_200_OK,
    summary="List Pending Provider Verifications",
    description="Returns list of pending doctor professional credentials and hospital registration profiles for administrative review."
)
def get_pending_verifications(
    current_user: User = Depends(require_roles([RoleName.SYSTEM_ADMIN])),
    db: Session = Depends(get_db)
):
    return ProviderVerificationService.get_pending_verifications(db, current_user)

@router.post(
    "/review",
    status_code=status.HTTP_200_OK,
    summary="Review Provider Verification Request",
    description="Allows SYSTEM_ADMIN role to approve or reject a doctor credential or hospital registration profile."
)
def review_provider(
    data: ProviderVerificationReview,
    current_user: User = Depends(require_roles([RoleName.SYSTEM_ADMIN])),
    db: Session = Depends(get_db)
):
    return ProviderVerificationService.review_provider(db, current_user, data)
