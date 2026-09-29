const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export interface Message {
  id: number;
  conversation_id: number;
  sender_user_id: number;
  message_text: string;
  is_read: boolean;
  read_at?: string | null;
  created_at: string;
  updated_at: string;
  sender_name?: string | null;
  is_mine?: boolean | null;
}

export interface Conversation {
  id: number;
  patient_user_id: number;
  doctor_profile_id: number;
  conversation_type: 'GENERAL' | 'APPOINTMENT' | 'CONSULTATION' | 'PRESCRIPTION' | 'MEDICATION';
  status: 'ACTIVE' | 'CLOSED';
  created_at: string;
  updated_at: string;
  patient_name?: string | null;
  doctor_name?: string | null;
  doctor_specialization?: string | null;
  unread_count: number;
  latest_message?: Message | null;
}

export interface ConversationCreatePayload {
  doctor_profile_id: number;
  conversation_type?: 'GENERAL' | 'APPOINTMENT' | 'CONSULTATION' | 'PRESCRIPTION' | 'MEDICATION';
  initial_message?: string;
}

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    Authorization: token ? `Bearer ${token}` : '',
  };
}

export const chatApi = {
  async getConversations(): Promise<Conversation[]> {
    const response = await fetch(`${API_BASE_URL}/api/v1/conversations`, { headers: getAuthHeaders() });
    if (!response.ok) {
      const err = await response.json().catch(() => ({ detail: 'Failed to fetch conversations' }));
      throw new Error(err.detail || 'Failed to fetch conversations');
    }
    return response.json();
  },

  async getConversationById(id: number): Promise<Conversation> {
    const response = await fetch(`${API_BASE_URL}/api/v1/conversations/${id}`, { headers: getAuthHeaders() });
    if (!response.ok) {
      const err = await response.json().catch(() => ({ detail: 'Failed to fetch conversation' }));
      throw new Error(err.detail || 'Failed to fetch conversation');
    }
    return response.json();
  },

  async createConversation(payload: ConversationCreatePayload): Promise<Conversation> {
    const response = await fetch(`${API_BASE_URL}/api/v1/conversations`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({ detail: 'Failed to create conversation' }));
      throw new Error(err.detail || 'Failed to create conversation');
    }
    return response.json();
  },

  async closeConversation(id: number): Promise<Conversation> {
    const response = await fetch(`${API_BASE_URL}/api/v1/conversations/${id}/close`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({ detail: 'Failed to close conversation' }));
      throw new Error(err.detail || 'Failed to close conversation');
    }
    return response.json();
  },

  async getMessages(conversationId: number): Promise<Message[]> {
    const response = await fetch(`${API_BASE_URL}/api/v1/conversations/${conversationId}/messages`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({ detail: 'Failed to fetch messages' }));
      throw new Error(err.detail || 'Failed to fetch messages');
    }
    return response.json();
  },

  async sendMessage(conversationId: number, text: string): Promise<Message> {
    const response = await fetch(`${API_BASE_URL}/api/v1/conversations/${conversationId}/messages`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ message_text: text }),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({ detail: 'Failed to send message' }));
      throw new Error(err.detail || 'Failed to send message');
    }
    return response.json();
  },

  async markMessageRead(messageId: number): Promise<Message> {
    const response = await fetch(`${API_BASE_URL}/api/v1/messages/${messageId}/read`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({ detail: 'Failed to mark message read' }));
      throw new Error(err.detail || 'Failed to mark message read');
    }
    return response.json();
  },

  async markConversationRead(conversationId: number): Promise<{ status: string; read_count: number }> {
    const response = await fetch(`${API_BASE_URL}/api/v1/conversations/${conversationId}/read-all`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({ detail: 'Failed to mark conversation read' }));
      throw new Error(err.detail || 'Failed to mark conversation read');
    }
    return response.json();
  },
};
