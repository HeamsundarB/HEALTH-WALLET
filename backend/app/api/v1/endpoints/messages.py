from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.api.v1.deps import get_current_user
from app.models.user import User
from app.schemas.message import MessageResponse
from app.services.message_service import MessageService

router = APIRouter()

@router.post("/{id}/read", response_model=MessageResponse)
def mark_message_read(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    msg = MessageService.mark_message_read(db, id, current_user.id)
    resp = MessageResponse.model_validate(msg)
    resp.sender_name = msg.sender_user.full_name if msg.sender_user else "User"
    resp.is_mine = (msg.sender_user_id == current_user.id)
    return resp
