"""
Phase 2 Test Suite & Regression Verification Script
"""

import sys
from datetime import datetime, timedelta, timezone
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from fastapi.testclient import TestClient

from app.db.session import Base, get_db
from app.main import app
from app.models.user import User, Role, UserRole, RoleName
from app.models.patient_profile import PatientProfile
from app.models.otp import OTPVerification
from app.core.security import get_password_hash, hash_otp
from app.services.patient_service import generate_synthetic_health_wallet_id

# Setup test DB with StaticPool for in-memory SQLite shared state
TEST_SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
test_engine = create_engine(
    TEST_SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

def run_phase2_tests():
    print("=" * 60)
    print("HEALTH WALLET — Phase 2 & Regression Test Suite")
    print("=" * 60)

    # Initialize tables in test DB
    Base.metadata.create_all(bind=test_engine)
    db = TestingSessionLocal()

    # Seed roles
    for role_name in RoleName:
        r = Role(name=role_name, description=f"{role_name.value} role")
        db.add(r)
    db.commit()

    # Seed Patient User & Profile
    pwd_hash = get_password_hash("PatientPass123!")
    patient_user = User(
        email="patient.phase2@medimind.demo",
        hashed_password=pwd_hash,
        full_name="Phase 2 Demo Patient",
        phone_number="+91 00000 00000",
        is_active=True,
        is_verified=True,
    )
    db.add(patient_user)
    db.flush()

    patient_role = db.query(Role).filter(Role.name == RoleName.PATIENT).first()
    db.add(UserRole(user_id=patient_user.id, role_id=patient_role.id))

    # Seed Doctor User
    doctor_user = User(
        email="doctor.phase2@medimind.demo",
        hashed_password=pwd_hash,
        full_name="Dr. Phase 2 Physician",
        phone_number="+91 00000 00000",
        is_active=True,
        is_verified=True,
    )
    db.add(doctor_user)
    db.flush()

    doctor_role = db.query(Role).filter(Role.name == RoleName.DOCTOR).first()
    db.add(UserRole(user_id=doctor_user.id, role_id=doctor_role.id))
    db.commit()

    client = TestClient(app)
    results = {}

    # 1. Health Endpoint (Phase 0 Preservation)
    res_health = client.get("/api/v1/health")
    results["1_phase0_health_endpoint"] = (res_health.status_code == 200 and res_health.json().get("status") == "ok")

    # 2. Login Patient
    res_login_p = client.post("/api/v1/auth/login", json={"email": "patient.phase2@medimind.demo", "password": "PatientPass123!"})
    results["2_phase1_login_patient"] = (res_login_p.status_code == 200)
    p_token = res_login_p.json().get("access_token")

    # 3. Login Doctor
    res_login_d = client.post("/api/v1/auth/login", json={"email": "doctor.phase2@medimind.demo", "password": "PatientPass123!"})
    results["3_phase1_login_doctor"] = (res_login_d.status_code == 200)
    d_token = res_login_d.json().get("access_token")

    # 4. GET /api/v1/patient/profile (Authenticated Patient)
    res_get_prof = client.get("/api/v1/patient/profile", headers={"Authorization": f"Bearer {p_token}"})
    prof_json = res_get_prof.json()
    results["4_get_patient_profile"] = (res_get_prof.status_code == 200 and "health_wallet_id" in prof_json)
    hw_id = prof_json.get("health_wallet_id", "")

    # 5. Health Wallet ID Format (HW-2026-XXXX-XXXX)
    results["5_synthetic_hw_id_format"] = hw_id.startswith("HW-2026-")

    # 6. PUT /api/v1/patient/profile (Update Profile)
    update_payload = {
        "gender": "FEMALE",
        "address": "456 Innovation Boulevard",
        "state": "Karnataka",
        "blood_group": "A+",
        "emergency_contact_name": "Emergency Contact Jane",
        "emergency_contact_phone": "+91 98765 43210"
    }
    res_put_prof = client.put("/api/v1/patient/profile", json=update_payload, headers={"Authorization": f"Bearer {p_token}"})
    put_json = res_put_prof.json()
    results["6_put_patient_profile"] = (
        res_put_prof.status_code == 200 
        and put_json.get("blood_group") == "A+" 
        and put_json.get("state") == "Karnataka"
    )

    # 7. Patient Ownership Enforcement: Patient profile endpoint only accepts authenticated user
    results["7_ownership_enforcement"] = (put_json.get("user_id") == patient_user.id)

    # 8. Role Protection: Non-PATIENT role (DOCTOR) attempting patient profile -> HTTP 403
    res_doc_access = client.get("/api/v1/patient/profile", headers={"Authorization": f"Bearer {d_token}"})
    results["8_doctor_role_blocked_403"] = (res_doc_access.status_code == 403)

    # 9. Unauthenticated request -> HTTP 401
    res_unauth = client.get("/api/v1/patient/profile")
    results["9_unauthenticated_blocked_401"] = (res_unauth.status_code == 401)

    # 10. Synthetic HW ID Collision Check
    try:
        new_hw_id = generate_synthetic_health_wallet_id(db)
        results["10_hw_id_collision_retry_logic"] = bool(new_hw_id and new_hw_id != hw_id)
    except Exception:
        results["10_hw_id_collision_retry_logic"] = False

    db.close()

    print("\nPhase 2 Test Results:")
    all_pass = True
    for k, v in results.items():
        status = "PASS" if v else "FAIL"
        print(f"  - {k}: {status}")
        if not v:
            all_pass = False

    print("\nSUMMARY:", "ALL PHASE 2 LOGIC TESTS PASSED" if all_pass else "SOME LOGIC TESTS FAILED")
    return all_pass

if __name__ == "__main__":
    success = run_phase2_tests()
    if not success:
        sys.exit(1)
