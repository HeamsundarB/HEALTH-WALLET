import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Stethoscope, Search, MapPin, Building2, CheckCircle, Clock, ShieldCheck, Filter, AlertCircle, X, Globe, Award } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { useAuth } from '../../context/AuthContext';
import { searchDoctorsApi, DoctorProfile } from '../../services/providerApi';

export const DoctorDirectoryPage: React.FC = () => {
  const { token } = useAuth();
  const [doctors, setDoctors] = useState<DoctorProfile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [name, setName] = useState<string>('');
  const [specialization, setSpecialization] = useState<string>('');
  const [hospitalName, setHospitalName] = useState<string>('');
  const [locationCity, setLocationCity] = useState<string>('');
  const [verifiedOnly, setVerifiedOnly] = useState<boolean>(false);

  // Detail Modal
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorProfile | null>(null);

  const fetchDoctors = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await searchDoctorsApi(token, {
        name: name || undefined,
        specialization: specialization || undefined,
        hospital_name: hospitalName || undefined,
        location_city: locationCity || undefined,
        verified_only: verifiedOnly,
      });
      setDoctors(data);
    } catch (err: any) {
      setError(err.message || 'Failed to search doctors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, [token]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchDoctors();
  };

  const clearFilters = () => {
    setName('');
    setSpecialization('');
    setHospitalName('');
    setLocationCity('');
    setVerifiedOnly(false);
    setTimeout(() => {
      if (token) {
        searchDoctorsApi(token, {}).then(setDoctors).catch(() => {});
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
              <Stethoscope className="w-3.5 h-3.5" />
              <span>Phase 6 Provider Ecosystem</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold">Doctor Directory & Search</h1>
            <p className="text-xs text-teal-100 mt-1">
              Search verified physicians, specialists, and affiliated healthcare practitioners.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs font-semibold text-white border border-white/20">
              {doctors.length} Doctors Found
            </span>
          </div>
        </div>
      </div>

      {/* Synthetic Disclaimer Notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-800 flex items-start space-x-2">
        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold">Synthetic Demo Provider Data Notice:</span> Doctor directory details and credentials are sample records for prototype evaluation. No real medical practitioner registration or patient data is accessed.
        </div>
      </div>

      {/* Filter Form Card */}
      <Card title="Search & Filter Doctors" subtitle="Find medical specialists by name, specialty, hospital, or city">
        <form onSubmit={handleSearchSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Doctor Name</label>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="e.g. Dr. Priya"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-tealhealth-500 focus:border-tealhealth-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Specialization</label>
              <input
                type="text"
                placeholder="e.g. Cardiology, Neurology"
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-tealhealth-500 focus:border-tealhealth-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Hospital Name</label>
              <input
                type="text"
                placeholder="e.g. Apollo, Fortis"
                value={hospitalName}
                onChange={(e) => setHospitalName(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-tealhealth-500 focus:border-tealhealth-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">City / Location</label>
              <input
                type="text"
                placeholder="e.g. Mumbai, Bengaluru"
                value={locationCity}
                onChange={(e) => setLocationCity(e.target.value)}
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
              <span>Show Verified Providers Only</span>
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
                <span>Apply Filters</span>
              </button>
            </div>
          </div>
        </form>
      </Card>

      {/* Results Section */}
      {loading ? (
        <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
          <div className="animate-spin w-6 h-6 border-2 border-tealhealth-600 border-t-transparent rounded-full mx-auto mb-2"></div>
          <p className="text-xs text-slate-500">Searching doctor directory...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-xs text-red-700 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={fetchDoctors} className="underline font-semibold">Retry</button>
        </div>
      ) : doctors.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-slate-200 space-y-2">
          <Stethoscope className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-semibold text-slate-700">No Doctors Found</h3>
          <p className="text-xs text-slate-500">Try broadening your search keywords or clearing filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {doctors.map((doc) => {
            const isVerified = doc.credential?.verification_status === 'VERIFIED';
            return (
              <div
                key={doc.id}
                className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-11 h-11 rounded-full bg-tealhealth-50 border border-tealhealth-200 flex items-center justify-center text-tealhealth-700 font-bold text-base">
                        {doc.full_name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-800">{doc.full_name}</h3>
                        <p className="text-xs font-medium text-tealhealth-700">{doc.specialization}</p>
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

                  <div className="space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-3">
                    <div className="flex items-center space-x-2">
                      <Award className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{doc.qualification} ({doc.experience_years} yrs exp)</span>
                    </div>
                    {doc.credential?.professional_id && (
                      <div className="flex items-center space-x-2">
                        <ShieldCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="font-mono text-[11px] text-slate-500">ID: {doc.credential.professional_id}</span>
                      </div>
                    )}
                    {doc.languages && (
                      <div className="flex items-center space-x-2">
                        <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{doc.languages}</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-2">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="capitalize">{doc.consultation_type.toLowerCase()} Consultations</span>
                    </div>
                  </div>

                  {doc.affiliated_hospitals.length > 0 && (
                    <div className="pt-2">
                      <p className="text-[11px] font-semibold text-slate-500 mb-1 flex items-center gap-1">
                        <Building2 className="w-3 h-3" /> Affiliated Hospitals:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {doc.affiliated_hospitals.map((hosp, idx) => (
                          <span key={idx} className="bg-slate-100 text-slate-700 text-[10px] px-2 py-0.5 rounded font-medium">
                            {hosp}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-4 mt-3 border-t border-slate-100 flex items-center space-x-2">
                  <button
                    onClick={() => setSelectedDoctor(doc)}
                    className="flex-1 py-2 px-3 text-xs font-semibold text-tealhealth-700 bg-tealhealth-50 hover:bg-tealhealth-100 rounded-lg transition text-center"
                  >
                    View Bio
                  </button>
                  <Link
                    to={`/appointments/book?doctorId=${doc.id}`}
                    className="flex-1 py-2 px-3 text-xs font-semibold text-white bg-health-600 hover:bg-health-700 rounded-lg transition text-center"
                  >
                    Book Visit
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Doctor Detail Modal */}
      {selectedDoctor && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-tealhealth-100 text-tealhealth-800 flex items-center justify-center font-bold text-lg">
                  {selectedDoctor.full_name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">{selectedDoctor.full_name}</h3>
                  <p className="text-xs text-tealhealth-700 font-semibold">{selectedDoctor.specialization}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedDoctor(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700">
              <div>
                <span className="font-semibold block text-slate-500 text-[11px]">BIO & OVERVIEW</span>
                <p className="bg-slate-50 p-3 rounded-lg border border-slate-200/80 mt-1 italic">
                  {selectedDoctor.bio || 'No biography details provided.'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <span className="font-semibold text-slate-500 text-[11px] block">QUALIFICATION</span>
                  <span>{selectedDoctor.qualification}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-500 text-[11px] block">EXPERIENCE</span>
                  <span>{selectedDoctor.experience_years} Years</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-500 text-[11px] block">CONSULTATION MODE</span>
                  <span className="capitalize">{selectedDoctor.consultation_type.toLowerCase()}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-500 text-[11px] block">LANGUAGES</span>
                  <span>{selectedDoctor.languages || 'English'}</span>
                </div>
              </div>

              {selectedDoctor.availability_info && (
                <div className="pt-2">
                  <span className="font-semibold text-slate-500 text-[11px] block">AVAILABILITY HOURS</span>
                  <p className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 mt-1 text-slate-800 font-mono text-[11px]">
                    {selectedDoctor.availability_info}
                  </p>
                </div>
              )}

              {selectedDoctor.credential && (
                <div className="pt-2 border-t border-slate-100">
                  <span className="font-semibold text-slate-500 text-[11px] block mb-1">CREDENTIALS & VERIFICATION</span>
                  <div className="bg-emerald-50/70 border border-emerald-200 p-3 rounded-lg text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="font-semibold text-emerald-900">Medical Registration ID:</span>
                      <span className="font-mono text-emerald-950 font-bold">{selectedDoctor.credential.professional_id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Verification Status:</span>
                      <span className="font-semibold text-emerald-700">{selectedDoctor.credential.verification_status}</span>
                    </div>
                    <div className="text-[11px] text-slate-600 pt-1">
                      {selectedDoctor.credential.qualification_summary}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 text-right">
              <button
                onClick={() => setSelectedDoctor(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
