export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'PATIENT' | 'DOCTOR' | 'ADMIN';
  demoMode: boolean;
}

export interface HealthStatusResponse {
  status: string;
  service: string;
  version?: string;
  environment?: string;
}

export interface NavItem {
  title: string;
  href: string;
  icon: string;
  badge?: string;
}

export interface ComponentProps {
  className?: string;
  children?: React.ReactNode;
}
