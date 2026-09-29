import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  HealthRecord,
  RecordType,
  fetchHealthRecordsApi,
  createHealthRecordApi,
  updateHealthRecordApi,
  deleteHealthRecordApi,
  HealthRecordCreatePayload,
} from '../services/healthRecordsApi';
import { HealthTimeline } from '../components/records/HealthTimeline';
import { RecordModal } from '../components/records/RecordModal';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { LoadingState } from '../components/ui/LoadingState';
import { ErrorState } from '../components/ui/ErrorState';

import {
  FileText,
  Plus,
  Search,
  Filter,
  ListFilter,
  Calendar,
  Layers,
  Table as TableIcon,
  Info,
  Edit2,
  Trash2,
  Activity,
  CheckCircle2,
} from 'lucide-react';

const FILTER_TYPES: { label: string; value: string }[] = [
  { label: 'All Record Types', value: 'ALL' },
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

export const RecordsPage: React.FC = () => {
  const { token } = useAuth();
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Views
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'timeline' | 'table'>('timeline');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingRecord, setEditingRecord] = useState<HealthRecord | null>(null);

  const loadRecords = async () => {
    if (!token) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchHealthRecordsApi(token, selectedType, searchQuery);
      setRecords(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load health records');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadRecords();
    }, 200);
    return () => clearTimeout(timer);
  }, [token, selectedType, searchQuery]);

  const handleOpenAddModal = () => {
    setEditingRecord(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (record: HealthRecord) => {
    setEditingRecord(record);
    setIsModalOpen(true);
  };

  const handleSaveRecord = async (payload: HealthRecordCreatePayload, recordId?: number) => {
    if (!token) return;
    if (recordId) {
      await updateHealthRecordApi(token, recordId, payload);
    } else {
      await createHealthRecordApi(token, payload);
    }
    await loadRecords();
  };

  const handleDeleteRecord = async (recordId: number) => {
    if (!token) return;
    if (window.confirm('Are you sure you want to delete this synthetic health record?')) {
      try {
        await deleteHealthRecordApi(token, recordId);
        await loadRecords();
      } catch (err: any) {
        alert(err.message || 'Failed to delete record');
      }
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="inline-flex items-center space-x-2 bg-health-50 px-2.5 py-1 rounded-full text-xs font-semibold text-health-700 border border-health-200 mb-2">
            <Activity className="w-3.5 h-3.5" />
            <span>Phase 3 • Health Records & Chronological Timeline</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">
            Patient Health Records
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Chronological health event timeline owned strictly by your authenticated account.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={handleOpenAddModal}
          className="shrink-0 flex items-center shadow-md"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Add Synthetic Record
        </Button>
      </div>

      {/* Synthetic Prototype Notice */}
      <div className="bg-amber-50 border border-amber-200/80 p-3.5 rounded-xl text-xs text-amber-900 flex items-start space-x-2 shadow-xs">
        <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold">SYNTHETIC PROTOTYPE SCOPE:</span> Health records displayed here are controlled synthetic entries generated for student demonstration. They belong strictly to your authenticated session.
        </div>
      </div>

      {/* Controls Bar: Search, Type Filter, View Toggle */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search records by title, provider, or facility..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:ring-2 focus:ring-health-500 focus:border-health-500 text-slate-800 font-medium"
          />
        </div>

        {/* Filters & View Toggle */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center space-x-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="bg-transparent font-medium text-slate-700 border-none outline-none cursor-pointer"
            >
              {FILTER_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              onClick={() => setViewMode('timeline')}
              className={`px-3 py-1 rounded-md text-xs font-semibold flex items-center transition-all ${
                viewMode === 'timeline'
                  ? 'bg-white text-health-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5 mr-1" />
              Timeline View
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1 rounded-md text-xs font-semibold flex items-center transition-all ${
                viewMode === 'table'
                  ? 'bg-white text-health-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5 mr-1" />
              Table View
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <LoadingState message="Loading Health Timeline Records..." />
      ) : error ? (
        <ErrorState title="Unable to load health records" message={error} onRetry={loadRecords} />
      ) : viewMode === 'timeline' ? (
        <HealthTimeline
          records={records}
          onEdit={handleOpenEditModal}
          onDelete={handleDeleteRecord}
        />
      ) : (
        /* Table View */
        <Card title={`Health Records Summary (${records.length})`} subtitle="Tabular view of synthetic records">
          {records.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500">
              No health records match your criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600 border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-700 uppercase font-semibold text-[10px] tracking-wider">
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Record Type</th>
                    <th className="py-3 px-4">Title</th>
                    <th className="py-3 px-4">Provider / Facility</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {records.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 font-mono font-medium text-slate-700">{r.record_date}</td>
                      <td className="py-3 px-4">
                        <Badge variant="teal" size="sm">{r.record_type}</Badge>
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-800">{r.title}</td>
                      <td className="py-3 px-4 text-slate-500">
                        {r.provider_name || r.facility_name ? (
                          <span>
                            {r.provider_name} {r.facility_name ? `(${r.facility_name})` : ''}
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="neutral" size="sm">{r.status}</Badge>
                      </td>
                      <td className="py-3 px-4 text-right space-x-1">
                        <button
                          onClick={() => handleOpenEditModal(r)}
                          className="p-1 rounded hover:bg-slate-100 text-slate-600 hover:text-health-700"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteRecord(r.id)}
                          className="p-1 rounded hover:bg-rose-50 text-rose-500 hover:text-rose-700"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* Record Add/Edit Modal */}
      <RecordModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveRecord}
        recordToEdit={editingRecord}
      />
    </div>
  );
};
