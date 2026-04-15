import { Routes, Route } from 'react-router-dom';
import HomePage from '../pages/HomePage';
import LoginPage from '../pages/LoginPage';
import BrowseDoctors from '../pages/BrowseDoctors';
import BookAppointment from '../pages/BookAppointment';
import MyAppointments from '../pages/MyAppointments';
import PaymentPage from '../pages/PaymentPage';
import PaymentConfirmation from '../pages/PaymentConfirmation';
import PaymentHistory from '../pages/PaymentHistory';
import AdminDashboard from '../pages/AdminDashboard';
// Placeholders from main
import Dashboard from '../pages/Dashboard';
import Login from '../pages/Login';
import Register from '../pages/Register';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      {/* 
        We are keeping our LoginPage from member 3 so it works perfectly.
        You can also link to the main's placeholders like <Login /> if needed:
        <Route path="/main-login-placeholder" element={<Login />} />
      */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register-placeholder" element={<Register />} />
      <Route path="/dashboard-placeholder" element={<Dashboard />} />
      
      {/* Member 3 working routes */}
      <Route path="/doctors" element={<BrowseDoctors />} />
      <Route path="/book/:doctorId" element={<BookAppointment />} />
      <Route path="/appointments" element={<MyAppointments />} />
      <Route path="/payment/:appointmentId" element={<PaymentPage />} />
      <Route path="/payment/confirm/:paymentId" element={<PaymentConfirmation />} />
      <Route path="/payment/cancel/:paymentId" element={<PaymentConfirmation />} />
      <Route path="/payments" element={<PaymentHistory />} />
      <Route path="/admin" element={<AdminDashboard />} />
    </Routes>
  );
};

export default AppRoutes;
