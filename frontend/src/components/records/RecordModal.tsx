import React, { useState, useEffect } from 'react';
import { HealthRecord, RecordType, HealthRecordCreatePayload } from '../../services/healthRecordsApi';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { X, Info, ShieldCheck } from 'lucide-react';

interface RecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: HealthRecordCreatePayload, recordId?: number) => Promise<void>;
  recordToEdit?: HealthRecord | null;
}

const RECORD_TYPES: { label: string; value: RecordType }[] = [
  { label: 'Consultation', value: 'CONSULTATION' },
  { label: 'Diagnosis', value: 'DIAGNOSIS' },
  { label: 'Treatment', value: 'TREATMENT' },
  { label: 'Hospital Admission', value: 'HOSPITAL_ADMISSION' },
  { label: 'Surgery', value: 'SURGERY' },
  { label: 'Lab Test', value: 'LAB_TEST' },
  { label: 'Imaging', value: 'IMAGING' },
  { label: 'Allergy', value: 'ALLERGY' },
  { label: 'Vaccination', value: 'VACCINATION' },
  { label: 'Prescription', value: 'PRESCRIPTION' },
];

export const RecordModal: React.FC<RecordModalProps> = ({
  isOpen,
  onClose,
  onSave,
  recordToEdit,
}) => {
  const [recordType, setRecordType] = useState<RecordType>('CONSULTATION');
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [recordDate, setRecordDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [providerName, setProviderName] = useState<string>('');
  const [facilityName, setFacilityName] = useState<string>('');
  const [status, setStatus] = useState<string>('COMPLETED');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (recordToEdit) {
      setRecordType(recordToEdit.record_type);
      setTitle(recordToEdit.title);
      setDescription(recordToEdit.description || '');
      setRecordDate(recordToEdit.record_date);
      setProviderName(recordToEdit.provider_name || '');
      setFacilityName(recordToEdit.facility_name || '');
      setStatus(recordToEdit.status || 'COMPLETED');
    } else {
      setRecordType('CONSULTATION');
      setTitle('');
      setDescription('');
      setRecordDate(new Date().toISOString().split('T')[0]);
      setProviderName('');
      setFacilityName('');
      setStatus('COMPLETED');
    }
    setError(null);
  }, [recordToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    if (!recordDate) {
      setError('Record date is required');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onSave(
        {
          record_type: recordType,
          title: title.trim(),
          description: description.trim() || undefined,
          record_date: recordDate,
          provider_name: providerName.trim() || undefined,
          facility_name: facilityName.trim() || undefined,
          status,
        },
        recordToEdit ? recordToEdit.id : undefined
      );
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save health record');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-health-100 text-health-700 rounded-lg">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                {recordToEdit ? 'Edit Synthetic Record' : 'Add Synthetic Health Record'}
              </h2>
              <p className="text-xs text-slate-500">Phase 3 Synthetic Demo Entry</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Disclaimer */}
        <div className="bg-amber-50 border border-amber-200/80 p-3 rounded-lg text-xs text-amber-900 flex items-start space-x-2">
          <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">SYNTHETIC DEMO DATA:</span> This record is stored strictly for student prototype presentation. No external medical server or EHR integration.
          </div>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-medium mb-1">
                Record Type <span className="text-rose-500">*</span>
              </label>
              <select
                value={recordType}
                onChange={(e) => setRecordType(e.target.value as RecordType)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-health-500 focus:border-health-500 text-slate-800 font-medium"
              >
                {RECORD_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">
                Record Date <span className="text-rose-500">*</span>
              </label>
              <Input
                type="date"
                value={recordDate}
                onChange={(e) => setRecordDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-1">
              Title <span className="text-rose-500">*</span>
            </label>
            <Input
              type="text"
              placeholder="e.g. Annual Health Examination"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-1">Description</label>
            <textarea
              rows={3}
              placeholder="Detailed notes, symptoms, or outcomes..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-health-500 focus:border-health-500 text-slate-800 font-normal"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-medium mb-1">Provider / Doctor Name</label>
              <Input
                type="text"
                placeholder="e.g. Dr. Demo Physician"
                value={providerName}
                onChange={(e) => setProviderName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Facility / Hospital Name</label>
              <Input
                type="text"
                placeholder="e.g. City Innovation Healthcare"
                value={facilityName}
                onChange={(e) => setFacilityName(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-1">Record Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-health-500 focus:border-health-500 text-slate-800 font-medium"
            >
              <option value="COMPLETED">COMPLETED</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="SCHEDULED">SCHEDULED</option>
              <option value="HISTORICAL">HISTORICAL</option>
            </select>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              {recordToEdit ? 'Update Record' : 'Save Record'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
