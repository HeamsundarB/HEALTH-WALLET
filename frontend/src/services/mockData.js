export const initialData = {
  // Current logged in patient (Default: கார்த்திகா / Karthika)
  patientProfile: {
    id: "PAT-1001",
    name: "கார்த்திகா (Karthika R.)",
    phone: "+91 98401 23456",
    simulatedAadhaar: "XXXX-XXXX-7812",
    hwId: "HW-8842-9910-TN",
    abhaId: "91-2384-5920-1102",
    bloodGroup: "O +ve",
    dob: "1994-06-15",
    gender: "Female",
    city: "Chennai, Tamil Nadu",
    allergies: ["Penicillin", "Dust Mites"],
    criticalConditions: ["Type 2 Diabetes Mellitus", "Hypertension"],
    emergencyContact: "சரவணன் (Saravanan - Spouse) • +91 98402 88990",
    abhaLinked: true,
    verificationStatus: "Verified Identity"
  },

  // Doctors Directory
  doctors: [
    {
      id: "DOC-2001",
      name: "டாக்டர் அருண்குமார் (Dr. Arunkumar M.)",
      profId: "TNC-MD-88219",
      specialization: "Cardiologist & Internal Medicine",
      qualification: "MD, DM (Cardiology) - MMC Chennai",
      experience: "14 Years",
      hospital: "காவேரி மருத்துவமனை (Kauvery Hospital)",
      verified: true,
      rating: 4.9,
      availability: "Mon-Sat: 10:00 AM - 4:00 PM",
      photo: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&auto=format&fit=crop&q=80",
      certifications: ["Fellow of Indian College of Cardiology", "Certified Heart Failure Specialist"],
      achievements: ["Best Clinical Research Award 2024", "Pioneer in Preventive Cardiology"],
      recentUpdates: "Advancing digital health tracking for post-op cardiac care in Tamil Nadu."
    },
    {
      id: "DOC-2002",
      name: "டாக்டர் பிரியதர்ஷினி (Dr. Priyadharshini S.)",
      profId: "TNC-MD-44912",
      specialization: "Endocrinologist & Diabetologist",
      qualification: "MBBS, MD (General Medicine)",
      experience: "9 Years",
      hospital: "அன்னை மருத்துவ மையம் (Annai Medical Centre)",
      verified: true,
      rating: 4.8,
      availability: "Mon-Fri: 2:00 PM - 7:00 PM",
      photo: "https://images.unsplash.com/photo-1594824813571-24a69c100d37?w=300&auto=format&fit=crop&q=80",
      certifications: ["Diabetic Care Specialist (UK Diploma)", "Thyroid Disorder Fellow"],
      achievements: ["Published 12 papers on South Asian Glycemic Control"],
      recentUpdates: "Dietary habits and HbA1c management guidelines released."
    },
    {
      id: "DOC-2003",
      name: "டாக்டர் கௌதம் (Dr. Gowtham V.)",
      profId: "TNC-MS-11029",
      specialization: "Orthopedic Surgeon",
      qualification: "MS (Ortho), DNB",
      experience: "11 Years",
      hospital: "ஸ்ரீ அமுதா மருத்துவமனை (Sri Amudha Hospital)",
      verified: true,
      rating: 4.7,
      availability: "Tue-Sat: 11:00 AM - 5:00 PM",
      photo: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=300&auto=format&fit=crop&q=80",
      certifications: ["Arthroscopy Specialist", "Joint Replacement Fellow"],
      achievements: ["500+ Successful Knee Surgeries"],
      recentUpdates: "Minimally invasive ligament repair techniques now available."
    }
  ],

  // Hospitals Directory
  hospitals: [
    {
      id: "HOSP-3001",
      name: "காவேரி மருத்துவமனை (Kauvery Hospital)",
      regNo: "TN-HOSP-9901",
      verified: true,
      city: "Chennai",
      address: "Mylapore, Chennai - 600004",
      departments: ["Cardiology", "Neurology", "General Surgery", "Oncology", "Diabetology"],
      emergencyNumber: "044-2499-0000",
      rating: 4.9
    },
    {
      id: "HOSP-3002",
      name: "அன்னை மருத்துவ மையம் (Annai Medical Centre)",
      regNo: "TN-HOSP-4112",
      verified: true,
      city: "Madurai",
      address: "KK Nagar, Madurai - 625020",
      departments: ["Endocrinology", "Pediatrics", "Gynecology"],
      emergencyNumber: "0452-253-1122",
      rating: 4.7
    },
    {
      id: "HOSP-3003",
      name: "நலம் ஹெல்த் சென்டர் (Nalam Health Center)",
      regNo: "TN-HOSP-7820",
      verified: true,
      city: "Coimbatore",
      address: "RS Puram, Coimbatore - 641002",
      departments: ["General Practice", "Diagnostics", "Wellness"],
      emergencyNumber: "0422-432-8800",
      rating: 4.8
    }
  ],

  // Medical Timeline Records (2022 -> 2026)
  timelineRecords: [
    {
      id: "REC-2026-02",
      date: "2026-02-14",
      year: "2026",
      type: "Lab Report",
      title: "Comprehensive Lipid Profile & HbA1c Test",
      hospital: "காவேரி மருத்துவமனை (Kauvery Hospital)",
      doctor: "டாக்டர் பிரியதர்ஷினி (Dr. Priyadharshini S.)",
      source: "Verified Laboratory",
      sourceType: "Lab",
      verificationStatus: "Verified",
      classification: "CRITICAL",
      details: "HbA1c: 6.8% (Controlled). Total Cholesterol: 185 mg/dL. Triglycerides: 140 mg/dL.",
      prescriptions: ["Metformin 500mg"],
      hasDuplicate: true,
      duplicateCount: 2
    },
    {
      id: "REC-2025-11",
      date: "2025-11-20",
      year: "2025",
      type: "Consultation",
      title: "Routine Cardiac & Hypertension Review",
      hospital: "காவேரி மருத்துவமனை (Kauvery Hospital)",
      doctor: "டாக்டர் அருண்குமார் (Dr. Arunkumar M.)",
      source: "Doctor",
      sourceType: "Doctor",
      verificationStatus: "Verified",
      classification: "NORMAL",
      details: "BP recorded at 128/82 mmHg. ECG shows normal sinus rhythm. Advised salt restriction and regular walk.",
      prescriptions: ["Telmisartan 40mg", "Atorvastatin 10mg"]
    },
    {
      id: "REC-2024-08",
      date: "2024-08-05",
      year: "2024",
      type: "Surgery / Procedure",
      title: "Laparoscopic Appendectomy",
      hospital: "ஸ்ரீ அமுதா மருத்துவமனை (Sri Amudha Hospital)",
      doctor: "டாக்டர் கௌதம் (Dr. Gowtham V.)",
      source: "Hospital Discharge Summary",
      sourceType: "Hospital",
      verificationStatus: "Verified",
      classification: "CRITICAL",
      details: "Successful uncomplicated laparoscopic appendectomy. Discharged after 48 hours observation.",
      prescriptions: ["Amoxicillin 500mg (Completed)", "Paracetamol 650mg (Completed)"]
    },
    {
      id: "REC-2023-05",
      date: "2023-05-12",
      year: "2023",
      type: "Diagnosis",
      title: "Initial Type 2 Diabetes Mellitus Diagnosis",
      hospital: "அன்னை மருத்துவ மையம் (Annai Medical Centre)",
      doctor: "டாக்டர் பிரியதர்ஷினி (Dr. Priyadharshini S.)",
      source: "Hospital Record",
      sourceType: "Hospital",
      verificationStatus: "Verified",
      classification: "CRITICAL",
      details: "Fasting Blood Sugar: 168 mg/dL. PPBS: 230 mg/dL. Initiated lifestyle changes + Metformin.",
      prescriptions: ["Metformin 500mg"]
    },
    {
      id: "REC-2022-01",
      date: "2022-01-18",
      year: "2022",
      type: "Consultation",
      title: "General Master Health Checkup & Allergy Evaluation",
      hospital: "நலம் ஹெல்த் சென்டர் (Nalam Health Center)",
      doctor: "டாக்டர் அருண்குமார் (Dr. Arunkumar M.)",
      source: "Patient Self Upload",
      sourceType: "Patient",
      verificationStatus: "Patient Added (Pending Verification)",
      classification: "NORMAL",
      details: "Routine checkup. Confirmed Penicillin allergy reaction in past childhood records.",
      prescriptions: []
    }
  ],

  // 3 Medication Categories (EXACT THREE CATEGORIES)
  medicines: [
    // 1. RECENTLY STARTED
    {
      id: "MED-101",
      name: "Telmisartan (டெல்மிசார்ட்டன்)",
      category: "recently_started",
      dosage: "40 mg",
      frequency: "Once Daily (Morning after food)",
      startDate: "2025-11-20",
      stopDate: "-",
      doctor: "டாக்டர் அருண்குமார் (Dr. Arunkumar M.)",
      hospital: "காவேரி மருத்துவமனை (Kauvery Hospital)",
      status: "Active",
      reminder: true,
      notes: "Blood pressure control"
    },
    {
      id: "MED-102",
      name: "Atorvastatin (அடோர்வாஸ்டேட்டின்)",
      category: "recently_started",
      dosage: "10 mg",
      frequency: "Once Daily (Night)",
      startDate: "2025-11-20",
      stopDate: "-",
      doctor: "டாக்டர் அருண்குமார் (Dr. Arunkumar M.)",
      hospital: "காவேரி மருத்துவமனை (Kauvery Hospital)",
      status: "Active",
      reminder: true,
      notes: "Lipid management"
    },

    // 2. RECENTLY STOPPED / PAST
    {
      id: "MED-201",
      name: "Amoxicillin (அமோக்சிசிலின்)",
      category: "recently_stopped",
      dosage: "500 mg",
      frequency: "Thrice Daily",
      startDate: "2024-08-05",
      stopDate: "2024-08-12",
      doctor: "டாக்டர் கௌதம் (Dr. Gowtham V.)",
      hospital: "ஸ்ரீ அமுதா மருத்துவமனை (Sri Amudha Hospital)",
      status: "Completed Course",
      reminder: false,
      notes: "Post-surgery antibiotic course completed"
    },
    {
      id: "MED-202",
      name: "Paracetamol (பாரசிட்டமால்)",
      category: "recently_stopped",
      dosage: "650 mg",
      frequency: "As needed for pain",
      startDate: "2024-08-05",
      stopDate: "2024-08-10",
      doctor: "டாக்டர் கௌதம் (Dr. Gowtham V.)",
      hospital: "ஸ்ரீ அமுதா மருத்துவமனை (Sri Amudha Hospital)",
      status: "Stopped",
      reminder: false,
      notes: "Pain relief after appendectomy"
    },

    // 3. LONG-TERM / ONGOING
    {
      id: "MED-301",
      name: "Metformin Glycomet (மெட்ஃபார்மின்)",
      category: "long_term",
      dosage: "500 mg SR",
      frequency: "Twice Daily (Breakfast & Dinner)",
      startDate: "2023-05-12",
      stopDate: "Ongoing",
      doctor: "டாக்டர் பிரியதர்ஷினி (Dr. Priyadharshini S.)",
      hospital: "அன்னை மருத்துவ மையம் (Annai Medical Centre)",
      status: "Active Ongoing",
      reminder: true,
      notes: "Long-term Glycemic management for Diabetes Type 2"
    },
    {
      id: "MED-302",
      name: "Vitamin D3 Cholecalciferol (வைட்டமின் D3)",
      category: "long_term",
      dosage: "60,000 IU",
      frequency: "Once a week (Sundays)",
      startDate: "2023-01-10",
      stopDate: "Ongoing",
      doctor: "டாக்டர் பிரியதர்ஷினி (Dr. Priyadharshini S.)",
      hospital: "நலம் ஹெல்த் சென்டர் (Nalam Health Center)",
      status: "Active Ongoing",
      reminder: true,
      notes: "Weekly bone health supplement"
    }
  ],

  // Lab & Scan Reports with Duplicate Detection Metadata
  reports: [
    {
      id: "REP-901",
      name: "HbA1c & Fasting Blood Sugar Report",
      date: "2026-02-14",
      patientName: "கார்த்திகா (Karthika R.)",
      patientHwId: "HW-8842-9910-TN",
      source: "Nalam Diagnostics Lab",
      doctor: "டாக்டர் பிரியதர்ஷினி (Dr. Priyadharshini S.)",
      type: "Blood Test",
      verificationStatus: "Verified",
      fileUrl: "#",
      fileSize: "1.4 MB",
      isPrimary: true,
      linkedSources: [
        { sourceName: "Nalam Diagnostics (Direct Lab Upload)", date: "2026-02-14 09:30 AM", verified: true },
        { sourceName: "Kauvery Hospital OPD (Hospital Record Integration)", date: "2026-02-14 11:15 AM", verified: true }
      ]
    },
    {
      id: "REP-902",
      name: "12-Lead Electrocardiogram (ECG)",
      date: "2025-11-20",
      patientName: "கார்த்திகா (Karthika R.)",
      patientHwId: "HW-8842-9910-TN",
      source: "Kauvery Hospital Cardiology Lab",
      doctor: "டாக்டர் அருண்குமார் (Dr. Arunkumar M.)",
      type: "ECG Scan",
      verificationStatus: "Verified",
      fileUrl: "#",
      fileSize: "2.8 MB",
      isPrimary: true,
      linkedSources: [
        { sourceName: "Kauvery Hospital Cardiology Dept", date: "2025-11-20 10:45 AM", verified: true }
      ]
    },
    {
      id: "REP-903",
      name: "Abdominal Ultrasound Scan Report",
      date: "2024-08-04",
      patientName: "கார்த்திகா (Karthika R.)",
      patientHwId: "HW-8842-9910-TN",
      source: "Patient Self Upload",
      doctor: "டாக்டர் கௌதம் (Dr. Gowtham V.)",
      type: "Ultrasound Scan",
      verificationStatus: "Patient Added (Pending Verification)",
      fileUrl: "#",
      fileSize: "4.1 MB",
      isPrimary: true,
      linkedSources: [
        { sourceName: "Patient Mobile Scan Upload", date: "2024-08-04 04:20 PM", verified: false }
      ]
    }
  ],

  // Who Viewed My Records? (Primary Access Transparency Log)
  accessLogs: [
    {
      id: "ACC-5001",
      doctorName: "டாக்டர் அருண்குமார் (Dr. Arunkumar M.)",
      profId: "TNC-MD-88219",
      hospital: "காவேரி மருத்துவமனை (Kauvery Hospital)",
      date: "2026-02-28",
      time: "11:14 AM",
      recordsAccessed: "Medicines + Lab Reports",
      purpose: "OPD Follow-up Consultation",
      accessType: "Authorized (Consent Active)",
      isEmergency: false,
      sensitiveAccessed: false
    },
    {
      id: "ACC-5002",
      doctorName: "டாக்டர் பிரியதர்ஷினி (Dr. Priyadharshini S.)",
      profId: "TNC-MD-44912",
      hospital: "அன்னை மருத்துவ மையம் (Annai Medical Centre)",
      date: "2026-02-14",
      time: "02:30 PM",
      recordsAccessed: "HbA1c & Diabetic History",
      purpose: "Routine Diabetes Review",
      accessType: "Authorized (Consent Active)",
      isEmergency: false,
      sensitiveAccessed: false
    },
    {
      id: "ACC-5003",
      doctorName: "டாக்டர் கௌதம் (Dr. Gowtham V.)",
      profId: "TNC-MS-11029",
      hospital: "ஸ்ரீ அமுதா மருத்துவமனை (Sri Amudha Hospital)",
      date: "2024-08-05",
      time: "03:45 AM",
      recordsAccessed: "CRITICAL Summary (Blood Group, Allergies, Surgeries)",
      purpose: "Acute Abdominal Pain Emergency Admission",
      accessType: "Emergency Break-Glass Override",
      isEmergency: true,
      sensitiveAccessed: false,
      emergencyReason: "Patient admitted with acute abdominal pain in emergency ward. Verified critical allergies prior to surgery."
    }
  ],

  // Consents Setup
  consents: [
    {
      id: "CNS-701",
      doctorId: "DOC-2001",
      doctorName: "டாக்டர் அருண்குமார் (Dr. Arunkumar M.)",
      hospital: "காவேரி மருத்துவமனை",
      scope: ["Reports", "Medicines", "Timeline"],
      grantedDate: "2026-02-20",
      expiryDate: "2026-03-20",
      status: "Active",
      durationText: "30 Days"
    },
    {
      id: "CNS-702",
      doctorId: "DOC-2002",
      doctorName: "டாக்டர் பிரியதர்ஷினி (Dr. Priyadharshini S.)",
      hospital: "அன்னை மருத்துவ மையம்",
      scope: ["Medicines", "Reports"],
      grantedDate: "2026-02-10",
      expiryDate: "2026-02-17",
      status: "Expired",
      durationText: "7 Days"
    }
  ],

  // Appointments
  appointments: [
    {
      id: "APT-801",
      doctorName: "டாக்டர் அருண்குமார் (Dr. Arunkumar M.)",
      doctorSpecialization: "Cardiology",
      hospital: "காவேரி மருத்துவமனை (Kauvery Hospital)",
      date: "2026-09-10",
      time: "10:30 AM",
      type: "In-Person Consultation",
      status: "Confirmed",
      symptoms: "Quarterly BP & Heart Health Evaluation"
    },
    {
      id: "APT-802",
      doctorName: "டாக்டர் பிரியதர்ஷினி (Dr. Priyadharshini S.)",
      doctorSpecialization: "Endocrinology & Diabetology",
      hospital: "அன்னை மருத்துவ மையம் (Annai Medical Centre)",
      date: "2026-09-18",
      time: "03:15 PM",
      type: "Follow-up Visit",
      status: "Scheduled",
      symptoms: "HbA1c & Fasting Glucose Review"
    }
  ],

  // Chat Messages
  chats: [
    {
      id: "CHAT-1",
      participant: "டாக்டர் அருண்குமார் (Dr. Arunkumar M.)",
      role: "Doctor",
      unread: 0,
      messages: [
        { sender: "doctor", text: "வணக்கம் கார்த்திகா. Hello Karthika, how are your BP readings this week?", timestamp: "Yesterday 10:15 AM" },
        { sender: "patient", text: "வணக்கம் டாக்டர்! Average BP is 125/80. Taking Telmisartan 40mg daily morning without fail.", timestamp: "Yesterday 10:30 AM" },
        { sender: "doctor", text: "Excellent. Keep following the diet. Let's review during your upcoming visit on Sept 10.", timestamp: "Yesterday 10:35 AM" }
      ]
    },
    {
      id: "CHAT-2",
      participant: "காவேரி மருத்துவமனை (Kauvery Hospital OPD)",
      role: "Hospital",
      unread: 1,
      messages: [
        { sender: "hospital", text: "Your upcoming appointment with Dr. Arunkumar on 10th Sept at 10:30 AM is confirmed.", timestamp: "Today 08:00 AM" }
      ]
    }
  ],

  // Notifications
  notificationsList: [
    {
      id: "NOTIF-1",
      title: "Dr. Arunkumar accessed your Health Wallet",
      message: "Dr. Arunkumar (Kauvery Hospital) viewed Medicines & Reports for OPD Consultation.",
      time: "Today 11:14 AM",
      type: "access",
      read: false
    },
    {
      id: "NOTIF-2",
      title: "New Lab Report Linked to Health Wallet",
      message: "Nalam Diagnostics uploaded 'HbA1c & Lipid Profile Report'. Primary timeline updated.",
      time: "14 Feb 2026",
      type: "report",
      read: true
    },
    {
      id: "NOTIF-3",
      title: "Appointment Reminder",
      message: "Cardiology follow-up appointment scheduled at Kauvery Hospital on Sept 10.",
      time: "2 Days ago",
      type: "appointment",
      read: true
    }
  ],

  // Unauthorized Access Reports Queue for Admin
  unauthorizedReports: [
    {
      id: "UAR-9901",
      patientHwId: "HW-8842-9910-TN",
      patientName: "கார்த்திகா (Karthika R.)",
      accessId: "ACC-5001",
      doctorName: "Dr. Unknown / Unverified",
      hospital: "Unlinked Clinic",
      dateReported: "2026-02-28",
      reason: "Doctor viewed my full report timeline outside scheduled consultation hours.",
      status: "Under Investigation"
    }
  ]
};
