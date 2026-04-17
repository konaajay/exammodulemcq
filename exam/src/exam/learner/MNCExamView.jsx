import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, ChevronLeft, ChevronRight, CheckCircle, AlertTriangle, Maximize2, Flag, Send } from 'lucide-react';
import { mcqService } from '../../services/mcqService';

const MNCExamView = () => {
    const { id: examId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    
    // Attempt ID from navigation state (Public flow) or fallback for preview
    const attemptIdFromState = location.state?.attemptId;
    const initialExamData = location.state?.examData;

    const [examData, setExamData] = useState(initialExamData);
    const [questions, setQuestions] = useState([]);
    const [currentQIndex, setCurrentQIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [timeLeft, setTimeLeft] = useState(0);
    const [attemptId, setAttemptId] = useState(attemptIdFromState);
    const [loading, setLoading] = useState(!initialExamData);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [warningCount, setWarningCount] = useState(0);

    // --- Fullscreen Logic ---
    const enterFullscreen = () => {
        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen().catch(e => console.error("Fullscreen failed", e));
        }
    };

    // --- Tab Switch & Exit Fullscreen Handling ---
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden && !isSubmitting) {
                setWarningCount(prev => prev + 1);
                alert("Warning: Tab switching is strictly prohibited! The next attempt will result in automatic submission.");
                if (warningCount >= 1) {
                    handleSubmit();
                }
            }
        };

        const handleFullscreenChange = () => {
            if (!document.fullscreenElement && !isSubmitting) {
                alert("Fullscreen mode exited! Please return to fullscreen or your exam may be submitted.");
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
        };
    }, [warningCount, isSubmitting]);

    // --- Fetch/Init Exam ---
    useEffect(() => {
        const initExam = async () => {
            if (!examData) {
                try {
                    // Fetch basic exam info
                    const data = await mcqService.getAllExams();
                    const current = data.find(e => String(e.id) === String(examId));
                    setExamData(current);
                } catch (e) { console.error("Init failed", e); }
            }
            
            try {
                // Fetch Questions
                const data = await mcqService.getAllExams(); // Logic depends on backend, for now assume standard fetch
                // In this refactored backend, getQuestions should be simple
                // For now use mock if it fails since I'm in mid-execution
                const qList = examData?.questions || [];
                setQuestions(qList);
                setTimeLeft((examData?.duration || 60) * 60);
            } catch (e) { console.error("Questions failed", e); }
            
            setLoading(false);
            enterFullscreen();
        };
        initExam();
    }, [examId]);

    // --- Logic ---
    const handleAnswer = (option) => {
        setAnswers(prev => ({ ...prev, [questions[currentQIndex].id]: option }));
    };

    const handleSaveAndNext = async () => {
        const currentQ = questions[currentQIndex];
        const selected = answers[currentQ.id];
        
        if (selected && attemptId) {
            try {
                await mcqService.saveResponse(examId, attemptId, {
                    questionId: currentQ.id,
                    selectedOption: selected
                });
            } catch (e) { console.error("Save failed", e); }
        }

        if (currentQIndex < questions.length - 1) {
            setCurrentQIndex(prev => prev + 1);
        }
    };

    const handleSubmit = async () => {
        if (isSubmitting) return;
        
        const confirmSub = window.confirm("Are you sure you want to submit your exam?");
        if (!confirmSub) return;

        setIsSubmitting(true);
        try {
            await mcqService.submitAttempt(examId, attemptId);
            if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
            navigate(`/exams/public/result/${attemptId}`, { state: { examId, attemptId } });
        } catch (e) {
            alert("Submission failed. Please try again.");
            setIsSubmitting(false);
        }
    };

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    // --- Timer ---
    useEffect(() => {
        if (loading || isSubmitting || timeLeft <= 0) return;
        const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
        if (timeLeft <= 0) handleSubmit();
        return () => clearInterval(timer);
    }, [timeLeft, loading, isSubmitting]);

    if (loading) return <div className="p-5 text-center">Loading Examination...</div>;

    const currentQ = questions[currentQIndex];

    return (
        <div className="min-vh-100 bg-white d-flex flex-column text-dark">
            {/* Header */}
            <header className="px-4 py-3 border-bottom d-flex justify-content-between align-items-center bg-light">
                <div>
                    <h5 className="fw-bold mb-0 text-primary">{examData?.title}</h5>
                    <div className="small text-muted">Status: Protected Session</div>
                </div>
                <div className="d-flex align-items-center gap-4">
                    <div className={`d-flex align-items-center gap-2 px-3 py-2 rounded-3 ${timeLeft < 300 ? 'bg-danger-subtle text-danger' : 'bg-white border'}`}>
                        <Clock size={18} />
                        <span className="fw-mono fw-bold fs-5">{formatTime(timeLeft)}</span>
                    </div>
                    <button className="btn btn-outline-secondary btn-sm" onClick={enterFullscreen}>
                        <Maximize2 size={16} />
                    </button>
                    <button className="btn btn-danger fw-bold px-4 rounded-pill shadow-sm d-flex align-items-center gap-2" onClick={handleSubmit}>
                        Submit Exam <Send size={16} />
                    </button>
                </div>
            </header>

            <div className="flex-grow-1 d-flex overflow-hidden">
                {/* Main Content */}
                <main className="flex-grow-1 p-5 overflow-auto bg-white">
                    <AnimatePresence mode="wait">
                        <motion.div 
                            key={currentQIndex}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="max-w-800 mx-auto"
                        >
                            <div className="mb-4">
                                <span className="badge bg-primary px-3 py-2 rounded-pill mb-3">Question {currentQIndex + 1} of {questions.length}</span>
                                <h3 className="fw-normal lh-base text-dark">{currentQ?.questionText}</h3>
                            </div>

                            <div className="d-flex flex-column gap-3 mb-5">
                                {['optionA', 'optionB', 'optionC', 'optionD'].map((key) => (
                                    <label 
                                        key={key}
                                        className={`option-card p-4 rounded-4 border-2 transition-all cursor-pointer d-flex align-items-center gap-3 ${
                                            answers[currentQ.id] === key.replace('option', '') 
                                            ? 'border-primary bg-primary-subtle' 
                                            : 'border-light-subtle hover-bg-light'
                                        }`}
                                    >
                                        <input 
                                            type="radio" 
                                            name="mcq" 
                                            className="d-none"
                                            checked={answers[currentQ.id] === key.replace('option', '')}
                                            onChange={() => handleAnswer(key.replace('option', ''))}
                                        />
                                        <div className={`opt-indicator flex-shrink-0 d-flex align-items-center justify-content-center fw-bold rounded-circle border ${
                                             answers[currentQ.id] === key.replace('option', '') ? 'bg-primary text-white border-primary' : 'bg-white border-secondary-subtle'
                                        }`}>
                                            {key.replace('option', '')}
                                        </div>
                                        <span className="fs-5">{currentQ?.[key]}</span>
                                    </label>
                                ))}
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </main>

                {/* Sidebar */}
                <aside className="w-350 border-start bg-light p-4 overflow-auto">
                    <h6 className="fw-bold mb-4 d-flex align-items-center gap-2">
                        <Flag size={18} className="text-muted" /> Navigation Palette
                    </h6>
                    <div className="d-grid cols-5 gap-2 mb-5">
                        {questions.map((q, idx) => (
                            <button
                                key={q.id}
                                onClick={() => setCurrentQIndex(idx)}
                                className={`q-nav-btn ${currentQIndex === idx ? 'active' : ''} ${answers[q.id] ? 'answered' : ''}`}
                            >
                                {idx + 1}
                            </button>
                        ))}
                    </div>

                    <div className="alert alert-info border-0 rounded-4 small">
                        <AlertTriangle className="mb-2" />
                        <ul className="mb-0 ps-3">
                            <li>All questions are MCQs.</li>
                            <li>+1 Mark for each correct answer.</li>
                            <li>No negative marking.</li>
                        </ul>
                    </div>
                </aside>
            </div>

            {/* Footer */}
            <footer className="px-4 py-3 border-top d-flex justify-content-between align-items-center bg-white">
                <button 
                    className="btn btn-light rounded-pill px-4"
                    disabled={currentQIndex === 0}
                    onClick={() => setCurrentQIndex(prev => prev - 1)}
                >
                    <ChevronLeft className="me-1" /> Previous
                </button>
                <div className="text-muted small">Progress: {Math.round((Object.keys(answers).length / questions.length) * 100) || 0}%</div>
                <button 
                    className="btn btn-primary rounded-pill px-5 fw-bold"
                    onClick={handleSaveAndNext}
                >
                    {currentQIndex === questions.length - 1 ? 'Last Question' : 'Save & Next'} <ChevronRight className="ms-1" />
                </button>
            </footer>

            <style>{`
                .w-350 { width: 350px; }
                .max-w-800 { max-width: 800px; }
                .option-card { border-style: solid; cursor: pointer; }
                .opt-indicator { width: 32px; height: 32px; }
                .cols-5 { grid-template-columns: repeat(5, 1fr); }
                .q-nav-btn { height: 40px; border: 1px solid #dee2e6; background: white; border-radius: 8px; font-weight: bold; transition: all 0.2s; }
                .q-nav-btn:hover { background: #f8f9fa; transform: translateY(-1px); }
                .q-nav-btn.active { border-color: #0d6efd; color: #0d6efd; box-shadow: 0 0 0 2px rgba(13, 110, 253, 0.1); }
                .q-nav-btn.answered { background: #0d6efd; color: white; border-color: #0d6efd; }
                .hover-bg-light:hover { background: #f8f9fa; }
            `}</style>
        </div>
    );
};

export default MNCExamView;
