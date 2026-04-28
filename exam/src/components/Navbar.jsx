import React, { useState } from 'react';
import { useLocation, useNavigate, NavLink } from 'react-router-dom';
import { 
    LayoutDashboard, PlusCircle, Users, BookOpen, 
    Settings, Shield, Layout, LogOut, GraduationCap,
    Menu, X, User
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const isCreateExamPage = location.pathname.startsWith('/admin/create');

    const navItems = [
        { path: '/admin/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
        { path: '/admin/create', icon: <PlusCircle size={20} />, label: 'New Exam' },
        { path: '/admin/students', icon: <Users size={20} />, label: 'Students' },
        { path: '/admin/courses', icon: <BookOpen size={20} />, label: 'Courses' },
    ];

    const examConfigTabs = [
        { id: 'general', label: 'General', icon: <Settings size={18} />, path: '/admin/create?tab=general' },
        { id: 'security', label: 'Security', icon: <Shield size={18} />, path: '/admin/create?tab=security' },
        { id: 'questions', label: 'Questions', icon: <Layout size={18} />, path: '/admin/create?tab=questions' }
    ];

    const handleLogout = () => {
        logout();
        setIsMenuOpen(false);
    };

    return (
        <header 
            className="navbar-container bg-white border-bottom sticky-top shadow-sm px-3 px-md-4"
            style={{ 
                minHeight: '75px',
                zIndex: 2000,
                backgroundColor: '#ffffff'
            }}
        >
            <div className="d-flex align-items-center justify-content-between h-100 py-2">
                
                {/* Left: Logo & Mobile Toggle */}
                <div className="d-flex align-items-center gap-2 gap-md-4">
                    <button 
                        className="btn btn-icon d-lg-none border-0 p-1"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>

                    <div className="d-flex align-items-center gap-2 cursor-pointer" onClick={() => navigate('/admin/dashboard')}>
                        <div className="bg-primary text-white p-2 rounded-3 shadow-sm">
                            <GraduationCap size={24} />
                        </div>
                        <span className="fw-black fs-5 text-dark ls-tight d-none d-sm-block">
                            Exam<span className="text-primary">Master</span>
                        </span>
                    </div>

                    {/* Desktop Main Nav */}
                    <nav className="d-none d-lg-flex align-items-center gap-1 ms-2">
                        {navItems.map((item) => (
                            <NavLink 
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) => 
                                    `nav-link d-flex align-items-center gap-2 px-3 py-2 rounded-pill fw-bold small transition-all ${
                                        isActive ? 'bg-primary text-white shadow-sm' : 'text-secondary hover-bg-light'
                                    }`
                                }
                            >
                                {item.icon} <span>{item.label}</span>
                            </NavLink>
                        ))}
                    </nav>
                </div>

                {/* Center: Exam Tabs (Shown on all screen sizes but stackable) */}
                {isCreateExamPage && (
                    <div className="d-flex bg-light p-1 rounded-pill border mx-2 overflow-auto scroll-hide">
                        {examConfigTabs.map((tab) => {
                            const isActive = location.search.includes(tab.id) || (tab.id === 'general' && !location.search);
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => navigate(tab.path)}
                                    className={`btn btn-sm rounded-pill px-2 px-md-3 py-1 d-flex align-items-center gap-2 fw-bold transition-all whitespace-nowrap ${
                                        isActive ? 'bg-white text-primary shadow-sm' : 'text-muted border-0'
                                    }`}
                                    style={{ fontSize: '0.7rem' }}
                                >
                                    {tab.icon} <span className="d-none d-sm-inline">{tab.label}</span>
                                </button>
                            );
                        })}
                    </div>
                )}

                {/* Right: Profile */}
                <div className="d-flex align-items-center gap-3">
                    <div className="profile-box d-none d-md-flex flex-column text-end">
                        <div className="fw-bold text-dark small leading-none">{user?.name || user?.email?.split('@')[0]}</div>
                        <div className="text-muted fw-bold" style={{ fontSize: '0.6rem', letterSpacing: '0.05em' }}>{user?.role?.toUpperCase()}</div>
                    </div>
                    <div className="bg-primary-subtle text-primary p-2 rounded-circle d-flex d-sm-none">
                         <User size={18} />
                    </div>
                    <button 
                        onClick={logout}
                        className="btn btn-outline-danger border-0 rounded-circle p-2 hover-bg-danger-subtle transition-all d-none d-sm-flex"
                        title="Log Out"
                    >
                        <LogOut size={20} />
                    </button>
                </div>
            </div>

            {/* Mobile Sidebar Menu (Overlay) */}
            {isMenuOpen && (
                <div 
                    className="mobile-overlay position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 animate-fade-in d-lg-none"
                    style={{ zIndex: 1900 }}
                    onClick={() => setIsMenuOpen(false)}
                >
                    <div 
                        className="mobile-menu bg-white h-100 shadow-lg p-4 vstack gap-3 animate-slide-right"
                        style={{ width: '280px' }}
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="d-flex justify-content-between align-items-center mb-4">
                             <span className="fw-black fs-5 text-dark">Menu</span>
                             <button className="btn btn-light rounded-pill" onClick={() => setIsMenuOpen(false)}><X size={20}/></button>
                        </div>
                        
                        {navItems.map((item) => (
                            <NavLink 
                                key={item.path}
                                to={item.path}
                                onClick={() => setIsMenuOpen(false)}
                                className={({ isActive }) => 
                                    `d-flex align-items-center gap-3 p-3 rounded-4 fw-bold text-decoration-none transition-all ${
                                        isActive ? 'bg-primary text-white shadow-sm' : 'text-secondary hover-bg-light'
                                    }`
                                }
                            >
                                {item.icon} {item.label}
                            </NavLink>
                        ))}
                        
                        <div className="mt-auto pt-4 border-top">
                            <div className="d-flex align-items-center gap-3 mb-4 p-2 bg-light rounded-4">
                                <div className="bg-primary text-white p-2 rounded-circle"><User size={20}/></div>
                                <div>
                                    <div className="fw-bold small text-dark">{user?.name || user?.email?.split('@')[0]}</div>
                                    <div className="text-muted" style={{ fontSize: '0.6rem' }}>{user?.role}</div>
                                </div>
                            </div>
                            <button 
                                onClick={handleLogout}
                                className="btn btn-danger w-100 rounded-pill py-2 fw-bold d-flex align-items-center justify-content-center gap-2"
                            >
                                <LogOut size={18} /> Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .ls-tight { letter-spacing: -0.02em; }
                .fw-black { font-weight: 900; }
                .transition-all { transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); }
                .hover-bg-light:hover { background-color: #f1f5f9; color: #4f46e5 !important; }
                .hover-bg-danger-subtle:hover { background-color: #fef2f2; color: #dc2626; }
                .leading-none { line-height: 1; }
                .nav-link { text-decoration: none; }
                .whitespace-nowrap { white-space: nowrap; }
                .scroll-hide::-webkit-scrollbar { display: none; }
                .animate-fade-in { animation: fadeIn 0.2s ease-out; }
                .animate-slide-right { animation: slideRight 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slideRight { from { transform: translateX(-100%); } to { transform: translateX(0); } }
                .btn-icon { width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; border-radius: 12px; }
            `}</style>
        </header>
    );
};

export default Navbar;
