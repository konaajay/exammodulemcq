/* src/components/layout/StudentNavbar.jsx */
import React from 'react';
import { Bell, User, LogOut, ChevronDown, Menu, X } from 'lucide-react';
import { useAuth } from '../../../../pages/Library/context/AuthContext';
import { useToast } from '../../../../pages/Library/context/ToastContext';
import { useNavigate } from 'react-router-dom';
import StudentSidebar from './StudentSidebar';
import './StudentNavbar.css';

const StudentNavbar = ({ toggleMobileMenu, isMobileMenuOpen }) => {
    const { user, logout } = useAuth();
    const toast = useToast();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <header className="student-navbar px-3 py-1 d-flex align-items-center justify-content-between shadow-sm bg-white" style={{ minHeight: '60px' }}>
            <div className="navbar-left d-flex align-items-center">
                {/* Mobile Menu Toggle */}
                <button 
                    className="mobile-toggle d-md-none btn border-0 p-2 me-2" 
                    onClick={toggleMobileMenu}
                    aria-label="Toggle Menu"
                >
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>

                {/* Logo */}
                <div className="logo d-flex align-items-center gap-2" onClick={() => navigate('/student/dashboard')} style={{ cursor: 'pointer' }}>
                    <h5 className="mb-0 fw-bold text-primary">LMS Student Portal</h5>
                </div>
            </div>

            <div className="navbar-right d-flex align-items-center gap-2 gap-md-3 flex-shrink-0">
                <div className="position-relative border-end pe-2 pe-md-3">
                    <button className="nav-icon-btn btn border-0 p-1 p-md-2" onClick={() => navigate('/student/notifications')}>
                        <Bell size={20} />
                    </button>
                    <span className="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-2 rounded-circle" style={{ marginTop: '8px', marginRight: '8px', borderColor: 'var(--surface)' }}></span>
                </div>

                <div className="user-profile-dropdown d-flex align-items-center gap-2">
                    <div className="user-info d-none d-lg-flex flex-column align-items-end me-1">
                        <span className="user-name fw-bold small text-nowrap">{user?.firstName || user?.name || 'Student'} {user?.lastName || ''}</span>
                        <span className="user-role text-muted x-small opacity-75">ID: {user?.userId || user?.id || '75'}</span>
                    </div>
                    <div className="avatar-wrapper d-flex align-items-center gap-1 gap-md-2 bg-light p-1 pe-1 pe-md-2 rounded-pill shadow-sm">
                        {user?.avatar ? (
                            <img src={user.avatar} alt="Profile" className="avatar-img rounded-circle" style={{ width: '32px', height: '32px' }} />
                        ) : (
                            <div className="avatar-placeholder rounded-circle d-flex align-items-center justify-content-center text-white" style={{ width: '32px', height: '32px', background: 'linear-gradient(135deg, #6366f1, #a855f7)' }}>
                                <User size={16} />
                            </div>
                        )}
                        <ChevronDown size={14} className="text-muted opacity-75 d-none d-md-block" />
                    </div>

                    <div className="dropdown-menu-custom shadow-lg">
                        <button className="dropdown-item-custom btn border-0 w-100 text-start d-flex align-items-center gap-2" onClick={() => navigate('/student/profile')}>
                            <User size={16} />
                            <span>My Profile</span>
                        </button>
                        <hr className="dropdown-divider opacity-10" />
                        <button className="dropdown-item-custom logout btn border-0 w-100 text-start d-flex align-items-center gap-2 text-danger" onClick={handleLogout}>
                            <LogOut size={16} />
                            <span>Logout</span>
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default StudentNavbar;
