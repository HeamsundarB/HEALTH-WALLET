const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export type AppointmentStatus = 'REQUESTED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'REJECTED';

export interface Appointment {
  id: number;
  patient_user_id: number;
  patient_name?: string;
  doctor_profile_id: number;
  doctor_name?: string;
  specialization?: string;
  hospital_name?: string;
  appointment_date: string;
  appointment_time: string;
  reason?: string;
  status: AppointmentStatus;
  consultation_id?: number;
  created_at: string;
  updated_at: string;
}

export interface AppointmentCreatePayload {
  doctor_profile_id: number;
  appointment_date: string;
  appointment_time: string;
  reason?: string;
}

export interface Consultation {
  id: number;
  appointment_id: number;
  patient_user_id: number;
  patient_name?: string;
  doctor_profile_id: number;
  doctor_name?: string;
  specialization?: string;
  symptoms?: string;
  diagnosis: string;
  notes?: string;
  treatment_plan?: string;
  consultation_date: string;
  health_record_id?: number;
  created_at: string;
  updated_at: string;
}

export interface ConsultationCreatePayload {
  symptoms?: string;
  diagnosis: string;
  notes?: string;
  treatment_plan?: string;
  consultation_date?: string;
}

// Patient API Endpoints
export async function createAppointmentApi(token: string, payload: AppointmentCreatePayload): Promise<Appointment> {
  const response = await fetch(`${API_BASE_URL}/api/v1/appointments`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: 'Failed to schedule appointment' }));
    throw new Error(err.detail || 'Failed to schedule appointment');
  }
  return response.json();
}

export async function fetchPatientAppointmentsApi(token: string): Promise<Appointment[]> {
  const response = await fetch(`${API_BASE_URL}/api/v1/appointments`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: 'Failed to fetch patient appointments' }));
    throw new Error(err.detail || 'Failed to fetch patient appointments');
  }
  return response.json();
}

export async function fetchAppointmentByIdApi(token: string, appointmentId: number): Promise<Appointment> {
  const response = await fetch(`${API_BASE_URL}/api/v1/appointments/${appointmentId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: 'Failed to fetch appointment details' }));
    throw new Error(err.detail || 'Failed to fetch appointment details');
  }
  return response.json();
}

export async function cancelAppointmentApi(token: string, appointmentId: number): Promise<Appointment> {
  const response = await fetch(`${API_BASE_URL}/api/v1/appointments/${appointmentId}/cancel`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: 'Failed to cancel appointment' }));
    throw new Error(err.detail || 'Failed to cancel appointment');
  }
  return response.json();
}

// Doctor API Endpoints
export async function fetchDoctorAppointmentsApi(token: string): Promise<Appointment[]> {
  const response = await fetch(`${API_BASE_URL}/api/v1/appointments/doctor`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: 'Failed to fetch doctor appointments' }));
    throw new Error(err.detail || 'Failed to fetch doctor appointments');
  }
  return response.json();
}

export async function confirmAppointmentApi(token: string, appointmentId: number): Promise<Appointment> {
  const response = await fetch(`${API_BASE_URL}/api/v1/appointments/${appointmentId}/confirm`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: 'Failed to confirm appointment' }));
    throw new Error(err.detail || 'Failed to confirm appointment');
  }
  return response.json();
}

export async function rejectAppointmentApi(token: string, appointmentId: number): Promise<Appointment> {
  const response = await fetch(`${API_BASE_URL}/api/v1/appointments/${appointmentId}/reject`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: 'Failed to decline appointment' }));
    throw new Error(err.detail || 'Failed to decline appointment');
  }
  return response.json();
}

export async function createConsultationApi(
  token: string,
  appointmentId: number,
  payload: ConsultationCreatePayload
): Promise<Consultation> {
  const response = await fetch(`${API_BASE_URL}/api/v1/appointments/${appointmentId}/consultation`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: 'Failed to save consultation' }));
    throw new Error(err.detail || 'Failed to save consultation');
  }
  return response.json();
}

// Consultation API Endpoints
export async function fetchConsultationByIdApi(token: string, consultationId: number): Promise<Consultation> {
  const response = await fetch(`${API_BASE_URL}/api/v1/consultations/${consultationId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: 'Failed to fetch consultation notes' }));
    throw new Error(err.detail || 'Failed to fetch consultation notes');
  }
  return response.json();
}

export async function fetchPatientConsultationsApi(token: string): Promise<Consultation[]> {
  const response = await fetch(`${API_BASE_URL}/api/v1/consultations/patient`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: 'Failed to fetch consultations list' }));
    throw new Error(err.detail || 'Failed to fetch consultations list');
  }
  return response.json();
}

export async function fetchDoctorConsultationsApi(token: string): Promise<Consultation[]> {
  const response = await fetch(`${API_BASE_URL}/api/v1/consultations/doctor`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: 'Failed to fetch doctor consultations list' }));
    throw new Error(err.detail || 'Failed to fetch doctor consultations list');
  }
  return response.json();
}
