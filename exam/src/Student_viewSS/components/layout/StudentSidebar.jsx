/* src/components/layout/StudentSidebar.jsx */
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutGrid,
    BookOpen,
    PlayCircle,
    ClipboardList,
    Edit3,
    BarChart3,
    BarChart2,
    Calendar,
    MessageCircle,
    User,
    Award,
    Bus,
    Home,
    LifeBuoy,
    Video,
    Users,
    DollarSign
} from 'lucide-react';
import { useToast } from '../../../../pages/Library/context/ToastContext';
import { useAuth } from '../../../../pages/Library/context/AuthContext';
import { referralService } from '../../services/referralService';
import './StudentSidebar.css';

const StudentSidebar = ({ isVertical, isOpen, onClose }) => {
    const navigate = useNavigate();
    const toast = useToast();
    const { user } = useAuth();
    const [isAffiliate, setIsAffiliate] = React.useState(false);
    const [loadingAffiliate, setLoadingAffiliate] = React.useState(true);

    React.useEffect(() => {
        const checkAffiliateStatus = async () => {
            if (!user?.userId && !user?.id) return;
            try {
                const profile = await referralService.getAffiliateProfile(user.userId || user.id);
                // Only show if strictly ACTIVE or present (adjust logic as needed)
                setIsAffiliate(profile && profile.status === 'ACTIVE');
            } catch (err) {
                setIsAffiliate(false);
            } finally {
                setLoadingAffiliate(false);
            }
        };
        checkAffiliateStatus();
    }, [user]);

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', path: '/student/dashboard', icon: LayoutGrid, isMock: false },
        { id: 'courses', label: 'My Courses', path: '/student/courses', icon: BookOpen, isMock: false, enrolledOnly: true },
        { id: 'content', label: 'Learning Content', path: '/student/content', icon: PlayCircle, isMock: false, enrolledOnly: true },
        { id: 'exams', label: 'Exams', path: '/student/exams', icon: Edit3, isMock: false, enrolledOnly: true },
        { id: 'grades', label: 'Grades', path: '/student/grades', icon: BarChart3, isMock: false, enrolledOnly: true },
        { id: 'calendar', label: 'Calendar', path: '/student/calendar', icon: Calendar, isMock: false, enrolledOnly: true },
        { id: 'webinars', label: 'Webinars', path: '/student/webinars', icon: Video, isMock: false, enrolledOnly: true },
        { id: 'attendance', label: 'Attendance', path: '/student/attendance', icon: Calendar, isMock: false, enrolledOnly: true },
        { id: 'certificates', label: 'Certificates', path: '/student/certificates', icon: Award, isMock: false, enrolledOnly: true },
        { id: 'library', label: 'Library', path: '/student/library', icon: BookOpen, isMock: false, enrolledOnly: true },
        { id: 'fee', label: 'Fee', path: '/student/fee', icon: DollarSign, isMock: false, enrolledOnly: true },
        { id: 'hostel', label: 'Hostel', path: '/student/hostel', icon: Home, isMock: false, enrolledOnly: true },
        { id: 'transport', label: 'Transport', path: '/student/transport', icon: Bus, isMock: false, enrolledOnly: true },
        { id: 'communication', label: 'Communication', path: '/student/communication', icon: MessageCircle, isMock: false, enrolledOnly: true },
        { id: 'referral', label: 'Affiliate Portal', path: '/student/referral', icon: Users, isMock: false, enrolledOnly: true },
        { id: 'support', label: 'Help Desk', path: '/student/support', icon: LifeBuoy, isMock: false },
    ];

    const filteredItems = menuItems.filter(item => {
        if (item.hidden) return false;
        
        // Items marked enrolledOnly should be visible to anyone NOT strictly PENDING
        if (item.enrolledOnly) {
            const status = String(user?.enrollmentStatus || user?.status || '').toUpperCase();
            const isExplicitlyPending = status === 'PENDING' || status === 'UNDER_REVIEW';
            
            // If we know they are pending, hide the advanced modules
            if (isExplicitlyPending) return false;
            
            // If they have the STUDENT role and aren't pending, they should see the menu
            // (Even if the isEnrolled flag is missing from the token)
            const canSee = user?.isEnrolled || user?.role === 'STUDENT' || user?.userId;
            
            if (!canSee) return false;
        }
        
        return true;
    });

    const handleItemClick = (e, item) => {
        if (item.isMock) {
            e.preventDefault();
            toast.info(`${item.label} feature is coming soon!`);
        } else if (isVertical) {
            onClose();
        }
    };

    if (isVertical) {
        return (
            <div className={`student-sidebar-vertical ${isOpen ? 'open' : ''}`} style={{
                position: isOpen ? 'fixed' : 'relative',
                top: 0,
                left: isOpen ? 0 : '0',
                width: '100%',
                height: '100%',
                backgroundColor: 'var(--surface)',
                zIndex: isOpen ? 1050 : 1,
                transition: 'all 0.3s ease',
                display: 'flex',
                flexDirection: 'column'
            }}>
                {!isOpen && (
                    <div className="sidebar-header p-4 d-flex align-items-center justify-content-between border-bottom d-none d-md-flex">
                        <h4 className="mb-0 fw-bold text-primary">LMS Student</h4>
                    </div>
                )}
                {isOpen && (
                    <div className="sidebar-header p-4 d-flex align-items-center justify-content-between border-bottom">
                        <h4 className="mb-0 fw-bold text-primary">LMS Portal</h4>
                        <button className="btn-close d-md-none" onClick={onClose}></button>
                    </div>
                )}
                <nav className="flex-grow-1 overflow-auto p-3">
            {filteredItems.map(item => (
                        <NavLink
                            key={item.id}
                            to={item.path}
                            onClick={(e) => handleItemClick(e, item)}
                            className={({ isActive }) =>
                                `nav-link d-flex align-items-center gap-3 px-3 py-3 mb-2 rounded-3 transition-all
                                ${isActive ? 'bg-primary text-white shadow-sm' : 'text-dark hover-bg-light fw-medium'}`
                            }
                        >
                            <item.icon size={20} className="nav-icon" />
                            <span className="fw-bold">{item.label}</span>
                        </NavLink>
                    ))}
                </nav>
            </div>
        );
    }

    return (
        <nav className="student-horizontal-nav d-flex justify-content-start align-items-center overflow-auto py-1 px-1 navigation-scrollbar mx-0 flex-grow-1" style={{ minWidth: 0, gap: '4px' }}>
            {filteredItems.map(item => (
                <NavLink
                    key={item.id}
                    to={item.path}
                    onClick={(e) => handleItemClick(e, item)}
                    className={({ isActive }) =>
                        `nav-link d-flex align-items-center gap-1 px-2 py-1 m-0 rounded-pill transition-all text-nowrap flex-shrink-0
                        ${isActive ? 'bg-primary text-white shadow-sm' : 'text-dark hover-bg-light fw-medium'}`
                    }
                >
                    <item.icon size={18} className="nav-icon" />
                    <span className="fw-bold" style={{ fontSize: '15px' }}>{item.label}</span>
                </NavLink>
            ))}
        </nav>
    );
};

export default StudentSidebar;
