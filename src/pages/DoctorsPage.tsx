import React, { useState } from 'react';
import { DOCTORS, Doctor } from '../data/hospitalData';
import { Clock, Award, Star, Calendar, CheckCircle2, ChevronRight, Stethoscope } from 'lucide-react';

interface DoctorsPageProps {
  setCurrentTab: (tab: string) => void;
  onSelectDoctorForBooking: (doctorName: string, department: string) => void;
}

export const DoctorsPage: React.FC<DoctorsPageProps> = ({ setCurrentTab, onSelectDoctorForBooking }) => {
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [selectedDoctorModal, setSelectedDoctorModal] = useState<Doctor | null>(null);

  const departments = [
    { id: 'all', label: 'All Specialists' },
    { id: 'general', label: 'General Medicine' },
    { id: 'orthopedics', label: 'Orthopedics' },
    { id: 'dental', label: 'Dental Care' },
    { id: 'emergency', label: 'Surgery & Trauma' },
    { id: 'cardiology', label: 'Cardiology' },
  ];

  const filteredDoctors = selectedDept === 'all' 
    ? DOCTORS 
    : DOCTORS.filter((d) => {
        if (selectedDept === 'emergency') {
          return d.department === 'emergency' || d.id === 'dr-anjali-deshpande';
        }
        if (selectedDept === 'cardiology') {
          return d.department === 'cardiology' || d.id === 'dr-anjali-deshpande';
        }
        return d.department === selectedDept;
      });

  const handleBookDoctor = (doc: Doctor) => {
    onSelectDoctorForBooking(doc.name, doc.department);
    setCurrentTab('appointment');
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      
      {/* Banner */}
      <section className="bg-linear-to-b from-sky-100/70 via-sky-50 to-white py-16 text-center border-b border-sky-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <span className="inline-block px-4 py-1.5 rounded-full bg-sky-200/70 text-sky-800 text-xs sm:text-sm font-bold tracking-wider uppercase mb-3">
            Medical Team
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
            Meet Our Specialists
          </h1>
          <p className="mt-3 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
            Experienced physicians, surgeons, and healthcare practitioners dedicated to clinical excellence and rapid patient recovery.
          </p>
        </div>
      </section>

      {/* Filter Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-none">
          {departments.map((dept) => (
            <button
              key={dept.id}
              onClick={() => setSelectedDept(dept.id)}
              className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedDept === dept.id
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {dept.label}
            </button>
          ))}
        </div>
      </div>

      {/* Doctors Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredDoctors.map((doc) => {
            const isLead = doc.id === 'dr-vaibhav-malkar';
            return (
              <article 
                key={doc.id}
                className={`bg-white rounded-3xl overflow-hidden border transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl flex flex-col justify-between ${
                  isLead ? 'border-sky-300 ring-2 ring-sky-100' : 'border-slate-200'
                }`}
              >
                {/* Doctor Avatar Card */}
                <div>
                  <div className="bg-linear-to-br from-slate-100 via-sky-50 to-blue-100 h-56 flex flex-col items-center justify-center relative p-4">
                    {isLead && (
                      <span className="absolute top-4 left-4 bg-sky-600 text-white text-[11px] font-black uppercase px-3 py-1 rounded-full shadow-xs">
                        Director & Lead
                      </span>
                    )}

                    <div className="w-24 h-24 rounded-full bg-white shadow-md flex items-center justify-center text-5xl border-4 border-white/80">
                      {doc.avatar}
                    </div>

                    <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs bg-white/90 backdrop-blur-xs py-1.5 px-3 rounded-xl border border-white/60">
                      <span className="flex items-center gap-1 text-slate-700 font-semibold">
                        <Clock className="w-3.5 h-3.5 text-sky-600" />
                        {doc.availability}
                      </span>
                      <span className="flex items-center gap-1 text-amber-600 font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        {doc.rating} / 5.0
                      </span>
                    </div>
                  </div>

                  {/* Doctor Info */}
                  <div className="p-6">
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">
                      {doc.name}
                    </h3>
                    <p className="text-sky-700 font-bold text-sm mt-0.5">
                      {doc.title}
                    </p>
                    <p className="text-slate-500 text-xs font-semibold mt-1">
                      {doc.qualifications}
                    </p>

                    <div className="mt-4 pt-4 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-sky-600 shrink-0" />
                        <span className="font-semibold text-slate-700">{doc.experience}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>OPD: {doc.opdTimings}</span>
                      </div>
                    </div>

                    {/* Specialties pills */}
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {doc.specialties.slice(0, 3).map((spec, i) => (
                        <span key={i} className="text-[11px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="p-6 pt-0 space-y-2">
                  <button
                    onClick={() => handleBookDoctor(doc)}
                    className="w-full py-3 bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Calendar className="w-4 h-4" />
                    Book Appointment
                  </button>
                  <button
                    onClick={() => setSelectedDoctorModal(doc)}
                    className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl border border-slate-200 transition-colors cursor-pointer"
                  >
                    View Doctor Profile & Bio
                  </button>
                </div>

              </article>
            );
          })}
        </div>
      </div>

      {/* Doctor Profile Modal */}
      {selectedDoctorModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setSelectedDoctorModal(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 text-xl font-bold w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center cursor-pointer"
            >
              ✕
            </button>

            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-sky-100 text-4xl flex items-center justify-center">
                {selectedDoctorModal.avatar}
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900">{selectedDoctorModal.name}</h3>
                <p className="text-sky-700 font-bold text-sm">{selectedDoctorModal.title}</p>
                <p className="text-slate-500 text-xs">{selectedDoctorModal.qualifications}</p>
              </div>
            </div>

            <div className="space-y-4 text-sm text-slate-600">
              <div>
                <h4 className="font-bold text-slate-900 mb-1">About Doctor</h4>
                <p className="leading-relaxed">{selectedDoctorModal.about}</p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 mb-1.5">Specialized Clinical Areas</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedDoctorModal.specialties.map((s, idx) => (
                    <span key={idx} className="bg-sky-50 text-sky-800 text-xs font-semibold px-2.5 py-1 rounded-lg border border-sky-100">
                      ✓ {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 block">Experience</span>
                  <span className="font-bold text-slate-800">{selectedDoctorModal.experience}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Consultation Fee</span>
                  <span className="font-bold text-slate-800">₹{selectedDoctorModal.consultationFee}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-500 block">OPD Schedule</span>
                  <span className="font-bold text-emerald-700">{selectedDoctorModal.opdTimings} ({selectedDoctorModal.availability})</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex gap-3">
              <button
                onClick={() => {
                  const doc = selectedDoctorModal;
                  setSelectedDoctorModal(null);
                  handleBookDoctor(doc);
                }}
                className="flex-1 py-3 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl text-sm transition-colors cursor-pointer"
              >
                Book Appointment Now
              </button>
              <button
                onClick={() => setSelectedDoctorModal(null)}
                className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
