import sys
import os
from datetime import datetime, timedelta
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

# Setup in-memory SQLite engine for fast verification runner
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
from app.models.consent import Consent, ConsentStatus, ConsentScope, ConsentPurpose

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
    print("=" * 80)
    print("HEALTH WALLET — PHASE 10 CONSENT & ACCESS CONTROL VERIFICATION SUITE")
    print("=" * 80)

    # Re-init fresh DB
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    init_db(db)
    db.close()

    # Logins
    pat_a_login = client.post("/api/v1/auth/login", json={"email": "patient@medimind.demo", "password": "DemoPassword123!"})
    assert pat_a_login.status_code == 200
    token_pat_a = pat_a_login.json()["access_token"]
    headers_pat_a = {"Authorization": f"Bearer {token_pat_a}"}

    doc_login = client.post("/api/v1/auth/login", json={"email": "doctor@medimind.demo", "password": "DemoPassword123!"})
    assert doc_login.status_code == 200
    token_doc = doc_login.json()["access_token"]
    headers_doc = {"Authorization": f"Bearer {token_doc}"}

    # Register Patient B
    p_b_reg = client.post("/api/v1/auth/register", json={
        "email": "patient_b@medimind.demo",
        "password": "Password123!",
        "full_name": "Patient B",
        "phone_number": "+91 99999 00002",
        "role": "PATIENT"
    })
    assert p_b_reg.status_code == 201
    token_pat_b = client.post("/api/v1/auth/login", json={"email": "patient_b@medimind.demo", "password": "Password123!"}).json()["access_token"]
    headers_pat_b = {"Authorization": f"Bearer {token_pat_b}"}

    hw_id_a = client.get("/api/v1/patient/profile", headers=headers_pat_a).json()["health_wallet_id"]
    hw_id_b = client.get("/api/v1/patient/profile", headers=headers_pat_b).json()["health_wallet_id"]

    # Helper function to register a doctor and get headers
    def make_doctor(email_prefix: str):
        email = f"{email_prefix}@medimind.demo"
        client.post("/api/v1/auth/register", json={
            "email": email, "password": "Password123!", "full_name": f"Dr. {email_prefix}", "phone_number": "+91 99999 88888", "role": "DOCTOR"
        })
        tok = client.post("/api/v1/auth/login", json={"email": email, "password": "Password123!"}).json()["access_token"]
        return email, {"Authorization": f"Bearer {tok}"}

    # 1. Patient can access own health records
    print("\n[TEST 1] Verifying Patient A can access own health records...")
    res1 = client.get("/api/v1/health-records", headers=headers_pat_a)
    assert res1.status_code == 200
    assert len(res1.json()) >= 4
    print("  -> PASS: Patient A retrieved own records.")

    # 2. Patient A cannot access Patient B records
    print("\n[TEST 2] Verifying Patient A cannot access Patient B records...")
    res2 = client.get(f"/api/v1/consents/patient-records/{hw_id_b}", headers=headers_pat_a)
    assert res2.status_code in [403, 401]
    print("  -> PASS: Cross-patient record access blocked (403 Forbidden).")

    # 3. Doctor can request consent
    print("\n[TEST 3] Doctor requesting consent from Patient B...")
    res3 = client.post("/api/v1/consents", json={
        "patient_health_wallet_id": hw_id_b,
        "purpose": "Consultation & Lab Review",
        "scope": "LAB_TESTS"
    }, headers=headers_doc)
    assert res3.status_code == 201
    consent_b_id = res3.json()["id"]
    assert res3.json()["status"] in ["REQUESTED", "PENDING"]
    print(f"  -> PASS: Doctor created consent request #{consent_b_id}.")

    # 4. Patient B can approve consent
    print(f"\n[TEST 4] Patient B approving consent #{consent_b_id}...")
    res4 = client.post(f"/api/v1/consents/{consent_b_id}/approve", headers=headers_pat_b)
    assert res4.status_code == 200
    assert res4.json()["status"] in ["APPROVED", "ACTIVE"]
    print("  -> PASS: Patient B approved consent.")

    # 5. Approved consent becomes active
    print(f"\n[TEST 5] Verifying approved consent status is ACTIVE/APPROVED...")
    res5 = client.get(f"/api/v1/consents/{consent_b_id}", headers=headers_pat_b)
    assert res5.status_code == 200
    assert res5.json()["status"] in ["APPROVED", "ACTIVE"]
    print("  -> PASS: Approved consent is ACTIVE.")

    # 6. Doctor can access permitted scope (LAB_TESTS)
    print("\n[TEST 6] Doctor accessing Patient B permitted records...")
    res6 = client.get(f"/api/v1/consents/patient-records/{hw_id_b}", headers=headers_doc)
    assert res6.status_code == 200
    print("  -> PASS: Doctor accessed permitted scope records.")

    # 7. Doctor without consent is denied (on fresh Patient C)
    print("\n[TEST 7] Verifying Doctor access without consent is denied...")
    client.post("/api/v1/auth/register", json={
        "email": "patient_c@medimind.demo", "password": "Password123!", "full_name": "Patient C", "phone_number": "+91 99999 00003", "role": "PATIENT"
    })
    token_c = client.post("/api/v1/auth/login", json={"email": "patient_c@medimind.demo", "password": "Password123!"}).json()["access_token"]
    hw_id_c = client.get("/api/v1/patient/profile", headers={"Authorization": f"Bearer {token_c}"}).json()["health_wallet_id"]
    res7 = client.get(f"/api/v1/consents/patient-records/{hw_id_c}", headers=headers_doc)
    assert res7.status_code == 403
    print("  -> PASS: Access without consent denied with 403 Forbidden.")

    # 8. Wrong scope is denied
    print("\n[TEST 8] Verifying wrong scope is denied...")
    doc8_email, doc8_hdr = make_doctor("doctor_scope")
    c8_id = client.post("/api/v1/consents", json={
        "patient_health_wallet_id": hw_id_b, "purpose": "Lab evaluation", "scope": "LAB_TESTS"
    }, headers=doc8_hdr).json()["id"]
    client.post(f"/api/v1/consents/{c8_id}/approve", headers=headers_pat_b)

    db_session = TestingSessionLocal()
    from app.services.access_service import AccessEnforcementService
    from app.models.user import User
    doc8_u = db_session.query(User).filter(User.email == doc8_email).first()
    pat_b_u = db_session.query(User).filter(User.email == "patient_b@medimind.demo").first()

    scope_failed = False
    try:
        AccessEnforcementService.check_patient_data_access(
            db=db_session, requester_user=doc8_u, target_patient_user_id=pat_b_u.id, requested_scope=ConsentScope.PRESCRIPTIONS
        )
    except Exception as e:
        assert getattr(e, "status_code", None) == 403
        scope_failed = True
    assert scope_failed
    db_session.close()
    print("  -> PASS: Access with wrong scope correctly denied with 403 Forbidden.")

    # 9. Expired consent is denied
    print("\n[TEST 9] Verifying expired consent is denied...")
    doc9_email, doc9_hdr = make_doctor("doctor_exp")
    c9_id = client.post("/api/v1/consents", json={
        "patient_health_wallet_id": hw_id_b,
        "purpose": "Temporary Review",
        "scope": "ALL_HEALTH_RECORDS",
        "expires_at": (datetime.utcnow() - timedelta(days=1)).isoformat()
    }, headers=doc9_hdr).json()["id"]
    client.post(f"/api/v1/consents/{c9_id}/approve", headers=headers_pat_b)

    db_session = TestingSessionLocal()
    doc9_u = db_session.query(User).filter(User.email == doc9_email).first()
    exp_failed = False
    try:
        AccessEnforcementService.check_patient_data_access(
            db=db_session, requester_user=doc9_u, target_patient_user_id=pat_b_u.id
        )
    except Exception as e:
        assert getattr(e, "status_code", None) == 403
        exp_failed = True
    assert exp_failed
    db_session.close()
    print("  -> PASS: Expired consent correctly denied with 403 Forbidden.")

    # 10. Revoked consent is denied
    print("\n[TEST 10] Verifying revoked consent is denied...")
    doc10_email, doc10_hdr = make_doctor("doctor_rev")
    c10_id = client.post("/api/v1/consents", json={
        "patient_health_wallet_id": hw_id_b, "purpose": "Followup", "scope": "ALL_HEALTH_RECORDS"
    }, headers=doc10_hdr).json()["id"]
    client.post(f"/api/v1/consents/{c10_id}/approve", headers=headers_pat_b)
    # Revoke
    client.post(f"/api/v1/consents/{c10_id}/revoke", headers=headers_pat_b)

    db_session = TestingSessionLocal()
    doc10_u = db_session.query(User).filter(User.email == doc10_email).first()
    rev_failed = False
    try:
        AccessEnforcementService.check_patient_data_access(
            db=db_session, requester_user=doc10_u, target_patient_user_id=pat_b_u.id
        )
    except Exception as e:
        assert getattr(e, "status_code", None) == 403
        rev_failed = True
    assert rev_failed
    db_session.close()
    print("  -> PASS: Revoked consent correctly denied with 403 Forbidden.")

    # 11. Rejected consent is denied
    print("\n[TEST 11] Verifying rejected consent is denied...")
    doc11_email, doc11_hdr = make_doctor("doctor_rej")
    c11_id = client.post("/api/v1/consents", json={
        "patient_health_wallet_id": hw_id_b, "purpose": "Second Opinion", "scope": "ALL_HEALTH_RECORDS"
    }, headers=doc11_hdr).json()["id"]
    client.post(f"/api/v1/consents/{c11_id}/reject", headers=headers_pat_b)

    db_session = TestingSessionLocal()
    doc11_u = db_session.query(User).filter(User.email == doc11_email).first()
    rej_failed = False
    try:
        AccessEnforcementService.check_patient_data_access(
            db=db_session, requester_user=doc11_u, target_patient_user_id=pat_b_u.id
        )
    except Exception as e:
        assert getattr(e, "status_code", None) == 403
        rej_failed = True
    assert rej_failed
    db_session.close()
    print("  -> PASS: Rejected consent correctly denied with 403 Forbidden.")

    # 12. Purpose mismatch is denied
    print("\n[TEST 12] Verifying purpose mismatch is denied...")
    doc12_email, doc12_hdr = make_doctor("doctor_purp")
    c12_id = client.post("/api/v1/consents", json={
        "patient_health_wallet_id": hw_id_b, "purpose": "ONCOLOGY_EVALUATION", "scope": "ALL_HEALTH_RECORDS"
    }, headers=doc12_hdr).json()["id"]
    client.post(f"/api/v1/consents/{c12_id}/approve", headers=headers_pat_b)

    db_session = TestingSessionLocal()
    doc12_u = db_session.query(User).filter(User.email == doc12_email).first()
    purp_failed = False
    try:
        AccessEnforcementService.check_patient_data_access(
            db=db_session, requester_user=doc12_u, target_patient_user_id=pat_b_u.id, requested_purpose="CARDIOLOGY_REVIEW"
        )
    except Exception as e:
        assert getattr(e, "status_code", None) == 403
        purp_failed = True
    assert purp_failed
    db_session.close()
    print("  -> PASS: Purpose mismatch correctly denied with 403 Forbidden.")

    # 13. Sensitive permission is enforced
    print("\n[TEST 13] Verifying sensitive data permission is enforced...")
    doc13_email, doc13_hdr = make_doctor("doctor_sens")
    c13_id = client.post("/api/v1/consents", json={
        "patient_health_wallet_id": hw_id_b, "purpose": "GENERAL_HEALTHCARE", "scope": "ALL_HEALTH_RECORDS", "sensitive_data_allowed": False
    }, headers=doc13_hdr).json()["id"]
    client.post(f"/api/v1/consents/{c13_id}/approve", headers=headers_pat_b)

    db_session = TestingSessionLocal()
    doc13_u = db_session.query(User).filter(User.email == doc13_email).first()
    sens_failed = False
    try:
        AccessEnforcementService.check_patient_data_access(
            db=db_session, requester_user=doc13_u, target_patient_user_id=pat_b_u.id, require_sensitive=True
        )
    except Exception as e:
        assert getattr(e, "status_code", None) == 403
        sens_failed = True
    assert sens_failed
    db_session.close()
    print("  -> PASS: Sensitive permission requirement enforced with 403 Forbidden.")

    # 14. Unauthorized user cannot approve someone else's consent
    print("\n[TEST 14] Verifying cross-patient consent approval is blocked...")
    c_unauth = client.post("/api/v1/consents", json={
        "patient_health_wallet_id": hw_id_b, "purpose": "Check", "scope": "ALL_HEALTH_RECORDS"
    }, headers=doc8_hdr).json()["id"]

    res14 = client.post(f"/api/v1/consents/{c_unauth}/approve", headers=headers_pat_a)
    assert res14.status_code == 403
    print("  -> PASS: Patient A cannot approve Patient B consent (403 Forbidden).")

    # 15. Unauthorized user cannot revoke someone else's consent
    print("\n[TEST 15] Verifying cross-patient consent revocation is blocked...")
    res15 = client.post(f"/api/v1/consents/{consent_b_id}/revoke", headers=headers_pat_a)
    assert res15.status_code == 403
    print("  -> PASS: Patient A cannot revoke Patient B consent (403 Forbidden).")

    # 16. Unauthenticated protected access returns 401
    print("\n[TEST 16] Verifying unauthenticated access returns 401...")
    res16 = client.get("/api/v1/consents")
    assert res16.status_code == 401
    print("  -> PASS: Unauthenticated access rejected with 401 Unauthorized.")

    print("\n" + "=" * 80)
    print("ALL 16 PHASE 10 VERIFICATION TESTS PASSED SUCCESSFULLY! (100% SUCCESS)")
    print("=" * 80)

if __name__ == "__main__":
    run_tests()
