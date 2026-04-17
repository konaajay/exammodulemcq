import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { examService } from '../services/examService';
import { Award, CheckCircle2, XCircle, AlertTriangle, ArrowLeft, ChevronLeft, ChevronRight, MinusCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const Result = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { examId, attemptId, reason } = location.state || {};

    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [filter, setFilter] = useState('ALL'); // 'ALL', 'CORRECT', 'WRONG', 'SKIPPED'
    const perPage = 10;

    // Reset page to 1 whenever filter changes
    useEffect(() => {
        setPage(1);
    }, [filter]);

    useEffect(() => {
        if (!attemptId) {
            navigate('/login');
            return;
        }

        const fetchResult = async () => {
            try {
                const data = await examService.getResult(attemptId);
                setResult(data);
            } catch (error) {
                console.error("Result fetch failed", error);
            } finally {
                setLoading(false);
            }
        };
        fetchResult();
    }, [attemptId, examId, navigate]);

    if (loading) return (
        <div className="min-vh-100 d-flex flex-column align-items-center justify-content-center bg-royal">
            <div className="spinner-border text-primary border-4 mb-3" style={{ width: '3rem', height: '3rem' }}></div>
            <h5 className="text-secondary fw-bold">Calculating Final Score...</h5>
        </div>
    );

    if (!result) return <div className="min-vh-100 d-flex align-items-center justify-content-center text-danger">Error retrieving result.</div>;

    const percentage = Math.round((result.score / result.total) * 100);

    const filteredAnswers = (result.answers || []).filter(ans => {
        if (filter === 'ALL') return true;
        if (filter === 'CORRECT') return ans.status === 'CORRECT';
        if (filter === 'WRONG') return ans.status === 'WRONG';
        if (filter === 'SKIPPED') return ans.status === 'NOT_ATTEMPTED' || !ans.selected;
        return true;
    });

    const paginatedAnswers = filteredAnswers.slice((page - 1) * perPage, page * perPage);
    const totalPages = Math.ceil(filteredAnswers.length / perPage);

    const getStatusIcon = (status) => {
        switch(status) {
            case 'CORRECT': return <CheckCircle2 className="text-success" size={24} />;
            case 'WRONG': return <XCircle className="text-danger" size={24} />;
            default: return <MinusCircle className="text-secondary" size={24} />;
        }
    };

    const getStatusBadgeClass = (status) => {
        switch(status) {
            case 'CORRECT': return 'bg-success';
            case 'WRONG': return 'bg-danger';
            default: return 'bg-secondary';
        }
    };

    return (
        <div className="min-vh-100 bg-light py-5 px-3">
            <div className="container" style={{ maxWidth: '1000px' }}>
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white p-4 p-md-5 rounded-4 shadow-sm text-center mb-5 border border-primary-subtle"
                >
                    {reason && (
                        <div className="alert alert-warning mb-4 d-flex align-items-center justify-content-center gap-2 rounded-3 border-0 shadow-sm">
                            <AlertTriangle size={20} /> Security Notice: {reason}
                        </div>
                    )}
                    
                    <div className="bg-primary-subtle d-inline-flex p-4 rounded-circle mb-4">
                        <Award className="text-primary" size={60} />
                    </div>
                    <h1 className="fw-bold mb-2">Performance Summary</h1>
                    <p className="text-secondary mb-5">Assessment breakdown and detailed response analysis.</p>

                    <div className="row g-3 g-md-4 mb-2">
                        {[
                            { label: 'Correct', value: result.correct, color: 'success', type: 'CORRECT', icon: <CheckCircle2 size={14}/> },
                            { label: 'Wrong', value: result.wrong, color: 'danger', type: 'WRONG', icon: <XCircle size={14}/> },
                            { label: 'Skipped', value: result.notAttempted, color: 'secondary', type: 'SKIPPED', icon: <MinusCircle size={14}/> },
                            { label: 'Score', value: `${result.score}/${result.total}`, color: 'primary', type: 'ALL', icon: <Award size={14}/> }
                        ].map((stat, i) => (
                            <div className="col-6 col-md-3" key={i}>
                                <div 
                                    onClick={() => setFilter(prev => prev === stat.type ? 'ALL' : stat.type)}
                                    className={`p-3 p-md-4 rounded-4 cursor-pointer transition-all border-2 ${
                                        filter === stat.type 
                                            ? `bg-${stat.color} border-${stat.color} shadow-sm transform-scale text-white` 
                                            : `bg-${stat.color} bg-opacity-10 border-${stat.color} border-opacity-25 opacity-75 grayscale-sm hover-grayscale-0 text-${stat.color}`
                                    }`}
                                >
                                    <div className={`small mb-1 text-uppercase fw-bold ls-1 d-flex align-items-center justify-content-center gap-1 ${filter === stat.type ? 'text-white' : `text-${stat.color}`}`}>
                                        {stat.icon} {stat.label}
                                    </div>
                                    <div className={`h2 fw-bold mb-0 ${filter === stat.type ? 'text-white' : `text-${stat.color}`}`}>{stat.value}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                <div className="d-flex justify-content-between align-items-center mb-4 px-2">
                    <h4 className="fw-bold text-dark mb-0">
                        {filter === 'ALL' ? 'Detailed Questions Review' : `${filter} Questions Review`}
                    </h4>
                    {totalPages > 0 && (
                        <div className="badge bg-white text-dark border shadow-sm px-3 py-2 rounded-pill">
                            Page {page} of {totalPages}
                        </div>
                    )}
                </div>

                <div className="d-flex flex-column gap-3 mb-5">
                    {filteredAnswers.length === 0 ? (
                        <div className="text-center py-5 bg-white rounded-4 border border-dashed">
                            <AlertTriangle className="text-muted mb-2" size={40} />
                            <p className="text-muted">No questions found for this filter.</p>
                        </div>
                    ) : paginatedAnswers.map((ans, idx) => {
                        // We need the absolute index for the Q# label
                        const globalIdx = result.answers.findIndex(a => a === ans);
                        return (
                            <motion.div 
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                key={globalIdx} 
                                className={`p-4 bg-white rounded-4 shadow-sm border-start border-4 transition-all ${
                                    ans.status === 'CORRECT' ? 'border-success' : 
                                    ans.status === 'WRONG' ? 'border-danger' : 'border-secondary'
                                } hover-elevate`}
                            >
                                <div className="d-flex justify-content-between align-items-start mb-3">
                                    <h6 className="fw-bold mb-0 pe-4 leading-relaxed">
                                        <span className="text-muted me-2">Q{globalIdx + 1}.</span> {ans.question}
                                    </h6>
                                    {getStatusIcon(ans.status)}
                                </div>

                                <div className="d-flex flex-wrap gap-3 mb-3">
                                    <div className="d-flex align-items-center gap-2">
                                        <span className="small text-muted fw-bold">YOURS:</span> 
                                        <span className={`badge rounded-pill px-3 ${getStatusBadgeClass(ans.status)}`}>
                                            {ans.selected || "NOT ATTEMPTED"}
                                        </span>
                                    </div>
                                    <div className="d-flex align-items-center gap-2">
                                        <span className="small text-muted fw-bold">CORRECT:</span> 
                                        <span className="badge bg-success bg-opacity-75 rounded-pill px-3">{ans.correct}</span>
                                    </div>
                                </div>

                                {ans.explanation && (
                                    <div className="p-3 bg-light rounded-3 small text-muted border-start border-primary border-3">
                                        <strong className="text-dark d-block mb-1">Expert Logic & Explanation:</strong> 
                                        {ans.explanation}
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}
                </div>

                {totalPages > 1 && (
                    <div className="d-flex justify-content-center align-items-center gap-4 mb-5">
                        <button 
                            className="btn btn-white shadow-sm border rounded-circle p-3" 
                            disabled={page === 1} 
                            onClick={() => { setPage(p => p - 1); window.scrollTo(0, 0); }}
                        >
                            <ChevronLeft size={24} />
                        </button>
                        
                        <div className="d-flex gap-2">
                            {[...Array(totalPages)].map((_, i) => (
                                <button 
                                    key={i}
                                    onClick={() => { setPage(i + 1); window.scrollTo(0, 0); }}
                                    className={`btn btn-sm rounded-circle fw-bold ${page === i + 1 ? 'btn-primary' : 'btn-light border'} `}
                                    style={{ width: '35px', height: '35px' }}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>

                        <button 
                            className="btn btn-white shadow-sm border rounded-circle p-3" 
                            disabled={page >= totalPages}
                            onClick={() => { setPage(p => p + 1); window.scrollTo(0, 0); }}
                        >
                            <ChevronRight size={24} />
                        </button>
                    </div>
                )}

                <div className="text-center mt-5">
                    <button className="btn btn-primary btn-lg rounded-pill px-5 fw-bold shadow-lg" onClick={() => navigate('/login')}>
                       <ArrowLeft size={18} className="me-2" /> Return to Login
                    </button>
                </div>
            </div>

            <style>{`
                .ls-1 { letter-spacing: 0.05em; }
                .hover-elevate:hover { transform: translateY(-2px); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); }
                .bg-royal { background: #f8fafc; }
                .leading-relaxed { line-height: 1.6; }
                .grayscale-sm { filter: grayscale(0.5); }
                .hover-grayscale-0:hover { filter: grayscale(0); }
                .transform-scale { transform: scale(1.05); }
                .cursor-pointer { cursor: pointer; }
            `}</style>
        </div>
    );
};

export default Result;
