import React from 'react';
import { DEPARTMENTS, HOSPITAL_INFO } from '../data/hospitalData';
import { Calendar, Phone, CheckCircle, ShieldAlert } from 'lucide-react';

interface DepartmentsPageProps {
  setCurrentTab: (tab: string) => void;
  onSelectDepartmentForBooking: (departmentId: string) => void;
}

export const DepartmentsPage: React.FC<DepartmentsPageProps> = ({ setCurrentTab, onSelectDepartmentForBooking }) => {
  const handleBook = (deptId: string) => {
    onSelectDepartmentForBooking(deptId);
    setCurrentTab('appointment');
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      
      {/* Page Banner */}
      <section className="bg-linear-to-b from-sky-100/70 via-sky-50 to-white py-16 text-center border-b border-sky-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <span className="inline-block px-4 py-1.5 rounded-full bg-sky-200/70 text-sky-800 text-xs sm:text-sm font-bold tracking-wider uppercase mb-3">
            Specialized Medicine
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
            Our Medical Departments
          </h1>
          <p className="mt-3 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
            Delivering focused, compassionate clinical care across diverse medical and surgical specialties in Rahata.
          </p>
        </div>
      </section>

      {/* Departments Grid Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {DEPARTMENTS.map((dept) => {
            const isEmergency = dept.isEmergency;
            return (
              <article 
                key={dept.id}
                className={`rounded-3xl p-8 border transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl flex flex-col justify-between ${
                  isEmergency
                    ? 'bg-amber-50/60 border-amber-300 ring-2 ring-amber-100'
                    : 'bg-white border-slate-200 shadow-sm'
                }`}
              >
                <div>
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-4xl mb-6 shadow-xs ${
                    isEmergency ? 'bg-amber-100' : 'bg-sky-50 text-sky-600'
                  }`}>
                    {dept.icon}
                  </div>

                  <h2 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">
                    {dept.name}
                  </h2>

                  <p className="text-slate-600 text-sm leading-relaxed mb-6">
                    {dept.description}
                  </p>

                  <div className="border-t border-slate-100 pt-5 mb-6">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                      Key Clinical Services
                    </h4>
                    <ul className="space-y-2.5">
                      {dept.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 font-medium">
                          <CheckCircle className={`w-4 h-4 shrink-0 mt-0.5 ${
                            isEmergency ? 'text-amber-600' : 'text-sky-600'
                          }`} />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-2">
                  {isEmergency ? (
                    <a
                      href={`tel:${HOSPITAL_INFO.phone}`}
                      className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white font-extrabold text-sm rounded-xl shadow-md transition-colors flex items-center justify-center gap-2"
                    >
                      <Phone className="w-4 h-4" />
                      24/7 Emergency: {HOSPITAL_INFO.phone}
                    </a>
                  ) : (
                    <button
                      onClick={() => handleBook(dept.id)}
                      className="w-full py-3 bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Calendar className="w-4 h-4" />
                      Book Specialist Visit
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {/* Emergency Assistance Notice */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <div className="bg-sky-900 text-white p-8 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="flex items-center gap-4 text-center md:text-left">
            <div className="w-14 h-14 rounded-2xl bg-red-600 flex items-center justify-center text-3xl shrink-0">
              <ShieldAlert className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Unsure which department to choose?</h3>
              <p className="text-slate-300 text-sm mt-1">
                Our reception team will guide you to the right specialist based on your symptoms.
              </p>
            </div>
          </div>
          <button
            onClick={() => setCurrentTab('contact')}
            className="px-6 py-3 bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm rounded-xl transition-colors cursor-pointer shrink-0"
          >
            Contact Helpdesk
          </button>
        </div>
      </div>

    </div>
  );
};
