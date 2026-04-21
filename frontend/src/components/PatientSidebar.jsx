import React from 'react';
import { NavLink } from 'react-router-dom';

const PatientSidebar = () => (
  <aside className="sidebar">
    <nav>
      <ul>
        <li><NavLink to="/dashboard">Dashboard</NavLink></li>
        <li><NavLink to="/patient/symptom-checker">AI Symptom Checker</NavLink></li>
        <li><NavLink to="/profile">Profile</NavLink></li>
        <li><NavLink to="/upload-report">Upload Report</NavLink></li>
        <li><NavLink to="/prescriptions">Prescriptions</NavLink></li>
        <li><NavLink to="/appointments">Book Appointment</NavLink></li>
      </ul>
    </nav>
  </aside>
);

export default PatientSidebar;
