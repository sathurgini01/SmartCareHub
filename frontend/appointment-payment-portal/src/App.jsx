import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Toast from './components/common/Toast';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import BrowseDoctors from './pages/BrowseDoctors';
import BookAppointment from './pages/BookAppointment';
import MyAppointments from './pages/MyAppointments';
import PaymentPage from './pages/PaymentPage';
import PaymentConfirmation from './pages/PaymentConfirmation';
import PaymentHistory from './pages/PaymentHistory';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/doctors" element={<BrowseDoctors />} />
          <Route path="/book/:doctorId" element={<BookAppointment />} />
          <Route path="/appointments" element={<MyAppointments />} />
          <Route path="/payment/:appointmentId" element={<PaymentPage />} />
          <Route path="/payment/confirm/:paymentId" element={<PaymentConfirmation />} />
          <Route path="/payment/cancel/:paymentId" element={<PaymentConfirmation />} />
          <Route path="/payments" element={<PaymentHistory />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
        <Toast />
      </Router>
    </AuthProvider>
  );
}

export default App;
