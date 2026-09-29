import sys
import os
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

# Setup in-memory SQLite for testing
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
    print("=" * 70)
    print("HEALTH WALLET — PHASE 3 AUTOMATED VERIFICATION TEST SUITE")
    print("=" * 70)

    # Initialize DB
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    init_db(db)
    db.close()

    # 1. Phase 0 Health Endpoint Regression Test
    print("[TEST 1] Verifying Phase 0 System Health Endpoint...")
    res = client.get("/api/v1/health")
    assert res.status_code == 200, f"Expected 200, got {res.status_code}"
    health_data = res.json()
    assert health_data["status"] == "ok"
    assert health_data["service"] == "health-wallet-backend"
    print("  -> Phase 0 Health Check PASSED:", health_data["status"])

    # 2. Phase 1 Authentication & Role Login
    print("\n[TEST 2] Verifying Phase 1 Patient Login...")
    login_res = client.post(
        "/api/v1/auth/login",
        json={"email": "patient@medimind.demo", "password": "DemoPassword123!"}
    )
    assert login_res.status_code == 200, f"Patient login failed: {login_res.text}"
    patient_token = login_res.json()["access_token"]
    patient_headers = {"Authorization": f"Bearer {patient_token}"}
    print("  -> Patient Login Successful. JWT Token acquired.")

    # 3. Phase 2 Patient Profile Regression Test
    print("\n[TEST 3] Verifying Phase 2 Patient Profile & Synthetic Health Wallet ID...")
    prof_res = client.get("/api/v1/patient/profile", headers=patient_headers)
    assert prof_res.status_code == 200, f"Profile endpoint failed: {prof_res.text}"
    prof_data = prof_res.json()
    assert prof_data["health_wallet_id"].startswith("HW-")
    print("  -> Synthetic Health Wallet ID verified:", prof_data["health_wallet_id"])

    # 4. Phase 3 GET /api/v1/health-records (List Seeded Records)
    print("\n[TEST 4] Listing Patient Chronological Health Records...")
    records_res = client.get("/api/v1/health-records", headers=patient_headers)
    assert records_res.status_code == 200, f"List records failed: {records_res.text}"
    records = records_res.json()
    assert len(records) >= 4, f"Expected at least 4 seeded records, got {len(records)}"
    print(f"  -> Found {len(records)} seeded chronological records for patient.")

    # 5. Phase 3 Filtering & Search Test
    print("\n[TEST 5] Verifying Controlled Record Type Filtering & Search...")
    filter_res = client.get("/api/v1/health-records?record_type=CONSULTATION", headers=patient_headers)
    assert filter_res.status_code == 200
    consultations = filter_res.json()
    assert all(r["record_type"] == "CONSULTATION" for r in consultations)
    print(f"  -> Record Type Filter (CONSULTATION) returned {len(consultations)} record(s).")

    search_res = client.get("/api/v1/health-records?search=Wellness", headers=patient_headers)
    assert search_res.status_code == 200
    search_records = search_res.json()
    assert len(search_records) >= 1
    print(f"  -> Search Query ('Wellness') returned {len(search_records)} matching record(s).")

    # 6. Phase 3 POST /api/v1/health-records (Create Record)
    print("\n[TEST 6] Creating New Synthetic Health Record...")
    new_record_payload = {
        "record_type": "SURGERY",
        "title": "Minor Outpatient Appendectomy",
        "description": "Laparoscopic appendectomy performed without complications.",
        "record_date": "2026-03-25",
        "provider_name": "Dr. Sarah Jenkins",
        "facility_name": "Metro General Hospital",
        "status": "COMPLETED"
    }
    create_res = client.post("/api/v1/health-records", json=new_record_payload, headers=patient_headers)
    assert create_res.status_code == 201, f"Create record failed: {create_res.text}"
    created_record = create_res.json()
    assert created_record["title"] == "Minor Outpatient Appendectomy"
    assert created_record["record_type"] == "SURGERY"
    created_id = created_record["id"]
    print(f"  -> Successfully created record ID #{created_id}: {created_record['title']}")

    # 7. Phase 3 GET /api/v1/health-records/{id}
    print(f"\n[TEST 7] Retrieving Record #{created_id} by ID...")
    get_res = client.get(f"/api/v1/health-records/{created_id}", headers=patient_headers)
    assert get_res.status_code == 200
    assert get_res.json()["title"] == "Minor Outpatient Appendectomy"
    print("  -> GET by ID verified.")

    # 8. Phase 3 PUT /api/v1/health-records/{id} (Update Record)
    print(f"\n[TEST 8] Updating Record #{created_id}...")
    update_payload = {
        "title": "Updated Laparoscopic Appendectomy Note",
        "status": "HISTORICAL"
    }
    update_res = client.put(f"/api/v1/health-records/{created_id}", json=update_payload, headers=patient_headers)
    assert update_res.status_code == 200
    updated_data = update_res.json()
    assert updated_data["title"] == "Updated Laparoscopic Appendectomy Note"
    assert updated_data["status"] == "HISTORICAL"
    print("  -> Record Update verified.")

    # 9. Phase 3 DELETE /api/v1/health-records/{id}
    print(f"\n[TEST 9] Deleting Record #{created_id}...")
    del_res = client.delete(f"/api/v1/health-records/{created_id}", headers=patient_headers)
    assert del_res.status_code == 200
    print("  -> Record Deletion successful.")

    verify_del = client.get(f"/api/v1/health-records/{created_id}", headers=patient_headers)
    assert verify_del.status_code == 404
    print("  -> Confirmed deleted record returns 404 Not Found.")

    # 10. Phase 3 Ownership Isolation & RBAC Security Test
    print("\n[TEST 10] Testing Ownership Security & RBAC Enforcements...")
    # Register Patient 2
    reg_p2 = client.post("/api/v1/auth/register", json={
        "email": "patient2@medimind.demo",
        "phone_number": "+91 98765 00002",
        "full_name": "Second Demo Patient",
        "password": "Password123!",
        "role": "PATIENT"
    })
    assert reg_p2.status_code == 201
    p2_token = client.post("/api/v1/auth/login", json={"email": "patient2@medimind.demo", "password": "Password123!"}).json()["access_token"]
    p2_headers = {"Authorization": f"Bearer {p2_token}"}

    # Patient 2 listing records should return 0 records (isolated from Patient 1)
    p2_records = client.get("/api/v1/health-records", headers=p2_headers).json()
    assert len(p2_records) == 0, f"Expected 0 records for Patient 2, got {len(p2_records)}"
    print("  -> Patient 2 has 0 records (Strict Ownership Isolation verified).")

    # Doctor trying to access PATIENT health records endpoint -> Should return 403 Forbidden
    doc_login = client.post("/api/v1/auth/login", json={"email": "doctor@medimind.demo", "password": "DemoPassword123!"})
    assert doc_login.status_code == 200
    doc_token = doc_login.json()["access_token"]
    doc_headers = {"Authorization": f"Bearer {doc_token}"}

    doc_access = client.get("/api/v1/health-records", headers=doc_headers)
    assert doc_access.status_code == 403, f"Expected 403 for non-PATIENT role, got {doc_access.status_code}"
    print("  -> Non-PATIENT Role (DOCTOR) access to patient records correctly blocked with 403 Forbidden.")

    print("\n" + "=" * 70)
    print("ALL 10 PHASE 3 VERIFICATION TESTS PASSED SUCCESSFULLY! (100% SUCCESS)")
    print("=" * 70)

if __name__ == "__main__":
    run_tests()
