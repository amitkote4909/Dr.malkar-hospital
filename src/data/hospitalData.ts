export interface Doctor {
  id: string;
  name: string;
  title: string;
  qualifications: string;
  department: string;
  experience: string;
  availability: string;
  opdTimings: string;
  consultationFee: number;
  rating: number;
  avatar: string;
  specialties: string[];
  about: string;
}

export interface DepartmentInfo {
  id: string;
  name: string;
  icon: string;
  description: string;
  features: string[];
  isEmergency?: boolean;
}

export interface ServiceInfo {
  id: string;
  name: string;
  icon: string;
  category: string;
  description: string;
  features: string[];
}

export const HOSPITAL_INFO = {
  name: 'Dr. Malkar Hospital',
  tagline: 'Quality Healthcare & Compassionate Service',
  leadDoctor: 'Dr. Vaibhav G. Malkar',
  leadQualification: 'M.B.B.S., T.D.D., F.C.C.P.',
  leadRole: 'Main Administrator, Consulting Physician & Medical Director',
  address: '123 Healthcare Avenue, 423107, Rahata, Ahilyanagar, Maharashtra, India',
  phone: '+91 9579674964',
  altPhone: '+91 98765 43210',
  emergencyPhone: '108 / +91 9579674964',
  email: 'info@medicarehospital.com',
  altEmail: 'dr.malkarhospital@gmail.com',
  opdHours: 'Mon - Sat: 9:00 AM - 1:00 PM & 5:00 PM - 9:00 PM',
  emergencyHours: '24 Hours / 7 Days a week',
  establishedYear: '2014',
};

export const DEPARTMENTS: DepartmentInfo[] = [
  {
    id: 'general',
    name: 'General Medicine',
    icon: '🩺',
    description: 'Primary outpatient and inpatient consulting for acute illnesses, fever management, diabetes, hypertension, and lifestyle diseases.',
    features: ['Chronic Disease Management', 'Preventive Health Screenings', 'Infectious Disease Care', 'Comprehensive Health Checkups'],
  },
  {
    id: 'orthopedics',
    name: 'Orthopedics',
    icon: '🦴',
    description: 'Advanced treatment for joint problems, trauma care, bone fractures, arthritis, spinal disorders, and rehabilitation therapy.',
    features: ['Joint Replacement & Arthroscopy', 'Sports Injury Therapy', 'Fracture & Trauma Clinic', 'Osteoporosis & Arthritis Care'],
  },
  {
    id: 'dental',
    name: 'Dental Care',
    icon: '🦷',
    description: 'Comprehensive oral health solutions covering preventive cleaning, root canal treatments, fillings, and corrective cosmetic dental care.',
    features: ['Root Canal Treatment (RCT)', 'Cosmetic Dentistry & Veneers', 'Preventive Oral Hygiene', 'Teeth Alignment & Dental Implants'],
  },
  {
    id: 'emergency',
    name: 'Emergency & Trauma Care',
    icon: '🚑',
    description: 'Round-the-clock emergency medical attention with rapid triage, resuscitation units, cardiac monitoring, and standby surgical teams.',
    features: ['24/7 Trauma & Critical Care Support', 'Advanced Cardiac Life Support (ACLS)', 'Immediate Triage Response', 'Equipped Critical Care Ambulance'],
    isEmergency: true,
  },
  {
    id: 'cardiology',
    name: 'Cardiology & Preventive Care',
    icon: '❤️',
    description: 'Cardiac assessment, ECG, hypertension management, preventive cardiovascular screenings, and continuous heart monitoring.',
    features: ['Digital 12-Lead ECG Analysis', 'Hypertension & Lipid Clinic', 'Cardiac Risk Stratification', 'Post-Cardiac Care & Rehab'],
  },
];

