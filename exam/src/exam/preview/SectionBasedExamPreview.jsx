import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import { Clock, AlertTriangle, CheckCircle, Code, Cpu, MessageSquare, User, Monitor, ChevronRight, Play, Layout, Zap, ShieldCheck } from "lucide-react";
import { examService } from "../services/examService";
import { Loader2 } from "lucide-react";

const SectionBasedExamPreview = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [exam, setExam] = useState(null);
    const [status, setStatus] = useState("intro"); // intro | active | result
    const [currentSectionIdx, setCurrentSectionIdx] = useState(0);
    const [timeLeft, setTimeLeft] = useState(0);
    const [answers, setAnswers] = useState({});
    const [loading, setLoading] = useState(true);
    const timerRef = useRef(null);

    useEffect(() => {
        fetchExam();
    }, [id]);

    const fetchExam = async () => {
        setLoading(true);
        try {
            // Using getExamPaper for the simulation to ensure questions are loaded
            const data = await examService.getExamPaper(id);
            setExam(data);
        } catch (error) {
            console.error("Simulation load failed:", error);
            toast.error("Simulation load failed");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (status === "active" && exam?.sections) {
            const sec = exam.sections[currentSectionIdx];
            setTimeLeft((sec.durationMinutes || 30) * 60);
            window.scrollTo(0, 0);
        }
    }, [status, currentSectionIdx, exam]);

    useEffect(() => {
        if (status !== "active" || timeLeft <= 0) return;
        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    handleSectionTimeout();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timerRef.current);
    }, [timeLeft, status]);

    const handleSectionTimeout = () => {
        clearInterval(timerRef.current);
        toast.warning("Time expired. Auto-transitioning...");
        nextSection();
    };

    const nextSection = () => {
        if (exam?.sections && currentSectionIdx < exam.sections.length - 1) {
            setCurrentSectionIdx(i => i + 1);
        } else {
            finishExam();
        }
    };

    const finishExam = () => {
        setStatus("result");
        if (document.fullscreenElement) document.exitFullscreen();
    };

    const startExam = () => {
        document.documentElement.requestFullscreen?.().catch(() => { });
        setStatus("active");
    };

    const handleAnswer = (qId, value) => {
        setAnswers(prev => ({ ...prev, [qId]: value }));
    };

    const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

    if (loading) {
        return (
            <div className="min-vh-100 bg-dark d-flex align-items-center justify-content-center text-white">
                <Loader2 className="animate-spin text-primary" size={48} />
            </div>
        );
    }

    if (!exam) return null;

    return (
        <div className="min-vh-100 bg-dark text-white overflow-hidden font-sans">
            <ToastContainer theme="dark" />

            {status === "intro" && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="container min-vh-100 d-flex align-items-center justify-content-center py-5"
                >
                    <div className="glass-panel p-4 p-md-5 rounded-4 text-center max-w-700 shadow-2xl border border-white-10">
                        <div className="mb-4 d-inline-block p-3 bg-primary-subtle rounded-circle shadow-lg text-primary">
                            <Monitor size={48} />
                        </div>
                        <h2 className="fw-bold mb-1">{exam.title}</h2>
                        <div className="d-flex justify-content-center gap-3 text-secondary mb-4">
                            <span className="d-flex align-items-center gap-1"><Layout size={16} /> {exam.sections?.length || 1} Sections</span>
                            <span className="d-flex align-items-center gap-1"><Clock size={16} /> {exam.durationMinutes} Mins</span>
                        </div>

                        <div className="alert bg-warning-subtle text-warning border-0 p-3 rounded-3 text-start small mb-4 d-flex gap-3 align-items-center">
                            <ShieldCheck size={28} className="flex-shrink-0" />
                            <div>
                                <strong>Secure Mode Active:</strong> Fullscreen is required. Section timers are strict and back navigation is disabled for this simulation.
                            </div>
                        </div>

                        <div className="text-start mb-5">
                            <h6 className="text-uppercase small text-secondary fw-bold mb-3 tracking-widest">Assessment Roadmap</h6>
                            <div className="d-flex flex-column gap-2">
                                {(exam.sections || [{ id: 'def', title: 'Main Assessment', durationMinutes: exam.durationMinutes }]).map((sec, idx) => (
                                    <div key={sec.id} className="d-flex justify-content-between align-items-center p-3 bg-white-5 rounded-3 border border-white-10">
                                        <div className="d-flex align-items-center gap-2">
                                            <div className="small-dot bg-primary"></div>
                                            <span className="fw-bold">{sec.title}</span>
                                        </div>
                                        <span className="badge bg-black-40 text-secondary border border-white-10">{sec.durationMinutes}m</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button onClick={startExam} className="btn btn-primary btn-lg rounded-pill px-5 py-3 fw-bold premium-btn active-glow">
                            START SIMULATION <Zap size={18} className="ms-2" />
                        </button>
                    </div>
                </motion.div>
            )}

            {status === "active" && (
                <div className="d-flex flex-column h-screen">
                    <header className="px-4 py-3 bg-black-40 border-bottom border-white-10 d-flex justify-content-between align-items-center sticky-top z-10">
                        <div className="d-flex align-items-center gap-3">
                            <div className="p-2 bg-white-5 rounded-3 border border-white-10">
                                <Monitor size={20} className="text-primary" />
                            </div>
                            <div>
                                <h6 className="fw-bold mb-0">{(exam.sections && exam.sections[currentSectionIdx].title) || "Main Section"}</h6>
                                <div className="small text-secondary">Section {currentSectionIdx + 1} of {exam.sections?.length || 1}</div>
                            </div>
                        </div>
                        <div className={`badge rounded-pill fs-5 px-4 py-2 border border-white-10 ${timeLeft < 60 ? "bg-danger text-white pulse" : "bg-black-20 text-white"}`}>
                            <Clock size={18} className="me-2" /> {formatTime(timeLeft)}
                        </div>
                    </header>

                    <main className="flex-grow-1 overflow-auto p-4 p-md-5 scrollbar-hide">
                        <div className="max-w-900 mx-auto">
                            {((exam.sections && exam.sections[currentSectionIdx].questions) || exam.questions).map((q, idx) => (
                                <motion.div
                                    key={q.id || idx}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="glass-panel p-4 p-md-5 rounded-4 mb-4 border border-white-10"
                                >
                                    <h5 className="fw-bold mb-4 leading-relaxed">
                                        <span className="text-primary me-2">Q{idx + 1}.</span> {q.question || q.text}
                                    </h5>

                                    {q.type === "coding" ? (
                                        <textarea
                                            className="form-control bg-black-20 border-white-10 text-white rounded-3 p-3 font-monospace"
                                            rows={12}
                                            placeholder="// Write your code here..."
                                            value={answers[q.id || idx] || q.starterCode || ""}
                                            onChange={e => handleAnswer(q.id || idx, e.target.value)}
                                        />
                                    ) : (
                                        <div className="d-flex flex-column gap-2 mt-4">
                                            {(q.options || []).map((opt, oIdx) => (
                                                <label key={oIdx} className={`sim-option-card ${answers[q.id || idx] === opt ? 'active' : ''}`}>
                                                    <input
                                                        type="radio"
                                                        className="d-none"
                                                        name={`q-${idx}`}
                                                        checked={answers[q.id || idx] === opt}
                                                        onChange={() => handleAnswer(q.id || idx, opt)}
                                                    />
                                                    <div className="d-flex align-items-center gap-3">
                                                        <div className="sim-indicator">{String.fromCharCode(65 + oIdx)}</div>
                                                        <span>{opt}</span>
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                    )}
                                </motion.div>
                            ))}

                            <div className="d-flex justify-content-end mt-5 pt-3 mb-5">
                                <button
                                    className="btn btn-primary btn-lg rounded-pill px-5 py-3 fw-bold premium-btn active-glow d-flex align-items-center gap-2"
                                    onClick={() => {
                                        if (window.confirm("Confirm section submission?")) nextSection();
                                    }}
                                >
                                    {(!exam.sections || currentSectionIdx === exam.sections.length - 1) ? "Finalize Simulation" : "Next Section"}
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                        </div>
                    </main>
                </div>
            )}

            {status === "result" && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="min-vh-100 d-flex flex-column justify-content-center align-items-center p-4 text-center"
                >
                    <div className="p-4 bg-success-subtle rounded-circle text-success mb-4 shadow-lg active-glow">
                        <CheckCircle size={80} />
                    </div>
                    <h1 className="fw-bold mb-2">Simulation Completed</h1>
                    <p className="text-secondary max-w-500 mx-auto mb-5">Your assessment simulation has been recorded. Your session analytics will be available in the reports dashboard.</p>

                    <button
                        className="btn btn-outline-white border-white-10 rounded-pill px-5 py-2 hover-bg-white-5"
                        onClick={() => navigate("/admin/exams/dashboard")}
                    >
                        Return to Control Center
                    </button>
                </motion.div>
            )}

            <style>{`
                .glass-panel { background: rgba(30,30,35,0.4); backdrop-filter: blur(20px); }
                .bg-white-5 { background: rgba(255,255,255,0.05); }
                .bg-black-20 { background: rgba(0,0,0,0.2); }
                .bg-black-40 { background: rgba(0,0,0,0.4); }
                .border-white-10 { border-color: rgba(255,255,255,0.1) !important; }
                .max-w-700 { max-width: 700px; }
                .max-w-900 { max-width: 900px; }
                .max-w-500 { max-width: 500px; }
                .small-dot { width: 8px; height: 8px; border-radius: 50%; }
                .premium-btn { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); border: none; }
                .premium-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 30px rgba(99,102,241,0.4); }
                .active-glow { box-shadow: 0 0 20px rgba(99,102,241,0.2); }
                .sim-option-card { padding: 1.25rem; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05); background: rgba(255,255,255,0.02); cursor: pointer; transition: all 0.2s; }
                .sim-option-card:hover { border-color: rgba(255,255,255,0.15); background: rgba(255,255,255,0.05); }
                .sim-option-card.active { border-color: #6366f1; background: rgba(99,102,241,0.1); }
                .sim-indicator { width: 32px; height: 32px; border-radius: 8px; background: rgba(255,255,255,0.05); display: flex; align-items: center; justify-content: center; font-weight: bold; border: 1px solid rgba(255,255,255,0.1); }
                .active .sim-indicator { background: #6366f1; border-color: #6366f1; color: white; }
                .pulse { animation: pulse 1s infinite; }
                @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.7; } 100% { opacity: 1; } }
                .h-screen { height: 100vh; }
                .scrollbar-hide::-webkit-scrollbar { display: none; }
            `}</style>
        </div>
    );
};

export default SectionBasedExamPreview;
