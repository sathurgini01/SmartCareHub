import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from '../components/common/ProtectedRoute';
import AdminProfilePage from '../pages/admin/AdminProfilePage';
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
import AllDoctorsPage from '../pages/admin/AllDoctorsPage';
import VerifyDoctorsPage from '../pages/admin/VerifyDoctorsPage';
import AuthPage from '../pages/auth/AuthPage';
import AppointmentsPage from '../pages/doctor/AppointmentsPage';
import AvailabilityPage from '../pages/doctor/AvailabilityPage';
import DoctorDashboardPage from '../pages/doctor/DoctorDashboardPage';
import DoctorProfilePage from '../pages/doctor/DoctorProfilePage';
import PrescriptionsPage from '../pages/doctor/PrescriptionsPage';
import ReportsPage from '../pages/doctor/ReportsPage';
import TelemedicinePage from '../pages/doctor/TelemedicinePage';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<AuthPage />} />

      <Route
        path="/doctor/dashboard"
        element={
          <ProtectedRoute role="doctor">
            <DoctorDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route path="/doctor/profile" element={<ProtectedRoute role="doctor"><DoctorProfilePage /></ProtectedRoute>} />
      <Route path="/doctor/availability" element={<ProtectedRoute role="doctor"><AvailabilityPage /></ProtectedRoute>} />
      <Route path="/doctor/appointments" element={<ProtectedRoute role="doctor"><AppointmentsPage /></ProtectedRoute>} />
      <Route path="/doctor/telemedicine" element={<ProtectedRoute role="doctor"><TelemedicinePage /></ProtectedRoute>} />
      <Route path="/doctor/prescriptions" element={<ProtectedRoute role="doctor"><PrescriptionsPage /></ProtectedRoute>} />
      <Route path="/doctor/reports" element={<ProtectedRoute role="doctor"><ReportsPage /></ProtectedRoute>} />

      <Route path="/admin/dashboard" element={<ProtectedRoute role="admin"><AdminDashboardPage /></ProtectedRoute>} />
      <Route path="/admin/all-doctors" element={<ProtectedRoute role="admin"><AllDoctorsPage /></ProtectedRoute>} />
      <Route path="/admin/verify-doctors" element={<ProtectedRoute role="admin"><VerifyDoctorsPage /></ProtectedRoute>} />
      <Route path="/admin/profile" element={<ProtectedRoute role="admin"><AdminProfilePage /></ProtectedRoute>} />
      <Route path="/admin/approvals" element={<Navigate to="/admin/dashboard" replace />} />
      <Route path="/admin/settings" element={<Navigate to="/admin/dashboard" replace />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
