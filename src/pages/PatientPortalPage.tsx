import React, { useState, useEffect } from 'react';
import { useAuth } from '../firebase/authContext';
import { 
  AppointmentRecord, 
  PatientReport,
  PatientVitals,
  subscribeToPatientAppointments, 
  cancelAppointment 
} from '../firebase/dbService';
import { 
  Calendar, 
  Clock, 
  User, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  FileText, 
  PlusCircle, 
  Phone, 
  Printer, 
  HeartPulse, 
  Activity, 
  CreditCard, 
  ShieldCheck, 
  Download, 
  ArrowRight,
  ClipboardList,
  LogOut
} from 'lucide-react';
import { HOSPITAL_INFO } from '../data/hospitalData';

interface PatientPortalPageProps {
  setCurrentTab: (tab: string) => void;
}

export const PatientPortalPage: React.FC<PatientPortalPageProps> = ({ setCurrentTab }) => {
  const { user, profile, logout } = useAuth();
  const [appointments, setAppointments] = useState<AppointmentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'appointments' | 'reports' | 'vitals' | 'invoices'>('appointments');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Modal for printable pass
  const [printPassAppt, setPrintPassAppt] = useState<AppointmentRecord | null>(null);

  // Real-time Firestore subscription for this patient
  useEffect(() => {
    if (!user) return;
    setLoading(true);

    const unsubscribe = subscribeToPatientAppointments(user.uid, (list) => {
      setAppointments(list);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleCancel = async (apptId: string) => {
    try {
      await cancelAppointment(apptId);
      setNotification({ message: 'Your appointment was cancelled.', type: 'success' });
      setTimeout(() => setNotification(null), 4000);
    } catch (err) {
      console.error('Cancel error:', err);
      setNotification({ message: 'Failed to cancel appointment. Please contact hospital reception.', type: 'error' });
    }
  };

  // Collect all reports and vitals across all visits for this patient
  const allReports: PatientReport[] = appointments.flatMap((a) => a.reports || []);
  const latestVitals: PatientVitals | undefined = appointments.find((a) => a.vitals)?.vitals;

  const pendingCount = appointments.filter((a) => a.status === 'pending').length;
  const confirmedCount = appointments.filter((a) => a.status === 'confirmed').length;

  return (
    <div className="bg-slate-50 min-h-screen pb-24">
      
      {/* Patient Welcome Header */}
      <section className="bg-white border-b border-slate-200 py-8 px-4 sm:px-6 lg:px-8 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-emerald-500 to-teal-700 text-white flex items-center justify-center text-3xl font-black shadow-md shrink-0">
              {profile?.displayName ? profile.displayName.charAt(0).toUpperCase() : 'P'}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-emerald-100 text-emerald-800 text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <User className="w-3.5 h-3.5" /> Patient Portal
                </span>
                <span className="text-xs text-slate-500">
                  ID: <span className="font-mono font-bold text-slate-700">{user?.uid.slice(0, 8)}</span>
                </span>
                <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Live Records Synced
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
                {profile?.displayName || 'Valued Patient'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Email: {user?.email} • Phone: {profile?.phone || 'Not provided'} • Dr. Malkar Hospital, Rahata
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setCurrentTab('appointment')}
              className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              Book New Appointment
            </button>
            <a
              href={`tel:${HOSPITAL_INFO.phone}`}
              className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Phone className="w-3.5 h-3.5" />
              Emergency 24/7
            </a>
            <button
              onClick={async () => {
                await logout();
                setCurrentTab('home');
              }}
              className="px-4 py-2.5 bg-slate-100 hover:bg-red-50 hover:text-red-700 text-slate-700 font-bold text-xs sm:text-sm rounded-xl border border-slate-200 hover:border-red-200 transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Log Out from Patient Profile"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </section>

      {/* Notification Toast */}
      {notification && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className={`p-4 rounded-2xl flex items-center justify-between shadow-xs ${
            notification.type === 'success' 
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-900' 
              : 'bg-red-50 border border-red-200 text-red-900'
          }`}>
            <span className="text-sm font-semibold">{notification.message}</span>
            <button 
              onClick={() => setNotification(null)}
              className="text-xs font-bold text-slate-400 hover:text-slate-800 ml-4 cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Patient Stats Overview */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Total Appointments
            </span>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              {appointments.length}
            </p>
            <span className="text-xs text-slate-500 font-semibold">Registered Visits</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Confirmed Visits
            </span>
            <p className="text-2xl sm:text-3xl font-black text-emerald-600 mt-1">
              {confirmedCount}
            </p>
            <span className="text-xs text-emerald-700 font-semibold">Time Slot Allocated</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Awaiting Doctor Time
            </span>
            <p className="text-2xl sm:text-3xl font-black text-amber-600 mt-1">
              {pendingCount}
            </p>
            <span className="text-xs text-amber-700 font-semibold">Under Doctor Review</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Lab Reports on File
            </span>
            <p className="text-2xl sm:text-3xl font-black text-sky-700 mt-1">
              {allReports.length}
            </p>
            <span className="text-xs text-sky-600 font-semibold">Verified Diagnostics</span>
          </div>

        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="flex flex-wrap items-center gap-2 pb-4 border-b border-slate-200">
          <button
            onClick={() => setActiveTab('appointments')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'appointments'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>My Appointments ({appointments.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'reports'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Diagnostic Reports & Tests ({allReports.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('vitals')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'vitals'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Vital Signs & Health Tracker</span>
          </button>

          <button
            onClick={() => setActiveTab('invoices')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'invoices'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Consultation Receipts</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        
        {loading ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
            <div className="w-8 h-8 border-3 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-slate-500 text-sm font-medium">Loading your patient healthcare profile...</p>
          </div>
        ) : activeTab === 'appointments' ? (

          /* TAB 1: APPOINTMENTS LIST */
          appointments.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center text-3xl mx-auto">
                📅
              </div>
              <h3 className="text-xl font-bold text-slate-900">No Appointments Booked Yet</h3>
              <p className="text-slate-500 text-sm max-w-md mx-auto">
                Schedule your consultation with Dr. Vaibhav G. Malkar or our medical team in Rahata.
              </p>
              <button
                onClick={() => setCurrentTab('appointment')}
                className="px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm rounded-xl transition-colors cursor-pointer"
              >
                Book Your First Visit
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              {appointments.map((appt) => {
                const isPending = appt.status === 'pending';
                const isConfirmed = appt.status === 'confirmed';
                const isCompleted = appt.status === 'completed';
                const isCancelled = appt.status === 'cancelled';

                return (
                  <div
                    key={appt.id}
                    className={`bg-white rounded-3xl p-6 sm:p-7 border transition-all ${
                      isPending
                        ? 'border-amber-300 ring-2 ring-amber-100 bg-linear-to-r from-amber-50/20 via-white to-white'
                        : isConfirmed
                        ? 'border-emerald-200 shadow-sm hover:shadow-md'
                        : 'border-slate-200'
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
                      
                      <div className="space-y-3 max-w-3xl">
                        
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs font-bold text-sky-800 bg-sky-50 px-2.5 py-0.5 rounded-lg border border-sky-100">
                            REF: {appt.id?.slice(0, 8)}
                          </span>

                          {/* Live Status Indicators */}
                          {isPending && (
                            <span className="text-xs font-black bg-amber-100 text-amber-900 px-3 py-1 rounded-full flex items-center gap-1.5 border border-amber-200">
                              <span className="w-2 h-2 rounded-full bg-amber-600 animate-ping"></span>
                              Status: Pending Doctor Time Allotment
                            </span>
                          )}

                          {isConfirmed && (
                            <span className="text-xs font-black bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full flex items-center gap-1.5 border border-emerald-200">
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                              Status: Confirmed by Doctor
                            </span>
                          )}

                          {isCompleted && (
                            <span className="text-xs font-bold bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full">
                              Completed ✓
                            </span>
                          )}

                          {isCancelled && (
                            <span className="text-xs font-bold bg-red-100 text-red-800 px-2.5 py-0.5 rounded-full">
                              Cancelled
                            </span>
                          )}

                          <span className="text-xs text-slate-500 capitalize">
                            • {appt.department} Department
                          </span>
                        </div>

                        {/* Consulting Doctor & Appointment Date */}
                        <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs sm:text-sm text-slate-700">
                          <span className="flex items-center gap-1.5 font-bold text-slate-900 text-base">
                            👨‍⚕️ {appt.doctorName}
                          </span>

                          <span className="flex items-center gap-1.5 font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg">
                            <Calendar className="w-4 h-4 text-sky-600" />
                            {appt.appointmentDate}
                          </span>

                          {/* Doctor-allotted Time Slot or Requested Window */}
                          {isConfirmed && appt.assignedTime ? (
                            <span className="flex items-center gap-1.5 font-black text-emerald-800 bg-emerald-100/80 px-3 py-1 rounded-lg border border-emerald-300">
                              <Clock className="w-4 h-4 text-emerald-700" />
                              Doctor Allotted Time: {appt.assignedTime}
                            </span>
                          ) : (
                            <span className="flex items-center gap-1.5 text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                              <Clock className="w-4 h-4 text-amber-600" />
                              Requested Window: {appt.preferredTimeWindow || 'Morning'}
                            </span>
                          )}
                        </div>

                        {/* Confirmed Details: Token, Chamber & Instructions */}
                        {isConfirmed && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200">
                            <div>
                              <span className="text-slate-500 font-medium block">Your Queue Token:</span>
                              <span className="font-mono font-black text-emerald-900 text-base">{appt.tokenNumber || 'TKN-01'}</span>
                            </div>
                            <div>
                              <span className="text-slate-500 font-medium block">Consultation Chamber:</span>
                              <span className="font-bold text-slate-900 text-sm">{appt.roomNumber || 'OPD Chamber 01'}</span>
                            </div>
                            {appt.preparationInstructions && (
                              <div className="sm:col-span-2 pt-2 border-t border-emerald-200/60 mt-1">
                                <span className="text-emerald-950 font-bold">Preparation Advice: </span>
                                <span className="text-slate-700 leading-relaxed">{appt.preparationInstructions}</span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Pending Banner Explanation */}
                        {isPending && (
                          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
                            <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                            <div>
                              <p className="font-bold text-sm text-amber-950 mb-0.5">
                                Awaiting Doctor Schedule & Time Slot Allocation
                              </p>
                              <p className="leading-relaxed">
                                Dr. Vaibhav G. Malkar is reviewing your clinical request. Once the doctor assigns your consultation time slot, your exact time, token number, and room number will appear here in real time.
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Patient Reported Symptoms */}
                        {appt.reason && (
                          <p className="text-xs text-slate-600">
                            <strong>Chief Complaints:</strong> {appt.reason}
                          </p>
                        )}

                        {/* Consultation fee status */}
                        <div className="flex items-center gap-2 text-xs">
                          <span className={`px-2.5 py-0.5 rounded-md font-bold ${
                            appt.payment?.paymentStatus === 'paid'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}>
                            Fee: ₹{appt.payment?.consultationFee || 400} ({appt.payment?.paymentStatus === 'paid' ? 'Paid ✓' : 'Pay at Counter'})
                          </span>
                        </div>

                      </div>

                      {/* Right Action Buttons */}
                      <div className="flex flex-wrap lg:flex-col items-stretch justify-center gap-2 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                        {isConfirmed && (
                          <button
                            onClick={() => setPrintPassAppt(appt)}
                            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                          >
                            <Printer className="w-4 h-4" />
                            <span>View / Print Pass</span>
                          </button>
                        )}

                        {!isCancelled && (
                          <button
                            onClick={() => handleCancel(appt.id!)}
                            className="px-4 py-2 text-slate-500 hover:text-red-600 hover:bg-red-50 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
                          >
                            Cancel Appointment
                          </button>
                        )}
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          )

        ) : activeTab === 'reports' ? (

          /* TAB 2: DIAGNOSTIC LAB REPORTS */
          allReports.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
              <FileText className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-slate-900">No Diagnostic Reports on Record</h3>
              <p className="text-slate-500 text-xs sm:text-sm max-w-md mx-auto mt-1">
                Any blood tests, X-rays, or ECGs ordered and verified by Dr. Vaibhav G. Malkar will be archived here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {allReports.map((rep) => (
                <div key={rep.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-sky-600 shrink-0" />
                        {rep.name}
                      </h4>
                      <span className="text-[11px] text-slate-500">{rep.date} • {rep.type}</span>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                      Verified
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <strong>Findings:</strong> {rep.summary}
                  </p>

                  {rep.doctorComments && (
                    <p className="text-xs text-sky-900 bg-sky-50 p-2.5 rounded-xl border border-sky-100">
                      <strong>Doctor Clinical Review:</strong> {rep.doctorComments}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )

        ) : activeTab === 'vitals' ? (

          /* TAB 3: VITALS TRACKER */
          !latestVitals ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
              <Activity className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-slate-900">No Vital Signs Recorded Yet</h3>
              <p className="text-slate-500 text-xs sm:text-sm max-w-md mx-auto mt-1">
                During your clinic visit, Dr. Vaibhav G. Malkar will record your Blood Pressure, Pulse, Glucose, and SpO2.
              </p>
            </div>
          ) : (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-sky-600" />
                  Your Latest Health & Vital Readings
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Recorded by Dr. Malkar Hospital medical desk.</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-sky-50/60 rounded-2xl border border-sky-100 text-center">
                  <span className="text-xs font-bold text-slate-500 uppercase">Blood Pressure</span>
                  <p className="text-xl font-black text-slate-900 mt-1">{latestVitals.bp || '120/80'}</p>
                  <span className="text-[11px] text-emerald-600 font-semibold">Normal Range</span>
                </div>

                <div className="p-4 bg-sky-50/60 rounded-2xl border border-sky-100 text-center">
                  <span className="text-xs font-bold text-slate-500 uppercase">Pulse Rate</span>
                  <p className="text-xl font-black text-slate-900 mt-1">{latestVitals.pulse || '74 bpm'}</p>
                  <span className="text-[11px] text-emerald-600 font-semibold">Steady Rhythm</span>
                </div>

                <div className="p-4 bg-sky-50/60 rounded-2xl border border-sky-100 text-center">
                  <span className="text-xs font-bold text-slate-500 uppercase">Blood Glucose</span>
                  <p className="text-xl font-black text-slate-900 mt-1">{latestVitals.sugar || '110 mg/dL'}</p>
                  <span className="text-[11px] text-slate-500">Post-Meal / Fasting</span>
                </div>

                <div className="p-4 bg-sky-50/60 rounded-2xl border border-sky-100 text-center">
                  <span className="text-xs font-bold text-slate-500 uppercase">Oxygen (SpO2)</span>
                  <p className="text-xl font-black text-emerald-700 mt-1">{latestVitals.spo2 || '99%'}</p>
                  <span className="text-[11px] text-emerald-600 font-semibold">Optimal</span>
                </div>

                <div className="p-4 bg-sky-50/60 rounded-2xl border border-sky-100 text-center">
                  <span className="text-xs font-bold text-slate-500 uppercase">Body Temp</span>
                  <p className="text-xl font-black text-slate-900 mt-1">{latestVitals.temp || '98.6 °F'}</p>
                  <span className="text-[11px] text-slate-500">Afebrile</span>
                </div>

                <div className="p-4 bg-sky-50/60 rounded-2xl border border-sky-100 text-center">
                  <span className="text-xs font-bold text-slate-500 uppercase">Body Weight</span>
                  <p className="text-xl font-black text-slate-900 mt-1">{latestVitals.weight || '68 kg'}</p>
                  <span className="text-[11px] text-slate-500">Stable</span>
                </div>
              </div>
            </div>
          )

        ) : (

          /* TAB 4: CONSULTATION RECEIPTS & INVOICES */
          appointments.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
              <CreditCard className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">No billing receipts on file yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {appointments.map((appt) => (
                <div key={appt.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                        {appt.payment?.invoiceNumber || `INV-${appt.id?.slice(0, 6)}`}
                      </span>
                      <span className={`text-xs font-black px-2.5 py-0.5 rounded-full ${
                        appt.payment?.paymentStatus === 'paid'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-900'
                      }`}>
                        {appt.payment?.paymentStatus === 'paid' ? 'PAID ✓' : 'Pay at Clinic Counter'}
                      </span>
                    </div>

                    <h4 className="font-bold text-slate-900 text-sm mt-1.5">
                      Consultation with {appt.doctorName}
                    </h4>
                    <p className="text-xs text-slate-500">
                      Date: {appt.appointmentDate} • Total Amount: <strong>₹{appt.payment?.totalAmount || 400}.00</strong>
                    </p>
                  </div>

                  <button
                    onClick={() => setPrintPassAppt(appt)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    Print Receipt
                  </button>
                </div>
              ))}
            </div>
          )

        )}

      </div>

      {/* ============================================================== */}
      {/* PRINT APPOINTMENT PASS MODAL */}
      {/* ============================================================== */}
      {printPassAppt && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative animate-in zoom-in-95">
            <button
              onClick={() => setPrintPassAppt(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 text-xl font-bold w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center cursor-pointer"
            >
              ✕
            </button>

            <div className="text-center pb-4 border-b border-slate-200">
              <div className="w-12 h-12 rounded-2xl bg-sky-600 text-white flex items-center justify-center text-2xl mx-auto mb-2 shadow-xs">
                🏥
              </div>
              <h3 className="text-xl font-black text-slate-900">Dr. Malkar Hospital</h3>
              <p className="text-[11px] text-slate-500">423107, Rahata, Ahilyanagar • Hotline: +91 9579674964</p>
              <div className="mt-2 inline-block bg-emerald-100 text-emerald-800 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
                Confirmed Appointment Pass
              </div>
            </div>

            <div className="py-4 space-y-2.5 text-xs text-slate-700">
              <div className="flex justify-between pb-1.5 border-b border-slate-100">
                <span className="text-slate-500">Patient:</span>
                <span className="font-bold text-slate-900">{printPassAppt.patientName}</span>
              </div>
              <div className="flex justify-between pb-1.5 border-b border-slate-100">
                <span className="text-slate-500">Consultant:</span>
                <span className="font-bold text-sky-800">{printPassAppt.doctorName}</span>
              </div>
              <div className="flex justify-between pb-1.5 border-b border-slate-100">
                <span className="text-slate-500">Appointment Date:</span>
                <span className="font-bold text-slate-900">{printPassAppt.appointmentDate}</span>
              </div>
              <div className="flex justify-between pb-1.5 border-b border-slate-100">
                <span className="text-slate-500">Doctor Allotted Time:</span>
                <span className="font-black text-emerald-700 text-sm">{printPassAppt.assignedTime}</span>
              </div>
              <div className="flex justify-between pb-1.5 border-b border-slate-100">
                <span className="text-slate-500">Token Number:</span>
                <span className="font-mono font-black text-slate-900 text-sm">{printPassAppt.tokenNumber || 'TKN-08'}</span>
              </div>
              <div className="flex justify-between pb-1.5 border-b border-slate-100">
                <span className="text-slate-500">Chamber Room:</span>
                <span className="font-bold text-slate-900">{printPassAppt.roomNumber || 'OPD Chamber 01'}</span>
              </div>
              {printPassAppt.preparationInstructions && (
                <div className="bg-sky-50 p-2.5 rounded-xl border border-sky-100 text-sky-900">
                  <strong>Preparation:</strong> {printPassAppt.preparationInstructions}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 flex gap-3">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print Pass Slip</span>
              </button>
              <button
                type="button"
                onClick={() => setPrintPassAppt(null)}
                className="px-5 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
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
