import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = () => (
  <aside className="sidebar">
    <nav>
      <ul>
        <li><NavLink to="/dashboard">Dashboard</NavLink></li>
        <li><NavLink to="/profile">Profile</NavLink></li>
        <li><NavLink to="/upload-report">Upload Report</NavLink></li>
        <li><NavLink to="/prescriptions">Prescriptions</NavLink></li>
      </ul>
    </nav>
  </aside>
);

export default Sidebar;
