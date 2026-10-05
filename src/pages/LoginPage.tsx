import React, { useState } from 'react';
import { useAuth } from '../firebase/authContext';
import { 
  Mail, 
  Lock, 
  LogIn, 
  AlertCircle, 
  ArrowLeft, 
  Stethoscope, 
  User, 
  KeyRound, 
  CheckCircle2
} from 'lucide-react';

interface LoginPageProps {
  setCurrentTab: (tab: string) => void;
  initialSection?: 'patient' | 'doctor';
}

export const LoginPage: React.FC<LoginPageProps> = ({ setCurrentTab, initialSection = 'patient' }) => {
  const { signIn, signInDoctor, signInWithGoogle } = useAuth();
  
  // Section toggle: 'patient' | 'doctor'
  const [activeSection, setActiveSection] = useState<'patient' | 'doctor'>(initialSection);

  // Patient Login State
  const [patientEmail, setPatientEmail] = useState('');
  const [patientPassword, setPatientPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // Doctor Login State (Strict Username, Email, Password)
  const [doctorUsername, setDoctorUsername] = useState('');
  const [doctorEmail, setDoctorEmail] = useState('');
  const [doctorPassword, setDoctorPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Handle Patient Login
  const handlePatientLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!patientEmail.trim() || !patientPassword) {
      setError('Please provide your registered email address and password.');
      return;
    }

    setIsLoading(true);
    try {
      await signIn(patientEmail.trim().toLowerCase(), patientPassword);
      setCurrentTab('patient-portal');
    } catch (err: unknown) {
      console.error('Patient login error:', err);
      const msg = err instanceof Error ? err.message : 'Invalid login credentials.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Doctor Login with strict credentials: Username amitkotepatil4909, Email koteamit615@gmail.com, Password I@mit4909
  const handleDoctorLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const u = doctorUsername.trim();
    const em = doctorEmail.trim().toLowerCase();
    const p = doctorPassword.trim();

    if (!u || !em || !p) {
      setError('Doctor login requires all three fields: Doctor Username, Email, and Security Password.');
      return;
    }

    setIsLoading(true);
    try {
      await signInDoctor(u, em, p);
      setSuccessMsg('Doctor credentials verified! Welcome, Dr. Vaibhav G. Malkar.');
      setCurrentTab('doctor-portal');
    } catch (err: unknown) {
      console.error('Doctor login error:', err);
      setError(
        err instanceof Error 
          ? err.message 
          : 'Access Denied: Invalid doctor credentials. You must provide the exact authorized doctor credentials.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setIsLoading(true);
    try {
      await signInWithGoogle();
      setCurrentTab('patient-portal');
    } catch (err: unknown) {
      console.error('Google login error:', err);
      setError('Google sign in was cancelled or encountered an error.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-[85vh] flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-lg transition-all duration-300">
        
        {/* Card Container */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xl space-y-6">
          
          {/* Header */}
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center text-3xl mx-auto mb-3 shadow-inner">
              🏥
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Dr. Malkar Hospital Portal
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-1">
              Select your portal below to sign in
            </p>
          </div>

          {/* Two Section Switcher Tabs */}
          <div className="grid grid-cols-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
            <button
              type="button"
              onClick={() => {
                setActiveSection('patient');
                setError('');
                setSuccessMsg('');
              }}
              className={`py-3 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeSection === 'patient'
                  ? 'bg-white text-sky-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <User className="w-4 h-4 text-sky-600" />
              <span>Patient Login</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveSection('doctor');
                setError('');
                setSuccessMsg('');
              }}
              className={`py-3 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeSection === 'doctor'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Stethoscope className="w-4 h-4" />
              <span>Doctor Login</span>
            </button>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{error}</span>
            </div>
          )}

          {/* Success Alert */}
          {successMsg && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* ============================================================== */}
          {/* SECTION 1: PATIENT LOGIN */}
          {/* ============================================================== */}
          {activeSection === 'patient' && (
            <form onSubmit={handlePatientLogin} className="space-y-4">
              <div className="text-left bg-sky-50/60 p-3.5 rounded-xl border border-sky-100 text-xs text-sky-800">
                <span className="font-bold">👤 Patient Account:</span> Sign in with your registered email and password to view appointments, test reports, and doctor schedules.
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Patient Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={patientEmail}
                    onChange={(e) => setPatientEmail(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 text-sm outline-hidden"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={patientPassword}
                    onChange={(e) => setPatientPassword(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 text-sm outline-hidden"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-600">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded text-sky-600 focus:ring-sky-500"
                  />
                  <span>Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={() => setError('For password assistance, please contact Dr. Malkar Hospital reception at +91 9579674964.')}
                  className="text-sky-600 hover:underline font-semibold cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Login to Patient Portal</span>
                  </>
                )}
              </button>

              {/* Google sign-in */}
              <div className="relative py-1">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-slate-400 font-semibold">Or continue with</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full py-3 px-4 bg-white hover:bg-slate-50 text-slate-700 font-bold text-sm rounded-xl border border-slate-300 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3h3.88c2.27-2.09 3.665-5.17 3.665-9.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.09C3.26 21.36 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.32c-.25-.72-.38-1.49-.38-2.32s.13-1.6.38-2.32V6.59H1.26C.46 8.19 0 9.99 0 12s.46 3.81 1.26 5.41l4.02-3.09z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.26 6.59l4.02 3.09c.95-2.83 3.6-4.93 6.72-4.93z"
                  />
                </svg>
                <span>Sign in with Google</span>
              </button>

              <div className="text-center pt-2 text-sm text-slate-600">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => setCurrentTab('register')}
                  className="text-sky-600 font-bold hover:underline cursor-pointer"
                >
                  Create a patient account
                </button>
              </div>
            </form>
          )}

          {/* ============================================================== */}
          {/* SECTION 2: DOCTOR LOGIN (Private, Secure Authentication Only) */}
          {/* ============================================================== */}
          {activeSection === 'doctor' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3.5 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xl shrink-0">
                  👨‍⚕️
                </div>
                <div>
                  <h2 className="text-sm font-black">
                    Dr. Vaibhav G. Malkar Portal Login
                  </h2>
                  <p className="text-[11px] text-amber-700">
                    Authorized Medical Director & OPD Administrator
                  </p>
                </div>
              </div>

              <form onSubmit={handleDoctorLogin} className="space-y-4">
                {/* Doctor Username */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Doctor Username <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={doctorUsername}
                      onChange={(e) => setDoctorUsername(e.target.value)}
                      placeholder="Enter doctor username"
                      required
                      autoComplete="username"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 text-sm outline-hidden font-mono bg-white"
                    />
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  </div>
                </div>

                {/* Doctor Email */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Doctor Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={doctorEmail}
                      onChange={(e) => setDoctorEmail(e.target.value)}
                      placeholder="Enter registered doctor email"
                      required
                      autoComplete="email"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 text-sm outline-hidden font-mono bg-white"
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  </div>
                </div>

                {/* Doctor Password */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Doctor Security Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      value={doctorPassword}
                      onChange={(e) => setDoctorPassword(e.target.value)}
                      placeholder="••••••••••••"
                      required
                      autoComplete="current-password"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 text-sm outline-hidden bg-white"
                    />
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3.5 bg-sky-700 hover:bg-sky-800 text-white font-bold text-sm rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <Stethoscope className="w-4 h-4" />
                        <span>Verify Credentials & Enter Doctor Portal</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => setCurrentTab('home')}
              className="text-xs text-slate-400 hover:text-slate-700 flex items-center justify-center gap-1 mx-auto cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Home
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
