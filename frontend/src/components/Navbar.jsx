import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
	const { user, token, logout } = useContext(AuthContext);
	const location = useLocation();
	return (
		<header className="navbar card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem' }}>
			<div className="navbar-brand" style={{ fontWeight: 'bold', color: '#fff' }}>
				SmartCareHub Patient Portal
			</div>
			<div className="navbar-user" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
				{token && user ? (
					<>
						<span style={{ color: '#fff' }}>Welcome, {user.name || 'Patient'}</span>
						<button className="btn btn-secondary" onClick={logout}>Logout</button>
					</>
				) : (
					<>
						{location.pathname !== '/login' && <Link className="btn btn-secondary" to="/login">Login</Link>}
						{location.pathname !== '/register' && <Link className="btn btn-primary" to="/register">Register</Link>}
					</>
				)}
			</div>
		</header>
	);
};

export default Navbar;
