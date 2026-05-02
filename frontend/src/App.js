import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AppRoutes from './routes/AppRoutes';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <AuthProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <div className="app-main-container">
          <AppRoutes />
          <ToastContainer position="top-right" autoClose={5000} theme="dark" />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
