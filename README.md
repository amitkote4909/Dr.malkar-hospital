# Dr. Malkar Hospital - Modern Web Application

A full-featured, responsive hospital management and patient consultation web application for **Dr. Malkar Hospital**, Rahata.

---

## 🌟 Key Features

1. **Patient Booking & OPD Flow**:
   - Live doctor consultation appointment booking with preferred department & date.
   - Comprehensive payment methods:
     - **Online UPI QR scanner** with 12-digit UTR reference recording.
     - **Pay at Hospital Reception Counter**.
     - **0% Medical Care EMI** with instant partner tenure calculation (Bajaj Finserv, HDFC, SBI).
2. **Doctor & Administration Portal**:
   - Live appointments queue powered by Firebase Firestore live listeners.
   - 1-click consultation time slot and clinic token number allocation (`TKN-xxx`, OPD Chamber).
   - Real-time patient payment dossier viewer (patient payment status, UTR reference, EMI applicant details, counter collection status).
   - In-app Patient Vitals Tracker (Blood Pressure, Pulse, Blood Sugar, SpO2, Temperature).
   - Diagnostic Laboratory Report verifier and archiver.
3. **Patient Portal**:
   - Real-time status tracker (Pending Doctor Review, Allotted Time Slot, OPD Chamber, Token Pass).
   - Downloadable & Printable Appointment Pass.
   - Complete medical records and vital signs archive.
4. **Departments & Doctors Directory**:
   - General Medicine (Lead Doctor: Dr. Vaibhav G. Malkar - Main Administrator & Medical Director).
   - Orthopedics (Dr. Suresh Deshmukh).
   - Dental Care (Dr. Rajesh Patil - Dental Surgeon & Oral Specialist).
   - Surgery & Trauma Care (Dr. Anjali Deshpande - Consultant Trauma Surgeon & Critical Care Specialist).
   - Cardiology & Preventive Care.

---

## 💻 How to Deploy & Run on Localhost

### 1. Prerequisites
Ensure you have the following installed on your computer:
* **Node.js**: v18.0.0 or higher (v20+ recommended) -> [Download Node.js](https://nodejs.org/)
* **npm**: v9+ (comes pre-bundled with Node.js)

Verify in your terminal:
```bash
node -v
npm -v
```

---

### 2. Extract the Source Code
Unzip the downloaded `dr-malkar-hospital-source.zip` file into a folder on your computer:
```bash
# On Mac/Linux:
unzip dr-malkar-hospital-source.zip -d dr-malkar-hospital
cd dr-malkar-hospital

# On Windows:
# Right-click dr-malkar-hospital-source.zip -> "Extract All..." -> Open extracted folder in Terminal / Command Prompt
```

---

### 3. Install Dependencies
In the root directory of the project, run:
```bash
npm install
```

---

### 4. Start the Local Development Server
Run the following command to start the Vite local development server:
```bash
npm run dev
```

Open your browser and navigate to:
👉 **`http://localhost:3000`**

The app is now running live on your localhost with instant hot-reloading!

---

### 5. Production Build & Server (Optional)
To test the optimized production build locally:
```bash
# Build the production bundle
npm run build

# Start the Express production server
npm start
```
The production server will listen on `http://localhost:3000`.

---

## 🔐 Authorized Doctor Portal Credentials
To access the Doctor & OPD Administration Portal:
* **Doctor Username**: `amitkote4909`
* **Doctor Email**: `koteamit651@gmail.com`
* **Security Password**: `I@mit4909`
* **Lead Doctor Display**: Dr. Vaibhav G. Malkar (Main Administrator & Medical Director)

---

## 📁 Project Structure
```
├── package.json          # Node dependencies & run scripts
├── vite.config.ts        # Vite & Tailwind CSS plugins
├── server.js             # Express production server
├── index.html            # Main HTML document & SEO tags
├── src/
│   ├── main.tsx          # Application entry point
│   ├── App.tsx           # Page router and layout shell
│   ├── index.css         # Tailwind CSS imports and design system
│   ├── components/
│   │   ├── Header.tsx    # Header navbar with role indicator & portal badge
│   │   └── Footer.tsx    # Footer with quick links & 24/7 hotline
│   ├── data/
│   │   └── hospitalData.ts # Hospital info, doctors, and departments
│   ├── firebase/
│   │   ├── config.ts     # Firebase SDK initialization
│   │   ├── authContext.tsx # Firebase Auth & session management
│   │   └── dbService.ts  # Firestore database operations & live listeners
│   └── pages/
│       ├── HomePage.tsx
│       ├── AboutPage.tsx
│       ├── DoctorsPage.tsx
│       ├── DepartmentsPage.tsx
│       ├── ServicesPage.tsx
│       ├── AppointmentPage.tsx
│       ├── DoctorPortalPage.tsx
│       ├── PatientPortalPage.tsx
│       ├── DashboardPage.tsx
│       ├── ContactPage.tsx
│       ├── LoginPage.tsx
│       └── RegisterPage.tsx
```

---

## ☁️ Firebase Backend Configuration
The project is pre-configured with Google Cloud Firebase Firestore and Authentication in `src/firebase/config.ts`.
All appointments, vitals, lab reports, and doctor slot confirmations sync automatically in real-time.
