import React from 'react';
import { Target, Eye, Award, Users, HeartPulse, Clock, Calendar, Stethoscope } from 'lucide-react';
import { HOSPITAL_INFO } from '../data/hospitalData';

interface AboutPageProps {
  setCurrentTab: (tab: string) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ setCurrentTab }) => {
  return (
    <div className="bg-slate-50 min-h-screen">
      
      {/* About Hero Banner */}
      <section className="bg-linear-to-b from-sky-100/70 via-sky-50 to-white py-16 text-center border-b border-sky-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <span className="inline-block px-4 py-1.5 rounded-full bg-sky-200/70 text-sky-800 text-xs sm:text-sm font-bold tracking-wider uppercase mb-4">
            About Our Hospital
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Caring for Your Health, <br />
            <span className="text-sky-600">Every Step of the Way.</span>
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Dr. Malkar Hospital is committed to providing quality healthcare services with compassion, clinical professionalism, and state-of-the-art medical amenities in Rahata.
          </p>
        </div>
      </section>

      {/* Who We Are & Overview */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Visual Card */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="w-full max-w-md bg-linear-to-br from-sky-50 to-blue-50 border border-sky-100 rounded-3xl p-8 text-center shadow-lg relative overflow-hidden">
                <div className="w-24 h-24 rounded-2xl bg-white shadow-md flex items-center justify-center text-5xl mx-auto mb-6 border border-sky-100">
                  🏥
                </div>
                <h3 className="text-2xl font-black text-slate-900">
                  Dr. Malkar Hospital
                </h3>
                <p className="text-sky-700 font-bold text-sm mt-1">
                  Quality Healthcare & Compassionate Service
                </p>

                <div className="mt-8 space-y-3 text-left border-t border-sky-100 pt-6 text-sm text-slate-600">
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="font-semibold text-slate-700">Director:</span>
                    <span>{HOSPITAL_INFO.leadDoctor}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="font-semibold text-slate-700">Credentials:</span>
                    <span>{HOSPITAL_INFO.leadQualification}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="font-semibold text-slate-700">Location:</span>
                    <span>Rahata, Ahilyanagar</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="font-semibold text-slate-700">Emergency:</span>
                    <span className="text-emerald-600 font-bold">24 Hours / 7 Days</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Who We Are Content */}
            <div className="lg:col-span-7 space-y-5">
              <span className="text-sky-600 font-extrabold text-xs uppercase tracking-wider">
                Who We Are
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                Dedicated to Providing Quality Healthcare
              </h2>
              <p className="text-slate-600 text-base leading-relaxed">
                Dr. Malkar Hospital is a patient-centric medical institution focused on delivering reliable, affordable, and comprehensive healthcare services to patients and families across Rahata, Shirdi, and the wider Ahilyanagar district.
              </p>
              <p className="text-slate-600 text-base leading-relaxed">
                Our hospital brings together seasoned physicians, skilled specialists, compassionate nursing professionals, and modern diagnostic capabilities. We prioritize hygiene, empathy, and transparent medical counsel so every patient feels safe, respected, and thoroughly cared for.
              </p>
              <p className="text-slate-600 text-base leading-relaxed">
                From routine outpatient consultations and preventive screenings to emergency trauma response, joint treatments, pediatric wellness, and dental care, our multidisciplinary team coordinates closely to restore and protect your health.
              </p>

              <div className="pt-4 flex flex-wrap gap-4">
                <button
                  onClick={() => setCurrentTab('appointment')}
                  className="px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Calendar className="w-4 h-4" />
                  Book an Appointment
                </button>
                <button
                  onClick={() => setCurrentTab('doctors')}
                  className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Stethoscope className="w-4 h-4 text-sky-600" />
                  Our Doctors
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="py-16 bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-sky-600 font-extrabold text-xs uppercase tracking-wider">
              Our Purpose
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mt-2 tracking-tight">
              Mission & Vision
            </h2>
            <p className="text-slate-600 mt-2">
              We are committed to elevating regional healthcare through compassion, ethics, and medical innovation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            
            {/* Mission Card */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-14 h-14 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center text-3xl mb-5 border border-sky-100">
                <Target className="w-7 h-7 text-sky-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">Our Mission</h3>
              <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
                To provide high-quality, accessible, and compassionate healthcare services while safeguarding the dignity, comfort, and clinical well-being of every patient who enters our doors.
              </p>
            </div>

            {/* Vision Card */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-3xl mb-5 border border-blue-100">
                <Eye className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">Our Vision</h3>
              <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
                To become the most trusted healthcare institution in Ahilyanagar district, known for exemplary clinical outcomes, patient-first ethics, and prompt emergency response.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Hospital Stats */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="p-8 rounded-2xl bg-sky-50/60 border border-sky-100 text-center">
              <Award className="w-8 h-8 text-sky-600 mx-auto mb-2" />
              <p className="text-4xl font-black text-slate-900">10+</p>
              <p className="text-sm font-bold text-slate-600 mt-2">Years of Service</p>
            </div>
            <div className="p-8 rounded-2xl bg-sky-50/60 border border-sky-100 text-center">
              <Users className="w-8 h-8 text-sky-600 mx-auto mb-2" />
              <p className="text-4xl font-black text-slate-900">20+</p>
              <p className="text-sm font-bold text-slate-600 mt-2">Medical Professionals</p>
            </div>
            <div className="p-8 rounded-2xl bg-sky-50/60 border border-sky-100 text-center">
              <HeartPulse className="w-8 h-8 text-sky-600 mx-auto mb-2" />
              <p className="text-4xl font-black text-slate-900">10K+</p>
              <p className="text-sm font-bold text-slate-600 mt-2">Happy Patients</p>
            </div>
            <div className="p-8 rounded-2xl bg-red-50/60 border border-red-100 text-center">
              <Clock className="w-8 h-8 text-red-600 mx-auto mb-2" />
              <p className="text-4xl font-black text-red-700">24/7</p>
              <p className="text-sm font-bold text-red-800 mt-2">Emergency Support</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to action */}
      <section className="py-16 bg-sky-50 border-t border-sky-100 text-center">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Your Health Is Our Priority
          </h2>
          <p className="mt-3 text-slate-600 text-base sm:text-lg">
            Take the first step towards personalized healthcare. Consult with our experienced physicians and medical specialists today.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => setCurrentTab('appointment')}
              className="w-full sm:w-auto px-8 py-3.5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl shadow-md transition-all cursor-pointer"
            >
              Book Appointment
            </button>
            <button
              onClick={() => setCurrentTab('doctors')}
              className="w-full sm:w-auto px-8 py-3.5 bg-white hover:bg-slate-50 text-slate-800 font-bold rounded-xl border border-slate-300 transition-all cursor-pointer"
            >
              Meet Our Doctors
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};
