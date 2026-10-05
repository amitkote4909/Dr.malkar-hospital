import React, { useState } from 'react';
import { useAuth } from '../firebase/authContext';
import { Phone, Calendar, User as UserIcon, LogOut, Menu, X, ShieldAlert } from 'lucide-react';
import { HOSPITAL_INFO } from '../data/hospitalData';

interface HeaderProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenBookingModal?: (doctorName?: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentTab, setCurrentTab }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, profile, logout } = useAuth();

  const isDoctor = 
    profile?.role === 'doctor' || 
    profile?.role === 'admin' || 
    user?.email?.toLowerCase() === 'koteamit651@gmail.com' ||
    user?.email?.toLowerCase() === 'koteamit615@gmail.com' ||
    profile?.username === 'amitkote4909' ||
    profile?.username === 'amitkotepatil4909';

  const userPortalTarget = isDoctor ? 'doctor-portal' : 'patient-portal';

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About' },
    { id: 'doctors', label: 'Doctors' },
    { id: 'departments', label: 'Departments' },
    { id: 'services', label: 'Services' },
    { id: 'appointment', label: 'Appointment' },
    { id: 'contact', label: 'Contact' },
  ];

  const handleNavClick = (tabId: string) => {
    setCurrentTab(tabId);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* Top Emergency Ticker Bar */}
      <div className="bg-sky-900 text-white text-xs sm:text-sm py-1.5 px-4 font-medium border-b border-sky-800">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 bg-red-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
              <ShieldAlert className="w-3 h-3" /> 24/7 Emergency
            </span>
            <span className="hidden sm:inline text-sky-200">Trauma, Ambulance & Critical Care Support:</span>
            <a href={`tel:${HOSPITAL_INFO.phone}`} className="font-bold text-sky-100 hover:text-white underline decoration-sky-400">
              {HOSPITAL_INFO.phone}
            </a>
          </div>
          <div className="flex items-center gap-4 text-xs text-sky-200">
            <span className="hidden md:inline">📍 Rahata, Ahilyanagar, Maharashtra</span>
            <span className="text-emerald-300 font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              OPD Open Today
            </span>
          </div>
        </div>
      </div>

      {/* Main Navigation Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">

            {/* Hospital Logo & Brand */}
            <button 
              onClick={() => handleNavClick('home')}
              className="flex items-center gap-3 text-left focus:outline-hidden group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-xl bg-linear-to-br from-sky-500 to-blue-700 flex items-center justify-center text-white text-2xl shadow-md group-hover:scale-105 transition-transform duration-200">
                🏥
              </div>
              <div>
                <span className="block text-xl sm:text-2xl font-black text-slate-900 tracking-tight group-hover:text-sky-700 transition-colors">
                  Dr. Malkar Hospital
                </span>
                <span className="block text-xs font-semibold text-sky-600 tracking-wider uppercase">
                  Care & Compassion • Rahata
                </span>
              </div>
            </button>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
              {navItems.map((item) => {
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-all duration-150 cursor-pointer ${
                      isActive
                        ? 'text-sky-700 bg-sky-50 shadow-xs'
                        : 'text-slate-600 hover:text-sky-600 hover:bg-slate-50'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </nav>

            {/* Header Right Actions */}
            <div className="hidden sm:flex items-center gap-3">
              {user ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleNavClick(userPortalTarget)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold border transition-all cursor-pointer ${
                      currentTab === userPortalTarget || currentTab === 'dashboard'
                        ? 'bg-sky-600 text-white border-sky-600 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-300 hover:border-sky-400 hover:bg-sky-50'
                    }`}
                  >
                    <Calendar className="w-4 h-4 text-sky-600" />
                    <span>{isDoctor ? 'Doctor Portal' : 'Patient Portal'}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                      isDoctor ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {isDoctor ? 'Dr. Vaibhav G. Malkar' : 'My Records'}
                    </span>
                  </button>

                  <div className="relative group">
                    <button
                      onClick={() => handleNavClick(userPortalTarget)}
                      className="flex items-center gap-2 py-1.5 px-3 rounded-lg hover:bg-slate-100 transition-colors text-slate-700 text-sm font-medium cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-sm">
                        {profile?.displayName ? profile.displayName.charAt(0).toUpperCase() : <UserIcon className="w-4 h-4" />}
                      </div>
                      <span className="max-w-[120px] truncate hidden md:inline font-semibold">
                        {profile?.displayName?.split(' ')[0] || (isDoctor ? 'Dr. Amit' : 'Patient')}
                      </span>
                    </button>
                  </div>

                  <button
                    onClick={() => logout()}
                    title="Sign Out"
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleNavClick('login')}
                    className="px-4 py-2 text-sm font-bold text-sky-700 hover:bg-sky-50 rounded-lg border border-sky-200 transition-colors cursor-pointer"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => handleNavClick('register')}
                    className="px-4 py-2 text-sm font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-sm hover:shadow transition-all cursor-pointer"
                  >
                    Register
                  </button>
                </div>
              )}

              <button
                onClick={() => handleNavClick('appointment')}
                className="hidden xl:inline-flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-linear-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer"
              >
                <Calendar className="w-4 h-4" />
                Book Visit
              </button>
            </div>

            {/* Mobile Menu Toggle Button */}
            <div className="flex items-center gap-2 lg:hidden">
              <button
                onClick={() => handleNavClick('appointment')}
                className="sm:hidden px-3 py-1.5 text-xs font-bold text-white bg-sky-600 rounded-lg"
              >
                Book
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-slate-600 hover:text-slate-900 rounded-lg focus:outline-hidden hover:bg-slate-100"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 shadow-xl animate-in slide-in-from-top-2">
            <div className="space-y-1 mb-4">
              {navItems.map((item) => {
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full text-left px-4 py-2.5 rounded-lg text-base font-semibold transition-colors ${
                      isActive
                        ? 'bg-sky-50 text-sky-700 font-bold border-l-4 border-sky-600'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>

            <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
              {user ? (
                <>
                  <button
                    onClick={() => handleNavClick(userPortalTarget)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-sky-50 text-sky-900 rounded-xl font-bold"
                  >
                    <span className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-sky-600" />
                      {isDoctor ? 'Doctor Administration Portal' : 'Patient Healthcare Portal'}
                    </span>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                      isDoctor ? 'bg-amber-200 text-amber-900' : 'bg-emerald-200 text-emerald-900'
                    }`}>
                      {isDoctor ? 'Doctor View' : 'My Visits'}
                    </span>
                  </button>
                  <button
                    onClick={() => { logout(); setMobileMenuOpen(false); }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg font-semibold text-sm transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out ({profile?.displayName || user.email})
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleNavClick('login')}
                    className="w-full text-center py-2.5 px-4 text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 font-bold rounded-lg"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => handleNavClick('register')}
                    className="w-full text-center py-2.5 px-4 text-white bg-sky-600 hover:bg-sky-700 font-bold rounded-lg shadow-sm"
                  >
                    Register
                  </button>
                </div>
              )}

              <a
                href={`tel:${HOSPITAL_INFO.phone}`}
                className="mt-2 w-full flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-xs text-sm"
              >
                <Phone className="w-4 h-4" />
                Emergency Call: {HOSPITAL_INFO.phone}
              </a>
            </div>
          </div>
        )}
      </header>
    </>
  );
};
