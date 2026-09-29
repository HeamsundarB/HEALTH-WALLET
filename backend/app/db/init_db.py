"""
Explicit Database Initialization & Demo Seeding Script (Phase 3)
"""

from datetime import date, datetime
from sqlalchemy.orm import Session
from app.db.session import engine, Base, SessionLocal
from app.models.user import User, Role, UserRole, RoleName
from app.models.patient_profile import PatientProfile
from app.models.health_record import HealthRecord, RecordType
from app.models.consent import Consent, ConsentStatus, ConsentScope
from app.models.notification import Notification, NotificationType
from app.models.doctor_profile import DoctorProfile, DoctorCredential, VerificationStatus
from app.models.hospital_profile import HospitalProfile, HospitalDepartment, DoctorHospitalMapping
from app.models.appointment import Appointment, AppointmentStatus
from app.models.consultation import Consultation
from app.models.prescription import Prescription, PrescriptionStatus
from app.models.medication import Medication, MedicationStatus
from app.models.medication_history import MedicationHistory, MedicationAction
from app.models.conversation import Conversation, ConversationType, ConversationStatus
from app.models.message import Message
from app.core.security import get_password_hash
from app.core.logging import logger
from app.services.patient_service import generate_synthetic_health_wallet_id

DEMO_ACCOUNTS = [
    {"email": "patient@medimind.demo", "name": "Demo Patient", "role": RoleName.PATIENT},
    {"email": "doctor@medimind.demo", "name": "Dr. Demo Physician", "role": RoleName.DOCTOR},
    {"email": "hospital.admin@medimind.demo", "name": "Demo Hospital Admin", "role": RoleName.HOSPITAL_ADMIN},
    {"email": "hospital.staff@medimind.demo", "name": "Demo Hospital Staff", "role": RoleName.HOSPITAL_STAFF},
    {"email": "lab@medimind.demo", "name": "Demo Lab Technician", "role": RoleName.LAB},
    {"email": "pharmacy@medimind.demo", "name": "Demo Pharmacist", "role": RoleName.PHARMACY},
    {"email": "bloodbank@medimind.demo", "name": "Demo Blood Bank Officer", "role": RoleName.BLOOD_BANK},
    {"email": "admin@medimind.demo", "name": "Demo System Admin", "role": RoleName.SYSTEM_ADMIN},
]

DEFAULT_DEMO_PASSWORD = "DemoPassword123!"

SYNTHETIC_DEMO_RECORDS = [
    {
        "record_type": RecordType.CONSULTATION,
        "title": "Annual Wellness Consultation",
        "description": "Routine health checkup and vital signs assessment. Synthetic Prototype Data.",
        "record_date": date(2026, 3, 15),
        "provider_name": "Dr. Demo Physician",
        "facility_name": "City Innovation Healthcare",
        "status": "COMPLETED",
    },
    {
        "record_type": RecordType.VACCINATION,
        "title": "Influenza Vaccination",
        "description": "Annual flu vaccine administration. Synthetic Prototype Data.",
        "record_date": date(2026, 1, 10),
        "provider_name": "Dr. Demo Physician",
        "facility_name": "Community Health Center",
        "status": "COMPLETED",
    },
    {
        "record_type": RecordType.LAB_TEST,
        "title": "Comprehensive Blood Panel",
        "description": "Lipid profile, HbA1c, and complete blood count. Synthetic Prototype Data.",
        "record_date": date(2025, 11, 20),
        "provider_name": "Demo Lab Technician",
        "facility_name": "Central Diagnostic Labs",
        "status": "COMPLETED",
    },
    {
        "record_type": RecordType.PRESCRIPTION,
        "title": "Vitamin D3 Supplementation",
        "description": "Prescribed weekly 60,000 IU vitamin D3 for 8 weeks. Synthetic Prototype Data.",
        "record_date": date(2025, 9, 5),
        "provider_name": "Dr. Demo Physician",
        "facility_name": "City Pharmacy",
        "status": "COMPLETED",
    },
]

