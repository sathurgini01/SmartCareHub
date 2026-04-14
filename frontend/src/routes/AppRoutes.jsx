import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';

import AiSymptomChecker         from '../pages/patient/AiSymptomChecker';
import TelemedicineConsultation  from '../pages/patient/TelemedicineConsultation';
import PatientNotifications      from '../pages/patient/Notifications';

import DoctorConsultations    from '../pages/doctor/DoctorConsultations';
import DoctorConsultationRoom from '../pages/doctor/DoctorConsultationRoom';
import DoctorNotifications    from '../pages/doctor/DoctorNotifications';

import AdminTelemedicineLogs  from '../pages/admin/AdminTelemedicineLogs';
import AdminNotificationLogs  from '../pages/admin/AdminNotificationLogs';
import AdminAiLogs            from '../pages/admin/AdminAiLogs';

function AppRoutes() {
  return (
    <Router>
      <Routes>
        {/* Patient – Member 4 */}
        <Route path="/patient/symptom-checker"
          element={<ProtectedRoute roles={['patient']}><AiSymptomChecker /></ProtectedRoute>} />
        <Route path="/patient/consultation/:appointmentId"
          element={<ProtectedRoute roles={['patient']}><TelemedicineConsultation /></ProtectedRoute>} />
        <Route path="/patient/notifications"
          element={<ProtectedRoute roles={['patient']}><PatientNotifications /></ProtectedRoute>} />

        {/* Doctor – Member 4 */}
        <Route path="/doctor/consultations"
          element={<ProtectedRoute roles={['doctor']}><DoctorConsultations /></ProtectedRoute>} />
        <Route path="/doctor/consultation/:appointmentId"
          element={<ProtectedRoute roles={['doctor']}><DoctorConsultationRoom /></ProtectedRoute>} />
        <Route path="/doctor/notifications"
          element={<ProtectedRoute roles={['doctor']}><DoctorNotifications /></ProtectedRoute>} />

        {/* Admin – Member 4 */}
        <Route path="/admin/telemedicine/logs"
          element={<ProtectedRoute roles={['admin']}><AdminTelemedicineLogs /></ProtectedRoute>} />
        <Route path="/admin/notifications/logs"
          element={<ProtectedRoute roles={['admin']}><AdminNotificationLogs /></ProtectedRoute>} />
        <Route path="/admin/ai/logs"
          element={<ProtectedRoute roles={['admin']}><AdminAiLogs /></ProtectedRoute>} />

        {/* Fallback — /login will be provided by Member 1 on merge */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default AppRoutes;
