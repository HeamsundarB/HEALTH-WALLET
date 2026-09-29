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
from app.models.hospital_profile import HospitalProfile, HospitalDepartment, DoctorHospitalMapping

client = TestClient(app)

class TestPhase6DoctorHospitalEcosystem(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.db = SessionLocal()

        # 1. Setup Test Doctor User & Role
        cls.doc_user = cls.db.query(User).filter(User.email == "test_doctor_p6@medimind.com").first()
        if not cls.doc_user:
            doc_role = cls.db.query(Role).filter(Role.name == RoleName.DOCTOR).first()
            if not doc_role:
                doc_role = Role(name=RoleName.DOCTOR, description="Doctor role")
                cls.db.add(doc_role)
                cls.db.commit()

            cls.doc_user = User(
                email="test_doctor_p6@medimind.com",
                full_name="Dr. Automated Test Physician",
                phone_number="+919999966601",
                hashed_password=get_password_hash("DoctorPass123!"),
                is_active=True,
                is_verified=True,
            )
            cls.db.add(cls.doc_user)
            cls.db.commit()
            cls.db.refresh(cls.doc_user)

            cls.db.add(UserRole(user_id=cls.doc_user.id, role_id=doc_role.id))
            cls.db.commit()

        # Doctor Profile & Credential Reset/Setup
        cls.doc_profile = cls.db.query(DoctorProfile).filter(DoctorProfile.user_id == cls.doc_user.id).first()
        if not cls.doc_profile:
            cls.doc_profile = DoctorProfile(
                user_id=cls.doc_user.id,
                specialization="Cardiology",
                qualification="MBBS, MD",
                experience_years=10,
                languages="English, Hindi",
                consultation_type="BOTH",
                availability_info="Mon-Fri 09:00 AM - 05:00 PM",
                bio="Automated test physician bio.",
            )
            cls.db.add(cls.doc_profile)
            cls.db.commit()
            cls.db.refresh(cls.doc_profile)
        else:
            cls.doc_profile.specialization = "Cardiology"
            cls.db.commit()

        cls.doc_cred = cls.db.query(DoctorCredential).filter(DoctorCredential.doctor_profile_id == cls.doc_profile.id).first()
        if not cls.doc_cred:
            cls.doc_cred = DoctorCredential(
                doctor_profile_id=cls.doc_profile.id,
                professional_id="DOC-TEST-6001",
                qualification_summary="MD Cardiology Certification",
                verification_status=VerificationStatus.PENDING,
            )
            cls.db.add(cls.doc_cred)
            cls.db.commit()
            cls.db.refresh(cls.doc_cred)
        else:
            cls.doc_cred.verification_status = VerificationStatus.PENDING
            cls.db.commit()

        # 2. Setup Test Hospital Admin User & Role
        cls.hosp_user = cls.db.query(User).filter(User.email == "test_hosp_admin_p6@medimind.com").first()
        if not cls.hosp_user:
            hosp_role = cls.db.query(Role).filter(Role.name == RoleName.HOSPITAL_ADMIN).first()
            if not hosp_role:
                hosp_role = Role(name=RoleName.HOSPITAL_ADMIN, description="Hospital Admin role")
                cls.db.add(hosp_role)
                cls.db.commit()

            cls.hosp_user = User(
                email="test_hosp_admin_p6@medimind.com",
                full_name="Hospital Admin Tester",
                phone_number="+919999966602",
                hashed_password=get_password_hash("HospAdminPass123!"),
                is_active=True,
                is_verified=True,
            )
            cls.db.add(cls.hosp_user)
            cls.db.commit()
            cls.db.refresh(cls.hosp_user)

            cls.db.add(UserRole(user_id=cls.hosp_user.id, role_id=hosp_role.id))
            cls.db.commit()

        # Hospital Profile
        cls.hosp_profile = cls.db.query(HospitalProfile).filter(HospitalProfile.admin_user_id == cls.hosp_user.id).first()
        if not cls.hosp_profile:
            cls.hosp_profile = HospitalProfile(
                admin_user_id=cls.hosp_user.id,
                name="Test City Super Specialty Hospital",
                registration_number="HOSP-REG-TEST-601",
                address="100 Tech Park Way",
                location_city="Pune",
                state="Maharashtra",
                contact_email="contact@testcityhospital.com",
                contact_phone="+912022334455",
                working_hours="24x7 Emergency",
                services_summary="Emergency Care, Cardiac Surgery, Pediatrics",
                verification_status=VerificationStatus.PENDING,
            )
            cls.db.add(cls.hosp_profile)
            cls.db.commit()
            cls.db.refresh(cls.hosp_profile)
        else:
            cls.hosp_profile.verification_status = VerificationStatus.PENDING
            cls.db.commit()

        # 3. Setup Test Patient User & Role
        cls.patient_user = cls.db.query(User).filter(User.email == "test_patient_p6@medimind.com").first()
        if not cls.patient_user:
            patient_role = cls.db.query(Role).filter(Role.name == RoleName.PATIENT).first()
            if not patient_role:
                patient_role = Role(name=RoleName.PATIENT, description="Patient role")
                cls.db.add(patient_role)
                cls.db.commit()

            cls.patient_user = User(
                email="test_patient_p6@medimind.com",
                full_name="Patient Phase 6 Tester",
                phone_number="+919999966603",
                hashed_password=get_password_hash("PatientPass123!"),
                is_active=True,
                is_verified=True,
            )
            cls.db.add(cls.patient_user)
            cls.db.commit()
            cls.db.refresh(cls.patient_user)

            cls.db.add(UserRole(user_id=cls.patient_user.id, role_id=patient_role.id))
            cls.db.commit()

        # 4. Setup Test System Admin User & Role
        cls.admin_user = cls.db.query(User).filter(User.email == "test_sys_admin_p6@medimind.com").first()
        if not cls.admin_user:
            admin_role = cls.db.query(Role).filter(Role.name == RoleName.SYSTEM_ADMIN).first()
            if not admin_role:
                admin_role = Role(name=RoleName.SYSTEM_ADMIN, description="System Admin role")
                cls.db.add(admin_role)
                cls.db.commit()

            cls.admin_user = User(
                email="test_sys_admin_p6@medimind.com",
                full_name="System Admin Phase 6",
                phone_number="+919999966604",
                hashed_password=get_password_hash("SystemAdminPass123!"),
                is_active=True,
                is_verified=True,
            )
            cls.db.add(cls.admin_user)
            cls.db.commit()
            cls.db.refresh(cls.admin_user)

            cls.db.add(UserRole(user_id=cls.admin_user.id, role_id=admin_role.id))
            cls.db.commit()

        # Generate JWT Tokens (sub must be stringified user.id for deps.py)
        cls.doc_token = create_access_token({"sub": str(cls.doc_user.id)})
        cls.hosp_token = create_access_token({"sub": str(cls.hosp_user.id)})
        cls.patient_token = create_access_token({"sub": str(cls.patient_user.id)})
        cls.admin_token = create_access_token({"sub": str(cls.admin_user.id)})

    @classmethod
    def tearDownClass(cls):
        cls.db.close()

    # -------------------------------------------------------------
    # 1. Doctor Profile Endpoints Tests
    # -------------------------------------------------------------
    def test_01_doctor_profile_retrieval(self):
        headers = {"Authorization": f"Bearer {self.doc_token}"}
        res = client.get("/api/v1/doctors/me", headers=headers)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["user_id"], self.doc_user.id)
        self.assertEqual(data["specialization"], "Cardiology")
        self.assertIn("credential", data)
        self.assertEqual(data["credential"]["professional_id"], "DOC-TEST-6001")

    def test_02_doctor_profile_update(self):
        headers = {"Authorization": f"Bearer {self.doc_token}"}
        payload = {
            "bio": "Updated bio for automated testing.",
            "experience_years": 12,
            "languages": "English, Hindi, Marathi",
            "consultation_type": "ONLINE",
        }
        res = client.put("/api/v1/doctors/me", json=payload, headers=headers)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["bio"], "Updated bio for automated testing.")
        self.assertEqual(data["experience_years"], 12)
        self.assertEqual(data["consultation_type"], "ONLINE")

    def test_03_doctor_profile_immutable_fields(self):
        headers = {"Authorization": f"Bearer {self.doc_token}"}
        # Attempt to inject verification status or professional_id in payload
        payload = {
            "specialization": "Neurology",
            "professional_id": "HACKED-ID-123",
            "verification_status": "VERIFIED"
        }
        res = client.put("/api/v1/doctors/me", json=payload, headers=headers)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["specialization"], "Neurology")
        # Ensure verification status remained PENDING and ID remained DOC-TEST-6001
        self.assertEqual(data["credential"]["verification_status"], "PENDING")
        self.assertEqual(data["credential"]["professional_id"], "DOC-TEST-6001")

    def test_04_patient_cannot_update_doctor_profile(self):
        headers = {"Authorization": f"Bearer {self.patient_token}"}
        res = client.get("/api/v1/doctors/me", headers=headers)
        self.assertEqual(res.status_code, 403)

    # -------------------------------------------------------------
    # 2. Hospital Profile & Affiliation Endpoints Tests
    # -------------------------------------------------------------
    def test_05_hospital_profile_retrieval(self):
        headers = {"Authorization": f"Bearer {self.hosp_token}"}
        res = client.get("/api/v1/hospitals/me", headers=headers)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["name"], "Test City Super Specialty Hospital")
        self.assertEqual(data["registration_number"], "HOSP-REG-TEST-601")

    def test_06_hospital_profile_update(self):
        headers = {"Authorization": f"Bearer {self.hosp_token}"}
        payload = {
            "contact_phone": "+912099887766",
            "working_hours": "OPD 08:00 AM - 08:00 PM, 24/7 Trauma",
            "services_summary": "Expanded Intensive Care Units"
        }
        res = client.put("/api/v1/hospitals/me", json=payload, headers=headers)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["contact_phone"], "+912099887766")
        self.assertEqual(data["services_summary"], "Expanded Intensive Care Units")

    def test_07_hospital_add_department(self):
        headers = {"Authorization": f"Bearer {self.hosp_token}"}
        payload = {
            "name": "Cardiology Department",
            "description": "Comprehensive cardiac diagnostics and interventional care."
        }
        res = client.post("/api/v1/hospitals/me/departments", json=payload, headers=headers)
        self.assertEqual(res.status_code, 201)
        data = res.json()
        self.assertEqual(data["name"], "Cardiology Department")

    def test_08_hospital_assign_doctor(self):
        headers = {"Authorization": f"Bearer {self.hosp_token}"}
        payload = {
            "doctor_professional_id": "DOC-TEST-6001",
            "department_name": "Cardiology Department"
        }
        res = client.post("/api/v1/hospitals/me/doctors", json=payload, headers=headers)
        self.assertEqual(res.status_code, 201)
        data = res.json()
        self.assertEqual(data["doctor_name"], "Dr. Automated Test Physician")

    def test_09_assign_nonexistent_doctor_fails(self):
        headers = {"Authorization": f"Bearer {self.hosp_token}"}
        payload = {
            "doctor_professional_id": "NON-EXISTENT-DOC-9999"
        }
        res = client.post("/api/v1/hospitals/me/doctors", json=payload, headers=headers)
        self.assertEqual(res.status_code, 404)

    # -------------------------------------------------------------
    # 3. Provider Search & Discovery Tests
    # -------------------------------------------------------------
    def test_10_search_doctors_unfiltered(self):
        headers = {"Authorization": f"Bearer {self.patient_token}"}
        res = client.get("/api/v1/search/doctors", headers=headers)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertTrue(len(data) >= 1)

    def test_11_search_doctors_filter_by_name(self):
        headers = {"Authorization": f"Bearer {self.patient_token}"}
        res = client.get("/api/v1/search/doctors?name=Automated", headers=headers)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]["full_name"], "Dr. Automated Test Physician")

    def test_12_search_doctors_filter_by_specialization(self):
        headers = {"Authorization": f"Bearer {self.patient_token}"}
        res = client.get("/api/v1/search/doctors?specialization=Neurology", headers=headers)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertTrue(any(d["specialization"] == "Neurology" for d in data))

    def test_13_search_doctors_filter_by_hospital(self):
        headers = {"Authorization": f"Bearer {self.patient_token}"}
        res = client.get("/api/v1/search/doctors?hospital_name=Super Specialty", headers=headers)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertTrue(len(data) >= 1)

    def test_14_search_hospitals_unfiltered(self):
        headers = {"Authorization": f"Bearer {self.patient_token}"}
        res = client.get("/api/v1/search/hospitals", headers=headers)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertTrue(len(data) >= 1)

    def test_15_search_hospitals_filter_by_city(self):
        headers = {"Authorization": f"Bearer {self.patient_token}"}
        res = client.get("/api/v1/search/hospitals?location_city=Pune", headers=headers)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertTrue(len(data) >= 1)
        self.assertEqual(data[0]["location_city"], "Pune")

    # -------------------------------------------------------------
    # 4. Admin Provider Verification Workflow Tests
    # -------------------------------------------------------------
    def test_16_pending_verifications_list_admin_only(self):
        # Patient forbidden
        p_headers = {"Authorization": f"Bearer {self.patient_token}"}
        res_p = client.get("/api/v1/provider-verification/pending", headers=p_headers)
        self.assertEqual(res_p.status_code, 403)

        # Admin allowed
        a_headers = {"Authorization": f"Bearer {self.admin_token}"}
        res_a = client.get("/api/v1/provider-verification/pending", headers=a_headers)
        self.assertEqual(res_a.status_code, 200)
        data = res_a.json()
        self.assertTrue(isinstance(data, list))

    def test_17_admin_approve_doctor_verification(self):
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        payload = {
            "provider_type": "DOCTOR",
            "provider_id": self.doc_profile.id,
            "action": "APPROVE",
            "remarks": "Medical registration verified with council."
        }
        res = client.post("/api/v1/provider-verification/review", json=payload, headers=headers)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["verification_status"], "VERIFIED")

        # Verify doctor status updated in DB
        res_doc = client.get("/api/v1/doctors/me", headers={"Authorization": f"Bearer {self.doc_token}"})
        self.assertEqual(res_doc.json()["credential"]["verification_status"], "VERIFIED")

    def test_18_admin_reject_hospital_verification(self):
        headers = {"Authorization": f"Bearer {self.admin_token}"}
        payload = {
            "provider_type": "HOSPITAL",
            "provider_id": self.hosp_profile.id,
            "action": "REJECT",
            "remarks": "Incomplete registration documentation."
        }
        res = client.post("/api/v1/provider-verification/review", json=payload, headers=headers)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["verification_status"], "REJECTED")

    def test_19_verification_triggers_in_app_notification(self):
        # Verify notification was generated for doc_user
        headers = {"Authorization": f"Bearer {self.doc_token}"}
        res = client.get("/api/v1/notifications", headers=headers)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertTrue(any("VERIFIED" in n["title"] or "Verification" in n["title"] for n in data))

    def test_20_public_lookup_doctor_and_hospital(self):
        headers = {"Authorization": f"Bearer {self.patient_token}"}
        
        # Doctor detail lookup
        res_doc = client.get(f"/api/v1/doctors/{self.doc_profile.id}", headers=headers)
        self.assertEqual(res_doc.status_code, 200)
        self.assertEqual(res_doc.json()["id"], self.doc_profile.id)

        # Hospital detail lookup
        res_hosp = client.get(f"/api/v1/hospitals/{self.hosp_profile.id}", headers=headers)
        self.assertEqual(res_hosp.status_code, 200)
        self.assertEqual(res_hosp.json()["id"], self.hosp_profile.id)

if __name__ == "__main__":
    unittest.main()
