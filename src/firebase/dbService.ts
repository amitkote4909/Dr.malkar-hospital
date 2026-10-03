import { 
  collection, 
  doc, 
  addDoc, 
  setDoc,
  deleteDoc, 
  serverTimestamp, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  Unsubscribe
} from 'firebase/firestore';
import { db } from './config';

export interface PatientReport {
  id: string;
  name: string;
  date: string;
  type: string; // e.g. "Pathology CBC", "Digital Chest X-Ray", "Blood Sugar Profile", "ECG Report"
  summary: string;
  doctorComments?: string;
  fileSize?: string;
}

export interface PatientVitals {
  bp?: string; // e.g. "120/80 mmHg"
  pulse?: string; // bpm
  sugar?: string; // mg/dL
  spo2?: string; // %
  temp?: string; // °F
  weight?: string; // kg
}

export interface EmiDetails {
  planMonths: number; // e.g. 3, 6, 9, 12
  monthlyInstallment: number;
  financingPartner: string; // e.g. "Bajaj Finserv Health EMI", "HDFC Medical Care EMI", "SBI Healthcare Card", "ICICI Bank Care"
  applicantName: string;
  employmentType: string; // "Salaried", "Self-Employed", "Business Owner", "Farmer / Agriculture"
  panOrAadhaarLast4: string; // 4 digits
  contactPhone: string;
  approvalStatus: 'Application Submitted' | 'Pre-Approved' | 'Verified by Doctor';
}

export interface PaymentDetails {
  consultationFee: number;
  medicineCharges?: number;
  totalAmount: number;
  paymentOption?: 'online_upi' | 'in_hospital' | 'emi';
  paymentStatus: 'pending' | 'paid' | 'pay_at_clinic' | 'emi_processing';
  paymentMethod?: string;
  transactionId?: string; // UPI UTR or Transaction Ref number
  upiIdUsed?: string;
  emiDetails?: EmiDetails;
  paidAt?: string;
  invoiceNumber?: string;
}

export interface AppointmentRecord {
  id?: string;
  patientUid?: string;
  patientName: string;
  email: string;
  phone: string;
  age?: string;
  gender?: string;
  department: string;
  doctorId: string;
  doctorName: string;
  appointmentDate: string;
  preferredTimeWindow?: string; // e.g. "Morning (09:00 AM - 01:00 PM)" or "Evening (05:00 PM - 08:30 PM)"
  assignedTime?: string; // Set by Doctor! e.g. "10:30 AM"
  tokenNumber?: string; // Set by Doctor! e.g. "TKN-07"
  roomNumber?: string; // Set by Doctor! e.g. "OPD Chamber 01"
  reason: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  doctorNotes?: string;
  prescription?: string;
  preparationInstructions?: string; // Set by Doctor!
  vitals?: PatientVitals;
  reports?: PatientReport[];
  payment?: PaymentDetails;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface InquiryRecord {
  id?: string;
  fullName: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: 'new' | 'in_progress' | 'resolved';
  createdAt?: unknown;
}

const APPOINTMENTS_COLLECTION = 'appointments';
const INQUIRIES_COLLECTION = 'inquiries';

// ================= APPOINTMENTS ================= //

// Patient creates an appointment -> Initial status is strictly "pending"
export const bookAppointment = async (
  data: Omit<AppointmentRecord, 'id' | 'createdAt' | 'status' | 'assignedTime'>
): Promise<string> => {
  const colRef = collection(db, APPOINTMENTS_COLLECTION);
  const docRef = await addDoc(colRef, {
    ...data,
    status: 'pending', // Starts as pending until doctor assigns time slot
    payment: {
      consultationFee: 400,
      totalAmount: 400,
      paymentStatus: 'pending',
      paymentMethod: 'Cash at Counter',
      invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
    },
    // Seed default baseline report for realistic hospital history
    reports: [
      {
        id: 'rep-init-1',
        name: 'Basic Metabolic & Hematology Screen',
        date: new Date().toISOString().split('T')[0],
        type: 'Routine Lab Screen',
        summary: 'Hemoglobin: 13.8 g/dL, WBC: 7,200 /mcL, Platelets: 2.4 Lakh. Overall stable baseline.',
        doctorComments: 'Routine pre-check complete. Awaiting doctor consultation.',
        fileSize: '1.2 MB PDF'
      }
    ],
    vitals: {
      bp: '120/80',
      pulse: '74 bpm',
      temp: '98.4 °F',
      spo2: '99%',
      sugar: '110 mg/dL',
      weight: '68 kg'
    },
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
};

// Real-time listener for patient's appointments
export const subscribeToPatientAppointments = (
  patientUid: string, 
  callback: (appointments: AppointmentRecord[]) => void
): Unsubscribe => {
  const colRef = collection(db, APPOINTMENTS_COLLECTION);
  const q = query(
    colRef,
    where('patientUid', '==', patientUid),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const list: AppointmentRecord[] = [];
    snapshot.forEach((doc) => {
      list.push({ id: doc.id, ...(doc.data() as Omit<AppointmentRecord, 'id'>) });
    });
    callback(list);
  }, (err) => {
    console.warn('Patient appointments subscription fallback:', err);
    const fallbackQ = query(colRef, where('patientUid', '==', patientUid));
    return onSnapshot(fallbackQ, (snapshot) => {
      const list: AppointmentRecord[] = [];
      snapshot.forEach((d) => list.push({ id: d.id, ...(d.data() as Omit<AppointmentRecord, 'id'>) }));
      list.sort((a, b) => (b.appointmentDate || '').localeCompare(a.appointmentDate || ''));
      callback(list);
    });
  });
};

// Real-time listener for doctor/staff to see all appointments
export const subscribeToAllAppointments = (
  callback: (appointments: AppointmentRecord[]) => void
): Unsubscribe => {
  const colRef = collection(db, APPOINTMENTS_COLLECTION);
  const q = query(colRef, orderBy('createdAt', 'desc'));

  return onSnapshot(q, (snapshot) => {
    const list: AppointmentRecord[] = [];
    snapshot.forEach((doc) => {
      list.push({ id: doc.id, ...(doc.data() as Omit<AppointmentRecord, 'id'>) });
    });
    callback(list);
  }, (err) => {
    console.warn('All appointments subscription fallback:', err);
    return onSnapshot(colRef, (snapshot) => {
      const list: AppointmentRecord[] = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...(doc.data() as Omit<AppointmentRecord, 'id'>) });
      });
      list.sort((a, b) => (b.appointmentDate || '').localeCompare(a.appointmentDate || ''));
      callback(list);
    });
  });
};

