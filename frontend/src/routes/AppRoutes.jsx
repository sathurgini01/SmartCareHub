import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';

import Login    from '../pages/Login';
import Register from '../pages/Register';
import Dashboard from '../pages/Dashboard';
import Profile      from '../pages/Profile';
import UploadReport from '../pages/UploadReport';
import Prescriptions from '../pages/Prescriptions';

import AiSymptomChecker       from '../pages/patient/AiSymptomChecker';
import TelemedicineConsultation from '../pages/patient/TelemedicineConsultation';
import PatientNotifications   from '../pages/patient/Notifications';

import DoctorConsultations   from '../pages/doctor/DoctorConsultations';
import DoctorConsultationRoom from '../pages/doctor/DoctorConsultationRoom';
import DoctorNotifications   from '../pages/doctor/DoctorNotifications';

import AdminTelemedicineLogs  from '../pages/admin/AdminTelemedicineLogs';
import AdminNotificationLogs  from '../pages/admin/AdminNotificationLogs';
import AdminAiLogs            from '../pages/admin/AdminAiLogs';

function AppRoutes() {
  return (
    <Router>
      <Routes>
        {/* Public */}
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/"         element={<Navigate to="/login" replace />} />

        {/* Common */}
        <Route path="/dashboard"    element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/profile"      element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/upload-report" element={<ProtectedRoute roles={['patient']}><UploadReport /></ProtectedRoute>} />
        <Route path="/prescriptions" element={<ProtectedRoute roles={['patient']}><Prescriptions /></ProtectedRoute>} />

        {/* Patient */}
        <Route path="/patient/symptom-checker" element={<ProtectedRoute roles={['patient']}><AiSymptomChecker /></ProtectedRoute>} />
        <Route path="/patient/consultation/:appointmentId" element={<ProtectedRoute roles={['patient']}><TelemedicineConsultation /></ProtectedRoute>} />
        <Route path="/patient/notifications"   element={<ProtectedRoute roles={['patient']}><PatientNotifications /></ProtectedRoute>} />

        {/* Doctor */}
        <Route path="/doctor/consultations"               element={<ProtectedRoute roles={['doctor']}><DoctorConsultations /></ProtectedRoute>} />
        <Route path="/doctor/consultation/:appointmentId" element={<ProtectedRoute roles={['doctor']}><DoctorConsultationRoom /></ProtectedRoute>} />
        <Route path="/doctor/notifications"               element={<ProtectedRoute roles={['doctor']}><DoctorNotifications /></ProtectedRoute>} />

        {/* Admin */}
        <Route path="/admin/telemedicine/logs"  element={<ProtectedRoute roles={['admin']}><AdminTelemedicineLogs /></ProtectedRoute>} />
        <Route path="/admin/notifications/logs" element={<ProtectedRoute roles={['admin']}><AdminNotificationLogs /></ProtectedRoute>} />
        <Route path="/admin/ai/logs"            element={<ProtectedRoute roles={['admin']}><AdminAiLogs /></ProtectedRoute>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default AppRoutes;
