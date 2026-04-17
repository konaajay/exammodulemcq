import React from 'react';
import { NavLink } from 'react-router-dom';
import { FiHome, FiAlertTriangle } from 'react-icons/fi';

const NotFound = () => {
    return (
        <div style={{
            height: '80vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            color: '#1e293b'
        }}>
            <FiAlertTriangle size={64} color="#d9d3c9ff" style={{ marginBottom: 24, opacity: 0.8 }} />
            <h1 style={{ fontSize: '3rem', fontWeight: 800, margin: 0, lineHeight: 1 }}>404</h1>
            <h2 style={{ fontSize: '1.5rem', marginTop: 16 }}>Page Not Found</h2>
            <p style={{ color: '#64748b', maxWidth: 400, marginTop: 12 }}>
                Oops! The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
            </p>
            <NavLink to="/" className="btn-primary" style={{ marginTop: 32, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <FiHome /> Back to Dashboard
            </NavLink>
        </div>
    );
};

export default NotFound;
