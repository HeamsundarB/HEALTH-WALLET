from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Optional
from fastapi import HTTPException, status
from app.models.user import User
from app.models.health_record import HealthRecord, RecordType
from app.schemas.health_record import HealthRecordCreate, HealthRecordUpdate, HealthRecordOut

class HealthRecordService:
    @staticmethod
    def get_patient_records(
        db: Session,
        current_user: User,
        record_type: Optional[RecordType] = None,
        search: Optional[str] = None
    ) -> List[HealthRecordOut]:
        query = db.query(HealthRecord).filter(HealthRecord.patient_user_id == current_user.id)

        if record_type:
            query = query.filter(HealthRecord.record_type == record_type)

        if search:
            search_pattern = f"%{search}%"
            query = query.filter(
                or_(
                    HealthRecord.title.ilike(search_pattern),
                    HealthRecord.description.ilike(search_pattern),
                    HealthRecord.provider_name.ilike(search_pattern),
                    HealthRecord.facility_name.ilike(search_pattern),
                )
            )

        records = query.order_by(HealthRecord.record_date.desc(), HealthRecord.created_at.desc()).all()
        return [HealthRecordOut.from_orm(r) for r in records]

    @staticmethod
    def get_patient_record_by_id(db: Session, current_user: User, record_id: int) -> HealthRecordOut:
        record = db.query(HealthRecord).filter(
            HealthRecord.id == record_id,
            HealthRecord.patient_user_id == current_user.id
        ).first()

        if not record:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Health record not found or access denied"
            )

        return HealthRecordOut.from_orm(record)

    @staticmethod
    def create_patient_record(db: Session, current_user: User, data: HealthRecordCreate) -> HealthRecordOut:
        record = HealthRecord(
            patient_user_id=current_user.id,
            record_type=data.record_type,
            title=data.title,
            description=data.description,
            record_date=data.record_date,
            provider_name=data.provider_name,
            facility_name=data.facility_name,
            status=data.status or "COMPLETED",
        )
        db.add(record)
        db.commit()
        db.refresh(record)
        return HealthRecordOut.from_orm(record)

    @staticmethod
    def update_patient_record(
        db: Session, current_user: User, record_id: int, data: HealthRecordUpdate
    ) -> HealthRecordOut:
        record = db.query(HealthRecord).filter(
            HealthRecord.id == record_id,
            HealthRecord.patient_user_id == current_user.id
        ).first()

        if not record:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Health record not found or access denied"
            )

        update_data = data.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(record, key, value)

        db.commit()
        db.refresh(record)
        return HealthRecordOut.from_orm(record)

    @staticmethod
    def delete_patient_record(db: Session, current_user: User, record_id: int) -> dict:
        record = db.query(HealthRecord).filter(
            HealthRecord.id == record_id,
            HealthRecord.patient_user_id == current_user.id
        ).first()

        if not record:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Health record not found or access denied"
            )

        db.delete(record)
        db.commit()
        return {"message": "Health record deleted successfully"}
