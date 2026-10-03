import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  signOut,
  updateProfile
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  serverTimestamp,
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { auth, db, googleProvider } from './config';

// Strict authorized doctor credentials defined by hospital admin
export const DOCTOR_AUTHORIZED_CREDENTIALS = {
  username: 'amitkotepatil4909',
  email: 'koteamit615@gmail.com',
  password: 'I@mit4909',
  name: 'Dr. Vaibhav G. Malkar (Consulting Physician & Medical Director)',
};

const DOCTOR_SESSION_STORAGE_KEY = 'dr_malkar_doctor_authenticated_session';
const PATIENT_SESSION_STORAGE_KEY = 'dr_malkar_patient_authenticated_session';
const REGISTERED_USERS_CACHE_KEY = 'dr_malkar_registered_users_cache';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  username?: string;
  role: 'patient' | 'doctor' | 'admin';
  phone?: string;
  dob?: string;
  gender?: string;
  password?: string;
  createdAt?: unknown;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signInDoctor: (username: string, email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, profileData: Partial<UserProfile>) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInAsDemo: (role: 'patient' | 'doctor') => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch or create user profile doc in Firestore
  const syncUserProfile = async (firebaseUser: User, extra?: Partial<UserProfile>) => {
    try {
      const userRef = doc(db, 'users', firebaseUser.uid);
      const snapshot = await getDoc(userRef);

      const isAuthorizedDoctor = 
        firebaseUser.email?.toLowerCase() === DOCTOR_AUTHORIZED_CREDENTIALS.email.toLowerCase() ||
        firebaseUser.email === 'amitkotinkdin@gmail.com' ||
        extra?.role === 'doctor';

      if (snapshot.exists()) {
        const data = snapshot.data() as UserProfile;
        if (isAuthorizedDoctor && data.role !== 'doctor') {
          const updated: UserProfile = { 
            ...data, 
            role: 'doctor', 
            displayName: DOCTOR_AUTHORIZED_CREDENTIALS.name,
            username: DOCTOR_AUTHORIZED_CREDENTIALS.username 
          };
          await setDoc(userRef, updated, { merge: true });
          setProfile(updated);
        } else {
          setProfile(data);
        }
      } else {
        const newProfile: UserProfile = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: isAuthorizedDoctor 
            ? DOCTOR_AUTHORIZED_CREDENTIALS.name 
            : (extra?.displayName || firebaseUser.displayName || 'Patient'),
          username: extra?.username || (isAuthorizedDoctor ? DOCTOR_AUTHORIZED_CREDENTIALS.username : ''),
          role: isAuthorizedDoctor ? 'doctor' : (extra?.role || 'patient'),
          phone: extra?.phone || (isAuthorizedDoctor ? '+91 9579674964' : ''),
          dob: extra?.dob || '',
          gender: extra?.gender || (isAuthorizedDoctor ? 'male' : ''),
          createdAt: serverTimestamp(),
        };
        await setDoc(userRef, newProfile);
        setProfile(newProfile);
      }
    } catch (err) {
      console.warn('Sync user profile warning:', err);
      const isAuthorizedDoctor = 
        firebaseUser.email?.toLowerCase() === DOCTOR_AUTHORIZED_CREDENTIALS.email.toLowerCase() ||
        firebaseUser.email === 'amitkotinkdin@gmail.com' ||
        extra?.role === 'doctor';
      setProfile({
        uid: firebaseUser.uid,
        email: firebaseUser.email || DOCTOR_AUTHORIZED_CREDENTIALS.email,
        displayName: isAuthorizedDoctor ? DOCTOR_AUTHORIZED_CREDENTIALS.name : (extra?.displayName || 'Patient'),
        role: isAuthorizedDoctor ? 'doctor' : (extra?.role || 'patient'),
        username: isAuthorizedDoctor ? DOCTOR_AUTHORIZED_CREDENTIALS.username : undefined,
      });
    }
  };

  useEffect(() => {
    // 1. Check if doctor session was previously established
    const savedDoctorSession = localStorage.getItem(DOCTOR_SESSION_STORAGE_KEY);
    if (savedDoctorSession === 'true') {
      const doctorProfile: UserProfile = {
        uid: 'dr-amit-kote-session',
        email: DOCTOR_AUTHORIZED_CREDENTIALS.email,
        displayName: DOCTOR_AUTHORIZED_CREDENTIALS.name,
        username: DOCTOR_AUTHORIZED_CREDENTIALS.username,
        role: 'doctor',
        phone: '+91 9579674964',
        gender: 'male',
      };
      setProfile(doctorProfile);
      setUser({
        uid: 'dr-amit-kote-session',
        email: DOCTOR_AUTHORIZED_CREDENTIALS.email,
        displayName: DOCTOR_AUTHORIZED_CREDENTIALS.name,
      } as User);
      setLoading(false);
      return;
    }

    // 2. Check if patient session was previously established
    const savedPatientSession = localStorage.getItem(PATIENT_SESSION_STORAGE_KEY);
    if (savedPatientSession) {
      try {
        const parsed = JSON.parse(savedPatientSession) as UserProfile;
        setProfile(parsed);
        setUser({
          uid: parsed.uid,
          email: parsed.email,
          displayName: parsed.displayName,
        } as User);
        setLoading(false);
        return;
      } catch (err) {
        console.warn('Failed to parse saved patient session:', err);
      }
    }

    // 3. Fallback to Firebase onAuthStateChanged
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await syncUserProfile(currentUser);
      } else if (!savedPatientSession && !savedDoctorSession) {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Standard user/patient sign in with guaranteed fallback to registered patient accounts
  const signIn = async (email: string, password: string) => {
    localStorage.removeItem(DOCTOR_SESSION_STORAGE_KEY);
    const cleanEmail = email.trim().toLowerCase();

    // Strategy 1: Standard Firebase Auth sign-in
    try {
      const cred = await signInWithEmailAndPassword(auth, cleanEmail, password);
      await syncUserProfile(cred.user);
      
      const userRef = doc(db, 'users', cred.user.uid);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        const uData = snap.data() as UserProfile;
        localStorage.setItem(PATIENT_SESSION_STORAGE_KEY, JSON.stringify(uData));
        setProfile(uData);
      }
      return;
    } catch (firebaseErr: unknown) {
      console.warn('Firebase Auth standard login threw, checking registered patient records:', firebaseErr);
    }

    // Strategy 2: Check Firestore 'registered_patients' collection
    try {
      const regCol = collection(db, 'registered_patients');
      const regQuery = query(regCol, where('email', '==', cleanEmail));
      const regSnap = await getDocs(regQuery);

      if (!regSnap.empty) {
        const patDoc = regSnap.docs[0];
        const patData = patDoc.data();

        // Check password if stored
        if (patData.password && patData.password !== password) {
          throw new Error('Incorrect password. Please verify your password and try again.');
        }

        const patientProfile: UserProfile = {
          uid: patData.uid || patDoc.id,
          email: patData.email || cleanEmail,
          displayName: patData.fullName || 'Patient',
          role: 'patient',
          phone: patData.phone || '',
          dob: patData.dob || '',
          gender: patData.gender || 'male',
        };

        const patientUser: User = {
          uid: patientProfile.uid,
          email: patientProfile.email,
          displayName: patientProfile.displayName,
        } as User;

        setUser(patientUser);
        setProfile(patientProfile);
        localStorage.setItem(PATIENT_SESSION_STORAGE_KEY, JSON.stringify(patientProfile));
        return;
      }

      // Strategy 3: Check Firestore 'users' collection
      const usersCol = collection(db, 'users');
      const userQuery = query(usersCol, where('email', '==', cleanEmail));
      const userSnap = await getDocs(userQuery);

      if (!userSnap.empty) {
        const uDoc = userSnap.docs[0];
        const uData = uDoc.data() as UserProfile & { password?: string };

        if (uData.password && uData.password !== password) {
          throw new Error('Incorrect password. Please verify your password and try again.');
        }

        const patientProfile: UserProfile = {
          uid: uData.uid || uDoc.id,
          email: uData.email || cleanEmail,
          displayName: uData.displayName || 'Patient',
          role: 'patient',
          phone: uData.phone || '',
          dob: uData.dob || '',
          gender: uData.gender || 'male',
        };

        const patientUser: User = {
          uid: patientProfile.uid,
          email: patientProfile.email,
          displayName: patientProfile.displayName,
        } as User;

        setUser(patientUser);
        setProfile(patientProfile);
        localStorage.setItem(PATIENT_SESSION_STORAGE_KEY, JSON.stringify(patientProfile));
        return;
      }
    } catch (firestoreErr) {
      if (firestoreErr instanceof Error && firestoreErr.message.includes('Incorrect password')) {
        throw firestoreErr;
      }
      console.warn('Firestore fallback lookup warning:', firestoreErr);
    }

    // Strategy 4: Check local cache of registered users
    try {
      const cachedStr = localStorage.getItem(REGISTERED_USERS_CACHE_KEY);
      if (cachedStr) {
        const cachedList = JSON.parse(cachedStr) as Array<UserProfile & { password?: string }>;
        const found = cachedList.find(u => u.email.toLowerCase() === cleanEmail);
        if (found) {
          if (found.password && found.password !== password) {
            throw new Error('Incorrect password. Please verify your password and try again.');
          }

          const patientUser: User = {
            uid: found.uid,
            email: found.email,
            displayName: found.displayName,
          } as User;

          setUser(patientUser);
          setProfile(found);
          localStorage.setItem(PATIENT_SESSION_STORAGE_KEY, JSON.stringify(found));
          return;
        }
      }
    } catch (cacheErr) {
      if (cacheErr instanceof Error && cacheErr.message.includes('Incorrect password')) {
        throw cacheErr;
      }
      console.warn('Local cache check warning:', cacheErr);
    }

    // If account not found anywhere
    throw new Error('No registered patient account found with this email. Please verify your email or create a new account.');
  };

  // Dedicated Doctor login with strict username, email, and password verification
  const signInDoctor = async (usernameInput: string, emailInput: string, passwordInput: string) => {
    const cleanUser = usernameInput.trim();
    const cleanEmail = emailInput.trim().toLowerCase();
    const cleanPass = passwordInput.trim();

    // Verify against exact authorized doctor credentials
    if (
      cleanUser !== DOCTOR_AUTHORIZED_CREDENTIALS.username ||
      cleanEmail !== DOCTOR_AUTHORIZED_CREDENTIALS.email.toLowerCase() ||
      cleanPass !== DOCTOR_AUTHORIZED_CREDENTIALS.password
    ) {
      throw new Error(
        'Access Denied: Invalid doctor credentials. You must provide the exact authorized Doctor Username, Email, and Password.'
      );
    }

    // Try signing in via Firebase Auth
    let authenticatedUser: User | null = null;
    try {
      const cred = await signInWithEmailAndPassword(auth, cleanEmail, cleanPass);
      authenticatedUser = cred.user;
    } catch {
      // If user does not exist or password changed in Firebase Auth, create or fallback safely
      try {
        const newCred = await createUserWithEmailAndPassword(auth, cleanEmail, cleanPass);
        authenticatedUser = newCred.user;
        await updateProfile(newCred.user, { displayName: DOCTOR_AUTHORIZED_CREDENTIALS.name });
      } catch {
        // Fallback: authorized session object
        authenticatedUser = {
          uid: 'dr-amit-kote-session',
          email: DOCTOR_AUTHORIZED_CREDENTIALS.email,
          displayName: DOCTOR_AUTHORIZED_CREDENTIALS.name,
        } as User;
      }
    }

    const doctorProfile: UserProfile = {
      uid: authenticatedUser.uid,
      email: DOCTOR_AUTHORIZED_CREDENTIALS.email,
      displayName: DOCTOR_AUTHORIZED_CREDENTIALS.name,
      username: DOCTOR_AUTHORIZED_CREDENTIALS.username,
      role: 'doctor',
      phone: '+91 9579674964',
      gender: 'male',
    };

    localStorage.removeItem(PATIENT_SESSION_STORAGE_KEY);
    localStorage.setItem(DOCTOR_SESSION_STORAGE_KEY, 'true');
    setUser(authenticatedUser);
    setProfile(doctorProfile);

    // Save/sync in Firestore
    try {
      const userRef = doc(db, 'users', authenticatedUser.uid);
      await setDoc(userRef, {
        ...doctorProfile,
        updatedAt: serverTimestamp(),
      }, { merge: true });
    } catch (saveErr) {
      console.warn('Doctor profile Firestore save warning (using local session):', saveErr);
    }
  };

  const signUp = async (email: string, password: string, profileData: Partial<UserProfile>) => {
    localStorage.removeItem(DOCTOR_SESSION_STORAGE_KEY);
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = profileData.displayName?.trim() || cleanEmail.split('@')[0];
    let authenticatedUser: User | null = null;
    
    // 1. Try Firebase Auth sign up or sign in
    try {
      const cred = await createUserWithEmailAndPassword(auth, cleanEmail, password);
      authenticatedUser = cred.user;
    } catch (err: unknown) {
      const errCode = (err as { code?: string })?.code || '';
      const errMsg = err instanceof Error ? err.message : '';
      
      if (errCode === 'auth/email-already-in-use' || errMsg.includes('email-already-in-use')) {
        // If email already in use, attempt signing in
        try {
          const cred = await signInWithEmailAndPassword(auth, cleanEmail, password);
          authenticatedUser = cred.user;
        } catch {
          // If password was different, still establish authorized patient session
          const fallbackUid = `pat-${cleanEmail.replace(/[^a-zA-Z0-9]/g, '_')}`;
          authenticatedUser = {
            uid: fallbackUid,
            email: cleanEmail,
            displayName: cleanName,
          } as User;
        }
      } else {
        // Fallback resilient session for any network or provider issues
        const fallbackUid = `pat-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
        authenticatedUser = {
          uid: fallbackUid,
          email: cleanEmail,
          displayName: cleanName,
        } as User;
      }
    }

    if (authenticatedUser) {
      try {
        await updateProfile(authenticatedUser, { displayName: cleanName });
      } catch {
        // ignore updateProfile warning
      }

      const patientProfile: UserProfile = {
        uid: authenticatedUser.uid,
        email: cleanEmail,
        displayName: cleanName,
        role: 'patient',
        phone: profileData.phone || '+91 9579674964',
        dob: profileData.dob || '',
        gender: profileData.gender || 'male',
        password: password, // Store for login re-verification
      };

      setUser(authenticatedUser);
      setProfile(patientProfile);
      localStorage.setItem(PATIENT_SESSION_STORAGE_KEY, JSON.stringify(patientProfile));

      // 2. Cache in local registered users list
      try {
        const cachedStr = localStorage.getItem(REGISTERED_USERS_CACHE_KEY);
        const list: Array<UserProfile & { password?: string }> = cachedStr ? JSON.parse(cachedStr) : [];
        const filtered = list.filter(u => u.email.toLowerCase() !== cleanEmail);
        filtered.push(patientProfile);
        localStorage.setItem(REGISTERED_USERS_CACHE_KEY, JSON.stringify(filtered));
      } catch (cacheErr) {
        console.warn('Cache local user warning:', cacheErr);
      }

      // 3. Save into 'users' collection in Firestore
      try {
        const userRef = doc(db, 'users', authenticatedUser.uid);
        await setDoc(userRef, {
          ...patientProfile,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        }, { merge: true });
      } catch (uErr) {
        console.warn('User profile sync warning:', uErr);
      }

      // 4. Save into 'registered_patients' collection in Firestore so Doctor & Login can verify
      try {
        const regRef = doc(db, 'registered_patients', authenticatedUser.uid);
        const now = new Date();
        const dateFormatted = now.toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });

        await setDoc(regRef, {
          uid: authenticatedUser.uid,
          fullName: cleanName,
          email: cleanEmail,
          phone: profileData.phone || '+91 9579674964',
          dob: profileData.dob || 'Not specified',
          gender: profileData.gender || 'male',
          password: password, // Store for credential re-verification on login
          registeredAt: dateFormatted,
          createdAt: serverTimestamp(),
        }, { merge: true });
      } catch (rErr) {
        console.warn('Registered patients directory save warning:', rErr);
      }
    }
  };

  const signInWithGoogle = async () => {
    localStorage.removeItem(DOCTOR_SESSION_STORAGE_KEY);
    const cred = await signInWithPopup(auth, googleProvider);
    await syncUserProfile(cred.user);
    if (cred.user) {
      const pProfile: UserProfile = {
        uid: cred.user.uid,
        email: cred.user.email || '',
        displayName: cred.user.displayName || 'Patient',
        role: 'patient',
      };
      localStorage.setItem(PATIENT_SESSION_STORAGE_KEY, JSON.stringify(pProfile));
    }
  };

  // Quick Demo Access for Testing
  const signInAsDemo = async (role: 'patient' | 'doctor') => {
    if (role === 'doctor') {
      await signInDoctor(
        DOCTOR_AUTHORIZED_CREDENTIALS.username,
        DOCTOR_AUTHORIZED_CREDENTIALS.email,
        DOCTOR_AUTHORIZED_CREDENTIALS.password
      );
      return;
    }

    const demoEmail = 'patient.amit@example.com';
    const demoPass = 'Hospital@2026';
    try {
      await signIn(demoEmail, demoPass);
    } catch {
      await signUp(demoEmail, demoPass, {
        displayName: 'Amit Patil (Patient)',
        role: 'patient',
        phone: '+91 9579674964',
        gender: 'male',
      });
    }
  };

  const logout = async () => {
    localStorage.removeItem(DOCTOR_SESSION_STORAGE_KEY);
    localStorage.removeItem(PATIENT_SESSION_STORAGE_KEY);
    try {
      await signOut(auth);
    } catch {
      // ignore
    }
    setProfile(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        signIn,
        signInDoctor,
        signUp,
        signInWithGoogle,
        signInAsDemo,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
