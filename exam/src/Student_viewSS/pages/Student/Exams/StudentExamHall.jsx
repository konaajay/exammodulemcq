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
    HelpCircle,
    ArrowRight,
    Info,
    AlertCircle,
    Play,
    Terminal,
    Loader2
} from 'lucide-react';
import { useToast } from '../../../context/ToastContext';
import InstructionView from './components/InstructionView';


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
    const [isRunning, setIsRunning] = useState(false);
    const [executionResult, setExecutionResult] = useState(null);
    const [selectedLanguage, setSelectedLanguage] = useState('JAVA');
    const [submitCountdown, setSubmitCountdown] = useState(10);
    const [showSubmitModal, setShowSubmitModal] = useState(false);
    const [isFetchingResult, setIsFetchingResult] = useState(false);
    const [isInstructionMode, setIsInstructionMode] = useState(true);
    const [agreed, setAgreed] = useState(false);


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
                    // Re-throw to be caught by the outer catch
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
                            // Ensure options have a stable 'id' field for mapping
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

    // Timer Logic
    useEffect(() => {
        if (!timeLeft || result) return;

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleSubmitExam(); // Auto-submit on timeout
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

    const handleSelectOption = async (questionId, value) => {
        setAnswers({
            ...answers,
            [questionId]: value
        });

        // Resolve the type and payload structure
        const targetQ = questions.find(q => q.id === questionId);
        const qType = targetQ?.questionType || 'MCQ';

        const payload = {
            examQuestionId: questionId
        };

        // 🛡️ ENHANCEMENT: If the value is a number (Option ID), force it into selectedOptionId
        if (typeof value === 'number' || (targetQ?.options && targetQ.options.length > 0 && !isNaN(value) && qType !== 'CODING')) {
            payload.selectedOptionId = parseInt(value);
        } else if (qType === 'CODING') {
            console.log(`[ExamHall] ⌨️ User is coding for Q-ID ${questionId}:`, {
                length: value?.length,
                preview: value?.substring(0, 50) + "..."
            });
            payload.codingSubmissionCode = value;
            payload.programmingLanguage = selectedLanguage;
        } else {
            payload.descriptiveAnswer = value;
        }

        // Save progress to backend (Student Save Endpoint)
        if (examId && payload.examQuestionId) {
            try {
                await studentService.saveResponse(examId, payload);
            } catch (e) {
                console.warn("Failed to save response in background", e);
            }
        } else {
            console.error("❌ Cannot save response: Missing Question ID", { examId, questionId });
        }
    };

    const handleRunCode = async (questionId) => {
        const value = answers[questionId];
        if (!value) return toast.warn("Please write some code first.");

        setIsRunning(true);
        setExecutionResult(null);
        try {
            // Step 1: Save the current code
            const responseData = {
                examQuestionId: questionId,
                codingSubmissionCode: value,
                programmingLanguage: selectedLanguage // 🔥 NEW
            };
            const response = await studentService.saveResponse(examId, responseData);

            // Step 2: Trigger the run (Aligned with Postman Turn 716)
            console.log(`[ExamHall] 🚀 Triggering run for Response ID: ${response.responseId || response.id}`);
            const runResult = await studentService.runCodingQuestion(response.responseId || response.id);
            console.log(`[ExamHall] ✅ Execution Result Received:`, runResult);
            
            // 🔥 Save the whole result object
            setExecutionResult(runResult); 
            toast.success("Code execution completed!");
        } catch (e) {
            console.error("Execution failed", e);
            toast.error("Execution failed. Check backend compiler services.");
        } finally {
            setIsRunning(false);
        }
    };

    const handleSubmitExam = async () => {
        if (isSubmitting || !attemptId) return;

        setIsSubmitting(true);
        try {
            // Step 1: Submit Attempt (Student API only needs examId)
            await studentService.submitExam(examId);
            toast.success("Exam submitted successfully!");

            // Step 2: Show Submission Modal and start countdown
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
                    <div className="small text-muted fw-medium">{questions.length} Questions • Proctored Session</div>
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
                <div className="flex-grow-1 overflow-auto p-4 p-lg-5">
                    {questions.length > 0 ? (
                        <div className="mx-auto" style={{ maxWidth: '800px' }}>
                            <div className="d-flex align-items-center justify-content-between mb-4">
                                <span className="badge bg-secondary rounded-pill px-3">Question {currentQuestionIndex + 1} of {questions.length}</span>
                                {currentQ?.sectionName && (
                                    <span className="badge bg-info bg-opacity-10 text-info border border-info border-opacity-25 rounded-pill px-3">
                                        Section: {currentQ.sectionName}
                                    </span>
                                )}
                                <span className="small text-muted fw-bold">Marks: {currentQ?.marks || 1}</span>
                            </div>

                            {currentQ?.sectionDescription && (
                                <p className="text-muted small mb-4 bg-light p-3 rounded-3 border-start border-3 border-info">
                                    {currentQ.sectionDescription}
                                </p>
                            )}

                            <h3 className="fw-bold mb-5 lh-base text-body">
                                {currentQ?.questionText || "No question text available."}
                            </h3>

                            <div className="options-area py-3 transition-all">
                                {currentQ?.questionType === 'MCQ' || (currentQ?.options && currentQ.options.length > 0) ? (
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
                                ) : currentQ?.questionType === 'CODING' ? (
                                    <div className="coding-wrapper p-4 bg-dark rounded-4 shadow-lg border-2 border-dark" style={{ minHeight: '300px' }}>
                                        <div className="d-flex align-items-center justify-content-between mb-3 text-muted-foreground border-bottom border-secondary pb-2 opacity-50">
                                            <div className="d-flex align-items-center gap-2 text-white">
                                                <Terminal size={14} className="text-success" />
                                                <span className="small fw-bold">Code Sandbox</span>
                                            </div>
                                            <div className="d-flex align-items-center gap-2">
                                                <select 
                                                    className="form-select form-select-sm bg-secondary text-white border-0 rounded-pill px-3"
                                                    value={selectedLanguage}
                                                    onChange={(e) => setSelectedLanguage(e.target.value)}
                                                    style={{ width: 'auto', fontSize: '0.75rem', fontWeight: 'bold' }}
                                                >
                                                    <option value="JAVA">Java 17</option>
                                                    <option value="PYTHON">Python 3</option>
                                                    <option value="C">C (GCC)</option>
                                                    <option value="CPP">C++ (G++)</option>
                                                </select>
                                                <button
                                                    className="btn btn-primary btn-sm rounded-pill px-3 fw-bold d-flex align-items-center gap-2"
                                                    onClick={() => handleRunCode(currentQ.id)}
                                                    disabled={isRunning}
                                                >
                                                    {isRunning ? <div className="spinner-border spinner-border-sm" /> : <Play size={14} fill="currentColor" />}
                                                    {isRunning ? "Running..." : "Run Code"}
                                                </button>
                                            </div>
                                        </div>
                                        <textarea
                                            className="form-control bg-transparent border-0 text-white font-monospace w-100 p-0"
                                            rows="12"
                                            placeholder="// Write your code here..."
                                            value={answers[currentQ.id] || ""}
                                            onChange={(e) => handleSelectOption(currentQ.id, e.target.value)}
                                            style={{ resize: 'none', outline: 'none', boxShadow: 'none' }}
                                        />
                                        {executionResult && (
                                            <div className="mt-3 p-3 bg-black bg-opacity-50 rounded border border-secondary border-opacity-25 animate-fade-in shadow-inner overflow-hidden">
                                                <div className="small fw-bold mb-2 d-flex align-items-center justify-content-between border-bottom border-secondary border-opacity-25 pb-2">
                                                    <div className="text-success d-flex align-items-center gap-2">
                                                        <Info size={14} /> Result Summary
                                                    </div>
                                                    {executionResult.results && (
                                                        <div className={`badge ${executionResult.results.every(r => r.passed) ? 'bg-success' : 'bg-warning'} text-black`}>
                                                            {executionResult.results.filter(r => r.passed).length} / {executionResult.results.length} PASSED
                                                        </div>
                                                    )}
                                                </div>

                                                {executionResult.results && executionResult.results.length > 0 ? (
                                                    <div className="test-cases-summary mt-3">
                                                        <div className="d-flex flex-column gap-3">
                                                            {executionResult.results.map((res, idx) => (
                                                                <div key={idx} className="p-3 rounded-3 bg-dark bg-opacity-75 border border-secondary border-opacity-30">
                                                                    <div className="d-flex justify-content-between align-items-center mb-2 border-bottom border-secondary border-opacity-25 pb-2">
                                                                        <span className="text-warning fw-bold small">TEST CASE #{idx + 1}</span>
                                                                        <span className={`badge ${res.passed ? 'bg-success' : 'bg-danger'} px-3 rounded-pill fw-bold shadow-sm`}>
                                                                            {res.passed ? 'PASSED' : (res.executionStatus === 'RE' ? 'RUNTIME ERROR' : (res.executionStatus === 'CE' ? 'COMPILATION ERROR' : 'FAILED'))}
                                                                        </span>
                                                                    </div>
                                                                    
                                                                    {res.actualOutput && (
                                                                        <div className="mt-2 text-light x-small">
                                                                            <div className="text-secondary mb-1 opacity-75 fw-bold">YOUR OUTPUT:</div>
                                                                            <pre className="p-2 bg-black bg-opacity-50 rounded border border-secondary border-opacity-25 mb-0" style={{ whiteSpace: 'pre-wrap' }}>{res.actualOutput}</pre>
                                                                        </div>
                                                                    )}
                                                                    
                                                                    {res.errorMessage && (
                                                                        <div className="mt-2 text-danger x-small">
                                                                            <div className="text-danger opacity-75 mb-1 fw-bold">ERROR LOG:</div>
                                                                            <pre className="p-2 bg-danger bg-opacity-10 rounded border border-danger border-opacity-25 text-danger mb-0 x-small" style={{ whiteSpace: 'pre-wrap', fontSize: '0.75rem' }}>{res.errorMessage}</pre>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <pre className="text-light small mb-0 font-monospace p-2" style={{ whiteSpace: 'pre-wrap' }}>{executionResult.status || "Details unavailable"}</pre>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="descriptive-wrapper p-4 bg-white border-2 border-primary border-opacity-25 rounded-4 shadow-sm">
                                        <textarea
                                            className="form-control border-0 bg-transparent p-0"
                                            rows="8"
                                            placeholder="Type your explanation/answer here..."
                                            value={answers[currentQ.id] || ""}
                                            onChange={(e) => handleSelectOption(currentQ.id, e.target.value)}
                                            style={{ resize: 'none', outline: 'none', boxShadow: 'none', minHeight: '200px' }}
                                        />
                                    </div>
                                )}
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
                <div className="border-start bg-light overflow-auto p-4 d-none d-lg-block" style={{ width: '320px' }}>
                    <div className="mb-4">
                        <h6 className="fw-bold text-uppercase x-small text-muted mb-3 opacity-75">Navigator</h6>
                        
                        {sections.map((sec, secIdx) => {
                            const sectionQuestions = questions.filter(q => q.sectionId === sec.sectionId);
                            if (sectionQuestions.length === 0) return null;

                            return (
                                <div key={sec.examSectionId || secIdx} className="mb-4">
                                    <div className="d-flex justify-content-between align-items-center mb-2 px-1">
                                        <span className="small fw-bold text-primary">{sec.sectionName || `Section ${secIdx + 1}`}</span>
                                        <span className="smaller text-muted">{sectionQuestions.length} Questions</span>
                                    </div>
                                    <div className="row g-2">
                                        {questions.map((q, idx) => {
                                            if (q.sectionId !== sec.sectionId) return null;
                                            return (
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
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
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
