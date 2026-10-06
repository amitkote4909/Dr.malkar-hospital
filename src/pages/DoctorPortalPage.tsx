import React, { useState, useEffect } from 'react';
import { useAuth, DOCTOR_AUTHORIZED_CREDENTIALS } from '../firebase/authContext';
import { 
  AppointmentRecord, 
  InquiryRecord, 
  PatientReport,
  PatientVitals,
  PaymentDetails,
  subscribeToAllAppointments, 
  doctorApproveAndSetAppointmentTime,
  doctorUpdatePatientVitals,
  doctorAddPatientReport,
  doctorUpdatePayment,
  updateAppointmentStatus, 
  cancelAppointment,
  subscribeToInquiries,
  updateInquiryStatus,
  subscribeToRegisteredPatients,
  RegisteredPatientRecord
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
  Mail, 
  Phone, 
  Search,
  Activity,
  HeartPulse,
  Stethoscope,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  ClipboardList,
  Edit3,
  DollarSign,
  Settings,
  MessageSquare,
  LogOut,
  Users,
  QrCode,
  Building2
} from 'lucide-react';
import { HOSPITAL_INFO } from '../data/hospitalData';

interface DoctorPortalPageProps {
  setCurrentTab: (tab: string) => void;
}

export const DoctorPortalPage: React.FC<DoctorPortalPageProps> = ({ setCurrentTab }) => {
  const { user, profile, logout } = useAuth();

  const [appointments, setAppointments] = useState<AppointmentRecord[]>([]);
  const [inquiries, setInquiries] = useState<InquiryRecord[]>([]);
  const [registeredPatients, setRegisteredPatients] = useState<RegisteredPatientRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'appointments' | 'registered' | 'inquiries' | 'settings'>('appointments');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [registeredSearchQuery, setRegisteredSearchQuery] = useState('');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Time Slot Allocation Modal
  const [timeSlotModalAppt, setTimeSlotModalAppt] = useState<AppointmentRecord | null>(null);
  const [assignedTimeInput, setAssignedTimeInput] = useState('10:30 AM');
  const [tokenInput, setTokenInput] = useState('TKN-101');
  const [roomInput, setRoomInput] = useState('OPD Chamber 01 (Consulting Physician)');
  const [prepInstructionsInput, setPrepInstructionsInput] = useState('Please arrive 15 minutes prior. Bring past prescription and test reports.');
  const [doctorApprovalNotes, setDoctorApprovalNotes] = useState('');
  const [consultationFeeInput, setConsultationFeeInput] = useState(400);
  const [paymentStatusInput, setPaymentStatusInput] = useState<'pending' | 'paid' | 'pay_at_clinic' | 'emi_processing'>('pending');
  const [isFeeLockedModal, setIsFeeLockedModal] = useState(false);
  const [isApproving, setIsApproving] = useState(false);

  // Full Patient File Modal
  const [patientDetailsModalAppt, setPatientDetailsModalAppt] = useState<AppointmentRecord | null>(null);
  const [detailsSubTab, setDetailsSubTab] = useState<'overview' | 'reports' | 'vitals' | 'billing'>('overview');
  const [selectedPaymentModalAppt, setSelectedPaymentModalAppt] = useState<AppointmentRecord | null>(null);

  // Vitals State
  const [vitalsInput, setVitalsInput] = useState<PatientVitals>({});
  const [isSavingVitals, setIsSavingVitals] = useState(false);

  // New Lab Report State
  const [newReportName, setNewReportName] = useState('');
  const [newReportType, setNewReportType] = useState('Blood Test & Pathology');
  const [newReportSummary, setNewReportSummary] = useState('');
  const [isAddingReport, setIsAddingReport] = useState(false);

  // Hospital Live OPD Settings
  const [hospitalWaitTime, setHospitalWaitTime] = useState(15);
  const [emergencyBeds, setEmergencyBeds] = useState(6);
  const [opdStatusOpen, setOpdStatusOpen] = useState(true);

  // Real-time Firestore subscriptions for Doctor
  useEffect(() => {
    setLoading(true);

    const unsubscribeAppointments = subscribeToAllAppointments((list) => {
      setAppointments(list);
      setLoading(false);
    });

    const unsubscribeInquiries = subscribeToInquiries((inqList) => {
      setInquiries(inqList);
    });

    const unsubscribeRegistered = subscribeToRegisteredPatients((patients) => {
      setRegisteredPatients(patients);
    });

    return () => {
      unsubscribeAppointments();
      unsubscribeInquiries();
      unsubscribeRegistered();
    };
  }, []);

  const pendingAppointments = appointments.filter((a) => a.status === 'pending');
  const confirmedAppointments = appointments.filter((a) => a.status === 'confirmed');

  // Open Time Slot Modal
  const handleOpenTimeSlotModal = (appt: AppointmentRecord) => {
    setTimeSlotModalAppt(appt);
    setAssignedTimeInput(appt.assignedTime || '10:30 AM');
    setTokenInput(appt.tokenNumber || `TKN-${Math.floor(100 + Math.random() * 900)}`);
    setRoomInput(appt.roomNumber || 'OPD Chamber 01 (Consulting Physician)');
    setPrepInstructionsInput(
      appt.preparationInstructions || 'Please arrive 15 minutes before your scheduled slot. Bring past prescription sheets.'
    );
    setDoctorApprovalNotes(appt.doctorNotes || '');

    // Once doctor decides the fee, it is locked and cannot be changed by anyone
    const alreadyDecided = Boolean(appt.payment?.feeLocked) || (appt.status === 'confirmed' && (appt.payment?.consultationFee || 0) > 0);
    setIsFeeLockedModal(alreadyDecided);
    setConsultationFeeInput(appt.payment?.consultationFee || 400);
    setPaymentStatusInput('pending');
  };

  // Submit Allocated Time Slot & Confirmation
  const handleApproveWithTimeSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!timeSlotModalAppt?.id) return;

    setIsApproving(true);
    try {
      const finalFee = isFeeLockedModal 
        ? (timeSlotModalAppt.payment?.consultationFee || Number(consultationFeeInput) || 400)
        : (Number(consultationFeeInput) || 400);

      await doctorApproveAndSetAppointmentTime(timeSlotModalAppt.id, {
        assignedTime: assignedTimeInput.trim(),
        tokenNumber: tokenInput.trim(),
        roomNumber: roomInput.trim(),
        preparationInstructions: prepInstructionsInput.trim(),
        doctorNotes: doctorApprovalNotes.trim(),
        consultationFee: finalFee,
        paymentStatus: 'pending',
      });

      setNotification({
        message: `Appointment confirmed! Time slot ${assignedTimeInput} and fee of ₹${finalFee} locked for ${timeSlotModalAppt.patientName}. Patient has been notified to complete payment in their portal.`,
        type: 'success',
      });
      setTimeSlotModalAppt(null);
      setTimeout(() => setNotification(null), 5000);
    } catch (err) {
      console.error('Failed to assign time slot:', err);
      setNotification({ message: 'Failed to assign appointment time slot.', type: 'error' });
    } finally {
      setIsApproving(false);
    }
  };

  // Open Patient Full Details Modal
  const handleOpenPatientDetails = (appt: AppointmentRecord) => {
    setPatientDetailsModalAppt(appt);
    setDetailsSubTab('overview');
    setVitalsInput(appt.vitals || { bp: '120/80', pulse: '74 bpm', sugar: '110 mg/dL', temp: '98.6 °F', spo2: '99%', weight: '68 kg' });
  };

  // Save Vitals
  const handleSaveVitals = async () => {
    if (!patientDetailsModalAppt?.id) return;
    setIsSavingVitals(true);
    try {
      await doctorUpdatePatientVitals(patientDetailsModalAppt.id, vitalsInput);
      setNotification({ message: 'Patient vital signs recorded successfully.', type: 'success' });
      setPatientDetailsModalAppt({ ...patientDetailsModalAppt, vitals: vitalsInput });
      setTimeout(() => setNotification(null), 4000);
    } catch (err) {
      console.error('Failed to update vitals:', err);
      setNotification({ message: 'Could not save vitals.', type: 'error' });
    } finally {
      setIsSavingVitals(false);
    }
  };

  // Doctor adds new lab report
  const handleAddReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientDetailsModalAppt?.id || !newReportName.trim()) return;

    setIsAddingReport(true);
    try {
      const reportObj: PatientReport = {
        id: `rep-${Date.now()}`,
        name: newReportName.trim(),
        date: new Date().toISOString().split('T')[0],
        type: newReportType,
        summary: newReportSummary.trim() || 'Report reviewed by Consulting Physician. Findings stable.',
        doctorComments: 'Verified and archived in patient clinical file.',
        fileSize: '1.4 MB PDF'
      };

      await doctorAddPatientReport(patientDetailsModalAppt.id, patientDetailsModalAppt.reports || [], reportObj);
      const updatedReports = [reportObj, ...(patientDetailsModalAppt.reports || [])];
      setPatientDetailsModalAppt({ ...patientDetailsModalAppt, reports: updatedReports });

      setNewReportName('');
      setNewReportSummary('');
      setNotification({ message: `Report "${reportObj.name}" attached to patient record!`, type: 'success' });
      setTimeout(() => setNotification(null), 4000);
    } catch (err) {
      console.error('Error adding report:', err);
      setNotification({ message: 'Could not attach report.', type: 'error' });
    } finally {
      setIsAddingReport(false);
    }
  };

  // Mark fee as paid
  const handleMarkPaymentPaid = async (appt: AppointmentRecord) => {
    if (!appt.id) return;
    try {
      const updatedPayment: PaymentDetails = {
        consultationFee: appt.payment?.consultationFee || 400,
        totalAmount: appt.payment?.totalAmount || 400,
        paymentStatus: 'paid',
        paymentMethod: 'Cash at Counter',
        invoiceNumber: appt.payment?.invoiceNumber || `INV-${Date.now().toString().slice(-6)}`,
        paidAt: new Date().toLocaleString(),
      };
      await doctorUpdatePayment(appt.id, updatedPayment);
      if (patientDetailsModalAppt?.id === appt.id) {
        setPatientDetailsModalAppt({ ...patientDetailsModalAppt, payment: updatedPayment });
      }
      setNotification({ message: `Payment marked as PAID for ${appt.patientName}.`, type: 'success' });
      setTimeout(() => setNotification(null), 4000);
    } catch (err) {
      console.error('Failed to update payment:', err);
    }
  };

  const isDoctor = 
    profile?.role === 'doctor' || 
    profile?.role === 'admin' || 
    user?.email?.toLowerCase() === 'koteamit651@gmail.com' ||
    user?.email?.toLowerCase() === 'koteamit615@gmail.com' ||
    profile?.username === 'amitkote4909' ||
    profile?.username === 'amitkotepatil4909';

  const filteredAppointments = appointments.filter((item) => {
    const matchesSearch = 
      item.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.phone.includes(searchQuery) ||
      (item.id && item.id.includes(searchQuery)) ||
      (item.tokenNumber && item.tokenNumber.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (!isDoctor) {
    return (
      <div className="bg-slate-50 min-h-[85vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-xl text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto text-3xl font-black shadow-inner">
            🔒
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Doctor Access Restricted
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm mt-2 leading-relaxed">
              This clinical portal is strictly restricted to authorized medical personnel. Please log in with your verified doctor username, email, and security password to view patient records and manage OPD schedules.
            </p>
          </div>
          <button
            onClick={() => setCurrentTab('login')}
            className="w-full py-3.5 bg-sky-700 hover:bg-sky-800 text-white font-bold text-sm rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Stethoscope className="w-4 h-4" />
            <span>Go to Doctor Login</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen pb-24">
      
      {/* Doctor Header Banner */}
      <section className="bg-linear-to-r from-sky-900 via-blue-900 to-indigo-950 text-white py-9 px-4 sm:px-6 lg:px-8 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/20 flex items-center justify-center text-3xl font-black shadow-inner shrink-0">
              👨‍⚕️
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-emerald-500 text-white text-xs font-black uppercase tracking-wider px-3 py-0.5 rounded-full inline-flex items-center gap-1 shadow-xs">
                  <ShieldCheck className="w-3.5 h-3.5" /> Authorized Doctor Portal
                </span>
                <span className="bg-white/15 text-sky-200 text-xs px-2 py-0.5 rounded-md font-semibold">
                  OPD Administrator
                </span>
                <span className="text-xs text-emerald-300 font-semibold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  Active Clinical Shift
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black mt-1.5 tracking-tight text-white">
                {profile?.displayName || 'Medical Director & Administrator'}
              </h1>
              <p className="text-xs sm:text-sm text-sky-200 mt-0.5">
                Clinical Administration & OPD Scheduling • Dr. Malkar Hospital, Rahata
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                setStatusFilter('pending');
                setActiveTab('appointments');
              }}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Clock className="w-4 h-4" />
              Pending Queue ({pendingAppointments.length})
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className="px-4 py-2.5 bg-white/15 hover:bg-white/25 text-white font-bold text-xs sm:text-sm rounded-xl border border-white/20 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Settings className="w-4 h-4" />
              Hospital OPD Settings
            </button>
            <button
              onClick={async () => {
                await logout();
                setCurrentTab('home');
              }}
              className="px-4 py-2.5 bg-red-600/90 hover:bg-red-600 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer border border-red-500/50"
              title="Log Out from Doctor Profile"
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

      {/* Prominent Pending Allocations Banner */}
      {pendingAppointments.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          <div className="bg-linear-to-r from-amber-500 to-orange-600 text-white p-5 rounded-3xl shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-2xl shrink-0 font-black">
                ⏳
              </div>
              <div>
                <h3 className="text-lg font-black">
                  Action Required: {pendingAppointments.length} Patient{pendingAppointments.length > 1 ? 's' : ''} Awaiting Time Slot
                </h3>
                <p className="text-amber-100 text-xs sm:text-sm">
                  Assign consultation time slots so patients can see their confirmed token number and arrival time.
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setStatusFilter('pending');
                setActiveTab('appointments');
              }}
              className="w-full sm:w-auto px-6 py-2.5 bg-white text-orange-700 hover:bg-orange-50 font-bold text-xs sm:text-sm rounded-xl transition-all shadow-sm shrink-0 cursor-pointer"
            >
              Allocate Slots Now →
            </button>
          </div>
        </div>
      )}

      {/* Doctor Summary Stat Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          
          <button
            onClick={() => setActiveTab('registered')}
            className="text-left bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-sky-300 hover:shadow-sm transition-all cursor-pointer"
          >
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-sky-600" />
              Registered Patients
            </span>
            <p className="text-2xl sm:text-3xl font-black text-sky-700 mt-1">
              {registeredPatients.length}
            </p>
            <span className="text-xs text-sky-600 font-semibold">View Full Directory →</span>
          </button>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Total Appointments
            </span>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              {appointments.length}
            </p>
            <span className="text-xs text-slate-500 font-semibold">Patient Visits</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Awaiting Time Slot
            </span>
            <p className="text-2xl sm:text-3xl font-black text-amber-600 mt-1">
              {pendingAppointments.length}
            </p>
            <span className="text-xs text-amber-700 font-semibold">Needs Approval</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Scheduled & Confirmed
            </span>
            <p className="text-2xl sm:text-3xl font-black text-emerald-600 mt-1">
              {confirmedAppointments.length}
            </p>
            <span className="text-xs text-emerald-700 font-semibold">Time Slots Allocated</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs col-span-2 md:col-span-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Trauma Beds Ready
            </span>
            <p className="text-xl font-black text-red-600 mt-1 flex items-center gap-1.5">
              <HeartPulse className="w-5 h-5 text-red-500 animate-pulse" />
              {emergencyBeds} Beds
            </p>
            <span className="text-xs text-slate-500">24/7 ICU & Ambulance</span>
          </div>

        </div>
      </div>

      {/* Tabs / Filter Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
          
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveTab('appointments')}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'appointments'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Appointments Management ({appointments.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('registered')}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'registered'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Registered Patients ({registeredPatients.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('inquiries')}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'inquiries'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Patient Inquiries ({inquiries.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'settings'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Hospital Controls</span>
            </button>
          </div>

          {activeTab === 'appointments' && (
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search patient, phone, token..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm bg-white outline-hidden focus:border-sky-500"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm bg-white outline-hidden font-medium"
              >
                <option value="all">All Appointments</option>
                <option value="pending">🟡 Pending Time Allocation ({pendingAppointments.length})</option>
                <option value="confirmed">🟢 Confirmed & Scheduled ({confirmedAppointments.length})</option>
                <option value="completed">🔵 Completed Consultations</option>
                <option value="cancelled">🔴 Cancelled</option>
              </select>
            </div>
          )}

        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        
        {loading ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
            <div className="w-8 h-8 border-3 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-slate-500 text-sm font-medium">Loading hospital patient records...</p>
          </div>
        ) : activeTab === 'appointments' ? (

          /* TAB 1: APPOINTMENTS MANAGEMENT */
          filteredAppointments.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs space-y-4">
              <ClipboardList className="w-12 h-12 text-slate-400 mx-auto" />
              <h3 className="text-xl font-bold text-slate-900">No Patient Records Found</h3>
              <p className="text-slate-500 text-sm max-w-md mx-auto">
                No appointments match your current status or search filter.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAppointments.map((appt) => {
                const isPending = appt.status === 'pending';
                const isConfirmed = appt.status === 'confirmed';
                const isCompleted = appt.status === 'completed';
                const isCancelled = appt.status === 'cancelled';
                const hasPatientPaidOrSelected = Boolean(appt.payment?.paymentOption);

                return (
                  <div
                    key={appt.id}
                    className={`bg-white rounded-3xl p-5 sm:p-7 border shadow-xs transition-all ${
                      isPending
                        ? 'border-amber-300 ring-2 ring-amber-100 bg-linear-to-r from-amber-50/20 via-white to-white'
                        : isConfirmed
                        ? 'border-emerald-200 hover:shadow-md'
                        : 'border-slate-200'
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
                      
                      {/* Left: Patient Details */}
                      <div className="space-y-2.5 max-w-3xl">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs font-bold text-sky-800 bg-sky-50 px-2.5 py-0.5 rounded-lg border border-sky-100">
                            REF: {appt.id?.slice(0, 8)}
                          </span>

                          {isPending && (
                            <span className="text-xs font-black bg-amber-100 text-amber-900 px-3 py-0.5 rounded-full flex items-center gap-1.5 border border-amber-200">
                              <span className="w-2 h-2 rounded-full bg-amber-600 animate-pulse"></span>
                              Pending Doctor Time Allotment
                            </span>
                          )}

                          {isConfirmed && (
                            <span className="text-xs font-black bg-emerald-100 text-emerald-800 px-3 py-0.5 rounded-full flex items-center gap-1.5 border border-emerald-200">
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                              Confirmed by Doctor
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

                          <span className="text-xs font-semibold text-slate-500 capitalize">
                            • {appt.department} Department
                          </span>
                        </div>

                        {/* Patient Name & Demographics */}
                        <div>
                          <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                            <span>{appt.patientName}</span>
                            {appt.age && (
                              <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                                Age: {appt.age} • {appt.gender}
                              </span>
                            )}
                          </h3>
                        </div>

                        {/* Date, Time Slot, and Contact */}
                        <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs sm:text-sm text-slate-600">
                          <span className="flex items-center gap-1.5 font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg">
                            <Calendar className="w-4 h-4 text-sky-600 shrink-0" />
                            {appt.appointmentDate}
                          </span>

                          {isConfirmed && appt.assignedTime ? (
                            <span className="flex items-center gap-1.5 font-black text-emerald-800 bg-emerald-100/80 px-3 py-1 rounded-lg border border-emerald-300">
                              <Clock className="w-4 h-4 text-emerald-700 shrink-0" />
                              Doctor Allotted Time: {appt.assignedTime}
                            </span>
                          ) : (
                            <span className="flex items-center gap-1.5 text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                              <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                              Patient Preferred: {appt.preferredTimeWindow || 'Morning'}
                            </span>
                          )}

                          <span className="flex items-center gap-1 text-slate-500">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            {appt.phone}
                          </span>

                          <span className="flex items-center gap-1 text-slate-500">
                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                            {appt.email}
                          </span>
                        </div>

                        {/* Confirmed Details: Token & Room */}
                        {isConfirmed && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-emerald-50/70 p-3.5 rounded-2xl border border-emerald-200">
                            <div>
                              <span className="text-slate-500 font-medium block">Token / Queue Number:</span>
                              <span className="font-mono font-black text-emerald-900 text-sm">{appt.tokenNumber || 'TKN-01'}</span>
                            </div>
                            <div>
                              <span className="text-slate-500 font-medium block">Room / Chamber:</span>
                              <span className="font-bold text-slate-900">{appt.roomNumber || 'OPD Chamber 01'}</span>
                            </div>
                            {appt.preparationInstructions && (
                              <div className="sm:col-span-2 pt-1 border-t border-emerald-200/60 mt-1">
                                <span className="text-emerald-950 font-bold">Preparation Advice: </span>
                                <span className="text-slate-700">{appt.preparationInstructions}</span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Symptoms */}
                        {appt.reason && (
                          <p className="text-xs text-slate-600">
                            <strong className="text-slate-700">Patient Complaints:</strong> {appt.reason}
                          </p>
                        )}

                        {/* CLINICAL STATUS / PAYMENT SECTION BASED ON PATIENT PAYMENT STATE */}
                        
                        {/* STATE 1: PENDING - Doctor has not decided fee or assigned slot yet */}
                        {isPending && (
                          <div className="mt-3 p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
                            <div className="flex items-center gap-2 text-amber-900">
                              <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                              <div>
                                <span className="font-bold">Consultation Fee & Slot Allocation Required</span>
                                <p className="text-[11px] text-amber-800">
                                  Click &ldquo;Allocate Slot &amp; Prescribe Fee&rdquo; to set appointment time and decide consultation fee.
                                </p>
                              </div>
                            </div>
                            <span className="text-[11px] font-bold text-amber-900 bg-amber-100 px-3 py-1 rounded-full border border-amber-300 self-start sm:self-auto shrink-0">
                              Awaiting Doctor Decision
                            </span>
                          </div>
                        )}

                        {/* STATE 2: CONFIRMED BUT PATIENT HAS NOT PAID YET - Doctor decided fee (locked), but patient hasn't submitted payment */}
                        {!isPending && !hasPatientPaidOrSelected && (
                          <div className="mt-3 p-4 rounded-2xl bg-sky-50/70 border border-sky-200 text-xs space-y-2.5">
                            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-sky-200/80">
                              <div className="flex items-center gap-2">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                  Doctor Prescribed Fee:
                                </span>
                                <span className="text-sm font-black text-sky-900 bg-white px-3 py-1 rounded-lg border border-sky-200 shadow-2xs">
                                  🔒 ₹{appt.payment?.consultationFee || 400}.00 (Permanently Locked)
                                </span>
                              </div>
                              <span className="px-2.5 py-1 rounded-full font-bold text-[11px] bg-amber-100 text-amber-900 border border-amber-200 flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5 text-amber-600" />
                                Awaiting Patient Payment in Portal
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-600 leading-relaxed">
                              Consultation fee of <strong>₹{appt.payment?.consultationFee || 400}</strong> was decided and permanently locked by doctor. Patient has been notified to complete payment. <strong>Initial payment details (Online UPI UTR, Reception Counter, or EMI) will be displayed here immediately once patient submits payment in their Patient Portal.</strong>
                            </p>
                          </div>
                        )}

                        {/* STATE 3: PATIENT HAS PAID / SUBMITTED PAYMENT - Doctor can now see initial payment status and payment details */}
                        {!isPending && hasPatientPaidOrSelected && (
                          <div className="mt-3 p-4 rounded-2xl border text-xs space-y-2.5 bg-slate-50/95 border-slate-200">
                            
                            {/* Header: Status Banner & Amount */}
                            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-200">
                              <div className="flex items-center gap-2">
                                <span className="font-extrabold uppercase text-[10px] tracking-wider text-slate-500">
                                  Patient Initial Payment Status:
                                </span>
                                <span className={`px-2.5 py-1 rounded-full font-black text-xs inline-flex items-center gap-1.5 ${
                                  appt.payment?.paymentStatus === 'paid'
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                    : appt.payment?.paymentOption === 'emi'
                                    ? 'bg-purple-100 text-purple-900 border border-purple-300'
                                    : 'bg-amber-100 text-amber-900 border border-amber-300'
                                }`}>
                                  {appt.payment?.paymentStatus === 'paid' ? (
                                    <>
                                      <CheckCircle className="w-3.5 h-3.5 text-emerald-700" />
                                      <span>PAID & VERIFIED (ONLINE UPI) ✓</span>
                                    </>
                                  ) : appt.payment?.paymentOption === 'emi' ? (
                                    <>
                                      <CreditCard className="w-3.5 h-3.5 text-purple-700" />
                                      <span>0% MEDICAL EMI ACTIVE</span>
                                    </>
                                  ) : (
                                    <>
                                      <Building2 className="w-3.5 h-3.5 text-amber-700" />
                                      <span>PAY AT RECEPTION COUNTER (ARRIVING)</span>
                                    </>
                                  )}
                                </span>
                              </div>

                              <div className="flex items-center gap-2">
                                <span className="text-[11px] text-slate-500">Doctor Prescribed Fee:</span>
                                <span className="text-base font-black text-sky-900">🔒 ₹{appt.payment?.consultationFee || 400}.00 (Locked)</span>
                              </div>
                            </div>

                            {/* Specific Fields Filled by Patient */}
                            {appt.payment?.paymentOption === 'online_upi' ? (
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 bg-emerald-50/70 p-3 rounded-xl border border-emerald-200">
                                <div>
                                  <span className="text-[10px] text-emerald-800 uppercase font-bold block">Method Selected</span>
                                  <span className="font-bold text-emerald-950 flex items-center gap-1">
                                    <QrCode className="w-3.5 h-3.5 text-emerald-700" />
                                    Online UPI QR Scanner
                                  </span>
                                </div>
                                <div>
                                  <span className="text-[10px] text-emerald-800 uppercase font-bold block">Patient's UTR / Transaction No.</span>
                                  <span className="font-mono font-black text-emerald-900 bg-white px-2 py-0.5 rounded border border-emerald-300 inline-block text-xs">
                                    {appt.payment.transactionId || 'Payment Confirmed by Patient'}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-[10px] text-emerald-800 uppercase font-bold block">Payment Timestamp</span>
                                  <span className="font-medium text-emerald-900">{appt.payment.paidAt || 'Recorded at booking'}</span>
                                </div>
                              </div>
                            ) : appt.payment?.paymentOption === 'emi' && appt.payment.emiDetails ? (
                              <div className="bg-purple-50/80 p-3 rounded-xl border border-purple-200 space-y-2">
                                <div className="flex flex-wrap items-center justify-between text-purple-950 font-bold">
                                  <span className="flex items-center gap-1.5">
                                    <CreditCard className="w-4 h-4 text-purple-700" />
                                    Medical Care EMI ({appt.payment.emiDetails.planMonths} Months Plan)
                                  </span>
                                  <span className="font-black text-purple-900 text-xs">
                                    ₹{appt.payment.emiDetails.monthlyInstallment}/mo • 0% Interest
                                  </span>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] bg-white p-2.5 rounded-lg border border-purple-100 text-purple-900">
                                  <div>
                                    <span className="text-slate-400 block text-[9px] uppercase font-bold">Financing Partner</span>
                                    <span className="font-bold">{appt.payment.emiDetails.financingPartner}</span>
                                  </div>
                                  <div>
                                    <span className="text-slate-400 block text-[9px] uppercase font-bold">Applicant Name</span>
                                    <span className="font-bold">{appt.payment.emiDetails.applicantName}</span>
                                  </div>
                                  <div>
                                    <span className="text-slate-400 block text-[9px] uppercase font-bold">PAN / Aadhaar (Last 4)</span>
                                    <span className="font-mono font-bold">****{appt.payment.emiDetails.panOrAadhaarLast4}</span>
                                  </div>
                                  <div>
                                    <span className="text-slate-400 block text-[9px] uppercase font-bold">Verified Phone</span>
                                    <span className="font-bold">{appt.payment.emiDetails.contactPhone}</span>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 bg-amber-50/70 p-3 rounded-xl border border-amber-200 items-center">
                                <div>
                                  <span className="text-[10px] text-amber-800 uppercase font-bold block">Method Selected</span>
                                  <span className="font-bold text-amber-950 flex items-center gap-1">
                                    <Building2 className="w-3.5 h-3.5 text-amber-700" />
                                    Pay at Hospital Counter
                                  </span>
                                </div>
                                <div>
                                  <span className="text-[10px] text-amber-800 uppercase font-bold block">Collection Status</span>
                                  <span className="font-bold text-amber-900">
                                    {appt.payment?.paymentStatus === 'paid' ? 'Collected at Counter ✓' : `Pending ₹${appt.payment?.consultationFee || 400} on Arrival`}
                                  </span>
                                </div>
                                <div className="flex justify-end">
                                  {appt.payment?.paymentStatus !== 'paid' && (
                                    <button
                                      onClick={() => handleMarkPaymentPaid(appt)}
                                      className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs transition-colors flex items-center gap-1 cursor-pointer shadow-xs"
                                    >
                                      <CheckCircle className="w-3.5 h-3.5" />
                                      <span>Mark Collected</span>
                                    </button>
                                  )}
                                </div>
                              </div>
                            )}

                          </div>
                        )}

                        {/* Extra Quick Badges (Reports & Vitals) */}
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          {appt.reports && appt.reports.length > 0 && (
                            <span className="bg-blue-50 text-blue-700 font-semibold px-2 py-0.5 rounded-md border border-blue-100 text-[11px]">
                              📑 {appt.reports.length} Lab Report{appt.reports.length > 1 ? 's' : ''} on File
                            </span>
                          )}
                          {appt.vitals?.bp && (
                            <span className="bg-emerald-50 text-emerald-800 font-semibold px-2 py-0.5 rounded-md border border-emerald-100 text-[11px]">
                              BP: {appt.vitals.bp} • Pulse: {appt.vitals.pulse}
                            </span>
                          )}
                        </div>

                      </div>

                      {/* Right: Doctor Action Buttons */}
                      <div className="flex flex-wrap lg:flex-col items-stretch justify-center gap-2 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                        
                        {/* 1. Set Appointment Time & Prescribe Fee */}
                        <button
                          onClick={() => handleOpenTimeSlotModal(appt)}
                          className="px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <Clock className="w-3.5 h-3.5" />
                          <span>{isPending ? 'Allocate Slot & Prescribe Fee' : 'Modify Time Slot'}</span>
                        </button>

                        {/* 2. Full Patient File Modal */}
                        <button
                          onClick={() => handleOpenPatientDetails(appt)}
                          className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl border border-slate-200 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <ClipboardList className="w-3.5 h-3.5 text-sky-600" />
                          <span>Patient File & Reports</span>
                        </button>

                        {/* 3. View Payment Details Modal (Only visible once patient has paid or selected payment) */}
                        {hasPatientPaidOrSelected && (
                          <button
                            onClick={() => setSelectedPaymentModalAppt(appt)}
                            className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs font-bold rounded-xl border border-emerald-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <CreditCard className="w-3.5 h-3.5 text-emerald-700" />
                            <span>View Payment Details</span>
                          </button>
                        )}

                        {/* 4. Mark Completed */}
                        {isConfirmed && (
                          <button
                            onClick={() => updateAppointmentStatus(appt.id!, 'completed')}
                            className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200 transition-colors cursor-pointer"
                          >
                            Mark Completed ✓
                          </button>
                        )}

                        {/* 4. Cancel Booking */}
                        {!isCancelled && (
                          <button
                            onClick={() => cancelAppointment(appt.id!)}
                            className="px-4 py-2 text-slate-500 hover:text-red-600 hover:bg-red-50 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
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

        ) : activeTab === 'registered' ? (

          /* TAB: REGISTERED PATIENTS DIRECTORY */
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-sky-600" />
                  Registered Patient Roster ({registeredPatients.length})
                </h3>
                <p className="text-xs text-slate-500">
                  Full registration records of all users who created accounts on Dr. Malkar Hospital portal.
                </p>
              </div>

              <div className="relative w-full sm:w-72">
                <input
                  type="text"
                  placeholder="Search by name, email, phone..."
                  value={registeredSearchQuery}
                  onChange={(e) => setRegisteredSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white outline-hidden focus:border-sky-500"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>

            {registeredPatients.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
                <p className="text-slate-500 text-sm">No registered patients found.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {registeredPatients
                  .filter((pat) => {
                    const q = registeredSearchQuery.toLowerCase();
                    return (
                      pat.fullName.toLowerCase().includes(q) ||
                      pat.email.toLowerCase().includes(q) ||
                      pat.phone.includes(q)
                    );
                  })
                  .map((pat) => (
                    <div 
                      key={pat.uid || pat.id} 
                      className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs hover:border-sky-300 transition-all space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-2xl bg-sky-100 text-sky-700 font-black text-lg flex items-center justify-center shrink-0">
                            {pat.fullName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h4 className="font-black text-slate-900 text-base">
                              {pat.fullName}
                            </h4>
                            <span className="text-[11px] text-slate-400 font-mono">
                              Patient UID: {pat.uid.slice(0, 12)}
                            </span>
                          </div>
                        </div>

                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100 uppercase tracking-wide">
                          Verified Patient
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase font-bold">Email Address</span>
                          <a href={`mailto:${pat.email}`} className="font-semibold text-sky-700 hover:underline truncate block">
                            {pat.email}
                          </a>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase font-bold">Phone Number</span>
                          <a href={`tel:${pat.phone}`} className="font-bold text-slate-800 hover:text-emerald-700">
                            {pat.phone}
                          </a>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase font-bold">Date of Birth</span>
                          <span className="font-medium text-slate-700">{pat.dob || 'Not specified'}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase font-bold">Gender</span>
                          <span className="font-semibold text-slate-700 capitalize">{pat.gender || 'male'}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                        <span>Registered on: <strong>{pat.registeredAt || 'Hospital Records'}</strong></span>
                        <span className="text-sky-600 font-semibold">Ready for Consultation</span>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>

        ) : activeTab === 'inquiries' ? (

          /* TAB 2: INQUIRIES */
          inquiries.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
              <p className="text-slate-500 text-sm">No contact inquiries received yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {inquiries.map((inq) => (
                <div key={inq.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-900">{inq.fullName}</span>
                    <span className="text-xs text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md font-semibold uppercase">
                      {inq.subject}
                    </span>
                  </div>
                  <div className="flex gap-4 text-xs text-slate-500">
                    <span>Email: {inq.email}</span>
                    <span>Phone: {inq.phone}</span>
                  </div>
                  <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    {inq.message}
                  </p>
                </div>
              ))}
            </div>
          )

        ) : (

          /* TAB 3: HOSPITAL SETTINGS & CONTROLS */
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xs max-w-4xl space-y-8">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-sky-600" />
                Hospital Administration & Live OPD Controls
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Configure real-time hospital parameters broadcast across Dr. Malkar Hospital pages.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <h3 className="text-sm font-bold text-slate-900">OPD Consultation Broadcast</h3>
                <p className="text-xs text-slate-500">Toggle live OPD availability badge shown to patients.</p>
                <button
                  type="button"
                  onClick={() => {
                    setOpdStatusOpen(!opdStatusOpen);
                    setNotification({ message: `OPD Status changed to ${!opdStatusOpen ? 'OPEN' : 'CLOSED'}.`, type: 'success' });
                  }}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    opdStatusOpen ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
                  }`}
                >
                  {opdStatusOpen ? '🟢 OPD is OPEN Today' : '🔴 OPD is CLOSED'}
                </button>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <h3 className="text-sm font-bold text-slate-900">Emergency & Trauma Beds Ready</h3>
                <p className="text-xs text-slate-500">Update available critical care beds.</p>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min={0}
                    max={30}
                    value={emergencyBeds}
                    onChange={(e) => setEmergencyBeds(Number(e.target.value))}
                    className="w-24 p-2 rounded-xl border border-slate-300 text-sm text-center font-bold bg-white outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => setNotification({ message: 'Emergency bed count updated.', type: 'success' })}
                    className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl cursor-pointer"
                  >
                    Update Beds
                  </button>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <h3 className="text-sm font-bold text-slate-900">Live OPD Waiting Time</h3>
                <p className="text-xs text-slate-500">Estimated wait time shown to waiting patients.</p>
                <div className="flex items-center gap-3">
                  <select
                    value={hospitalWaitTime}
                    onChange={(e) => setHospitalWaitTime(Number(e.target.value))}
                    className="p-2 rounded-xl border border-slate-300 text-xs sm:text-sm font-bold bg-white outline-hidden"
                  >
                    <option value={10}>10 Minutes</option>
                    <option value={15}>15 Minutes (Normal)</option>
                    <option value={25}>25 Minutes</option>
                    <option value={45}>45 Minutes (Busy)</option>
                    <option value={60}>60+ Minutes</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => setNotification({ message: 'OPD wait time broadcast updated.', type: 'success' })}
                    className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl cursor-pointer"
                  >
                    Set Wait Time
                  </button>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <h3 className="text-sm font-bold text-slate-900">Primary Consulting Physician</h3>
                <p className="text-xs text-slate-500">Designated administrator doctor credentials.</p>
                <div className="text-xs space-y-1 text-slate-700 font-mono bg-white p-3 rounded-xl border border-slate-200">
                  <p><strong>Username:</strong> {DOCTOR_AUTHORIZED_CREDENTIALS.username}</p>
                  <p><strong>Email:</strong> {DOCTOR_AUTHORIZED_CREDENTIALS.email}</p>
                  <p><strong>Lead Doctor:</strong> Dr. Vaibhav G. Malkar (Medical Director)</p>
                </div>
              </div>

            </div>
          </div>

        )}

      </div>

      {/* ============================================================== */}
      {/* TIME SLOT ALLOCATION MODAL */}
      {/* ============================================================== */}
      {timeSlotModalAppt && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setTimeSlotModalAppt(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 text-xl font-bold w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center cursor-pointer"
            >
              ✕
            </button>

            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center text-2xl font-bold">
                ⏰
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900">
                  Set Appointment Time Slot
                </h3>
                <p className="text-xs text-slate-500">
                  Patient: <strong className="text-slate-800">{timeSlotModalAppt.patientName}</strong> • {timeSlotModalAppt.appointmentDate}
                </p>
              </div>
            </div>

            <form onSubmit={handleApproveWithTimeSlot} className="mt-5 space-y-4">
              
              <div className="bg-amber-50 p-3 rounded-2xl border border-amber-200 text-xs text-amber-900">
                Patient requested window: <strong>{timeSlotModalAppt.preferredTimeWindow || 'Morning'}</strong>.
                Select their exact consultation time below:
              </div>

              {/* Patient Submitted Payment Summary for Doctor */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between items-center pb-1.5 border-b border-slate-200">
                  <span className="font-bold text-slate-600 uppercase text-[10px] tracking-wider">Patient Payment Method:</span>
                  <span className="font-black text-slate-900 text-sm">
                    Fee: ₹{timeSlotModalAppt.payment?.consultationFee || 400}.00
                  </span>
                </div>

                {timeSlotModalAppt.payment?.paymentOption === 'online_upi' && (
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 bg-emerald-50 text-emerald-900 p-2.5 rounded-xl border border-emerald-200">
                    <span className="flex items-center gap-1.5 font-bold">
                      <QrCode className="w-4 h-4 text-emerald-600 shrink-0" />
                      Online UPI QR Transfer Verified
                    </span>
                    <span className="font-mono text-xs font-bold bg-white px-2 py-0.5 rounded border border-emerald-300">
                      UTR: {timeSlotModalAppt.payment.transactionId || 'Payment Confirmed'}
                    </span>
                  </div>
                )}

                {timeSlotModalAppt.payment?.paymentOption === 'in_hospital' && (
                  <div className="flex items-center justify-between bg-amber-50 text-amber-900 p-2.5 rounded-xl border border-amber-200">
                    <span className="flex items-center gap-1.5 font-bold">
                      <Building2 className="w-4 h-4 text-amber-600 shrink-0" />
                      Pay at Hospital Counter
                    </span>
                    <span className="text-xs font-bold text-amber-800">
                      Collect ₹{timeSlotModalAppt.payment.consultationFee || 400} on Arrival
                    </span>
                  </div>
                )}

                {timeSlotModalAppt.payment?.paymentOption === 'emi' && (
                  <div className="bg-purple-50 text-purple-950 p-2.5 rounded-xl border border-purple-200 space-y-1">
                    <div className="flex justify-between items-center font-bold">
                      <span className="flex items-center gap-1.5">
                        <CreditCard className="w-4 h-4 text-purple-600 shrink-0" />
                        Medical EMI Plan ({timeSlotModalAppt.payment.emiDetails?.planMonths || 3} Months)
                      </span>
                      <span className="font-black text-purple-900">
                        ₹{timeSlotModalAppt.payment.emiDetails?.monthlyInstallment || Math.ceil((timeSlotModalAppt.payment.consultationFee || 400)/3)}/mo
                      </span>
                    </div>
                    <div className="text-[11px] text-purple-800 flex flex-wrap gap-x-3">
                      <span>Provider: <strong>{timeSlotModalAppt.payment.emiDetails?.financingPartner}</strong></span>
                      <span>Applicant: <strong>{timeSlotModalAppt.payment.emiDetails?.applicantName}</strong></span>
                      <span>PAN/Aadhaar: ****{timeSlotModalAppt.payment.emiDetails?.panOrAadhaarLast4}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Exact Time Slot */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Assigned Appointment Time <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2 mb-2">
                  {['09:30 AM', '10:15 AM', '11:00 AM', '12:15 PM', '04:30 PM', '06:00 PM'].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setAssignedTimeInput(preset)}
                      className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                        assignedTimeInput === preset
                          ? 'bg-sky-600 text-white border-sky-600'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={assignedTimeInput}
                  onChange={(e) => setAssignedTimeInput(e.target.value)}
                  placeholder="e.g. 10:30 AM"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-sky-500 text-sm outline-hidden font-bold"
                />
              </div>

              {/* Token Number & Room */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Queue Token Number
                  </label>
                  <input
                    type="text"
                    value={tokenInput}
                    onChange={(e) => setTokenInput(e.target.value)}
                    placeholder="TKN-101"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Consultation Room
                  </label>
                  <input
                    type="text"
                    value={roomInput}
                    onChange={(e) => setRoomInput(e.target.value)}
                    placeholder="OPD Chamber 01"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold"
                  />
                </div>
              </div>

              {/* Consultation Fee Section (Locking Enforced) */}
              {isFeeLockedModal ? (
                <div className="p-4 bg-slate-100 rounded-2xl border-2 border-slate-300 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Doctor Prescribed Fee (Permanently Fixed & Locked)</span>
                    </label>
                    <span className="text-sm font-black text-slate-900 bg-white px-3 py-1 rounded-lg border border-slate-300 shadow-2xs">
                      🔒 ₹{consultationFeeInput}.00
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    This consultation fee was decided by the doctor upon confirmation and is permanently fixed. No one can change this fee.
                  </p>
                </div>
              ) : (
                <div className="p-4 bg-sky-50/90 rounded-2xl border-2 border-sky-300 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black text-sky-950 uppercase tracking-wider flex items-center gap-1.5">
                      <span>🩺 Prescribe Consultation Fee</span>
                      <span className="text-[10px] bg-sky-200 text-sky-800 font-bold px-2 py-0.5 rounded-full">Doctor Decision</span>
                    </label>
                    <span className="text-sm font-black text-sky-900 bg-white px-2.5 py-0.5 rounded-lg border border-sky-200 shadow-2xs">
                      ₹{consultationFeeInput}.00
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Decide the consultation fee for this patient. <strong>Once decided and confirmed, this fee is permanently locked and cannot be changed by anyone.</strong> The patient will see this fee in their portal.
                  </p>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Fee Amount (₹) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-xs font-bold text-slate-500">₹</span>
                      <input
                        type="number"
                        min="0"
                        step="50"
                        value={consultationFeeInput}
                        onChange={(e) => setConsultationFeeInput(Number(e.target.value))}
                        className="w-full pl-7 pr-3 py-2 rounded-xl border border-sky-300 bg-white text-xs font-black text-slate-900 focus:ring-2 focus:ring-sky-200 outline-hidden"
                      />
                    </div>
                  </div>

                  {/* Quick Fee Presets */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-sky-200/60">
                    <span className="text-[10px] font-bold text-slate-500 mr-1">Quick Presets:</span>
                    {[
                      { label: 'Free (₹0)', val: 0 },
                      { label: '₹300 (Follow-up)', val: 300 },
                      { label: '₹400 (Standard)', val: 400 },
                      { label: '₹500 (Specialist)', val: 500 },
                      { label: '₹800 (Detailed)', val: 800 },
                      { label: '₹1000 (Procedure)', val: 1000 },
                    ].map((preset) => (
                      <button
                        key={preset.val}
                        type="button"
                        onClick={() => setConsultationFeeInput(preset.val)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                          consultationFeeInput === preset.val
                            ? 'bg-sky-600 text-white shadow-xs'
                            : 'bg-white text-slate-700 border border-slate-200 hover:border-sky-400'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Preparation / Instructions */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Preparation Instructions for Patient
                </label>
                <textarea
                  rows={2}
                  value={prepInstructionsInput}
                  onChange={(e) => setPrepInstructionsInput(e.target.value)}
                  placeholder="e.g. Please bring previous blood test reports and fasting sample..."
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs outline-hidden"
                ></textarea>
              </div>

              {/* Doctor Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Clinical Pre-Notes / Review
                </label>
                <textarea
                  rows={2}
                  value={doctorApprovalNotes}
                  onChange={(e) => setDoctorApprovalNotes(e.target.value)}
                  placeholder="Doctor preliminary assessment..."
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs outline-hidden"
                ></textarea>
              </div>

              <div className="pt-3 border-t border-slate-100 flex gap-3">
                <button
                  type="submit"
                  disabled={isApproving}
                  className="flex-1 py-3 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl text-sm transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  {isApproving ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>Confirm & Notify Patient</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setTimeSlotModalAppt(null)}
                  className="px-5 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl text-sm cursor-pointer"
                >
                  Cancel
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* FULL PATIENT FILE MODAL */}
      {/* ============================================================== */}
      {patientDetailsModalAppt && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl relative animate-in zoom-in-95 max-h-[92vh] overflow-y-auto">
            
            <button
              onClick={() => setPatientDetailsModalAppt(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 text-xl font-bold w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center cursor-pointer"
            >
              ✕
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-4 pb-4 border-b border-slate-200">
              <div className="w-14 h-14 rounded-2xl bg-sky-100 text-sky-800 flex items-center justify-center text-3xl font-black">
                👤
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-900">
                  {patientDetailsModalAppt.patientName}
                </h3>
                <p className="text-xs text-slate-500">
                  Record ID: <span className="font-mono text-sky-700 font-bold">{patientDetailsModalAppt.id}</span> • 
                  Phone: <strong>{patientDetailsModalAppt.phone}</strong> • 
                  Email: {patientDetailsModalAppt.email}
                </p>
              </div>
            </div>

            {/* Sub-tabs in Patient View */}
            <div className="flex items-center gap-2 mt-4 pb-3 border-b border-slate-100">
              <button
                type="button"
                onClick={() => setDetailsSubTab('overview')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  detailsSubTab === 'overview' ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-700'
                }`}
              >
                Case Overview
              </button>
              <button
                type="button"
                onClick={() => setDetailsSubTab('reports')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  detailsSubTab === 'reports' ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-700'
                }`}
              >
                Previous Lab Reports ({patientDetailsModalAppt.reports?.length || 0})
              </button>
              <button
                type="button"
                onClick={() => setDetailsSubTab('vitals')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  detailsSubTab === 'vitals' ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-700'
                }`}
              >
                Vital Signs Monitor
              </button>
              <button
                type="button"
                onClick={() => setDetailsSubTab('billing')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  detailsSubTab === 'billing' ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-700'
                }`}
              >
                Payment & Billing Details
              </button>
            </div>

            {/* SUB-TAB 1: CASE OVERVIEW */}
            {detailsSubTab === 'overview' && (
              <div className="mt-5 space-y-4 text-xs sm:text-sm">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <div>
                    <span className="text-slate-400 block text-xs">Age / Gender</span>
                    <span className="font-bold text-slate-800">{patientDetailsModalAppt.age || '28'} Yrs / {patientDetailsModalAppt.gender || 'Male'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-xs">Department</span>
                    <span className="font-bold text-slate-800 capitalize">{patientDetailsModalAppt.department}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-xs">Consultant Doctor</span>
                    <span className="font-bold text-sky-800">{patientDetailsModalAppt.doctorName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-xs">Appointment Slot</span>
                    <span className="font-bold text-emerald-700">
                      {patientDetailsModalAppt.assignedTime || patientDetailsModalAppt.preferredTimeWindow}
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 mb-1 text-xs uppercase tracking-wider">
                    Chief Complaints & Reported Symptoms
                  </h4>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-slate-700 leading-relaxed text-xs sm:text-sm">
                    {patientDetailsModalAppt.reason || 'No specific complaints entered.'}
                  </div>
                </div>

                {patientDetailsModalAppt.doctorNotes && (
                  <div>
                    <h4 className="font-bold text-slate-900 mb-1 text-xs uppercase tracking-wider">
                      Doctor Clinical Notes & Consultation Advice
                    </h4>
                    <div className="bg-sky-50 p-4 rounded-2xl border border-sky-100 text-sky-900 leading-relaxed text-xs sm:text-sm">
                      {patientDetailsModalAppt.doctorNotes}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* SUB-TAB 2: PREVIOUS MEDICAL REPORTS */}
            {detailsSubTab === 'reports' && (
              <div className="mt-5 space-y-5">
                <div className="space-y-3">
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                    Diagnostic Reports & Investigations on File
                  </h4>

                  {(!patientDetailsModalAppt.reports || patientDetailsModalAppt.reports.length === 0) ? (
                    <p className="text-xs text-slate-500 italic bg-slate-50 p-4 rounded-xl">
                      No previous laboratory or diagnostic reports attached to this patient yet.
                    </p>
                  ) : (
                    patientDetailsModalAppt.reports.map((rep) => (
                      <div key={rep.id} className="p-4 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50/60 transition-colors space-y-1.5 shadow-2xs">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                            <FileText className="w-4 h-4 text-sky-600" />
                            {rep.name}
                          </span>
                          <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                            {rep.date} • {rep.type}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          <strong>Findings:</strong> {rep.summary}
                        </p>
                        {rep.doctorComments && (
                          <p className="text-xs text-emerald-800 bg-emerald-50 p-2 rounded-lg">
                            <strong>Doctor Review:</strong> {rep.doctorComments}
                          </p>
                        )}
                      </div>
                    ))
                  )}
                </div>

                {/* Add Report by Doctor */}
                <form onSubmit={handleAddReport} className="p-4 rounded-2xl bg-sky-50/60 border border-sky-100 space-y-3">
                  <h5 className="font-bold text-sky-950 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <PlusCircle className="w-4 h-4 text-sky-700" />
                    Add New Lab Report / Clinical Finding to Patient Record
                  </h5>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Report Title</label>
                      <input
                        type="text"
                        value={newReportName}
                        onChange={(e) => setNewReportName(e.target.value)}
                        placeholder="e.g. Chest X-Ray PA View"
                        required
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Investigation Type</label>
                      <select
                        value={newReportType}
                        onChange={(e) => setNewReportType(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white outline-hidden"
                      >
                        <option value="Blood Test & Pathology">Blood Test & Pathology</option>
                        <option value="Digital X-Ray / Radiography">Digital X-Ray / Radiography</option>
                        <option value="12-Lead ECG">12-Lead ECG</option>
                        <option value="Ultrasound Sonography">Ultrasound Sonography</option>
                        <option value="Discharge & Clinical Summary">Discharge & Clinical Summary</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Clinical Findings & Summary</label>
                    <textarea
                      rows={2}
                      value={newReportSummary}
                      onChange={(e) => setNewReportSummary(e.target.value)}
                      placeholder="e.g. Clear lung fields, normal cardiothoracic ratio. No focal lesions."
                      required
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-white outline-hidden"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={isAddingReport}
                    className="py-2 px-4 bg-sky-700 hover:bg-sky-800 text-white font-bold text-xs rounded-xl cursor-pointer"
                  >
                    {isAddingReport ? 'Adding...' : '+ Attach Report to Patient File'}
                  </button>
                </form>
              </div>
            )}

            {/* SUB-TAB 3: VITALS */}
            {detailsSubTab === 'vitals' && (
              <div className="mt-5 space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                    Patient Vital Signs Monitoring
                  </h4>
                  <span className="text-[11px] text-sky-600 font-semibold">Doctor can update readings</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                    <label className="block text-[11px] font-bold text-slate-500 uppercase">Blood Pressure (BP)</label>
                    <input
                      type="text"
                      value={vitalsInput.bp || ''}
                      onChange={(e) => setVitalsInput({ ...vitalsInput, bp: e.target.value })}
                      placeholder="120/80 mmHg"
                      className="w-full mt-1 p-2 rounded-lg border border-slate-300 text-xs font-bold bg-white"
                    />
                  </div>

                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                    <label className="block text-[11px] font-bold text-slate-500 uppercase">Pulse Rate</label>
                    <input
                      type="text"
                      value={vitalsInput.pulse || ''}
                      onChange={(e) => setVitalsInput({ ...vitalsInput, pulse: e.target.value })}
                      placeholder="74 bpm"
                      className="w-full mt-1 p-2 rounded-lg border border-slate-300 text-xs font-bold bg-white"
                    />
                  </div>

                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                    <label className="block text-[11px] font-bold text-slate-500 uppercase">Blood Glucose</label>
                    <input
                      type="text"
                      value={vitalsInput.sugar || ''}
                      onChange={(e) => setVitalsInput({ ...vitalsInput, sugar: e.target.value })}
                      placeholder="110 mg/dL"
                      className="w-full mt-1 p-2 rounded-lg border border-slate-300 text-xs font-bold bg-white"
                    />
                  </div>

                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                    <label className="block text-[11px] font-bold text-slate-500 uppercase">Oxygen (SpO2)</label>
                    <input
                      type="text"
                      value={vitalsInput.spo2 || ''}
                      onChange={(e) => setVitalsInput({ ...vitalsInput, spo2: e.target.value })}
                      placeholder="99%"
                      className="w-full mt-1 p-2 rounded-lg border border-slate-300 text-xs font-bold bg-white"
                    />
                  </div>

                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                    <label className="block text-[11px] font-bold text-slate-500 uppercase">Body Temp</label>
                    <input
                      type="text"
                      value={vitalsInput.temp || ''}
                      onChange={(e) => setVitalsInput({ ...vitalsInput, temp: e.target.value })}
                      placeholder="98.6 °F"
                      className="w-full mt-1 p-2 rounded-lg border border-slate-300 text-xs font-bold bg-white"
                    />
                  </div>

                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                    <label className="block text-[11px] font-bold text-slate-500 uppercase">Weight</label>
                    <input
                      type="text"
                      value={vitalsInput.weight || ''}
                      onChange={(e) => setVitalsInput({ ...vitalsInput, weight: e.target.value })}
                      placeholder="68 kg"
                      className="w-full mt-1 p-2 rounded-lg border border-slate-300 text-xs font-bold bg-white"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleSaveVitals}
                    disabled={isSavingVitals}
                    className="py-2.5 px-5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl cursor-pointer"
                  >
                    {isSavingVitals ? 'Saving Vitals...' : 'Update & Save Vital Signs'}
                  </button>
                </div>
              </div>
            )}

            {/* SUB-TAB 4: BILLING & PAYMENT (Visible to Doctor) */}
            {detailsSubTab === 'billing' && (
              <div className="mt-5 space-y-4 text-xs sm:text-sm">
                {!patientDetailsModalAppt.payment?.paymentOption ? (
                  /* State: Patient has not submitted payment yet */
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
                    <div className="flex justify-between items-center pb-2.5 border-b border-slate-200">
                      <span className="text-slate-500 font-medium">Invoice Reference:</span>
                      <span className="font-mono font-bold text-slate-800">
                        {patientDetailsModalAppt.payment?.invoiceNumber || `INV-${patientDetailsModalAppt.id?.slice(0, 6)}`}
                      </span>
                    </div>

                    <div className="flex justify-between items-center pb-2.5 border-b border-slate-200">
                      <span className="text-slate-500 font-medium">Doctor Prescribed Consultation Fee:</span>
                      <span className="font-black text-sky-900 text-base">
                        🔒 ₹{patientDetailsModalAppt.payment?.consultationFee || 400}.00 (Permanently Locked)
                      </span>
                    </div>

                    <div className="flex justify-between items-center pb-2.5 border-b border-slate-200">
                      <span className="text-slate-500 font-medium">Initial Payment Status:</span>
                      <span className="px-3 py-1 rounded-full font-bold text-xs bg-amber-100 text-amber-900 border border-amber-200 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        Awaiting Patient Payment in Portal
                      </span>
                    </div>

                    <div className="p-4 bg-sky-50/80 rounded-2xl border border-sky-200 text-xs text-sky-950 space-y-1">
                      <p className="font-bold flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-sky-700" />
                        Consultation Fee Locked by Doctor
                      </p>
                      <p className="text-slate-600 leading-relaxed">
                        The doctor decided fee of ₹{patientDetailsModalAppt.payment?.consultationFee || 400} is locked and cannot be changed by anyone. The patient has not submitted payment yet. <strong>Initial payment details (Online UPI UTR, Reception Counter, or EMI) will be visible here immediately once the patient completes payment in their portal.</strong>
                      </p>
                    </div>
                  </div>
                ) : (
                  /* State: Patient has submitted payment */
                  <>
                    {/* Main Billing Summary Card */}
                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
                      <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                        <span className="text-slate-500">Invoice Number:</span>
                        <span className="font-mono font-bold text-slate-900">
                          {patientDetailsModalAppt.payment?.invoiceNumber || `INV-${patientDetailsModalAppt.id?.slice(0, 6)}`}
                        </span>
                      </div>

                      <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                        <span className="text-slate-500">Consultation Charges:</span>
                        <span className="font-bold text-slate-900 text-base">
                          🔒 ₹{patientDetailsModalAppt.payment?.consultationFee || 400}.00 (Locked)
                        </span>
                      </div>

                      <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                        <span className="text-slate-500">Payment Status:</span>
                        <span className={`px-2.5 py-0.5 rounded-full font-black text-xs ${
                          patientDetailsModalAppt.payment?.paymentStatus === 'paid'
                            ? 'bg-emerald-100 text-emerald-800'
                            : patientDetailsModalAppt.payment?.paymentOption === 'emi'
                            ? 'bg-purple-100 text-purple-900'
                            : 'bg-amber-100 text-amber-900'
                        }`}>
                          {patientDetailsModalAppt.payment?.paymentStatus === 'paid' 
                            ? 'PAID ✓ (VERIFIED)' 
                            : patientDetailsModalAppt.payment?.paymentOption === 'emi'
                            ? 'EMI PLAN ACTIVE'
                            : 'PAY AT COUNTER / PENDING'}
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Selected Payment Method:</span>
                        <span className="font-bold text-slate-800">
                          {patientDetailsModalAppt.payment?.paymentOption === 'online_upi' && '📱 Online UPI QR Scanner'}
                          {patientDetailsModalAppt.payment?.paymentOption === 'in_hospital' && '🏥 Pay at Hospital Counter'}
                          {patientDetailsModalAppt.payment?.paymentOption === 'emi' && '💳 0% Medical Care EMI'}
                          {!patientDetailsModalAppt.payment?.paymentOption && (patientDetailsModalAppt.payment?.paymentMethod || 'OPD Registration Desk')}
                        </span>
                      </div>
                    </div>

                    {/* Specific Details View for Option 1: ONLINE UPI */}
                    {patientDetailsModalAppt.payment?.paymentOption === 'online_upi' && (
                      <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200 space-y-2">
                        <h5 className="font-bold text-emerald-950 flex items-center gap-1.5 uppercase text-xs tracking-wider">
                          <QrCode className="w-4 h-4 text-emerald-700" />
                          Online UPI Payment Verification Record
                        </h5>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-white p-3 rounded-xl border border-emerald-100">
                          <div>
                            <span className="text-slate-400 block text-[10px] uppercase font-bold">UPI Merchant ID</span>
                            <span className="font-mono font-bold text-slate-800">
                              {patientDetailsModalAppt.payment.upiIdUsed || 'malkarhospital@okhdfcbank'}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px] uppercase font-bold">Transaction / UTR Number</span>
                            <span className="font-mono font-black text-emerald-700">
                              {patientDetailsModalAppt.payment.transactionId || 'Transferred Online'}
                            </span>
                          </div>
                          <div className="sm:col-span-2">
                            <span className="text-slate-400 block text-[10px] uppercase font-bold">Payment Verified Timestamp</span>
                            <span className="font-medium text-slate-700">
                              {patientDetailsModalAppt.payment.paidAt || 'Transferred at Booking'}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Specific Details View for Option 2: PAY IN HOSPITAL */}
                    {patientDetailsModalAppt.payment?.paymentOption === 'in_hospital' && (
                      <div className="p-4 bg-amber-50/70 rounded-2xl border border-amber-200 space-y-2">
                        <h5 className="font-bold text-amber-950 flex items-center gap-1.5 uppercase text-xs tracking-wider">
                          <Building2 className="w-4 h-4 text-amber-700" />
                          Hospital Counter Collection Details
                        </h5>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-white p-3 rounded-xl border border-amber-100">
                          <div>
                            <span className="text-slate-400 block text-[10px] uppercase font-bold">Amount to Collect</span>
                            <span className="font-black text-amber-900 text-sm">
                              ₹{patientDetailsModalAppt.payment?.consultationFee || 400}.00
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px] uppercase font-bold">Collection Counter</span>
                            <span className="font-bold text-slate-800">OPD Reception Counter 01</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Specific Details View for Option 3: MEDICAL CARE EMI */}
                    {patientDetailsModalAppt.payment?.paymentOption === 'emi' && patientDetailsModalAppt.payment.emiDetails && (
                      <div className="p-4 bg-purple-50/80 rounded-2xl border border-purple-200 space-y-2">
                        <h5 className="font-bold text-purple-950 flex items-center gap-1.5 uppercase text-xs tracking-wider">
                          <CreditCard className="w-4 h-4 text-purple-700" />
                          Medical Care EMI Application File
                        </h5>
                        <div className="grid grid-cols-2 gap-2 text-xs bg-white p-3.5 rounded-xl border border-purple-100">
                          <div>
                            <span className="text-slate-400 block text-[10px] uppercase font-bold">Financing Bank / Partner</span>
                            <span className="font-bold text-purple-900">
                              {patientDetailsModalAppt.payment.emiDetails.financingPartner}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px] uppercase font-bold">Tenure & Monthly Installment</span>
                            <span className="font-black text-purple-950">
                              {patientDetailsModalAppt.payment.emiDetails.planMonths} Months @ ₹{patientDetailsModalAppt.payment.emiDetails.monthlyInstallment}/mo
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px] uppercase font-bold">Applicant / Cardholder</span>
                            <span className="font-bold text-slate-800">
                              {patientDetailsModalAppt.payment.emiDetails.applicantName}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px] uppercase font-bold">Employment Source</span>
                            <span className="font-medium text-slate-700">
                              {patientDetailsModalAppt.payment.emiDetails.employmentType}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px] uppercase font-bold">PAN / Aadhaar (Last 4)</span>
                            <span className="font-mono font-bold text-slate-900">
                              ****{patientDetailsModalAppt.payment.emiDetails.panOrAadhaarLast4}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px] uppercase font-bold">Contact Phone</span>
                            <span className="font-bold text-slate-800">
                              {patientDetailsModalAppt.payment.emiDetails.contactPhone}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Doctor Action Buttons */}
                    <div className="pt-2 flex flex-wrap gap-2">
                      {patientDetailsModalAppt.payment?.paymentStatus !== 'paid' && (
                        <button
                          type="button"
                          onClick={() => handleMarkPaymentPaid(patientDetailsModalAppt)}
                          className="py-2.5 px-5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>Confirm & Mark Fee as Paid</span>
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-slate-100 text-right">
              <button
                type="button"
                onClick={() => setPatientDetailsModalAppt(null)}
                className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs sm:text-sm cursor-pointer"
              >
                Close Patient File
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* DEDICATED PATIENT PAYMENT DETAILS MODAL FOR DOCTOR */}
      {/* ============================================================== */}
      {selectedPaymentModalAppt && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedPaymentModalAppt(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 text-xl font-bold w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center cursor-pointer"
            >
              ✕
            </button>

            <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-2xl font-bold">
                💳
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900">
                  Patient Payment Details
                </h3>
                <p className="text-xs text-slate-500">
                  Patient: <strong className="text-slate-800">{selectedPaymentModalAppt.patientName}</strong> • Ref: {selectedPaymentModalAppt.id}
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-4 text-xs sm:text-sm">
              {/* Status card */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex justify-between items-center">
                <span className="text-slate-600 font-bold">Patient Payment Status:</span>
                <span className={`px-3 py-1 rounded-full font-black text-xs ${
                  selectedPaymentModalAppt.payment?.paymentStatus === 'paid'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : selectedPaymentModalAppt.payment?.paymentOption === 'emi'
                    ? 'bg-purple-100 text-purple-900 border border-purple-300'
                    : 'bg-amber-100 text-amber-900 border border-amber-300'
                }`}>
                  {selectedPaymentModalAppt.payment?.paymentStatus === 'paid'
                    ? 'PAID & VERIFIED ✓'
                    : selectedPaymentModalAppt.payment?.paymentOption === 'emi'
                    ? '0% MEDICAL EMI ACTIVE'
                    : 'PAY AT CLINIC COUNTER (PENDING)'}
                </span>
              </div>

              {/* Breakdown */}
              <div className="space-y-2 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="flex justify-between pb-2 border-b border-slate-200/70">
                  <span className="text-slate-500">Invoice Number:</span>
                  <span className="font-mono font-bold text-slate-800">
                    {selectedPaymentModalAppt.payment?.invoiceNumber || `INV-${selectedPaymentModalAppt.id?.slice(0, 6)}`}
                  </span>
                </div>
                <div className="flex justify-between pb-2 border-b border-slate-200/70">
                  <span className="text-slate-500">Consultation Charges:</span>
                  <span className="font-bold text-slate-900 text-base">🔒 ₹{selectedPaymentModalAppt.payment?.consultationFee || 400}.00 (Locked by Doctor)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Payment Option Chosen:</span>
                  <span className="font-bold text-slate-800">
                    {selectedPaymentModalAppt.payment?.paymentOption === 'online_upi' && '📱 Online UPI QR Scanner'}
                    {selectedPaymentModalAppt.payment?.paymentOption === 'in_hospital' && '🏥 Pay at Hospital Counter'}
                    {selectedPaymentModalAppt.payment?.paymentOption === 'emi' && '💳 0% Medical Care EMI'}
                  </span>
                </div>
              </div>

              {/* Specific information based on patient choice */}
              {selectedPaymentModalAppt.payment?.paymentOption === 'online_upi' && (
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-2">
                  <h4 className="font-bold text-emerald-950 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <QrCode className="w-4 h-4 text-emerald-700" />
                    Online UPI Transaction Verification
                  </h4>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Hospital UPI ID Scanned:</span>
                      <span className="font-mono font-bold text-slate-900">
                        {selectedPaymentModalAppt.payment.upiIdUsed || 'malkarhospital@okhdfcbank'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">12-Digit UTR / Transaction No.:</span>
                      <span className="font-mono font-black text-emerald-800 bg-white px-2 py-0.5 rounded border border-emerald-300">
                        {selectedPaymentModalAppt.payment.transactionId || 'Entered by Patient'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Payment Timestamp:</span>
                      <span className="font-medium text-slate-800">
                        {selectedPaymentModalAppt.payment.paidAt || 'Recorded at booking'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {selectedPaymentModalAppt.payment?.paymentOption === 'emi' && selectedPaymentModalAppt.payment.emiDetails && (
                <div className="p-4 bg-purple-50 rounded-2xl border border-purple-200 space-y-2">
                  <h4 className="font-bold text-purple-950 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-purple-700" />
                    0% Medical Care EMI Application Information
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-xs bg-white p-3 rounded-xl border border-purple-100">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Financing Bank</span>
                      <span className="font-bold text-purple-950">{selectedPaymentModalAppt.payment.emiDetails.financingPartner}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Tenure & Installment</span>
                      <span className="font-bold text-purple-950">
                        {selectedPaymentModalAppt.payment.emiDetails.planMonths} Months @ ₹{selectedPaymentModalAppt.payment.emiDetails.monthlyInstallment}/mo
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Applicant Full Name</span>
                      <span className="font-bold text-slate-800">{selectedPaymentModalAppt.payment.emiDetails.applicantName}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Employment Type</span>
                      <span className="font-medium text-slate-700">{selectedPaymentModalAppt.payment.emiDetails.employmentType}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">PAN / Aadhaar (Last 4)</span>
                      <span className="font-mono font-bold text-slate-900">****{selectedPaymentModalAppt.payment.emiDetails.panOrAadhaarLast4}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">EMI Registered Mobile</span>
                      <span className="font-bold text-slate-800">{selectedPaymentModalAppt.payment.emiDetails.contactPhone}</span>
                    </div>
                  </div>
                </div>
              )}

              {selectedPaymentModalAppt.payment?.paymentOption === 'in_hospital' && (
                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 space-y-2">
                  <h4 className="font-bold text-amber-950 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-amber-700" />
                    Counter Collection Information
                  </h4>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Collection Counter:</span>
                      <span className="font-bold text-slate-800">OPD Reception Counter 01</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Amount to Collect:</span>
                      <span className="font-bold text-amber-900 text-sm">₹{selectedPaymentModalAppt.payment.consultationFee || 400}.00</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Accepted Payment Modes:</span>
                      <span className="font-medium text-slate-700">Cash, Card, QR at Counter</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Doctor Actions */}
              <div className="pt-2 flex flex-wrap gap-2 justify-end">
                {selectedPaymentModalAppt.payment?.paymentStatus !== 'paid' && (
                  <button
                    onClick={() => {
                      handleMarkPaymentPaid(selectedPaymentModalAppt);
                      setSelectedPaymentModalAppt(null);
                    }}
                    className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Confirm & Mark Fee as Paid</span>
                  </button>
                )}
                <button
                  onClick={() => setSelectedPaymentModalAppt(null)}
                  className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
