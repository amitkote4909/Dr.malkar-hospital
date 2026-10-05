import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './firebase/authContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { DoctorsPage } from './pages/DoctorsPage';
import { DepartmentsPage } from './pages/DepartmentsPage';
import { ServicesPage } from './pages/ServicesPage';
import { AppointmentPage } from './pages/AppointmentPage';
import { ContactPage } from './pages/ContactPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { PatientPortalPage } from './pages/PatientPortalPage';
import { DoctorPortalPage } from './pages/DoctorPortalPage';
import { Phone, Calendar } from 'lucide-react';
import { HOSPITAL_INFO } from './data/hospitalData';

function AppContent() {
  const { user, profile } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [preselectedDoctor, setPreselectedDoctor] = useState<string | undefined>(undefined);
  const [preselectedDepartment, setPreselectedDepartment] = useState<string | undefined>(undefined);

  const isDoctor = 
    profile?.role === 'doctor' || 
    profile?.role === 'admin' || 
    user?.email?.toLowerCase() === 'koteamit651@gmail.com' ||
    user?.email?.toLowerCase() === 'koteamit615@gmail.com' ||
    profile?.username === 'amitkote4909' ||
    profile?.username === 'amitkotepatil4909';

  // Sync with browser hash if present (e.g. #appointment, #about, #doctor-portal, #patient-portal, etc.)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '').toLowerCase();
      const validTabs = [
        'home', 
        'about', 
        'doctors', 
        'departments', 
        'services', 
        'appointment', 
        'contact', 
        'login', 
        'register', 
        'dashboard',
        'patient-portal',
        'doctor-portal'
      ];
      if (hash && validTabs.includes(hash)) {
        setCurrentTab(hash);
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleSelectDoctorForBooking = (docName: string, dept: string) => {
    setPreselectedDoctor(docName);
    setPreselectedDepartment(dept);
    setCurrentTab('appointment');
    window.location.hash = 'appointment';
  };

  const handleSelectDepartmentForBooking = (deptId: string) => {
    setPreselectedDepartment(deptId);
    setPreselectedDoctor(undefined);
    setCurrentTab('appointment');
    window.location.hash = 'appointment';
  };

  const handleSetTab = (tab: string) => {
    setCurrentTab(tab);
    window.location.hash = tab;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-sky-500 selection:text-white">
      
      {/* Navigation Header */}
      <Header 
        currentTab={currentTab} 
        setCurrentTab={handleSetTab} 
      />

      {/* Dynamic Page Views */}
      <main className="flex-1">
        {currentTab === 'home' && (
          <HomePage setCurrentTab={handleSetTab} />
        )}

        {currentTab === 'about' && (
          <AboutPage setCurrentTab={handleSetTab} />
        )}

        {currentTab === 'doctors' && (
          <DoctorsPage 
            setCurrentTab={handleSetTab}
            onSelectDoctorForBooking={handleSelectDoctorForBooking}
          />
        )}

        {currentTab === 'departments' && (
          <DepartmentsPage 
            setCurrentTab={handleSetTab}
            onSelectDepartmentForBooking={handleSelectDepartmentForBooking}
          />
        )}

        {currentTab === 'services' && (
          <ServicesPage setCurrentTab={handleSetTab} />
        )}

        {currentTab === 'appointment' && (
          <AppointmentPage 
            initialDoctorName={preselectedDoctor}
            initialDepartment={preselectedDepartment}
            setCurrentTab={handleSetTab}
          />
        )}

        {currentTab === 'contact' && (
          <ContactPage />
        )}

        {currentTab === 'login' && (
          <LoginPage setCurrentTab={handleSetTab} />
        )}

        {currentTab === 'register' && (
          <RegisterPage setCurrentTab={handleSetTab} />
        )}

        {/* Dedicated Doctor Portal */}
        {currentTab === 'doctor-portal' && (
          isDoctor ? (
            <DoctorPortalPage setCurrentTab={handleSetTab} />
          ) : (
            <LoginPage setCurrentTab={handleSetTab} initialSection="doctor" />
          )
        )}

        {/* Dedicated Patient Portal */}
        {currentTab === 'patient-portal' && (
          <PatientPortalPage setCurrentTab={handleSetTab} />
        )}

        {/* Generic Dashboard Route -> Routes to Doctor or Patient page based on role */}
        {currentTab === 'dashboard' && (
          isDoctor ? (
            <DoctorPortalPage setCurrentTab={handleSetTab} />
          ) : (
            <PatientPortalPage setCurrentTab={handleSetTab} />
          )
        )}
      </main>

      {/* Floating Quick Action Buttons for Mobile */}
      <div className="fixed bottom-5 right-4 z-40 sm:hidden flex flex-col gap-2">
        <a
          href={`tel:${HOSPITAL_INFO.phone}`}
          className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-transform"
          aria-label="Call Emergency"
        >
          <Phone className="w-5 h-5 animate-pulse" />
        </a>
        <button
          onClick={() => handleSetTab('appointment')}
          className="w-12 h-12 rounded-full bg-sky-600 text-white flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-transform cursor-pointer"
          aria-label="Book Appointment"
        >
          <Calendar className="w-5 h-5" />
        </button>
      </div>

      {/* Site Footer */}
      <Footer setCurrentTab={handleSetTab} />

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
