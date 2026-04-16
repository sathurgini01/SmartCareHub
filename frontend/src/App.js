import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider as PatientAuthProvider } from './contexts/AuthContext';
import { AuthProvider as DoctorAuthProvider } from './context/AuthContext';
import AppRoutes from './routes/AppRoutes';

function App() {
  return (
    <DoctorAuthProvider>
      <PatientAuthProvider>
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <div className="app-main-container">
            <AppRoutes />
          </div>
        </Router>
      </PatientAuthProvider>
    </DoctorAuthProvider>
  );
}

export default App;
  );
}

export default App;
