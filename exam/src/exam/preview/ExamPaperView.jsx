import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import { Clock, ChevronLeft, ChevronRight, Send, AlertCircle, CheckCircle, FileText, Layout, Eye } from "lucide-react";
import { examService } from "../services/examService";
import { Loader2 } from "lucide-react";

const ExamPaperView = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [exam, setExam] = useState(null);
    const [answers, setAnswers] = useState({});
    const [timeLeft, setTimeLeft] = useState(0);
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(true);

    const [sections, setSections] = useState([]);
    const [currentSectionIdx, setCurrentSectionIdx] = useState(0);
    const [currentQIndex, setCurrentQIndex] = useState(0);
    const [viewMode, setViewMode] = useState("single");

    const timerRef = useRef(null);

    useEffect(() => {
        if (id && id !== "undefined") {
            fetchExam();
        } else {
            setLoading(false);
        }
    }, [id]);

    const fetchExam = async () => {
        setLoading(true);
        try {
            const data = await examService.getExamPaper(id);
            if (!data) throw new Error("No data");

            setExam(data);
            setTimeLeft((data.duration || 60) * 60);

            const initAnswers = {};
            data.questions.forEach((q, i) => {
                initAnswers[i] = q.type === "coding" ? (q.starterCode || "") : "";
            });
            setAnswers(initAnswers);

            if (data.sections?.length) {
                setSections(data.sections);
                setCurrentQIndex(data.sections[0].questionIds[0]);
            } else {
                setSections([{
                    id: "default",
                    title: "General Assessment",
                    questionIds: data.questions.map((_, i) => i),
                }]);
                setCurrentQIndex(0);
            }
        } catch (error) {
            toast.error("Failed to load assessment data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!exam || submitted || timeLeft <= 0) return;
        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timerRef.current);
                    handleSubmit();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timerRef.current);
    }, [exam, submitted, timeLeft]);

    const handleAnswerChange = (idx, val) => {
        setAnswers(prev => ({ ...prev, [idx]: val }));
    };

    const handleSubmit = async () => {
        setSubmitted(true);
        // Simulation only for Admin Preview
        toast.success("Admin Preview: Submission simulated successfully.");
        toast.info("Answers are not saved in database for preview mode.");
    };

    const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

    if (loading) {
        return (
            <div className="min-vh-100 bg-white d-flex align-items-center justify-content-center text-dark">
                <Loader2 className="animate-spin text-primary" size={48} />
            </div>
        );
    }

    const currentSection = sections[currentSectionIdx];

    // Safety check for empty exam
    if (!exam || !exam.questions || exam.questions.length === 0) {
        return (
            <div className="min-vh-100 bg-white d-flex align-items-center justify-content-center flex-column gap-3 text-muted">
                <AlertCircle size={48} />
                <h5>{(!exam) ? "Assessment Not Found" : "No questions available in this assessment."}</h5>
                <button onClick={() => navigate(-1)} className="btn btn-outline-secondary rounded-pill px-4">Go Back</button>
            </div>
        );
    }

    const sectionQuestions = (currentSection?.questionIds || []).map(i => ({ ...exam.questions[i], originalIndex: i }));
    const pos = sectionQuestions.findIndex(q => q.originalIndex === currentQIndex);
    const isLastQuestion = pos === sectionQuestions.length - 1;
    const isLastSection = currentSectionIdx === sections.length - 1;

    return (
        <div className="min-vh-100 bg-white text-dark d-flex flex-column overflow-hidden">
            <ToastContainer theme="light" />

            {/* Premium App Bar */}
            <header className="px-4 py-3 bg-white border-bottom border-light-subtle d-flex justify-content-between align-items-center z-10 shadow-sm">
                <div className="d-flex align-items-center gap-3">
                    <button onClick={() => navigate(-1)} className="btn btn-icon-sm btn-light">
                        <ChevronLeft size={20} />
                    </button>
                    <div>
                        <h6 className="fw-bold mb-0 text-truncate text-dark" style={{ maxWidth: 200 }}>{exam.title}</h6>
                        <div className="small text-muted">{exam.course}</div>
                    </div>
                </div>

                <div className="d-flex align-items-center gap-4">
                    <button
                        className="btn btn-outline-secondary btn-sm rounded-pill px-3 d-flex align-items-center gap-2"
                        onClick={() => window.open(`/admin/exams/full-paper/${id}`, '_blank')}
                    >
                        <Eye size={16} /> Full Paper
                    </button>
                    <div className="d-flex align-items-center gap-2 bg-light px-3 py-1 rounded-pill border border-light-subtle shadow-sm">
                        <Clock size={16} className={timeLeft < 300 ? "text-danger animate-pulse" : "text-primary"} />
                        <span className={`fw-mono fs-5 ${timeLeft < 300 ? "text-danger" : "text-dark"}`}>{formatTime(timeLeft)}</span>
                    </div>
                    {!submitted && (
                        <button className="btn btn-primary rounded-pill px-4 premium-btn shadow-sm fw-bold" onClick={handleSubmit}>
                            FINISH SESSION
                        </button>
                    )}
                </div>
            </header>

            <main className="flex-grow-1 row g-0 overflow-hidden">
                {/* Navigation Sidebar */}
                <aside className="col-md-3 border-end border-light-subtle bg-light d-none d-md-block overflow-auto p-4 scrollbar-hide">
                    <div className="mb-4">
                        <h6 className="text-uppercase small tracking-widest text-muted fw-bold mb-3">Sections</h6>
                        <div className="d-flex flex-column gap-2">
                            {sections.map((s, idx) => (
                                <button
                                    key={s.id}
                                    className={`btn text-start rounded-3 px-3 py-2 transition-all ${idx === currentSectionIdx ? 'bg-primary text-white shadow' : 'text-secondary hover-bg-gray-10'}`}
                                    onClick={() => {
                                        setCurrentSectionIdx(idx);
                                        setCurrentQIndex(s.questionIds[0]);
                                    }}
                                >
                                    {s.title}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h6 className="text-uppercase small tracking-widest text-muted fw-bold mb-3">Navigation</h6>
                        <div className="d-grid grid-cols-5 gap-2">
                            {exam.questions.map((_, i) => (
                                <button
                                    key={i}
                                    className={`q-nav-dot ${currentQIndex === i ? 'active' : ''} ${answers[i] ? 'answered' : ''}`}
                                    onClick={() => {
                                        const sIdx = sections.findIndex(sec => sec.questionIds.includes(i));
                                        setCurrentSectionIdx(sIdx);
                                        setCurrentQIndex(i);
                                    }}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>
                    </div>
                </aside>

                {/* Content Area */}
                <section className="col-md-9 overflow-auto p-4 p-lg-5 scrollbar-hide bg-gray-5">
                    <div className="max-w-800 mx-auto">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentQIndex}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.2 }}
                            >
                                <div className="glass-panel p-4 p-md-5 rounded-4 shadow-sm border border-light-subtle bg-white">
                                    <div className="d-flex justify-content-between align-items-center mb-4">
                                        <span className="badge bg-light border border-light-subtle text-muted px-3 py-2">Question {currentQIndex + 1} / {exam.questions.length}</span>
                                        <div className="small text-muted fw-bold uppercase tracking-wider">{exam.questions[currentQIndex].type}</div>
                                    </div>

                                    <h4 className="fw-bold mb-5 leading-relaxed text-dark">{exam.questions[currentQIndex].question}</h4>

                                    <div className="options-container">
                                        <QuestionRenderer
                                            q={exam.questions[currentQIndex]}
                                            index={currentQIndex}
                                            answers={answers}
                                            onChange={handleAnswerChange}
                                            disabled={submitted}
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        </AnimatePresence>

                        <div className="d-flex justify-content-between mt-5">
                            <button
                                className="btn btn-outline-secondary rounded-pill px-4 py-2 d-flex align-items-center gap-2 bg-white"
                                disabled={pos === 0 && currentSectionIdx === 0}
                                onClick={() => {
                                    if (pos > 0) setCurrentQIndex(sectionQuestions[pos - 1].originalIndex);
                                    else if (currentSectionIdx > 0) {
                                        const prevSec = sections[currentSectionIdx - 1];
                                        setCurrentSectionIdx(currentSectionIdx - 1);
                                        setCurrentQIndex(prevSec.questionIds[prevSec.questionIds.length - 1]);
                                    }
                                }}
                            >
                                <ChevronLeft size={18} /> Previous
                            </button>

                            <button
                                className="btn btn-primary rounded-pill px-4 py-2 d-flex align-items-center gap-2 premium-btn active-glow shadow-sm"
                                onClick={() => {
                                    if (!isLastQuestion) setCurrentQIndex(sectionQuestions[pos + 1].originalIndex);
                                    else if (!isLastSection) {
                                        setCurrentSectionIdx(currentSectionIdx + 1);
                                        setCurrentQIndex(sections[currentSectionIdx + 1].questionIds[0]);
                                    } else {
                                        handleSubmit();
                                    }
                                }}
                            >
                                {isLastSection && isLastQuestion ? "Finish Assessment" : (isLastQuestion ? "Next Section" : "Save & Next")}
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                </section>
            </main>

            <style>{`
                .bg-gray-5 { background: #f8fafc; }
                .bg-gray-10 { background: #f1f5f9; }
                .hover-bg-gray-10:hover { background: #f1f5f9; }
                .border-light-subtle { border-color: rgba(0,0,0,0.05) !important; }
                .glass-panel { background: rgba(255, 255, 255, 0.8); backdrop-filter: blur(20px); }
                .max-w-800 { max-width: 800px; }
                .grid-cols-5 { display: grid; grid-template-columns: repeat(5, 1fr); }
                .q-nav-dot { width: 40px; height: 40px; border-radius: 12px; border: 1px solid #e2e8f0; background: #ffffff; color: #64748b; display: flex; align-items: center; justify-content: center; font-weight: bold; transition: all 0.2s; }
                .q-nav-dot:hover { background: #f1f5f9; color: #1e293b; transform: translateY(-2px); }
                .q-nav-dot.active { background: #6366f1; border-color: #6366f1; color: white; box-shadow: 0 4px 12px rgba(99,102,241,0.3); }
                .q-nav-dot.answered { background: #ecfdf5; border-color: #10b981; color: #10b981; }
                .btn-icon-sm { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; transition: all 0.2s; background: #f1f5f9; border: 1px solid #e2e8f0; color: #64748b; }
                .btn-icon-sm:hover { background: #e2e8f0; color: #1e293b; }
                .premium-btn { transition: all 0.3s; }
                .premium-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(99,102,241,0.2); }
                @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }
                .animate-pulse { animation: pulse 1s infinite; }
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .uppercase { text-transform: uppercase; }
            `}</style>
        </div>
    );
};

const QuestionRenderer = ({ q, index, answers, onChange, disabled }) => {
    if (q.type === "mcq") {
        return (
            <div className="d-flex flex-column gap-3">
                {q.options.map((opt, i) => (
                    <label key={i} className={`option-card ${answers[index] === i ? 'selected' : ''}`}>
                        <input type="radio" className="d-none" name={`q-${index}`} checked={answers[index] === i} onChange={() => onChange(index, i)} disabled={disabled} />
                        <div className="d-flex align-items-center gap-3">
                            <div className="option-indicator">{String.fromCharCode(65 + i)}</div>
                            <div className="flex-grow-1 text-dark">{typeof opt === 'object' ? (opt.optionText || opt.text || "") : opt}</div>
                            {answers[index] === i && <CheckCircle className="text-primary" size={20} />}
                        </div>
                        <style>{`
                            .option-card { padding: 1.25rem; border-radius: 16px; border: 1px solid #e2e8f0; background: #ffffff; cursor: pointer; transition: all 0.2s; }
                            .option-card:hover { border-color: #6366f1; background: #f5f3ff; }
                            .option-card.selected { background: #f5f3ff; border-color: #6366f1; box-shadow: 0 4px 12px rgba(99,102,241,0.1); }
                            .option-indicator { width: 32px; height: 32px; border-radius: 8px; background: #f1f5f9; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 1px solid #e2e8f0; color: #64748b; }
                            .selected .option-indicator { background: #6366f1; border-color: #6366f1; color: white; }
                        `}</style>
                    </label>
                ))}
            </div>
        );
    }

    return (
        <textarea
            className="form-control bg-light border-light-subtle text-dark rounded-4 p-4 font-monospace"
            rows={q.type === "long" ? 12 : 6}
            placeholder="Type your answer here..."
            value={answers[index]}
            onChange={e => onChange(index, e.target.value)}
            disabled={disabled}
            style={{ fontSize: '1.1rem', lineHeight: '1.6', border: '1px solid #e2e8f0' }}
        />
    );
};

export default ExamPaperView;
