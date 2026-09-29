const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export type NotificationType =
  | 'CONSENT_REQUEST'
  | 'CONSENT_APPROVED'
  | 'CONSENT_REJECTED'
  | 'CONSENT_REVOKED'
  | 'RECORD_ACCESS'
  | 'ACCOUNT_ACTIVITY';

export interface NotificationItem {
  id: number;
  user_id: number;
  notification_type: NotificationType;
  title: string;
  message: string;
  related_entity_type?: string;
  related_entity_id?: number;
  is_read: boolean;
  created_at: string;
}

export interface UnreadCountResponse {
  unread_count: number;
}

export async function fetchNotificationsApi(
  token: string,
  unreadOnly: boolean = false
): Promise<NotificationItem[]> {
  const url = new URL(`${API_BASE_URL}/api/v1/notifications`);
  if (unreadOnly) {
    url.searchParams.append('unread_only', 'true');
  }

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: 'Failed to fetch notifications' }));
    throw new Error(err.detail || 'Failed to fetch notifications');
  }

  return response.json();
}

export async function fetchUnreadCountApi(token: string): Promise<UnreadCountResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/notifications/unread-count`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: 'Failed to fetch unread count' }));
    throw new Error(err.detail || 'Failed to fetch unread count');
  }

  return response.json();
}

export async function markNotificationAsReadApi(
  token: string,
  notificationId: number
): Promise<NotificationItem> {
  const response = await fetch(`${API_BASE_URL}/api/v1/notifications/${notificationId}/read`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: 'Failed to mark notification as read' }));
    throw new Error(err.detail || 'Failed to mark notification as read');
  }

  return response.json();
}

export async function markAllNotificationsAsReadApi(token: string): Promise<{ detail: string }> {
  const response = await fetch(`${API_BASE_URL}/api/v1/notifications/read-all`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: 'Failed to mark all as read' }));
    throw new Error(err.detail || 'Failed to mark all as read');
  }

  return response.json();
}
