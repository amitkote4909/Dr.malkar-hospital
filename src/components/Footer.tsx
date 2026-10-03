import React from 'react';
import { HOSPITAL_INFO } from '../data/hospitalData';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';

interface FooterProps {
  setCurrentTab: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ setCurrentTab }) => {
  const handleNav = (tab: string) => {
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-14 border-b border-slate-800">
          
          {/* Column 1: Hospital About */}
          <div className="space-y-4">
            <button 
              onClick={() => handleNav('home')}
              className="flex items-center gap-3 text-left focus:outline-hidden group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-sky-600 flex items-center justify-center text-white text-2xl shadow-md">
                🏥
              </div>
              <span className="text-2xl font-black text-white tracking-tight">
                Dr. Malkar Hospital
              </span>
            </button>

            <p className="text-slate-400 text-sm leading-relaxed pr-2">
              Dr. Malkar Hospital provides trusted, compassionate and quality healthcare services for patients and their families in Rahata, Ahilyanagar and surrounding communities.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <a 
                href="#facebook" 
                aria-label="Facebook"
                className="w-9 h-9 rounded-full bg-slate-800 hover:bg-sky-600 text-slate-300 hover:text-white flex items-center justify-center font-bold text-sm transition-all duration-200"
              >
                f
              </a>
              <a 
                href="#twitter" 
                aria-label="Twitter / X"
                className="w-9 h-9 rounded-full bg-slate-800 hover:bg-sky-600 text-slate-300 hover:text-white flex items-center justify-center font-bold text-sm transition-all duration-200"
              >
                X
              </a>
              <a 
                href="#instagram" 
                aria-label="Instagram"
                className="w-9 h-9 rounded-full bg-slate-800 hover:bg-pink-600 text-slate-300 hover:text-white flex items-center justify-center font-bold text-sm transition-all duration-200"
              >
                ◎
              </a>
              <a 
                href="#linkedin" 
                aria-label="LinkedIn"
                className="w-9 h-9 rounded-full bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white flex items-center justify-center font-bold text-sm transition-all duration-200"
              >
                in
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-white text-lg font-bold mb-4 relative pb-2 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-8 after:h-0.5 after:bg-sky-500">
              Quick Links
            </h3>
            <ul className="space-y-2.5 text-sm text-slate-400 font-medium">
              <li>
                <button onClick={() => handleNav('home')} className="hover:text-sky-400 transition-colors cursor-pointer text-left">
                  Home
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('about')} className="hover:text-sky-400 transition-colors cursor-pointer text-left">
                  About Us
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('doctors')} className="hover:text-sky-400 transition-colors cursor-pointer text-left">
                  Our Doctors
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('services')} className="hover:text-sky-400 transition-colors cursor-pointer text-left">
                  Services
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('appointment')} className="hover:text-sky-400 transition-colors cursor-pointer text-left">
                  Appointment Booking
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('contact')} className="hover:text-sky-400 transition-colors cursor-pointer text-left">
                  Contact & Location
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Departments */}
          <div>
            <h3 className="text-white text-lg font-bold mb-4 relative pb-2 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-8 after:h-0.5 after:bg-sky-500">
              Departments
            </h3>
            <ul className="space-y-2.5 text-sm text-slate-400 font-medium">
              <li>
                <button onClick={() => handleNav('departments')} className="hover:text-sky-400 transition-colors cursor-pointer text-left">
                  General Care & Internal Medicine
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('departments')} className="hover:text-sky-400 transition-colors cursor-pointer text-left">
                  Dental Care & Surgery
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('departments')} className="hover:text-sky-400 transition-colors cursor-pointer text-left">
                  Orthopedic Care & Joint Clinic
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('departments')} className="hover:text-sky-400 transition-colors cursor-pointer text-left">
                  Emergency & Trauma Care (24/7)
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('departments')} className="hover:text-sky-400 transition-colors cursor-pointer text-left">
                  Pediatrics & Neonatal Care
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact Information */}
          <div>
            <h3 className="text-white text-lg font-bold mb-4 relative pb-2 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-8 after:h-0.5 after:bg-sky-500">
              Contact Us
            </h3>
            <ul className="space-y-3.5 text-sm text-slate-400">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
                <p>
                  423107, Rahata, Ahilyanagar,<br />
                  Maharashtra, India
                </p>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-sky-400 shrink-0" />
                <a href={`tel:${HOSPITAL_INFO.phone}`} className="hover:text-white transition-colors">
                  {HOSPITAL_INFO.phone}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-sky-400 shrink-0" />
                <a href="mailto:xyz@gmail.com" className="hover:text-white transition-colors">
                  xyz@gmail.com / {HOSPITAL_INFO.email}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-emerald-300 font-semibold">
                  Emergency: 24/7 Open
                </span>
              </li>
            </ul>
          </div>

        </div>

        {/* Footer Bottom Legal Bar */}
        <div className="py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>
            © 2026 Dr. Malkar Hospital. All Rights Reserved.
          </p>
          <div className="flex items-center gap-6">
            <a href="#privacy" className="hover:text-slate-300 transition-colors">
              Privacy Policy
            </a>
            <a href="#terms" className="hover:text-slate-300 transition-colors">
              Terms & Conditions
            </a>
            <button onClick={() => handleNav('contact')} className="hover:text-slate-300 transition-colors">
              Patient Helpdesk
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};
