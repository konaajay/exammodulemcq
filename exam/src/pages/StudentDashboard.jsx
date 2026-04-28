import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { examService } from '../services/examService';
import { useNavigate } from 'react-router-dom';
import { 
    GraduationCap, BookOpen, Clock, Calendar, 
    ArrowRight, Trophy, BookMarked, User as UserIcon
} from 'lucide-react';

const StudentDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [exams, setExams] = useState([]);
    const [myAttempts, setMyAttempts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Fetch Exams
                const allExams = await examService.getAllExams();
                const normalizedAll = (Array.isArray(allExams) ? allExams : (allExams.data || [])).map(ex => ({
                    ...ex,
                    id: ex.id || ex.examId || ex.sessionId
                }));
                const filteredExams = normalizedAll.filter(ex => ex.course === user.course);
                setExams(filteredExams);

                // 2. Fetch My Attempts
                const attempts = await examService.getMyAttempts();
                setMyAttempts(Array.isArray(attempts) ? attempts : (attempts.data || []));

            } catch (error) {
                console.error("Failed to fetch dashboard data", error);
            } finally {
                setLoading(false);
            }
        };
        if (user?.course) fetchData();
    }, [user]);

    if (loading) return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center bg-royal">
            <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading Portal...</span>
            </div>
        </div>
    );

    return (
        <div className="min-vh-100 bg-royal pb-5">
            {/* Student Header */}
            <div className="bg-white border-bottom shadow-sm mb-5 animate-slide-down">
                <div className="container py-4">
                    <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center gap-3">
                            <div className="bg-primary-subtle text-primary p-3 rounded-circle border border-primary-subtle">
                                <GraduationCap size={32} />
                            </div>
                            <div>
                                <h1 className="h4 fw-bold text-dark mb-0">Welcome Back, {user.name}</h1>
                                <p className="text-muted small mb-0 d-flex align-items-center gap-2">
                                    <BookMarked size={14} /> Registered Course: <span className="fw-bold text-primary">{user.course}</span>
                                </p>
                            </div>
                        </div>
                        <div className="d-none d-md-flex gap-4">
                            <div className="text-center border-end pe-4">
                                <div className="text-muted small fw-bold text-uppercase ls-wide">Status</div>
                                <div className="text-success small fw-bold d-flex align-items-center justify-content-center gap-1">
                                    <div className="bg-success rounded-circle" style={{ width: '8px', height: '8px' }}></div> Active
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="text-muted small fw-bold text-uppercase ls-wide">My Role</div>
                                <div className="text-dark small fw-bold">Student Candidate</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container">
                <div className="row g-4">
                    {/* Main Content: My Exams */}
                    <div className="col-lg-8">
                        <div className="d-flex align-items-center gap-2 mb-4">
                            <h2 className="h5 fw-bold text-dark mb-0">My Active Assessments</h2>
                            <span className="badge bg-primary-subtle text-primary px-3 rounded-pill small">
                                {exams.length} Assigned
                            </span>
                        </div>

                        <div className="d-flex flex-column gap-3">
                            {exams.length > 0 ? exams.map((exam) => {
                                const isExpired = new Date(exam.endTime) < new Date();
                                const isFuture = new Date(exam.startTime) > new Date();

                                return (
                                    <div key={exam.id} className="card border-0 shadow-sm rounded-4 overflow-hidden card-hover transition-all">
                                        <div className="card-body p-4">
                                            <div className="row align-items-center">
                                                <div className="col-md-8">
                                                    <div className="d-flex align-items-center gap-2 mb-2">
                                                        <span className={`badge px-3 py-1 rounded-pill`} style={{ fontSize: '0.65rem', backgroundColor: isExpired ? '#f3f4f6' : isFuture ? '#fef3c7' : '#d1fae5', color: isExpired ? '#4b5563' : isFuture ? '#d97706' : '#059669' }}>
                                                            {isExpired ? 'Completed' : isFuture ? 'Upcoming' : 'Ongoing'}
                                                        </span>
                                                        <span className="text-muted fs-xs fw-bold text-uppercase ls-wide">ID: #{exam.id}</span>
                                                    </div>
                                                    <h3 className="h6 fw-bold text-dark mb-2">{exam.title}</h3>
                                                    
                                                    <div className="d-flex flex-wrap gap-3 text-secondary" style={{ fontSize: '0.7rem' }}>
                                                        <div className="d-flex align-items-center gap-1">
                                                            <Clock size={12} className="text-primary" />
                                                            {exam.durationMinutes} Min
                                                        </div>
                                                        <div className="d-flex align-items-center gap-1">
                                                            <Calendar size={12} className="text-primary" />
                                                            {new Date(exam.endTime).toLocaleDateString()}
                                                        </div>
                                                        <div className="d-flex align-items-center gap-1">
                                                            <BookOpen size={12} className="text-primary" />
                                                            {exam.course}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col-md-4 text-md-end mt-3 mt-md-0">
                                                    {(() => {
                                                        const examAttempts = myAttempts.filter(a => String(a.examId) === String(exam.id))
                                                            .sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
                                                        const usedAttempts = examAttempts.length;
                                                        const maxAttempts = exam.maxAttempts || 1;
                                                        const isLimitReached = usedAttempts >= maxAttempts;
                                                        const latestAttempt = examAttempts[0];

                                                        if (isExpired) {
                                                            if (latestAttempt) {
                                                                return (
                                                                    <button 
                                                                        onClick={() => navigate('/result', { state: { attemptId: latestAttempt.id, examId: exam.id }})} 
                                                                        className="btn btn-outline-dark btn-sm rounded-pill px-4 fw-bold w-100 w-md-auto"
                                                                    >
                                                                        Review Result
                                                                    </button>
                                                                );
                                                            }
                                                            return (
                                                                <button disabled className="btn btn-light btn-sm rounded-pill px-4 text-muted w-100 w-md-auto">
                                                                    Missed
                                                                </button>
                                                            );
                                                        }

                                                        if (isFuture) {
                                                            return <button disabled className="btn btn-light btn-sm rounded-pill px-4 text-muted w-100 w-md-auto">Scheduled</button>;
                                                        }

                                                        return (
                                                            <div className="d-flex flex-column align-items-center align-items-md-end gap-2">
                                                                <div className={`badge rounded-pill px-3 py-1 border small ${isLimitReached ? 'bg-success-subtle text-success border-success' : 'bg-primary-subtle text-primary border-primary'}`}>
                                                                    {usedAttempts} / {maxAttempts} Attempts
                                                                </div>
                                                                {isLimitReached ? (
                                                                    <button 
                                                                        onClick={() => navigate('/result', { state: { attemptId: latestAttempt.id, examId: exam.id }})}
                                                                        className="btn btn-outline-primary btn-sm rounded-pill px-4 fw-bold w-100 w-md-auto"
                                                                    >
                                                                        Review Result
                                                                    </button>
                                                                ) : (
                                                                    <button 
                                                                        onClick={() => navigate(`/exam/${exam.id}`)}
                                                                        className="btn btn-primary btn-sm rounded-pill px-4 fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2 w-100 w-md-auto"
                                                                    >
                                                                        {usedAttempts > 0 ? 'Re-attempt' : 'Start Exam'}
                                                                    </button>
                                                                )}
                                                            </div>
                                                        );
                                                    })()}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            }) : (
                                <div className="card border-0 shadow-sm rounded-4 p-5 text-center bg-white opacity-75">
                                    <BookMarked size={48} className="mx-auto text-muted mb-4 opacity-25" />
                                    <h4 className="fw-bold text-muted">No assessments assigned yet</h4>
                                    <p className="text-secondary small">Reach out to your coordinator once exams are scheduled for the <b>{user.course}</b> course.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar Area: My Profile / Stats */}
                    <div className="col-lg-4">
                        <div className="card border-0 shadow-lg rounded-4 mb-4 text-white p-4" style={{ background: 'linear-gradient(135deg, #059669 0%, #064e3b 100%)' }}>
                            <h5 className="fw-bold mb-4 small text-uppercase opacity-75 ls-wide">Your Performance</h5>
                            <div className="d-flex align-items-center gap-3 mb-3">
                                <div className="bg-white bg-opacity-20 p-2 rounded-3 shadow-inner">
                                    <Trophy size={24} className="text-warning" />
                                </div>
                                <div>
                                    <div className="h4 fw-bold mb-0">{myAttempts.length}</div>
                                    <div className="small opacity-75" style={{ fontSize: '0.7rem' }}>Total Attempts</div>
                                </div>
                            </div>
                            <button 
                                onClick={() => navigate(`/student/history/${user.id}`)}
                                className="btn btn-white text-primary w-100 rounded-pill fw-bold py-2 shadow-sm d-flex align-items-center justify-content-center gap-2"
                            >
                                <Clock size={16} /> View My History
                            </button>
                        </div>

                        <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
                            <h5 className="fw-bold text-dark mb-4 h6 d-flex align-items-center gap-2">
                                <UserIcon size={18} className="text-primary" /> Student Credentials
                            </h5>
                            <div className="mb-3 border-bottom pb-3">
                                <label className="text-muted small fw-bold text-uppercase mb-1">Authenticated ID</label>
                                <div className="text-dark small font-monospace">{user.email}</div>
                            </div>
                            <div>
                                <label className="text-muted small fw-bold text-uppercase mb-1">Registration Level</label>
                                <div className="text-dark small fw-bold">Verified Candidate</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .bg-royal { background: #ffffff; }
                .ls-wide { letter-spacing: 0.1em; }
                .fs-xs { font-size: 0.7rem; }
                .card-hover:hover { 
                    transform: translateY(-4px); 
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.04) !important;
                }
                .transition-all { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
                .animate-slide-down { animation: slideDown 0.5s ease-out; }
                @keyframes slideDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
                .shadow-inner { box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.06); }
            `}</style>
        </div>
    );
};

export default StudentDashboard;
