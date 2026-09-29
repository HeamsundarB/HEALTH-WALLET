from fastapi import APIRouter, Depends, status, Query, Path
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.models.user import User
from app.schemas.notification import NotificationOut, UnreadCountOut
from app.services.notification_service import NotificationService
from app.api.v1.deps import get_current_user

router = APIRouter()

@router.get(
    "",
    response_model=List[NotificationOut],
    status_code=status.HTTP_200_OK,
    summary="List Authenticated User Notifications",
    description="Returns in-app notifications belonging strictly to the authenticated user, sorted newest first."
)
def get_notifications(
    unread_only: bool = Query(False, description="Filter for unread notifications only"),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return NotificationService.get_user_notifications(db, current_user, unread_only, limit, offset)

@router.get(
    "/unread-count",
    response_model=UnreadCountOut,
    status_code=status.HTTP_200_OK,
    summary="Get Unread Notification Count",
    description="Returns count of unread notifications belonging strictly to the authenticated user."
)
def get_unread_count(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return NotificationService.get_unread_count(db, current_user)

@router.post(
    "/{notification_id}/read",
    response_model=NotificationOut,
    status_code=status.HTTP_200_OK,
    summary="Mark Single Notification as Read",
    description="Marks a specific notification owned strictly by the authenticated user as read."
)
def mark_notification_as_read(
    notification_id: int = Path(..., description="ID of notification to mark as read"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return NotificationService.mark_as_read(db, current_user, notification_id)

@router.post(
    "/read-all",
    status_code=status.HTTP_200_OK,
    summary="Mark All Notifications as Read",
    description="Marks all unread notifications owned strictly by the authenticated user as read."
)
def mark_all_notifications_as_read(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return NotificationService.mark_all_as_read(db, current_user)
