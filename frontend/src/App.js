import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider as PatientAuthProvider } from './contexts/AuthContext';
import { AuthProvider as DoctorAuthProvider } from './context/AuthContext';

// Patient Portal Components
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Prescriptions from './pages/Prescriptions';
import Appointments from './pages/Appointments';
import UploadReport from './pages/UploadReport';
import NotFound from './pages/NotFound';

// Doctor & Admin Portal Components
import ProtectedRoute from './components/common/ProtectedRoute';
import AdminProfilePage from './pages/admin/AdminProfilePage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AllDoctorsPage from './pages/admin/AllDoctorsPage';
import VerifyDoctorsPage from './pages/admin/VerifyDoctorsPage';
import AuthPage from './pages/auth/AuthPage';
import DoctorAppointmentsPage from './pages/doctor/AppointmentsPage';
import AvailabilityPage from './pages/doctor/AvailabilityPage';
import DoctorDashboardPage from './pages/doctor/DoctorDashboardPage';
import DoctorProfilePage from './pages/doctor/DoctorProfilePage';
import DoctorPrescriptionsPage from './pages/doctor/PrescriptionsPage';
import ReportsPage from './pages/doctor/ReportsPage';
import TelemedicinePage from './pages/doctor/TelemedicinePage';

function App() {
  return (
    <DoctorAuthProvider>
      <PatientAuthProvider>
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <div className="app-main-container">
            <Routes>
              {/* ====== Patient Portal Routes ====== */}
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/home" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected Routes (Layout has internal protection) */}
              <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
              <Route path="/profile" element={<Layout><Profile /></Layout>} />
              <Route path="/prescriptions" element={<Layout><Prescriptions /></Layout>} />
              <Route path="/appointments" element={<Layout><Appointments /></Layout>} />
              <Route path="/upload-report" element={<Layout><UploadReport /></Layout>} />

              {/* ====== Doctor & Admin Portal Routes ====== */}
              {/* Auth */}
              <Route path="/auth" element={<AuthPage />} />

              {/* Doctor Protected Routes */}
              <Route path="/doctor/dashboard" element={<ProtectedRoute role="doctor"><DoctorDashboardPage /></ProtectedRoute>} />
              <Route path="/doctor/profile" element={<ProtectedRoute role="doctor"><DoctorProfilePage /></ProtectedRoute>} />
              <Route path="/doctor/availability" element={<ProtectedRoute role="doctor"><AvailabilityPage /></ProtectedRoute>} />
              <Route path="/doctor/appointments" element={<ProtectedRoute role="doctor"><DoctorAppointmentsPage /></ProtectedRoute>} />
              <Route path="/doctor/telemedicine" element={<ProtectedRoute role="doctor"><TelemedicinePage /></ProtectedRoute>} />
              <Route path="/doctor/prescriptions" element={<ProtectedRoute role="doctor"><DoctorPrescriptionsPage /></ProtectedRoute>} />
              <Route path="/doctor/reports" element={<ProtectedRoute role="doctor"><ReportsPage /></ProtectedRoute>} />

              {/* Admin Protected Routes */}
              <Route path="/admin/dashboard" element={<ProtectedRoute role="admin"><AdminDashboardPage /></ProtectedRoute>} />
              <Route path="/admin/all-doctors" element={<ProtectedRoute role="admin"><AllDoctorsPage /></ProtectedRoute>} />
              <Route path="/admin/verify-doctors" element={<ProtectedRoute role="admin"><VerifyDoctorsPage /></ProtectedRoute>} />
              <Route path="/admin/profile" element={<ProtectedRoute role="admin"><AdminProfilePage /></ProtectedRoute>} />
              <Route path="/admin/approvals" element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="/admin/settings" element={<Navigate to="/admin/dashboard" replace />} />

              {/* ====== Fallback Route ====== */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </Router>
      </PatientAuthProvider>
    </DoctorAuthProvider>
  );
}

export default App;
