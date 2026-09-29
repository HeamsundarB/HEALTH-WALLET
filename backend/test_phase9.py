import os
import sys
import unittest
from fastapi.testclient import TestClient

# Add current directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.main import app
from app.db.session import SessionLocal
from app.core.security import create_access_token, get_password_hash
from app.models.user import User, Role, UserRole, RoleName
from app.models.doctor_profile import DoctorProfile, DoctorCredential, VerificationStatus
from app.models.conversation import Conversation, ConversationStatus, ConversationType
from app.models.message import Message
from app.models.notification import Notification, NotificationType

from app.db.init_db import init_db

client = TestClient(app)

class TestPhase9SecureChat(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.db = SessionLocal()
        init_db(cls.db)

        # 1. Setup Patient 1
        cls.patient1 = cls.db.query(User).filter(User.email == "patient1_p9@medimind.com").first()
        if not cls.patient1:
            patient_role = cls.db.query(Role).filter(Role.name == RoleName.PATIENT).first()
            if not patient_role:
                patient_role = Role(name=RoleName.PATIENT, description="Patient role")
                cls.db.add(patient_role)
                cls.db.commit()

            cls.patient1 = User(
                email="patient1_p9@medimind.com",
                full_name="Alice Patient P9",
                phone_number="+91999999901",
                hashed_password=get_password_hash("PatientPass123!"),
                is_active=True,
                is_verified=True,
            )
            cls.db.add(cls.patient1)
            cls.db.commit()
            cls.db.refresh(cls.patient1)

            cls.db.add(UserRole(user_id=cls.patient1.id, role_id=patient_role.id))
            cls.db.commit()

        # 2. Setup Patient 2 (Isolation testing)
        cls.patient2 = cls.db.query(User).filter(User.email == "patient2_p9@medimind.com").first()
        if not cls.patient2:
            patient_role = cls.db.query(Role).filter(Role.name == RoleName.PATIENT).first()
            cls.patient2 = User(
                email="patient2_p9@medimind.com",
                full_name="Bob Patient P9",
                phone_number="+91999999902",
                hashed_password=get_password_hash("PatientPass123!"),
                is_active=True,
                is_verified=True,
            )
            cls.db.add(cls.patient2)
            cls.db.commit()
            cls.db.refresh(cls.patient2)

            cls.db.add(UserRole(user_id=cls.patient2.id, role_id=patient_role.id))
            cls.db.commit()

        # 3. Setup Doctor 1 (Assigned Doctor)
        cls.doc_user1 = cls.db.query(User).filter(User.email == "doctor1_p9@medimind.com").first()
        if not cls.doc_user1:
            doc_role = cls.db.query(Role).filter(Role.name == RoleName.DOCTOR).first()
            if not doc_role:
                doc_role = Role(name=RoleName.DOCTOR, description="Doctor role")
                cls.db.add(doc_role)
                cls.db.commit()

            cls.doc_user1 = User(
                email="doctor1_p9@medimind.com",
                full_name="Dr. Charles Physician P9",
                phone_number="+91999999903",
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
                experience_years=10,
                consultation_type="BOTH",
                availability_info="Mon-Fri 09:00 AM - 05:00 PM",
                bio="Primary care physician.",
            )
            cls.db.add(cls.doc_profile1)
            cls.db.commit()
            cls.db.refresh(cls.doc_profile1)

            cred1 = DoctorCredential(
                doctor_profile_id=cls.doc_profile1.id,
                professional_id="DOC-P9-9001",
                qualification_summary="Certified Doctor P9",
                verification_status=VerificationStatus.VERIFIED,
            )
            cls.db.add(cred1)
            cls.db.commit()

        # 4. Setup Doctor 2 (Unauthorized Doctor)
        cls.doc_user2 = cls.db.query(User).filter(User.email == "doctor2_p9@medimind.com").first()
        if not cls.doc_user2:
            doc_role = cls.db.query(Role).filter(Role.name == RoleName.DOCTOR).first()
            cls.doc_user2 = User(
                email="doctor2_p9@medimind.com",
                full_name="Dr. Diana Unauthorized P9",
                phone_number="+91999999904",
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
                specialization="Orthopedics",
                qualification="MBBS, MS Ortho",
                experience_years=12,
                consultation_type="IN_PERSON",
                availability_info="Mon-Thu 10:00 AM - 04:00 PM",
                bio="Orthopedic specialist.",
            )
            cls.db.add(cls.doc_profile2)
            cls.db.commit()
            cls.db.refresh(cls.doc_profile2)

        # Tokens
        cls.token_patient1 = create_access_token({"sub": str(cls.patient1.id)})
        cls.token_patient2 = create_access_token({"sub": str(cls.patient2.id)})
        cls.token_doctor1 = create_access_token({"sub": str(cls.doc_user1.id)})
        cls.token_doctor2 = create_access_token({"sub": str(cls.doc_user2.id)})

        # Instance state
        cls.test_conv_id = None
        cls.test_msg_id = None

    @classmethod
    def tearDownClass(cls):
        cls.db.close()

    # 1. Patient Auth Check
    def test_01_patient_auth(self):
        res = client.post("/api/v1/auth/login", json={"email": "patient1_p9@medimind.com", "password": "PatientPass123!"})
        self.assertEqual(res.status_code, 200)

    # 2. Doctor Auth Check
    def test_02_doctor_auth(self):
        res = client.post("/api/v1/auth/login", json={"email": "doctor1_p9@medimind.com", "password": "DoctorPass123!"})
        self.assertEqual(res.status_code, 200)

    # 3. Patient Creates Conversation
    def test_03_patient_creates_conversation(self):
        headers = {"Authorization": f"Bearer {self.token_patient1}"}
        payload = {
            "doctor_profile_id": self.doc_profile1.id,
            "conversation_type": "GENERAL",
            "initial_message": "Hello Dr. Charles, I have a question."
        }
        res = client.post("/api/v1/conversations", json=payload, headers=headers)
        self.assertEqual(res.status_code, 201)
        data = res.json()
        self.assertEqual(data["patient_user_id"], self.patient1.id)
        self.assertEqual(data["doctor_profile_id"], self.doc_profile1.id)
        self.assertEqual(data["status"], "ACTIVE")

        TestPhase9SecureChat.test_conv_id = data["id"]

    # 4. Patient Retrieves Conversation
    def test_04_patient_retrieves_conversation(self):
        headers = {"Authorization": f"Bearer {self.token_patient1}"}
        res = client.get(f"/api/v1/conversations/{self.test_conv_id}", headers=headers)
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()["id"], self.test_conv_id)

    # 5. Doctor Retrieves Authorized Conversation
    def test_05_doctor_retrieves_authorized_conversation(self):
        headers = {"Authorization": f"Bearer {self.token_doctor1}"}
        res = client.get("/api/v1/conversations", headers=headers)
        self.assertEqual(res.status_code, 200)
        convs = res.json()
        self.assertTrue(any(c["id"] == self.test_conv_id for c in convs))

    # 6. Patient Sends Message
    def test_06_patient_sends_message(self):
        headers = {"Authorization": f"Bearer {self.token_patient1}"}
        payload = {"message_text": "What is the recommended dosage for my medication?"}
        res = client.post(f"/api/v1/conversations/{self.test_conv_id}/messages", json=payload, headers=headers)
        self.assertEqual(res.status_code, 201)
        data = res.json()
        self.assertEqual(data["message_text"], "What is the recommended dosage for my medication?")
        self.assertFalse(data["is_read"])

        TestPhase9SecureChat.test_msg_id = data["id"]

    # 7. Doctor Receives Message
    def test_07_doctor_receives_message(self):
        headers = {"Authorization": f"Bearer {self.token_doctor1}"}
        res = client.get(f"/api/v1/conversations/{self.test_conv_id}/messages", headers=headers)
        self.assertEqual(res.status_code, 200)
        msgs = res.json()
        self.assertTrue(any(m["id"] == self.test_msg_id for m in msgs))

    # 8. Doctor Replies
    def test_08_doctor_replies(self):
        headers = {"Authorization": f"Bearer {self.token_doctor1}"}
        payload = {"message_text": "Hello Alice, please take 1 tablet after breakfast."}
        res = client.post(f"/api/v1/conversations/{self.test_conv_id}/messages", json=payload, headers=headers)
        self.assertEqual(res.status_code, 201)
        self.assertEqual(res.json()["message_text"], "Hello Alice, please take 1 tablet after breakfast.")

    # 9. Patient Receives Reply
    def test_09_patient_receives_reply(self):
        headers = {"Authorization": f"Bearer {self.token_patient1}"}
        res = client.get(f"/api/v1/conversations/{self.test_conv_id}/messages", headers=headers)
        self.assertEqual(res.status_code, 200)
        msgs = res.json()
        self.assertTrue(any("tablet after breakfast" in m["message_text"] for m in msgs))

    # 10. Message Read Status Works
    def test_10_message_read_status_works(self):
        headers = {"Authorization": f"Bearer {self.token_doctor1}"}
        res = client.post(f"/api/v1/messages/{self.test_msg_id}/read", headers=headers)
        self.assertEqual(res.status_code, 200)
        self.assertTrue(res.json()["is_read"])

    # 11. Conversation Unread Count Works
    def test_11_conversation_unread_count_works(self):
        headers = {"Authorization": f"Bearer {self.token_patient1}"}
        res = client.get(f"/api/v1/conversations/{self.test_conv_id}", headers=headers)
        self.assertEqual(res.status_code, 200)
        self.assertIn("unread_count", res.json())

    # 12. NEW_MESSAGE Notification Created
    def test_12_new_message_notification_created(self):
        headers = {"Authorization": f"Bearer {self.token_doctor1}"}
        res = client.get("/api/v1/notifications", headers=headers)
        self.assertEqual(res.status_code, 200)
        notifs = res.json()
        self.assertTrue(any("Message" in n["title"] or n["notification_type"] == "NEW_MESSAGE" for n in notifs))

    # 13. Patient A Cannot Access Patient B Conversation (403 Forbidden)
    def test_13_patient_a_cannot_access_patient_b_conversation(self):
        headers = {"Authorization": f"Bearer {self.token_patient2}"}
        res = client.get(f"/api/v1/conversations/{self.test_conv_id}", headers=headers)
        self.assertEqual(res.status_code, 403)

    # 14. Unauthorized Message Access Blocked (403 Forbidden)
    def test_14_unauthorized_message_access_blocked(self):
        headers = {"Authorization": f"Bearer {self.token_doctor2}"}
        res = client.get(f"/api/v1/conversations/{self.test_conv_id}/messages", headers=headers)
        self.assertEqual(res.status_code, 403)

    # 15. Unauthenticated Access Blocked (401 Unauthorized)
    def test_15_unauthenticated_access_blocked(self):
        res = client.get("/api/v1/conversations")
        self.assertEqual(res.status_code, 401)

    # 16. Phase 5 Regression Suite
    def test_16_phase5_regression(self):
        import test_phase5
        test_phase5.run_tests()

    # 17. Phase 6 Regression Suite
    def test_17_phase6_regression(self):
        import test_phase6
        suite6 = unittest.TestLoader().loadTestsFromModule(test_phase6)
        res6 = unittest.TextTestRunner(verbosity=0).run(suite6)
        self.assertTrue(res6.wasSuccessful(), f"Phase 6 regression failures: {len(res6.failures) + len(res6.errors)}")

    # 18. Phase 7 Regression Suite
    def test_18_phase7_regression(self):
        import test_phase7
        suite7 = unittest.TestLoader().loadTestsFromModule(test_phase7)
        res7 = unittest.TextTestRunner(verbosity=0).run(suite7)
        self.assertTrue(res7.wasSuccessful(), f"Phase 7 regression failures: {len(res7.failures) + len(res7.errors)}")

    # 19. Phase 8 Regression Suite
    def test_19_phase8_regression(self):
        import test_phase8
        suite8 = unittest.TestLoader().loadTestsFromModule(test_phase8)
        res8 = unittest.TextTestRunner(verbosity=0).run(suite8)
        self.assertTrue(res8.wasSuccessful(), f"Phase 8 regression failures: {len(res8.failures) + len(res8.errors)}")

if __name__ == "__main__":
    unittest.main()
