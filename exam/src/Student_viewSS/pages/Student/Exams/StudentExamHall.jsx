import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { studentService } from '../../../services/studentService';
import {
    Clock,
    ChevronLeft,
    ChevronRight,
    CheckCircle,
    AlertTriangle,
    Flag,
    ArrowRight,
    Info,
    AlertCircle,
    Play,
    Loader2
} from 'lucide-react';
import { useToast } from '../../../context/ToastContext';
import InstructionView from './components/InstructionView';
import { useRef } from 'react';


const StudentExamHall = () => {
    const { examId } = useParams();
    const navigate = useNavigate();
    const toast = useToast();

    const [loading, setLoading] = useState(true);
    const [examDetails, setExamDetails] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [sections, setSections] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [timeLeft, setTimeLeft] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [result, setResult] = useState(null);
    const [attemptId, setAttemptId] = useState(null);
    const [submitCountdown, setSubmitCountdown] = useState(10);
    const [showSubmitModal, setShowSubmitModal] = useState(false);
    const [isFetchingResult, setIsFetchingResult] = useState(false);
    const [isInstructionMode, setIsInstructionMode] = useState(true);
    const [agreed, setAgreed] = useState(false);

    const questionPanelRef = useRef(null);
    const paletteRef = useRef(null);

    useEffect(() => {
        const fetchExamData = async () => {
            setLoading(true);
            try {
                // Step 1: Get Details
                const details = await studentService.getExamDetails(examId);
                setExamDetails(details);

                // Step 2: Get or Start Attempt
                let currentAttemptId = null;
                console.log(`[ExamHall] Checking for active attempt for exam ${examId}...`);
                
                try {
                    const active = await studentService.getActiveAttempt(examId);
                    if (active && (active.attemptId || active.id)) {
                        currentAttemptId = active.attemptId || active.id;
                    } else {
                        const start = await studentService.startExam(examId);
                        currentAttemptId = start?.attemptId || start?.id;
                    }
                } catch (err) {
                    console.warn("[ExamHall] Failed to get/start attempt:", err);
                    throw err;
                }
                setAttemptId(currentAttemptId);

                // Step 3: Get Questions and Sections
                console.log(`[ExamHall] Fetching questions and sections for Exam ID: ${examId}`);
                const sectionsData = await studentService.getExamSections(examId);
                
                let allQuestions = [];
                if (Array.isArray(sectionsData)) {
                    allQuestions = sectionsData.reduce((acc, sec) => {
                        const secQuestions = (sec.questions || []).map(q => {
                            const qId = q.examQuestionId || q.id;
                            const mappedOptions = (q.options || []).map((opt, oIdx) => ({
                                ...opt,
                                id: opt.optionId || opt.id || oIdx
                            }));

                            return {
                                ...q,
                                id: qId,
                                examQuestionId: qId,
                                options: mappedOptions,
                                sectionId: sec.sectionId,
                                sectionName: sec.sectionName || "General",
                                sectionDescription: sec.sectionDescription || ""
                            };
                        });
                        return [...acc, ...secQuestions];
                    }, []);
                }

                setQuestions(allQuestions);
                setSections(sectionsData || []);

                const duration = details.durationMinutes || details.duration || details.examDuration || 60;
                setTimeLeft(duration * 60);

            } catch (error) {
                console.error("[ExamHall] CRITICAL Error:", error);
                toast.error(error.message || "Could not load examination.");
                setTimeout(() => navigate('/student/exams'), 2000);
            } finally {
                setLoading(false);
            }
        };

        if (examId) fetchExamData();
    }, [examId, navigate, toast]);
    
    useEffect(() => {
        if (questionPanelRef.current) {
            questionPanelRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }

        if (paletteRef.current) {
            const activeBtn = paletteRef.current.querySelector('.btn-primary');
            if (activeBtn) {
                activeBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            }
        }
    }, [currentQuestionIndex]);

    // Timer Logic
    useEffect(() => {
        if (!timeLeft || result) return;

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleSubmitExam();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, result]);

    // Submission Countdown Logic
    useEffect(() => {
        let timer;
        if (showSubmitModal && submitCountdown > 0) {
            timer = setInterval(() => {
                setSubmitCountdown(prev => prev - 1);
            }, 1000);
        } else if (showSubmitModal && submitCountdown === 0) {
            handleFetchResult();
        }
        return () => clearInterval(timer);
    }, [showSubmitModal, submitCountdown]);

    const handleFetchResult = async () => {
        if (isFetchingResult) return;
        setIsFetchingResult(true);
        try {
            const finalResult = await studentService.getResultWithRetry(examId, attemptId);
            setResult(finalResult);
            setShowSubmitModal(false);
        } catch (error) {
            console.error("Result fetch failed", error);
            toast.error("Result is taking longer than expected. Please check your dashboard later.");
            setTimeout(() => navigate('/student/exams'), 3000);
        } finally {
            setIsFetchingResult(false);
        }
    };

    const formatTime = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h > 0 ? h + ':' : ''}${m < 10 ? '0' + m : m}:${s < 10 ? '0' + s : s}`;
    };

    const handleSelectOption = async (questionId, optionId) => {
        setAnswers({
            ...answers,
            [questionId]: optionId
        });

        const payload = {
            examQuestionId: questionId,
            selectedOptionId: parseInt(optionId)
        };

        if (examId && payload.examQuestionId) {
            try {
                await studentService.saveResponse(examId, payload);
            } catch (e) {
                console.warn("Failed to save response in background", e);
            }
        }
    };

    const handleSubmitExam = async () => {
        if (isSubmitting || !attemptId) return;

        setIsSubmitting(true);
        try {
            await studentService.submitExam(examId);
            toast.success("Exam submitted successfully!");
            setShowSubmitModal(true);
            setSubmitCountdown(10);
        } catch (error) {
            console.error("Submission failed", error);
            toast.error("An error occurred while submitting your exam.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleStartExam = () => {
        if (!agreed) return;
        setIsInstructionMode(false);
    };


    if (loading) return (
        <div className="vh-100 d-flex justify-content-center align-items-center bg-light">
            <div className="spinner-border text-primary" />
        </div>
    );

    if (isInstructionMode) {
        return (
            <InstructionView
                examData={examDetails}
                agreed={agreed}
                setAgreed={setAgreed}
                onStart={handleStartExam}
            />
        );
    }


    if (result) return (
        <div className="container py-5">
            <div className="row justify-content-center">
                <div className="col-12 col-md-8 col-lg-6">
                    <div className="card border-0 shadow-lg text-center overflow-hidden rounded-4">
                        <div className={`p-5 ${result.isPassed ? 'bg-success' : 'bg-primary'} text-white`}>
                            <CheckCircle size={80} className="mb-4" />
                            <h2 className="fw-bold mb-2">Examination Completed!</h2>
                            <p className="opacity-75 mb-0">Your result has been evaluated successfully.</p>
                        </div>
                        <div className="card-body p-5">
                            <div className="row g-4 mb-5">
                                <div className="col-6">
                                    <div className="p-3 bg-light rounded-3">
                                        <div className="small text-muted text-uppercase fw-bold mb-1">Score</div>
                                        <h3 className="fw-bold text-body mb-0">{result.obtainedMarks || 0} / {result.totalMarks || 100}</h3>
                                    </div>
                                </div>
                                <div className="col-6">
                                    <div className="p-3 bg-light rounded-3">
                                        <div className="small text-muted text-uppercase fw-bold mb-1">Percentage</div>
                                        <h3 className="fw-bold text-body mb-0">{(result.percentage || 0).toFixed(1)}%</h3>
                                    </div>
                                </div>
                            </div>

                            <div className={`alert ${result.isPassed ? 'alert-success' : 'alert-info'} border-0 mb-5`}>
                                <h5 className="fw-bold mb-1">{result.isPassed ? "Congratulations! You Passed." : "Keep up the work!"}</h5>
                                <p className="small mb-0 opacity-75">You have successfully finished and your score is {result.obtainedMarks || 0}.</p>
                            </div>

                            <div className="d-grid gap-3">
                                <button className="btn btn-primary btn-lg rounded-pill fw-bold" onClick={() => navigate('/student/grades')}>
                                    View Overall Grades
                                </button>
                                <button className="btn btn-outline-secondary rounded-pill" onClick={() => navigate('/student/dashboard')}>
                                    Return to Dashboard
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const currentQ = questions[currentQuestionIndex];

    return (
        <div className="vh-100 bg-white d-flex flex-column text-body overflow-hidden">
            {/* Exam Header */}
            <div className="px-4 py-3 border-bottom d-flex justify-content-between align-items-center bg-light shadow-sm">
                <div>
                    <h5 className="fw-bold mb-0 text-primary">{examDetails?.examTitle || "Examination Hall"}</h5>
                    <div className="small text-muted fw-medium">{questions.length} Questions</div>
                </div>
                <div className="d-flex align-items-center gap-4">
                    <div className={`p-2 px-3 rounded-pill fw-bold d-flex align-items-center gap-2 ${timeLeft < 300 ? 'bg-danger text-white' : 'bg-white border text-dark shadow-sm'}`}>
                        <Clock size={18} />
                        <span style={{ minWidth: '70px', textAlign: 'center' }}>{formatTime(timeLeft)}</span>
                    </div>
                    <button className="btn btn-primary px-4 fw-bold rounded-pill shadow-sm" onClick={handleSubmitExam} disabled={isSubmitting}>
                        {isSubmitting ? "Submitting..." : "Finish Attempt"}
                    </button>
                </div>
            </div>

            <main className="flex-grow-1 overflow-hidden d-flex">
                {/* Main Question Panel */}
                <div ref={questionPanelRef} className="flex-grow-1 overflow-auto p-4 p-lg-5">
                    {questions.length > 0 ? (
                        <div className="mx-auto" style={{ maxWidth: '800px' }}>
                            <div className="d-flex align-items-center justify-content-between mb-4">
                                <span className="badge bg-secondary rounded-pill px-3">Question {currentQuestionIndex + 1} of {questions.length}</span>
                                <span className="small text-muted fw-bold">Marks: {currentQ?.marks || 1}</span>
                            </div>

                            <h3 className="fw-bold mb-5 lh-base text-body">
                                {currentQ?.questionText || "No question text available."}
                            </h3>

                            <div className="options-area py-3 transition-all">
                                <div className="options-grid d-flex flex-column gap-3">
                                    {(currentQ?.options || []).map((opt, idx) => (
                                        <div
                                            key={opt.id || idx}
                                            className={`p-4 border rounded-4 cursor-pointer transition-all d-flex align-items-center gap-4 ${answers[currentQ.id] === opt.id ? 'border-primary bg-primary bg-opacity-10' : 'hover-bg-light shadow-sm'
                                                }`}
                                            onClick={() => handleSelectOption(currentQ.id, opt.id)}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <div className={`flex-shrink-0 d-flex align-items-center justify-content-center rounded-circle border-2 ${answers[currentQ.id] === opt.id ? 'bg-primary border-primary text-white' : 'border-secondary text-secondary'
                                                }`} style={{ width: '28px', height: '28px', fontWeight: 'bold' }}>
                                                {String.fromCharCode(65 + idx)}
                                            </div>
                                            <div className="d-flex flex-column gap-2 py-1">
                                                {opt.optionImageUrl && (
                                                    <img
                                                        src={opt.optionImageUrl}
                                                        alt={`Option ${idx + 1}`}
                                                        className="img-fluid rounded-3 mb-2 shadow-sm border"
                                                        style={{ maxHeight: '180px', objectFit: 'contain', width: 'fit-content' }}
                                                    />
                                                )}
                                                <div className="fw-medium text-body">{opt.optionText}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center p-5">
                            <Info size={48} className="text-muted mb-3" />
                            <h5>No questions found for this examination.</h5>
                        </div>
                    )}
                </div>

                {/* Sidebar Navigation */}
                <div className="border-start bg-light overflow-hidden d-none d-lg-flex flex-column p-4" style={{ width: '320px' }}>
                    <div className="flex-grow-1 overflow-auto mb-4" ref={paletteRef}>
                    <div className="mb-4">
                        <h6 className="fw-bold text-uppercase x-small text-muted mb-3 opacity-75">Question Navigator</h6>
                        <div className="row g-2">
                            {questions.map((q, idx) => (
                                <div className="col-3" key={q.id || idx}>
                                    <button
                                        className={`btn w-100 p-0 rounded-3 d-flex align-items-center justify-content-center fw-bold transition-all ${currentQuestionIndex === idx ? 'btn-primary shadow-sm scale-110' :
                                            answers[q.id] ? 'btn-success bg-opacity-10 text-success border-success' :
                                                'btn-outline-secondary'
                                            }`}
                                        style={{ height: '40px', fontSize: '14px' }}
                                        onClick={() => setCurrentQuestionIndex(idx)}
                                    >
                                        {idx + 1}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="card border-0 shadow-sm rounded-4 mt-auto">
                        <div className="card-body p-4 bg-white">
                            <div className="d-flex align-items-center gap-2 mb-3 text-info">
                                <HelpCircle size={18} />
                                <span className="small fw-bold">Need Help?</span>
                            </div>
                            <p className="smaller text-muted mb-0">For technical issues, use the support widget below. Questions are automatically saved as you navigate.</p>
                        </div>
                    </div>
                </div>
            </main>

            {/* Sticky Navigation Footer */}
            <div className="px-4 py-3 border-top d-flex justify-content-between align-items-center bg-white shadow-lg sticky-bottom">
                <button
                    className="btn btn-outline-secondary px-4 fw-bold rounded-pill d-flex align-items-center gap-2"
                    onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                    disabled={currentQuestionIndex === 0}
                >
                    <ChevronLeft size={20} /> Previous
                </button>
                <div className="d-none d-md-flex gap-2">
                    {questions.map((_, idx) => (
                        <div
                            key={idx}
                            className={`rounded-circle transition-all ${idx === currentQuestionIndex ? 'bg-primary' : (answers[questions[idx]?.id] ? 'bg-success' : 'bg-light border')}`}
                            style={{ width: '8px', height: '8px', opacity: idx === currentQuestionIndex ? 1 : 0.5 }}
                        />
                    ))}
                </div>
                {questions.length > 0 && currentQuestionIndex < questions.length - 1 ? (
                    <button
                        className="btn btn-outline-primary px-4 fw-bold rounded-pill d-flex align-items-center gap-2"
                        onClick={() => setCurrentQuestionIndex(prev => Math.min(questions.length - 1, prev + 1))}
                    >
                        Next Question <ChevronRight size={20} />
                    </button>
                ) : (
                    <button
                        className="btn btn-primary px-4 fw-bold rounded-pill d-flex align-items-center gap-2"
                        onClick={handleSubmitExam}
                        disabled={isSubmitting || questions.length === 0}
                    >
                        Review & Submit <ArrowRight size={20} />
                    </button>
                )}
            </div>

            {/* Submission / Evaluation Modal Overlay */}
            {showSubmitModal && (
                <div
                    className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
                    style={{ zIndex: 9999, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(5px)' }}
                >
                    <div className="text-center p-5 rounded-4 shadow-lg bg-white border" style={{ maxWidth: '450px' }}>
                        <div className="mb-4">
                            <div className="spinner-wrapper position-relative d-inline-block">
                                <Loader2 size={64} className="text-primary animate-spin" />
                                <div
                                    className="position-absolute top-50 start-50 translate-middle fw-bold text-primary"
                                    style={{ fontSize: '1.2rem' }}
                                >
                                    {submitCountdown}
                                </div>
                            </div>
                        </div>

                        <h3 className="fw-bold mb-3">
                            {submitCountdown > 5 ? "Submitting your exam..." : "Evaluating your answers..."}
                        </h3>

                        <p className="text-muted mb-4">
                            Please wait while we securely process your attempt.
                            <strong> Result will be shown in {submitCountdown} seconds.</strong>
                        </p>

                        <div className="progress rounded-pill mb-3" style={{ height: '8px' }}>
                            <div
                                className="progress-bar progress-bar-striped progress-bar-animated"
                                role="progressbar"
                                style={{ width: `${(10 - submitCountdown) * 10}%` }}
                            ></div>
                        </div>

                        <div className="small text-muted opacity-75">
                            <AlertCircle size={14} className="me-1" />
                            Do not refresh or close this window.
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-spin {
                    animation: spin 2s linear infinite;
                }
            `}</style>
        </div>
    );
};

export default StudentExamHall;
