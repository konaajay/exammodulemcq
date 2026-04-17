import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { examService } from '../services/examService';
import { studentService } from '../services/studentService';
import { 
    Award, Calendar, Clock, ArrowLeft, 
    Trophy, ChevronRight, CheckCircle2, AlertCircle,
    FileText, User, BookOpen
} from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import { motion } from 'framer-motion';

const StudentHistory = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [student, setStudent] = useState(null);
    const [attempts, setAttempts] = useState([]);
    const [exams, setExams] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                // Fetch student details
                const studentData = await studentService.getStudentById(id);
                setStudent(studentData);

                // Fetch exam attempts for this student
                const attemptsData = await examService.getAttemptsByStudent(id);
                const attemptsList = Array.isArray(attemptsData) ? attemptsData : (attemptsData.data || []);
                setAttempts(attemptsList);

                // Fetch all exams to map titles
                const allExams = await examService.getAllExams();
                const examMap = {};
                (Array.isArray(allExams) ? allExams : (allExams.data || [])).forEach(ex => {
                    examMap[ex.id] = ex;
                });
                setExams(examMap);

            } catch (error) {
                toast.error("Failed to retrieve student performance records.");
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [id]);

    if (loading) return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center bg-royal">
            <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading Student Records...</span>
            </div>
        </div>
    );

    if (!student) return <div className="text-center p-5">Student records not found.</div>;

    const completedAttempts = attempts.filter(a => a.status === 'COMPLETED');
    const avgScore = completedAttempts.length > 0 
        ? (completedAttempts.reduce((acc, curr) => acc + (curr.score || 0), 0) / completedAttempts.length).toFixed(1)
        : 0;

    return (
        <div className="min-vh-100 bg-royal py-5">
            <ToastContainer />
            <div className="container" style={{ maxWidth: '1000px' }}>
                {/* Header Section */}
                <div className="d-flex align-items-center justify-content-between mb-5">
                    <div className="d-flex align-items-center gap-3">
                        <button onClick={() => navigate('/admin/students')} className="btn btn-white shadow-sm border rounded-circle p-2 hover-elevate">
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h2 className="fw-black text-dark mb-0 ls-tight">Student Performance</h2>
                            <p className="text-secondary small mb-0">Detailed analytical report for {student.name}</p>
                        </div>
                    </div>
                    <div className="badge bg-indigo text-white px-4 py-3 rounded-pill shadow-indigo d-flex align-items-center gap-2">
                        <User size={18} /> Student ID: #{student.id}
                    </div>
                </div>

                {/* Profile Overview Card */}
                <div className="row g-4 mb-5">
                    <div className="col-md-8">
                        <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5 h-100 bg-white">
                            <div className="d-flex align-items-start gap-4">
                                <div className="bg-indigo bg-opacity-10 text-indigo p-4 rounded-4 flex-shrink-0">
                                    <Trophy size={48} />
                                </div>
                                <div className="flex-grow-1">
                                    <div className="d-flex justify-content-between align-items-start mb-3">
                                        <div>
                                            <h3 className="fw-bold text-dark h4 mb-1">{student.name}</h3>
                                            <div className="text-muted d-flex align-items-center gap-2 small">
                                                <BookOpen size={14} /> {student.course} specialization
                                            </div>
                                        </div>
                                        <div className="text-end">
                                            <div className="h2 fw-black text-indigo mb-0">{avgScore}</div>
                                            <div className="small text-muted fw-bold text-uppercase ls-wide">Avg Score</div>
                                        </div>
                                    </div>
                                    <div className="row mt-4 pt-4 border-top">
                                        <div className="col-4">
                                            <div className="small text-muted mb-1 fw-bold">Attempts</div>
                                            <div className="h5 fw-bold text-dark mb-0">{attempts.length}</div>
                                        </div>
                                        <div className="col-4">
                                            <div className="small text-muted mb-1 fw-bold">Completed</div>
                                            <div className="h5 fw-bold text-success mb-0">{completedAttempts.length}</div>
                                        </div>
                                        <div className="col-4">
                                            <div className="small text-muted mb-1 fw-bold">Email ID</div>
                                            <div className="small text-dark text-truncate fw-medium" style={{ maxWidth: '120px' }} title={student.email}>{student.email}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="card border-0 shadow-sm rounded-4 p-4 h-100 bg-indigo text-white shadow-indigo overflow-hidden position-relative">
                            <div className="position-relative z-index-1">
                                <h5 className="small fw-bold text-uppercase opacity-75 ls-wide mb-4">Academic Status</h5>
                                <div className="text-center py-3">
                                    {student.firstLogin ? (
                                        <div className="d-flex flex-column align-items-center gap-3">
                                            <AlertCircle size={50} className="bg-white bg-opacity-20 rounded-circle p-2" />
                                            <div>
                                                <div className="fw-bold">Pending Setup</div>
                                                <div className="small opacity-75">Password not changed yet</div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="d-flex flex-column align-items-center gap-3">
                                            <CheckCircle2 size={50} className="bg-white bg-opacity-20 rounded-circle p-2" />
                                            <div>
                                                <div className="fw-bold">Active Account</div>
                                                <div className="small opacity-75">Verified Candidate</div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <Award className="position-absolute opacity-10" size={150} style={{ right: '-20px', bottom: '-20px' }} />
                        </div>
                    </div>
                </div>

                {/* History Table */}
                <h4 className="fw-bold text-dark mb-4 d-flex align-items-center gap-2 px-2">
                    <FileText size={20} className="text-indigo" /> Assessment Journey
                </h4>

                <div className="d-flex flex-column gap-3">
                    {attempts.length > 0 ? [...attempts].reverse().map((attempt) => {
                        const exam = exams[attempt.examId] || {};
                        const percentage = exam.totalMarks ? ((attempt.score / exam.totalMarks) * 100).toFixed(0) : 0;
                        const isCompleted = attempt.status === 'COMPLETED';

                        return (
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                key={attempt.id} 
                                className="card border-0 shadow-sm rounded-4 overflow-hidden card-hover transition-all bg-white"
                            >
                                <div className="card-body p-4 d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-4">
                                    <div className="d-flex align-items-center gap-4">
                                        <div className={`p-3 rounded-4 ${isCompleted ? 'bg-success bg-opacity-10 text-success' : 'bg-warning bg-opacity-10 text-warning'}`}>
                                            <Award size={28} />
                                        </div>
                                        <div>
                                            <h5 className="fw-bold text-dark mb-1">{exam.title || `Exam #${attempt.examId}`}</h5>
                                            <div className="text-muted small d-flex align-items-center gap-3 flex-wrap">
                                                <span className="d-flex align-items-center gap-1"><Calendar size={14} /> {new Date(attempt.startTime).toLocaleDateString()}</span>
                                                <span className="d-flex align-items-center gap-1"><Clock size={14} /> {new Date(attempt.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                <span className="badge bg-light text-muted border px-2 py-1 rounded-pill">Attempt #{attempt.attemptNumber || 1}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="d-flex align-items-center gap-4 text-md-end">
                                        {isCompleted ? (
                                            <>
                                                <div className="d-none d-sm-block">
                                                    <div className="small text-muted fw-bold text-uppercase ls-wide">Score</div>
                                                    <div className="h5 fw-bold text-dark mb-0">{attempt.score} / {exam.totalMarks}</div>
                                                </div>
                                                <div className="text-center px-4 border-start border-end">
                                                    <div className="small text-muted fw-bold text-uppercase ls-wide">Result</div>
                                                    <div className={`h5 fw-black mb-0 ${parseInt(percentage) >= (exam.passPercentage || 0) ? 'text-success' : 'text-danger'}`}>
                                                        {percentage}%
                                                    </div>
                                                </div>
                                                <button 
                                                    onClick={() => navigate('/result', { state: { attemptId: attempt.id, examId: attempt.examId }})}
                                                    className="btn btn-indigo rounded-pill px-4 fw-bold shadow-indigo d-flex align-items-center gap-2"
                                                >
                                                    Report <ChevronRight size={16} />
                                                </button>
                                            </>
                                        ) : (
                                            <div className="badge bg-warning-subtle text-warning border border-warning px-4 py-2 rounded-pill fw-bold">
                                                IN PROGRESS
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    }) : (
                        <div className="text-center py-5 bg-white rounded-4 shadow-sm border border-dashed">
                            <FileText size={48} className="text-muted opacity-25 mb-3" />
                            <p className="text-muted">No assessment records found for this student.</p>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                .bg-royal { background: #f8fafc; }
                .text-indigo { color: #4f46e5 !important; }
                .bg-indigo { background-color: #4f46e5 !important; }
                .shadow-indigo { box-shadow: 0 10px 15px -3px rgba(79, 70, 229, 0.4); }
                .fw-black { font-weight: 900; }
                .ls-tight { letter-spacing: -0.02em; }
                .ls-wide { letter-spacing: 0.1em; font-size: 0.65rem; }
                .card-hover:hover { transform: translateY(-3px); box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.05); }
                .btn-indigo { background-color: #4f46e5; color: white; border: none; }
                .btn-indigo:hover { background-color: #4338ca; color: white; }
                .hover-elevate:hover { transform: translateY(-2px); }
            `}</style>
        </div>
    );
};

export default StudentHistory;
