const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export type VerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';

export interface DoctorCredential {
  id: number;
  professional_id: string;
  qualification_summary: string;
  certifications?: string;
  verification_status: VerificationStatus;
  verified_at?: string;
}

export interface DoctorProfile {
  id: number;
  user_id: number;
  full_name: string;
  email: string;
  specialization: string;
  qualification: string;
  experience_years: number;
  languages?: string;
  consultation_type: string;
  availability_info?: string;
  bio?: string;
  profile_image_url?: string;
  credential?: DoctorCredential;
  affiliated_hospitals: string[];
  created_at: string;
  updated_at: string;
}

export interface DoctorProfileUpdatePayload {
  bio?: string;
  specialization?: string;
  qualification?: string;
  experience_years?: number;
  languages?: string;
  consultation_type?: string;
  availability_info?: string;
  profile_image_url?: string;
}

export interface HospitalDepartment {
  id: number;
  hospital_profile_id: number;
  name: string;
  description?: string;
  created_at: string;
}

export interface HospitalProfile {
  id: number;
  admin_user_id: number;
  name: string;
  registration_number: string;
  address: string;
  location_city: string;
  state: string;
  contact_email: string;
  contact_phone: string;
  working_hours: string;
  services_summary?: string;
  verification_status: VerificationStatus;
  verified_at?: string;
  departments: HospitalDepartment[];
  affiliated_doctors_count: number;
  created_at: string;
  updated_at: string;
}

export interface HospitalProfileUpdatePayload {
  name?: string;
  address?: string;
  location_city?: string;
  state?: string;
  contact_email?: string;
  contact_phone?: string;
  working_hours?: string;
  services_summary?: string;
}

export interface ProviderVerificationItem {
  provider_type: 'DOCTOR' | 'HOSPITAL';
  id: number;
  name: string;
  identifier: string;
  details: string;
  verification_status: VerificationStatus;
  submitted_at: string;
}

// Doctor Endpoints
export async function fetchOwnDoctorProfileApi(token: string): Promise<DoctorProfile> {
  const response = await fetch(`${API_BASE_URL}/api/v1/doctors/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: 'Failed to fetch doctor profile' }));
    throw new Error(err.detail || 'Failed to fetch doctor profile');
  }
  return response.json();
}

export async function updateOwnDoctorProfileApi(
  token: string,
  payload: DoctorProfileUpdatePayload
): Promise<DoctorProfile> {
  const response = await fetch(`${API_BASE_URL}/api/v1/doctors/me`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: 'Failed to update doctor profile' }));
    throw new Error(err.detail || 'Failed to update doctor profile');
  }
  return response.json();
}

export async function fetchDoctorProfileByIdApi(token: string, doctorId: number): Promise<DoctorProfile> {
  const response = await fetch(`${API_BASE_URL}/api/v1/doctors/${doctorId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: 'Failed to fetch doctor profile details' }));
    throw new Error(err.detail || 'Failed to fetch doctor profile details');
  }
  return response.json();
}

// Hospital Endpoints
export async function fetchOwnHospitalProfileApi(token: string): Promise<HospitalProfile> {
  const response = await fetch(`${API_BASE_URL}/api/v1/hospitals/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: 'Failed to fetch hospital profile' }));
    throw new Error(err.detail || 'Failed to fetch hospital profile');
  }
  return response.json();
}

export async function updateOwnHospitalProfileApi(
  token: string,
  payload: HospitalProfileUpdatePayload
): Promise<HospitalProfile> {
  const response = await fetch(`${API_BASE_URL}/api/v1/hospitals/me`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: 'Failed to update hospital profile' }));
    throw new Error(err.detail || 'Failed to update hospital profile');
  }
  return response.json();
}

export async function addHospitalDepartmentApi(
  token: string,
  payload: { name: string; description?: string }
): Promise<HospitalDepartment> {
  const response = await fetch(`${API_BASE_URL}/api/v1/hospitals/me/departments`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: 'Failed to add department' }));
    throw new Error(err.detail || 'Failed to add department');
  }
  return response.json();
}

export async function assignDoctorToHospitalApi(
  token: string,
  payload: { doctor_professional_id: string; department_name?: string }
): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/api/v1/hospitals/me/doctors`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: 'Failed to assign doctor' }));
    throw new Error(err.detail || 'Failed to assign doctor');
  }
  return response.json();
}

export async function fetchHospitalProfileByIdApi(token: string, hospitalId: number): Promise<HospitalProfile> {
  const response = await fetch(`${API_BASE_URL}/api/v1/hospitals/${hospitalId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: 'Failed to fetch hospital details' }));
    throw new Error(err.detail || 'Failed to fetch hospital details');
  }
  return response.json();
}

// Search & Discovery Endpoints
export async function searchDoctorsApi(
  token: string,
  params?: { name?: string; specialization?: string; hospital_name?: string; location_city?: string; verified_only?: boolean }
): Promise<DoctorProfile[]> {
  const url = new URL(`${API_BASE_URL}/api/v1/search/doctors`);
  if (params?.name) url.searchParams.append('name', params.name);
  if (params?.specialization) url.searchParams.append('specialization', params.specialization);
  if (params?.hospital_name) url.searchParams.append('hospital_name', params.hospital_name);
  if (params?.location_city) url.searchParams.append('location_city', params.location_city);
  if (params?.verified_only) url.searchParams.append('verified_only', 'true');

  const response = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: 'Failed to search doctors' }));
    throw new Error(err.detail || 'Failed to search doctors');
  }
  return response.json();
}

export async function searchHospitalsApi(
  token: string,
  params?: { name?: string; location_city?: string; department_name?: string; verified_only?: boolean }
): Promise<HospitalProfile[]> {
  const url = new URL(`${API_BASE_URL}/api/v1/search/hospitals`);
  if (params?.name) url.searchParams.append('name', params.name);
  if (params?.location_city) url.searchParams.append('location_city', params.location_city);
  if (params?.department_name) url.searchParams.append('department_name', params.department_name);
  if (params?.verified_only) url.searchParams.append('verified_only', 'true');

  const response = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: 'Failed to search hospitals' }));
    throw new Error(err.detail || 'Failed to search hospitals');
  }
  return response.json();
}

// Verification Endpoints for SYSTEM_ADMIN
export async function fetchPendingVerificationsApi(token: string): Promise<ProviderVerificationItem[]> {
  const response = await fetch(`${API_BASE_URL}/api/v1/provider-verification/pending`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: 'Failed to fetch pending verifications' }));
    throw new Error(err.detail || 'Failed to fetch pending verifications');
  }
  return response.json();
}

export async function reviewProviderVerificationApi(
  token: string,
  payload: { provider_type: 'DOCTOR' | 'HOSPITAL'; provider_id: number; action: 'APPROVE' | 'REJECT'; remarks?: string }
): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/api/v1/provider-verification/review`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: 'Failed to review verification' }));
    throw new Error(err.detail || 'Failed to review verification');
  }
  return response.json();
}
