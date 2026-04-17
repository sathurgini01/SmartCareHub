import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from '../components/common/ProtectedRoute';
import Layout from '../components/Layout';

// Patient Portal Components - Core
import Home from '../pages/Home';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Dashboard from '../pages/Dashboard';
import Profile from '../pages/Profile';
import Prescriptions from '../pages/Prescriptions';
import Appointments from '../pages/Appointments';
import UploadReport from '../pages/UploadReport';
import NotFound from '../pages/NotFound';

// Patient Feature Components - Member 4
import AiSymptomChecker         from '../pages/patient/AiSymptomChecker';
import TelemedicineConsultation  from '../pages/patient/TelemedicineConsultation';
import PatientNotifications      from '../pages/patient/Notifications';

// Doctor Feature Components - Member 4
import DoctorConsultations    from '../pages/doctor/DoctorConsultations';
import DoctorConsultationRoom from '../pages/doctor/DoctorConsultationRoom';
import DoctorNotifications    from '../pages/doctor/DoctorNotifications';

// Admin Feature Components - Member 4
import AdminTelemedicineLogs  from '../pages/admin/AdminTelemedicineLogs';
import AdminNotificationLogs  from '../pages/admin/AdminNotificationLogs';
import AdminAiLogs            from '../pages/admin/AdminAiLogs';

// Doctor & Admin Portal Components - Core
import AdminProfilePage from '../pages/admin/AdminProfilePage';
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
import AllDoctorsPage from '../pages/admin/AllDoctorsPage';
import VerifyDoctorsPage from '../pages/admin/VerifyDoctorsPage';
import AuthPage from '../pages/auth/AuthPage';
import AvailabilityPage from '../pages/doctor/AvailabilityPage';
import DoctorDashboardPage from '../pages/doctor/DoctorDashboardPage';
import DoctorProfilePage from '../pages/doctor/DoctorProfilePage';
import PrescriptionsPage from '../pages/doctor/PrescriptionsPage';
import ReportsPage from '../pages/doctor/ReportsPage';
import TelemedicinePage from '../pages/doctor/TelemedicinePage';
import AppointmentsPage from '../pages/doctor/AppointmentsPage';
import { useAuth } from '../context/AuthContext';

const DashboardRedirect = () => {
  const { isDoctor, isAdmin } = useAuth();
  if (isAdmin) return <Navigate to="/admin/dashboard" replace />;
  if (isDoctor) return <Navigate to="/doctor/dashboard" replace />;
  return <Layout><Dashboard /></Layout>;
};

export default function AppRoutes() {
  return (
    <Routes>
      {/* ====== Public Routes ====== */}
      <Route path="/" element={<Home />} />
      <Route path="/home" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/auth" element={<AuthPage />} />

      {/* ====== Patient Core Protected Routes (Member 1) ====== */}
      <Route path="/dashboard" element={<ProtectedRoute><DashboardRedirect /></ProtectedRoute>} />
      <Route path="/profile" element={<Layout><Profile /></Layout>} />
      <Route path="/prescriptions" element={<Layout><Prescriptions /></Layout>} />
      <Route path="/appointments" element={<Layout><Appointments /></Layout>} />
      <Route path="/upload-report" element={<Layout><UploadReport /></Layout>} />

      {/* ====== Patient Feature Routes (Member 4) ====== */}
      <Route path="/patient/symptom-checker" 
             element={<Layout><ProtectedRoute roles={['patient']}><AiSymptomChecker /></ProtectedRoute></Layout>} />
      <Route path="/patient/consultation/:appointmentId" 
             element={<Layout><ProtectedRoute roles={['patient']}><TelemedicineConsultation /></ProtectedRoute></Layout>} />
      <Route path="/patient/notifications" 
             element={<Layout><ProtectedRoute roles={['patient']}><PatientNotifications /></ProtectedRoute></Layout>} />

      {/* ====== Doctor Portal Routes ====== */}
      <Route path="/doctor/dashboard" element={<ProtectedRoute role="doctor"><DoctorDashboardPage /></ProtectedRoute>} />
      <Route path="/doctor/profile" element={<ProtectedRoute role="doctor"><DoctorProfilePage /></ProtectedRoute>} />
      <Route path="/doctor/availability" element={<ProtectedRoute role="doctor"><AvailabilityPage /></ProtectedRoute>} />
      <Route path="/doctor/appointments" element={<ProtectedRoute role="doctor"><AppointmentsPage /></ProtectedRoute>} />
      <Route path="/doctor/telemedicine" element={<ProtectedRoute role="doctor"><TelemedicinePage /></ProtectedRoute>} />
      <Route path="/doctor/prescriptions" element={<ProtectedRoute role="doctor"><PrescriptionsPage /></ProtectedRoute>} />
      <Route path="/doctor/reports" element={<ProtectedRoute role="doctor"><ReportsPage /></ProtectedRoute>} />
      
      {/* Doctor Features (Member 4) */}
      <Route path="/doctor/consultations" element={<ProtectedRoute roles={['doctor']}><DoctorConsultations /></ProtectedRoute>} />
      <Route path="/doctor/consultation/:appointmentId" element={<ProtectedRoute roles={['doctor']}><DoctorConsultationRoom /></ProtectedRoute>} />
      <Route path="/doctor/notifications" element={<ProtectedRoute roles={['doctor']}><DoctorNotifications /></ProtectedRoute>} />

      {/* ====== Admin Portal Routes ====== */}
      <Route path="/admin/dashboard" element={<ProtectedRoute role="admin"><AdminDashboardPage /></ProtectedRoute>} />
      <Route path="/admin/all-doctors" element={<ProtectedRoute role="admin"><AllDoctorsPage /></ProtectedRoute>} />
      <Route path="/admin/verify-doctors" element={<ProtectedRoute role="admin"><VerifyDoctorsPage /></ProtectedRoute>} />
      <Route path="/admin/profile" element={<ProtectedRoute role="admin"><AdminProfilePage /></ProtectedRoute>} />
      <Route path="/admin/telemedicine/logs" element={<ProtectedRoute roles={['admin']}><AdminTelemedicineLogs /></ProtectedRoute>} />
      <Route path="/admin/notifications/logs" element={<ProtectedRoute roles={['admin']}><AdminNotificationLogs /></ProtectedRoute>} />
      <Route path="/admin/ai/logs" element={<ProtectedRoute roles={['admin']}><AdminAiLogs /></ProtectedRoute>} />

      {/* ====== Fallback Route ====== */}
      <Route path="/404" element={<NotFound />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
}