// Doctor power: approve pending appointment and assign exact time slot
export const doctorApproveAndSetAppointmentTime = async (
  appointmentId: string,
  approvalData: {
    assignedTime: string;
    tokenNumber?: string;
    roomNumber?: string;
    preparationInstructions?: string;
    doctorNotes?: string;
    consultationFee?: number;
    paymentStatus?: 'pending' | 'paid' | 'pay_at_clinic' | 'emi_processing';
  }
) => {
  const docRef = doc(db, APPOINTMENTS_COLLECTION, appointmentId);
  const fee = approvalData.consultationFee ?? 400;
  const payStatus = approvalData.paymentStatus || 'pay_at_clinic';

  const updatePayload: Record<string, unknown> = {
    status: 'confirmed',
    assignedTime: approvalData.assignedTime,
    tokenNumber: approvalData.tokenNumber || `TKN-${Math.floor(100 + Math.random() * 900)}`,
    roomNumber: approvalData.roomNumber || 'OPD Chamber 01',
    preparationInstructions: approvalData.preparationInstructions || 'Please arrive 15 minutes before your allotted time.',
    doctorNotes: approvalData.doctorNotes || '',
    payment: {
      consultationFee: fee,
      totalAmount: fee,
      paymentStatus: payStatus,
      paidAt: payStatus === 'paid' ? new Date().toLocaleString() : null,
    },
    updatedAt: serverTimestamp(),
  };

  await setDoc(docRef, updatePayload, { merge: true });
};

// Doctor power: update patient vitals
export const doctorUpdatePatientVitals = async (
  appointmentId: string,
  vitals: PatientVitals
) => {
  const docRef = doc(db, APPOINTMENTS_COLLECTION, appointmentId);
  await setDoc(docRef, {
    vitals,
    updatedAt: serverTimestamp(),
  }, { merge: true });
};

// Doctor power: add previous report or lab finding
export const doctorAddPatientReport = async (
  appointmentId: string,
  existingReports: PatientReport[],
  newReport: PatientReport
) => {
  const docRef = doc(db, APPOINTMENTS_COLLECTION, appointmentId);
  await setDoc(docRef, {
    reports: [newReport, ...(existingReports || [])],
    updatedAt: serverTimestamp(),
  }, { merge: true });
};

// Doctor power: update payment details
export const doctorUpdatePayment = async (
  appointmentId: string,
  payment: PaymentDetails
) => {
  const docRef = doc(db, APPOINTMENTS_COLLECTION, appointmentId);
  await setDoc(docRef, {
    payment,
    updatedAt: serverTimestamp(),
  }, { merge: true });
};

// General status change
export const updateAppointmentStatus = async (
  appointmentId: string, 
  status: AppointmentRecord['status'],
  notes?: string
) => {
  const docRef = doc(db, APPOINTMENTS_COLLECTION, appointmentId);
  const updatePayload: Record<string, unknown> = {
    status,
    updatedAt: serverTimestamp(),
  };
  if (notes !== undefined) {
    updatePayload.doctorNotes = notes;
  }
  await setDoc(docRef, updatePayload, { merge: true });
};

