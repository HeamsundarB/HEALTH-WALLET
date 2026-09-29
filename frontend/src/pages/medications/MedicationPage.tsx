import React, { useState, useEffect } from 'react';
import {
  Pill,
  Clock,
  Plus,
  Bell,
  BellOff,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Calendar,
  FileText,
  History,
  User,
  Building2,
  Filter,
} from 'lucide-react';
import { medicationsApi, Medication, MedicationHistory } from '../../services/medicationsApi';

export const MedicationPage: React.FC = () => {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [history, setHistory] = useState<MedicationHistory[]>([]);
  const [activeTab, setActiveTab] = useState<'ALL' | 'RECENTLY_STARTED' | 'ONGOING' | 'PAST'>('ALL');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);
  const [selectedMedHistory, setSelectedMedHistory] = useState<MedicationHistory[]>([]);
  const [selectedMedName, setSelectedMedName] = useState<string>('');

  // Add Medication Form state
  const [formData, setFormData] = useState({
    name: '',
    dosage: '',
    frequency: 'Once daily (1-0-0)',
    route: 'Oral',
    start_date: new Date().toISOString().split('T')[0],
    stop_date: '',
    reminder_enabled: false,
    reminder_time: '08:00 AM',
    hospital_name: '',
    instructions: '',
  });

  const fetchMedications = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await medicationsApi.getMedications();
      setMedications(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load medications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedications();
  }, []);

  const handleCreateMedication = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (formData.stop_date && formData.stop_date < formData.start_date) {
        alert('Stop date cannot be before start date.');
        return;
      }
      await medicationsApi.createMedication({
        name: formData.name,
        dosage: formData.dosage,
        frequency: formData.frequency,
        route: formData.route,
        start_date: formData.start_date,
        stop_date: formData.stop_date || null,
        reminder_enabled: formData.reminder_enabled,
        reminder_time: formData.reminder_enabled ? formData.reminder_time : null,
        hospital_name: formData.hospital_name || null,
        instructions: formData.instructions || null,
      });
      setShowAddModal(false);
      setFormData({
        name: '',
        dosage: '',
        frequency: 'Once daily (1-0-0)',
        route: 'Oral',
        start_date: new Date().toISOString().split('T')[0],
        stop_date: '',
        reminder_enabled: false,
        reminder_time: '08:00 AM',
        hospital_name: '',
        instructions: '',
      });
      fetchMedications();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to create medication.');
    }
  };

  const handleToggleReminder = async (med: Medication) => {
    try {
      const nextState = !med.reminder_enabled;
      const timeStr = nextState ? med.reminder_time || '08:00 AM' : undefined;
      await medicationsApi.updateReminder(med.id, nextState, timeStr);
      fetchMedications();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to update reminder.');
    }
  };

  const handleStopMedication = async (id: number, name: string) => {
    if (!window.confirm(`Are you sure you want to stop taking ${name}?`)) return;
    try {
      await medicationsApi.stopMedication(id);
      fetchMedications();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to stop medication.');
    }
  };

  const handleCompleteMedication = async (id: number, name: string) => {
    if (!window.confirm(`Mark ${name} course as completed?`)) return;
    try {
      await medicationsApi.completeMedication(id);
      fetchMedications();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to mark complete.');
    }
  };

  const handleViewHistory = async (med: Medication) => {
    try {
      setSelectedMedName(med.name);
      const hData = await medicationsApi.getMedicationHistory(med.id);
      setSelectedMedHistory(hData);
      setShowHistoryModal(true);
    } catch (err: any) {
      alert('Failed to load medication history.');
    }
  };

  // Categorization Filtering
  const today = new Date().toISOString().split('T')[0];
  const filteredMedications = medications.filter((m) => {
    if (activeTab === 'RECENTLY_STARTED') {
      const daysDiff = Math.floor((new Date(today).getTime() - new Date(m.start_date).getTime()) / (1000 * 3600 * 24));
      return m.status === 'ONGOING' && daysDiff >= 0 && daysDiff <= 14;
    }
    if (activeTab === 'ONGOING') {
      return m.status === 'ONGOING' && (!m.stop_date || m.stop_date >= today);
    }
    if (activeTab === 'PAST') {
      return m.status === 'STOPPED' || m.status === 'COMPLETED';
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 py-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 p-6 rounded-2xl text-white shadow-lg">
        <div>
          <div className="flex items-center space-x-3">
            <Pill className="w-8 h-8 text-emerald-200" />
            <h1 className="text-2xl font-bold">Medication Tracker & Wallet</h1>
          </div>
          <p className="mt-1 text-emerald-100 text-sm">
            Track active prescriptions, ongoing courses, dosage schedules, and set smart in-app reminders.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center space-x-2 bg-white text-emerald-700 hover:bg-emerald-50 px-4 py-2.5 rounded-xl font-semibold transition-all shadow-sm"
        >
          <Plus className="w-5 h-5" />
          <span>Add Medication</span>
        </button>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-2">
        <button
          onClick={() => setActiveTab('ALL')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'ALL'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          All Medications ({medications.length})
        </button>
        <button
          onClick={() => setActiveTab('RECENTLY_STARTED')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'RECENTLY_STARTED'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Recently Started (&le; 14 days)
        </button>
        <button
          onClick={() => setActiveTab('ONGOING')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'ONGOING'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Ongoing / Long-Term
        </button>
        <button
          onClick={() => setActiveTab('PAST')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'PAST'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Recently Stopped / Past
        </button>
      </div>

      {/* Loading & Error states */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600"></div>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Medication Cards List */}
      {!loading && !error && filteredMedications.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <Pill className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-800">No medications found</h3>
          <p className="text-gray-500 text-sm mt-1">No medication entries match the selected category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMedications.map((med) => (
            <div
              key={med.id}
              className="bg-white rounded-2xl border border-gray-200 hover:border-emerald-300 shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between"
            >
              <div>
                {/* Header Badge */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{med.name}</h3>
                    <p className="text-sm font-medium text-emerald-700">{med.dosage}</p>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      med.status === 'ONGOING'
                        ? 'bg-emerald-100 text-emerald-800'
                        : med.status === 'COMPLETED'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {med.status}
                  </span>
                </div>

                {/* Details grid */}
                <div className="mt-4 space-y-2 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span>
                      {med.frequency} ({med.route})
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span>
                      {med.start_date} {med.stop_date ? `to ${med.stop_date}` : '(Ongoing)'}
                    </span>
                  </div>
                  {med.prescription_reference && (
                    <div className="flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-gray-400" />
                      <span>Ref: <strong className="text-gray-800">{med.prescription_reference}</strong></span>
                    </div>
                  )}
                  {med.doctor_name && (
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span>{med.doctor_name}</span>
                    </div>
                  )}
                  {med.hospital_name && (
                    <div className="flex items-center space-x-2">
                      <Building2 className="w-4 h-4 text-gray-400" />
                      <span>{med.hospital_name}</span>
                    </div>
                  )}
                  {med.instructions && (
                    <p className="mt-2 p-2 bg-gray-50 rounded-lg text-xs italic text-gray-700">
                      "{med.instructions}"
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
                <button
                  onClick={() => handleToggleReminder(med)}
                  className={`flex items-center space-x-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-all ${
                    med.reminder_enabled
                      ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  title={med.reminder_enabled ? `Reminder set for ${med.reminder_time}` : 'Click to enable reminder'}
                >
                  {med.reminder_enabled ? <Bell className="w-3.5 h-3.5 text-emerald-600" /> : <BellOff className="w-3.5 h-3.5 text-gray-400" />}
                  <span>{med.reminder_enabled ? med.reminder_time || 'On' : 'Off'}</span>
                </button>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleViewHistory(med)}
                    className="p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all"
                    title="View History Audit Log"
                  >
                    <History className="w-4 h-4" />
                  </button>
                  {med.status === 'ONGOING' && (
                    <>
                      <button
                        onClick={() => handleCompleteMedication(med.id, med.name)}
                        className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                        title="Mark Complete"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleStopMedication(med.id, med.name)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        title="Stop Medication"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Medication Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-center items-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Add Personal Medication</h2>
            <form onSubmit={handleCreateMedication} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Medication Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Paracetamol"
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Dosage *</label>
                  <input
                    type="text"
                    required
                    value={formData.dosage}
                    onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                    placeholder="e.g. 500mg"
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Route *</label>
                  <select
                    value={formData.route}
                    onChange={(e) => setFormData({ ...formData, route: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                  >
                    <option value="Oral">Oral</option>
                    <option value="Topical">Topical</option>
                    <option value="Injection">Injection</option>
                    <option value="Inhalation">Inhalation</option>
                    <option value="Eye Drops">Eye Drops</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Frequency *</label>
                <input
                  type="text"
                  required
                  value={formData.frequency}
                  onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                  placeholder="e.g. Twice daily (1-0-1)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Start Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Stop Date (Optional)</label>
                  <input
                    type="date"
                    value={formData.stop_date}
                    onChange={(e) => setFormData({ ...formData, stop_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                  />
                </div>
              </div>

              {/* Reminder Section */}
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-emerald-800 uppercase flex items-center space-x-1">
                    <Bell className="w-3.5 h-3.5" />
                    <span>In-App Medication Reminder</span>
                  </span>
                  <input
                    type="checkbox"
                    checked={formData.reminder_enabled}
                    onChange={(e) => setFormData({ ...formData, reminder_enabled: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                  />
                </div>
                {formData.reminder_enabled && (
                  <div>
                    <label className="block text-xs text-emerald-700 mb-1">Reminder Time</label>
                    <input
                      type="text"
                      value={formData.reminder_time}
                      onChange={(e) => setFormData({ ...formData, reminder_time: e.target.value })}
                      placeholder="e.g. 08:00 AM"
                      className="w-full px-3 py-1.5 border border-emerald-300 rounded-lg text-sm bg-white"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Instructions / Notes</label>
                <textarea
                  rows={2}
                  value={formData.instructions}
                  onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                  placeholder="Take after meals..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold shadow-sm"
                >
                  Save Medication
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* History Audit Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-center items-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-bold text-gray-900">Audit History — {selectedMedName}</h3>
              <button onClick={() => setShowHistoryModal(false)} className="text-gray-400 hover:text-gray-600 font-bold">
                ✕
              </button>
            </div>
            <div className="mt-4 space-y-3 max-h-60 overflow-y-auto">
              {selectedMedHistory.length === 0 ? (
                <p className="text-sm text-gray-500">No audit history recorded.</p>
              ) : (
                selectedMedHistory.map((h) => (
                  <div key={h.id} className="p-3 bg-gray-50 rounded-xl text-xs space-y-1">
                    <div className="flex justify-between font-semibold text-gray-800">
                      <span>Action: {h.action}</span>
                      <span className="text-gray-500">{new Date(h.changed_at).toLocaleString()}</span>
                    </div>
                    {h.notes && <p className="text-gray-600 italic">"{h.notes}"</p>}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicationPage;
