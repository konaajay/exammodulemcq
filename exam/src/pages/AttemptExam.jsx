import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { examService } from '../services/examService';
import QuestionCard from '../components/QuestionCard';
import Timer from '../components/Timer';
import {
    Loader, Lock, User,
    MoreHorizontal, ChevronLeft, ChevronRight,
    HelpCircle, FileText, ShieldAlert, Zap, ShieldCheck
} from 'lucide-react';

const AttemptExam = () => {
    const { id: examId } = useParams();
    const navigate = useNavigate();

    // Core State
    const [exam, setExam] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [answers, setAnswers] = useState({});
    const [visited, setVisited] = useState(new Set());
    const [marked, setMarked] = useState(new Set());

    // UI State
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isExamStarted, setIsExamStarted] = useState(false);
    const [attemptId, setAttemptId] = useState(null);
    const [error, setError] = useState(null);
    const [showWarning, setShowWarning] = useState(false);
    const [isReviewMode, setIsReviewMode] = useState(false);
    const [candidateInfo, setCandidateInfo] = useState({ name: '', email: '' });
    const [showRegistration, setShowRegistration] = useState(true);

    const warningTimeoutRef = useRef(null);

    // --- Proctoring Logic ---
    const enterFullscreen = () => {
        const doc = document.documentElement;
        if (doc.requestFullscreen) doc.requestFullscreen().catch(() => { });
    };

    const handleAutoSubmit = useCallback(async (reason) => {
        if (isSubmitting) return;
        setIsSubmitting(true);

        try {
            await examService.submitExam(attemptId);
            if (document.fullscreenElement) document.exitFullscreen().catch(() => { });
            navigate('/result', { state: { examId, attemptId, reason } });
        } catch (error) {
            navigate('/result', { state: { examId, attemptId, reason } });
        }
    }, [examId, attemptId, isSubmitting, navigate]);

    useEffect(() => {
        if (!isExamStarted || isSubmitting || !exam) return;

        const handleVisibility = () => {
            if (document.hidden && exam.tabLock && !isSubmitting) {
                handleAutoSubmit("Tab Switch Violation");
            }
        };

        const handleFullscreenExit = () => {
            if (!document.fullscreenElement && exam.fullscreenMode && !isSubmitting) {
                setShowWarning(true);
                // Auto-submit after 5 seconds if not returned to fullscreen
                warningTimeoutRef.current = setTimeout(() => {
                    if (!document.fullscreenElement) {
                        handleAutoSubmit("Fullscreen Exit Violation");
                    }
                }, 5000);
            } else if (document.fullscreenElement) {
                setShowWarning(false);
                if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
            }
        };

        document.addEventListener('visibilitychange', handleVisibility);
        document.addEventListener('fullscreenchange', handleFullscreenExit);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibility);
            document.removeEventListener('fullscreenchange', handleFullscreenExit);
            if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
        };
    }, [isExamStarted, isSubmitting, exam, handleAutoSubmit]);

    // --- Initialization ---
    useEffect(() => {
        const initExam = async () => {
            try {
                // Fetch basic metadata first
                const currentExam = await examService.getExamById(examId);
                setExam(currentExam);
                setQuestions(currentExam.questions || []);
                setLoading(false);
            } catch (err) {
                const msg = err.response?.data?.message || err.message || "";
                setError(msg || "Unable to start exam.");
                setLoading(false);
            }
        };
        initExam();
    }, [examId]);

    const startAssessment = async () => {
        if (!candidateInfo.name || !candidateInfo.email) {
            setError("Please provide your Name and Email to proceed.");
            return;
        }

        setLoading(true);
        try {
            const attempt = await examService.startExam(examId, candidateInfo);
            setAttemptId(attempt.id);
            setIsExamStarted(true);
            setShowRegistration(false);
            setVisited(new Set([0]));
            if (exam.fullscreenMode) enterFullscreen();
        } catch (err) {
            setError(err.response?.data?.message || "Build attempt failed.");
        } finally {
            setLoading(false);
        }
    };

    const handleOptionSelect = async (optionId) => {
        if (isReviewMode) return;
        setAnswers(prev => ({ ...prev, [questions[currentIdx].id]: optionId }));
        try {
            await examService.saveResponse(attemptId, {
                questionId: questions[currentIdx].id,
                selectedOption: optionId
            });
        } catch (e) { }
    };

    const toggleMarkForReview = () => {
        const qId = questions[currentIdx]?.id;
        if (!qId) return;
        setMarked(prev => {
            const next = new Set(prev);
            if (next.has(qId)) next.delete(qId);
            else next.add(qId);
            return next;
        });
    };

    const jumpToQuestion = (idx) => {
        setCurrentIdx(idx);
        setVisited(prev => new Set(prev).add(idx));
    };

    const getStatus = (idx) => {
        const qId = questions[idx]?.id;
        const hasAnswer = !!answers[qId];
        const isMarked = marked.has(qId);
        const isVisited = visited.has(idx);

        if (hasAnswer && isMarked) return 'answered-marked';
        if (isMarked) return 'marked';
        if (hasAnswer) return 'answered';
        if (isVisited) return 'not-answered';
        return 'not-visited';
    };

    if (loading) return (
        <div className="min-vh-100 d-flex flex-column align-items-center justify-content-center bg-white">
            <Loader className="animate-spin text-primary mb-3" size={40} />
            <h5 className="text-secondary fw-light tracking-tight">Securing Assessment Environment...</h5>
        </div>
    );

    if (error) return (
        <div className="min-vh-100 d-flex flex-column align-items-center justify-content-center bg-light p-4">
            <div className="bg-white p-5 rounded-4 shadow-sm border text-center max-w-500 animate-fade-in">
                <div className="bg-danger-subtle d-inline-flex p-3 rounded-circle mb-4 text-danger"><Lock size={40} /></div>
                <h3 className="fw-bold text-dark mb-3">Access Restricted</h3>
                <p className="text-muted mb-5 lead fs-6">{error}</p>
                <button className="btn btn-primary rounded-pill px-5 py-2 fw-bold" onClick={() => navigate('/login')}>Return to Portal</button>
            </div>
        </div>
    );

    if (!isExamStarted && !isReviewMode) return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center bg-royal p-4">
            <div className="bg-white p-4 p-md-5 rounded-4 shadow-lg border max-w-700 animate-slide-up">
                <div className="d-flex align-items-center gap-3 mb-4">
                    <div className="bg-primary text-white p-3 rounded-4"><ShieldCheck size={30} /></div>
                    <div>
                        <h2 className="fw-bold text-dark mb-0">{exam.title}</h2>
                        <span className="text-muted small">Managed MCQ Assessment</span>
                    </div>
                </div>
                
                <div className="bg-light p-4 rounded-4 mb-4">
                    <h6 className="fw-bold text-primary mb-3 d-flex align-items-center gap-2">
                        < Zap size={18} /> PROCTORING RULES:
                    </h6>
                    <div className="row g-3">
                        <div className="col-md-6">
                            <div className="d-flex align-items-start gap-2 small text-muted">
                                <FileText size={16} className="mt-1 flex-shrink-0" />
                                <span>{questions.length} Questions • {exam.durationMinutes} Minutes</span>
                            </div>
                        </div>
                        {exam.fullscreenMode && (
                            <div className="col-md-6">
                                <div className="d-flex align-items-start gap-2 small text-danger fw-bold">
                                    <ShieldAlert size={16} className="mt-1 flex-shrink-0" />
                                    <span>Fullscreen Enforcement Enabled</span>
                                </div>
                            </div>
                        )}
                        {exam.tabLock && (
                            <div className="col-md-6">
                                <div className="d-flex align-items-start gap-2 small text-danger fw-bold">
                                    <Lock size={16} className="mt-1 flex-shrink-0" />
                                    <span>Forbidden Context Switching (Tab-Lock)</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="border-top pt-4">
                    <div className="row g-3 mb-4">
                        <div className="col-md-6">
                            <label className="form-label small fw-bold">Full Name</label>
                            <input 
                                type="text" 
                                className="form-control rounded-3" 
                                placeholder="Enter your full name"
                                value={candidateInfo.name}
                                onChange={e => setCandidateInfo(prev => ({ ...prev, name: e.target.value }))}
                            />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label small fw-bold">Email Address</label>
                            <input 
                                type="email" 
                                className="form-control rounded-3" 
                                placeholder="name@example.com"
                                value={candidateInfo.email}
                                onChange={e => setCandidateInfo(prev => ({ ...prev, email: e.target.value }))}
                            />
                        </div>
                    </div>
                    
                    <p className="text-muted small mb-4">By clicking <b>Launch Assessment</b>, you agree to follow all proctoring rules. This session will be tied to your identity.</p>
                    <button 
                        className="btn btn-primary btn-lg w-100 rounded-pill fw-bold py-3 shadow" 
                        onClick={startAssessment}
                        disabled={!candidateInfo.name || !candidateInfo.email}
                    >
                        Register & Launch Assessment
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-vh-100 d-flex flex-column bg-white overflow-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>
            {/* Security Warning Overlay */}
            {showWarning && (
                <div className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-75 z-2000 d-flex align-items-center justify-content-center animate-fade-in">
                    <div className="bg-white p-5 rounded-4 shadow-lg text-center max-w-500 border border-4 border-danger">
                        <div className="text-danger mb-4"><ShieldAlert size={80} className="mx-auto" /></div>
                        <h2 className="fw-bold text-dark mb-2">PROCTORING VIOLATION</h2>
                        <p className="text-muted mb-4">You have exited fullscreen mode. Please return to fullscreen immediately. Failure to do so in <b>5 seconds</b> will result in automatic submission.</p>
                        <button className="btn btn-danger btn-lg rounded-pill px-5 fw-bold w-100" onClick={enterFullscreen}>
                            Return to Fullscreen
                        </button>
                    </div>
                </div>
            )}

            {/* Top Bar (Sticky) */}
            <header className="navbar navbar-light bg-white border-bottom shadow-sm px-4 py-2 sticky-top" style={{ height: '70px', zIndex: 1030 }}>
                <div className="d-flex align-items-center gap-3">
                    <div className="bg-primary p-2 rounded-3 text-white"><FileText size={20} /></div>
                    <div>
                        <h6 className="mb-0 fw-bold text-dark text-truncate max-w-200">{exam.title} <span className="text-muted fw-normal d-none d-md-inline">| MCQ Assessment</span></h6>
                        <div className="d-flex align-items-center gap-2 mt-1">
                            <span className="badge bg-light text-primary border border-primary-subtle rounded-pill fs-xs">PROCTORING ACTIVE</span>
                            <span className="text-muted fs-xs opacity-50 fw-bold">ID: #{examId.slice(-4).toUpperCase()}</span>
                        </div>
                    </div>
                </div>

                <div className="d-flex align-items-center gap-4">
                     {!isReviewMode && (
                        <>
                            <div className="d-flex align-items-center gap-2 bg-dark bg-opacity-10 px-4 py-2 rounded-3 border">
                                <span className="small text-muted fw-bold d-none d-lg-inline">TIME LEFT:</span>
                                <span className="fw-bold text-danger fs-5"><Timer initialTime={exam.durationMinutes * 60} onTimeUp={() => handleAutoSubmit("Time Expired")} /></span>
                            </div>
                            <button className="btn btn-primary fw-bold px-4 rounded-3 shadow-sm py-2 d-none d-md-block" onClick={() => handleAutoSubmit("Manual Submission")}>
                                Submit Exam
                            </button>
                        </>
                    )}
                </div>
            </header>

            <div className="d-flex flex-grow-1 overflow-hidden h-100">
                {/* Main Content Area */}
                <main className="flex-grow-1 overflow-auto bg-light p-4 p-lg-5">
                    <div className="mx-auto" style={{ maxWidth: '1000px' }}>
                        <QuestionCard
                            question={questions[currentIdx]}
                            idx={currentIdx}
                            total={questions.length}
                            selectedOption={answers[questions[currentIdx]?.id]}
                            onSelect={handleOptionSelect}
                            negativeMarks={exam.negativeMarks}
                            disabled={isReviewMode}
                        />

                        {/* Navigation Controls */}
                        <div className="d-flex justify-content-between mt-5 pt-3">
                            <button className="btn btn-white shadow-sm border border-light-subtle rounded-pill px-4 py-2 fw-medium" disabled={currentIdx === 0} onClick={() => jumpToQuestion(currentIdx - 1)}>
                                <ChevronLeft className="me-2 text-muted" size={18} /> Previous
                            </button>
                            {!isReviewMode && (
                                <div className="d-flex gap-2">
                                    <button 
                                        onClick={toggleMarkForReview}
                                        className={`btn rounded-pill px-4 py-2 fw-bold transition-all ${marked.has(questions[currentIdx]?.id) ? 'btn-warning' : 'btn-outline-warning'}`}
                                    >
                                        {marked.has(questions[currentIdx]?.id) ? "Unmark" : "Mark for Review"}
                                    </button>
                                    <button className="btn btn-primary rounded-pill px-5 py-2 fw-bold shadow" onClick={() => (currentIdx === questions.length - 1) ? handleAutoSubmit("Manual Submission") : jumpToQuestion(currentIdx + 1)}>
                                        {(currentIdx === questions.length - 1) ? "Final Submit" : "Save & Next"} <ChevronRight className="ms-2" size={18} />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </main>

                {/* Question Palette Sidebar */}
                <aside className="bg-white border-start flex-shrink-0 p-4 d-none d-lg-block" style={{ width: '350px', overflowY: 'auto' }}>
                    <div className="p-3 bg-light rounded-4 border border-light-subtle mb-4">
                        <div className="d-flex align-items-center gap-3">
                            <div className="bg-white border rounded-3 p-2 shadow-sm text-secondary"><User size={24} /></div>
                            <div>
                                <div className="small text-muted">Assessment User:</div>
                                <div className="fw-bold text-dark fs-6 text-truncate max-w-150">{candidateInfo.name || 'Candidate'}</div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-light p-3 rounded-4 border border-light-subtle mb-4">
                        <div className="row g-2">
                            {[
                                { status: 'answered', label: 'Answered', color: '#198754', shape: 'square' },
                                { status: 'not-answered', label: 'Not Answered', color: '#dc3545', shape: 'square' },
                                { status: 'not-visited', label: 'Not Visited', color: '#ffffff', shape: 'square', border: true },
                                { status: 'marked', label: 'Marked', color: '#fd7e14', shape: 'circle' },
                                { status: 'answered-marked', label: 'Answered & Marked', color: '#6f42c1', shape: 'circle', icon: true }
                            ].map((stat, i) => {
                                const count = questions.filter((_, idx) => getStatus(idx) === stat.status).length;
                                return (
                                    <div className="col-6" key={i}>
                                        <div className="d-flex align-items-center gap-2">
                                            <div 
                                                className={`d-flex align-items-center justify-content-center fw-bold text-white shadow-sm`}
                                                style={{ 
                                                    width: '24px', height: '24px', 
                                                    backgroundColor: stat.color,
                                                    borderRadius: stat.shape === 'circle' ? '50%' : '4px',
                                                    fontSize: '0.6rem',
                                                    border: stat.border ? '1px solid #dee2e6' : 'none',
                                                    color: stat.border ? '#6c757d' : 'white'
                                                }}
                                            >
                                                {stat.icon && <ShieldCheck size={12} />}
                                                {!stat.icon && count}
                                            </div>
                                            <span className="text-muted fw-bold" style={{ fontSize: '0.65rem' }}>{stat.label}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="p-3 border rounded-4 mb-4">
                        <div className="d-flex flex-wrap gap-2">
                            {questions.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => jumpToQuestion(i)}
                                    className={`palette-btn transition-all ${currentIdx === i ? 'current' : ''} ${getStatus(i)}`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="bg-primary bg-opacity-10 p-3 rounded-4 border border-primary border-opacity-10 mt-5">
                        <div className="d-flex align-items-center gap-2 text-primary fw-bold small mb-1">
                            <ShieldCheck size={16} /> SECURED BY EXAMPRO
                        </div>
                        <p className="fs-xs text-muted mb-0">Browsing activity is monitored by active proctoring protocols.</p>
                    </div>
                </aside>
            </div>

            <style>{`
                .palette-btn {
                    width: 38px; height: 38px; border: 1px solid #dee2e6; border-radius: 8px;
                    background: white; font-weight: bold; font-size: 0.85rem; color: #495057; display: flex; align-items: center; justify-content: center;
                }
                .palette-btn.current { border-color: #0d6efd; border-width: 2px; box-shadow: 0 0 0 3px rgba(13, 110, 253, 0.1); }
                .palette-btn.answered { background: #198754; color: white; border-color: #198754; }
                .palette-btn.not-answered { background: #dc3545; color: white; border-color: #dc3545; }
                .palette-btn.not-visited { background: white; color: #adb5bd; }
                .palette-btn.marked { background: #fd7e14; color: white; border-color: #fd7e14; border-radius: 50%; }
                .palette-btn.answered-marked { background: #6f42c1; color: white; border-color: #6f42c1; border-radius: 50%; position: relative; }
                .palette-btn.answered-marked::after { content: '✓'; position: absolute; bottom: -2px; right: -2px; background: #198754; color: white; font-size: 8px; width: 12px; height: 12px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 1px solid white; }
                
                .bg-royal { background: #f8fafc; }
                .max-w-700 { max-width: 700px; }
                .max-w-500 { max-width: 500px; }
                .z-2000 { z-index: 2000; }
                .fs-xs { font-size: 0.7rem; }
                .tracking-tight { letter-spacing: -0.01em; }
                
                .animate-spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .animate-fade-in { animation: fadeIn 0.4s ease-out; }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                .animate-slide-up { animation: slideUp 0.4s cubic-bezier(0, 0, 0.2, 1); }
                @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                .transition-all { transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); }
            `}</style>
        </div>
    );
};

export default AttemptExam;
