from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from typing import List, Optional
from datetime import datetime, date
from app.models.appointment import Appointment, AppointmentStatus
from app.models.doctor_profile import DoctorProfile
from app.models.hospital_profile import DoctorHospitalMapping
from app.models.user import User
from app.models.notification import Notification, NotificationType
from app.schemas.appointment import AppointmentCreate, AppointmentOut

class AppointmentService:
    @staticmethod
    def _format_appointment_out(db: Session, appt: Appointment) -> AppointmentOut:
        patient_name = appt.patient_user.full_name if appt.patient_user else "Patient"
        doctor_name = appt.doctor_profile.user.full_name if appt.doctor_profile and appt.doctor_profile.user else "Doctor"
        specialization = appt.doctor_profile.specialization if appt.doctor_profile else None
        
        # Hospital name lookup if affiliated
        hospital_name = None
        if appt.doctor_profile:
            mapping = db.query(DoctorHospitalMapping).filter(DoctorHospitalMapping.doctor_profile_id == appt.doctor_profile.id).first()
            if mapping and mapping.hospital_profile:
                hospital_name = mapping.hospital_profile.name

        consultation_id = appt.consultation.id if appt.consultation else None

        return AppointmentOut(
            id=appt.id,
            patient_user_id=appt.patient_user_id,
            patient_name=patient_name,
            doctor_profile_id=appt.doctor_profile_id,
            doctor_name=doctor_name,
            specialization=specialization,
            hospital_name=hospital_name,
            appointment_date=appt.appointment_date,
            appointment_time=appt.appointment_time,
            reason=appt.reason,
            status=appt.status,
            consultation_id=consultation_id,
            created_at=appt.created_at,
            updated_at=appt.updated_at,
        )

    @staticmethod
    def create_appointment(db: Session, current_user: User, payload: AppointmentCreate) -> AppointmentOut:
        doc_profile = db.query(DoctorProfile).filter(DoctorProfile.id == payload.doctor_profile_id).first()
        if not doc_profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Doctor profile id={payload.doctor_profile_id} not found."
            )

        appt = Appointment(
            patient_user_id=current_user.id,
            doctor_profile_id=doc_profile.id,
            appointment_date=payload.appointment_date,
            appointment_time=payload.appointment_time,
            reason=payload.reason,
            status=AppointmentStatus.REQUESTED,
        )
        db.add(appt)
        db.flush()

        # In-app notification for Doctor
        if doc_profile.user_id:
            notif = Notification(
                user_id=doc_profile.user_id,
                notification_type=NotificationType.APPOINTMENT_REQUESTED,
                title="New Appointment Request",
                message=f"Patient {current_user.full_name} requested an appointment for {payload.appointment_date} at {payload.appointment_time}.",
                related_entity_type="appointment",
                related_entity_id=appt.id,
                is_read=False,
            )
            db.add(notif)

        db.commit()
        db.refresh(appt)
        return AppointmentService._format_appointment_out(db, appt)

    @staticmethod
    def get_patient_appointments(db: Session, current_user: User) -> List[AppointmentOut]:
        appts = db.query(Appointment).filter(
            Appointment.patient_user_id == current_user.id
        ).order_by(Appointment.appointment_date.desc(), Appointment.created_at.desc()).all()
        return [AppointmentService._format_appointment_out(db, a) for a in appts]

    @staticmethod
    def get_doctor_appointments(db: Session, current_user: User) -> List[AppointmentOut]:
        doc_profile = db.query(DoctorProfile).filter(DoctorProfile.user_id == current_user.id).first()
        if not doc_profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No physician profile found for current user."
            )

        appts = db.query(Appointment).filter(
            Appointment.doctor_profile_id == doc_profile.id
        ).order_by(Appointment.appointment_date.desc(), Appointment.created_at.desc()).all()
        return [AppointmentService._format_appointment_out(db, a) for a in appts]

    @staticmethod
    def get_appointment_by_id(db: Session, current_user: User, appointment_id: int) -> AppointmentOut:
        appt = db.query(Appointment).filter(Appointment.id == appointment_id).first()
        if not appt:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Appointment id={appointment_id} not found."
            )

        # Check ownership: patient or assigned doctor
        is_patient = (appt.patient_user_id == current_user.id)
        is_doctor = (appt.doctor_profile and appt.doctor_profile.user_id == current_user.id)
        if not (is_patient or is_doctor):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied. You can only view your own appointments."
            )

        return AppointmentService._format_appointment_out(db, appt)

    @staticmethod
    def cancel_appointment(db: Session, current_user: User, appointment_id: int) -> AppointmentOut:
        appt = db.query(Appointment).filter(Appointment.id == appointment_id).first()
        if not appt:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Appointment id={appointment_id} not found."
            )

        # Ownership check: only patient can cancel their appointment
        if appt.patient_user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied. Only the patient can cancel this appointment."
            )

        if appt.status in [AppointmentStatus.COMPLETED, AppointmentStatus.CANCELLED, AppointmentStatus.REJECTED]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Appointment cannot be cancelled as it is already in state '{appt.status}'."
            )

        appt.status = AppointmentStatus.CANCELLED
        db.flush()

        # In-app notification for Doctor
        if appt.doctor_profile and appt.doctor_profile.user_id:
            notif = Notification(
                user_id=appt.doctor_profile.user_id,
                notification_type=NotificationType.APPOINTMENT_CANCELLED,
                title="Appointment Cancelled",
                message=f"Patient {current_user.full_name} cancelled their appointment scheduled for {appt.appointment_date}.",
                related_entity_type="appointment",
                related_entity_id=appt.id,
                is_read=False,
            )
            db.add(notif)

        db.commit()
        db.refresh(appt)
        return AppointmentService._format_appointment_out(db, appt)

    @staticmethod
    def confirm_appointment(db: Session, current_user: User, appointment_id: int) -> AppointmentOut:
        appt = db.query(Appointment).filter(Appointment.id == appointment_id).first()
        if not appt:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Appointment id={appointment_id} not found."
            )

        # Ownership check: only assigned doctor can confirm
        if not appt.doctor_profile or appt.doctor_profile.user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied. Only the assigned physician can confirm this appointment."
            )

        appt.status = AppointmentStatus.CONFIRMED
        db.flush()

        # In-app notification for Patient
        notif = Notification(
            user_id=appt.patient_user_id,
            notification_type=NotificationType.APPOINTMENT_CONFIRMED,
            title="Appointment Confirmed",
            message=f"Dr. {current_user.full_name} confirmed your appointment for {appt.appointment_date} at {appt.appointment_time}.",
            related_entity_type="appointment",
            related_entity_id=appt.id,
            is_read=False,
        )
        db.add(notif)

        db.commit()
        db.refresh(appt)
        return AppointmentService._format_appointment_out(db, appt)

    @staticmethod
    def reject_appointment(db: Session, current_user: User, appointment_id: int) -> AppointmentOut:
        appt = db.query(Appointment).filter(Appointment.id == appointment_id).first()
        if not appt:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Appointment id={appointment_id} not found."
            )

        # Ownership check: only assigned doctor can reject
        if not appt.doctor_profile or appt.doctor_profile.user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied. Only the assigned physician can reject this appointment."
            )

        appt.status = AppointmentStatus.REJECTED
        db.flush()

        # In-app notification for Patient
        notif = Notification(
            user_id=appt.patient_user_id,
            notification_type=NotificationType.APPOINTMENT_REJECTED,
            title="Appointment Declined",
            message=f"Dr. {current_user.full_name} was unable to accept your appointment for {appt.appointment_date}.",
            related_entity_type="appointment",
            related_entity_id=appt.id,
            is_read=False,
        )
        db.add(notif)

        db.commit()
        db.refresh(appt)
        return AppointmentService._format_appointment_out(db, appt)

    @staticmethod
    def complete_appointment(db: Session, current_user: User, appointment_id: int) -> AppointmentOut:
        appt = db.query(Appointment).filter(Appointment.id == appointment_id).first()
        if not appt:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Appointment id={appointment_id} not found."
            )

        # Ownership check: only assigned doctor can complete
        if not appt.doctor_profile or appt.doctor_profile.user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied. Only the assigned physician can complete this appointment."
            )

        appt.status = AppointmentStatus.COMPLETED
        db.commit()
        db.refresh(appt)
        return AppointmentService._format_appointment_out(db, appt)
