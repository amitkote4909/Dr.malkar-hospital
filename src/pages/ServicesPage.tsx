import React from 'react';
import { SERVICES, HOSPITAL_INFO } from '../data/hospitalData';
import { Calendar, Phone, CheckCircle, Clock, ShieldCheck, ArrowRight } from 'lucide-react';

interface ServicesPageProps {
  setCurrentTab: (tab: string) => void;
}

export const ServicesPage: React.FC<ServicesPageProps> = ({ setCurrentTab }) => {
  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      
      {/* Services Hero */}
      <section className="bg-linear-to-b from-sky-100/70 via-sky-50 to-white py-16 text-center border-b border-sky-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <span className="inline-block px-4 py-1.5 rounded-full bg-sky-200/70 text-sky-800 text-xs sm:text-sm font-bold tracking-wider uppercase mb-3">
            Our Medical Services
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
            Complete Healthcare, <br />
            <span className="text-sky-600">Under One Roof.</span>
          </h1>
          <p className="mt-3 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
            Dr. Malkar Hospital provides reliable, affordable, and patient-focused medical services to support your ongoing health and recovery.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => setCurrentTab('appointment')}
              className="px-7 py-3.5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <Calendar className="w-5 h-5" />
              Book Appointment
            </button>
            <button
              onClick={() => setCurrentTab('doctors')}
              className="px-7 py-3.5 bg-white hover:bg-slate-100 text-slate-800 font-bold rounded-xl border border-slate-300 transition-all cursor-pointer"
            >
              Find a Doctor
            </button>
          </div>
        </div>
      </section>

      {/* Services Grid Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-sky-600 font-extrabold text-xs uppercase tracking-wider">
            What We Offer
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mt-2 tracking-tight">
            Quality Medical Services
          </h2>
          <p className="text-slate-600 mt-2">
            Our healthcare services combine modern equipment, rigorous clinical protocols, and compassionate bedside care.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {SERVICES.map((srv) => (
            <div 
              key={srv.id}
              className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="w-16 h-16 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center text-4xl mb-6 border border-sky-100 shadow-xs">
                  {srv.icon}
                </div>

                <span className="text-xs font-bold text-sky-700 uppercase tracking-wider bg-sky-50 px-2.5 py-1 rounded-md">
                  {srv.category}
                </span>

                <h3 className="text-2xl font-black text-slate-900 mt-3 mb-2 tracking-tight">
                  {srv.name}
                </h3>

                <p className="text-slate-600 text-sm leading-relaxed mb-6">
                  {srv.description}
                </p>

                <div className="border-t border-slate-100 pt-4 mb-6">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                    Highlights
                  </h4>
                  <ul className="space-y-2">
                    {srv.features.map((f, i) => (
                      <li key={i} className="flex items-center gap-2 text-xs font-medium text-slate-700">
                        <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <button
                onClick={() => setCurrentTab('appointment')}
                className="w-full py-2.5 px-4 text-sky-700 hover:text-sky-800 bg-sky-50 hover:bg-sky-100 font-bold text-sm rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Book Service Consultation</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Additional Facilities */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-sm">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="text-sky-600 font-extrabold text-xs uppercase tracking-wider">
              Patient Support
            </span>
            <h2 className="text-3xl font-black text-slate-900 mt-2">
              Additional Healthcare Facilities
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/70 text-center">
              <div className="w-12 h-12 rounded-xl bg-sky-100 text-2xl flex items-center justify-center mx-auto mb-3">
                📅
              </div>
              <h4 className="font-bold text-slate-900 mb-1">Online Appointment</h4>
              <p className="text-xs text-slate-600">Schedule your consultation conveniently through our online portal.</p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/70 text-center">
              <div className="w-12 h-12 rounded-xl bg-red-100 text-2xl flex items-center justify-center mx-auto mb-3">
                🕐
              </div>
              <h4 className="font-bold text-slate-900 mb-1">24/7 Emergency Support</h4>
              <p className="text-xs text-slate-600">Emergency assistance is available around the clock for urgent healthcare needs.</p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/70 text-center">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-2xl flex items-center justify-center mx-auto mb-3">
                👨‍⚕️
              </div>
              <h4 className="font-bold text-slate-900 mb-1">Expert Doctors</h4>
              <p className="text-xs text-slate-600">Consult qualified healthcare professionals across diverse clinical fields.</p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/70 text-center">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-2xl flex items-center justify-center mx-auto mb-3">
                📋
              </div>
              <h4 className="font-bold text-slate-900 mb-1">Health Checkups</h4>
              <p className="text-xs text-slate-600">Regular wellness checkups help identify potential health risks early.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Emergency Hotline Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="bg-sky-900 text-white rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-red-600 flex items-center justify-center text-3xl shrink-0">
              🚑
            </div>
            <div>
              <span className="text-sky-300 font-bold text-xs uppercase tracking-wider">
                Emergency Medical Assistance
              </span>
              <h3 className="text-2xl font-black mt-1">Need Urgent Medical Help?</h3>
              <p className="text-slate-300 text-sm mt-0.5">
                Our emergency response unit operates 24 hours a day, 7 days a week.
              </p>
            </div>
          </div>

          <a
            href={`tel:${HOSPITAL_INFO.phone}`}
            className="w-full md:w-auto px-8 py-3.5 bg-red-600 hover:bg-red-700 text-white font-extrabold text-base rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg"
          >
            <Phone className="w-5 h-5" />
            📞 Call Now: {HOSPITAL_INFO.phone}
          </a>
        </div>
      </div>

    </div>
  );
};
