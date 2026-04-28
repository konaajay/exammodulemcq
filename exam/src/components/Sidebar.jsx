import { useLocation, NavLink } from 'react-router-dom';
import { 
    LayoutDashboard, PlusCircle, GraduationCap, 
    ChevronLeft, ChevronRight, User,
    LogOut, Users, BookOpen, Settings, Shield, Layout
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ isCollapsed, onToggle }) => {
    const { user, logout } = useAuth();
    const location = useLocation();
    
    const navItems = [
        { path: '/admin/dashboard', icon: <LayoutDashboard size={22} />, label: 'Dashboard' },
        { path: '/admin/create', icon: <PlusCircle size={22} />, label: 'New Exam' },
        { path: '/admin/students', icon: <Users size={22} />, label: 'Students' },
        { path: '/admin/courses', icon: <BookOpen size={22} />, label: 'Courses' },
    ];

    return (
        <div 
            className="d-flex flex-column flex-shrink-0 bg-white border-end shadow-sm" 
            style={{ 
                width: isCollapsed ? '75px' : '260px', 
                height: '100vh', 
                position: 'fixed',
                zIndex: 1050,
                transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                backgroundColor: '#ffffff'
            }}
        >
            {/* Floating Toggle Button */}
            <button 
                onClick={onToggle}
                className="btn btn-white border shadow-sm p-0 d-flex align-items-center justify-content-center"
                style={{ 
                    position: 'absolute', 
                    right: '-14px', 
                    top: '32px', 
                    width: '28px', 
                    height: '28px', 
                    borderRadius: '50%',
                    zIndex: 1100,
                    backgroundColor: 'white'
                }}
            >
                {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>

            {/* Logo Section */}
            <div className={`p-4 mb-2 d-flex align-items-center ${isCollapsed ? 'justify-content-center' : 'gap-3'}`}>
                <div className="bg-primary bg-opacity-10 p-2 rounded-3 text-primary flex-shrink-0">
                    <GraduationCap size={28} />
                </div>
                {!isCollapsed && (
                    <span className="fw-black fs-5 text-dark ls-tight animate-fade-in">
                        Exam<span className="text-primary">Master</span>
                    </span>
                )}
            </div>

            {/* Main Navigation */}
            <nav className="flex-grow-1 px-3">
                <div className="nav nav-pills flex-column gap-2">
                    {location.pathname.startsWith('/admin/create') ? (
                        // Exam Creation Specific Navigation
                        <>
                            <div className={`text-muted x-small fw-bold px-3 mb-2 uppercase ${isCollapsed ? 'd-none' : ''}`}>Exam Config</div>
                            {[
                                { id: 'general', label: 'General Settings', icon: <Settings size={22} />, path: '/admin/create?tab=general' },
                                { id: 'security', label: 'Security', icon: <Shield size={22} />, path: '/admin/create?tab=security' },
                                { id: 'questions', label: 'Questions', icon: <Layout size={22} />, path: '/admin/create?tab=questions' }
                            ].map(tab => (
                                <NavLink
                                    key={tab.id}
                                    to={tab.path}
                                    className={({ isActive }) => 
                                        `nav-link d-flex align-items-center rounded-3 p-3 transition-all ${
                                            isActive 
                                            ? 'bg-indigo text-white shadow-indigo' 
                                            : 'text-secondary hover-bg-light'
                                        } ${isCollapsed ? 'justify-content-center' : 'gap-3'}`
                                    }
                                    title={isCollapsed ? tab.label : ''}
                                >
                                    <span className="flex-shrink-0">{tab.icon}</span>
                                    {!isCollapsed && <span className="fw-bold fs-6 animate-fade-in">{tab.label}</span>}
                                </NavLink>
                            ))}
                        </>
                    ) : (
                        // Standard Admin Navigation
                        navItems.map((item) => (
                            <NavLink 
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) => 
                                    `nav-link d-flex align-items-center rounded-3 p-3 transition-all ${
                                        isActive 
                                        ? 'bg-indigo text-white shadow-indigo' 
                                        : 'text-secondary hover-bg-light'
                                    } ${isCollapsed ? 'justify-content-center' : 'gap-3'}`
                                }
                                title={isCollapsed ? item.label : ''}
                            >
                                <span className="flex-shrink-0">{item.icon}</span>
                                {!isCollapsed && <span className="fw-bold fs-6 animate-fade-in">{item.label}</span>}
                            </NavLink>
                        ))
                    )}
                </div>
            </nav>

            {/* Bottom Section: Profile & Logout */}
            <div className="mt-auto p-3 d-flex flex-column gap-2 border-top bg-light-subtle">
                <div 
                    className={`d-flex align-items-center p-2 rounded-3 ${isCollapsed ? 'justify-content-center' : 'gap-3 bg-white border shadow-xs'}`}
                    style={{ minHeight: '52px' }}
                >
                    <div className="bg-primary text-white rounded-3 d-flex align-items-center justify-content-center flex-shrink-0 shadow-sm" style={{ width: '40px', height: '40px' }}>
                        <User size={22} />
                    </div>
                    {!isCollapsed && (
                        <div className="overflow-hidden animate-fade-in">
                            <div className="fw-bold text-dark small text-truncate" style={{ maxWidth: '140px' }}>{user?.email?.split('@')[0] || 'Admin'}</div>
                            <div className="text-muted" style={{ fontSize: '0.65rem' }}>Full Control Portal</div>
                        </div>
                    )}
                </div>

                <button 
                    onClick={logout}
                    className={`btn d-flex align-items-center p-3 rounded-3 text-danger border-0 transition-all hover-logout ${isCollapsed ? 'justify-content-center' : 'gap-3'}`}
                    style={{ backgroundColor: 'transparent' }}
                >
                    <LogOut size={20} />
                    {!isCollapsed && <span className="fw-bold small">Log Out</span>}
                </button>
            </div>

            <style>{`
                .bg-indigo { background-color: #4f46e5; }
                .text-white { color: white !important; }
                .shadow-indigo { box-shadow: 0 10px 15px -3px rgba(79, 70, 229, 0.4); }
                .shadow-xs { box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); }
                .ls-tight { letter-spacing: -0.02em; }
                .hover-bg-light:hover { background-color: #f1f5f9; color: #4f46e5 !important; }
                .hover-logout:hover { background-color: #fef2f2; color: #dc2626 !important; }
                .transition-all { transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); }
                .animate-fade-in { animation: fadeIn 0.3s ease-out; }
                @keyframes fadeIn { from { opacity: 0; transform: translateX(-5px); } to { opacity: 1; transform: translateX(0); } }
                .fw-black { font-weight: 900; }
            `}</style>
        </div>
    );
};

export default Sidebar;
