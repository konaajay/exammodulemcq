import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, CheckCircle, AlertCircle, Play, FileText, Calendar, ChevronRight, GraduationCap } from 'lucide-react';
import { examService } from '../services/examService';
import { Loader2 } from 'lucide-react';

const StudentExamDashboard = () => {
    const navigate = useNavigate();
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStudentExams();
    }, []);

    const fetchStudentExams = async () => {
        setLoading(true);
        try {
            const data = await examService.getMyExams();
            setExams(data || []);
        } catch (error) {
            console.error("Failed to load student dashboard");
        } finally {
            setLoading(false);
        }
    };

    const categorisedExams = useMemo(() => {
        const now = new Date();
        return {
            active: exams.filter(e => e.status === "active"),
            upcoming: exams.filter(e => e.status === "upcoming"),
            completed: exams.filter(e => e.status === "completed")
        };
    }, [exams]);

    if (loading) {
        return (
            <div className="min-vh-100 bg-white d-flex align-items-center justify-content-center text-dark">
                <Loader2 className="animate-spin text-primary" size={48} />
            </div>
        );
    }

    return (
        <div className="min-vh-100 bg-white text-dark p-4 scrollbar-hide">
            <div className="container-fluid max-w-1200 mx-auto pt-4">
                <header className="mb-5">
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                        <h1 className="fw-bold h2 mb-1 d-flex align-items-center gap-3 text-dark">
                            <GraduationCap className="text-primary" size={32} />
                            Student Examination Portal
                        </h1>
                        <p className="text-muted mb-0">Track your progress and attempt upcoming assessments.</p>
                    </motion.div>
                </header>

                {/* Active Assessment */}
                {categorisedExams.active.length > 0 && (
                    <section className="mb-5">
                        <div className="d-flex align-items-center gap-2 mb-4">
                            <div className="status-dot pulse-success"></div>
                            <h5 className="fw-bold mb-0 text-dark">Live Assessments</h5>
                        </div>
                        <div className="row g-4">
                            {categorisedExams.active.map((exam, idx) => (
                                <motion.div
                                    key={exam.id}
                                    className="col-lg-6"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: idx * 0.1 }}
                                >
                                    <div className="glass-panel p-4 rounded-4 border-start border-4 border-primary shadow-sm position-relative overflow-hidden bg-white">
                                        <div className="bg-glow"></div>
                                        <div className="position-relative z-1">
                                            <div className="d-flex justify-content-between mb-3">
                                                <span className="badge bg-primary-subtle text-primary rounded-pill px-3">Priority Assessment</span>
                                                <div className="d-flex align-items-center gap-2 text-muted small">
                                                    <Clock size={16} /> {exam.duration} Minutes
                                                </div>
                                            </div>
                                            <h3 className="fw-bold mb-2 text-dark">{exam.title}</h3>
                                            <p className="text-muted mb-4">{exam.course}</p>
                                            <button
                                                className="btn btn-primary rounded-pill px-5 py-2 fw-bold premium-btn shadow-sm"
                                                onClick={() => navigate(`/exams/student/attempt/${exam.id}`)}
                                            >
                                                Start Assessment <ChevronRight size={18} className="ms-1" />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </section>
                )}

                <div className="row g-5">
                    {/* Upcoming */}
                    <div className="col-lg-6">
                        <h5 className="fw-bold mb-4 d-flex align-items-center gap-2 text-dark">
                            <Calendar size={20} className="text-warning" /> Future Schedules
                        </h5>
                        <div className="d-flex flex-column gap-3">
                            {categorisedExams.upcoming.length === 0 ? (
                                <div className="glass-panel p-5 text-center rounded-4 border border-light-subtle opacity-75 text-muted">
                                    No upcoming exams found.
                                </div>
                            ) : (
                                categorisedExams.upcoming.map(exam => (
                                    <div key={exam.id} className="glass-panel p-3 rounded-4 border border-light-subtle hover-bg-light transition-all bg-white shadow-sm">
                                        <div className="d-flex justify-content-between align-items-center">
                                            <div>
                                                <div className="fw-bold text-dark">{exam.title}</div>
                                                <div className="small text-muted">{new Date(exam.startTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                                            </div>
                                            <div className="badge bg-light text-muted border border-light-subtle">
                                                {exam.duration}m
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Past Exams */}
                    <div className="col-lg-6">
                        <h5 className="fw-bold mb-4 d-flex align-items-center gap-2 text-dark">
                            <CheckCircle size={20} className="text-success" /> Achievement History
                        </h5>
                        <div className="glass-panel rounded-4 border border-light-subtle overflow-hidden bg-white shadow-sm">
                            <div className="table-responsive">
                                <table className="table hover-bg-light mb-0 align-middle">
                                    <thead className="bg-light text-muted small text-uppercase">
                                        <tr>
                                            <th className="ps-4">Topic</th>
                                            <th>Score</th>
                                            <th className="text-end pe-4">Details</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {categorisedExams.completed.length === 0 ? (
                                            <tr><td colSpan="3" className="text-center py-5 opacity-50 text-muted">Empty history</td></tr>
                                        ) : (
                                            categorisedExams.completed.map(exam => (
                                                <tr key={exam.id}>
                                                    <td className="ps-4">
                                                        <div className="fw-bold text-dark">{exam.title}</div>
                                                        <div className="small text-muted">{new Date(exam.dateCompleted || Date.now()).toLocaleDateString()}</div>
                                                    </td>
                                                    <td>
                                                        <span className="fw-bold text-success fs-5">{exam.score}%</span>
                                                    </td>
                                                    <td className="text-end pe-4">
                                                        <button className="btn btn-icon-sm btn-light">
                                                            <FileText size={16} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .glass-panel { background: rgba(255, 255, 255, 0.8); backdrop-filter: blur(12px); transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
                .border-light-subtle { border-color: rgba(0,0,0,0.05) !important; }
                .hover-bg-light:hover { background: #f8fafc; transform: translateY(-2px); }
                .bg-glow { position: absolute; top: -50%; right: -20%; width: 300px; height: 300px; background: radial-gradient(circle, rgba(99,102,241,0.05) 0%, transparent 70%); z-index: 0; }
                .status-dot { width: 10px; height: 10px; border-radius: 50%; }
                .pulse-success { background: #10b981; animation: pulse 2s infinite; }
                @keyframes pulse {
                    0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
                    70% { box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
                }
                .btn-icon-sm { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; background: #f1f5f9; border: 1px solid #e2e8f0; color: #64748b; transition: all 0.3s; }
                .btn-icon-sm:hover { background: #6366f1; color: white; transform: scale(1.1); }
                .premium-btn { transition: all 0.3s; }
                .premium-btn:hover { transform: translateY(-1px); box-shadow: 0 10px 15px -3px rgba(99,102,241, 0.2); }
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .max-w-1200 { max-width: 1200px; }
                .hover-bg-light:hover { background: #f8fafc; }
            `}</style>
        </div>
    );
};

export default StudentExamDashboard;
