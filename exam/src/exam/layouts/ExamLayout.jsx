import React from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    LayoutDashboard,
    Database,
    PlusCircle,
    Calendar,
    BarChart3,
    Trophy,
    Settings,
    FileCheck
} from 'lucide-react';

import './ExamLayout.css';

const ExamLayout = () => {
    const location = useLocation();

    // Hide navigation for standalone editors or specific views if needed
    const isFullscreenEditor = location.pathname.includes('/create-exam') || location.pathname.includes('/edit-exam');

    const navItems = [
        { to: "/admin/exams/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { to: "/admin/exams/question-bank", label: "Question Bank", icon: Database },
        { to: "/admin/exams/create-exam", label: "Create New", icon: PlusCircle },
        { to: "/admin/exams/schedule", label: "Schedule", icon: Calendar },
        { to: "/admin/exams/evaluation", label: "Evaluation", icon: FileCheck },
        { to: "/admin/exams/reports", label: "Reports", icon: BarChart3 },
        { to: "/admin/exams/leaderboard", label: "Leaderboard", icon: Trophy },
        { to: "/admin/exams/settings", label: "Settings", icon: Settings },
    ];

    if (isFullscreenEditor) {
        return (
            <div className="exam-module-container min-vh-100 bg-white">
                <main>
                    <Outlet />
                </main>
            </div>
        );
    }

    return (
        <div className="exam-module-container min-vh-100">
            {/* Sub-Navigation Bar - Premium Glassmorphism */}
            <div className="exam-sub-nav">
                <div className="container-fluid px-3 px-md-4">
                    <div className="d-flex align-items-center justify-content-between">
                        {/* Logo & Module Title */}
                        <div className="exam-nav-logo py-0">
                            <div className="exam-logo-icon">
                                <BarChart3 size={20} strokeWidth={2.5} />
                            </div>
                            <h5 className="mb-0 fw-bold d-none d-lg-block">Exams Control Center</h5>
                        </div>

                        {/* Navigation Items - Scrollable for mobile */}
                        <nav className="flex-grow-1 overflow-auto scrollbar-hide ms-2 ms-lg-4 py-1 px-1">
                            <ul className="exam-nav-items d-flex align-items-center gap-2 m-0 p-0">
                                {navItems.map((item) => (
                                    <li key={item.to} className="list-unstyled">
                                        <NavLink
                                            to={item.to}
                                            className={({ isActive }) =>
                                                `exam-nav-link ${isActive ? 'active' : ''}`
                                            }
                                        >
                                            <item.icon size={16} strokeWidth={2.5} />
                                            <span className="d-none d-xl-inline">{item.label}</span>
                                            <span className="d-xl-none d-none d-md-inline">{item.label.split(' ')[0]}</span>
                                        </NavLink>
                                    </li>
                                ))}
                            </ul>
                        </nav>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <main className="pb-4">
                <div className="container-fluid px-0">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default ExamLayout;
