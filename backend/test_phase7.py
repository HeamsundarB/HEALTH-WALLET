import os
import sys
import unittest
from datetime import date
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
from app.models.health_record import HealthRecord, RecordType
from app.models.notification import Notification, NotificationType

client = TestClient(app)

class TestPhase7AppointmentsConsultations(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.db = SessionLocal()

        # 1. Setup Main Patient User
        cls.patient1 = cls.db.query(User).filter(User.email == "patient1_p7@medimind.com").first()
        if not cls.patient1:
            patient_role = cls.db.query(Role).filter(Role.name == RoleName.PATIENT).first()
            if not patient_role:
                patient_role = Role(name=RoleName.PATIENT, description="Patient role")
                cls.db.add(patient_role)
                cls.db.commit()

            cls.patient1 = User(
                email="patient1_p7@medimind.com",
                full_name="Alice Patient P7",
                phone_number="+91999997701",
                hashed_password=get_password_hash("PatientPass123!"),
                is_active=True,
                is_verified=True,
            )
            cls.db.add(cls.patient1)
            cls.db.commit()
            cls.db.refresh(cls.patient1)

            cls.db.add(UserRole(user_id=cls.patient1.id, role_id=patient_role.id))
            cls.db.commit()

        # 2. Setup Second Patient User (for cross-user isolation test)
        cls.patient2 = cls.db.query(User).filter(User.email == "patient2_p7@medimind.com").first()
        if not cls.patient2:
            patient_role = cls.db.query(Role).filter(Role.name == RoleName.PATIENT).first()
            cls.patient2 = User(
                email="patient2_p7@medimind.com",
                full_name="Bob Patient P7",
                phone_number="+91999997702",
                hashed_password=get_password_hash("PatientPass123!"),
                is_active=True,
                is_verified=True,
            )
            cls.db.add(cls.patient2)
            cls.db.commit()
            cls.db.refresh(cls.patient2)

            cls.db.add(UserRole(user_id=cls.patient2.id, role_id=patient_role.id))
            cls.db.commit()

        # 3. Setup Main Doctor User & Profile
        cls.doc_user1 = cls.db.query(User).filter(User.email == "doctor1_p7@medimind.com").first()
        if not cls.doc_user1:
            doc_role = cls.db.query(Role).filter(Role.name == RoleName.DOCTOR).first()
            if not doc_role:
                doc_role = Role(name=RoleName.DOCTOR, description="Doctor role")
                cls.db.add(doc_role)
                cls.db.commit()

            cls.doc_user1 = User(
                email="doctor1_p7@medimind.com",
                full_name="Dr. Charles Cardiologist P7",
                phone_number="+91999997703",
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
                specialization="Cardiology",
                qualification="MBBS, MD Cardiology",
                experience_years=15,
                consultation_type="BOTH",
                availability_info="Mon-Fri 09:00 AM - 05:00 PM",
                bio="Cardiology specialist.",
            )
            cls.db.add(cls.doc_profile1)
            cls.db.commit()
            cls.db.refresh(cls.doc_profile1)

            cred1 = DoctorCredential(
                doctor_profile_id=cls.doc_profile1.id,
                professional_id="DOC-P7-7001",
                qualification_summary="Certified Cardiologist",
                verification_status=VerificationStatus.VERIFIED,
            )
            cls.db.add(cred1)
            cls.db.commit()

        # 4. Setup Second Doctor User & Profile (for wrong doctor isolation test)
        cls.doc_user2 = cls.db.query(User).filter(User.email == "doctor2_p7@medimind.com").first()
        if not cls.doc_user2:
            doc_role = cls.db.query(Role).filter(Role.name == RoleName.DOCTOR).first()
            cls.doc_user2 = User(
                email="doctor2_p7@medimind.com",
                full_name="Dr. Diana Neurologist P7",
                phone_number="+91999997704",
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
                specialization="Neurology",
                qualification="MBBS, DM Neurology",
                experience_years=12,
                consultation_type="IN_PERSON",
                availability_info="Mon-Thu 10:00 AM - 04:00 PM",
                bio="Neurology specialist.",
            )
            cls.db.add(cls.doc_profile2)
            cls.db.commit()
            cls.db.refresh(cls.doc_profile2)

            cred2 = DoctorCredential(
                doctor_profile_id=cls.doc_profile2.id,
                professional_id="DOC-P7-7002",
                qualification_summary="Certified Neurologist",
                verification_status=VerificationStatus.VERIFIED,
            )
            cls.db.add(cred2)
            cls.db.commit()

        # Generate Access Tokens (sub must be stringified user_id)
        cls.token_patient1 = create_access_token({"sub": str(cls.patient1.id)})
        cls.token_patient2 = create_access_token({"sub": str(cls.patient2.id)})
        cls.token_doctor1 = create_access_token({"sub": str(cls.doc_user1.id)})
        cls.token_doctor2 = create_access_token({"sub": str(cls.doc_user2.id)})

        # Instance state for test chain
        cls.test_appt_id = None
        cls.test_consult_id = None

    @classmethod
    def tearDownClass(cls):
        cls.db.close()

    # 1. Patient Login Verification
    def test_01_patient_login(self):
        res = client.post(
            "/api/v1/auth/login",
            json={"email": "patient1_p7@medimind.com", "password": "PatientPass123!"}
        )
        self.assertEqual(res.status_code, 200)
        self.assertIn("access_token", res.json())

    # 2. Doctor Login Verification
    def test_02_doctor_login(self):
        res = client.post(
            "/api/v1/auth/login",
            json={"email": "doctor1_p7@medimind.com", "password": "DoctorPass123!"}
        )
        self.assertEqual(res.status_code, 200)
        self.assertIn("access_token", res.json())

    # 3. Patient Creates Appointment
    def test_03_patient_creates_appointment(self):
        headers = {"Authorization": f"Bearer {self.token_patient1}"}
        payload = {
            "doctor_profile_id": self.doc_profile1.id,
            "appointment_date": "2026-05-20",
            "appointment_time": "10:30 AM",
            "reason": "Routine Cardiac Checkup & Chest Pain Evaluation"
        }
        res = client.post("/api/v1/appointments", json=payload, headers=headers)
        self.assertEqual(res.status_code, 201)
        data = res.json()
        self.assertEqual(data["status"], "REQUESTED")
        self.assertEqual(data["doctor_profile_id"], self.doc_profile1.id)
        self.assertEqual(data["appointment_time"], "10:30 AM")
        
        TestPhase7AppointmentsConsultations.test_appt_id = data["id"]

    # 4. Patient Retrieves Appointment
    def test_04_patient_retrieves_appointment(self):
        headers = {"Authorization": f"Bearer {self.token_patient1}"}
        
        # List all
        res_list = client.get("/api/v1/appointments", headers=headers)
        self.assertEqual(res_list.status_code, 200)
        appts = res_list.json()
        self.assertTrue(len(appts) >= 1)

        # Single detail lookup
        res_single = client.get(f"/api/v1/appointments/{self.test_appt_id}", headers=headers)
        self.assertEqual(res_single.status_code, 200)
        self.assertEqual(res_single.json()["id"], self.test_appt_id)

    # 5. Doctor Sees Assigned Appointment
    def test_05_doctor_sees_assigned_appointment(self):
        headers = {"Authorization": f"Bearer {self.token_doctor1}"}
        res = client.get("/api/v1/appointments/doctor", headers=headers)
        self.assertEqual(res.status_code, 200)
        appts = res.json()
        self.assertTrue(any(a["id"] == self.test_appt_id for a in appts))

    # 6. Doctor Confirms Appointment
    def test_06_doctor_confirms_appointment(self):
        headers = {"Authorization": f"Bearer {self.token_doctor1}"}
        res = client.post(f"/api/v1/appointments/{self.test_appt_id}/confirm", headers=headers)
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()["status"], "CONFIRMED")

    # 7. Patient Sees Confirmed Status
    def test_07_patient_sees_confirmed_status(self):
        headers = {"Authorization": f"Bearer {self.token_patient1}"}
        res = client.get(f"/api/v1/appointments/{self.test_appt_id}", headers=headers)
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()["status"], "CONFIRMED")

    # 8. Unauthorized Patient Cannot Access Another Patient's Appointment
    def test_08_unauthorized_patient_cannot_access_another_patient_appointment(self):
        headers = {"Authorization": f"Bearer {self.token_patient2}"}
        res = client.get(f"/api/v1/appointments/{self.test_appt_id}", headers=headers)
        self.assertEqual(res.status_code, 403)

    # 9. Wrong Doctor Cannot Modify Appointment
    def test_09_wrong_doctor_cannot_modify_appointment(self):
        headers = {"Authorization": f"Bearer {self.token_doctor2}"}
        res_confirm = client.post(f"/api/v1/appointments/{self.test_appt_id}/confirm", headers=headers)
        self.assertEqual(res_confirm.status_code, 403)

        res_reject = client.post(f"/api/v1/appointments/{self.test_appt_id}/reject", headers=headers)
        self.assertEqual(res_reject.status_code, 403)

    # 10. Doctor Creates Consultation
    def test_10_doctor_creates_consultation(self):
        headers = {"Authorization": f"Bearer {self.token_doctor1}"}
        payload = {
            "symptoms": "Mild shortness of breath during exertion.",
            "diagnosis": "Mild Angina Pectoris",
            "notes": "ECG shows normal sinus rhythm. Blood pressure 125/82 mmHg.",
            "treatment_plan": "Prescribed low-sodium diet and follow-up stress test in 30 days.",
            "consultation_date": "2026-05-20"
        }
        res = client.post(f"/api/v1/appointments/{self.test_appt_id}/consultation", json=payload, headers=headers)
        self.assertEqual(res.status_code, 201)
        data = res.json()
        self.assertEqual(data["diagnosis"], "Mild Angina Pectoris")
        self.assertEqual(data["appointment_id"], self.test_appt_id)

        TestPhase7AppointmentsConsultations.test_consult_id = data["id"]

        # Verify appointment status changed to COMPLETED
        res_appt = client.get(f"/api/v1/appointments/{self.test_appt_id}", headers={"Authorization": f"Bearer {self.token_patient1}"})
        self.assertEqual(res_appt.json()["status"], "COMPLETED")

    # 11. Patient Retrieves Consultation
    def test_11_patient_retrieves_consultation(self):
        headers = {"Authorization": f"Bearer {self.token_patient1}"}
        
        # Single detail lookup
        res_single = client.get(f"/api/v1/consultations/{self.test_consult_id}", headers=headers)
        self.assertEqual(res_single.status_code, 200)
        self.assertEqual(res_single.json()["diagnosis"], "Mild Angina Pectoris")

        # List patient consultations
        res_list = client.get("/api/v1/consultations/patient", headers=headers)
        self.assertEqual(res_list.status_code, 200)
        self.assertTrue(len(res_list.json()) >= 1)

    # 12. Consultation Automatically Creates Health Record
    def test_12_consultation_creates_health_record(self):
        headers = {"Authorization": f"Bearer {self.token_patient1}"}
        res = client.get("/api/v1/health-records", headers=headers)
        self.assertEqual(res.status_code, 200)
        records = res.json()
        self.assertTrue(any("Mild Angina Pectoris" in r["title"] or r["record_type"] == "CONSULTATION" for r in records))

    # 13. In-App Notifications Generated
    def test_13_notification_generated(self):
        # Patient notification check (APPOINTMENT_CONFIRMED, CONSULTATION_COMPLETED)
        res_p = client.get("/api/v1/notifications", headers={"Authorization": f"Bearer {self.token_patient1}"})
        self.assertEqual(res_p.status_code, 200)
        p_notifs = res_p.json()
        self.assertTrue(any("Confirmed" in n["title"] or "Consultation" in n["title"] for n in p_notifs))

        # Doctor notification check (APPOINTMENT_REQUESTED)
        res_d = client.get("/api/v1/notifications", headers={"Authorization": f"Bearer {self.token_doctor1}"})
        self.assertEqual(res_d.status_code, 200)
        d_notifs = res_d.json()
        self.assertTrue(any("Appointment Request" in n["title"] for n in d_notifs))

    # 14. Appointment Cancellation Works
    def test_14_appointment_cancellation_works(self):
        headers_p = {"Authorization": f"Bearer {self.token_patient1}"}
        
        # Create a second appointment to cancel
        payload = {
            "doctor_profile_id": self.doc_profile1.id,
            "appointment_date": "2026-06-10",
            "appointment_time": "02:00 PM",
            "reason": "Follow-up test"
        }
        res_create = client.post("/api/v1/appointments", json=payload, headers=headers_p)
        self.assertEqual(res_create.status_code, 201)
        appt2_id = res_create.json()["id"]

        # Cancel appointment
        res_cancel = client.post(f"/api/v1/appointments/{appt2_id}/cancel", headers=headers_p)
        self.assertEqual(res_cancel.status_code, 200)
        self.assertEqual(res_cancel.json()["status"], "CANCELLED")

        # Verify doctor notification received for cancellation
        res_d = client.get("/api/v1/notifications", headers={"Authorization": f"Bearer {self.token_doctor1}"})
        self.assertTrue(any("Cancelled" in n["title"] for n in res_d.json()))

    # 15. Unauthenticated Requests Blocked
    def test_15_unauthenticated_request_blocked(self):
        res_appts = client.get("/api/v1/appointments")
        self.assertEqual(res_appts.status_code, 401)

        res_consults = client.get("/api/v1/consultations/patient")
        self.assertEqual(res_consults.status_code, 401)

    # 16. Regression suite for Phase 5 & Phase 6
    def test_16_phase5_and_6_regression_passes(self):
        import test_phase5
        import test_phase6
        
        # Execute Phase 5 functional verification suite
        test_phase5.run_tests()

        # Execute Phase 6 unittest suite
        suite6 = unittest.TestLoader().loadTestsFromModule(test_phase6)
        res6 = unittest.TextTestRunner(verbosity=0).run(suite6)
        self.assertTrue(res6.wasSuccessful(), f"Phase 6 regression failures: {len(res6.failures) + len(res6.errors)}")

if __name__ == "__main__":
    unittest.main()

