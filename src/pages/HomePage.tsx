import React from 'react';
import { Calendar, Phone, Clock, Award, Users, HeartPulse, ChevronRight, Stethoscope, ShieldCheck, Activity } from 'lucide-react';
import { HOSPITAL_INFO, DEPARTMENTS } from '../data/hospitalData';

interface HomePageProps {
  setCurrentTab: (tab: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ setCurrentTab }) => {
  return (
    <div className="flex flex-col min-h-screen">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-linear-to-b from-sky-50/70 via-white to-slate-50 py-12 md:py-20 border-b border-sky-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-100/90 text-sky-800 text-xs sm:text-sm font-bold tracking-wide uppercase shadow-xs">
                <span className="w-2 h-2 rounded-full bg-sky-600 animate-pulse"></span>
                Trusted Healthcare in Rahata
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.12]">
                Quality Healthcare, <br />
                <span className="text-sky-600 bg-linear-to-r from-sky-600 to-blue-700 bg-clip-text text-transparent">
                  Caring for You.
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Access trusted doctors, specialized medical departments, seamless real-time appointment bookings, and 24/7 emergency support under one caring roof.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <button
                  onClick={() => setCurrentTab('appointment')}
                  className="w-full sm:w-auto px-7 py-3.5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all text-base flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Calendar className="w-5 h-5" />
                  Book Appointment
                </button>
                <button
                  onClick={() => setCurrentTab('doctors')}
                  className="w-full sm:w-auto px-7 py-3.5 bg-white hover:bg-slate-50 text-slate-800 font-bold rounded-xl border border-slate-300 hover:border-sky-500 shadow-xs hover:-translate-y-0.5 transition-all text-base flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Stethoscope className="w-5 h-5 text-sky-600" />
                  Find a Doctor
                </button>
              </div>

              {/* Quick Trust Highlights */}
              <div className="pt-6 grid grid-cols-3 gap-3 border-t border-slate-200/80 max-w-lg mx-auto lg:mx-0">
                <div className="text-center lg:text-left">
                  <p className="text-2xl font-black text-slate-900">10+</p>
                  <p className="text-xs font-semibold text-slate-500">Years of Service</p>
                </div>
                <div className="text-center lg:text-left border-x border-slate-200 px-2">
                  <p className="text-2xl font-black text-slate-900">10K+</p>
                  <p className="text-xs font-semibold text-slate-500">Happy Patients</p>
                </div>
                <div className="text-center lg:text-left">
                  <p className="text-2xl font-black text-emerald-600">24/7</p>
                  <p className="text-xs font-semibold text-slate-500">Emergency Care</p>
                </div>
              </div>
            </div>

            {/* Right Hero Visual Card - Lead Doctor Card */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="w-full max-w-md bg-white rounded-2xl p-6 sm:p-7 shadow-xl border border-sky-100 hover:shadow-2xl transition-shadow relative">
                
                <div className="absolute -top-3.5 right-6 bg-linear-to-r from-emerald-500 to-teal-600 text-white text-xs font-extrabold uppercase px-3 py-1 rounded-full shadow-sm">
                  Chief Physician
                </div>

                <div className="w-full h-64 sm:h-72 rounded-xl bg-linear-to-br from-sky-100 via-blue-50 to-indigo-100 flex flex-col items-center justify-center relative overflow-hidden border border-sky-100 shadow-inner group">
                  <div className="w-28 h-28 rounded-full bg-white shadow-md flex items-center justify-center text-6xl mb-3 border-4 border-sky-100 group-hover:scale-105 transition-transform duration-300">
                    👨‍⚕️
                  </div>
                  <span className="text-xs font-bold text-sky-800 bg-sky-200/70 px-3 py-1 rounded-full">
                    Director & Consultant
                  </span>
                  <div className="absolute bottom-2 left-2 right-2 bg-white/90 backdrop-blur-xs py-1.5 px-3 rounded-lg text-center text-xs text-slate-700 font-semibold border border-white/50">
                    Consulting OPD: 9:00 AM - 1:00 PM | 5:00 PM - 8:30 PM
                  </div>
                </div>

                <div className="mt-5 text-center">
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                    {HOSPITAL_INFO.leadDoctor}
                  </h3>
                  <p className="text-sky-700 font-bold text-sm mt-1">
                    {HOSPITAL_INFO.leadQualification}
                  </p>
                  <p className="text-slate-500 text-xs font-semibold mt-0.5">
                    {HOSPITAL_INFO.leadRole}
                  </p>

                  <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-sky-600" /> Mon - Sat
                    </span>
                    <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                      Available Today
                    </span>
                  </div>

                  <button
                    onClick={() => setCurrentTab('appointment')}
                    className="mt-4 w-full py-2.5 px-4 bg-sky-50 hover:bg-sky-100 text-sky-800 font-bold text-sm rounded-xl border border-sky-200 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Consult with Dr. Malkar</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Hospital Stats Grid */}
      <section className="bg-white py-12 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-sky-50/70 p-6 rounded-2xl border border-sky-100 text-center hover:bg-sky-50 transition-colors">
              <Award className="w-8 h-8 text-sky-600 mx-auto mb-2" />
              <p className="text-3xl sm:text-4xl font-black text-slate-900">10+</p>
              <p className="text-sm font-bold text-slate-600 mt-1">Years of Service</p>
            </div>
            <div className="bg-sky-50/70 p-6 rounded-2xl border border-sky-100 text-center hover:bg-sky-50 transition-colors">
              <Users className="w-8 h-8 text-sky-600 mx-auto mb-2" />
              <p className="text-3xl sm:text-4xl font-black text-slate-900">20+</p>
              <p className="text-sm font-bold text-slate-600 mt-1">Medical Professionals</p>
            </div>
            <div className="bg-sky-50/70 p-6 rounded-2xl border border-sky-100 text-center hover:bg-sky-50 transition-colors">
              <HeartPulse className="w-8 h-8 text-sky-600 mx-auto mb-2" />
              <p className="text-3xl sm:text-4xl font-black text-slate-900">10K+</p>
              <p className="text-sm font-bold text-slate-600 mt-1">Happy Patients</p>
            </div>
            <div className="bg-red-50/70 p-6 rounded-2xl border border-red-100 text-center hover:bg-red-50 transition-colors">
              <Activity className="w-8 h-8 text-red-600 mx-auto mb-2" />
              <p className="text-3xl sm:text-4xl font-black text-red-700">24/7</p>
              <p className="text-sm font-bold text-red-800 mt-1">Emergency Support</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Clinical Departments */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-sky-600 font-extrabold text-sm uppercase tracking-wider">
              Specialized Healthcare
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mt-2 tracking-tight">
              Our Medical Departments
            </h2>
            <p className="text-slate-600 text-base sm:text-lg mt-3">
              Compassionate clinical care across general medicine, surgery, diagnostics, and specialty treatments.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {DEPARTMENTS.slice(0, 6).map((dept) => (
              <div 
                key={dept.id}
                className={`bg-white rounded-2xl p-6 border transition-all duration-200 hover:-translate-y-1 hover:shadow-lg flex flex-col justify-between ${
                  dept.isEmergency ? 'border-amber-300 bg-amber-50/30' : 'border-slate-200'
                }`}
              >
                <div>
                  <div className="w-14 h-14 rounded-xl bg-sky-50 flex items-center justify-center text-3xl mb-4 border border-sky-100">
                    {dept.icon}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">
                    {dept.name}
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed mb-4">
                    {dept.description}
                  </p>
                  <ul className="space-y-1.5 mb-6 text-xs text-slate-700 font-medium">
                    {dept.features.slice(0, 3).map((f, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="text-sky-600 font-bold">✓</span> {f}
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => setCurrentTab('appointment')}
                  className="w-full py-2.5 text-center text-sm font-bold text-sky-700 bg-sky-50 hover:bg-sky-100 rounded-xl transition-colors cursor-pointer"
                >
                  Book Specialist Visit
                </button>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <button
              onClick={() => setCurrentTab('departments')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-slate-800 hover:text-sky-600 font-bold text-sm rounded-xl border border-slate-300 hover:border-sky-400 transition-all shadow-xs cursor-pointer"
            >
              View All Departments & Facilities
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-sky-600 font-extrabold text-sm uppercase tracking-wider">
              Why Dr. Malkar Hospital
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mt-2 tracking-tight">
              Healthcare You Can Truly Trust
            </h2>
            <p className="text-slate-600 mt-3">
              We focus on providing a comfortable, modern, and patient-first healthcare experience.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 hover:bg-sky-50/50 hover:border-sky-200 transition-all text-center">
              <div className="w-14 h-14 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center text-2xl mx-auto mb-4">
                👨‍⚕️
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Experienced Doctors</h3>
              <p className="text-slate-600 text-sm">
                Qualified medical specialists committed to ethical diagnosis and evidence-based treatments.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 hover:bg-sky-50/50 hover:border-sky-200 transition-all text-center">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-2xl mx-auto mb-4">
                ❤️
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Patient-Centered Care</h3>
              <p className="text-slate-600 text-sm">
                Every patient receives personalized attention, transparent consultation, and dignified care.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 hover:bg-sky-50/50 hover:border-sky-200 transition-all text-center">
              <div className="w-14 h-14 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-2xl mx-auto mb-4">
                🏥
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Modern Facilities</h3>
              <p className="text-slate-600 text-sm">
                Equipped with digitized diagnostics, ECG, pharmacy, clean inpatient wards, and minor OT.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 hover:bg-sky-50/50 hover:border-sky-200 transition-all text-center">
              <div className="w-14 h-14 rounded-full bg-red-100 text-red-700 flex items-center justify-center text-2xl mx-auto mb-4">
                🚑
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Emergency Care</h3>
              <p className="text-slate-600 text-sm">
                Round-the-clock emergency support with on-call trauma management and ambulance transport.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Emergency Callout Banner */}
      <section className="bg-linear-to-r from-sky-900 via-blue-900 to-indigo-950 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8 bg-white/5 p-8 rounded-3xl border border-white/10 backdrop-blur-xs">
            <div className="flex items-center gap-5 text-center lg:text-left flex-col lg:flex-row">
              <div className="w-16 h-16 rounded-2xl bg-red-600 text-white flex items-center justify-center text-3xl shrink-0 shadow-lg animate-bounce">
                🚑
              </div>
              <div>
                <span className="text-sky-300 font-extrabold text-xs uppercase tracking-wider">
                  24/7 Immediate Emergency Assistance
                </span>
                <h3 className="text-2xl sm:text-3xl font-black mt-1">
                  Need Urgent Medical Attention?
                </h3>
                <p className="text-slate-300 text-sm sm:text-base mt-1 max-w-xl">
                  Our trauma care and emergency team are standing by 24 hours a day, 7 days a week.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
              <a
                href={`tel:${HOSPITAL_INFO.phone}`}
                className="w-full sm:w-auto px-8 py-3.5 bg-red-600 hover:bg-red-700 text-white font-extrabold text-base rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2"
              >
                <Phone className="w-5 h-5" />
                Call: {HOSPITAL_INFO.phone}
              </a>
              <button
                onClick={() => setCurrentTab('appointment')}
                className="w-full sm:w-auto px-6 py-3.5 bg-white text-slate-900 hover:bg-sky-50 font-bold text-base rounded-xl transition-colors cursor-pointer"
              >
                Schedule Appointment
              </button>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
