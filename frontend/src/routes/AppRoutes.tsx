import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';
import { OtpVerifyPage } from '../pages/auth/OtpVerifyPage';
import { UnauthorizedPage } from '../pages/auth/UnauthorizedPage';

import { PatientDashboard } from '../pages/dashboards/PatientDashboard';
import { DoctorDashboard } from '../pages/dashboards/DoctorDashboard';
import { HospitalDashboard } from '../pages/dashboards/HospitalDashboard';
import { LabDashboard } from '../pages/dashboards/LabDashboard';
import { PharmacyDashboard } from '../pages/dashboards/PharmacyDashboard';
import { BloodBankDashboard } from '../pages/dashboards/BloodBankDashboard';
import { AdminDashboard } from '../pages/dashboards/AdminDashboard';

import { ProfilePage } from '../pages/ProfilePage';
import { RecordsPage } from '../pages/RecordsPage';
import { ReportsPage } from '../pages/ReportsPage';
import { MedicinesPage } from '../pages/MedicinesPage';
import { MessagesPage } from '../pages/MessagesPage';
import { SettingsPage } from '../pages/SettingsPage';
import { ConsentPage } from '../pages/ConsentPage';
import { NotificationsPage } from '../pages/NotificationsPage';
import { AccessActivityPage } from '../pages/AccessActivityPage';
import { NotFoundPage } from '../pages/NotFoundPage';

// Phase 6 Imports
import { DoctorDirectoryPage } from '../pages/doctors/DoctorDirectoryPage';
import { HospitalDirectoryPage } from '../pages/hospitals/HospitalDirectoryPage';
import { DoctorProfileManagePage } from '../pages/provider/DoctorProfileManagePage';
import { HospitalProfileManagePage } from '../pages/provider/HospitalProfileManagePage';
import { ProviderVerificationPage } from '../pages/admin/ProviderVerificationPage';

// Phase 7 Imports
import { AppointmentsPage } from '../pages/appointments/AppointmentsPage';
import { BookAppointmentPage } from '../pages/appointments/BookAppointmentPage';
import { DoctorAppointmentsPage } from '../pages/appointments/DoctorAppointmentsPage';
import { ConsultationPage } from '../pages/appointments/ConsultationPage';

// Phase 8 Imports
import { MedicationPage } from '../pages/medications/MedicationPage';
import { PrescriptionPage } from '../pages/prescriptions/PrescriptionPage';

// Phase 9 Imports
import { ChatPage } from '../pages/chat/ChatPage';

import { ProtectedRoute } from './ProtectedRoute';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/verify-otp" element={<OtpVerifyPage />} />

      {/* Main Layout & Role Protected Dashboards */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        
        {/* 7 Role Dashboard Shells */}
        <Route
          path="dashboard"
          element={
            <ProtectedRoute allowedRoles={['PATIENT']}>
              <PatientDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="doctor/dashboard"
          element={
            <ProtectedRoute allowedRoles={['DOCTOR']}>
              <DoctorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="hospital/dashboard"
          element={
            <ProtectedRoute allowedRoles={['HOSPITAL_ADMIN', 'HOSPITAL_STAFF']}>
              <HospitalDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="lab/dashboard"
          element={
            <ProtectedRoute allowedRoles={['LAB']}>
              <LabDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="pharmacy/dashboard"
          element={
            <ProtectedRoute allowedRoles={['PHARMACY']}>
              <PharmacyDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="blood-bank/dashboard"
          element={
            <ProtectedRoute allowedRoles={['BLOOD_BANK']}>
              <BloodBankDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={['SYSTEM_ADMIN']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Phase 6 Provider Ecosystem Routes */}
        <Route path="doctors" element={<DoctorDirectoryPage />} />
        <Route path="hospitals" element={<HospitalDirectoryPage />} />
        
        <Route
          path="doctor/profile/manage"
          element={
            <ProtectedRoute allowedRoles={['DOCTOR']}>
              <DoctorProfileManagePage />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="hospital/profile/manage"
          element={
            <ProtectedRoute allowedRoles={['HOSPITAL_ADMIN', 'HOSPITAL_STAFF']}>
              <HospitalProfileManagePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="admin/provider-verification"
          element={
            <ProtectedRoute allowedRoles={['SYSTEM_ADMIN']}>
              <ProviderVerificationPage />
            </ProtectedRoute>
          }
        />

        {/* Phase 7 Appointments & Consultations Routes */}
        <Route
          path="appointments"
          element={
            <ProtectedRoute allowedRoles={['PATIENT']}>
              <AppointmentsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="appointments/book"
          element={
            <ProtectedRoute allowedRoles={['PATIENT']}>
              <BookAppointmentPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="doctor/appointments"
          element={
            <ProtectedRoute allowedRoles={['DOCTOR']}>
              <DoctorAppointmentsPage />
            </ProtectedRoute>
          }
        />
        <Route path="consultations/:id" element={<ConsultationPage />} />

        {/* Phase 8 Medication & Prescription Routes */}
        <Route path="medications" element={<MedicationPage />} />
        <Route path="prescriptions" element={<PrescriptionPage />} />

        {/* Phase 9 Secure Chat Routes */}
        <Route path="chat" element={<ChatPage />} />
        <Route path="chat/:conversationId" element={<ChatPage />} />

        {/* Phase 0 Preserved Placeholder Pages */}
        <Route path="profile" element={<ProfilePage />} />
        <Route path="records" element={<RecordsPage />} />
        <Route path="consents" element={<ConsentPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="access-activity" element={<AccessActivityPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="medicines" element={<MedicinesPage />} />
        <Route path="messages" element={<MessagesPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="unauthorized" element={<UnauthorizedPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};
