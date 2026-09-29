import { Medication } from './medicationsApi';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export interface PrescriptionItemCreate {
  name: string;
  dosage: string;
  frequency: string;
  route: string;
  start_date: string;
  stop_date?: string | null;
  reminder_enabled?: boolean;
  reminder_time?: string | null;
  instructions?: string | null;
}

export interface PrescriptionCreatePayload {
  patient_user_id: number;
  consultation_id?: number | null;
  notes?: string | null;
  medications: PrescriptionItemCreate[];
}

export interface Prescription {
  id: number;
  patient_user_id: number;
  doctor_profile_id?: number | null;
  consultation_id?: number | null;
  prescription_reference: string;
  prescribed_date: string;
  notes?: string | null;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  created_at: string;
  updated_at: string;
  doctor_name?: string | null;
  patient_name?: string | null;
  medications: Medication[];
}

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    Authorization: token ? `Bearer ${token}` : '',
  };
}

export const prescriptionsApi = {
  async getPrescriptions(): Promise<Prescription[]> {
    const response = await fetch(`${API_BASE_URL}/api/v1/prescriptions`, { headers: getAuthHeaders() });
    if (!response.ok) {
      const err = await response.json().catch(() => ({ detail: 'Failed to fetch prescriptions' }));
      throw new Error(err.detail || 'Failed to fetch prescriptions');
    }
    return response.json();
  },

  async getPrescriptionById(id: number): Promise<Prescription> {
    const response = await fetch(`${API_BASE_URL}/api/v1/prescriptions/${id}`, { headers: getAuthHeaders() });
    if (!response.ok) {
      const err = await response.json().catch(() => ({ detail: 'Failed to fetch prescription details' }));
      throw new Error(err.detail || 'Failed to fetch prescription details');
    }
    return response.json();
  },

  async createPrescription(payload: PrescriptionCreatePayload): Promise<Prescription> {
    const response = await fetch(`${API_BASE_URL}/api/v1/prescriptions`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({ detail: 'Failed to create prescription' }));
      throw new Error(err.detail || 'Failed to create prescription');
    }
    return response.json();
  },

  async updatePrescription(id: number, notes?: string, status?: string): Promise<Prescription> {
    const response = await fetch(`${API_BASE_URL}/api/v1/prescriptions/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ notes, status }),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({ detail: 'Failed to update prescription' }));
      throw new Error(err.detail || 'Failed to update prescription');
    }
    return response.json();
  },

  async cancelPrescription(id: number): Promise<Prescription> {
    const response = await fetch(`${API_BASE_URL}/api/v1/prescriptions/${id}/cancel`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({ detail: 'Failed to cancel prescription' }));
      throw new Error(err.detail || 'Failed to cancel prescription');
    }
    return response.json();
  },
};
