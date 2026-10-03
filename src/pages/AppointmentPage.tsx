import React, { useState, useEffect } from 'react';
import { useAuth } from '../firebase/authContext';
import { bookAppointment, AppointmentRecord, PaymentDetails, EmiDetails } from '../firebase/dbService';
import { DEPARTMENTS, CONSULTING_DOCTORS, HOSPITAL_INFO, Doctor } from '../data/hospitalData';
import { 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  FileText,
  CreditCard,
  QrCode,
  Building2,
  Copy,
  Check,
  ShieldCheck,
  Sparkles,
  Info
} from 'lucide-react';

interface AppointmentPageProps {
  initialDoctorName?: string;
  initialDepartment?: string;
  setCurrentTab: (tab: string) => void;
}

export const AppointmentPage: React.FC<AppointmentPageProps> = ({
  initialDoctorName,
  initialDepartment,
  setCurrentTab,
}) => {
  const { user, profile } = useAuth();

  // Form Fields State
  const [patientName, setPatientName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [age, setAge] = useState('28');
  const [gender, setGender] = useState('male');
  const [department, setDepartment] = useState(initialDepartment || 'general');
  const [doctorId, setDoctorId] = useState('');
  const [doctorName, setDoctorName] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [preferredTimeWindow, setPreferredTimeWindow] = useState('Morning (09:00 AM - 01:00 PM)');
  const [reason, setReason] = useState('');

  // Payment Feature States (3 Options: Online UPI, In Hospital, EMI)
  const [paymentOption, setPaymentOption] = useState<'online_upi' | 'in_hospital' | 'emi'>('online_upi');
  const [upiTransactionId, setUpiTransactionId] = useState('');
  const [upiConfirmed, setUpiConfirmed] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);

  // EMI Required Details
  const [emiMonths, setEmiMonths] = useState<number>(3);
  const [emiBank, setEmiBank] = useState('Bajaj Finserv Health EMI');
  const [emiApplicantName, setEmiApplicantName] = useState('');
  const [emiEmployment, setEmiEmployment] = useState('Salaried (Private / Govt)');
  const [emiPanOrAadhaar, setEmiPanOrAadhaar] = useState('');
  const [emiPhone, setEmiPhone] = useState('');

  // UI status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookedReceipt, setBookedReceipt] = useState<AppointmentRecord | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Prefill with authenticated user details
  useEffect(() => {
    if (user || profile) {
      if (profile?.displayName) {
        setPatientName(profile.displayName);
        setEmiApplicantName(profile.displayName);
      }
      if (user?.email) setEmail(user.email);
      if (profile?.phone) {
        setPhone(profile.phone);
        setEmiPhone(profile.phone);
      }
      if (profile?.gender) setGender(profile.gender);
    }
  }, [user, profile]);

  // Set default min date to today
  const todayStr = new Date().toISOString().split('T')[0];

  // Doctors available for chosen department (includes Dr. Anjali Deshpande for Surgery & Trauma)
  const filteredDoctors = CONSULTING_DOCTORS.filter((d) => 
    d.department === department || 
    (department === 'emergency' && d.id === 'dr-anjali-deshpande') || 
    (department === 'cardiology' && d.id === 'dr-anjali-deshpande')
  );

  // Synchronize doctor when department changes or initial props exist
  useEffect(() => {
    if (initialDoctorName) {
      const match = CONSULTING_DOCTORS.find((d) => d.name === initialDoctorName);
      if (match) {
        setDepartment(match.department);
        setDoctorId(match.id);
        setDoctorName(match.name);
        return;
      }
    }

    if (filteredDoctors.length > 0) {
      const existsInDept = filteredDoctors.some((d) => d.id === doctorId);
      if (!existsInDept) {
        setDoctorId(filteredDoctors[0].id);
        setDoctorName(filteredDoctors[0].name);
      }
    } else {
      setDoctorId(CONSULTING_DOCTORS[0]?.id || 'dr-vaibhav-malkar');
      setDoctorName(CONSULTING_DOCTORS[0]?.name || 'Dr. Vaibhav G. Malkar');
    }
  }, [department, initialDoctorName]);

  const handleDepartmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDept = e.target.value;
    setDepartment(newDept);
    const docs = CONSULTING_DOCTORS.filter((d) => d.department === newDept);
    if (docs.length > 0) {
      setDoctorId(docs[0].id);
      setDoctorName(docs[0].name);
    } else {
      setDoctorId(CONSULTING_DOCTORS[0]?.id || 'dr-vaibhav-malkar');
      setDoctorName(CONSULTING_DOCTORS[0]?.name || 'Dr. Vaibhav G. Malkar');
    }
  };

  const handleDoctorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    setDoctorId(selectedId);
    const docObj = CONSULTING_DOCTORS.find((d) => d.id === selectedId);
    if (docObj) {
      setDoctorName(docObj.name);
    }
  };

  // Current selected doctor object and consultation fee
  const selectedDoctorObj = CONSULTING_DOCTORS.find((d) => d.id === doctorId) || CONSULTING_DOCTORS[0];
  const consultationFee = selectedDoctorObj?.consultationFee || 400;

  // Monthly installment calculation for EMI
  const monthlyInstallment = Math.ceil(consultationFee / emiMonths);

  const handleCopyUpiId = () => {
    navigator.clipboard.writeText('malkarhospital@okhdfcbank');
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!patientName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (!phone.trim() || phone.length < 8) {
      setErrorMessage('Please enter a valid phone number (at least 8-10 digits).');
      return;
    }
    if (!appointmentDate) {
      setErrorMessage('Please choose your preferred appointment date.');
      return;
    }

    // Validate Online Payment requirements if selected
    if (paymentOption === 'online_upi' && !upiTransactionId.trim()) {
      setErrorMessage('Please enter the 12-digit UPI Transaction / UTR Number received after scanning the UPI QR code.');
      return;
    }

    // Validate EMI requirements if selected
    if (paymentOption === 'emi') {
      if (!emiApplicantName.trim()) {
        setErrorMessage('Please provide the Applicant / Cardholder Name for the Medical EMI.');
        return;
      }
      if (!emiPanOrAadhaar.trim() || emiPanOrAadhaar.trim().length < 4) {
        setErrorMessage('Please enter the last 4 digits of your PAN or Aadhaar card for EMI verification.');
        return;
      }
      if (!emiPhone.trim() || emiPhone.trim().length < 8) {
        setErrorMessage('Please enter a valid mobile number registered with your EMI / Bank account.');
        return;
      }
    }

    setIsSubmitting(true);

    try {
      // Build structured payment object for doctor inspection
      let paymentRecord: PaymentDetails;

      if (paymentOption === 'online_upi') {
        paymentRecord = {
          consultationFee,
          totalAmount: consultationFee,
          paymentOption: 'online_upi',
          paymentStatus: 'paid',
          paymentMethod: 'Online UPI Scanner',
          transactionId: upiTransactionId.trim(),
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
      } else if (paymentOption === 'in_hospital') {
        paymentRecord = {
          consultationFee,
          totalAmount: consultationFee,
          paymentOption: 'in_hospital',
          paymentStatus: 'pay_at_clinic',
          paymentMethod: 'Pay at Hospital Counter',
          invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
        };
      } else {
        // EMI Option
        const emiDetails: EmiDetails = {
          planMonths: emiMonths,
          monthlyInstallment,
          financingPartner: emiBank,
          applicantName: emiApplicantName.trim() || patientName.trim(),
          employmentType: emiEmployment,
          panOrAadhaarLast4: emiPanOrAadhaar.trim().slice(-4),
          contactPhone: emiPhone.trim() || phone.trim(),
          approvalStatus: 'Application Submitted',
        };

        paymentRecord = {
          consultationFee,
          totalAmount: consultationFee,
          paymentOption: 'emi',
          paymentStatus: 'emi_processing',
          paymentMethod: `Medical EMI (${emiMonths} Mo - ${emiBank})`,
          emiDetails,
          invoiceNumber: `EMI-${Date.now().toString().slice(-6)}`,
        };
      }

      const appointmentPayload: Omit<AppointmentRecord, 'id' | 'createdAt' | 'status' | 'assignedTime'> = {
        patientUid: user?.uid || 'guest-patient',
        patientName: patientName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        age: age.trim() || '28',
        gender: gender || 'male',
        department,
        doctorId: doctorId || CONSULTING_DOCTORS[0]?.id || 'dr-vaibhav-malkar',
        doctorName: doctorName || CONSULTING_DOCTORS[0]?.name || 'Dr. Vaibhav G. Malkar',
        appointmentDate,
        preferredTimeWindow,
        reason: reason.trim() || 'General Medical Consultation',
        payment: paymentRecord,
      };

      // Saves to Firestore with status: "pending"
      const docId = await bookAppointment(appointmentPayload);

      setBookedReceipt({
        id: docId,
        status: 'pending',
        ...appointmentPayload,
      });

      window.scrollTo({ top: 100, behavior: 'smooth' });
    } catch (err: unknown) {
      console.error('Booking failed:', err);
      setErrorMessage(
        err instanceof Error ? err.message : 'Failed to book appointment. Please try again or call our hotline.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      
      {/* Hero Header */}
      <section className="bg-linear-to-b from-sky-100/70 via-sky-50 to-white py-14 text-center border-b border-sky-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <span className="inline-block px-4 py-1.5 rounded-full bg-sky-200/70 text-sky-800 text-xs sm:text-sm font-bold tracking-wider uppercase mb-3">
            Outpatient Department (OPD)
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
            Book Doctor Consultation
          </h1>
          <p className="mt-3 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
            Schedule an appointment with our specialist physicians. Flexible payments with Online UPI, Hospital Counter, or 0% Medical EMI.
          </p>
        </div>
      </section>

      {/* Main Form and Sidebar Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Sidebar */}
          <aside className="lg:col-span-4 space-y-6">
            
            {/* Appointment Process Guide */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-sky-600" />
                How Scheduling Works
              </h3>
              
              <div className="space-y-3 text-xs sm:text-sm text-slate-600">
                <div className="flex gap-3 items-start">
                  <span className="w-6 h-6 rounded-full bg-sky-100 text-sky-700 font-black flex items-center justify-center shrink-0 text-xs">1</span>
                  <p><strong>Submit Request & Fee:</strong> Select specialist doctor and choose payment (UPI, Counter, or EMI).</p>
                </div>
                <div className="flex gap-3 items-start">
                  <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 font-black flex items-center justify-center shrink-0 text-xs">2</span>
                  <p><strong>Doctor Reviews:</strong> Doctor verifies symptoms & payment, allocating your exact time slot & token.</p>
                </div>
                <div className="flex gap-3 items-start">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-black flex items-center justify-center shrink-0 text-xs">3</span>
                  <p><strong>Receive Consultation Slip:</strong> Real-time token number, room chamber, and preparation instructions.</p>
                </div>
              </div>
            </div>

            {/* Emergency Hotline Card */}
            <div className="bg-linear-to-br from-red-600 to-rose-700 text-white rounded-3xl p-6 shadow-md">
              <span className="inline-block bg-white/20 text-white text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full mb-3">
                24/7 Urgent Care
              </span>
              <h3 className="text-xl font-bold mb-2">Need Immediate Attention?</h3>
              <p className="text-red-100 text-sm leading-relaxed mb-4">
                For acute emergencies, trauma, and accidents, please contact our emergency hotline immediately.
              </p>
              <a
                href={`tel:${HOSPITAL_INFO.phone}`}
                className="w-full py-3 bg-white hover:bg-red-50 text-red-700 font-extrabold text-sm rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                <Phone className="w-4 h-4" />
                📞 {HOSPITAL_INFO.phone}
              </a>
            </div>

            {/* Hospital Opening Hours */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-sky-600" />
                Hospital OPD Hours
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between pb-2 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Monday - Friday</span>
                  <span className="font-bold text-slate-800">8:00 AM - 8:30 PM</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Saturday</span>
                  <span className="font-bold text-slate-800">9:00 AM - 5:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Sunday</span>
                  <span className="font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-md">Emergency Only</span>
                </div>
              </div>
            </div>

          </aside>

          {/* Right Main Form Area */}
          <section className="lg:col-span-8">
            
            {/* If appointment was just booked -> Show Confirmation Receipt */}
            {bookedReceipt ? (
              <div className="bg-white rounded-3xl p-8 sm:p-10 border border-amber-200 shadow-xl text-center space-y-6 animate-in fade-in zoom-in-95">
                
                <div className="w-20 h-20 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-4xl mx-auto shadow-inner">
                  ⏳
                </div>

                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-3.5 py-1.5 rounded-full inline-flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-600 animate-ping"></span>
                    Status: Pending Doctor Time Allotment
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-3">
                    Appointment Request Received, {bookedReceipt.patientName}!
                  </h2>
                  <p className="text-slate-600 text-sm max-w-lg mx-auto mt-2 leading-relaxed">
                    Your consultation request and payment information have been broadcast to the hospital clinical portal. 
                    <strong> {bookedReceipt.doctorName}</strong> will review your clinical file and allocate your exact consultation slot.
                  </p>
                </div>

                {/* Receipt Details Box */}
                <div className="max-w-md mx-auto bg-slate-50 rounded-2xl p-6 border border-slate-200 text-left space-y-3 text-sm">
                  <div className="flex justify-between pb-2 border-b border-slate-200/70">
                    <span className="text-slate-500">Booking Reference:</span>
                    <span className="font-mono font-bold text-sky-700 text-xs">{bookedReceipt.id}</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-slate-200/70">
                    <span className="text-slate-500">Consulting Doctor:</span>
                    <span className="font-bold text-slate-900">{bookedReceipt.doctorName}</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-slate-200/70">
                    <span className="text-slate-500">Department:</span>
                    <span className="font-semibold text-slate-800 capitalize">{bookedReceipt.department}</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-slate-200/70">
                    <span className="text-slate-500">Appointment Date:</span>
                    <span className="font-bold text-slate-800">{bookedReceipt.appointmentDate}</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-slate-200/70">
                    <span className="text-slate-500">Preferred Shift:</span>
                    <span className="font-semibold text-slate-700">{bookedReceipt.preferredTimeWindow}</span>
                  </div>
                  
                  {/* Payment Details in Receipt */}
                  <div className="flex justify-between pb-2 border-b border-slate-200/70">
                    <span className="text-slate-500">Consultation Fee:</span>
                    <span className="font-bold text-slate-900">₹{bookedReceipt.payment?.consultationFee || 400}.00</span>
                  </div>

                  <div className="flex justify-between items-center pb-2 border-b border-slate-200/70">
                    <span className="text-slate-500">Payment Option:</span>
                    <span className="font-bold text-slate-800">
                      {bookedReceipt.payment?.paymentOption === 'online_upi' && '📱 Online UPI QR Payment'}
                      {bookedReceipt.payment?.paymentOption === 'in_hospital' && '🏥 Pay in Hospital Counter'}
                      {bookedReceipt.payment?.paymentOption === 'emi' && '💳 Medical Care EMI (0% Interest)'}
                    </span>
                  </div>

                  {bookedReceipt.payment?.paymentOption === 'online_upi' && bookedReceipt.payment.transactionId && (
                    <div className="flex justify-between pb-2 border-b border-slate-200/70 text-xs">
                      <span className="text-slate-500">UPI Ref / UTR:</span>
                      <span className="font-mono font-bold text-emerald-700">{bookedReceipt.payment.transactionId}</span>
                    </div>
                  )}

                  {bookedReceipt.payment?.paymentOption === 'emi' && bookedReceipt.payment.emiDetails && (
                    <div className="p-3 bg-purple-50 rounded-xl border border-purple-100 space-y-1 text-xs text-purple-950">
                      <div className="flex justify-between font-bold">
                        <span>EMI Tenure:</span>
                        <span>{bookedReceipt.payment.emiDetails.planMonths} Months Plan</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Monthly Installment:</span>
                        <span className="font-bold text-purple-900">₹{bookedReceipt.payment.emiDetails.monthlyInstallment}/mo</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Financing Provider:</span>
                        <span>{bookedReceipt.payment.emiDetails.financingPartner}</span>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-1">
                    <span className="text-slate-500">Status:</span>
                    <span className="font-bold text-amber-700 bg-amber-100/70 px-2.5 py-0.5 rounded-full text-xs">
                      Slot Allocation & Payment Review Pending
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-sky-50 rounded-2xl border border-sky-100 text-xs text-sky-900 max-w-md mx-auto text-left flex items-start gap-2.5">
                  <FileText className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                  <p>
                    <strong>Doctor Notification:</strong> The consulting doctor has been notified of your appointment and payment details. You can track updates live on your Patient Portal.
                  </p>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
                  <button
                    onClick={() => setCurrentTab('patient-portal')}
                    className="w-full sm:w-auto px-7 py-3.5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>View in Patient Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setBookedReceipt(null);
                      setReason('');
                      setUpiTransactionId('');
                      setUpiConfirmed(false);
                    }}
                    className="w-full sm:w-auto px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all cursor-pointer"
                  >
                    Book Another Appointment
                  </button>
                </div>

              </div>
            ) : (

              /* Appointment Booking Form */
              <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xl space-y-8">
                
                <div>
                  <h2 className="text-2xl font-black text-slate-900">
                    Patient Consultation Registration
                  </h2>
                  <p className="text-slate-500 text-sm mt-1">
                    Complete your personal information, choose your consulting specialist, and select your preferred payment mode.
                  </p>
                </div>

                {errorMessage && (
                  <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">
                  
                  {/* Step 01: Patient Demographics */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 pb-2 border-b border-slate-100">
                      <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-700 font-black text-sm flex items-center justify-center">
                        01
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">Patient Details</h3>
                        <p className="text-xs text-slate-500">Verify patient identification for OPD registry.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Full Name of Patient <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={patientName}
                            onChange={(e) => {
                              setPatientName(e.target.value);
                              if (!emiApplicantName) setEmiApplicantName(e.target.value);
                            }}
                            placeholder="e.g. Ramesh Patil"
                            required
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 text-sm outline-hidden transition-all"
                          />
                          <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Email Address <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="patient@example.com"
                            required
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 text-sm outline-hidden transition-all"
                          />
                          <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Contact Phone Number <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type="tel"
                            value={phone}
                            onChange={(e) => {
                              setPhone(e.target.value);
                              if (!emiPhone) setEmiPhone(e.target.value);
                            }}
                            placeholder="+91 98765 43210"
                            required
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 text-sm outline-hidden transition-all"
                          />
                          <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Patient Age
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="120"
                          value={age}
                          onChange={(e) => setAge(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 text-sm outline-hidden transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Gender
                        </label>
                        <select
                          value={gender}
                          onChange={(e) => setGender(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 text-sm outline-hidden transition-all bg-white"
                        >
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Step 02: Specialty Department & Consulting Doctor (All 7 Doctors Available) */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 pb-2 border-b border-slate-100">
                      <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-700 font-black text-sm flex items-center justify-center">
                        02
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">Department & Consulting Doctor</h3>
                        <p className="text-xs text-slate-500">Select clinical discipline and your preferred medical specialist.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Medical Department <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={department}
                          onChange={handleDepartmentChange}
                          required
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 text-sm outline-hidden bg-white transition-all font-semibold"
                        >
                          {DEPARTMENTS.map((dept) => (
                            <option key={dept.id} value={dept.id}>
                              {dept.icon} {dept.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                          <span>Consulting Doctor <span className="text-red-500">*</span></span>
                          <span className="text-[11px] font-bold text-sky-600">Fee: ₹{consultationFee}</span>
                        </label>
                        <select
                          value={doctorId}
                          onChange={handleDoctorChange}
                          required
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 text-sm outline-hidden bg-white transition-all font-semibold text-sky-950"
                        >
                          {/* Lists all available doctors matching department or entire roster */}
                          {filteredDoctors.length > 0 ? (
                            filteredDoctors.map((doc) => (
                              <option key={doc.id} value={doc.id}>
                                {doc.name} — {doc.title} (₹{doc.consultationFee})
                              </option>
                            ))
                          ) : (
                            CONSULTING_DOCTORS.map((doc) => (
                              <option key={doc.id} value={doc.id}>
                                {doc.name} — {doc.title} (₹{doc.consultationFee})
                              </option>
                            ))
                          )}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Preferred Appointment Date <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          min={todayStr}
                          value={appointmentDate}
                          onChange={(e) => setAppointmentDate(e.target.value)}
                          required
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 text-sm outline-hidden transition-all bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Preferred Shift / Window <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={preferredTimeWindow}
                          onChange={(e) => setPreferredTimeWindow(e.target.value)}
                          required
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 text-sm outline-hidden bg-white transition-all"
                        >
                          <option value="Morning (09:00 AM - 01:00 PM)">Morning (09:00 AM - 01:00 PM)</option>
                          <option value="Afternoon (02:00 PM - 05:00 PM)">Afternoon (02:00 PM - 05:00 PM)</option>
                          <option value="Evening (05:00 PM - 08:30 PM)">Evening (05:00 PM - 08:30 PM)</option>
                          <option value="Emergency Priority (Immediate)">Emergency Priority (Immediate)</option>
                        </select>
                      </div>
                    </div>

                    {/* Selected Doctor Summary Card */}
                    {selectedDoctorObj && (
                      <div className="bg-sky-50/80 p-4 rounded-2xl border border-sky-100 flex items-center justify-between gap-4 mt-2">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-sky-200/80 text-sky-800 flex items-center justify-center text-xl shrink-0">
                            {selectedDoctorObj.avatar || '👨‍⚕️'}
                          </div>
                          <div>
                            <h4 className="font-black text-slate-900 text-sm">{selectedDoctorObj.name}</h4>
                            <p className="text-xs text-sky-800">{selectedDoctorObj.qualifications} • {selectedDoctorObj.title}</p>
                            <span className="text-[11px] text-slate-500">OPD Timings: {selectedDoctorObj.opdTimings}</span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-[10px] text-slate-500 block uppercase font-bold">Consultation Fee</span>
                          <span className="text-xl font-black text-sky-900">₹{consultationFee}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Step 03: Symptoms & Medical Remarks */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 pb-2 border-b border-slate-100">
                      <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-700 font-black text-sm flex items-center justify-center">
                        03
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">Symptoms & Medical Notes</h3>
                        <p className="text-xs text-slate-500">Provide details for the doctor to review your medical history.</p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Chief Complaints & Reason for Consultation
                      </label>
                      <textarea
                        rows={3}
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Describe your current symptoms, duration of illness, past surgeries, or existing medications..."
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 text-sm outline-hidden transition-all"
                      ></textarea>
                    </div>
                  </div>

                  {/* ============================================================== */}
                  {/* Step 04: PAYMENT METHOD (3 Options: Online UPI Scanner, In Hospital, EMI) */}
                  {/* ============================================================== */}
                  <div className="space-y-5 pt-2">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-black text-sm flex items-center justify-center">
                          04
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-slate-900">Payment Method</h3>
                          <p className="text-xs text-slate-500">Select how you want to pay the consultation fee of ₹{consultationFee}.</p>
                        </div>
                      </div>
                      <span className="text-xs font-black text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                        Total Payable: ₹{consultationFee}
                      </span>
                    </div>

                    {/* 3 Payment Options Switcher */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      
                      {/* Option 1: Online UPI Payment */}
                      <button
                        type="button"
                        onClick={() => setPaymentOption('online_upi')}
                        className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          paymentOption === 'online_upi'
                            ? 'bg-sky-50 border-sky-500 ring-2 ring-sky-200 text-sky-950 shadow-sm'
                            : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center text-lg">
                            <QrCode className="w-5 h-5" />
                          </div>
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                            paymentOption === 'online_upi' ? 'bg-sky-200 text-sky-800' : 'bg-slate-100 text-slate-500'
                          }`}>
                            Instant Scan
                          </span>
                        </div>
                        <div className="mt-3">
                          <h4 className="font-black text-sm text-slate-900">1. Online Payment</h4>
                          <p className="text-[11px] text-slate-500 mt-0.5">UPI QR Scanner Photo</p>
                        </div>
                      </button>

                      {/* Option 2: Pay in Hospital */}
                      <button
                        type="button"
                        onClick={() => setPaymentOption('in_hospital')}
                        className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          paymentOption === 'in_hospital'
                            ? 'bg-amber-50 border-amber-500 ring-2 ring-amber-200 text-amber-950 shadow-sm'
                            : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center text-lg">
                            <Building2 className="w-5 h-5" />
                          </div>
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                            paymentOption === 'in_hospital' ? 'bg-amber-200 text-amber-900' : 'bg-slate-100 text-slate-500'
                          }`}>
                            Counter Pay
                          </span>
                        </div>
                        <div className="mt-3">
                          <h4 className="font-black text-sm text-slate-900">2. In Hospital</h4>
                          <p className="text-[11px] text-slate-500 mt-0.5">Pay at OPD Reception Desk</p>
                        </div>
                      </button>

                      {/* Option 3: Medical Care EMI */}
                      <button
                        type="button"
                        onClick={() => setPaymentOption('emi')}
                        className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          paymentOption === 'emi'
                            ? 'bg-purple-50 border-purple-500 ring-2 ring-purple-200 text-purple-950 shadow-sm'
                            : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center text-lg">
                            <CreditCard className="w-5 h-5" />
                          </div>
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                            paymentOption === 'emi' ? 'bg-purple-200 text-purple-900' : 'bg-slate-100 text-slate-500'
                          }`}>
                            0% Interest
                          </span>
                        </div>
                        <div className="mt-3">
                          <h4 className="font-black text-sm text-slate-900">3. Medical EMI</h4>
                          <p className="text-[11px] text-slate-500 mt-0.5">Easy Monthly Installments</p>
                        </div>
                      </button>

                    </div>

                    {/* DETAILS VIEW 1: ONLINE UPI SCANNER */}
                    {paymentOption === 'online_upi' && (
                      <div className="p-6 bg-linear-to-b from-sky-50/60 to-slate-50 rounded-3xl border border-sky-200 space-y-6 animate-in fade-in">
                        
                        <div className="text-center sm:text-left flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-sky-200/70">
                          <div>
                            <h4 className="font-black text-base text-slate-900 flex items-center gap-2">
                              <span>Dr. Malkar Hospital Official UPI Scanner</span>
                              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-md">
                                Verified Merchant
                              </span>
                            </h4>
                            <p className="text-xs text-slate-500">Scan this QR code using any UPI payment app to pay ₹{consultationFee}.</p>
                          </div>
                          <span className="text-lg font-black text-sky-800">
                            Amount: ₹{consultationFee}.00
                          </span>
                        </div>

                        {/* Scanner Photo Card & UPI Details */}
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                          
                          {/* Interactive QR Scanner Photo */}
                          <div className="md:col-span-5 flex flex-col items-center">
                            <div className="p-4 bg-white rounded-3xl border-2 border-sky-300 shadow-lg text-center relative group">
                              
                              {/* Hospital Tag */}
                              <div className="text-[10px] font-black uppercase text-sky-800 tracking-wider mb-2 flex items-center justify-center gap-1">
                                <span>🏥 DR. MALKAR HOSPITAL</span>
                              </div>

                              {/* Realistic SVG UPI QR Code Image */}
                              <div className="w-48 h-48 bg-white p-2 border border-slate-200 rounded-2xl flex items-center justify-center relative shadow-inner">
                                <svg className="w-full h-full" viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  {/* Corner Finder Patterns */}
                                  {/* Top Left */}
                                  <rect x="10" y="10" width="40" height="40" rx="6" fill="#0f172a" />
                                  <rect x="16" y="16" width="28" height="28" rx="4" fill="white" />
                                  <rect x="22" y="22" width="16" height="16" rx="2" fill="#0284c7" />

                                  {/* Top Right */}
                                  <rect x="110" y="10" width="40" height="40" rx="6" fill="#0f172a" />
                                  <rect x="116" y="16" width="28" height="28" rx="4" fill="white" />
                                  <rect x="122" y="22" width="16" height="16" rx="2" fill="#0284c7" />

                                  {/* Bottom Left */}
                                  <rect x="10" y="110" width="40" height="40" rx="6" fill="#0f172a" />
                                  <rect x="16" y="116" width="28" height="28" rx="4" fill="white" />
                                  <rect x="22" y="122" width="16" height="16" rx="2" fill="#0284c7" />

                                  {/* Matrix Dots Simulation */}
                                  <rect x="60" y="15" width="8" height="8" fill="#1e293b" />
                                  <rect x="75" y="15" width="8" height="8" fill="#1e293b" />
                                  <rect x="90" y="25" width="8" height="8" fill="#1e293b" />
                                  <rect x="65" y="35" width="8" height="8" fill="#1e293b" />
                                  <rect x="80" y="45" width="8" height="8" fill="#1e293b" />
                                  
                                  <rect x="15" y="60" width="8" height="8" fill="#1e293b" />
                                  <rect x="30" y="70" width="8" height="8" fill="#1e293b" />
                                  <rect x="45" y="60" width="8" height="8" fill="#1e293b" />
                                  <rect x="20" y="85" width="8" height="8" fill="#1e293b" />
                                  <rect x="40" y="95" width="8" height="8" fill="#1e293b" />

                                  <rect x="115" y="60" width="8" height="8" fill="#1e293b" />
                                  <rect x="135" y="75" width="8" height="8" fill="#1e293b" />
                                  <rect x="120" y="90" width="8" height="8" fill="#1e293b" />

                                  <rect x="60" y="115" width="8" height="8" fill="#1e293b" />
                                  <rect x="80" y="125" width="8" height="8" fill="#1e293b" />
                                  <rect x="95" y="115" width="8" height="8" fill="#1e293b" />
                                  <rect x="70" y="140" width="8" height="8" fill="#1e293b" />
                                  <rect x="115" y="135" width="8" height="8" fill="#1e293b" />
                                  <rect x="135" y="120" width="8" height="8" fill="#1e293b" />
                                  <rect x="130" y="140" width="8" height="8" fill="#1e293b" />

                                  {/* Center UPI Hospital Badge */}
                                  <circle cx="80" cy="80" r="18" fill="white" stroke="#0284c7" strokeWidth="3" />
                                  <path d="M74 80H86M80 74V86" stroke="#0284c7" strokeWidth="3.5" strokeLinecap="round" />
                                </svg>
                              </div>

                              <div className="mt-2 text-[11px] font-bold text-slate-700">
                                Scan & Pay ₹{consultationFee}
                              </div>
                              <span className="text-[10px] text-slate-400 block">Accepted by all UPI Apps</span>
                            </div>

                            {/* Supported UPI Apps logos */}
                            <div className="flex items-center gap-2 mt-3 text-[11px] font-bold text-slate-500">
                              <span className="px-2 py-0.5 bg-white rounded-md border border-slate-200">GPay</span>
                              <span className="px-2 py-0.5 bg-white rounded-md border border-slate-200">PhonePe</span>
                              <span className="px-2 py-0.5 bg-white rounded-md border border-slate-200">Paytm</span>
                              <span className="px-2 py-0.5 bg-white rounded-md border border-slate-200">BHIM</span>
                            </div>
                          </div>

                          {/* UPI ID & Confirmation Input */}
                          <div className="md:col-span-7 space-y-4">
                            
                            {/* Copy UPI ID */}
                            <div className="p-3.5 bg-white rounded-2xl border border-slate-200 space-y-1">
                              <span className="text-[10px] text-slate-400 uppercase font-bold block">Hospital Merchant UPI ID</span>
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-mono font-bold text-sky-950 text-sm">
                                  malkarhospital@okhdfcbank
                                </span>
                                <button
                                  type="button"
                                  onClick={handleCopyUpiId}
                                  className="px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-bold rounded-xl border border-sky-200 transition-colors flex items-center gap-1 cursor-pointer"
                                >
                                  {copiedUpi ? (
                                    <>
                                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                                      <span>Copied!</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-3.5 h-3.5" />
                                      <span>Copy UPI</span>
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>

                            {/* UTR Input */}
                            <div>
                              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                UPI 12-Digit Reference / UTR Number <span className="text-red-500">*</span>
                              </label>
                              <div className="relative">
                                <input
                                  type="text"
                                  value={upiTransactionId}
                                  onChange={(e) => setUpiTransactionId(e.target.value)}
                                  placeholder="e.g. 429182746193 (From GPay / PhonePe / Paytm)"
                                  required={paymentOption === 'online_upi'}
                                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 text-sm outline-hidden bg-white font-mono"
                                />
                                <ShieldCheck className="w-4 h-4 text-emerald-600 absolute left-3.5 top-3.5" />
                              </div>
                              <p className="text-[11px] text-slate-500 mt-1">
                                After scanning the QR code, copy the 12-digit UTR/UPI Ref ID from your payment receipt and paste here for instant verification by the doctor.
                              </p>
                            </div>

                            {/* Confirmation Checkbox */}
                            <label className="flex items-start gap-2.5 p-3 bg-white rounded-xl border border-slate-200 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={upiConfirmed}
                                onChange={(e) => setUpiConfirmed(e.target.checked)}
                                className="mt-0.5 rounded text-sky-600 focus:ring-sky-500"
                              />
                              <span className="text-xs text-slate-700 leading-snug">
                                I confirm that I have transferred <strong>₹{consultationFee}.00</strong> to Dr. Malkar Hospital via UPI Scanner and entered the valid UTR reference number.
                              </span>
                            </label>

                          </div>

                        </div>

                      </div>
                    )}

                    {/* DETAILS VIEW 2: PAY IN HOSPITAL */}
                    {paymentOption === 'in_hospital' && (
                      <div className="p-6 bg-linear-to-b from-amber-50/70 to-slate-50 rounded-3xl border border-amber-200 space-y-4 animate-in fade-in">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center text-xl shrink-0 mt-0.5">
                            🏥
                          </div>
                          <div>
                            <h4 className="font-black text-base text-slate-900">
                              Pay in Hospital at OPD Reception Desk
                            </h4>
                            <p className="text-xs text-slate-600 mt-0.5">
                              No online payment required now. Your appointment will be booked and queued for doctor approval.
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
                          <div className="bg-white p-3.5 rounded-2xl border border-slate-200">
                            <span className="text-slate-400 uppercase font-bold text-[10px] block">Payment Due</span>
                            <span className="text-lg font-black text-amber-900">₹{consultationFee}.00</span>
                          </div>
                          <div className="bg-white p-3.5 rounded-2xl border border-slate-200">
                            <span className="text-slate-400 uppercase font-bold text-[10px] block">Counter Location</span>
                            <span className="font-bold text-slate-800">OPD Reception Counter 01</span>
                          </div>
                          <div className="bg-white p-3.5 rounded-2xl border border-slate-200">
                            <span className="text-slate-400 uppercase font-bold text-[10px] block">Accepted Modes</span>
                            <span className="font-semibold text-slate-800">Cash, Card, QR at Desk</span>
                          </div>
                        </div>

                        <div className="p-3 bg-amber-100/60 rounded-xl text-xs text-amber-950 flex items-center gap-2">
                          <Info className="w-4 h-4 text-amber-700 shrink-0" />
                          <span>
                            Please arrive 15 minutes before your allotted time slot to collect your consultation slip at Counter 01.
                          </span>
                        </div>
                      </div>
                    )}

                    {/* DETAILS VIEW 3: MEDICAL CARE EMI */}
                    {paymentOption === 'emi' && (
                      <div className="p-6 bg-linear-to-b from-purple-50/70 to-slate-50 rounded-3xl border border-purple-200 space-y-6 animate-in fade-in">
                        
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-purple-200/80">
                          <div>
                            <h4 className="font-black text-base text-slate-900 flex items-center gap-2">
                              <span>0% Interest Medical Care EMI Program</span>
                              <span className="text-[10px] bg-purple-100 text-purple-900 font-bold px-2 py-0.5 rounded-md">
                                Hospital Subsidy
                              </span>
                            </h4>
                            <p className="text-xs text-slate-500">Spread your consultation & treatment fees over easy monthly installments.</p>
                          </div>

                          <div className="text-right">
                            <span className="text-[10px] text-slate-400 uppercase font-bold block">Monthly Installment</span>
                            <span className="text-lg font-black text-purple-900">
                              ₹{monthlyInstallment}/month
                            </span>
                          </div>
                        </div>

                        {/* Tenure Selector */}
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                            Select EMI Duration (0% Interest)
                          </label>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                            {[3, 6, 9, 12].map((months) => {
                              const inst = Math.ceil(consultationFee / months);
                              return (
                                <button
                                  key={months}
                                  type="button"
                                  onClick={() => setEmiMonths(months)}
                                  className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                                    emiMonths === months
                                      ? 'bg-purple-600 text-white border-purple-600 shadow-md font-bold'
                                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                                  }`}
                                >
                                  <span className="text-sm font-black block">{months} Months</span>
                                  <span className={`text-[11px] block mt-0.5 ${
                                    emiMonths === months ? 'text-purple-100' : 'text-slate-500'
                                  }`}>
                                    ₹{inst}/mo
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Required EMI Applicant Details Grid */}
                        <div className="space-y-3 pt-1">
                          <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                            Required Applicant EMI Details
                          </span>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            
                            <div>
                              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                                Financing Partner / Bank <span className="text-red-500">*</span>
                              </label>
                              <select
                                value={emiBank}
                                onChange={(e) => setEmiBank(e.target.value)}
                                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs bg-white outline-hidden font-semibold"
                              >
                                <option value="Bajaj Finserv Health EMI">Bajaj Finserv Health EMI</option>
                                <option value="HDFC Medical Care EMI">HDFC Medical Care EMI</option>
                                <option value="SBI Healthcare Finance">SBI Healthcare Finance</option>
                                <option value="ICICI Bank Health Care">ICICI Bank Health Care</option>
                                <option value="Kotak Mahindra Healthcare">Kotak Mahindra Healthcare</option>
                                <option value="Debit / Credit Card EMI">Debit / Credit Card EMI</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                                Applicant / Cardholder Name <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                value={emiApplicantName}
                                onChange={(e) => setEmiApplicantName(e.target.value)}
                                placeholder="Name as per PAN / Bank"
                                required={paymentOption === 'emi'}
                                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs bg-white outline-hidden font-medium"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                                Employment / Income Type <span className="text-red-500">*</span>
                              </label>
                              <select
                                value={emiEmployment}
                                onChange={(e) => setEmiEmployment(e.target.value)}
                                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs bg-white outline-hidden"
                              >
                                <option value="Salaried (Private / Govt)">Salaried (Private / Govt)</option>
                                <option value="Self-Employed / Professional">Self-Employed / Professional</option>
                                <option value="Business Owner / Trader">Business Owner / Trader</option>
                                <option value="Farmer / Agriculture">Farmer / Agriculture</option>
                                <option value="Pensioner / Senior Citizen">Pensioner / Senior Citizen</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                                PAN or Aadhaar Card (Last 4 Digits) <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                maxLength={4}
                                value={emiPanOrAadhaar}
                                onChange={(e) => setEmiPanOrAadhaar(e.target.value.replace(/\D/g, ''))}
                                placeholder="e.g. 5821"
                                required={paymentOption === 'emi'}
                                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs bg-white outline-hidden font-mono"
                              />
                            </div>

                            <div className="sm:col-span-2">
                              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                                Mobile Number Linked with Bank / EMI Account <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="tel"
                                value={emiPhone}
                                onChange={(e) => setEmiPhone(e.target.value)}
                                placeholder="+91 98765 43210"
                                required={paymentOption === 'emi'}
                                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs bg-white outline-hidden"
                              />
                            </div>

                          </div>
                        </div>

                        {/* EMI Summary Calculation */}
                        <div className="p-3.5 bg-white rounded-2xl border border-purple-100 flex items-center justify-between text-xs">
                          <div>
                            <span className="font-bold text-slate-800">Plan Summary: </span>
                            <span className="text-slate-600">
                              {emiMonths} installments of <strong>₹{monthlyInstallment}</strong> via {emiBank}
                            </span>
                          </div>
                          <span className="font-black text-purple-900 bg-purple-50 px-2.5 py-1 rounded-lg">
                            Total: ₹{consultationFee}
                          </span>
                        </div>

                      </div>
                    )}

                  </div>

                  {/* Footer & Submit Button */}
                  <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-slate-500">
                      <span className="text-red-500 font-bold">*</span> Submissions will appear as <strong>Pending</strong> until doctor allocates an exact time slot.
                    </p>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full sm:w-auto px-8 py-3.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <>
                          <span>Submit Appointment Request</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>

                </form>
              </div>
            )}

          </section>

        </div>
      </div>

    </div>
  );
};
