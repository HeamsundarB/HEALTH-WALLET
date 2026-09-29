from fastapi import APIRouter
from app.api.v1.endpoints import (
    health,
    auth,
    users,
    patient,
    health_records,
    consents,
    notifications,
    doctors,
    hospitals,
    provider_search,
    provider_verification,
    appointments,
    consultations,
    prescriptions,
    medications,
    conversations,
    messages,
)

api_router = APIRouter()
api_router.include_router(health.router, tags=["Health Operations"])
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication & OTP"])
api_router.include_router(users.router, prefix="/users", tags=["Users & RBAC"])
api_router.include_router(patient.router, prefix="/patient", tags=["Patient Profile & Wallet"])
api_router.include_router(health_records.router, prefix="/health-records", tags=["Health Records & Timeline"])
api_router.include_router(consents.router, prefix="/consents", tags=["Consent & Access Control"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["In-App Notifications"])
api_router.include_router(doctors.router, prefix="/doctors", tags=["Doctor Profiles & Credentials"])
api_router.include_router(hospitals.router, prefix="/hospitals", tags=["Hospital Profiles & Departments"])
api_router.include_router(provider_search.router, prefix="/search", tags=["Provider Search & Discovery"])
api_router.include_router(provider_verification.router, prefix="/provider-verification", tags=["Provider Verification Workflow"])
api_router.include_router(appointments.router, prefix="/appointments", tags=["Appointments & Booking"])
api_router.include_router(consultations.router, prefix="/consultations", tags=["Clinical Consultations"])
api_router.include_router(prescriptions.router, prefix="/prescriptions", tags=["Prescription Management"])
api_router.include_router(medications.router, prefix="/medications", tags=["Medication Engine & Reminders"])
api_router.include_router(conversations.router, prefix="/conversations", tags=["Secure In-App Chat & Conversations"])
api_router.include_router(messages.router, prefix="/messages", tags=["Chat Messages"])
