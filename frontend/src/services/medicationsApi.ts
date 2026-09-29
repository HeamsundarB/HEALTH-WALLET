const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export interface Medication {
  id: number;
  patient_user_id: number;
  prescription_id?: number | null;
  doctor_profile_id?: number | null;
  name: string;
  dosage: string;
  frequency: string;
  route: string;
  start_date: string;
  stop_date?: string | null;
  status: 'ONGOING' | 'STOPPED' | 'COMPLETED';
  reminder_enabled: boolean;
  reminder_time?: string | null;
  hospital_name?: string | null;
  instructions?: string | null;
  created_at: string;
  updated_at: string;
  prescription_reference?: string | null;
  doctor_name?: string | null;
}

export interface MedicationHistory {
  id: number;
  medication_id: number;
  patient_user_id: number;
  action: 'STARTED' | 'UPDATED' | 'STOPPED' | 'COMPLETED';
  previous_status?: 'ONGOING' | 'STOPPED' | 'COMPLETED' | null;
  new_status: 'ONGOING' | 'STOPPED' | 'COMPLETED';
  notes?: string | null;
  changed_at: string;
  created_at: string;
}

export interface MedicationCreatePayload {
  name: string;
  dosage: string;
  frequency: string;
  route: string;
  start_date: string;
  stop_date?: string | null;
  reminder_enabled?: boolean;
  reminder_time?: string | null;
  hospital_name?: string | null;
  instructions?: string | null;
}

export interface MedicationUpdatePayload {
  name?: string;
  dosage?: string;
  frequency?: string;
  route?: string;
  start_date?: string;
  stop_date?: string | null;
  reminder_enabled?: boolean;
  reminder_time?: string | null;
  hospital_name?: string | null;
  instructions?: string | null;
}

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    Authorization: token ? `Bearer ${token}` : '',
  };
}

export const medicationsApi = {
  async getMedications(params?: { status?: string; category?: string; prescription_id?: number }): Promise<Medication[]> {
    const url = new URL(`${API_BASE_URL}/api/v1/medications`);
    if (params?.status) url.searchParams.append('status', params.status);
    if (params?.category) url.searchParams.append('category', params.category);
    if (params?.prescription_id) url.searchParams.append('prescription_id', params.prescription_id.toString());

    const response = await fetch(url.toString(), { headers: getAuthHeaders() });
    if (!response.ok) {
      const err = await response.json().catch(() => ({ detail: 'Failed to fetch medications' }));
      throw new Error(err.detail || 'Failed to fetch medications');
    }
    return response.json();
  },

  async getMedicationById(id: number): Promise<Medication> {
    const response = await fetch(`${API_BASE_URL}/api/v1/medications/${id}`, { headers: getAuthHeaders() });
    if (!response.ok) {
      const err = await response.json().catch(() => ({ detail: 'Failed to fetch medication details' }));
      throw new Error(err.detail || 'Failed to fetch medication details');
    }
    return response.json();
  },

  async createMedication(payload: MedicationCreatePayload): Promise<Medication> {
    const response = await fetch(`${API_BASE_URL}/api/v1/medications`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({ detail: 'Failed to create medication' }));
      throw new Error(err.detail || 'Failed to create medication');
    }
    return response.json();
  },

  async updateMedication(id: number, payload: MedicationUpdatePayload): Promise<Medication> {
    const response = await fetch(`${API_BASE_URL}/api/v1/medications/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({ detail: 'Failed to update medication' }));
      throw new Error(err.detail || 'Failed to update medication');
    }
    return response.json();
  },

  async stopMedication(id: number, stopDate?: string, notes?: string): Promise<Medication> {
    const response = await fetch(`${API_BASE_URL}/api/v1/medications/${id}/stop`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ stop_date: stopDate, notes }),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({ detail: 'Failed to stop medication' }));
      throw new Error(err.detail || 'Failed to stop medication');
    }
    return response.json();
  },

  async completeMedication(id: number): Promise<Medication> {
    const response = await fetch(`${API_BASE_URL}/api/v1/medications/${id}/complete`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({ detail: 'Failed to complete medication' }));
      throw new Error(err.detail || 'Failed to complete medication');
    }
    return response.json();
  },

  async updateReminder(id: number, reminderEnabled: boolean, reminderTime?: string): Promise<Medication> {
    const response = await fetch(`${API_BASE_URL}/api/v1/medications/${id}/reminder`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        reminder_enabled: reminderEnabled,
        reminder_time: reminderTime,
      }),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({ detail: 'Failed to update reminder' }));
      throw new Error(err.detail || 'Failed to update reminder');
    }
    return response.json();
  },

  async getMedicationHistory(medicationId?: number): Promise<MedicationHistory[]> {
    const url = new URL(`${API_BASE_URL}/api/v1/medications/history`);
    if (medicationId) url.searchParams.append('medication_id', medicationId.toString());

    const response = await fetch(url.toString(), { headers: getAuthHeaders() });
    if (!response.ok) {
      const err = await response.json().catch(() => ({ detail: 'Failed to fetch medication history' }));
      throw new Error(err.detail || 'Failed to fetch medication history');
    }
    return response.json();
  },
};
