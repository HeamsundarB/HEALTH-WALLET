import sys
import os
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app.main import app
from app.db.session import SessionLocal
from app.db.init_db import init_db

client = TestClient(app)

def run_tests():
    print("=" * 75)
    print("HEALTH WALLET — PHASE 5 NOTIFICATIONS & ACCESS ACTIVITY VERIFICATION SUITE")
    print("=" * 75)

    db = SessionLocal()
    init_db(db)
    db.close()

    # 1. Phase 0 health endpoint -> PASS
    print("[TEST 1] Verifying Phase 0 Health Endpoint...")
    res = client.get("/api/v1/health")
    assert res.status_code == 200
    assert res.json()["status"] == "ok"
    print("  -> Phase 0 Health Endpoint PASSED")

    # 2. Phase 1 patient login -> PASS
    print("\n[TEST 2] Verifying Phase 1 Patient Login...")
    p_login = client.post("/api/v1/auth/login", json={"email": "patient@medimind.demo", "password": "DemoPassword123!"})
    assert p_login.status_code == 200
    p_token = p_login.json()["access_token"]
    patient_headers = {"Authorization": f"Bearer {p_token}"}
    print("  -> Patient Login Successful")

    # 3. Phase 1 doctor login -> PASS
    print("\n[TEST 3] Verifying Phase 1 Doctor Login...")
    d_login = client.post("/api/v1/auth/login", json={"email": "doctor@medimind.demo", "password": "DemoPassword123!"})
    assert d_login.status_code == 200
    d_token = d_login.json()["access_token"]
    doctor_headers = {"Authorization": f"Bearer {d_token}"}
    print("  -> Doctor Login Successful")

    # 4. Phase 2 patient profile -> PASS
    print("\n[TEST 4] Verifying Phase 2 Patient Profile...")
    prof_res = client.get("/api/v1/patient/profile", headers=patient_headers)
    assert prof_res.status_code == 200
    prof_data = prof_res.json()
    assert prof_data["full_name"] == "Demo Patient"
    print("  -> Patient Profile PASSED")

    # 5. Phase 2 synthetic HW ID -> PASS
    print("\n[TEST 5] Verifying Phase 2 Synthetic Health Wallet ID...")
    patient_hw_id = prof_data["health_wallet_id"]
    assert patient_hw_id.startswith("HW-")
    print(f"  -> Synthetic HW ID Verified: {patient_hw_id}")

    # 6. Phase 3 health records -> PASS
    print("\n[TEST 6] Verifying Phase 3 Health Records...")
    records_res = client.get("/api/v1/health-records", headers=patient_headers)
    assert records_res.status_code == 200
    assert len(records_res.json()) >= 4
    print("  -> Health Records PASSED")

    # Setup Patient 2 for clean test flow
    p2_reg = client.post("/api/v1/auth/register", json={
        "email": "patient_phase5@medimind.demo",
        "password": "Password123!",
        "full_name": "Phase 5 Test Patient",
        "phone_number": "+91 99999 55555",
        "role": "PATIENT"
    })
    assert p2_reg.status_code in [201, 400]
    p2_token = client.post("/api/v1/auth/login", json={"email": "patient_phase5@medimind.demo", "password": "Password123!"}).json()["access_token"]
    p2_headers = {"Authorization": f"Bearer {p2_token}"}
    p2_hw_id = client.get("/api/v1/patient/profile", headers=p2_headers).json()["health_wallet_id"]

    # 7. Phase 4 consent request -> PASS
    print("\n[TEST 7] Phase 4 Consent Request Creation...")
    req_res = client.post("/api/v1/consents", json={
        "patient_health_wallet_id": p2_hw_id,
        "purpose": "Phase 5 Test Consultation",
        "scope": "ALL_HEALTH_RECORDS"
    }, headers=doctor_headers)
    assert req_res.status_code == 201
    consent_id = req_res.json()["id"]
    print(f"  -> Consent Request #{consent_id} Created")

    # 8. Phase 4 consent approval -> PASS
    print(f"\n[TEST 8] Phase 4 Consent Approval for #{consent_id}...")
    app_res = client.post(f"/api/v1/consents/{consent_id}/approve", headers=p2_headers)
    assert app_res.status_code == 200
    assert app_res.json()["status"] == "APPROVED"
    print("  -> Consent Approval PASSED")

    # 9. Phase 4 protected record access -> PASS
    print("\n[TEST 9] Phase 4 Protected Record Access...")
    rec_access_res = client.get(f"/api/v1/consents/patient-records/{p2_hw_id}", headers=doctor_headers)
    assert rec_access_res.status_code == 200
    print("  -> Protected Record Access PASSED")

    # 10. Notification table exists -> PASS
    print("\n[TEST 10] Verifying Notification Table Existence...")
    p2_notifs_res = client.get("/api/v1/notifications", headers=p2_headers)
    assert p2_notifs_res.status_code == 200
    print("  -> Notifications Table & Endpoint Accessible")

    # 11. Patient receives consent-request notification -> PASS
    print("\n[TEST 11] Verifying Patient Received CONSENT_REQUEST Notification...")
    p2_notifs = p2_notifs_res.json()
    req_notif = next((n for n in p2_notifs if n["notification_type"] == "CONSENT_REQUEST"), None)
    assert req_notif is not None
    assert req_notif["title"] == "New Access Request"
    print("  -> Patient CONSENT_REQUEST Notification Verified")

    # 12. Requester receives approval notification -> PASS
    print("\n[TEST 12] Verifying Requester Received CONSENT_APPROVED Notification...")
    doc_notifs = client.get("/api/v1/notifications", headers=doctor_headers).json()
    app_notif = next((n for n in doc_notifs if n["notification_type"] == "CONSENT_APPROVED"), None)
    assert app_notif is not None
    assert app_notif["title"] == "Access Approved"
    print("  -> Requester CONSENT_APPROVED Notification Verified")

    # 13. Requester receives rejection notification -> PASS
    print("\n[TEST 13] Verifying Requester Receives CONSENT_REJECTED Notification...")
    # Create request 2 & reject
    req2_res = client.post("/api/v1/consents", json={
        "patient_health_wallet_id": p2_hw_id,
        "purpose": "Second Request for Rejection Test",
        "scope": "LAB_TESTS"
    }, headers=doctor_headers)
    assert req2_res.status_code == 201
    c2_id = req2_res.json()["id"]

    rej_res = client.post(f"/api/v1/consents/{c2_id}/reject", headers=p2_headers)
    assert rej_res.status_code == 200

    doc_notifs2 = client.get("/api/v1/notifications", headers=doctor_headers).json()
    rej_notif = next((n for n in doc_notifs2 if n["notification_type"] == "CONSENT_REJECTED"), None)
    assert rej_notif is not None
    assert rej_notif["title"] == "Access Request Rejected"
    print("  -> Requester CONSENT_REJECTED Notification Verified")

    # 14. Requester receives revocation notification -> PASS
    print("\n[TEST 14] Verifying Requester Receives CONSENT_REVOKED Notification...")
    rev_res = client.post(f"/api/v1/consents/{consent_id}/revoke", headers=p2_headers)
    assert rev_res.status_code == 200

    doc_notifs3 = client.get("/api/v1/notifications", headers=doctor_headers).json()
    rev_notif = next((n for n in doc_notifs3 if n["notification_type"] == "CONSENT_REVOKED"), None)
    assert rev_notif is not None
    assert rev_notif["title"] == "Access Revoked"
    print("  -> Requester CONSENT_REVOKED Notification Verified")

    # 15. Patient receives record-access notification -> PASS
    print("\n[TEST 15] Verifying Patient Received RECORD_ACCESS Notification...")
    p2_notifs_after_access = client.get("/api/v1/notifications", headers=p2_headers).json()
    access_notif = next((n for n in p2_notifs_after_access if n["notification_type"] == "RECORD_ACCESS"), None)
    assert access_notif is not None
    assert access_notif["title"] == "Health Record Accessed"
    print("  -> Patient RECORD_ACCESS Notification Verified")

    # 16. User can list own notifications -> PASS
    print("\n[TEST 16] User Listing Own Notifications...")
    list_notifs = client.get("/api/v1/notifications", headers=p2_headers)
    assert list_notifs.status_code == 200
    assert len(list_notifs.json()) >= 2
    print(f"  -> User Successfully Listed {len(list_notifs.json())} Notifications")

    # 17. User cannot access another user's notifications -> PASS
    print("\n[TEST 17] User Isolation (User cannot access another user's notifications)...")
    p1_notifs = client.get("/api/v1/notifications", headers=patient_headers).json()
    p2_notif_ids = [n["id"] for n in p2_notifs_after_access]
    for p1_n in p1_notifs:
        assert p1_n["id"] not in p2_notif_ids
    print("  -> Notification User Isolation Verified")

    # 18. User can mark own notification as read -> PASS
    print("\n[TEST 18] User Marking Own Notification as Read...")
    target_notif = p2_notifs_after_access[0]
    t_id = target_notif["id"]
    read_res = client.post(f"/api/v1/notifications/{t_id}/read", headers=p2_headers)
    assert read_res.status_code == 200
    assert read_res.json()["is_read"] is True
    print(f"  -> Notification #{t_id} Marked as Read Successfully")

    # 19. User cannot mark another user's notification as read -> PASS
    print("\n[TEST 19] Security (User cannot mark another user's notification as read)...")
    cross_read = client.post(f"/api/v1/notifications/{t_id}/read", headers=patient_headers)
    assert cross_read.status_code in (403, 404)
    print("  -> Cross-user notification read blocked with 403/404")

    # 20. Mark-all-read affects only current user -> PASS
    print("\n[TEST 20] Mark-All-Read Ownership Isolation...")
    read_all_res = client.post("/api/v1/notifications/read-all", headers=p2_headers)
    assert read_all_res.status_code == 200

    unread_p2 = client.get("/api/v1/notifications/unread-count", headers=p2_headers).json()
    assert unread_p2["unread_count"] == 0

    # Verify Patient 1 unread notifications remain unread
    p1_unread_before = client.get("/api/v1/notifications/unread-count", headers=patient_headers).json()["unread_count"]
    assert p1_unread_before >= 1
    print("  -> Mark-All-Read strictly isolated to current user")

    # 21. Unread count is correct -> PASS
    print("\n[TEST 21] Unread Count Accuracy...")
    assert unread_p2["unread_count"] == 0
    print("  -> Unread Count Correct")

    # 22. GET requests do not create duplicate notifications -> PASS
    print("\n[TEST 22] Duplicate Notification Prevention on GET requests...")
    count_before = len(client.get("/api/v1/notifications", headers=p2_headers).json())
    client.get("/api/v1/notifications", headers=p2_headers)
    client.get("/api/v1/notifications/unread-count", headers=p2_headers)
    count_after = len(client.get("/api/v1/notifications", headers=p2_headers).json())
    assert count_before == count_after
    print("  -> GET requests do NOT create duplicate notifications")

    # 23. Notification timestamps are present -> PASS
    print("\n[TEST 23] Notification Timestamps Check...")
    sample_notif = p2_notifs_after_access[0]
    assert "created_at" in sample_notif
    assert sample_notif["created_at"] is not None
    print("  -> Notification Timestamps Verified")

    print("\n" + "=" * 75)
    print("ALL 23 PHASE 5 VERIFICATION TESTS PASSED SUCCESSFULLY! (100% SUCCESS)")
    print("=" * 75)

if __name__ == "__main__":
    run_tests()
