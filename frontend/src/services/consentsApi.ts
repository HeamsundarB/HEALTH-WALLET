const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export type ConsentStatus = 'REQUESTED' | 'APPROVED' | 'REJECTED' | 'REVOKED';

export type ConsentScope =
  | 'ALL_HEALTH_RECORDS'
  | 'CONSULTATIONS'
  | 'DIAGNOSES'
  | 'TREATMENTS'
  | 'LAB_TESTS'
  | 'IMAGING'
  | 'PRESCRIPTIONS';

export interface Consent {
  id: number;
  patient_user_id: number;
  requester_user_id: number;
  requester_name?: string;
  patient_name?: string;
  patient_health_wallet_id?: string;
  requester_role: string;
  purpose: string;
  scope: ConsentScope;
  status: ConsentStatus;
  requested_at: string;
  responded_at?: string;
  revoked_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ConsentCreatePayload {
  patient_health_wallet_id: string;
  purpose: string;
  scope: ConsentScope;
}

export async function fetchPatientConsentsApi(token: string): Promise<Consent[]> {
  const response = await fetch(`${API_BASE_URL}/api/v1/consents`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: 'Failed to fetch patient consents' }));
    throw new Error(err.detail || 'Failed to fetch patient consents');
  }
  return response.json();
}

export async function fetchRequesterConsentsApi(token: string): Promise<Consent[]> {
  const response = await fetch(`${API_BASE_URL}/api/v1/consents/requests`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: 'Failed to fetch healthcare requests' }));
    throw new Error(err.detail || 'Failed to fetch healthcare requests');
  }
  return response.json();
}

export async function createConsentRequestApi(
  token: string,
  payload: ConsentCreatePayload
): Promise<Consent> {
  const response = await fetch(`${API_BASE_URL}/api/v1/consents`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: 'Failed to create access request' }));
    throw new Error(err.detail || 'Failed to create access request');
  }
  return response.json();
}

export async function approveConsentApi(token: string, consentId: number): Promise<Consent> {
  const response = await fetch(`${API_BASE_URL}/api/v1/consents/${consentId}/approve`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: 'Failed to approve consent' }));
    throw new Error(err.detail || 'Failed to approve consent');
  }
  return response.json();
}

export async function rejectConsentApi(token: string, consentId: number): Promise<Consent> {
  const response = await fetch(`${API_BASE_URL}/api/v1/consents/${consentId}/reject`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: 'Failed to reject consent' }));
    throw new Error(err.detail || 'Failed to reject consent');
  }
  return response.json();
}

export async function revokeConsentApi(token: string, consentId: number): Promise<Consent> {
  const response = await fetch(`${API_BASE_URL}/api/v1/consents/${consentId}/revoke`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: 'Failed to revoke consent' }));
    throw new Error(err.detail || 'Failed to revoke consent');
  }
  return response.json();
}

export async function fetchConsentProtectedRecordsApi(token: string, patientHwId: string): Promise<any[]> {
  const response = await fetch(`${API_BASE_URL}/api/v1/consents/patient-records/${patientHwId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: 'Access Denied to patient records' }));
    throw new Error(err.detail || 'Access Denied to patient records');
  }
  return response.json();
}
