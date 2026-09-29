from datetime import date, datetime
from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.medication import Medication, MedicationStatus
from app.models.medication_history import MedicationHistory, MedicationAction
from app.models.user import User
from app.models.notification import Notification, NotificationType
from app.schemas.medication import MedicationCreate, MedicationUpdate, MedicationStopRequest, MedicationReminderUpdate

def create_history_record(
    db: Session,
    medication_id: int,
    patient_user_id: int,
    action: MedicationAction,
    previous_status: Optional[MedicationStatus],
    new_status: MedicationStatus,
    notes: Optional[str] = None
) -> MedicationHistory:
    history = MedicationHistory(
        medication_id=medication_id,
        patient_user_id=patient_user_id,
        action=action,
        previous_status=previous_status,
        new_status=new_status,
        notes=notes,
        changed_at=datetime.utcnow()
    )
    db.add(history)
    db.commit()
    db.refresh(history)
    return history

def create_inapp_notification(
    db: Session,
    user_id: int,
    notification_type: NotificationType,
    title: str,
    message: str,
    related_entity_type: str,
    related_entity_id: int
):
    notif = Notification(
        user_id=user_id,
        notification_type=notification_type,
        title=title,
        message=message,
        related_entity_type=related_entity_type,
        related_entity_id=related_entity_id,
        is_read=False
    )
    db.add(notif)
    db.commit()

