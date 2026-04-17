import React, { useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import StudentNavbar from './StudentNavbar';
import StudentSidebar from './StudentSidebar';
import AiChatWidget from '../common/AiChatWidget';
import { useAuth } from '../../../../pages/Library/context/AuthContext';

const StudentLayout = () => {
    const { user, loading } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100" style={{ backgroundColor: 'var(--bg)' }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    if (!user || (user.role?.toUpperCase() !== 'STUDENT' && user.role?.toUpperCase() !== 'PARENT')) {
        console.warn("Restricted Access: Non-student/parent attempting to access student UI.");
        return <Navigate to="/login" replace />;
    }

    const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

    return (
        <div className="vh-100 d-flex flex-column" style={{ backgroundColor: 'var(--bg)' }}>
            {/* TOP NAVIGATION */}
            <StudentNavbar toggleMobileMenu={toggleMobileMenu} isMobileMenuOpen={isMobileMenuOpen} />

            <div className="d-flex flex-grow-1 overflow-hidden">
                {/* DESKTOP SIDEBAR */}
                <div className="d-none d-md-block border-end shadow-sm" style={{ width: '260px', backgroundColor: 'var(--surface)' }}>
                    <StudentSidebar isVertical={true} />
                </div>

                {/* MOBILE SIDEBAR */}
                <div className="d-md-none">
                    <StudentSidebar isVertical={true} isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
                </div>

                {/* MAIN CONTENT */}
                <main className="flex-grow-1 overflow-auto p-3 p-md-4">
                    <div className="container-fluid">
                        <Outlet />
                    </div>
                </main>
            </div>

            {/* MOBILE SIDEBAR OVERLAY */}
            {isMobileMenuOpen && (
                <div 
                    className="mobile-overlay d-md-none" 
                    onClick={toggleMobileMenu}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        zIndex: 1045
                    }}
                />
            )}

            {/* AI AUTOMATION SIDEKICK (DEMO MODE) */}
            <AiChatWidget userRole="STUDENT" userName={user?.name || 'Student'} />
        </div>
    );
};

export default StudentLayout;
