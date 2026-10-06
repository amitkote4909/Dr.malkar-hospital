import React, { useState, useEffect } from 'react';
import { useAuth } from '../firebase/authContext';
import { 
  AppointmentRecord, 
  PatientReport, 
  PatientVitals, 
  PaymentDetails,
  EmiDetails,
  subscribeToPatientAppointments, 
  cancelAppointment,
  patientSubmitPayment 
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
  ArrowRight,
  ClipboardList,
  LogOut,
  QrCode,
  Building2,
  Copy,
  Check,
  Sparkles,
  Info
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

  // Modal for Completing Doctor Prescribed Payment
  const [payModalAppt, setPayModalAppt] = useState<AppointmentRecord | null>(null);
  const [payOption, setPayOption] = useState<'online_upi' | 'in_hospital' | 'emi'>('online_upi');
  const [upiUtrInput, setUpiUtrInput] = useState('');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);

  // EMI fields in modal
  const [emiMonths, setEmiMonths] = useState<number>(3);
  const [emiBank, setEmiBank] = useState('Bajaj Finserv Health EMI');
  const [emiApplicantName, setEmiApplicantName] = useState('');
  const [emiEmployment, setEmiEmployment] = useState('Salaried (Private / Govt)');
  const [emiPanOrAadhaar, setEmiPanOrAadhaar] = useState('');
  const [emiPhone, setEmiPhone] = useState('');

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

  // Open Payment Modal
  const handleOpenPaymentModal = (appt: AppointmentRecord) => {
    setPayModalAppt(appt);
    setPayOption('online_upi');
    setUpiUtrInput(appt.payment?.transactionId || '');
    setEmiApplicantName(profile?.displayName || appt.patientName);
    setEmiPhone(profile?.phone || appt.phone);
    setEmiPanOrAadhaar(appt.payment?.emiDetails?.panOrAadhaarLast4 || '');
  };

  const handleCopyUpiId = () => {
    navigator.clipboard.writeText('malkarhospital@okhdfcbank');
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  // Submit Patient Payment to Firestore
  const handleConfirmPatientPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payModalAppt?.id) return;

    const fee = payModalAppt.payment?.consultationFee || 400;
    setIsSubmittingPayment(true);

    try {
      let paymentRecord: PaymentDetails;

      if (payOption === 'online_upi') {
        if (!upiUtrInput.trim() || upiUtrInput.trim().length < 6) {
          alert('Please enter your 12-digit UPI Transaction / UTR Reference number.');
          setIsSubmittingPayment(false);
          return;
        }

        paymentRecord = {
          consultationFee: fee,
          totalAmount: fee,
          paymentOption: 'online_upi',
          paymentStatus: 'paid',
          paymentMethod: 'Online UPI QR Scanner',
          transactionId: upiUtrInput.trim(),
          upiIdUsed: 'malkarhospital@okhdfcbank',
          paidAt: new Date().toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }),
          invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
        };
      } else if (payOption === 'in_hospital') {
        paymentRecord = {
          consultationFee: fee,
          totalAmount: fee,
          paymentOption: 'in_hospital',
          paymentStatus: 'pay_at_clinic',
          paymentMethod: 'Pay at Hospital Counter',
          invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
        };
      } else {
        // EMI Option
        if (!emiApplicantName.trim()) {
          alert('Please enter applicant name for EMI.');
          setIsSubmittingPayment(false);
          return;
        }
        if (!emiPanOrAadhaar.trim() || emiPanOrAadhaar.trim().length < 4) {
          alert('Please enter last 4 digits of PAN or Aadhaar card for EMI verification.');
          setIsSubmittingPayment(false);
          return;
        }

        const monthlyInst = Math.ceil(fee / emiMonths);
        const emiDetails: EmiDetails = {
          planMonths: emiMonths,
          monthlyInstallment: monthlyInst,
          financingPartner: emiBank,
          applicantName: emiApplicantName.trim(),
          employmentType: emiEmployment,
          panOrAadhaarLast4: emiPanOrAadhaar.trim().slice(-4),
          contactPhone: emiPhone.trim() || apptPhone(payModalAppt),
          approvalStatus: 'Application Submitted',
        };

        paymentRecord = {
          consultationFee: fee,
          totalAmount: fee,
          paymentOption: 'emi',
          paymentStatus: 'emi_processing',
          paymentMethod: `Medical EMI (${emiMonths} Mo - ${emiBank})`,
          emiDetails,
          invoiceNumber: `EMI-${Date.now().toString().slice(-6)}`,
        };
      }

      await patientSubmitPayment(payModalAppt.id, paymentRecord);

      setNotification({
        message: `Payment details successfully recorded! Your consulting doctor (${payModalAppt.doctorName}) can now view your payment confirmation in real time.`,
        type: 'success',
      });
      setPayModalAppt(null);
      setTimeout(() => setNotification(null), 6000);
    } catch (err) {
      console.error('Payment submit error:', err);
      setNotification({ message: 'Failed to record payment. Please try again.', type: 'error' });
    } finally {
      setIsSubmittingPayment(false);
    }
  };

  const apptPhone = (appt: AppointmentRecord) => appt.phone || profile?.phone || '';

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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 animate-in fade-in">
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
            <span className="text-xs text-emerald-700 font-semibold">Time Slot & Fee Prescribed</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Awaiting Doctor Review
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
            <span>My Appointments & Payments ({appointments.length})</span>
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
            <span>Vital Signs Tracker</span>
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
            <div className="space-y-6">
              {appointments.map((appt) => {
                const isPending = appt.status === 'pending';
                const isConfirmed = appt.status === 'confirmed';
                const isCompleted = appt.status === 'completed';
                const isCancelled = appt.status === 'cancelled';

                const fee = appt.payment?.consultationFee || 400;
                const isPaid = appt.payment?.paymentStatus === 'paid';
                const isCounterPay = appt.payment?.paymentOption === 'in_hospital' || appt.payment?.paymentStatus === 'pay_at_clinic';
                const isEmi = appt.payment?.paymentOption === 'emi' || appt.payment?.paymentStatus === 'emi_processing';

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
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                      
                      <div className="space-y-3.5 flex-1 max-w-3xl">
                        
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs font-bold text-sky-800 bg-sky-50 px-2.5 py-0.5 rounded-lg border border-sky-100">
                            REF: {appt.id?.slice(0, 8)}
                          </span>

                          {/* Status Badges */}
                          {isPending && (
                            <span className="text-xs font-black bg-amber-100 text-amber-900 px-3 py-1 rounded-full flex items-center gap-1.5 border border-amber-200">
                              <span className="w-2 h-2 rounded-full bg-amber-600 animate-ping"></span>
                              Status: Pending Doctor Review & Fee
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
                            {appt.doctorNotes && (
                              <div className="sm:col-span-2 pt-1 border-t border-emerald-200/40">
                                <span className="text-sky-950 font-bold">Doctor Advice: </span>
                                <span className="text-sky-800 leading-relaxed">{appt.doctorNotes}</span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Pending Explanation */}
                        {isPending && (
                          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
                            <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                            <div>
                              <p className="font-bold text-sm text-amber-950 mb-0.5">
                                Awaiting Doctor Review & Consultation Fee Prescription
                              </p>
                              <p className="leading-relaxed">
                                {appt.doctorName} is assessing your clinical complaints. As soon as the doctor allocates your exact time slot and decides the consultation fee, the payment options (UPI QR, Hospital Counter, 0% EMI) will unlock here.
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

                        {/* ========================================================== */}
                        {/* THE PAYMENT SECTION (Unlocked upon Doctor Confirmation) */}
                        {/* ========================================================== */}
                        {isConfirmed && (
                          <div className="mt-3 p-4 sm:p-5 rounded-2xl border border-slate-200 bg-slate-50/90 space-y-3">
                            <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-200">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-black uppercase tracking-wider text-slate-700">
                                  Consultation Fee (Prescribed by Doctor):
                                </span>
                                <span className="text-base font-black text-sky-900 bg-white px-2.5 py-0.5 rounded-lg border border-slate-200 shadow-2xs">
                                  🔒 ₹{fee}.00 (Permanently Locked)
                                </span>
                              </div>

                              <span className={`px-3 py-1 rounded-full text-xs font-black inline-flex items-center gap-1.5 ${
                                isPaid
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  : isEmi
                                  ? 'bg-purple-100 text-purple-900 border border-purple-300'
                                  : isCounterPay
                                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                  : 'bg-yellow-100 text-yellow-900 border border-yellow-300'
                              }`}>
                                {isPaid ? (
                                  <>
                                    <CheckCircle className="w-3.5 h-3.5 text-emerald-700" />
                                    <span>PAID ONLINE (UPI) ✓</span>
                                  </>
                                ) : isEmi ? (
                                  <>
                                    <CreditCard className="w-3.5 h-3.5 text-purple-700" />
                                    <span>0% MEDICAL EMI ACTIVE</span>
                                  </>
                                ) : isCounterPay ? (
                                  <>
                                    <Building2 className="w-3.5 h-3.5 text-amber-700" />
                                    <span>PAY AT HOSPITAL COUNTER</span>
                                  </>
                                ) : (
                                  <>
                                    <AlertCircle className="w-3.5 h-3.5 text-yellow-700" />
                                    <span>PAYMENT PENDING</span>
                                  </>
                                )}
                              </span>
                            </div>

                            {/* Detailed Payment Info or Pay Action */}
                            {isPaid ? (
                              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                <div>
                                  <p className="font-bold">Payment Verified via Online UPI QR Scanner</p>
                                  <p className="font-mono text-[11px] text-emerald-800">
                                    UTR / Transaction ID: <strong>{appt.payment?.transactionId}</strong> • Invoice: {appt.payment?.invoiceNumber}
                                  </p>
                                </div>
                                <span className="font-semibold text-[11px] text-emerald-700 bg-white px-2.5 py-1 rounded-md border border-emerald-200">
                                  {appt.payment?.paidAt || 'Paid Online'}
                                </span>
                              </div>
                            ) : isEmi && appt.payment?.emiDetails ? (
                              <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 text-xs text-purple-900 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                <div>
                                  <p className="font-bold flex items-center gap-1">
                                    <CreditCard className="w-4 h-4 text-purple-700" />
                                    0% Medical EMI Approved ({appt.payment.emiDetails.financingPartner})
                                  </p>
                                  <p className="text-[11px] text-purple-800">
                                    {appt.payment.emiDetails.planMonths} Monthly Installments of <strong>₹{appt.payment.emiDetails.monthlyInstallment}/mo</strong> • PAN Last 4: ****{appt.payment.emiDetails.panOrAadhaarLast4}
                                  </p>
                                </div>
                                <button
                                  onClick={() => handleOpenPaymentModal(appt)}
                                  className="text-xs font-bold text-purple-700 underline hover:text-purple-900 cursor-pointer"
                                >
                                  Update EMI
                                </button>
                              </div>
                            ) : isCounterPay ? (
                              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                <div>
                                  <p className="font-bold flex items-center gap-1">
                                    <Building2 className="w-4 h-4 text-amber-700" />
                                    Pay at OPD Reception Desk on Arrival
                                  </p>
                                  <p className="text-[11px] text-amber-800">
                                    Please present your Token <strong>{appt.tokenNumber || 'TKN-01'}</strong> at Counter 01 to pay ₹{fee} in cash/card.
                                  </p>
                                </div>
                                <button
                                  onClick={() => handleOpenPaymentModal(appt)}
                                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs transition-colors cursor-pointer"
                                >
                                  Switch to Online UPI / EMI
                                </button>
                              </div>
                            ) : (
                              /* Pending State -> Direct Button to Complete Payment */
                              <div className="p-4 bg-sky-50 rounded-xl border border-sky-200 text-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                <div>
                                  <p className="font-bold text-sm text-sky-950">
                                    Complete Consultation Fee Payment (₹{fee})
                                  </p>
                                  <p className="text-slate-600 text-xs mt-0.5">
                                    Choose Online UPI QR scanner, Pay at Clinic Counter, or 0% Medical EMI.
                                  </p>
                                </div>
                                <button
                                  onClick={() => handleOpenPaymentModal(appt)}
                                  className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shrink-0"
                                >
                                  <CreditCard className="w-4 h-4" />
                                  <span>Pay Prescribed Fee (₹{fee})</span>
                                </button>
                              </div>
                            )}

                          </div>
                        )}

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

                        {isConfirmed && !isPaid && (
                          <button
                            onClick={() => handleOpenPaymentModal(appt)}
                            className="px-4 py-2 bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold text-xs rounded-xl border border-sky-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>Payment Options</span>
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
                During your consultation with the physician, nursing staff will record your vitals.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <HeartPulse className="w-5 h-5 text-rose-600" />
                  Your Latest Physiological Parameters
                </h3>
                <p className="text-xs text-slate-500">Recorded during hospital OPD assessment.</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <span className="text-xs font-bold text-slate-400 uppercase">Blood Pressure</span>
                  <p className="text-xl font-black text-slate-900 mt-1">{latestVitals.bp || '120/80 mmHg'}</p>
                  <span className="text-[11px] text-emerald-600 font-semibold">Normal</span>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <span className="text-xs font-bold text-slate-400 uppercase">Heart Rate / Pulse</span>
                  <p className="text-xl font-black text-slate-900 mt-1">{latestVitals.pulse || '74 bpm'}</p>
                  <span className="text-[11px] text-emerald-600 font-semibold">Regular Rhythm</span>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <span className="text-xs font-bold text-slate-400 uppercase">Blood Sugar</span>
                  <p className="text-xl font-black text-slate-900 mt-1">{latestVitals.sugar || '110 mg/dL'}</p>
                  <span className="text-[11px] text-emerald-600 font-semibold">Fasting Normal</span>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <span className="text-xs font-bold text-slate-400 uppercase">Blood Oxygen (SpO2)</span>
                  <p className="text-xl font-black text-slate-900 mt-1">{latestVitals.spo2 || '99%'}</p>
                  <span className="text-[11px] text-emerald-600 font-semibold">Optimal</span>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <span className="text-xs font-bold text-slate-400 uppercase">Temperature</span>
                  <p className="text-xl font-black text-slate-900 mt-1">{latestVitals.temp || '98.4 °F'}</p>
                  <span className="text-[11px] text-emerald-600 font-semibold">Afebrile</span>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <span className="text-xs font-bold text-slate-400 uppercase">Body Weight</span>
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
              {appointments.map((appt) => {
                const fee = appt.payment?.consultationFee || 400;
                const isPaid = appt.payment?.paymentStatus === 'paid';

                return (
                  <div key={appt.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                          {appt.payment?.invoiceNumber || `INV-${appt.id?.slice(0, 6)}`}
                        </span>
                        <span className={`text-xs font-black px-2.5 py-0.5 rounded-full ${
                          isPaid
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-900'
                        }`}>
                          {isPaid ? 'PAID ONLINE (UPI) ✓' : appt.payment?.paymentOption === 'emi' ? '0% EMI ACTIVE' : 'Pay at Clinic Counter'}
                        </span>
                      </div>

                      <h4 className="font-bold text-slate-900 text-sm mt-1.5">
                        Consultation with {appt.doctorName}
                      </h4>
                      <p className="text-xs text-slate-500">
                        Date: {appt.appointmentDate} • Total Prescribed Fee: <strong>₹{fee}.00</strong>
                        {appt.payment?.transactionId && ` • UTR: ${appt.payment.transactionId}`}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {!isPaid && appt.status === 'confirmed' && (
                        <button
                          onClick={() => handleOpenPaymentModal(appt)}
                          className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                        >
                          Complete Payment
                        </button>
                      )}
                      <button
                        onClick={() => setPrintPassAppt(appt)}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        Print Receipt
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )

        )}

      </div>

      {/* ============================================================== */}
      {/* COMPLETE PAYMENT MODAL (Where the Payment Section Now Lives!) */}
      {/* ============================================================== */}
      {payModalAppt && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative animate-in zoom-in-95 max-h-[92vh] overflow-y-auto">
            
            <button
              onClick={() => setPayModalAppt(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 text-xl font-bold w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center cursor-pointer"
            >
              ✕
            </button>

            {/* Modal Header */}
            <div className="text-left pb-4 border-b border-slate-200">
              <span className="text-[11px] font-black uppercase text-sky-700 bg-sky-100 px-2.5 py-0.5 rounded-full inline-block mb-1">
                Doctor Prescribed Consultation Fee
              </span>
              <h3 className="text-2xl font-black text-slate-900">
                Complete Consultation Payment
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Appointment for <strong>{payModalAppt.patientName}</strong> with <strong>{payModalAppt.doctorName}</strong> on {payModalAppt.appointmentDate}.
              </p>
            </div>

            {/* Fee Callout Box */}
            <div className="mt-4 p-4 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-600 block flex items-center gap-1 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Doctor Prescribed Fee (Locked):
                </span>
                <span className="text-2xl font-black text-sky-950">🔒 ₹{payModalAppt.payment?.consultationFee || 400}.00</span>
              </div>
              <div className="text-right text-xs text-slate-500">
                <span>Allotted Slot: <strong>{payModalAppt.assignedTime || 'OPD Shift'}</strong></span>
                <span className="block font-mono font-bold text-sky-800">Token: {payModalAppt.tokenNumber || 'TKN-01'}</span>
              </div>
            </div>

            <form onSubmit={handleConfirmPatientPayment} className="mt-5 space-y-5">
              
              {/* 3 Payment Options Switcher */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Choose Payment Method:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  
                  {/* Option 1: Online UPI */}
                  <button
                    type="button"
                    onClick={() => setPayOption('online_upi')}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      payOption === 'online_upi'
                        ? 'bg-sky-50 border-sky-500 ring-2 ring-sky-200 text-sky-950 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <QrCode className="w-5 h-5 text-sky-600" />
                      <span className="text-[10px] font-bold bg-sky-200 text-sky-800 px-1.5 py-0.5 rounded">Instant</span>
                    </div>
                    <h4 className="font-bold text-xs mt-2 text-slate-900">1. Online UPI</h4>
                    <p className="text-[10px] text-slate-500">QR Scanner Photo</p>
                  </button>

                  {/* Option 2: Pay at Counter */}
                  <button
                    type="button"
                    onClick={() => setPayOption('in_hospital')}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      payOption === 'in_hospital'
                        ? 'bg-amber-50 border-amber-500 ring-2 ring-amber-200 text-amber-950 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <Building2 className="w-5 h-5 text-amber-600" />
                      <span className="text-[10px] font-bold bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded">Cash/Card</span>
                    </div>
                    <h4 className="font-bold text-xs mt-2 text-slate-900">2. In Hospital</h4>
                    <p className="text-[10px] text-slate-500">Reception Counter</p>
                  </button>

                  {/* Option 3: Medical Care EMI */}
                  <button
                    type="button"
                    onClick={() => setPayOption('emi')}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      payOption === 'emi'
                        ? 'bg-purple-50 border-purple-500 ring-2 ring-purple-200 text-purple-950 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <CreditCard className="w-5 h-5 text-purple-600" />
                      <span className="text-[10px] font-bold bg-purple-200 text-purple-900 px-1.5 py-0.5 rounded">0% Interest</span>
                    </div>
                    <h4 className="font-bold text-xs mt-2 text-slate-900">3. Medical EMI</h4>
                    <p className="text-[10px] text-slate-500">Easy Installments</p>
                  </button>

                </div>
              </div>

              {/* VIEW 1: ONLINE UPI QR SCANNER */}
              {payOption === 'online_upi' && (
                <div className="p-4 sm:p-5 bg-sky-50/70 rounded-2xl border border-sky-200 space-y-4 animate-in fade-in">
                  
                  <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-4 rounded-xl border border-sky-100">
                    {/* SVG QR Code */}
                    <div className="w-36 h-36 bg-white p-2 rounded-xl border border-sky-300 shadow-sm flex flex-col items-center justify-center shrink-0">
                      <svg viewBox="0 0 100 100" className="w-full h-full text-slate-900">
                        {/* Realistic Mock QR Pattern */}
                        <rect width="100" height="100" fill="white" />
                        <rect x="5" y="5" width="26" height="26" fill="black" />
                        <rect x="8" y="8" width="20" height="20" fill="white" />
                        <rect x="11" y="11" width="14" height="14" fill="black" />
                        
                        <rect x="69" y="5" width="26" height="26" fill="black" />
                        <rect x="72" y="8" width="20" height="20" fill="white" />
                        <rect x="75" y="11" width="14" height="14" fill="black" />
                        
                        <rect x="5" y="69" width="26" height="26" fill="black" />
                        <rect x="8" y="72" width="20" height="20" fill="white" />
                        <rect x="11" y="75" width="14" height="14" fill="black" />

                        {/* Random pattern blocks */}
                        <rect x="36" y="8" width="8" height="8" fill="black" />
                        <rect x="48" y="8" width="8" height="8" fill="black" />
                        <rect x="36" y="24" width="8" height="8" fill="black" />
                        <rect x="48" y="24" width="14" height="8" fill="black" />
                        <rect x="8" y="38" width="8" height="8" fill="black" />
                        <rect x="22" y="38" width="14" height="8" fill="black" />
                        <rect x="40" y="40" width="20" height="20" fill="black" />
                        <rect x="44" y="44" width="12" height="12" fill="white" />
                        <rect x="48" y="48" width="4" height="4" fill="#0284c7" />
                        <rect x="68" y="38" width="8" height="8" fill="black" />
                        <rect x="82" y="38" width="10" height="8" fill="black" />
                        <rect x="36" y="68" width="8" height="14" fill="black" />
                        <rect x="48" y="68" width="8" height="8" fill="black" />
                        <rect x="68" y="68" width="14" height="8" fill="black" />
                        <rect x="68" y="82" width="8" height="10" fill="black" />
                        <rect x="82" y="78" width="10" height="14" fill="black" />
                      </svg>
                      <span className="text-[9px] font-mono text-slate-500 font-bold mt-1">UPI SCAN & PAY</span>
                    </div>

                    <div className="text-left space-y-2 flex-1">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Official UPI ID</span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <code className="text-xs font-mono font-bold text-sky-950 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                            malkarhospital@okhdfcbank
                          </code>
                          <button
                            type="button"
                            onClick={handleCopyUpiId}
                            className="p-1 text-slate-500 hover:text-sky-600 cursor-pointer"
                            title="Copy UPI ID"
                          >
                            {copiedUpi ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div className="text-xs text-slate-600 leading-relaxed">
                        Scan with Google Pay, PhonePe, Paytm, or BHIM. Amount: <strong>₹{payModalAppt.payment?.consultationFee || 400}.00</strong>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      12-Digit UPI Transaction / UTR Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      maxLength={20}
                      value={upiUtrInput}
                      onChange={(e) => setUpiUtrInput(e.target.value)}
                      placeholder="e.g. 428719284102"
                      required={payOption === 'online_upi'}
                      className="w-full px-4 py-2.5 rounded-xl border border-sky-300 bg-white text-xs font-mono font-bold text-slate-900 outline-hidden"
                    />
                    <span className="text-[10px] text-slate-500 mt-0.5 block">
                      Found in your UPI app payment receipt under 'UPI Ref No.' or 'UTR'.
                    </span>
                  </div>

                </div>
              )}

              {/* VIEW 2: PAY IN HOSPITAL COUNTER */}
              {payOption === 'in_hospital' && (
                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 space-y-3 text-xs text-amber-950 animate-in fade-in">
                  <div className="flex items-start gap-3">
                    <Building2 className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-sm text-amber-950">Pay at Hospital Reception Desk</h4>
                      <p className="mt-1 leading-relaxed text-amber-900">
                        You can pay <strong>₹{payModalAppt.payment?.consultationFee || 400}.00</strong> in cash, debit card, or via UPI machine at OPD Reception Counter 01 when you arrive for your appointment.
                      </p>
                      <p className="mt-2 text-[11px] text-amber-800 font-semibold">
                        Your appointment time slot ({payModalAppt.assignedTime}) and token pass ({payModalAppt.tokenNumber}) remain secured.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* VIEW 3: 0% MEDICAL EMI */}
              {payOption === 'emi' && (
                <div className="p-4 bg-purple-50/80 rounded-2xl border border-purple-200 space-y-3.5 text-xs animate-in fade-in">
                  <div className="flex items-center justify-between pb-2 border-b border-purple-200">
                    <h4 className="font-bold text-sm text-purple-950 flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4 text-purple-700" />
                      0% Interest Medical Care EMI Application
                    </h4>
                    <span className="font-black text-purple-900 text-xs">
                      ₹{Math.ceil((payModalAppt.payment?.consultationFee || 400) / emiMonths)} / Month
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Financing Partner
                      </label>
                      <select
                        value={emiBank}
                        onChange={(e) => setEmiBank(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-purple-300 bg-white text-xs outline-hidden"
                      >
                        <option value="Bajaj Finserv Health EMI">Bajaj Finserv Health EMI</option>
                        <option value="HDFC Medical Care EMI">HDFC Medical Care EMI</option>
                        <option value="SBI Healthcare Finance">SBI Healthcare Finance</option>
                        <option value="ICICI Bank Care Card">ICICI Bank Care Card</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Tenure Duration
                      </label>
                      <select
                        value={emiMonths}
                        onChange={(e) => setEmiMonths(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border border-purple-300 bg-white text-xs outline-hidden font-bold"
                      >
                        <option value={3}>3 Months No-Cost EMI</option>
                        <option value={6}>6 Months No-Cost EMI</option>
                        <option value={9}>9 Months Easy EMI</option>
                        <option value={12}>12 Months Easy EMI</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Applicant / Cardholder Name
                      </label>
                      <input
                        type="text"
                        value={emiApplicantName}
                        onChange={(e) => setEmiApplicantName(e.target.value)}
                        placeholder="Name as per PAN / Bank"
                        required={payOption === 'emi'}
                        className="w-full px-3 py-2 rounded-xl border border-purple-300 bg-white text-xs outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        PAN or Aadhaar (Last 4 Digits)
                      </label>
                      <input
                        type="text"
                        maxLength={4}
                        value={emiPanOrAadhaar}
                        onChange={(e) => setEmiPanOrAadhaar(e.target.value.replace(/\D/g, ''))}
                        placeholder="e.g. 5821"
                        required={payOption === 'emi'}
                        className="w-full px-3 py-2 rounded-xl border border-purple-300 bg-white text-xs font-mono outline-hidden"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 flex gap-3">
                <button
                  type="submit"
                  disabled={isSubmittingPayment}
                  className="flex-1 py-3 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl text-sm transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-xs"
                >
                  {isSubmittingPayment ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>
                        {payOption === 'online_upi' && 'Confirm & Verify UPI Payment'}
                        {payOption === 'in_hospital' && 'Confirm Pay at Reception Desk'}
                        {payOption === 'emi' && 'Submit 0% EMI Application'}
                      </span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setPayModalAppt(null)}
                  className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm cursor-pointer"
                >
                  Cancel
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

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
              <div className="flex justify-between pb-1.5 border-b border-slate-100">
                <span className="text-slate-500">Prescribed Fee & Status:</span>
                <span className="font-bold text-slate-900">
                  ₹{printPassAppt.payment?.consultationFee || 400} ({printPassAppt.payment?.paymentStatus === 'paid' ? 'Paid Online ✓' : printPassAppt.payment?.paymentOption === 'emi' ? '0% EMI Active' : 'Pay at Counter'})
                </span>
              </div>
              {printPassAppt.payment?.transactionId && (
                <div className="flex justify-between pb-1.5 border-b border-slate-100">
                  <span className="text-slate-500">UPI Ref / UTR:</span>
                  <span className="font-mono font-bold text-emerald-700">{printPassAppt.payment.transactionId}</span>
                </div>
              )}
              {printPassAppt.preparationInstructions && (
                <div className="bg-sky-50 p-2.5 rounded-xl border border-sky-100 text-sky-900">
                  <strong>Preparation Advice:</strong> {printPassAppt.preparationInstructions}
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
