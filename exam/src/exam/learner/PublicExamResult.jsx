import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Award, CheckCircle2, XCircle, Info, RefreshCcw, Home } from 'lucide-react';
import { mcqService } from '../../services/mcqService';

const PublicExamResult = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { examId, attemptId } = location.state || {};

    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!attemptId || !examId) {
            navigate('/exams/dashboard'); // Fallback
            return;
        }

        const fetchResult = async () => {
            try {
                const data = await mcqService.getResult(examId, attemptId);
                setResult(data);
            } catch (error) {
                console.error("Failed to fetch results", error);
            } finally {
                setLoading(false);
            }
        };
        fetchResult();
    }, [attemptId, examId, navigate]);

    if (loading) return <div className="min-vh-100 d-flex align-items-center justify-content-center">Calculating Score...</div>;

    if (!result) return <div className="min-vh-100 d-flex align-items-center justify-content-center">Error loading results.</div>;

    const percentage = Math.round((result.score / result.total) * 100);

    return (
        <div className="min-vh-100 bg-light p-4 p-md-5">
            <div className="max-w-900 mx-auto">
                {/* Score Header */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white rounded-4 shadow-sm p-5 text-center mb-4 border border-info-subtle"
                >
                    <div className="bg-success-subtle d-inline-flex p-4 rounded-circle mb-4">
                        <Award className="text-success" size={60} />
                    </div>
                    <h1 className="fw-bold text-dark mb-2">Examination Completed!</h1>
                    <p className="text-secondary mb-4">Well done! Here is your performance summary.</p>
                    
                    <div className="row g-4 justify-content-center">
                        <div className="col-sm-4">
                            <div className="p-4 bg-primary text-white rounded-4">
                                <div className="small opacity-75 mb-1">Total Score</div>
                                <div className="h1 fw-bold mb-0">{result.score} / {result.total}</div>
                            </div>
                        </div>
                        <div className="col-sm-4">
                            <div className="p-4 bg-white border border-2 rounded-4">
                                <div className="small text-muted mb-1">Percentage</div>
                                <div className="h1 fw-bold mb-0 text-primary">{percentage}%</div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Answer Breakdown */}
                <h4 className="fw-bold mb-4 text-dark d-flex align-items-center gap-2">
                    <Info className="text-primary" /> Questions Analysis
                </h4>
                
                <div className="d-flex flex-column gap-3">
                    {result.answers.map((ans, idx) => (
                        <motion.div 
                            key={idx}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-white p-4 rounded-4 shadow-sm border-start border-4"
                            style={{ borderLeftColor: ans.selected === ans.correct ? '#10b981' : '#ef4444' }}
                        >
                            <div className="d-flex justify-content-between align-items-start mb-3">
                                <h6 className="fw-bold text-dark-emphasis mb-0">Q{idx + 1}: {ans.question}</h6>
                                {ans.selected === ans.correct ? (
                                    <span className="badge bg-success-subtle text-success border border-success d-flex align-items-center gap-1">
                                        <CheckCircle2 size={14} /> Correct
                                    </span>
                                ) : (
                                    <span className="badge bg-danger-subtle text-danger border border-danger d-flex align-items-center gap-1">
                                        <XCircle size={14} /> Incorrect
                                    </span>
                                )}
                            </div>

                            <div className="row g-3">
                                <div className="col-md-6 text-muted small">
                                    Your Answer: <span className={`fw-bold ${ans.selected === ans.correct ? 'text-success' : 'text-danger'}`}>{ans.selected || 'N/A'}</span>
                                </div>
                                <div className="col-md-6 text-muted small">
                                    Correct Answer: <span className="fw-bold text-success">{ans.correct}</span>
                                </div>
                            </div>

                            {ans.explanation && (
                                <div className="mt-3 p-3 bg-light rounded-3 small text-secondary">
                                    <strong className="text-dark">Explanation:</strong> {ans.explanation}
                                </div>
                            )}
                        </motion.div>
                    ))}
                </div>

                <div className="text-center mt-5 d-flex justify-content-center gap-3">
                    <button className="btn btn-outline-secondary rounded-pill px-4 py-2 d-flex align-items-center gap-2" onClick={() => window.print()}>
                        Print Result
                    </button>
                    <button className="btn btn-primary rounded-pill px-5 py-2 fw-bold d-flex align-items-center gap-2" onClick={() => navigate('/exams/dashboard')}>
                        <Home size={18} /> Back to Hub
                    </button>
                </div>
            </div>

            <style>{`
                .max-w-900 { max-width: 900px; }
            `}</style>
        </div>
    );
};

export default PublicExamResult;
