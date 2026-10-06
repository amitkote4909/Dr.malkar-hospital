import React, { useState, useEffect } from 'react';
import { useAuth } from '../firebase/authContext';
import { bookAppointment, AppointmentRecord } from '../firebase/dbService';
import { DEPARTMENTS, CONSULTING_DOCTORS, HOSPITAL_INFO } from '../data/hospitalData';
import { 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  AlertCircle, 
  ArrowRight, 
  CheckCircle2,
  Stethoscope,
  Building2,
  FileText,
  ShieldCheck
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

  // Form Fields State (Patient details & clinical complaints only - no payment fields)
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

  // UI status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookedReceipt, setBookedReceipt] = useState<AppointmentRecord | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Prefill with authenticated user details if logged in
  useEffect(() => {
    if (user || profile) {
      if (profile?.displayName) setPatientName(profile.displayName);
      if (user?.email) setEmail(user.email);
      if (profile?.phone) setPhone(profile.phone);
      if (profile?.gender) setGender(profile.gender);
    }
  }, [user, profile]);

  const todayStr = new Date().toISOString().split('T')[0];

  // Doctors available for chosen department
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

  const selectedDoctorObj = CONSULTING_DOCTORS.find((d) => d.id === doctorId) || CONSULTING_DOCTORS[0];

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

    setIsSubmitting(true);

    try {
      // The patient submits the clinical form without knowing payment fees yet.
      // Fee will be prescribed directly by the doctor upon approval.
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
        payment: {
          consultationFee: 0,
          totalAmount: 0,
          paymentStatus: 'pending',
          paymentMethod: 'Awaiting Doctor Review',
          invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
        },
      };

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
            Submit your clinical consultation request. Our consulting doctor will review your complaints, assign your confirmed OPD time slot, and prescribe the consultation fees.
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
              
              <div className="space-y-4 text-xs sm:text-sm text-slate-600">
                <div className="flex gap-3 items-start">
                  <span className="w-6 h-6 rounded-full bg-sky-100 text-sky-700 font-black flex items-center justify-center shrink-0 text-xs">1</span>
                  <p><strong>Submit Clinical Request:</strong> Fill in your symptoms, preferred department, and doctor without upfront fee hassle.</p>
                </div>
                <div className="flex gap-3 items-start">
                  <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 font-black flex items-center justify-center shrink-0 text-xs">2</span>
                  <p><strong>Doctor Reviews & Prescribes Fee:</strong> The consulting physician evaluates your case, sets your consultation fee, and assigns an OPD time slot & token.</p>
                </div>
                <div className="flex gap-3 items-start">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-black flex items-center justify-center shrink-0 text-xs">3</span>
                  <p><strong>Pay in Patient Portal:</strong> Log in to your Patient Portal to review your confirmed appointment pass and pay via UPI QR, Hospital Counter, or 0% EMI.</p>
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
                  <span className="text-slate-500 font-medium">Monday - Saturday</span>
                  <span className="font-bold text-slate-800">9:00 AM - 1:00 PM & 5:00 PM - 9:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Sunday</span>
                  <span className="font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-md">Emergency & Trauma 24/7</span>
                </div>
              </div>
            </div>

          </aside>

          {/* Right Main Form Area */}
          <section className="lg:col-span-8">
            
            {/* If appointment was just booked -> Show Confirmation Receipt */}
            {bookedReceipt ? (
              <div className="bg-white rounded-3xl p-8 sm:p-10 border border-sky-200 shadow-xl text-center space-y-6 animate-in fade-in zoom-in-95">
                
                <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-4xl mx-auto shadow-inner">
                  ✓
                </div>

                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3.5 py-1.5 rounded-full inline-flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
                    Request Sent Directly to Doctor
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-3">
                    Appointment Request Submitted, {bookedReceipt.patientName}!
                  </h2>
                  <p className="text-slate-600 text-sm max-w-lg mx-auto mt-2 leading-relaxed">
                    Your consultation request has been forwarded to <strong>{bookedReceipt.doctorName}</strong>. 
                    The doctor will review your clinical history, allocate your exact time slot and token number, and assign the consultation fees.
                  </p>
                </div>

                {/* Receipt Summary Box */}
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
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Consultation Fee:</span>
                    <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                      Pending Doctor Prescription
                    </span>
                  </div>
                </div>

                {/* Next Step Guidance */}
                <div className="max-w-md mx-auto p-4 bg-sky-50 rounded-2xl border border-sky-100 text-left text-xs text-sky-900 flex items-start gap-3">
                  <Stethoscope className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sm text-sky-950 mb-1">What Happens Next?</h4>
                    <p className="leading-relaxed">
                      As soon as the doctor confirms your schedule and enters the consultation fee, you can open your <strong>Patient Portal</strong> to review your token pass and choose how to pay (Online UPI QR, Hospital Reception Counter, or 0% Medical EMI).
                    </p>
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    onClick={() => setCurrentTab('patient-portal')}
                    className="w-full sm:w-auto px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <User className="w-4 h-4" />
                    <span>Go to Patient Portal (Track Schedule & Pay)</span>
                  </button>
                  <button
                    onClick={() => setBookedReceipt(null)}
                    className="w-full sm:w-auto px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl transition-colors cursor-pointer"
                  >
                    Book Another Visit
                  </button>
                </div>

              </div>
            ) : (
              
              /* Main Booking Form */
              <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm">
                
                <form onSubmit={handleSubmit} className="space-y-8">
                  
                  {errorMessage && (
                    <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  {/* Step 01: Patient Demographic Details */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 pb-2 border-b border-slate-100">
                      <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-700 font-black text-sm flex items-center justify-center">
                        01
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">Patient Information</h3>
                        <p className="text-xs text-slate-500">Provide basic demographic and contact details.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Patient Full Name <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={patientName}
                            onChange={(e) => setPatientName(e.target.value)}
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
                            onChange={(e) => setPhone(e.target.value)}
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

                  {/* Step 02: Specialty Department & Consulting Doctor */}
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
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Consulting Doctor <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={doctorId}
                          onChange={handleDoctorChange}
                          required
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 text-sm outline-hidden bg-white transition-all font-semibold text-sky-950"
                        >
                          {filteredDoctors.length > 0 ? (
                            filteredDoctors.map((doc) => (
                              <option key={doc.id} value={doc.id}>
                                {doc.name} — {doc.title}
                              </option>
                            ))
                          ) : (
                            CONSULTING_DOCTORS.map((doc) => (
                              <option key={doc.id} value={doc.id}>
                                {doc.name} — {doc.title}
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
                        <p className="text-xs text-slate-500">Provide details for the doctor to review your medical complaints.</p>
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

                  {/* Doctor Review Notice (Replaces Payment Section) */}
                  <div className="p-5 rounded-2xl bg-linear-to-r from-sky-50 via-blue-50/50 to-indigo-50 border border-sky-200/80 flex items-start gap-3.5">
                    <ShieldCheck className="w-6 h-6 text-sky-600 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <h4 className="font-bold text-sm text-slate-900">
                        Doctor Assessment & Consultation Fee Prescription
                      </h4>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        After you submit this booking form, your request goes directly to the consulting physician. 
                        The doctor will assess your symptoms, allocate your confirmed consultation time slot and token number, and decide the consultation fee. 
                        Once confirmed, you will be able to review your appointment pass and complete your payment securely in your <strong>Patient Portal</strong>.
                      </p>
                    </div>
                  </div>

                  {/* Footer & Submit Button */}
                  <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-slate-500">
                      <span className="text-red-500 font-bold">*</span> Submissions will be marked as <strong>Pending</strong> until doctor allocates an exact time slot.
                    </p>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full sm:w-auto px-8 py-3.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Submitting Request...</span>
                        </>
                      ) : (
                        <>
                          <span>Submit Appointment Request to Doctor</span>
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
