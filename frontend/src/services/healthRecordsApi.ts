const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export type RecordType =
  | 'CONSULTATION'
  | 'DIAGNOSIS'
  | 'TREATMENT'
  | 'HOSPITAL_ADMISSION'
  | 'SURGERY'
  | 'LAB_TEST'
  | 'IMAGING'
  | 'ALLERGY'
  | 'VACCINATION'
  | 'PRESCRIPTION';

export interface HealthRecord {
  id: number;
  patient_user_id: number;
  record_type: RecordType;
  title: string;
  description?: string;
  record_date: string;
  provider_name?: string;
  facility_name?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface HealthRecordCreatePayload {
  record_type: RecordType;
  title: string;
  description?: string;
  record_date: string;
  provider_name?: string;
  facility_name?: string;
  status?: string;
}

export interface HealthRecordUpdatePayload {
  record_type?: RecordType;
  title?: string;
  description?: string;
  record_date?: string;
  provider_name?: string;
  facility_name?: string;
  status?: string;
}

export async function fetchHealthRecordsApi(
  token: string,
  recordType?: string,
  search?: string
): Promise<HealthRecord[]> {
  const url = new URL(`${API_BASE_URL}/api/v1/health-records`);
  if (recordType && recordType !== 'ALL') {
    url.searchParams.append('record_type', recordType);
  }
  if (search && search.trim()) {
    url.searchParams.append('search', search.trim());
  }

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: 'Failed to fetch health records' }));
    throw new Error(err.detail || 'Failed to fetch health records');
  }

  return response.json();
}

export async function createHealthRecordApi(
  token: string,
  payload: HealthRecordCreatePayload
): Promise<HealthRecord> {
  const response = await fetch(`${API_BASE_URL}/api/v1/health-records`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: 'Failed to create health record' }));
    throw new Error(err.detail || 'Failed to create health record');
  }

  return response.json();
}

export async function updateHealthRecordApi(
  token: string,
  recordId: number,
  payload: HealthRecordUpdatePayload
): Promise<HealthRecord> {
  const response = await fetch(`${API_BASE_URL}/api/v1/health-records/${recordId}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: 'Failed to update health record' }));
    throw new Error(err.detail || 'Failed to update health record');
  }

  return response.json();
}

export async function deleteHealthRecordApi(
  token: string,
  recordId: number
): Promise<{ detail: string }> {
  const response = await fetch(`${API_BASE_URL}/api/v1/health-records/${recordId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: 'Failed to delete health record' }));
    throw new Error(err.detail || 'Failed to delete health record');
  }

  return response.json();
}
