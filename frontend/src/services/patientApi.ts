const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export interface PatientProfileData {
  id: number;
  user_id: number;
  health_wallet_id: string;
  email: string;
  full_name: string;
  phone_number?: string;
  dob?: string;
  gender?: string;
  address?: string;
  state?: string;
  blood_group?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  created_at: string;
  updated_at: string;
}

export interface PatientProfileUpdatePayload {
  dob?: string;
  gender?: string;
  address?: string;
  state?: string;
  blood_group?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
}

export async function fetchPatientProfileApi(token: string): Promise<PatientProfileData> {
  const response = await fetch(`${API_BASE_URL}/api/v1/patient/profile`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: 'Failed to fetch patient profile' }));
    throw new Error(err.detail || 'Failed to fetch patient profile');
  }
  return response.json();
}

export async function updatePatientProfileApi(
  token: string,
  payload: PatientProfileUpdatePayload
): Promise<PatientProfileData> {
  const response = await fetch(`${API_BASE_URL}/api/v1/patient/profile`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: 'Failed to update patient profile' }));
    throw new Error(err.detail || 'Failed to update patient profile');
  }
  return response.json();
}
