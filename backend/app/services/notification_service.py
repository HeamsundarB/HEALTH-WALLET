from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.notification import Notification, NotificationType
from app.models.user import User
from app.schemas.notification import NotificationOut, UnreadCountOut

class NotificationService:
    @staticmethod
    def create_notification(
        db: Session,
        user_id: int,
        notification_type: NotificationType,
        title: str,
        message: str,
        related_entity_type: Optional[str] = None,
        related_entity_id: Optional[int] = None,
    ) -> Notification:
        notification = Notification(
            user_id=user_id,
            notification_type=notification_type,
            title=title.strip(),
            message=message.strip(),
            related_entity_type=related_entity_type,
            related_entity_id=related_entity_id,
            is_read=False,
        )
        db.add(notification)
        db.commit()
        db.refresh(notification)
        return notification

    @staticmethod
    def get_user_notifications(
        db: Session,
        user: User,
        unread_only: bool = False,
        limit: int = 50,
        offset: int = 0,
    ) -> List[NotificationOut]:
        query = db.query(Notification).filter(Notification.user_id == user.id)
        if unread_only:
            query = query.filter(Notification.is_read == False)
        
        notifications = query.order_by(Notification.created_at.desc()).offset(offset).limit(limit).all()
        return [NotificationOut.model_validate(n) for n in notifications]

    @staticmethod
    def get_unread_count(db: Session, user: User) -> UnreadCountOut:
        count = db.query(Notification).filter(
            Notification.user_id == user.id,
            Notification.is_read == False
        ).count()
        return UnreadCountOut(unread_count=count)

    @staticmethod
    def mark_as_read(db: Session, user: User, notification_id: int) -> NotificationOut:
        notification = db.query(Notification).filter(Notification.id == notification_id).first()
        if not notification:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Notification not found."
            )
        
        if notification.user_id != user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access Denied: You cannot modify notifications belonging to another user."
            )
        
        notification.is_read = True
        db.commit()
        db.refresh(notification)
        return NotificationOut.model_validate(notification)

    @staticmethod
    def mark_all_as_read(db: Session, user: User) -> dict:
        db.query(Notification).filter(
            Notification.user_id == user.id,
            Notification.is_read == False
        ).update({"is_read": True})
        db.commit()
        return {"detail": "All notifications marked as read."}