export const DOCTORS: Doctor[] = [
  {
    id: 'dr-vaibhav-malkar',
    name: 'Dr. Vaibhav G. Malkar',
    title: 'Main Administrator, Consulting Physician & Medical Director',
    qualifications: 'M.B.B.S., T.D.D., F.C.C.P.',
    department: 'general',
    experience: '16+ Years Experience',
    availability: 'Mon - Sat',
    opdTimings: '9:00 AM - 1:00 PM & 5:00 PM - 8:30 PM',
    consultationFee: 400,
    rating: 4.9,
    avatar: '👨‍⚕️',
    specialties: ['Internal Medicine', 'Chest & Respiratory Diseases', 'Diabetes & Hypertension', 'Critical Care Medicine'],
    about: 'Dr. Vaibhav G. Malkar is the Main Administrator, Consulting Physician, and Medical Director of Dr. Malkar Hospital, Rahata. With extensive clinical leadership and expertise in internal medicine, he directs hospital operations and patient outpatient services.',
  },
  {
    id: 'dr-suresh-deshmukh',
    name: 'Dr. Suresh Deshmukh',
    title: 'Orthopedic Surgeon',
    qualifications: 'M.S. (Ortho), D.N.B., F.I.A.',
    department: 'orthopedics',
    experience: '12+ Years Experience',
    availability: 'Mon, Wed, Fri, Sat',
    opdTimings: '10:00 AM - 2:00 PM',
    consultationFee: 500,
    rating: 4.8,
    avatar: '👨‍⚕️',
    specialties: ['Complex Trauma & Fractures', 'Joint Replacement', 'Arthroscopic Surgery', 'Spine & Sports Rehabilitation'],
    about: 'Specialized in joint reconstructions, minimally invasive trauma fixation, and rehabilitation for severe sports and age-related musculoskeletal conditions.',
  },
  {
    id: 'dr-rajesh-patil',
    name: 'Dr. Rajesh Patil',
    title: 'Dental Surgeon & Oral Health Specialist',
    qualifications: 'B.D.S., M.D.S., F.I.C.S.',
    department: 'dental',
    experience: '14+ Years Experience',
    availability: 'Mon - Sat',
    opdTimings: '10:00 AM - 1:30 PM & 5:00 PM - 8:00 PM',
    consultationFee: 400,
    rating: 4.8,
    avatar: '👨‍⚕️',
    specialties: ['Comprehensive Dental Surgery', 'Root Canal Treatment (RCT)', 'Oral & Maxillofacial Care', 'Teeth Alignment & Dental Implants'],
    about: 'Dr. Rajesh Patil heads the Dental Care section at Dr. Malkar Hospital, specializing in restorative dentistry, oral surgery, painless root canals, and modern dental implants.',
  },
  {
    id: 'dr-anjali-deshpande',
    name: 'Dr. Anjali Deshpande',
    title: 'Consultant Trauma Surgeon & Emergency Critical Care Specialist',
    qualifications: 'M.D. (Med), D.M., F.A.C.S. (Surgery & Trauma)',
    department: 'emergency',
    experience: '12+ Years Experience',
    availability: 'Daily (24/7 Trauma on Call & OPD: 2:00 PM - 6:00 PM)',
    opdTimings: '2:00 PM - 6:00 PM & 24/7 Emergency Support',
    consultationFee: 500,
    rating: 4.9,
    avatar: '👩‍⚕️',
    specialties: ['Acute Trauma Resuscitation', 'Emergency & Trauma Surgery', 'Cardiovascular Trauma & Critical Care', 'Advanced Life Support (ACLS) & Triage'],
    about: 'Dr. Anjali Deshpande leads the Surgery & Trauma Care unit at Dr. Malkar Hospital, providing emergency surgical triage, acute trauma stabilization, and critical life support intervention.',
  }
];

// Complete roster of consulting doctors available for appointment scheduling
export const CONSULTING_DOCTORS: Doctor[] = [
  {
    id: 'dr-vaibhav-malkar',
    name: 'Dr. Vaibhav G. Malkar',
    title: 'Main Administrator, Consulting Physician & Medical Director',
    qualifications: 'M.B.B.S., T.D.D., F.C.C.P.',
    department: 'general',
    experience: '16+ Years Experience',
    availability: 'Mon - Sat',
    opdTimings: '9:00 AM - 1:00 PM & 5:00 PM - 8:30 PM',
    consultationFee: 400,
    rating: 4.9,
    avatar: '👨‍⚕️',
    specialties: ['Internal Medicine', 'Chest & Respiratory Diseases', 'Diabetes & Hypertension', 'Critical Care Medicine'],
    about: 'Dr. Vaibhav G. Malkar is the Main Administrator, Consulting Physician, and Medical Director of Dr. Malkar Hospital, Rahata.',
  },
  {
    id: 'dr-suresh-deshmukh',
    name: 'Dr. Suresh Deshmukh',
    title: 'Orthopedic Surgeon',
    qualifications: 'M.S. (Ortho), D.N.B., F.I.A.',
    department: 'orthopedics',
    experience: '12+ Years Experience',
    availability: 'Mon, Wed, Fri, Sat',
    opdTimings: '10:00 AM - 2:00 PM',
    consultationFee: 500,
    rating: 4.8,
    avatar: '👨‍⚕️',
    specialties: ['Complex Trauma & Fractures', 'Joint Replacement', 'Arthroscopic Surgery', 'Spine & Sports Rehabilitation'],
    about: 'Specialized in joint reconstructions, minimally invasive trauma fixation, and rehabilitation for musculoskeletal conditions.',
  },
  {
    id: 'dr-rajesh-patil',
    name: 'Dr. Rajesh Patil',
    title: 'Dental Surgeon & Oral Health Specialist',
    qualifications: 'B.D.S., M.D.S., F.I.C.S.',
    department: 'dental',
    experience: '14+ Years Experience',
    availability: 'Mon - Sat',
    opdTimings: '10:00 AM - 1:30 PM & 5:00 PM - 8:00 PM',
    consultationFee: 400,
    rating: 4.8,
    avatar: '👨‍⚕️',
    specialties: ['Comprehensive Dental Surgery', 'Root Canal Treatment (RCT)', 'Oral & Maxillofacial Care', 'Teeth Alignment & Dental Implants'],
    about: 'Dr. Rajesh Patil heads the Dental Care section at Dr. Malkar Hospital, specializing in restorative dentistry, oral surgery, painless root canals, and modern dental implants.',
  },
  {
    id: 'dr-anjali-deshpande',
    name: 'Dr. Anjali Deshpande',
    title: 'Consultant Trauma Surgeon & Emergency Critical Care Specialist',
    qualifications: 'M.D. (Med), D.M., F.A.C.S. (Surgery & Trauma)',
    department: 'emergency',
    experience: '12+ Years Experience',
    availability: 'Daily (24/7 Trauma on Call & OPD: 2:00 PM - 6:00 PM)',
    opdTimings: '2:00 PM - 6:00 PM & 24/7 Emergency Support',
    consultationFee: 500,
    rating: 4.9,
    avatar: '👩‍⚕️',
    specialties: ['Acute Trauma Resuscitation', 'Emergency & Trauma Surgery', 'Cardiovascular Trauma & Critical Care', 'Advanced Life Support (ACLS) & Triage'],
    about: 'Dr. Anjali Deshpande leads the Surgery & Trauma Care unit at Dr. Malkar Hospital, providing emergency surgical triage, acute trauma stabilization, and critical life support intervention.',
  }
];

