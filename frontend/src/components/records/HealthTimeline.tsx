import React from 'react';
import { HealthRecord, RecordType } from '../../services/healthRecordsApi';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import {
  Stethoscope,
  Activity,
  AlertCircle,
  Building2,
  Syringe,
  FileSpreadsheet,
  FileImage,
  ShieldAlert,
  Pill,
  Calendar,
  Edit2,
  Trash2,
  User,
} from 'lucide-react';

interface HealthTimelineProps {
  records: HealthRecord[];
  onEdit: (record: HealthRecord) => void;
  onDelete: (recordId: number) => void;
}

const getRecordIcon = (type: RecordType) => {
  switch (type) {
    case 'CONSULTATION':
      return <Stethoscope className="w-4 h-4 text-blue-600" />;
    case 'DIAGNOSIS':
      return <Activity className="w-4 h-4 text-purple-600" />;
    case 'TREATMENT':
      return <AlertCircle className="w-4 h-4 text-teal-600" />;
    case 'HOSPITAL_ADMISSION':
      return <Building2 className="w-4 h-4 text-indigo-600" />;
    case 'SURGERY':
      return <Syringe className="w-4 h-4 text-rose-600" />;
    case 'LAB_TEST':
      return <FileSpreadsheet className="w-4 h-4 text-emerald-600" />;
    case 'IMAGING':
      return <FileImage className="w-4 h-4 text-cyan-600" />;
    case 'ALLERGY':
      return <ShieldAlert className="w-4 h-4 text-amber-600" />;
    case 'VACCINATION':
      return <Syringe className="w-4 h-4 text-sky-600" />;
    case 'PRESCRIPTION':
      return <Pill className="w-4 h-4 text-violet-600" />;
    default:
      return <Activity className="w-4 h-4 text-slate-600" />;
  }
};

const getRecordTypeBadge = (type: RecordType) => {
  switch (type) {
    case 'CONSULTATION':
      return <Badge variant="info" size="sm">Consultation</Badge>;
    case 'DIAGNOSIS':
      return <Badge variant="info" size="sm">Diagnosis</Badge>;
    case 'TREATMENT':
      return <Badge variant="teal" size="sm">Treatment</Badge>;
    case 'HOSPITAL_ADMISSION':
      return <Badge variant="neutral" size="sm">Admission</Badge>;
    case 'SURGERY':
      return <Badge variant="error" size="sm">Surgery</Badge>;
    case 'LAB_TEST':
      return <Badge variant="teal" size="sm">Lab Test</Badge>;
    case 'IMAGING':
      return <Badge variant="info" size="sm">Imaging</Badge>;
    case 'ALLERGY':
      return <Badge variant="warning" size="sm">Allergy</Badge>;
    case 'VACCINATION':
      return <Badge variant="teal" size="sm">Vaccination</Badge>;
    case 'PRESCRIPTION':
      return <Badge variant="info" size="sm">Prescription</Badge>;
    default:
      return <Badge variant="neutral" size="sm">{type}</Badge>;
  }
};

export const HealthTimeline: React.FC<HealthTimelineProps> = ({ records, onEdit, onDelete }) => {
  if (records.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <Activity className="w-12 h-12 mx-auto text-slate-300 mb-3" />
        <h3 className="text-base font-bold text-slate-700">No Health Records Found</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
          No synthetic timeline records match your search or filter. Click "Add Synthetic Record" to create one.
        </p>
      </div>
    );
  }

  // Sort records by record_date descending
  const sorted = [...records].sort(
    (a, b) => new Date(b.record_date).getTime() - new Date(a.record_date).getTime()
  );

  return (
    <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
      {sorted.map((record) => (
        <div key={record.id} className="relative group">
          {/* Node Icon on Timeline */}
          <div className="absolute -left-6 sm:-left-8 top-1 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white border-2 border-slate-300 group-hover:border-health-600 flex items-center justify-center shadow-xs transition-colors">
            {getRecordIcon(record.record_type)}
          </div>

          {/* Record Card */}
          <div className="bg-white rounded-xl border border-slate-200/90 hover:border-health-300 p-4 sm:p-5 shadow-xs transition-all">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div className="space-y-1">
                <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                  {getRecordTypeBadge(record.record_type)}
                  <span className="text-xs font-semibold text-slate-500 flex items-center">
                    <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" />
                    {record.record_date}
                  </span>
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono font-medium">
                    Record #{record.id}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-800 tracking-tight mt-1">
                  {record.title}
                </h3>
              </div>

              <div className="flex items-center space-x-1 self-end sm:self-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(record)}
                  className="text-slate-600 hover:text-health-700"
                  title="Edit Synthetic Record"
                >
                  <Edit2 className="w-3.5 h-3.5 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(record.id)}
                  className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                  title="Delete Record"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1" />
                  Delete
                </Button>
              </div>
            </div>

            {/* Content Details */}
            <div className="pt-3 space-y-2 text-xs">
              {record.description && (
                <p className="text-slate-600 leading-relaxed bg-slate-50/70 p-2.5 rounded-lg border border-slate-100">
                  {record.description}
                </p>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-500 pt-1">
                {record.provider_name && (
                  <div className="flex items-center space-x-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">
                      <strong className="text-slate-700 font-medium">Provider:</strong> {record.provider_name}
                    </span>
                  </div>
                )}
                {record.facility_name && (
                  <div className="flex items-center space-x-1.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">
                      <strong className="text-slate-700 font-medium">Facility:</strong> {record.facility_name}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
