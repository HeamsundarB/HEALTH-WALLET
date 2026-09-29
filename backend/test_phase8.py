import os
import sys
import unittest
from datetime import date, timedelta
from fastapi.testclient import TestClient

# Add current directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.main import app
from app.db.session import SessionLocal
from app.core.security import create_access_token, get_password_hash
from app.models.user import User, Role, UserRole, RoleName
from app.models.doctor_profile import DoctorProfile, DoctorCredential, VerificationStatus
from app.models.appointment import Appointment, AppointmentStatus
from app.models.consultation import Consultation
from app.models.prescription import Prescription, PrescriptionStatus
from app.models.medication import Medication, MedicationStatus
from app.models.medication_history import MedicationHistory, MedicationAction
from app.models.notification import Notification, NotificationType

client = TestClient(app)

class TestPhase8MedicationPrescription(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.db = SessionLocal()

        # 1. Setup Patient 1 (Main test patient)
        cls.patient1 = cls.db.query(User).filter(User.email == "patient1_p8@medimind.com").first()
        if not cls.patient1:
            patient_role = cls.db.query(Role).filter(Role.name == RoleName.PATIENT).first()
            if not patient_role:
                patient_role = Role(name=RoleName.PATIENT, description="Patient role")
                cls.db.add(patient_role)
                cls.db.commit()

            cls.patient1 = User(
                email="patient1_p8@medimind.com",
                full_name="Alice Patient P8",
                phone_number="+91999998801",
                hashed_password=get_password_hash("PatientPass123!"),
                is_active=True,
                is_verified=True,
            )
            cls.db.add(cls.patient1)
            cls.db.commit()
            cls.db.refresh(cls.patient1)

            cls.db.add(UserRole(user_id=cls.patient1.id, role_id=patient_role.id))
            cls.db.commit()

        # 2. Setup Patient 2 (Cross-patient isolation test)
        cls.patient2 = cls.db.query(User).filter(User.email == "patient2_p8@medimind.com").first()
        if not cls.patient2:
            patient_role = cls.db.query(Role).filter(Role.name == RoleName.PATIENT).first()
            cls.patient2 = User(
                email="patient2_p8@medimind.com",
                full_name="Bob Patient P8",
                phone_number="+91999998802",
                hashed_password=get_password_hash("PatientPass123!"),
                is_active=True,
                is_verified=True,
            )
            cls.db.add(cls.patient2)
            cls.db.commit()
            cls.db.refresh(cls.patient2)

            cls.db.add(UserRole(user_id=cls.patient2.id, role_id=patient_role.id))
            cls.db.commit()

        # 3. Setup Doctor 1 (Prescribing Doctor)
        cls.doc_user1 = cls.db.query(User).filter(User.email == "doctor1_p8@medimind.com").first()
        if not cls.doc_user1:
            doc_role = cls.db.query(Role).filter(Role.name == RoleName.DOCTOR).first()
            if not doc_role:
                doc_role = Role(name=RoleName.DOCTOR, description="Doctor role")
                cls.db.add(doc_role)
                cls.db.commit()

            cls.doc_user1 = User(
                email="doctor1_p8@medimind.com",
                full_name="Dr. Charles Prescriber P8",
                phone_number="+91999998803",
                hashed_password=get_password_hash("DoctorPass123!"),
                is_active=True,
                is_verified=True,
            )
            cls.db.add(cls.doc_user1)
            cls.db.commit()
            cls.db.refresh(cls.doc_user1)

            cls.db.add(UserRole(user_id=cls.doc_user1.id, role_id=doc_role.id))
            cls.db.commit()

        cls.doc_profile1 = cls.db.query(DoctorProfile).filter(DoctorProfile.user_id == cls.doc_user1.id).first()
        if not cls.doc_profile1:
            cls.doc_profile1 = DoctorProfile(
                user_id=cls.doc_user1.id,
                specialization="General Medicine",
                qualification="MBBS, MD",
                experience_years=15,
                consultation_type="BOTH",
                availability_info="Mon-Fri 09:00 AM - 05:00 PM",
                bio="General physician.",
            )
            cls.db.add(cls.doc_profile1)
            cls.db.commit()
            cls.db.refresh(cls.doc_profile1)

            cred1 = DoctorCredential(
                doctor_profile_id=cls.doc_profile1.id,
                professional_id="DOC-P8-8001",
                qualification_summary="Certified Physician",
                verification_status=VerificationStatus.VERIFIED,
            )
            cls.db.add(cred1)
            cls.db.commit()

        # 4. Setup Doctor 2 (Unauthorized Doctor for isolation testing)
        cls.doc_user2 = cls.db.query(User).filter(User.email == "doctor2_p8@medimind.com").first()
        if not cls.doc_user2:
            doc_role = cls.db.query(Role).filter(Role.name == RoleName.DOCTOR).first()
            cls.doc_user2 = User(
                email="doctor2_p8@medimind.com",
                full_name="Dr. Diana Unauthorized P8",
                phone_number="+91999998804",
                hashed_password=get_password_hash("DoctorPass123!"),
                is_active=True,
                is_verified=True,
            )
            cls.db.add(cls.doc_user2)
            cls.db.commit()
            cls.db.refresh(cls.doc_user2)

            cls.db.add(UserRole(user_id=cls.doc_user2.id, role_id=doc_role.id))
            cls.db.commit()

        cls.doc_profile2 = cls.db.query(DoctorProfile).filter(DoctorProfile.user_id == cls.doc_user2.id).first()
        if not cls.doc_profile2:
            cls.doc_profile2 = DoctorProfile(
                user_id=cls.doc_user2.id,
                specialization="Dermatology",
                qualification="MBBS, MD Dermatology",
                experience_years=8,
                consultation_type="IN_PERSON",
                availability_info="Mon-Thu 10:00 AM - 04:00 PM",
                bio="Dermatologist.",
            )
            cls.db.add(cls.doc_profile2)
            cls.db.commit()
            cls.db.refresh(cls.doc_profile2)

        # Create linked Consultation for Prescription testing
        cls.appt1 = Appointment(
            patient_user_id=cls.patient1.id,
            doctor_profile_id=cls.doc_profile1.id,
            appointment_date=date.today(),
            appointment_time="11:00 AM",
            reason="Hypertension evaluation",
            status=AppointmentStatus.COMPLETED
        )
        cls.db.add(cls.appt1)
        cls.db.commit()
        cls.db.refresh(cls.appt1)

        cls.consult1 = Consultation(
            appointment_id=cls.appt1.id,
            patient_user_id=cls.patient1.id,
            doctor_profile_id=cls.doc_profile1.id,
            symptoms="Headache & Elevated BP",
            diagnosis="Essential Hypertension",
            notes="BP 140/90 mmHg",
            treatment_plan="Antihypertensive medication",
            consultation_date=date.today()
        )
        cls.db.add(cls.consult1)
        cls.db.commit()
        cls.db.refresh(cls.consult1)

        # Tokens
        cls.token_patient1 = create_access_token({"sub": str(cls.patient1.id)})
        cls.token_patient2 = create_access_token({"sub": str(cls.patient2.id)})
        cls.token_doctor1 = create_access_token({"sub": str(cls.doc_user1.id)})
        cls.token_doctor2 = create_access_token({"sub": str(cls.doc_user2.id)})

        # Instance state for test chain
        cls.test_med_id = None
        cls.test_rx_id = None

    @classmethod
    def tearDownClass(cls):
        cls.db.close()

    # 1. Patient Auth Check
    def test_01_patient_auth(self):
        res = client.post("/api/v1/auth/login", json={"email": "patient1_p8@medimind.com", "password": "PatientPass123!"})
        self.assertEqual(res.status_code, 200)

    # 2. Doctor Auth Check
    def test_02_doctor_auth(self):
        res = client.post("/api/v1/auth/login", json={"email": "doctor1_p8@medimind.com", "password": "DoctorPass123!"})
        self.assertEqual(res.status_code, 200)

    # 3. Patient Creates Personal Medication
    def test_03_patient_creates_medication(self):
        headers = {"Authorization": f"Bearer {self.token_patient1}"}
        payload = {
            "name": "Metformin 500mg",
            "dosage": "1 Tablet",
            "frequency": "Twice daily (1-0-1)",
            "route": "Oral",
            "start_date": str(date.today()),
            "reminder_enabled": True,
            "reminder_time": "08:00 AM",
            "instructions": "Take after meals"
        }
        res = client.post("/api/v1/medications", json=payload, headers=headers)
        self.assertEqual(res.status_code, 201)
        data = res.json()
        self.assertEqual(data["name"], "Metformin 500mg")
        self.assertEqual(data["status"], "ONGOING")
        self.assertTrue(data["reminder_enabled"])
        
        TestPhase8MedicationPrescription.test_med_id = data["id"]

    # 4. Patient Retrieves Own Medication
    def test_04_patient_retrieves_own_medication(self):
        headers = {"Authorization": f"Bearer {self.token_patient1}"}
        res = client.get(f"/api/v1/medications/{self.test_med_id}", headers=headers)
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()["id"], self.test_med_id)

    # 5. Patient Retrieves Medication Categories
    def test_05_patient_retrieves_medication_categories(self):
        headers = {"Authorization": f"Bearer {self.token_patient1}"}
        
        # Recently started
        res_recent = client.get("/api/v1/medications?category=recently_started", headers=headers)
        self.assertEqual(res_recent.status_code, 200)
        self.assertTrue(len(res_recent.json()) >= 1)

        # Ongoing
        res_ongoing = client.get("/api/v1/medications?category=ongoing", headers=headers)
        self.assertEqual(res_ongoing.status_code, 200)
        self.assertTrue(len(res_ongoing.json()) >= 1)

    # 6. Patient Updates Medication
    def test_06_patient_updates_medication(self):
        headers = {"Authorization": f"Bearer {self.token_patient1}"}
        payload = {"instructions": "Take with breakfast and dinner"}
        res = client.put(f"/api/v1/medications/{self.test_med_id}", json=payload, headers=headers)
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()["instructions"], "Take with breakfast and dinner")

    # 7. Patient Stops Medication
    def test_07_patient_stops_medication(self):
        # Create temporary medication to stop
        headers = {"Authorization": f"Bearer {self.token_patient1}"}
        payload = {
            "name": "Paracetamol 650mg",
            "dosage": "1 Tablet",
            "frequency": "As needed",
            "route": "Oral",
            "start_date": str(date.today() - timedelta(days=2))
        }
        res_create = client.post("/api/v1/medications", json=payload, headers=headers)
        temp_id = res_create.json()["id"]

        # Stop medication
        res_stop = client.post(f"/api/v1/medications/{temp_id}/stop", json={"notes": "Fever resolved"}, headers=headers)
        self.assertEqual(res_stop.status_code, 200)
        self.assertEqual(res_stop.json()["status"], "STOPPED")

    # 8. Patient Completes Medication
    def test_08_patient_completes_medication(self):
        # Create temporary medication to complete
        headers = {"Authorization": f"Bearer {self.token_patient1}"}
        payload = {
            "name": "Azithromycin 500mg",
            "dosage": "1 Tablet",
            "frequency": "Once daily",
            "route": "Oral",
            "start_date": str(date.today() - timedelta(days=5)),
            "stop_date": str(date.today())
        }
        res_create = client.post("/api/v1/medications", json=payload, headers=headers)
        temp_id = res_create.json()["id"]

        # Mark complete
        res_comp = client.post(f"/api/v1/medications/{temp_id}/complete", headers=headers)
        self.assertEqual(res_comp.status_code, 200)
        self.assertEqual(res_comp.json()["status"], "COMPLETED")

    # 9. Medication History Created
    def test_09_medication_history_created(self):
        headers = {"Authorization": f"Bearer {self.token_patient1}"}
        res = client.get(f"/api/v1/medications/history?medication_id={self.test_med_id}", headers=headers)
        self.assertEqual(res.status_code, 200)
        history = res.json()
        self.assertTrue(len(history) >= 1)

    # 10. Cross-Patient Medication Access Blocked (403 Forbidden)
    def test_10_cross_patient_medication_access_blocked(self):
        headers = {"Authorization": f"Bearer {self.token_patient2}"}
        res = client.get(f"/api/v1/medications/{self.test_med_id}", headers=headers)
        self.assertEqual(res.status_code, 403)

    # 11. Doctor Creates Prescription
    def test_11_doctor_creates_prescription(self):
        headers = {"Authorization": f"Bearer {self.token_doctor1}"}
        payload = {
            "patient_user_id": self.patient1.id,
            "consultation_id": self.consult1.id,
            "notes": "Take antihypertensives daily.",
            "medications": [
                {
                    "name": "Amlodipine 5mg",
                    "dosage": "1 Tablet",
                    "frequency": "Once daily (1-0-0)",
                    "route": "Oral",
                    "start_date": str(date.today()),
                    "reminder_enabled": True,
                    "reminder_time": "09:00 AM",
                    "instructions": "Take morning after food"
                }
            ]
        }
        res = client.post("/api/v1/prescriptions", json=payload, headers=headers)
        self.assertEqual(res.status_code, 201)
        data = res.json()
        self.assertEqual(data["patient_user_id"], self.patient1.id)
        self.assertEqual(data["consultation_id"], self.consult1.id)
        self.assertTrue(data["prescription_reference"].startswith("RX-"))
        self.assertEqual(len(data["medications"]), 1)

        TestPhase8MedicationPrescription.test_rx_id = data["id"]

    # 12. Prescription Linked to Valid Consultation
    def test_12_prescription_linked_to_consultation(self):
        headers = {"Authorization": f"Bearer {self.token_patient1}"}
        res = client.get(f"/api/v1/prescriptions/{self.test_rx_id}", headers=headers)
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()["consultation_id"], self.consult1.id)

    # 13. Prescription Contains Multiple Medications
    def test_13_prescription_contains_multiple_medications(self):
        headers = {"Authorization": f"Bearer {self.token_doctor1}"}
        payload = {
            "patient_user_id": self.patient1.id,
            "notes": "Combination therapy",
            "medications": [
                {
                    "name": "Atorvastatin 10mg",
                    "dosage": "1 Tablet",
                    "frequency": "Night (0-0-1)",
                    "route": "Oral",
                    "start_date": str(date.today())
                },
                {
                    "name": "Aspirin 75mg",
                    "dosage": "1 Tablet",
                    "frequency": "After lunch (0-1-0)",
                    "route": "Oral",
                    "start_date": str(date.today())
                }
            ]
        }
        res = client.post("/api/v1/prescriptions", json=payload, headers=headers)
        self.assertEqual(res.status_code, 201)
        self.assertEqual(len(res.json()["medications"]), 2)

    # 14. Patient Retrieves Own Prescription
    def test_14_patient_retrieves_own_prescription(self):
        headers = {"Authorization": f"Bearer {self.token_patient1}"}
        res = client.get("/api/v1/prescriptions", headers=headers)
        self.assertEqual(res.status_code, 200)
        self.assertTrue(len(res.json()) >= 1)

    # 15. Cross-Patient Prescription Access Blocked (403 Forbidden)
    def test_15_cross_patient_prescription_access_blocked(self):
        headers = {"Authorization": f"Bearer {self.token_patient2}"}
        res = client.get(f"/api/v1/prescriptions/{self.test_rx_id}", headers=headers)
        self.assertEqual(res.status_code, 403)

    # 16. Unauthorized Doctor Action Blocked (403 Forbidden)
    def test_16_unauthorized_doctor_action_blocked(self):
        headers = {"Authorization": f"Bearer {self.token_doctor2}"}
        # Attempt to create prescription for consultation assigned to Doctor 1
        payload = {
            "patient_user_id": self.patient1.id,
            "consultation_id": self.consult1.id,
            "medications": [
                {
                    "name": "Unauthorized Med",
                    "dosage": "1 Tab",
                    "frequency": "Daily",
                    "route": "Oral",
                    "start_date": str(date.today())
                }
            ]
        }
        res = client.post("/api/v1/prescriptions", json=payload, headers=headers)
        self.assertEqual(res.status_code, 403)

    # 17. Prescription Update Works
    def test_17_prescription_update_works(self):
        headers = {"Authorization": f"Bearer {self.token_doctor1}"}
        payload = {"notes": "Updated prescription notes by Dr. Charles"}
        res = client.put(f"/api/v1/prescriptions/{self.test_rx_id}", json=payload, headers=headers)
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()["notes"], "Updated prescription notes by Dr. Charles")

    # 18. Prescription Cancellation Works
    def test_18_prescription_cancellation_works(self):
        headers = {"Authorization": f"Bearer {self.token_doctor1}"}
        res = client.post(f"/api/v1/prescriptions/{self.test_rx_id}/cancel", headers=headers)
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()["status"], "CANCELLED")

    # 19. Notifications Generated
    def test_19_notification_generated(self):
        headers = {"Authorization": f"Bearer {self.token_patient1}"}
        res = client.get("/api/v1/notifications", headers=headers)
        self.assertEqual(res.status_code, 200)
        notifs = res.json()
        self.assertTrue(any("Prescription" in n["title"] or "Medication" in n["title"] for n in notifs))

    # 20. Medication Reminder Settings Work
    def test_20_medication_reminder_settings_work(self):
        headers = {"Authorization": f"Bearer {self.token_patient1}"}
        payload = {"reminder_enabled": True, "reminder_time": "09:30 PM"}
        res = client.put(f"/api/v1/medications/{self.test_med_id}/reminder", json=payload, headers=headers)
        self.assertEqual(res.status_code, 200)
        self.assertTrue(res.json()["reminder_enabled"])
        self.assertEqual(res.json()["reminder_time"], "09:30 PM")

    # 21. Invalid Medication Dates Rejected
    def test_21_invalid_medication_dates_rejected(self):
        headers = {"Authorization": f"Bearer {self.token_patient1}"}
        payload = {
            "name": "Invalid Date Med",
            "dosage": "1 Tab",
            "frequency": "Daily",
            "route": "Oral",
            "start_date": str(date.today()),
            "stop_date": str(date.today() - timedelta(days=5))
        }
        res = client.post("/api/v1/medications", json=payload, headers=headers)
        self.assertEqual(res.status_code, 422)

    # 22. Invalid Lifecycle Transition Rejected
    def test_22_invalid_lifecycle_transition_rejected(self):
        headers = {"Authorization": f"Bearer {self.token_patient1}"}
        # Attempt to stop an already stopped medication
        payload = {
            "name": "Double Stop Med",
            "dosage": "1 Tab",
            "frequency": "Daily",
            "route": "Oral",
            "start_date": str(date.today() - timedelta(days=3))
        }
        res_c = client.post("/api/v1/medications", json=payload, headers=headers)
        m_id = res_c.json()["id"]

        client.post(f"/api/v1/medications/{m_id}/stop", json={}, headers=headers)
        res_repeat = client.post(f"/api/v1/medications/{m_id}/stop", json={}, headers=headers)
        self.assertEqual(res_repeat.status_code, 400)

    # 23. Unauthenticated Access Blocked (401 Unauthorized)
    def test_23_unauthenticated_access_blocked(self):
        res_meds = client.get("/api/v1/medications")
        self.assertEqual(res_meds.status_code, 401)

        res_rxs = client.get("/api/v1/prescriptions")
        self.assertEqual(res_rxs.status_code, 401)

    # 24. Phase 5 Regression Suite
    def test_24_phase5_regression(self):
        import test_phase5
        test_phase5.run_tests()

    # 25. Phase 6 Regression Suite
    def test_25_phase6_regression(self):
        import test_phase6
        suite6 = unittest.TestLoader().loadTestsFromModule(test_phase6)
        res6 = unittest.TextTestRunner(verbosity=0).run(suite6)
        self.assertTrue(res6.wasSuccessful(), f"Phase 6 regression failures: {len(res6.failures) + len(res6.errors)}")

    # 26. Phase 7 Regression Suite
    def test_26_phase7_regression(self):
        import test_phase7
        suite7 = unittest.TestLoader().loadTestsFromModule(test_phase7)
        res7 = unittest.TextTestRunner(verbosity=0).run(suite7)
        self.assertTrue(res7.wasSuccessful(), f"Phase 7 regression failures: {len(res7.failures) + len(res7.errors)}")

if __name__ == "__main__":
    unittest.main()
