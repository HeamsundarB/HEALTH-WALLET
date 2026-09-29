import uuid
from datetime import date, datetime
from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.prescription import Prescription, PrescriptionStatus
from app.models.medication import Medication, MedicationStatus
from app.models.medication_history import MedicationHistory, MedicationAction
from app.models.consultation import Consultation
from app.models.doctor_profile import DoctorProfile
from app.models.user import User, RoleName
from app.models.notification import Notification, NotificationType
from app.schemas.prescription import PrescriptionCreate, PrescriptionUpdate
from app.services.medication_service import create_history_record, create_inapp_notification

def generate_prescription_reference() -> str:
    return f"RX-{uuid.uuid4().hex[:8].upper()}"

class PrescriptionService:

    @staticmethod
    def create_prescription(db: Session, doctor_user_id: int, schema: PrescriptionCreate) -> Prescription:
        # Verify doctor profile exists for logged-in user
        doctor_profile = db.query(DoctorProfile).filter(DoctorProfile.user_id == doctor_user_id).first()
        if not doctor_profile:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only registered doctors can create prescriptions"
            )

        # Validate target patient user exists
        patient_user = db.query(User).filter(User.id == schema.patient_user_id).first()
        if not patient_user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Target patient user not found")

        # Validate consultation linkage if supplied
        if schema.consultation_id:
            consultation = db.query(Consultation).filter(Consultation.id == schema.consultation_id).first()
            if not consultation:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Specified consultation not found")
            if consultation.doctor_profile_id != doctor_profile.id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Doctor is not authorized for this consultation"
                )
            if consultation.patient_user_id != schema.patient_user_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Consultation patient does not match prescription target patient"
                )

        # Create Prescription Header
        rx_ref = generate_prescription_reference()
        prescription = Prescription(
            patient_user_id=schema.patient_user_id,
            doctor_profile_id=doctor_profile.id,
            consultation_id=schema.consultation_id,
            prescription_reference=rx_ref,
            prescribed_date=date.today(),
            notes=schema.notes,
            status=PrescriptionStatus.ACTIVE
        )
        db.add(prescription)
        db.flush()

        # Create items as Medication entities linked to prescription
        for med_item in schema.medications:
            medication = Medication(
                patient_user_id=schema.patient_user_id,
                prescription_id=prescription.id,
                doctor_profile_id=doctor_profile.id,
                name=med_item.name,
                dosage=med_item.dosage,
                frequency=med_item.frequency,
                route=med_item.route,
                start_date=med_item.start_date,
                stop_date=med_item.stop_date,
                status=MedicationStatus.ONGOING,
                reminder_enabled=med_item.reminder_enabled,
                reminder_time=med_item.reminder_time if med_item.reminder_enabled else None,
                instructions=med_item.instructions
            )
            db.add(medication)
            db.flush()

            # Create Audit History Entry
            create_history_record(
                db=db,
                medication_id=medication.id,
                patient_user_id=schema.patient_user_id,
                action=MedicationAction.STARTED,
                previous_status=None,
                new_status=MedicationStatus.ONGOING,
                notes=f"Prescribed via RX {rx_ref} by Dr. {doctor_profile.user.full_name if doctor_profile.user else ''}"
            )

        db.commit()
        db.refresh(prescription)

        # In-App Notification to Patient
        create_inapp_notification(
            db=db,
            user_id=schema.patient_user_id,
            notification_type=NotificationType.PRESCRIPTION_CREATED,
            title="New Prescription Issued",
            message=f"Prescription {rx_ref} containing {len(schema.medications)} medication(s) has been issued.",
            related_entity_type="prescription",
            related_entity_id=prescription.id
        )

        return prescription

    @staticmethod
    def get_prescriptions_for_user(db: Session, current_user_id: int) -> List[Prescription]:
        # Check if doctor or patient
        user = db.query(User).filter(User.id == current_user_id).first()
        is_doctor = any(ur.role.name == "DOCTOR" or ur.role.name == RoleName.DOCTOR for ur in user.roles) if user else False

        if is_doctor:
            doc_profile = db.query(DoctorProfile).filter(DoctorProfile.user_id == current_user_id).first()
            if not doc_profile:
                return []
            return db.query(Prescription).filter(Prescription.doctor_profile_id == doc_profile.id).order_by(Prescription.prescribed_date.desc()).all()
        else:
            return db.query(Prescription).filter(Prescription.patient_user_id == current_user_id).order_by(Prescription.prescribed_date.desc()).all()

    @staticmethod
    def get_prescription_by_id(db: Session, prescription_id: int, current_user_id: int) -> Prescription:
        prescription = db.query(Prescription).filter(Prescription.id == prescription_id).first()
        if not prescription:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Prescription not found")

        # Security check: Patient ownership or doctor profile ownership
        if prescription.patient_user_id != current_user_id:
            doc_profile = db.query(DoctorProfile).filter(DoctorProfile.user_id == current_user_id).first()
            if not doc_profile or prescription.doctor_profile_id != doc_profile.id:
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied to prescription")

        return prescription

    @staticmethod
    def update_prescription(db: Session, prescription_id: int, doctor_user_id: int, schema: PrescriptionUpdate) -> Prescription:
        prescription = PrescriptionService.get_prescription_by_id(db, prescription_id, doctor_user_id)
        
        doc_profile = db.query(DoctorProfile).filter(DoctorProfile.user_id == doctor_user_id).first()
        if not doc_profile or prescription.doctor_profile_id != doc_profile.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only prescribing doctor can update prescription")

        if schema.notes is not None:
            prescription.notes = schema.notes
        if schema.status is not None:
            prescription.status = schema.status

        db.commit()
        db.refresh(prescription)

        create_inapp_notification(
            db=db,
            user_id=prescription.patient_user_id,
            notification_type=NotificationType.PRESCRIPTION_UPDATED,
            title="Prescription Updated",
            message=f"Prescription {prescription.prescription_reference} notes/status updated.",
            related_entity_type="prescription",
            related_entity_id=prescription.id
        )

        return prescription

    @staticmethod
    def cancel_prescription(db: Session, prescription_id: int, doctor_user_id: int) -> Prescription:
        prescription = PrescriptionService.get_prescription_by_id(db, prescription_id, doctor_user_id)
        
        doc_profile = db.query(DoctorProfile).filter(DoctorProfile.user_id == doctor_user_id).first()
        if not doc_profile or prescription.doctor_profile_id != doc_profile.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only prescribing doctor can cancel prescription")

        if prescription.status == PrescriptionStatus.CANCELLED:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Prescription is already cancelled")

        prescription.status = PrescriptionStatus.CANCELLED

        # Mark attached medications as STOPPED
        for med in prescription.medications:
            if med.status == MedicationStatus.ONGOING:
                med.status = MedicationStatus.STOPPED
                med.stop_date = date.today()
                create_history_record(
                    db=db,
                    medication_id=med.id,
                    patient_user_id=med.patient_user_id,
                    action=MedicationAction.STOPPED,
                    previous_status=MedicationStatus.ONGOING,
                    new_status=MedicationStatus.STOPPED,
                    notes=f"Prescription {prescription.prescription_reference} cancelled."
                )

        db.commit()
        db.refresh(prescription)

        create_inapp_notification(
            db=db,
            user_id=prescription.patient_user_id,
            notification_type=NotificationType.PRESCRIPTION_CANCELLED,
            title="Prescription Cancelled",
            message=f"Prescription {prescription.prescription_reference} has been cancelled by doctor.",
            related_entity_type="prescription",
            related_entity_id=prescription.id
        )

        return prescription
