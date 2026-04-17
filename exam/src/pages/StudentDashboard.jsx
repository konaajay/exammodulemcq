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
                                                        <span className={`badge px-3 py-2 rounded-pill small ${
                                                            isExpired ? 'bg-secondary-subtle text-secondary' : 
                                                            isFuture ? 'bg-warning-subtle text-warning' : 'bg-success-subtle text-success'
                                                        }`}>
                                                            {isExpired ? 'Completed' : isFuture ? 'Upcoming' : 'Ongoing'}
                                                        </span>
                                                        <span className="text-muted fs-xs fw-bold text-uppercase ls-wide">Assessment ID: #{exam.id}</span>
                                                    </div>
                                                    <h3 className="h5 fw-bold text-dark mb-3">{exam.title}</h3>
                                                    
                                                    <div className="d-flex flex-wrap gap-4 text-secondary small">
                                                        <div className="d-flex align-items-center gap-2">
                                                            <Clock size={16} className="text-primary" />
                                                            {exam.durationMinutes} Minutes
                                                        </div>
                                                        <div className="d-flex align-items-center gap-2">
                                                            <Calendar size={16} className="text-primary" />
                                                            Ends {new Date(exam.endTime).toLocaleDateString()}
                                                        </div>
                                                        <div className="d-flex align-items-center gap-2">
                                                            <BookOpen size={16} className="text-primary" />
                                                            {exam.course} specialization
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col-md-4 text-md-end mt-4 mt-md-0">
                                                    {(() => {
                                                        const usedAttempts = myAttempts.filter(a => a.examId === exam.id).length;
                                                        const maxAttempts = exam.maxAttempts || 1;
                                                        const attemptsLeft = Math.max(0, maxAttempts - usedAttempts);
                                                        const isLimitReached = usedAttempts >= maxAttempts;

                                                        if (isExpired) {
                                                            return (
                                                                <button onClick={() => navigate(`/exam/${exam.id}`)} className="btn btn-outline-secondary btn-lg rounded-pill px-4">
                                                                    Review Paper
                                                                </button>
                                                            );
                                                        }

                                                        if (isFuture) {
                                                            return <button disabled className="btn btn-light btn-lg rounded-pill px-4 text-muted">Scheduled</button>;
                                                        }

                                                        return (
                                                            <div className="d-flex flex-column align-items-md-end gap-2">
                                                                <div className={`badge rounded-pill px-3 py-2 border ${isLimitReached ? 'bg-danger-subtle text-danger border-danger' : 'bg-primary-subtle text-primary border-primary'}`}>
                                                                    Used: {usedAttempts} / Max: {maxAttempts}
                                                                </div>
                                                                <button 
                                                                    disabled={isLimitReached}
                                                                    onClick={() => navigate(`/exam/${exam.id}`)}
                                                                    className={`btn btn-lg rounded-pill px-4 fw-bold shadow-sm d-flex align-items-center gap-2 ms-auto ${isLimitReached ? 'btn-light text-muted border' : 'btn-primary'}`}
                                                                >
                                                                    {isLimitReached ? 'Attempts Exhausted' : (
                                                                        <>Start Exam <ArrowRight size={18} /></>
                                                                    )}
                                                                </button>
                                                                {!isLimitReached && (
                                                                    <div className="text-secondary fs-xs fw-bold text-uppercase opacity-75">{attemptsLeft} Attempts Left</div>
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
                        <div className="card border-0 shadow-sm rounded-4 mb-4 bg-primary text-white p-4">
                            <h5 className="fw-bold mb-4 small text-uppercase opacity-75 ls-wide">Your Performance</h5>
                            <div className="d-flex align-items-center gap-4 mb-4">
                                <div className="bg-white bg-opacity-20 p-3 rounded-4 shadow-inner">
                                    <Trophy size={40} className="text-warning" />
                                </div>
                                <div>
                                    <div className="h3 fw-bold mb-0">N/A</div>
                                    <div className="small opacity-75">Average Score</div>
                                </div>
                            </div>
                            <div className="small opacity-75 mb-0">Complete your first assessment to see detailed analytics and course ranking.</div>
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
                .bg-royal { background: #f8fafc; }
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
