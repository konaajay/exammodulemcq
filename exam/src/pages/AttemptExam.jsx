import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
    Clock, ShieldAlert, ChevronLeft, ChevronRight, CheckCircle,
    Info, Maximize2, AlertTriangle, CloudOff, RefreshCw
} from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import { examService } from '../services/examService';

import { useExamAttempt } from '../components/ExamAttempt/useExamAttempt';
import Palette from '../components/ExamAttempt/Palette';

const AttemptExam = () => {
    const { id: examId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    
    const [exam, setExam] = useState(null);
    const [attemptId, setAttemptId] = useState(null);
    const [checkingAttempt, setCheckingAttempt] = useState(true);
    const {
        loading,
        questions,
        answers,
        attempt,
        visited,
        currentIdx, setCurrentIdx,
        status, setStatus,
        warningCount,
        isSyncing,
        handleOptionSelect,
        markVisited
    } = useExamAttempt(attemptId, (reason) => handleFinalSubmit(reason));

    const [isFullscreen, setIsFullscreen] = useState(false);

    const toggleFullscreen = useCallback(() => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                toast.error("Fullscreen failed to launch.");
            });
            setIsFullscreen(true);
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
                setIsFullscreen(false);
            }
        }
    }, []);

    useEffect(() => {
        const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement);
        document.addEventListener('fullscreenchange', handleFsChange);
        return () => document.removeEventListener('fullscreenchange', handleFsChange);
    }, []);

    // Auto-enter fullscreen if required
    useEffect(() => {
        if (attemptId && exam?.fullscreenMode && !document.fullscreenElement) {
            toast.info("Fullscreen mode is mandatory for this exam.");
            document.documentElement.requestFullscreen().catch(() => {});
        }
    }, [attemptId, exam]);

    useEffect(() => {
        const initialize = async () => {
            try {
                // 1. Fetch Exam Details
                const examData = await examService.getExamById(examId);
                setExam(examData);

                // 2. Check for existing 'STARTED' attempt
                const attempts = await examService.getMyAttempts();
                const ongoing = (Array.isArray(attempts) ? attempts : (attempts.data || []))
                    .find(a => String(a.examId) === String(examId) && a.status === 'STARTED');
                
                if (ongoing) {
                    setAttemptId(ongoing.id);
                }
            } catch (e) { 
                console.error(e);
                toast.error("Initialization failed."); 
            } finally {
                setCheckingAttempt(false);
            }
        };
        if (examId) initialize();
    }, [examId]);

    const handleStartExam = async () => {
        try {
            const newAttempt = await examService.startExam(examId, {
                studentId: user.id,
                name: user.name,
                email: user.email
            });
            setAttemptId(newAttempt.id || newAttempt.data?.id);
            toast.success("Exam Started!");
        } catch (error) {
            toast.error("Failed to start exam. Check your connection.");
        }
    };

    const handleFinalSubmit = useCallback(async (type = "Manual") => {
        try {
            await examService.submitExam(attemptId);
            setStatus('COMPLETED');
            toast.success(`${type} Submit Successful!`);
            navigate('/result', { state: { attemptId, examId, type } });
        } catch (error) {
            toast.error("Submission failed. Please try again.");
        }
    }, [attemptId, examId, navigate, setStatus]);

    const nextQuestion = useCallback(() => {
        if (currentIdx < questions.length - 1) {
            const nextIdx = currentIdx + 1;
            setCurrentIdx(nextIdx);
            markVisited(nextIdx);
        }
    }, [currentIdx, questions.length, markVisited, setCurrentIdx]);

    const prevQuestion = useCallback(() => {
        if (currentIdx > 0) {
            setCurrentIdx(currentIdx - 1);
        }
    }, [currentIdx, setCurrentIdx]);

    if (loading || checkingAttempt || !exam) return (
        <div className="min-vh-100 d-flex flex-column align-items-center justify-content-center bg-light">
            <div className="spinner-border text-primary mb-3" role="status" />
            <div className="fw-bold text-secondary animate-pulse">Initializing Secure Assessment Environment...</div>
        </div>
    );

    // Instructions Screen if no attemptId yet
    if (!attemptId) {
        return (
            <div className="min-vh-100 bg-light py-5">
                <div className="container max-w-800">
                    <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
                        <div className="bg-primary p-4 text-white">
                            <h2 className="h4 fw-bold mb-0">Examination Instructions</h2>
                        </div>
                        <div className="card-body p-4 p-lg-5">
                            <div className="mb-4 pb-4 border-bottom">
                                <h3 className="h5 fw-bold text-dark">{exam.title}</h3>
                                <p className="text-muted small">{exam.description}</p>
                            </div>

                            <div className="instructions-content mb-5">
                                <pre className="text-secondary" style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
                                    {exam.instructions}
                                </pre>
                            </div>

                            <div className="row g-3 mb-5">
                                <div className="col-6 col-md-3">
                                    <div className="bg-light p-3 rounded-3 text-center">
                                        <div className="text-muted fs-xs fw-bold uppercase">Duration</div>
                                        <div className="fw-bold text-dark">{exam.durationMinutes}m</div>
                                    </div>
                                </div>
                                <div className="col-6 col-md-3">
                                    <div className="bg-light p-3 rounded-3 text-center">
                                        <div className="text-muted fs-xs fw-bold uppercase">Passing</div>
                                        <div className="fw-bold text-dark">{exam.passPercentage}%</div>
                                    </div>
                                </div>
                                <div className="col-6 col-md-3">
                                    <div className="bg-light p-3 rounded-3 text-center">
                                        <div className="text-muted fs-xs fw-bold uppercase">Attempts</div>
                                        <div className="fw-bold text-dark">{exam.maxAttempts}</div>
                                    </div>
                                </div>
                                <div className="col-6 col-md-3">
                                    <div className="bg-light p-3 rounded-3 text-center">
                                        <div className="text-muted fs-xs fw-bold uppercase">Neg. Marks</div>
                                        <div className="fw-bold text-dark">{exam.negativeMarks}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="alert alert-info border-0 rounded-4 d-flex gap-3 align-items-center">
                                <Info size={24} className="flex-shrink-0" />
                                <div className="small">
                                    By clicking <b>Start Assessment</b>, you agree to the proctoring terms. 
                                    Switching tabs more than 3 times will result in auto-submission.
                                </div>
                            </div>

                            <div className="mt-5 pt-4 border-top d-flex gap-3">
                                <button onClick={() => navigate(-1)} className="btn btn-outline-secondary px-4 py-2 rounded-pill fw-bold">
                                    Cancel
                                </button>
                                <button onClick={handleStartExam} className="btn btn-primary flex-grow-1 py-2 rounded-pill fw-bold shadow-indigo">
                                    Start Assessment
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-vh-100 d-flex flex-column align-items-center justify-content-center bg-royal">
                <div className="spinner-border text-primary border-4 mb-3" style={{ width: '3rem', height: '3rem' }}></div>
                <h5 className="text-secondary fw-bold">Initializing Assessment Environment...</h5>
            </div>
        );
    }

    if (attemptId && questions.length === 0) {
        return (
            <div className="min-vh-100 d-flex flex-column align-items-center justify-content-center bg-royal">
                <div className="bg-white p-5 rounded-4 shadow-lg text-center max-w-500" style={{ maxWidth: '500px' }}>
                    <ShieldAlert size={60} className="text-warning mb-4 mx-auto" />
                    <h3 className="fw-bold text-dark mb-3">No Questions Found</h3>
                    <p className="text-muted mb-4">This exam paper does not contain any questions. Please contact your administrator.</p>
                    <button onClick={() => navigate(-1)} className="btn btn-primary rounded-pill px-5 py-2 fw-bold">Go Back</button>
                </div>
            </div>
        );
    }

    const currentQuestion = questions[currentIdx] || {};

    return (
        <div className="exam-app-container">
            <ToastContainer position="top-center" autoClose={3000} />
            
            <header className="exam-header bg-white border-bottom shadow-sm">
                <div className="d-flex align-items-center justify-content-between h-100 px-4">
                    <div className="d-flex align-items-center gap-3">
                        <div className="bg-primary bg-opacity-10 p-2 rounded-3 text-primary d-none d-md-flex">
                            <ShieldAlert size={24} />
                        </div>
                        <div>
                            <h5 className="fw-bold mb-0 text-dark">{exam.title}</h5>
                            <div className="d-flex gap-2 mt-1">
                                <span className="badge bg-light text-primary border rounded-pill fs-xs">PROCTORING ACTIVE</span>
                                {attempt && (
                                    <span className="badge bg-info bg-opacity-10 text-info border rounded-pill fs-xs">
                                        ATTEMPT {attempt.attemptNumber} OF {exam.maxAttempts}
                                    </span>
                                )}
                                {isSyncing && <span className="badge bg-info bg-opacity-10 text-info border rounded-pill fs-xs animate-pulse">SYNCING...</span>}
                            </div>
                        </div>
                    </div>

                    <div className="d-flex align-items-center gap-3">
                        {!isFullscreen && (
                            <button 
                                onClick={toggleFullscreen}
                                className="btn btn-outline-primary btn-sm rounded-pill px-3 d-flex align-items-center gap-2"
                            >
                                <Maximize2 size={16} /> Maximize
                            </button>
                        )}
                        <div className="timer-box bg-dark text-white px-4 py-2 rounded-3 d-flex align-items-center gap-2 shadow-sm">
                            <Clock size={18} className="text-warning" />
                            <Timer 
                                initialTime={exam.durationMinutes * 60} 
                                onTimeUp={() => handleFinalSubmit("Timeout")} 
                            />
                        </div>
                        <button className="btn btn-primary fw-bold px-4 rounded-3" onClick={() => handleFinalSubmit("Manual")}>
                            Finish Exam
                        </button>
                    </div>
                </div>
            </header>

            <div className="exam-layout">
                <main className="question-area bg-white p-4 p-lg-5">
                    <div className="max-w-800 mx-auto">
                        <div className="d-flex align-items-center justify-content-between mb-4">
                            <span className="badge bg-primary rounded-pill px-3 py-2">QUESTION {currentIdx + 1} OF {questions.length}</span>
                            <span className="text-muted small fw-bold">{currentQuestion.marks} Marks</span>
                        </div>

                        <h3 className="fw-bold text-dark mb-5 lh-base" style={{ fontSize: '1.6rem' }}>
                            {currentQuestion.questionText}
                        </h3>

                        <div className="options-grid vstack gap-3 mb-5">
                            {['A', 'B', 'C', 'D'].map((key) => {
                                const optionText = currentQuestion[`option${key}`];
                                const isSelected = answers[currentQuestion.id] === key;
                                return (
                                    <button 
                                        key={key}
                                        className={`option-card ${isSelected ? 'selected' : ''}`}
                                        onClick={() => handleOptionSelect(currentQuestion.id, key)}
                                    >
                                        <div className="opt-key shadow-sm">{key}</div>
                                        <div className="opt-text">{optionText}</div>
                                        <div className="opt-status">{isSelected && <CheckCircle size={20} />}</div>
                                    </button>
                                );
                            })}
                        </div>

                        <div className="d-flex justify-content-between pt-5 border-top mt-5">
                            <button className="btn btn-outline-secondary px-4 py-2 rounded-3 fw-bold" disabled={currentIdx === 0} onClick={prevQuestion}>
                                Previous
                            </button>
                            <button className="btn btn-primary px-5 py-2 rounded-3 fw-bold shadow-indigo" onClick={nextQuestion}>
                                {currentIdx === questions.length - 1 ? "End of Exam" : "Save & Next"}
                            </button>
                        </div>
                    </div>
                </main>

                <Palette 
                    total={questions.length}
                    currentIdx={currentIdx}
                    visited={visited}
                    answers={answers}
                    questions={questions}
                    onSelect={(idx) => { setCurrentIdx(idx); markVisited(idx); }}
                />
            </div>

            {warningCount > 0 && warningCount < 3 && (
                <div className="security-toast animate-slide-up">
                    <AlertTriangle size={24} className="text-warning" />
                    <div>
                        <div className="fw-bold">Security Violation Detected</div>
                        <div className="x-small opacity-75">Warning {warningCount}/3: Avoid switching tabs.</div>
                    </div>
                </div>
            )}

            <style>{`
                .exam-app-container { display: flex; flex-direction: column; min-height: 100vh; background: #f8fafc; font-family: 'Inter', sans-serif; }
                .exam-header { height: 80px; flex-shrink: 0; }
                .exam-layout { display: flex; flex: 1; }
                .question-area { flex: 1; position: relative; }
                .max-w-800 { max-width: 800px; }
                
                .option-card {
                    display: flex;
                    align-items: center;
                    width: 100%;
                    padding: 1.25rem;
                    background: #ffffff;
                    border: 2px solid #e2e8f0;
                    border-radius: 16px;
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                    text-align: left;
                    gap: 1.25rem;
                }
                .option-card:hover { border-color: #0d6efd; background: #f8fafc; transform: translateX(5px); }
                .option-card.selected { border-color: #0d6efd; background: #eff6ff; box-shadow: 0 4px 12px rgba(13, 110, 253, 0.1); }
                
                .opt-key {
                    width: 36px;
                    height: 36px;
                    background: #f1f5f9;
                    color: #64748b;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 800;
                    flex-shrink: 0;
                }
                .selected .opt-key { background: #0d6efd; color: white; }
                .opt-text { flex: 1; font-weight: 600; color: #334155; }
                .opt-status { width: 24px; color: #0d6efd; }
                
                .security-toast {
                    position: fixed;
                    bottom: 2rem;
                    left: 2rem;
                    background: #1e293b;
                    color: white;
                    padding: 1rem 1.5rem;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    box-shadow: 0 10px 25px rgba(0,0,0,0.2);
                    z-index: 1000;
                }
                
                .fs-xs { font-size: 0.7rem; }
                .animate-pulse { animation: pulse 2s infinite; }
                @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
                .animate-slide-up { animation: slideUp 0.3s ease-out; }
                @keyframes slideUp { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
            `}</style>
        </div>
    );
};

const Timer = ({ initialTime, onTimeUp }) => {
    const [timeLeft, setTimeLeft] = useState(initialTime);
    const timerRef = useRef(null);

    useEffect(() => {
        timerRef.current = setInterval(() => {
            setTimeLeft(prev => prev > 0 ? prev - 1 : 0);
        }, 1000);
        return () => clearInterval(timerRef.current);
    }, []);

    useEffect(() => {
        if (timeLeft === 0) {
            onTimeUp();
        }
    }, [timeLeft, onTimeUp]);

    const format = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    return <span className="font-monospace">{format(timeLeft)}</span>;
};

export default AttemptExam;
