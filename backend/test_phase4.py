import sys
import os
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

# Setup in-memory SQLite for testing execution environment
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Add current directory to path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app.main import app
from app.db.session import Base, get_db
from app.db.init_db import init_db

# Override get_db dependency
def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

def setup_module(module):
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    init_db(db)
    db.close()

def run_tests():
    print("=" * 75)
    print("HEALTH WALLET — PHASE 4 CONSENT & ACCESS CONTROL VERIFICATION SUITE")
    print("=" * 75)

    # Initialize DB
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    init_db(db)
    db.close()

    # 1. Phase 0 Health Endpoint Regression Test
    print("[TEST 1] Verifying Phase 0 System Health Endpoint...")
    res = client.get("/api/v1/health")
    assert res.status_code == 200
    assert res.json()["status"] == "ok"
    print("  -> Phase 0 Health Check PASSED")

    # 2. Phase 1 Patient Login
    print("\n[TEST 2] Verifying Phase 1 Patient Login...")
    p1_login = client.post("/api/v1/auth/login", json={"email": "patient@medimind.demo", "password": "DemoPassword123!"})
    assert p1_login.status_code == 200
    p1_token = p1_login.json()["access_token"]
    patient_headers = {"Authorization": f"Bearer {p1_token}"}
    print("  -> Patient Login Successful")

    # 3. Phase 1 Doctor Login
    print("\n[TEST 3] Verifying Phase 1 Doctor Login...")
    doc_login = client.post("/api/v1/auth/login", json={"email": "doctor@medimind.demo", "password": "DemoPassword123!"})
    assert doc_login.status_code == 200
    doc_token = doc_login.json()["access_token"]
    doctor_headers = {"Authorization": f"Bearer {doc_token}"}
    print("  -> Doctor Login Successful")

    # 4. Phase 2 Patient Profile Regression Test
    print("\n[TEST 4] Verifying Phase 2 Patient Profile...")
    prof_res = client.get("/api/v1/patient/profile", headers=patient_headers)
    assert prof_res.status_code == 200
    prof_data = prof_res.json()
    assert prof_data["full_name"] == "Demo Patient"
    print("  -> Patient Profile Verified")

    # 5. Phase 2 Synthetic Health Wallet ID Test
    print("\n[TEST 5] Verifying Phase 2 Synthetic Health Wallet ID...")
    patient_hw_id = prof_data["health_wallet_id"]
    assert patient_hw_id.startswith("HW-")
    print(f"  -> Synthetic HW-ID Verified: {patient_hw_id}")

    # 6. Phase 3 Health Record Functionality Regression Test
    print("\n[TEST 6] Verifying Phase 3 Health Records Timeline...")
    records_res = client.get("/api/v1/health-records", headers=patient_headers)
    assert records_res.status_code == 200
    assert len(records_res.json()) >= 4
    print("  -> Health Records Timeline Verified")

    # 7. Phase 4: Healthcare requester can create consent request
    print("\n[TEST 7] Creating Access Request (Doctor -> Patient)...")
    req_payload = {
        "patient_health_wallet_id": patient_hw_id,
        "purpose": "Clinical Evaluation & Treatment Planning",
        "scope": "ALL_HEALTH_RECORDS"
    }
    # First register second patient to test fresh consent request
    p2_reg = client.post("/api/v1/auth/register", json={
        "email": "patient_test4@medimind.demo",
        "password": "Password123!",
        "full_name": "Test Patient 4",
        "phone_number": "+91 99999 44444",
        "role": "PATIENT"
    })
    assert p2_reg.status_code == 201
    p2_token = client.post("/api/v1/auth/login", json={"email": "patient_test4@medimind.demo", "password": "Password123!"}).json()["access_token"]
    p2_headers = {"Authorization": f"Bearer {p2_token}"}
    p2_hw_id = client.get("/api/v1/patient/profile", headers=p2_headers).json()["health_wallet_id"]

    create_req = client.post("/api/v1/consents", json={
        "patient_health_wallet_id": p2_hw_id,
        "purpose": "Oncology Consultation",
        "scope": "LAB_TESTS"
    }, headers=doctor_headers)
    assert create_req.status_code == 201, f"Create consent request failed: {create_req.text}"
    consent_data = create_req.json()
    assert consent_data["status"] == "REQUESTED"
    assert consent_data["scope"] == "LAB_TESTS"
    consent_id = consent_data["id"]
    print(f"  -> Consent Request #{consent_id} Created Successfully")

    # 8. Patient can view own consent
    print("\n[TEST 8] Patient Viewing Own Consents...")
    p2_consents = client.get("/api/v1/consents", headers=p2_headers)
    assert p2_consents.status_code == 200
    p2_list = p2_consents.json()
    assert len(p2_list) == 1
    assert p2_list[0]["id"] == consent_id
    print("  -> Patient View Own Consents Verified")

    # 9. Patient can approve own request
    print(f"\n[TEST 9] Patient Approving Consent #{consent_id}...")
    app_res = client.post(f"/api/v1/consents/{consent_id}/approve", headers=p2_headers)
    assert app_res.status_code == 200
    assert app_res.json()["status"] == "APPROVED"
    assert app_res.json()["responded_at"] is not None
    print("  -> Consent Approval Verified")

    # 10. Approved consent status verified
    print("\n[TEST 10] Verifying APPROVED Consent Status...")
    p2_consents_after = client.get("/api/v1/consents", headers=p2_headers).json()
    assert p2_consents_after[0]["status"] == "APPROVED"
    print("  -> Status is APPROVED")

    # 11. Patient can revoke approved consent
    print(f"\n[TEST 11] Patient Revoking Consent #{consent_id}...")
    rev_res = client.post(f"/api/v1/consents/{consent_id}/revoke", headers=p2_headers)
    assert rev_res.status_code == 200
    assert rev_res.json()["status"] == "REVOKED"
    assert rev_res.json()["revoked_at"] is not None
    print("  -> Consent Revocation Verified")

    # 12. Patient cannot modify another patient's consent
    print("\n[TEST 12] Ownership Security (Patient cannot modify another patient's consent)...")
    # Patient 1 trying to revoke Patient 2's consent
    unauth_mod = client.post(f"/api/v1/consents/{consent_id}/revoke", headers=patient_headers)
    assert unauth_mod.status_code == 403, f"Expected 403, got {unauth_mod.status_code}"
    print("  -> Cross-patient consent modification correctly blocked with 403 Forbidden")

    # 13. Doctor/requester cannot approve patient consent
    print("\n[TEST 13] Requester Security (Doctor cannot approve patient consent)...")
    # Doctor trying to call approve endpoint
    doc_approve = client.post(f"/api/v1/consents/{consent_id}/approve", headers=doctor_headers)
    assert doc_approve.status_code == 403, f"Expected 403 for non-PATIENT role on approve, got {doc_approve.status_code}"
    print("  -> Requester role blocked from approving consent with 403 Forbidden")

    # 14. Non-authorized role blocked from consent endpoints
    print("\n[TEST 14] Role Restrictions (PATIENT role blocked from creating consent request)...")
    pat_create = client.post("/api/v1/consents", json={
        "patient_health_wallet_id": patient_hw_id,
        "purpose": "Self request",
        "scope": "ALL_HEALTH_RECORDS"
    }, headers=patient_headers)
    assert pat_create.status_code == 403, f"Expected 403 for PATIENT creating consent request, got {pat_create.status_code}"
    print("  -> PATIENT role correctly blocked from requesting access with 403 Forbidden")

    # 15. Invalid status transition rejected
    print("\n[TEST 15] Invalid Status Transition Handling...")
    # Trying to approve a REVOKED consent
    inv_transition = client.post(f"/api/v1/consents/{consent_id}/approve", headers=p2_headers)
    assert inv_transition.status_code == 422, f"Expected 422 for REVOKED->APPROVED transition, got {inv_transition.status_code}"
    print("  -> Invalid transition (REVOKED -> APPROVED) correctly rejected with 422 Unprocessable Entity")

    # 16. Invalid scope rejected
    print("\n[TEST 16] Invalid Scope Handling...")
    inv_scope = client.post("/api/v1/consents", json={
        "patient_health_wallet_id": p2_hw_id,
        "purpose": "Test Invalid Scope",
        "scope": "INVALID_SCOPE_STRING"
    }, headers=doctor_headers)
    assert inv_scope.status_code == 422, f"Expected 422 for invalid scope, got {inv_scope.status_code}"
    print("  -> Invalid Scope String correctly rejected with 422 Unprocessable Entity")

    # 17. Duplicate active/requested consent handled correctly
    print("\n[TEST 17] Duplicate Pending/Active Consent Request Handling...")
    # Create request 1
    req1 = client.post("/api/v1/consents", json={
        "patient_health_wallet_id": p2_hw_id,
        "purpose": "First Request",
        "scope": "CONSULTATIONS"
    }, headers=doctor_headers)
    assert req1.status_code == 201

    # Duplicate request for same scope
    dup_req = client.post("/api/v1/consents", json={
        "patient_health_wallet_id": p2_hw_id,
        "purpose": "Duplicate Request",
        "scope": "CONSULTATIONS"
    }, headers=doctor_headers)
    assert dup_req.status_code == 422, f"Expected 422 for duplicate active request, got {dup_req.status_code}"
    print("  -> Duplicate active consent request correctly rejected with 422 Unprocessable Entity")

    # 18. No-consent access denied where protected endpoint exists
    print("\n[TEST 18] No-Consent Access Protection...")
    # Doctor accessing Patient 2 records without approved consent (currently REQUESTED)
    no_consent_access = client.get(f"/api/v1/consents/patient-records/{p2_hw_id}", headers=doctor_headers)
    assert no_consent_access.status_code == 403, f"Expected 403 for no approved consent, got {no_consent_access.status_code}"
    print("  -> Access to patient records without APPROVED consent correctly denied with 403 Forbidden")

    # 19. Approved-consent access succeeds where protected endpoint exists
    print("\n[TEST 19] Approved-Consent Access Success...")
    # Patient 2 approves request 1
    req1_id = req1.json()["id"]
    client.post(f"/api/v1/consents/{req1_id}/approve", headers=p2_headers)

    # Doctor accessing Patient 2 records WITH approved consent
    app_consent_access = client.get(f"/api/v1/consents/patient-records/{p2_hw_id}", headers=doctor_headers)
    assert app_consent_access.status_code == 200, f"Expected 200 with approved consent, got {app_consent_access.status_code}"
    print("  -> Access to patient records WITH APPROVED consent succeeded with 200 OK")

    print("\n" + "=" * 75)
    print("ALL 19 PHASE 4 VERIFICATION TESTS PASSED SUCCESSFULLY! (100% SUCCESS)")
    print("=" * 75)

if __name__ == "__main__":
    run_tests()