class MedicationService:

    @staticmethod
    def create_medication(db: Session, patient_user_id: int, schema: MedicationCreate) -> Medication:
        if schema.stop_date and schema.stop_date < schema.start_date:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="stop_date must not be before start_date"
            )
            
        medication = Medication(
            patient_user_id=patient_user_id,
            prescription_id=schema.prescription_id,
            doctor_profile_id=schema.doctor_profile_id,
            name=schema.name,
            dosage=schema.dosage,
            frequency=schema.frequency,
            route=schema.route,
            start_date=schema.start_date,
            stop_date=schema.stop_date,
            status=MedicationStatus.ONGOING,
            reminder_enabled=schema.reminder_enabled,
            reminder_time=schema.reminder_time,
            hospital_name=schema.hospital_name,
            instructions=schema.instructions,
        )
        db.add(medication)
        db.commit()
        db.refresh(medication)

        # Audit History
        create_history_record(
            db=db,
            medication_id=medication.id,
            patient_user_id=patient_user_id,
            action=MedicationAction.STARTED,
            previous_status=None,
            new_status=MedicationStatus.ONGOING,
            notes=f"Medication {medication.name} started."
        )

        # In-App Notification
        create_inapp_notification(
            db=db,
            user_id=patient_user_id,
            notification_type=NotificationType.MEDICATION_STARTED,
            title="Medication Started",
            message=f"You started {medication.name} ({medication.dosage}, {medication.frequency}).",
            related_entity_type="medication",
            related_entity_id=medication.id
        )

        return medication

    @staticmethod
    def get_patient_medications(
        db: Session,
        patient_user_id: int,
        status_filter: Optional[str] = None,
        category_filter: Optional[str] = None,
        prescription_id: Optional[int] = None
    ) -> List[Medication]:
        query = db.query(Medication).filter(Medication.patient_user_id == patient_user_id)

        if prescription_id:
            query = query.filter(Medication.prescription_id == prescription_id)

        if status_filter:
            query = query.filter(Medication.status == status_filter.upper())

        medications = query.order_by(Medication.start_date.desc(), Medication.id.desc()).all()

        if category_filter:
            cat = category_filter.lower()
            today = date.today()
            filtered = []
            for m in medications:
                days_since_start = (today - m.start_date).days if m.start_date else 999
                if cat == "recently_started":
                    if m.status == MedicationStatus.ONGOING and 0 <= days_since_start <= 14:
                        filtered.append(m)
                elif cat == "ongoing":
                    if m.status == MedicationStatus.ONGOING and (m.stop_date is None or m.stop_date >= today):
                        filtered.append(m)
                elif cat in ["past", "stopped", "completed"]:
                    if m.status in [MedicationStatus.STOPPED, MedicationStatus.COMPLETED]:
                        filtered.append(m)
                else:
                    filtered.append(m)
            return filtered

        return medications

    @staticmethod
    def get_medication_by_id(db: Session, medication_id: int, current_user_id: int) -> Medication:
        medication = db.query(Medication).filter(Medication.id == medication_id).first()
        if not medication:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Medication not found")

        # Security: Patient ownership or doctor context
        if medication.patient_user_id != current_user_id:
            # Check if current user is doctor who prescribed or has active relationship
            doctor = db.query(User).filter(User.id == current_user_id).first()
            is_doctor = any(ur.role.name == "DOCTOR" or ur.role.name.value == "DOCTOR" for ur in doctor.roles) if doctor else False
            if not is_doctor:
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied to medication")

        return medication

    @staticmethod
    def update_medication(db: Session, medication_id: int, current_user_id: int, schema: MedicationUpdate) -> Medication:
        medication = MedicationService.get_medication_by_id(db, medication_id, current_user_id)
        
        # Enforce patient ownership for update
        if medication.patient_user_id != current_user_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only patient can update medication details")

        prev_status = medication.status
        start_date = schema.start_date if schema.start_date is not None else medication.start_date
        stop_date = schema.stop_date if schema.stop_date is not None else medication.stop_date

        if stop_date and stop_date < start_date:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="stop_date must not be before start_date")

        for field, val in schema.model_dump(exclude_unset=True).items():
            if val is not None:
                setattr(medication, field, val)

        db.commit()
        db.refresh(medication)

        # Audit History
        create_history_record(
            db=db,
            medication_id=medication.id,
            patient_user_id=medication.patient_user_id,
            action=MedicationAction.UPDATED,
            previous_status=prev_status,
            new_status=medication.status,
            notes=f"Medication {medication.name} updated."
        )

        create_inapp_notification(
            db=db,
            user_id=medication.patient_user_id,
            notification_type=NotificationType.MEDICATION_UPDATED,
            title="Medication Updated",
            message=f"Medication {medication.name} details updated.",
            related_entity_type="medication",
            related_entity_id=medication.id
        )

        return medication

    @staticmethod
    def stop_medication(db: Session, medication_id: int, current_user_id: int, req: MedicationStopRequest) -> Medication:
        medication = MedicationService.get_medication_by_id(db, medication_id, current_user_id)
        if medication.patient_user_id != current_user_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only patient can stop medication")

        if medication.status in [MedicationStatus.STOPPED, MedicationStatus.COMPLETED]:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Medication is already {medication.status.value}")

        prev_status = medication.status
        medication.status = MedicationStatus.STOPPED
        medication.stop_date = req.stop_date or date.today()

        if medication.stop_date < medication.start_date:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="stop_date must not be before start_date")

        db.commit()
        db.refresh(medication)

        create_history_record(
            db=db,
            medication_id=medication.id,
            patient_user_id=medication.patient_user_id,
            action=MedicationAction.STOPPED,
            previous_status=prev_status,
            new_status=MedicationStatus.STOPPED,
            notes=req.notes or f"Medication {medication.name} stopped."
        )

        create_inapp_notification(
            db=db,
            user_id=medication.patient_user_id,
            notification_type=NotificationType.MEDICATION_STOPPED,
            title="Medication Stopped",
            message=f"You stopped taking {medication.name}.",
            related_entity_type="medication",
            related_entity_id=medication.id
        )

        return medication

    @staticmethod
    def complete_medication(db: Session, medication_id: int, current_user_id: int) -> Medication:
        medication = MedicationService.get_medication_by_id(db, medication_id, current_user_id)
        if medication.patient_user_id != current_user_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only patient can mark medication completed")

        if medication.status in [MedicationStatus.STOPPED, MedicationStatus.COMPLETED]:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Medication is already {medication.status.value}")

        prev_status = medication.status
        medication.status = MedicationStatus.COMPLETED
        if not medication.stop_date:
            medication.stop_date = date.today()

        db.commit()
        db.refresh(medication)

        create_history_record(
            db=db,
            medication_id=medication.id,
            patient_user_id=medication.patient_user_id,
            action=MedicationAction.COMPLETED,
            previous_status=prev_status,
            new_status=MedicationStatus.COMPLETED,
            notes=f"Medication course {medication.name} completed."
        )

        create_inapp_notification(
            db=db,
            user_id=medication.patient_user_id,
            notification_type=NotificationType.MEDICATION_COMPLETED,
            title="Medication Completed",
            message=f"Congratulations! You completed your course of {medication.name}.",
            related_entity_type="medication",
            related_entity_id=medication.id
        )

        return medication

    @staticmethod
    def update_reminder(db: Session, medication_id: int, current_user_id: int, req: MedicationReminderUpdate) -> Medication:
        medication = MedicationService.get_medication_by_id(db, medication_id, current_user_id)
        if medication.patient_user_id != current_user_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only patient can update reminders")

        medication.reminder_enabled = req.reminder_enabled
        medication.reminder_time = req.reminder_time if req.reminder_enabled else None

        db.commit()
        db.refresh(medication)

        title = "Reminder Enabled" if req.reminder_enabled else "Reminder Disabled"
        msg = f"Reminder for {medication.name} set to {medication.reminder_time}." if req.reminder_enabled else f"Reminder for {medication.name} disabled."

        create_inapp_notification(
            db=db,
            user_id=medication.patient_user_id,
            notification_type=NotificationType.MEDICATION_REMINDER,
            title=title,
            message=msg,
            related_entity_type="medication",
            related_entity_id=medication.id
        )

        return medication

    @staticmethod
    def get_medication_history(db: Session, patient_user_id: int, medication_id: Optional[int] = None) -> List[MedicationHistory]:
        query = db.query(MedicationHistory).filter(MedicationHistory.patient_user_id == patient_user_id)
        if medication_id:
            query = query.filter(MedicationHistory.medication_id == medication_id)
        return query.order_by(MedicationHistory.changed_at.desc()).all()
