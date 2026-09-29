import React, { useState, useEffect } from 'react';
import {
  FileText,
  Plus,
  User,
  Building2,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Pill,
  Trash2,
  Eye,
  Stethoscope,
} from 'lucide-react';
import { prescriptionsApi, Prescription, PrescriptionItemCreate } from '../../services/prescriptionsApi';
import { useAuth } from '../../context/AuthContext';

export const PrescriptionPage: React.FC = () => {
  const { user } = useAuth();
  const isDoctor = user?.roles?.some((r: any) => r === 'DOCTOR' || r?.name === 'DOCTOR') || false;

  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [showDetailModal, setShowDetailModal] = useState<boolean>(false);

  // Create Prescription Form state
  const [patientUserId, setPatientUserId] = useState<string>('');
  const [consultationId, setConsultationId] = useState<string>('');
  const [rxNotes, setRxNotes] = useState<string>('');
  const [medItems, setMedItems] = useState<PrescriptionItemCreate[]>([
    {
      name: '',
      dosage: '',
      frequency: 'Twice daily (1-0-1)',
      route: 'Oral',
      start_date: new Date().toISOString().split('T')[0],
      stop_date: '',
      reminder_enabled: true,
      reminder_time: '08:00 AM',
      instructions: '',
    },
  ]);

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await prescriptionsApi.getPrescriptions();
      setPrescriptions(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load prescriptions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const handleAddMedRow = () => {
    setMedItems([
      ...medItems,
      {
        name: '',
        dosage: '',
        frequency: 'Once daily (1-0-0)',
        route: 'Oral',
        start_date: new Date().toISOString().split('T')[0],
        stop_date: '',
        reminder_enabled: false,
        reminder_time: '',
        instructions: '',
      },
    ]);
  };

  const handleRemoveMedRow = (index: number) => {
    if (medItems.length === 1) return;
    setMedItems(medItems.filter((_, i) => i !== index));
  };

  const handleMedItemChange = (index: number, field: keyof PrescriptionItemCreate, value: any) => {
    const updated = [...medItems];
    updated[index] = { ...updated[index], [field]: value };
    setMedItems(updated);
  };

  const handleCreatePrescription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientUserId) {
      alert('Please enter a target Patient User ID.');
      return;
    }
    if (medItems.some((m) => !m.name || !m.dosage)) {
      alert('Please fill in Name and Dosage for all medication items.');
      return;
    }

    try {
      await prescriptionsApi.createPrescription({
        patient_user_id: parseInt(patientUserId, 10),
        consultation_id: consultationId ? parseInt(consultationId, 10) : null,
        notes: rxNotes || null,
        medications: medItems,
      });
      setShowCreateModal(false);
      setPatientUserId('');
      setConsultationId('');
      setRxNotes('');
      setMedItems([
        {
          name: '',
          dosage: '',
          frequency: 'Twice daily (1-0-1)',
          route: 'Oral',
          start_date: new Date().toISOString().split('T')[0],
          stop_date: '',
          reminder_enabled: true,
          reminder_time: '08:00 AM',
          instructions: '',
        },
      ]);
      fetchPrescriptions();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to create prescription.');
    }
  };

  const handleCancelPrescription = async (id: number, refStr: string) => {
    if (!window.confirm(`Are you sure you want to cancel Prescription ${refStr}?`)) return;
    try {
      await prescriptionsApi.cancelPrescription(id);
      fetchPrescriptions();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to cancel prescription.');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 py-6">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 p-6 rounded-2xl text-white shadow-lg">
        <div>
          <div className="flex items-center space-x-3">
            <FileText className="w-8 h-8 text-blue-200" />
            <h1 className="text-2xl font-bold">Prescription Wallet & Registry</h1>
          </div>
          <p className="mt-1 text-blue-100 text-sm">
            Official digital medical prescriptions issued by certified healthcare physicians.
          </p>
        </div>
        {isDoctor && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center justify-center space-x-2 bg-white text-blue-700 hover:bg-blue-50 px-4 py-2.5 rounded-xl font-semibold transition-all shadow-sm"
          >
            <Plus className="w-5 h-5" />
            <span>Issue Prescription</span>
          </button>
        )}
      </div>

      {/* Loading / Error */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Prescriptions List */}
      {!loading && !error && prescriptions.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-800">No prescriptions found</h3>
          <p className="text-gray-500 text-sm mt-1">There are no prescriptions recorded under your account.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {prescriptions.map((rx) => (
            <div
              key={rx.id}
              className="bg-white rounded-2xl border border-gray-200 hover:border-blue-300 shadow-sm hover:shadow-md transition-all p-6 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between border-b border-gray-100 pb-3">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Ref Code</span>
                    <h3 className="text-xl font-extrabold text-gray-900">{rx.prescription_reference}</h3>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      rx.status === 'ACTIVE'
                        ? 'bg-emerald-100 text-emerald-800'
                        : rx.status === 'COMPLETED'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {rx.status}
                  </span>
                </div>

                <div className="mt-4 space-y-2 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span>Issued Date: <strong>{rx.prescribed_date}</strong></span>
                  </div>
                  {rx.doctor_name && (
                    <div className="flex items-center space-x-2">
                      <Stethoscope className="w-4 h-4 text-gray-400" />
                      <span>Doctor: {rx.doctor_name}</span>
                    </div>
                  )}
                  {rx.patient_name && (
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span>Patient: {rx.patient_name}</span>
                    </div>
                  )}
                  {rx.notes && (
                    <p className="mt-2 p-2.5 bg-gray-50 rounded-xl text-xs text-gray-700 italic">
                      "{rx.notes}"
                    </p>
                  )}

                  {/* Included Medications Preview */}
                  <div className="mt-4">
                    <span className="text-xs font-semibold text-gray-700 uppercase">Prescribed Items ({rx.medications.length})</span>
                    <div className="mt-1.5 space-y-1">
                      {rx.medications.map((m) => (
                        <div key={m.id} className="flex items-center justify-between text-xs p-2 bg-blue-50/50 border border-blue-100 rounded-lg">
                          <span className="font-semibold text-gray-900">{m.name} ({m.dosage})</span>
                          <span className="text-gray-500">{m.frequency}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
                <button
                  onClick={() => {
                    setSelectedPrescription(rx);
                    setShowDetailModal(true);
                  }}
                  className="flex items-center space-x-1 text-xs font-semibold text-blue-700 hover:text-blue-900 bg-blue-50 px-3 py-2 rounded-xl"
                >
                  <Eye className="w-4 h-4" />
                  <span>View Details</span>
                </button>
                {isDoctor && rx.status === 'ACTIVE' && (
                  <button
                    onClick={() => handleCancelPrescription(rx.id, rx.prescription_reference)}
                    className="flex items-center space-x-1 text-xs font-semibold text-red-600 hover:text-red-800 bg-red-50 px-3 py-2 rounded-xl"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Cancel Prescription</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Doctor Issue Prescription Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-center items-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Issue Clinical Prescription</h2>
            <form onSubmit={handleCreatePrescription} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Target Patient User ID *</label>
                  <input
                    type="number"
                    required
                    value={patientUserId}
                    onChange={(e) => setPatientUserId(e.target.value)}
                    placeholder="e.g. 1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Consultation ID (Optional)</label>
                  <input
                    type="number"
                    value={consultationId}
                    onChange={(e) => setConsultationId(e.target.value)}
                    placeholder="e.g. 5"
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Clinical RX Notes</label>
                <textarea
                  rows={2}
                  value={rxNotes}
                  onChange={(e) => setRxNotes(e.target.value)}
                  placeholder="Take after food. Drink plenty of water."
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Dynamic Medication Rows */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-gray-700 uppercase">Medication Items ({medItems.length})</h3>
                  <button
                    type="button"
                    onClick={handleAddMedRow}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Item</span>
                  </button>
                </div>

                {medItems.map((med, idx) => (
                  <div key={idx} className="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-2 relative">
                    {medItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveMedRow(idx)}
                        className="absolute top-2 right-2 text-red-500 hover:text-red-700 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        required
                        placeholder="Medicine Name *"
                        value={med.name}
                        onChange={(e) => handleMedItemChange(idx, 'name', e.target.value)}
                        className="px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs"
                      />
                      <input
                        type="text"
                        required
                        placeholder="Dosage (e.g. 500mg) *"
                        value={med.dosage}
                        onChange={(e) => handleMedItemChange(idx, 'dosage', e.target.value)}
                        className="px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <input
                        type="text"
                        required
                        placeholder="Frequency *"
                        value={med.frequency}
                        onChange={(e) => handleMedItemChange(idx, 'frequency', e.target.value)}
                        className="px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs"
                      />
                      <select
                        value={med.route}
                        onChange={(e) => handleMedItemChange(idx, 'route', e.target.value)}
                        className="px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs"
                      >
                        <option value="Oral">Oral</option>
                        <option value="Topical">Topical</option>
                        <option value="Injection">Injection</option>
                        <option value="Inhalation">Inhalation</option>
                      </select>
                      <input
                        type="date"
                        required
                        value={med.start_date}
                        onChange={(e) => handleMedItemChange(idx, 'start_date', e.target.value)}
                        className="px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-sm"
                >
                  Submit Prescription
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Prescription Detail Modal */}
      {showDetailModal && selectedPrescription && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-center items-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-bold text-gray-900">Prescription {selectedPrescription.prescription_reference}</h3>
              <button onClick={() => setShowDetailModal(false)} className="text-gray-400 hover:text-gray-600 font-bold">
                ✕
              </button>
            </div>
            <div className="mt-4 space-y-3 text-sm text-gray-700">
              <p><strong>Status:</strong> {selectedPrescription.status}</p>
              <p><strong>Date:</strong> {selectedPrescription.prescribed_date}</p>
              {selectedPrescription.doctor_name && <p><strong>Doctor:</strong> {selectedPrescription.doctor_name}</p>}
              {selectedPrescription.notes && <p><strong>Notes:</strong> "{selectedPrescription.notes}"</p>}
              <div>
                <strong className="block mb-2 text-gray-900">Medications:</strong>
                <div className="space-y-2">
                  {selectedPrescription.medications.map((m) => (
                    <div key={m.id} className="p-3 bg-gray-50 rounded-xl text-xs space-y-1">
                      <p className="font-bold text-gray-900">{m.name} — {m.dosage}</p>
                      <p className="text-gray-600">Frequency: {m.frequency} ({m.route})</p>
                      <p className="text-gray-500">Dates: {m.start_date} {m.stop_date ? `to ${m.stop_date}` : ''}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrescriptionPage;
