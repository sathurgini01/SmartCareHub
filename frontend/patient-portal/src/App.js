import { BrowserRouter as Router } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import AppRoutes from './routes/AppRoutes';
import './App.css';
import './index.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <AppRoutes />
        <ToastContainer />
      </Router>
    </AuthProvider>
  );
}

export default App;
