import React, { useState, useEffect } from 'react';
import { Building2, Search, MapPin, CheckCircle, Clock, ShieldCheck, Filter, AlertCircle, X, Phone, Mail, Users, ChevronRight } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { useAuth } from '../../context/AuthContext';
import { searchHospitalsApi, HospitalProfile } from '../../services/providerApi';

export const HospitalDirectoryPage: React.FC = () => {
  const { token } = useAuth();
  const [hospitals, setHospitals] = useState<HospitalProfile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [name, setName] = useState<string>('');
  const [locationCity, setLocationCity] = useState<string>('');
  const [departmentName, setDepartmentName] = useState<string>('');
  const [verifiedOnly, setVerifiedOnly] = useState<boolean>(false);

  // Detail Modal
  const [selectedHospital, setSelectedHospital] = useState<HospitalProfile | null>(null);

  const fetchHospitals = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await searchHospitalsApi(token, {
        name: name || undefined,
        location_city: locationCity || undefined,
        department_name: departmentName || undefined,
        verified_only: verifiedOnly,
      });
      setHospitals(data);
    } catch (err: any) {
      setError(err.message || 'Failed to search hospital directory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHospitals();
  }, [token]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchHospitals();
  };

  const clearFilters = () => {
    setName('');
    setLocationCity('');
    setDepartmentName('');
    setVerifiedOnly(false);
    setTimeout(() => {
      if (token) {
        searchHospitalsApi(token, {}).then(setHospitals).catch(() => {});
      }
    }, 0);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="bg-gradient-to-r from-tealhealth-700 via-tealhealth-600 to-health-700 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 bg-white/10 px-3 py-1 rounded-full text-xs font-medium text-teal-100 border border-white/20 mb-2">
              <Building2 className="w-3.5 h-3.5" />
              <span>Phase 6 Provider Ecosystem</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold">Hospital & Medical Center Directory</h1>
            <p className="text-xs text-teal-100 mt-1">
              Explore verified healthcare institutions, specialty departments, and facility contacts.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs font-semibold text-white border border-white/20">
              {hospitals.length} Hospitals Found
            </span>
          </div>
        </div>
      </div>

      {/* Synthetic Disclaimer Notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-800 flex items-start space-x-2">
        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold">Synthetic Demo Hospital Data Notice:</span> Healthcare facility registrations, department lists, and contact numbers are synthetic prototype data for testing platform workflows.
        </div>
      </div>

      {/* Filter Form Card */}
      <Card title="Search & Filter Hospitals" subtitle="Find hospitals by facility name, city, or specialty department">
        <form onSubmit={handleSearchSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Hospital / Clinic Name</label>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="e.g. City Care Hospital"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-tealhealth-500 focus:border-tealhealth-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">City / Location</label>
              <input
                type="text"
                placeholder="e.g. Mumbai, Delhi"
                value={locationCity}
                onChange={(e) => setLocationCity(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-tealhealth-500 focus:border-tealhealth-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Department / Specialty</label>
              <input
                type="text"
                placeholder="e.g. Cardiology, Pediatrics"
                value={departmentName}
                onChange={(e) => setDepartmentName(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-tealhealth-500 focus:border-tealhealth-500"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
            <label className="flex items-center space-x-2 text-xs font-medium text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={verifiedOnly}
                onChange={(e) => setVerifiedOnly(e.target.checked)}
                className="rounded border-slate-300 text-tealhealth-600 focus:ring-tealhealth-500 h-4 w-4"
              />
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Verified Institutions Only</span>
            </label>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={clearFilters}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium transition"
              >
                Clear Filters
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs text-white bg-tealhealth-600 hover:bg-tealhealth-700 rounded-lg font-semibold shadow-xs transition flex items-center space-x-1.5"
              >
                <Filter className="w-3.5 h-3.5" />
                <span>Search Directory</span>
              </button>
            </div>
          </div>
        </form>
      </Card>

      {/* Results Section */}
      {loading ? (
        <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
          <div className="animate-spin w-6 h-6 border-2 border-tealhealth-600 border-t-transparent rounded-full mx-auto mb-2"></div>
          <p className="text-xs text-slate-500">Searching hospital directory...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-xs text-red-700 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={fetchHospitals} className="underline font-semibold">Retry</button>
        </div>
      ) : hospitals.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-slate-200 space-y-2">
          <Building2 className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-semibold text-slate-700">No Hospitals Found</h3>
          <p className="text-xs text-slate-500">Try broadening your search keywords or clearing filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {hospitals.map((hosp) => {
            const isVerified = hosp.verification_status === 'VERIFIED';
            return (
              <div
                key={hosp.id}
                className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-11 h-11 rounded-xl bg-tealhealth-50 border border-tealhealth-200 flex items-center justify-center text-tealhealth-700 shrink-0">
                        <Building2 className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-800">{hosp.name}</h3>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{hosp.location_city}, {hosp.state}</span>
                        </p>
                      </div>
                    </div>
                    {isVerified ? (
                      <Badge variant="success">
                        <CheckCircle className="w-3 h-3 mr-1 inline" />
                        Verified
                      </Badge>
                    ) : (
                      <Badge variant="warning">Pending</Badge>
                    )}
                  </div>

                  <div className="space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-3">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-medium">Registration Number:</span>
                      <span className="font-mono text-[11px] font-semibold text-slate-700">{hosp.registration_number}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-medium">Working Hours:</span>
                      <span className="font-semibold text-slate-700">{hosp.working_hours}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-medium">Affiliated Doctors:</span>
                      <span className="inline-flex items-center space-x-1 font-semibold text-tealhealth-700 bg-tealhealth-50 px-2 py-0.5 rounded">
                        <Users className="w-3 h-3" />
                        <span>{hosp.affiliated_doctors_count} Doctors</span>
                      </span>
                    </div>
                  </div>

                  {hosp.departments.length > 0 && (
                    <div className="pt-2 border-t border-slate-100">
                      <p className="text-[11px] font-semibold text-slate-500 mb-1.5">Departments ({hosp.departments.length}):</p>
                      <div className="flex flex-wrap gap-1.5">
                        {hosp.departments.map((dept) => (
                          <span
                            key={dept.id}
                            className="bg-slate-100 border border-slate-200/60 text-slate-700 text-[10px] px-2 py-0.5 rounded-md font-medium"
                          >
                            {dept.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-4 mt-3 border-t border-slate-100">
                  <button
                    onClick={() => setSelectedHospital(hosp)}
                    className="w-full py-2 px-3 text-xs font-semibold text-tealhealth-700 bg-tealhealth-50 hover:bg-tealhealth-100 rounded-lg transition text-center flex items-center justify-center space-x-1"
                  >
                    <span>View Hospital Details & Services</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Hospital Detail Modal */}
      {selectedHospital && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-tealhealth-100 text-tealhealth-800 flex items-center justify-center font-bold">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">{selectedHospital.name}</h3>
                  <p className="text-xs text-slate-500">{selectedHospital.location_city}, {selectedHospital.state}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedHospital(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-700">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 space-y-2">
                <div className="flex items-center space-x-2 text-slate-700">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{selectedHospital.address}</span>
                </div>
                <div className="flex items-center space-x-2 text-slate-700">
                  <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{selectedHospital.contact_phone}</span>
                </div>
                <div className="flex items-center space-x-2 text-slate-700">
                  <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{selectedHospital.contact_email}</span>
                </div>
                <div className="flex items-center space-x-2 text-slate-700">
                  <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>Hours: {selectedHospital.working_hours}</span>
                </div>
              </div>

              {selectedHospital.services_summary && (
                <div>
                  <span className="font-semibold block text-slate-500 text-[11px] mb-1">SERVICES & FACILITY OVERVIEW</span>
                  <p className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-slate-700 leading-relaxed">
                    {selectedHospital.services_summary}
                  </p>
                </div>
              )}

              <div>
                <span className="font-semibold block text-slate-500 text-[11px] mb-1">DEPARTMENTS ({selectedHospital.departments.length})</span>
                {selectedHospital.departments.length === 0 ? (
                  <p className="text-slate-400 italic text-[11px]">No active departments registered yet.</p>
                ) : (
                  <div className="grid grid-cols-1 gap-2">
                    {selectedHospital.departments.map((dept) => (
                      <div key={dept.id} className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-lg">
                        <div className="font-semibold text-slate-800 text-xs">{dept.name}</div>
                        {dept.description && (
                          <p className="text-[11px] text-slate-500 mt-0.5">{dept.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-slate-100">
                <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-emerald-900 text-xs">Official Registration</div>
                    <div className="font-mono text-[11px] text-emerald-950 font-bold">{selectedHospital.registration_number}</div>
                  </div>
                  <Badge variant="success">{selectedHospital.verification_status}</Badge>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 text-right">
              <button
                onClick={() => setSelectedHospital(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
              >
                Close Hospital Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
