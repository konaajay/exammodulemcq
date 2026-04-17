import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    FiChevronLeft,
    FiSave,
    FiInfo,
    FiCheckCircle,
    FiAlertCircle,
    FiFileText,
    FiCode,
    FiUser,
    FiAward,
    FiZap,
    FiCpu
} from "react-icons/fi";
import { examService } from "../services/examService";
import { Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";

const EvaluationDetails = () => {
    const { attemptId } = useParams();
    const navigate = useNavigate();
    const [attempt, setAttempt] = useState(null);
    const [responses, setResponses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState({}); // Tracking which question is being saved

    useEffect(() => {
        fetchAttemptDetails();
    }, [attemptId]);

    const fetchAttemptDetails = async () => {
        setLoading(true);
        try {
            const [attemptData, responseData] = await Promise.all([
                examService.getAttemptForEvaluation(attemptId),
                examService.getResponses(attemptId)
            ]);

            setAttempt(attemptData);
            setResponses(Array.isArray(responseData) ? responseData : []);
        } catch (error) {
            console.error("Failed to load evaluation details:", error);
            toast.error("Failed to load attempt details.");
            navigate("/exams/evaluation");
        } finally {
            setLoading(false);
        }
    };

    const handleGradeResponse = async (responseId, marks, feedback) => {
        setSaving(prev => ({ ...prev, [responseId]: true }));
        try {
            await examService.evaluateDescriptiveSubmission(attemptId, responseId, marks, feedback);
            toast.success("Marks updated successfully!");

            // Update local state
            setResponses(prev => prev.map(r =>
                r.responseId === responseId ? { ...r, marksAwarded: parseFloat(marks), evaluationType: 'MANUAL', status: 'EVALUATED' } : r
            ));
        } catch (error) {
            console.error("Grading failed:", error);
            toast.error("Failed to save marks.");
        } finally {
            setSaving(prev => ({ ...prev, [responseId]: false }));
        }
    };

    const handleFinalizeEvaluation = async () => {
        if (!window.confirm("Are you sure you want to finalize this evaluation? This will update the student's result and notify them.")) return;

        try {
            // Logic to calculate final score if needed, or trigger backend update
            // Assuming evaluateAttempt endpoint exists to re-calculate and close
            await examService.finalizeEvaluation(attempt.examId, attemptId);
            toast.success("Evaluation finalized!");
            navigate("/exams/evaluation");
        } catch (error) {
            toast.error("Failed to finalize evaluation.");
        }
    };

    const handleAIEvaluate = async (responseId) => {
        setSaving(prev => ({ ...prev, [`ai_${responseId}`]: true }));
        try {
            const result = await examService.aiEvaluate(attemptId, responseId);
            // Assuming result looks like { marks: X, feedback: "..." }
            return result;
        } catch (error) {
            console.error("AI Evaluation failed:", error);
            toast.error("AI Evaluation service is currently unavailable.");
        } finally {
            setSaving(prev => ({ ...prev, [`ai_${responseId}`]: false }));
        }
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100 bg-white">
                <Loader2 className="animate-spin text-primary" size={48} />
            </div>
        );
    }

    const manualQuestions = responses.filter(r => r.descriptiveAnswer || r.codingSubmissionCode);
    const autoQuestions = responses.filter(r => !r.descriptiveAnswer && !r.codingSubmissionCode);

    return (
        <div className="evaluation-details-wrapper bg-light min-vh-100 p-4">
            <div className="container-fluid max-w-1200 mx-auto">
                <button
                    onClick={() => navigate("/exams/evaluation")}
                    className="btn btn-link text-muted d-flex align-items-center gap-2 p-0 mb-4 text-decoration-none hover-text-primary transition-all"
                >
                    <FiChevronLeft /> Back to Dashboard
                </button>

                <div className="row g-4">
                    {/* Header Info */}
                    <div className="col-12">
                        <div className="glass-card p-4 overflow-hidden border-0 shadow-sm bg-white rounded-4">
                            <div className="row align-items-center">
                                <div className="col-md-8">
                                    <div className="d-flex align-items-center gap-4">
                                        <div className="avatar-lg bg-primary text-white rounded-4 d-flex align-items-center justify-content-center shadow-lg" style={{ width: '64px', height: '64px' }}>
                                            <FiUser size={32} />
                                        </div>
                                        <div>
                                            <h2 className="fw-bold mb-1 text-dark">{attempt?.studentName || "Student #" + attempt?.studentId}</h2>
                                            <div className="d-flex gap-3 text-muted small">
                                                <span>Exam: <strong>{attempt?.examTitle || "Untitled Exam"}</strong></span>
                                                <span className="opacity-50">|</span>
                                                <span>Attempt: <strong>#{attempt?.attemptNumber}</strong></span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-4 text-md-end mt-3 mt-md-0">
                                    <button
                                        onClick={handleFinalizeEvaluation}
                                        className="btn btn-dark rounded-pill px-5 py-2 fw-bold shadow-lg d-inline-flex align-items-center gap-2"
                                    >
                                        <FiCheckCircle /> Finalize Results
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="col-md-4 col-lg-3">
                        <div className="d-flex flex-column gap-4 sticky-top" style={{ top: '6.5rem', zIndex: 10 }}>
                            <StatCard
                                label="Current Score"
                                value={`${attempt?.score?.toFixed(1) || "0.0"} / ${attempt?.totalMarks || 100}`}
                                color="primary"
                                icon={<FiAward />}
                            />
                            <div className="glass-card p-4 bg-white border-0 shadow-sm rounded-4">
                                <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
                                    <FiInfo size={18} className="text-secondary" />
                                    Attempt History
                                </h6>
                                <div className="small d-flex flex-column gap-2 text-muted">
                                    <div className="d-flex justify-content-between">
                                        <span>Started:</span>
                                        <strong>{new Date(attempt?.startTime).toLocaleString()}</strong>
                                    </div>
                                    <div className="d-flex justify-content-between">
                                        <span>Submitted:</span>
                                        <strong>{new Date(attempt?.endTime).toLocaleString()}</strong>
                                    </div>
                                    <div className="d-flex justify-content-between">
                                        <span>Status:</span>
                                        <span className={`badge rounded-pill ${attempt?.status === 'EVALUATED' ? 'bg-success' : 'bg-warning'}`}>
                                            {attempt?.status}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Questions List */}
                    <div className="col-md-8 col-lg-9">
                        <div className="d-flex flex-column gap-4">
                            <h5 className="fw-bold d-flex align-items-center gap-2 mb-2">
                                <FiAlertCircle className="text-warning" />
                                Requires Evaluation ({manualQuestions.length})
                            </h5>

                            {manualQuestions.map((resp, idx) => (
                                <ResponseCard
                                    key={resp.responseId}
                                    index={idx + 1}
                                    response={resp}
                                    onSaveMark={handleGradeResponse}
                                    onAIEvaluate={handleAIEvaluate}
                                    isSaving={saving[resp.responseId]}
                                    isAIProcessing={saving[`ai_${resp.responseId}`]}
                                />
                            ))}

                            {autoQuestions.length > 0 && (
                                <>
                                    <h5 className="fw-bold d-flex align-items-center gap-2 mt-4 mb-2 text-muted">
                                        <FiCheckCircle className="text-success" />
                                        Auto-Evaluated ({autoQuestions.length})
                                    </h5>
                                    {autoQuestions.map((resp, idx) => (
                                        <div key={resp.responseId} className="glass-card p-3 mb-2 bg-white border-0 opacity-75 grayscale-50">
                                            <div className="d-flex justify-content-between align-items-center">
                                                <span className="small fw-semibold text-muted">Q{idx + 1} (MCQ)</span>
                                                <span className="badge bg-light text-success border-success border">
                                                    Score: {resp.marksAwarded?.toFixed(1)}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .max-w-1200 { max-width: 1200px; }
                .grayscale-50 { filter: grayscale(0.5); }
                .hover-text-primary:hover { color: #6366f1 !important; }
                .glass-card {
                    background: rgba(255, 255, 255, 0.85);
                    backdrop-filter: blur(12px);
                    border: 1px solid rgba(255, 255, 255, 0.3);
                }
                .btn-ai-assist {
                    background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
                    color: white;
                    border: none;
                }
                .btn-ai-assist:hover {
                    box-shadow: 0 0 15px rgba(168, 85, 247, 0.4);
                    transform: translateY(-1px);
                    color: white;
                }
                .border-dashed { border-style: dashed !important; }
            `}</style>
        </div>
    );
};

const ResponseCard = ({ index, response, onSaveMark, onAIEvaluate, isSaving, isAIProcessing }) => {
    const [marks, setMarks] = useState(response.marksAwarded || 0);
    const [feedback, setFeedback] = useState(response.feedback || "");
    const isCoding = !!response.codingSubmissionCode;

    const handleAIAction = async () => {
        const result = await onAIEvaluate(response.responseId);
        if (result) {
            setMarks(result.marks || 0);
            setFeedback(result.feedback || "");
            toast.info("AI suggestions applied! Review and save.");
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-4 p-md-5 bg-white border-0 shadow-sm rounded-4 overflow-hidden"
        >
            <div className="d-flex justify-content-between align-items-start mb-4">
                <span className="badge bg-primary rounded-pill px-3 py-2">Question {index}</span>
                <span className="badge bg-light text-muted border px-3 py-2">
                    Max Marks: {response.marks || 5}
                </span>
            </div>

            <div className="question-text mb-4">
                <p className="fs-5 text-dark fw-medium lh-base">
                    {response.questionText || "Problem statement not found."}
                </p>
            </div>

            <div className="student-answer-box p-4 rounded-4 mb-4 bg-light border-0 shadow-inner" style={{ position: 'relative' }}>
                <div className="d-flex align-items-center gap-2 mb-3 text-muted small uppercase fw-bold tracking-widest">
                    {isCoding ? <><FiCode /> Code Submission</> : <><FiFileText /> Student Response</>}
                </div>

                {isCoding ? (
                    <pre className="bg-dark text-white p-4 rounded-3 overflow-auto" style={{ maxHeight: '300px', fontSize: '0.9rem' }}>
                        <code>{response.codingSubmissionCode}</code>
                    </pre>
                ) : (
                    <div className="descriptive-response text-dark" style={{ whiteSpace: 'pre-wrap', lineHeight: '1.7' }}>
                        {response.descriptiveAnswer || "No answer provided."}
                    </div>
                )}
            </div>

            <div className="grading-action-footer mt-4 p-4 rounded-4 bg-primary bg-opacity-5 border border-primary border-opacity-10">
                <div className="row g-3 align-items-end">
                    <div className="col-md-2">
                        <label className="form-label small fw-bold text-muted uppercase">Award Marks</label>
                        <input
                            type="number"
                            className="form-control form-control-lg border-primary border-opacity-25"
                            max={response.marks || 5}
                            min={0}
                            step={0.5}
                            value={marks}
                            onChange={(e) => setMarks(parseFloat(e.target.value))}
                        />
                    </div>
                    <div className="col-md-5">
                        <label className="form-label small fw-bold text-muted uppercase">Instructor Feedback (Optional)</label>
                        <input
                            type="text"
                            className="form-control form-control-lg border-primary border-opacity-25"
                            placeholder="Great depth, but clarify step 2..."
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                        />
                    </div>
                    <div className="col-md-2">
                        <label className="form-label d-none d-md-block" style={{ height: '24px' }}></label>
                        <button
                            type="button"
                            className="btn btn-ai-assist w-100 btn-lg rounded-pill fw-bold d-flex align-items-center justify-content-center gap-2 shadow-sm"
                            onClick={handleAIAction}
                            disabled={isAIProcessing || isSaving}
                            title="Generate AI Suggestion"
                        >
                            {isAIProcessing ? <Loader2 className="animate-spin" size={18} /> : <FiZap className="text-warning" />}
                            AI Assist
                        </button>
                    </div>
                    <div className="col-md-3">
                        <label className="form-label d-none d-md-block" style={{ height: '24px' }}></label>
                        <button
                            className="btn btn-primary w-100 btn-lg rounded-pill fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2 text-white"
                            style={{ background: '#4f46e5', border: 'none' }}
                            onClick={() => onSaveMark(response.responseId, marks, feedback)}
                            disabled={isSaving}
                        >
                            {isSaving ? <Loader2 className="animate-spin" size={18} /> : <FiSave />}
                            {isSaving ? "Saving..." : "Save Grading"}
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

const StatCard = ({ label, value, color, icon }) => (
    <div className={`glass-card p-4 bg-${color} text-white border-0 shadow-lg rounded-4`}>
        <div className="d-flex justify-content-between align-items-center mb-3">
            <span className="small uppercase fw-bold opacity-75 tracking-wider">{label}</span>
            <span className="bg-white bg-opacity-20 p-2 rounded-circle">{icon}</span>
        </div>
        <h4 className="fw-bold mb-0">{value}</h4>
    </div>
);

export default EvaluationDetails;