def init_db(db: Session) -> None:
    # 1. Create all tables explicitly
    Base.metadata.create_all(bind=engine)
    logger.info("SQLAlchemy tables created successfully.")

    # 1b. Update PostgreSQL enum types and columns if using PostgreSQL
    try:
        p_enums = [
            'APPOINTMENT_REQUESTED', 'APPOINTMENT_CONFIRMED', 'APPOINTMENT_REJECTED', 'APPOINTMENT_CANCELLED', 'CONSULTATION_COMPLETED',
            'PRESCRIPTION_CREATED', 'PRESCRIPTION_UPDATED', 'PRESCRIPTION_CANCELLED',
            'MEDICATION_STARTED', 'MEDICATION_UPDATED', 'MEDICATION_STOPPED', 'MEDICATION_COMPLETED', 'MEDICATION_REMINDER',
            'NEW_MESSAGE'
        ]
        c_statuses = ['PENDING', 'ACTIVE', 'EXPIRED']

        raw_conn = engine.raw_connection()
        raw_conn.set_isolation_level(0)
        cursor = raw_conn.cursor()
        for val in p_enums:
            cursor.execute(f"ALTER TYPE notificationtype ADD VALUE IF NOT EXISTS '{val}'")
        for val in c_statuses:
            cursor.execute(f"ALTER TYPE consentstatus ADD VALUE IF NOT EXISTS '{val}'")

        cursor.execute("ALTER TABLE consents ADD COLUMN IF NOT EXISTS start_at TIMESTAMP WITH TIME ZONE")
        cursor.execute("ALTER TABLE consents ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE")
        cursor.execute("ALTER TABLE consents ADD COLUMN IF NOT EXISTS sensitive_data_allowed BOOLEAN DEFAULT FALSE NOT NULL")

        raw_conn.close()
    except Exception as err:
        logger.warning(f"Database enum/column alter check note: {err}")


    # 2. Seed 8 roles
    for role_name in RoleName:
        role_obj = db.query(Role).filter(Role.name == role_name).first()
        if not role_obj:
            role_obj = Role(name=role_name, description=f"System role: {role_name.value}")
            db.add(role_obj)
    db.commit()

    # 3. Seed synthetic demo accounts, patient profiles & health records
    hashed_pwd = get_password_hash(DEFAULT_DEMO_PASSWORD)
    for demo in DEMO_ACCOUNTS:
        user = db.query(User).filter(User.email == demo["email"]).first()
        if not user:
            user = User(
                email=demo["email"],
                hashed_password=hashed_pwd,
                full_name=demo["name"],
                phone_number="+91 00000 00000",
                is_active=True,
                is_verified=True,
            )
            db.add(user)
            db.flush()

            role_obj = db.query(Role).filter(Role.name == demo["role"]).first()
            user_role = UserRole(user_id=user.id, role_id=role_obj.id)
            db.add(user_role)
            logger.info(f"Seeded synthetic demo account: {demo['email']} [{demo['role'].value}]")

        # Create patient profile & demo records for patient demo account
        if demo["role"] == RoleName.PATIENT:
            prof = db.query(PatientProfile).filter(PatientProfile.user_id == user.id).first()
            if not prof:
                hw_id = generate_synthetic_health_wallet_id(db)
                prof = PatientProfile(
                    user_id=user.id,
                    health_wallet_id=hw_id,
                    gender="PREFER_NOT_TO_SAY",
                    address="123 Innovation Way, Demo City",
                    state="Karnataka",
                    blood_group="O+",
                    emergency_contact_name="Emergency Contact Person",
                    emergency_contact_phone="+91 99999 00000",
                )
                db.add(prof)
                db.flush()

            # Seed synthetic health records if empty
            existing_records = db.query(HealthRecord).filter(HealthRecord.patient_user_id == user.id).count()
            if existing_records == 0:
                for rec_data in SYNTHETIC_DEMO_RECORDS:
                    rec = HealthRecord(
                        patient_user_id=user.id,
                        **rec_data
                    )
                    db.add(rec)
                logger.info(f"Seeded {len(SYNTHETIC_DEMO_RECORDS)} synthetic health records for patient id={user.id}")

    # Seed synthetic demo consent request if empty
    patient_user = db.query(User).filter(User.email == "patient@medimind.demo").first()
    doctor_user = db.query(User).filter(User.email == "doctor@medimind.demo").first()
    if patient_user and doctor_user:
        existing_consent = db.query(Consent).filter(
            Consent.patient_user_id == patient_user.id,
            Consent.requester_user_id == doctor_user.id
        ).first()
        if not existing_consent:
            demo_consent = Consent(
                patient_user_id=patient_user.id,
                requester_user_id=doctor_user.id,
                requester_role=RoleName.DOCTOR,
                purpose="Routine Clinical Consultation & Record Review",
                scope=ConsentScope.ALL_HEALTH_RECORDS,
                status=ConsentStatus.REQUESTED,
            )
            db.add(demo_consent)
            logger.info("Seeded synthetic demo consent request from Doctor to Patient.")

        # Seed synthetic demo notifications if empty for patient
        existing_notifs = db.query(Notification).filter(Notification.user_id == patient_user.id).count()
        if existing_notifs == 0:
            demo_notifs = [
                Notification(
                    user_id=patient_user.id,
                    notification_type=NotificationType.CONSENT_REQUEST,
                    title="New Access Request",
                    message="A healthcare user (Dr. Demo Physician) requested access to your synthetic Health Wallet records.",
                    related_entity_type="consent",
                    is_read=False,
                ),
                Notification(
                    user_id=patient_user.id,
                    notification_type=NotificationType.ACCOUNT_ACTIVITY,
                    title="Health Wallet ID Activated",
                    message="Your synthetic Digital Health Wallet ID (HW-2026) has been registered and verified.",
                    related_entity_type="patient_profile",
                    is_read=True,
                ),
            ]
            db.add_all(demo_notifs)
            logger.info("Seeded synthetic demo notifications for Patient.")

    # Seed Doctor Profile & Credential for doctor@medimind.demo
    if doctor_user:
        doc_prof = db.query(DoctorProfile).filter(DoctorProfile.user_id == doctor_user.id).first()
        if not doc_prof:
            doc_prof = DoctorProfile(
                user_id=doctor_user.id,
                specialization="General Medicine",
                qualification="MBBS, MD (Internal Medicine)",
                experience_years=12,
                languages="English, Hindi, Kannada",
                consultation_type="IN_PERSON_AND_ONLINE",
                availability_info="Mon - Sat (09:00 AM - 04:00 PM)",
                bio="Senior Consultant Physician specializing in general medicine, preventive healthcare, and chronic disease management.",
            )
            db.add(doc_prof)
            db.flush()

            doc_cred = DoctorCredential(
                doctor_profile_id=doc_prof.id,
                professional_id="DOC-1001",
                qualification_summary="MBBS, MD - Medical Council Verified (Synthetic Demo)",
                certifications="Fellow of Internal Medicine, Certified Diabetologist",
                verification_status=VerificationStatus.VERIFIED,
            )
            db.add(doc_cred)
            logger.info("Seeded synthetic demo Doctor Profile & Credential (DOC-1001).")

    # Seed Hospital Profile for hospital.admin@medimind.demo
    hosp_admin = db.query(User).filter(User.email == "hospital.admin@medimind.demo").first()
    if hosp_admin:
        hosp_prof = db.query(HospitalProfile).filter(HospitalProfile.admin_user_id == hosp_admin.id).first()
        if not hosp_prof:
            hosp_prof = HospitalProfile(
                admin_user_id=hosp_admin.id,
                name="City Innovation Multispeciality Hospital",
                registration_number="HOSP-REG-1001",
                address="100 Innovation Parkway, Healthcare City",
                location_city="Demo City",
                state="Karnataka",
                contact_email="hospital.admin@medimind.demo",
                contact_phone="+91 80 5555 1234",
                working_hours="24/7 Emergency & ICU | OPD: Mon-Sat 08:00 AM - 08:00 PM",
                services_summary="Cardiology, General Surgery, Pediatrics, ICU, Emergency Trauma, Advanced Diagnostics",
                verification_status=VerificationStatus.VERIFIED,
            )
            db.add(hosp_prof)
            db.flush()

            # Seed departments
            depts = [
                HospitalDepartment(hospital_profile_id=hosp_prof.id, name="General Medicine", description="Internal medicine and primary care"),
                HospitalDepartment(hospital_profile_id=hosp_prof.id, name="Cardiology", description="Comprehensive heart care and diagnostic lab"),
                HospitalDepartment(hospital_profile_id=hosp_prof.id, name="General Surgery", description="Laparoscopic and outpatient surgical procedures"),
            ]
            db.add_all(depts)
            db.flush()

            # Seed mapping for Doctor DOC-1001 to City Innovation Hospital
            if doctor_user:
                doc_p = db.query(DoctorProfile).filter(DoctorProfile.user_id == doctor_user.id).first()
                if doc_p:
                    mapping = DoctorHospitalMapping(
                        doctor_profile_id=doc_p.id,
                        hospital_profile_id=hosp_prof.id,
                        department_id=depts[0].id,
                        status="ACTIVE",
                    )
                    db.add(mapping)
                    logger.info("Seeded Doctor DOC-1001 mapping to City Innovation Multispeciality Hospital.")

    # Seed synthetic demo appointment for patient@medimind.demo
    if patient_user and doctor_user:
        doc_p = db.query(DoctorProfile).filter(DoctorProfile.user_id == doctor_user.id).first()
        if doc_p:
            existing_appt = db.query(Appointment).filter(
                Appointment.patient_user_id == patient_user.id,
                Appointment.doctor_profile_id == doc_p.id
            ).first()
            if not existing_appt:
                demo_appt = Appointment(
                    patient_user_id=patient_user.id,
                    doctor_profile_id=doc_p.id,
                    appointment_date=date(2026, 4, 15),
                    appointment_time="10:30 AM",
                    reason="Routine Quarterly Checkup & Blood Pressure Assessment",
                    status=AppointmentStatus.CONFIRMED,
                )
                db.add(demo_appt)
                logger.info("Seeded synthetic demo Appointment between Patient and Doctor.")

            # Seed synthetic Prescription & Medications
            existing_rx = db.query(Prescription).filter(Prescription.patient_user_id == patient_user.id).first()
            if not existing_rx:
                demo_rx = Prescription(
                    patient_user_id=patient_user.id,
                    doctor_profile_id=doc_p.id,
                    prescription_reference="RX-DEMO-2026",
                    prescribed_date=date(2026, 3, 15),
                    notes="Prescribed during routine consultation. Take medications with meals.",
                    status=PrescriptionStatus.ACTIVE
                )
                db.add(demo_rx)
                db.flush()

                med1 = Medication(
                    patient_user_id=patient_user.id,
                    prescription_id=demo_rx.id,
                    doctor_profile_id=doc_p.id,
                    name="Amoxicillin 500mg",
                    dosage="1 Capsule",
                    frequency="Twice daily (1-0-1)",
                    route="Oral",
                    start_date=date(2026, 3, 15),
                    stop_date=date(2026, 3, 25),
                    status=MedicationStatus.COMPLETED,
                    reminder_enabled=False,
                    hospital_name="City Innovation Multispeciality Hospital",
                    instructions="Finish full 10-day course."
                )
                med2 = Medication(
                    patient_user_id=patient_user.id,
                    prescription_id=demo_rx.id,
                    doctor_profile_id=doc_p.id,
                    name="Telmisartan 40mg",
                    dosage="1 Tablet",
                    frequency="Once daily morning (1-0-0)",
                    route="Oral",
                    start_date=date(2026, 3, 15),
                    stop_date=None,
                    status=MedicationStatus.ONGOING,
                    reminder_enabled=True,
                    reminder_time="08:00 AM",
                    hospital_name="City Innovation Multispeciality Hospital",
                    instructions="Blood pressure maintenance. Take after breakfast."
                )
                db.add_all([med1, med2])
                db.flush()

                hist1 = MedicationHistory(
                    medication_id=med2.id,
                    patient_user_id=patient_user.id,
                    action=MedicationAction.STARTED,
                    previous_status=None,
                    new_status=MedicationStatus.ONGOING,
                    notes="Prescribed via RX-DEMO-2026",
                    changed_at=datetime.utcnow()
                )
                db.add(hist1)
                logger.info("Seeded synthetic demo Prescription & Medications.")

            # Seed synthetic Conversation & Messages
            existing_conv = db.query(Conversation).filter(Conversation.patient_user_id == patient_user.id).first()
            if not existing_conv:
                demo_conv = Conversation(
                    patient_user_id=patient_user.id,
                    doctor_profile_id=doc_p.id,
                    conversation_type=ConversationType.GENERAL,
                    status=ConversationStatus.ACTIVE
                )
                db.add(demo_conv)
                db.flush()

                msg1 = Message(
                    conversation_id=demo_conv.id,
                    sender_user_id=patient_user.id,
                    message_text="Hello Dr. Demo, I have a question regarding my medication dosage schedule.",
                    is_read=True,
                    read_at=datetime.utcnow()
                )
                msg2 = Message(
                    conversation_id=demo_conv.id,
                    sender_user_id=doctor_user.id,
                    message_text="Hello Demo Patient! Please take Telmisartan 40mg every morning after breakfast. Feel free to message if you experience any side effects.",
                    is_read=False
                )
                db.add_all([msg1, msg2])
                logger.info("Seeded synthetic demo Conversation & Messages.")

    db.commit()
    logger.info("Phase 9 FAST MVP explicit database initialization complete.")

if __name__ == "__main__":
    db = SessionLocal()
    init_db(db)
    db.close()
