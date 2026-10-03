import React, { useState } from 'react';
import { HOSPITAL_INFO } from '../data/hospitalData';
import { submitContactInquiry } from '../firebase/dbService';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2, AlertCircle } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('general');
  const [message, setMessage] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!fullName.trim() || !email.trim() || !message.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      await submitContactInquiry({
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim() || 'N/A',
        subject,
        message: message.trim(),
      });

      setSuccess(true);
      setFullName('');
      setEmail('');
      setPhone('');
      setMessage('');
    } catch (err: unknown) {
      console.error('Contact inquiry submission failed:', err);
      setError('Failed to send message. Please try again or call our direct phone line.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      
      {/* Page Banner */}
      <section className="bg-linear-to-b from-sky-100/70 via-sky-50 to-white py-16 text-center border-b border-sky-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <span className="inline-block px-4 py-1.5 rounded-full bg-sky-200/70 text-sky-800 text-xs sm:text-sm font-bold tracking-wider uppercase mb-3">
            Get In Touch
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
            Contact Dr. Malkar Hospital
          </h1>
          <p className="mt-3 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
            We are here to help and answer any questions you might have about our medical services, appointments, or emergency care.
          </p>
        </div>
      </section>

      {/* Info Cards Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow text-center">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center text-2xl mx-auto mb-3">
              <MapPin className="w-6 h-6 text-sky-600" />
            </div>
            <h3 className="font-bold text-slate-900 mb-1 text-base">Our Location</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              423107, Rahata, Ahilyanagar,<br />
              Maharashtra, India
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow text-center">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center text-2xl mx-auto mb-3">
              <Phone className="w-6 h-6 text-sky-600" />
            </div>
            <h3 className="font-bold text-slate-900 mb-1 text-base">Phone Numbers</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Direct: <a href={`tel:${HOSPITAL_INFO.phone}`} className="text-sky-600 font-semibold hover:underline">{HOSPITAL_INFO.phone}</a><br />
              Emergency: <a href="tel:108" className="text-red-600 font-bold hover:underline">108 / 24x7 Help</a>
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow text-center">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center text-2xl mx-auto mb-3">
              <Mail className="w-6 h-6 text-sky-600" />
            </div>
            <h3 className="font-bold text-slate-900 mb-1 text-base">Email Inquiries</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              <a href="mailto:xyz@gmail.com" className="hover:text-sky-600">xyz@gmail.com</a><br />
              <a href={`mailto:${HOSPITAL_INFO.email}`} className="hover:text-sky-600">{HOSPITAL_INFO.email}</a>
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow text-center">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-2xl mx-auto mb-3">
              <Clock className="w-6 h-6 text-emerald-600" />
            </div>
            <h3 className="font-bold text-slate-900 mb-1 text-base">Working Hours</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              OPD: Mon - Sat (9 AM - 8:30 PM)<br />
              <span className="text-emerald-600 font-bold">Emergency: 24/7 Open</span>
            </p>
          </div>

        </div>
      </div>

      {/* Main Split: Form & Map */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Inquiry Form */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm">
            <h2 className="text-2xl font-black text-slate-900 mb-1">
              Send Us a Message
            </h2>
            <p className="text-slate-600 text-sm mb-6">
              Have an inquiry or feedback? Fill out the form below and our administrative desk will respond promptly.
            </p>

            {success && (
              <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>Your message has been received! Our medical desk will contact you shortly.</span>
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-3">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 text-sm outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@mail.com"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 text-sm outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 95796 74964"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 text-sm outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Department / Subject
                </label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 text-sm outline-hidden bg-white"
                >
                  <option value="general">General Medical Inquiry</option>
                  <option value="appointment">Appointment Questions</option>
                  <option value="orthopedics">Orthopedics Department</option>
                  <option value="dental">Dental Department</option>
                  <option value="emergency">Emergency Care</option>
                  <option value="billing">Billing & Insurance</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Your Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Write your message or inquiry here..."
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 text-sm outline-hidden"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send Message</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Map Location Box */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col justify-between h-full">
            <div>
              <h2 className="text-2xl font-black text-slate-900 mb-1">
                Find Us in Rahata
              </h2>
              <p className="text-slate-600 text-sm mb-4">
                Conveniently accessible from Rahata city center, Kopargaon road, and Shirdi bypass.
              </p>
            </div>

            <div className="rounded-2xl overflow-hidden border border-slate-200 mt-2 shadow-inner">
              <iframe
                title="Dr. Malkar Hospital Location Map"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3753.864619736855!2d74.4842!3d19.7828!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bdc5936706e4a8d%3A0x6b4ef8d4b3e8c!2sRahata%2C%20Maharashtra%20423107!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
                width="100%"
                height="340"
                style={{ border: 0 }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Ambulance Bay: Ground Floor</span>
              <span className="font-semibold text-sky-700">Parking Available</span>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};
