import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  MessageSquare,
  Send,
  User,
  Stethoscope,
  Check,
  CheckCheck,
  Plus,
  AlertCircle,
  RefreshCw,
  XCircle,
} from 'lucide-react';
import { chatApi, Conversation, Message } from '../../services/chatApi';
import { useAuth } from '../../context/AuthContext';

export const ChatPage: React.FC = () => {
  const { conversationId } = useParams<{ conversationId?: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isDoctor = user?.roles?.some((r: any) => r === 'DOCTOR' || r?.name === 'DOCTOR') || false;

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState<string>('');

  const [loading, setLoading] = useState<boolean>(true);
  const [sending, setSending] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // New Conversation Modal State
  const [showNewModal, setShowNewModal] = useState<boolean>(false);
  const [doctorProfileId, setDoctorProfileId] = useState<string>('');
  const [convType, setConvType] = useState<'GENERAL' | 'APPOINTMENT' | 'CONSULTATION' | 'PRESCRIPTION' | 'MEDICATION'>('GENERAL');
  const [initialMsg, setInitialMsg] = useState<string>('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchConversations = async (selectId?: number) => {
    try {
      setLoading(true);
      setError(null);
      const data = await chatApi.getConversations();
      setConversations(data);

      const targetId = selectId || (conversationId ? parseInt(conversationId, 10) : data[0]?.id);
      if (targetId) {
        const found = data.find((c) => c.id === targetId);
        if (found) {
          selectConversation(found);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load conversations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [conversationId]);

  const selectConversation = async (conv: Conversation) => {
    setActiveConv(conv);
    try {
      const msgs = await chatApi.getMessages(conv.id);
      setMessages(msgs);
      // Refresh list to update unread badges
      const updated = await chatApi.getConversations();
      setConversations(updated);
    } catch (err: any) {
      console.error('Failed to load messages', err);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConv || sending) return;

    try {
      setSending(true);
      const newMsg = await chatApi.sendMessage(activeConv.id, inputText.trim());
      setMessages((prev) => [...prev, newMsg]);
      setInputText('');
      
      // Update sidebar conversation preview
      const updated = await chatApi.getConversations();
      setConversations(updated);
    } catch (err: any) {
      alert(err.message || 'Failed to send message.');
    } finally {
      setSending(false);
    }
  };

  const handleCreateConversation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctorProfileId) {
      alert('Please enter a Doctor Profile ID.');
      return;
    }
    try {
      const conv = await chatApi.createConversation({
        doctor_profile_id: parseInt(doctorProfileId, 10),
        conversation_type: convType,
        initial_message: initialMsg || undefined,
      });
      setShowNewModal(false);
      setDoctorProfileId('');
      setInitialMsg('');
      fetchConversations(conv.id);
    } catch (err: any) {
      alert(err.message || 'Failed to create conversation.');
    }
  };

  const handleCloseConversation = async () => {
    if (!activeConv || !window.confirm('Are you sure you want to close this conversation?')) return;
    try {
      await chatApi.closeConversation(activeConv.id);
      fetchConversations(activeConv.id);
    } catch (err: any) {
      alert(err.message || 'Failed to close conversation.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-teal-700 via-emerald-700 to-cyan-700 p-6 rounded-2xl text-white shadow-lg">
        <div>
          <div className="flex items-center space-x-3">
            <MessageSquare className="w-8 h-8 text-teal-200" />
            <h1 className="text-2xl font-bold">Secure Clinical Messaging</h1>
          </div>
          <p className="mt-1 text-teal-100 text-sm">
            Direct, HIPAA/ABDM-compliant in-app messaging between Patients and Healthcare Physicians.
          </p>
        </div>
        {!isDoctor && (
          <button
            onClick={() => setShowNewModal(true)}
            className="flex items-center justify-center space-x-2 bg-white text-teal-800 hover:bg-teal-50 px-4 py-2.5 rounded-xl font-semibold transition-all shadow-sm"
          >
            <Plus className="w-5 h-5" />
            <span>New Message Thread</span>
          </button>
        )}
      </div>

      {/* Main Split-Pane Interface */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm grid grid-cols-1 lg:grid-cols-12 min-h-[600px] overflow-hidden">
        {/* Left Sidebar: Conversations List */}
        <div className="lg:col-span-4 border-r border-gray-200 flex flex-col bg-gray-50/50">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white">
            <h2 className="font-bold text-gray-900 text-sm">Active Conversations</h2>
            <button
              onClick={() => fetchConversations()}
              className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg"
              title="Refresh Conversations"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
            {loading && (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
              </div>
            )}

            {!loading && conversations.length === 0 && (
              <div className="p-8 text-center text-gray-500 text-sm">
                No active conversations found.
              </div>
            )}

            {!loading &&
              conversations.map((c) => {
                const isSelected = activeConv?.id === c.id;
                const otherName = isDoctor ? c.patient_name || 'Patient' : c.doctor_name || 'Doctor';
                return (
                  <div
                    key={c.id}
                    onClick={() => selectConversation(c)}
                    className={`p-4 cursor-pointer transition-all hover:bg-gray-100/80 ${
                      isSelected ? 'bg-teal-50/80 border-l-4 border-teal-600' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-9 h-9 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-xs shrink-0">
                          {isDoctor ? <User className="w-4 h-4" /> : <Stethoscope className="w-4 h-4" />}
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 text-sm leading-tight">{otherName}</h3>
                          {!isDoctor && c.doctor_specialization && (
                            <p className="text-xs text-teal-700 font-medium">{c.doctor_specialization}</p>
                          )}
                        </div>
                      </div>
                      {c.unread_count > 0 && (
                        <span className="px-2 py-0.5 bg-emerald-600 text-white font-bold rounded-full text-xs">
                          {c.unread_count}
                        </span>
                      )}
                    </div>

                    <div className="mt-2.5 flex items-center justify-between text-xs text-gray-500">
                      <span className="truncate max-w-[180px]">
                        {c.latest_message ? c.latest_message.message_text : 'No messages yet'}
                      </span>
                      <span className="shrink-0 font-medium">
                        {c.latest_message ? new Date(c.latest_message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Right Pane: Selected Conversation Thread */}
        <div className="lg:col-span-8 flex flex-col bg-white">
          {activeConv ? (
            <>
              {/* Active Conversation Header */}
              <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white shadow-2xs">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-sm">
                    {isDoctor ? <User className="w-5 h-5" /> : <Stethoscope className="w-5 h-5" />}
                  </div>
                  <div>
                    <h2 className="font-bold text-gray-900 text-base leading-tight">
                      {isDoctor ? activeConv.patient_name : activeConv.doctor_name}
                    </h2>
                    <p className="text-xs text-gray-500">
                      Type: <strong className="text-teal-700">{activeConv.conversation_type}</strong> | Status:{' '}
                      <span className={activeConv.status === 'ACTIVE' ? 'text-emerald-600 font-semibold' : 'text-gray-500'}>
                        {activeConv.status}
                      </span>
                    </p>
                  </div>
                </div>

                {activeConv.status === 'ACTIVE' && (
                  <button
                    onClick={handleCloseConversation}
                    className="flex items-center space-x-1 text-xs font-semibold text-gray-500 hover:text-red-600 px-3 py-1.5 rounded-lg border border-gray-200 hover:border-red-200 transition-all"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Close Thread</span>
                  </button>
                )}
              </div>

              {/* Messages History List */}
              <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/50 min-h-[400px]">
                {messages.length === 0 ? (
                  <div className="text-center py-16 text-gray-400 text-sm">
                    No messages in this thread yet. Send a message below.
                  </div>
                ) : (
                  messages.map((m) => {
                    const isMine = m.is_mine;
                    return (
                      <div
                        key={m.id}
                        className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-[75%] rounded-2xl p-4 shadow-2xs text-sm ${
                            isMine
                              ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-br-none'
                              : 'bg-white border border-gray-200 text-gray-900 rounded-bl-none'
                          }`}
                        >
                          <p className="whitespace-pre-wrap leading-relaxed">{m.message_text}</p>
                          <div
                            className={`mt-2 flex items-center justify-end space-x-1.5 text-[10px] ${
                              isMine ? 'text-teal-100' : 'text-gray-400'
                            }`}
                          >
                            <span>{new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            {isMine && (
                              <span>
                                {m.is_read ? <CheckCheck className="w-3.5 h-3.5 text-cyan-200" /> : <Check className="w-3.5 h-3.5 text-teal-200" />}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Composer */}
              {activeConv.status === 'ACTIVE' ? (
                <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 bg-white flex items-center space-x-3">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Type your clinical question or message..."
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-teal-500 transition-all"
                  />
                  <button
                    type="submit"
                    disabled={!inputText.trim() || sending}
                    className="bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white px-5 py-3 rounded-xl font-semibold flex items-center space-x-2 transition-all shadow-sm shrink-0"
                  >
                    <span>Send</span>
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                <div className="p-4 border-t border-gray-200 bg-gray-50 text-center text-xs text-gray-500 font-medium">
                  This conversation thread has been closed.
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-12 text-center text-gray-400">
              <MessageSquare className="w-16 h-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-bold text-gray-700">Select a Conversation</h3>
              <p className="text-sm mt-1 max-w-sm">Choose an active chat thread from the left menu to view messages or send a message.</p>
            </div>
          )}
        </div>
      </div>

      {/* New Conversation Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex justify-center items-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h2 className="text-xl font-bold text-gray-900">Start New Clinical Chat Thread</h2>
            <form onSubmit={handleCreateConversation} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Doctor Profile ID *</label>
                <input
                  type="number"
                  required
                  value={doctorProfileId}
                  onChange={(e) => setDoctorProfileId(e.target.value)}
                  placeholder="e.g. 1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Conversation Topic</label>
                <select
                  value={convType}
                  onChange={(e) => setConvType(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="GENERAL">GENERAL</option>
                  <option value="APPOINTMENT">APPOINTMENT</option>
                  <option value="CONSULTATION">CONSULTATION</option>
                  <option value="PRESCRIPTION">PRESCRIPTION</option>
                  <option value="MEDICATION">MEDICATION</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Initial Message (Optional)</label>
                <textarea
                  rows={3}
                  value={initialMsg}
                  onChange={(e) => setInitialMsg(e.target.value)}
                  placeholder="Hello Doctor, I have a question regarding..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-semibold shadow-sm"
                >
                  Start Conversation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatPage;
