from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from typing import List, Optional
from datetime import datetime, date
from app.models.appointment import Appointment, AppointmentStatus
from app.models.consultation import Consultation
from app.models.health_record import HealthRecord, RecordType
from app.models.hospital_profile import DoctorHospitalMapping
from app.models.user import User
from app.models.notification import Notification, NotificationType
from app.schemas.consultation import ConsultationCreate, ConsultationOut

class ConsultationService:
    @staticmethod
    def _format_consultation_out(db: Session, c: Consultation) -> ConsultationOut:
        patient_name = c.patient_user.full_name if c.patient_user else "Patient"
        doctor_name = c.doctor_profile.user.full_name if c.doctor_profile and c.doctor_profile.user else "Doctor"
        specialization = c.doctor_profile.specialization if c.doctor_profile else None

        # Find health record linked to this consultation
        hr = db.query(HealthRecord).filter(
            HealthRecord.patient_user_id == c.patient_user_id,
            HealthRecord.record_type == RecordType.CONSULTATION,
            HealthRecord.record_date == c.consultation_date
        ).order_by(HealthRecord.created_at.desc()).first()

        health_record_id = hr.id if hr else None

        return ConsultationOut(
            id=c.id,
            appointment_id=c.appointment_id,
            patient_user_id=c.patient_user_id,
            patient_name=patient_name,
            doctor_profile_id=c.doctor_profile_id,
            doctor_name=doctor_name,
            specialization=specialization,
            symptoms=c.symptoms,
            diagnosis=c.diagnosis,
            notes=c.notes,
            treatment_plan=c.treatment_plan,
            consultation_date=c.consultation_date,
            health_record_id=health_record_id,
            created_at=c.created_at,
            updated_at=c.updated_at,
        )

    @staticmethod
    def create_consultation(db: Session, current_user: User, appointment_id: int, payload: ConsultationCreate) -> ConsultationOut:
        appt = db.query(Appointment).filter(Appointment.id == appointment_id).first()
        if not appt:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Appointment id={appointment_id} not found."
            )

        # Ownership check: only assigned doctor can create consultation
        if not appt.doctor_profile or appt.doctor_profile.user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied. Only the assigned physician can conduct consultation and add notes."
            )

        # Check if consultation already exists
        if appt.consultation:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Consultation record already exists for this appointment."
            )

        consult_date = payload.consultation_date or appt.appointment_date or date.today()

        # Update appointment status to COMPLETED
        appt.status = AppointmentStatus.COMPLETED

        # Create Consultation record
        consultation = Consultation(
            appointment_id=appt.id,
            patient_user_id=appt.patient_user_id,
            doctor_profile_id=appt.doctor_profile_id,
            symptoms=payload.symptoms,
            diagnosis=payload.diagnosis,
            notes=payload.notes,
            treatment_plan=payload.treatment_plan,
            consultation_date=consult_date,
        )
        db.add(consultation)
        db.flush()

        # 1. Health Record System Integration
        facility_name = "Medical Clinic"
        mapping = db.query(DoctorHospitalMapping).filter(DoctorHospitalMapping.doctor_profile_id == appt.doctor_profile_id).first()
        if mapping and mapping.hospital_profile:
            facility_name = mapping.hospital_profile.name

        health_record = HealthRecord(
            patient_user_id=appt.patient_user_id,
            record_type=RecordType.CONSULTATION,
            title=f"Clinical Consultation: {payload.diagnosis}",
            description=f"Symptoms: {payload.symptoms or 'None reported'}\nDiagnosis: {payload.diagnosis}\nPhysician Notes: {payload.notes or 'N/A'}\nTreatment Plan: {payload.treatment_plan or 'N/A'}",
            record_date=consult_date,
            provider_name=current_user.full_name,
            facility_name=facility_name,
            status="COMPLETED",
        )
        db.add(health_record)

        # 2. Phase 5 Notification System Trigger
        notif = Notification(
            user_id=appt.patient_user_id,
            notification_type=NotificationType.CONSULTATION_COMPLETED,
            title="Consultation Record Ready",
            message=f"Dr. {current_user.full_name} completed your consultation for {consult_date}. Clinical diagnosis: {payload.diagnosis}.",
            related_entity_type="consultation",
            related_entity_id=consultation.id,
            is_read=False,
        )
        db.add(notif)

        db.commit()
        db.refresh(consultation)
        return ConsultationService._format_consultation_out(db, consultation)

    @staticmethod
    def get_consultation_by_id(db: Session, current_user: User, consultation_id: int) -> ConsultationOut:
        c = db.query(Consultation).filter(Consultation.id == consultation_id).first()
        if not c:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Consultation id={consultation_id} not found."
            )

        # Ownership check: patient or assigned doctor
        is_patient = (c.patient_user_id == current_user.id)
        is_doctor = (c.doctor_profile and c.doctor_profile.user_id == current_user.id)
        if not (is_patient or is_doctor):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied. You can only view your own consultation records."
            )

        return ConsultationService._format_consultation_out(db, c)

    @staticmethod
    def get_patient_consultations(db: Session, current_user: User) -> List[ConsultationOut]:
        consults = db.query(Consultation).filter(
            Consultation.patient_user_id == current_user.id
        ).order_by(Consultation.consultation_date.desc(), Consultation.created_at.desc()).all()
        return [ConsultationService._format_consultation_out(db, c) for c in consults]

    @staticmethod
    def get_doctor_consultations(db: Session, current_user: User) -> List[ConsultationOut]:
        if not hasattr(current_user, 'doctor_profiles') or not current_user.doctor_profiles:
            # query DoctorProfile manually
            from app.models.doctor_profile import DoctorProfile
            doc_profile = db.query(DoctorProfile).filter(DoctorProfile.user_id == current_user.id).first()
            doc_profile_id = doc_profile.id if doc_profile else None
        else:
            doc_profile_id = current_user.doctor_profiles[0].id

        if not doc_profile_id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No physician profile found for current user."
            )

        consults = db.query(Consultation).filter(
            Consultation.doctor_profile_id == doc_profile_id
        ).order_by(Consultation.consultation_date.desc(), Consultation.created_at.desc()).all()
        return [ConsultationService._format_consultation_out(db, c) for c in consults]