export const cancelAppointment = async (appointmentId: string) => {
  return updateAppointmentStatus(appointmentId, 'cancelled');
};

export const deleteAppointmentRecord = async (appointmentId: string) => {
  const docRef = doc(db, APPOINTMENTS_COLLECTION, appointmentId);
  await deleteDoc(docRef);
};

// ================= INQUIRIES ================= //

export const submitContactInquiry = async (inquiry: Omit<InquiryRecord, 'id' | 'createdAt' | 'status'>): Promise<string> => {
  const colRef = collection(db, INQUIRIES_COLLECTION);
  const docRef = await addDoc(colRef, {
    ...inquiry,
    status: 'new',
    createdAt: serverTimestamp(),
  });
  return docRef.id;
};

export const subscribeToInquiries = (
  callback: (inquiries: InquiryRecord[]) => void
): Unsubscribe => {
  const colRef = collection(db, INQUIRIES_COLLECTION);
  const q = query(colRef, orderBy('createdAt', 'desc'));

  return onSnapshot(q, (snapshot) => {
    const list: InquiryRecord[] = [];
    snapshot.forEach((doc) => {
      list.push({ id: doc.id, ...(doc.data() as Omit<InquiryRecord, 'id'>) });
    });
    callback(list);
  }, (err) => {
    console.warn('Inquiries index warning:', err);
    return onSnapshot(colRef, (snapshot) => {
      const list: InquiryRecord[] = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...(doc.data() as Omit<InquiryRecord, 'id'>) });
      });
      callback(list);
    });
  });
};

export const updateInquiryStatus = async (inquiryId: string, status: InquiryRecord['status']) => {
  const docRef = doc(db, INQUIRIES_COLLECTION, inquiryId);
  await setDoc(docRef, { status, updatedAt: serverTimestamp() }, { merge: true });
};

// ================= REGISTERED PATIENTS DIRECTORY ================= //

export interface RegisteredPatientRecord {
  id?: string;
  uid: string;
  fullName: string;
  email: string;
  phone: string;
  dob?: string;
  gender?: string;
  registeredAt?: string;
  createdAt?: unknown;
}

const REGISTERED_PATIENTS_COLLECTION = 'registered_patients';

// Baseline demo patients if collection is new
const INITIAL_DEMO_PATIENTS: RegisteredPatientRecord[] = [
  {
    uid: 'pat-seed-1',
    fullName: 'Ramesh Balasaheb Patil',
    email: 'ramesh.patil92@gmail.com',
    phone: '+91 98223 45120',
    dob: '1984-06-14',
    gender: 'male',
    registeredAt: 'Today, 08:30 AM',
  },
  {
    uid: 'pat-seed-2',
    fullName: 'Sunita Ravindra Sharma',
    email: 'sunita.sharma@yahoo.com',
    phone: '+91 94230 78912',
    dob: '1991-03-22',
    gender: 'female',
    registeredAt: 'Today, 09:15 AM',
  },
  {
    uid: 'pat-seed-3',
    fullName: 'Ganesh Dnyaneshwar Kote',
    email: 'ganesh.kote@gmail.com',
    phone: '+91 95796 74964',
    dob: '1996-11-05',
    gender: 'male',
    registeredAt: 'Yesterday, 04:45 PM',
  },
];

export const saveRegisteredPatient = async (patient: Omit<RegisteredPatientRecord, 'id' | 'createdAt'>): Promise<string> => {
  const colRef = collection(db, REGISTERED_PATIENTS_COLLECTION);
  const docRef = doc(colRef, patient.uid);
  
  const now = new Date();
  const dateFormatted = now.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  await setDoc(docRef, {
    ...patient,
    registeredAt: patient.registeredAt || dateFormatted,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }, { merge: true });

  return docRef.id;
};

export const subscribeToRegisteredPatients = (
  callback: (patients: RegisteredPatientRecord[]) => void
): Unsubscribe => {
  const colRef = collection(db, REGISTERED_PATIENTS_COLLECTION);
  const q = query(colRef, orderBy('createdAt', 'desc'));

  return onSnapshot(q, (snapshot) => {
    const list: RegisteredPatientRecord[] = [];
    snapshot.forEach((docSnap) => {
      list.push({ id: docSnap.id, ...(docSnap.data() as Omit<RegisteredPatientRecord, 'id'>) });
    });
    
    // If no patients registered yet in database, show initial patients list
    if (list.length === 0) {
      callback(INITIAL_DEMO_PATIENTS);
    } else {
      callback(list);
    }
  }, (err) => {
    console.warn('Registered patients subscription fallback:', err);
    return onSnapshot(colRef, (snapshot) => {
      const list: RegisteredPatientRecord[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...(docSnap.data() as Omit<RegisteredPatientRecord, 'id'>) });
      });
      callback(list.length > 0 ? list : INITIAL_DEMO_PATIENTS);
    });
  });
};
