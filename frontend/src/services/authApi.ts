const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export interface UserOut {
  id: number;
  email: string;
  full_name: string;
  phone_number?: string;
  is_active: boolean;
  is_verified: boolean;
  roles: string[];
  created_at: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  full_name: string;
  phone_number?: string;
  role: string;
}

export interface RegisterResponse {
  message: string;
  user_id: number;
  simulated_otp_code?: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  refresh_token?: string;
  user: UserOut;
}

export async function registerApi(data: RegisterRequest): Promise<RegisterResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'Registration failed' }));
    throw new Error(errorData.detail || 'Registration failed');
  }
  return response.json();
}

export async function verifyOtpApi(user_id: number, otp_code: string): Promise<{ message: string }> {
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/otp/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id, otp_code }),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'OTP verification failed' }));
    throw new Error(errorData.detail || 'OTP verification failed');
  }
  return response.json();
}

export async function loginApi(email: string, password: string): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'Invalid credentials' }));
    throw new Error(errorData.detail || 'Invalid email or password');
  }
  return response.json();
}

export async function fetchMeApi(accessToken: string): Promise<UserOut> {
  const response = await fetch(`${API_BASE_URL}/api/v1/users/me`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });
  if (!response.ok) {
    throw new Error('Failed to fetch user profile');
  }
  return response.json();
}

export async function logoutApi(refreshToken?: string): Promise<{ message: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    return response.json();
  } catch {
    return { message: 'Logged out locally' };
  }
}