export const SERVICES: ServiceInfo[] = [
  {
    id: 'general-consult',
    name: 'General Consultation',
    icon: '🩺',
    category: 'Outpatient Care',
    description: 'Professional medical consultation for common health concerns, seasonal illnesses, regular checkups, and preventive wellness advice.',
    features: ['Vital Signs & Health Risk Assessment', 'Routine Diagnostics Review', 'Prescription Management', 'Dietary & Lifestyle Advice'],
  },
  {
    id: 'ortho-care',
    name: 'Orthopedics & Fracture Clinic',
    icon: '🦴',
    category: 'Surgical & Rehabilitation',
    description: 'Diagnosis, modern casting, surgical intervention, and physical therapy for bone fractures, sprains, arthritis, and back pain.',
    features: ['Digital X-Ray Assessment', 'Plaster Casting & Splints', 'Joint Injections & Pain Relief', 'Post-Op Physical Therapy Guidance'],
  },
  {
    id: 'dental-service',
    name: 'Comprehensive Dental Clinic',
    icon: '🦷',
    category: 'Oral Health',
    description: 'Advanced dental procedures including rotary root canals, ultrasonic scaling, cosmetic fillings, tooth extraction, and crowns.',
    features: ['Painless Rotary Root Canal (RCT)', 'Ultrasonic Teeth Cleaning', 'Aesthetic Composite Restorations', 'Dental Prosthetics & Aligners'],
  },
  {
    id: 'pharmacy',
    name: '24/7 In-House Pharmacy',
    icon: '💊',
    category: 'Support Facilities',
    description: 'Round-the-clock dispensary stocked with verified pharmaceutical drugs, emergency life-saving injections, and medical consumables.',
    features: ['Genuine Branded & Generic Medicines', '24/7 Availability for Inpatients & Outpatients', 'Cold-Chain Biological Storage', 'Professional Pharmacist Counseling'],
  },
  {
    id: 'emergency-service',
    name: 'Emergency & Critical Trauma',
    icon: '🚑',
    category: 'Urgent Care',
    description: 'Fully equipped trauma resuscitation bay with multipara cardiac monitors, defibrillators, oxygen supply, and ambulance transport.',
    features: ['24/7 Rapid Response Team', 'Oxygen Supply & Nebulization Units', 'Minor OT for Emergency Suturing', 'Ambulance Pick-up Support'],
  },
  {
    id: 'pathology-lab',
    name: 'Pathology & Diagnostic Laboratory',
    icon: '🔬',
    category: 'Diagnostic Services',
    description: 'Automated diagnostic analyzers for routine blood, urine, lipid profile, liver function, renal panel, and infection markers.',
    features: ['Complete Blood Count (CBC)', 'Blood Sugar & HbA1c Profiling', 'Lipid, Kidney & Liver Panels', 'Fast Digital Reports Delivery'],
  },
  {
    id: 'daycare-inpatient',
    name: 'Daycare & Inpatient Rooms',
    icon: '🛏️',
    category: 'Patient Facilities',
    description: 'Clean, sanitized, and well-ventilated patient rooms with dedicated nursing care, IV infusion stations, and patient meal facilities.',
    features: ['Air-Conditioned Private & Semi-Private Rooms', 'Dedicated Nursing Call Bell System', 'Round-the-Clock Doctor Supervision', 'Hygienic Dietary Support'],
  },
  {
    id: 'health-checkups',
    name: 'Preventive Health Packages',
    icon: '📋',
    category: 'Preventive Wellness',
    description: 'Comprehensive health checkup packages tailored for executives, senior citizens, diabetics, and family wellness profiles.',
    features: ['Master Health Screening', 'Diabetic & Cardiac Profile', 'Senior Citizen Health Audit', 'Customized Specialist Consultation'],
  },
];
