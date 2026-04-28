import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { examService } from '../services/examService';
import { Award, CheckCircle2, XCircle, AlertTriangle, ArrowLeft, ChevronLeft, ChevronRight, MinusCircle, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

const Result = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { id: paramAttemptId } = useParams();
    const { examId: stateExamId, attemptId: stateAttemptId, reason } = location.state || {};
    const attemptId = stateAttemptId || paramAttemptId;
    const examId = stateExamId;

    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [filter, setFilter] = useState('ALL'); // 'ALL', 'CORRECT', 'WRONG', 'SKIPPED'
    const [palettePage, setPalettePage] = useState(0);
    const questionsPerPage = 100;
    const paletteRef = React.useRef(null);

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

    const filteredIndices = result ? (result.answers || []).map((ans, idx) => ({ ans, idx })).filter(({ ans }) => {
        if (filter === 'ALL') return true;
        const status = ans?.status || '';
        if (filter === 'CORRECT') return status === 'CORRECT';
        if (filter === 'WRONG') return status === 'WRONG';
        if (filter === 'SKIPPED') return status === 'NOT_ATTEMPTED' || !ans?.selected;
        return true;
    }).map(item => item.idx) : [];

    // If current index is not in filtered list, reset to first filtered index
    useEffect(() => {
        if (result && filteredIndices.length > 0 && !filteredIndices.includes(currentIdx)) {
            setCurrentIdx(filteredIndices[0]);
        }
    }, [filter, filteredIndices, currentIdx, result]);

    // Handle palette page synchronization
    useEffect(() => {
        const targetPage = Math.floor(currentIdx / questionsPerPage);
        if (targetPage !== palettePage) {
            setPalettePage(targetPage);
        }
        
        // Auto-scroll active palette button into view
        if (paletteRef.current) {
            const activeButton = paletteRef.current.querySelector('.palette-btn.active');
            if (activeButton) {
                activeButton.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        }
    }, [currentIdx, result, palettePage]);

    // Auto-scroll active palette button into view
    useEffect(() => {
        if (paletteRef.current) {
            const activeButton = paletteRef.current.querySelector('.palette-btn.active');
            if (activeButton) {
                activeButton.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        }
    }, [currentIdx, result]);

    if (loading) return (
        <div className="min-vh-100 d-flex flex-column align-items-center justify-content-center bg-royal">
            <div className="spinner-border text-primary border-4 mb-3" style={{ width: '3rem', height: '3rem' }}></div>
            <h5 className="text-secondary fw-bold">Calculating Final Score...</h5>
        </div>
    );

    if (!result) return <div className="min-vh-100 d-flex align-items-center justify-content-center text-danger">Error retrieving result.</div>;


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

    const currentQuestion = result?.answers?.[currentIdx] || {};
    const filteredPos = filteredIndices.indexOf(currentIdx) + 1;

    return (
        <div className="min-vh-100 bg-royal py-4 px-3">
            <div className="container" style={{ maxWidth: '1200px' }}>
                {/* Header / Summary Section */}
                <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white p-3 rounded-4 shadow-sm text-center mb-4 border border-light"
                >
                    <div className="d-flex justify-content-between align-items-center mb-3">
                         <button onClick={() => navigate(-1)} className="btn btn-light btn-sm rounded-pill px-3 fw-bold d-flex align-items-center gap-2">
                            <ArrowLeft size={16} /> Back
                        </button>
                        <div className="bg-primary-subtle d-inline-flex p-2 rounded-pill">
                            <Award className="text-primary" size={20} />
                            <span className="ms-2 fw-bold text-primary small">Review Mode</span>
                        </div>
                        <div style={{ width: '80px' }}></div> {/* Spacer */}
                    </div>

                    {reason && (
                        <div className="alert alert-warning mb-4 d-flex align-items-center justify-content-center gap-2 py-2 rounded-3 border-0 small">
                            <AlertTriangle size={16} /> Security Notice: {reason}
                        </div>
                    )}
                    
                    <div className="row g-2 g-md-3">
                        {[
                            { label: 'Correct', value: result.correct, color: 'success', type: 'CORRECT', icon: <CheckCircle2 size={14}/> },
                            { label: 'Wrong', value: result.wrong, color: 'danger', type: 'WRONG', icon: <XCircle size={14}/> },
                            { label: 'Skipped', value: result.notAttempted, color: 'secondary', type: 'SKIPPED', icon: <MinusCircle size={14}/> },
                            { label: 'Total Score', value: `${result.score}/${result.total}`, color: 'primary', type: 'ALL', icon: <Award size={14}/> }
                        ].map((stat, i) => (
                            <div className="col-6 col-md-3" key={i}>
                                <div 
                                    onClick={() => setFilter(stat.type)}
                                    className={`p-2 rounded-3 cursor-pointer transition-all border-2 ${
                                        filter === stat.type 
                                            ? `bg-${stat.color} border-${stat.color} text-white shadow-sm` 
                                            : `bg-white border-light text-${stat.color} hover-bg-light`
                                    }`}
                                >
                                    <div className="small mb-0 text-uppercase fw-bold ls-1 d-flex align-items-center justify-content-center gap-1">
                                        {stat.icon} {stat.label}
                                    </div>
                                    <div className="h4 fw-black mb-0">{stat.value}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                <div className="row g-4">
                    {/* Left Side: Question Details */}
                    <div className="col-lg-8">
                        {currentQuestion ? (
                            <motion.div 
                                key={currentIdx}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="bg-white p-4 p-md-5 rounded-4 shadow-sm border h-100 d-flex flex-column"
                            >
                                <div className="d-flex justify-content-between align-items-start mb-4">
                                    <div>
                                        <span className="badge bg-light text-muted mb-2 px-3 py-1 rounded-pill fw-bold">Question {currentIdx + 1} of {result?.answers?.length || 0}</span>
                                        {filter !== 'ALL' && (
                                            <span className="badge bg-primary-subtle text-primary ms-2 px-3 py-1 rounded-pill">Filtered: {filter} ({filteredPos}/{filteredIndices.length})</span>
                                        )}
                                    </div>
                                    {getStatusIcon(currentQuestion?.status)}
                                </div>

                                <h4 className="fw-bold text-dark mb-5 leading-relaxed">
                                    {currentQuestion.question}
                                </h4>

                                <div className="row g-3 mb-5">
                                    <div className="col-md-6">
                                        <div className="p-3 rounded-3 border bg-light bg-opacity-30 h-100">
                                            <div className="small text-muted fw-bold text-uppercase mb-1" style={{ fontSize: '0.65rem' }}>Your Answer</div>
                                            <div className={`fw-bold ${
                                                !currentQuestion?.selected ? 'text-secondary' : 
                                                currentQuestion?.status === 'CORRECT' ? 'text-success' : 'text-danger'
                                            }`}>
                                                {currentQuestion?.selected || "NOT ATTEMPTED"}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="col-md-6">
                                        <div className="p-3 rounded-3 border-2 border-success border-opacity-25 bg-success bg-opacity-10 h-100">
                                            <div className="small text-success fw-bold text-uppercase mb-1" style={{ fontSize: '0.65rem' }}>Correct Answer</div>
                                            <div className="fw-bold text-success">{currentQuestion.correct}</div>
                                        </div>
                                    </div>
                                </div>

                                {currentQuestion.explanation && (
                                    <div className="p-4 bg-primary bg-opacity-10 rounded-4 border-start border-primary border-4 mt-auto">
                                        <div className="d-flex align-items-center gap-2 text-primary fw-bold mb-2">
                                            <AlertTriangle size={18} /> Expert Logic & Explanation
                                        </div>
                                        <div 
                                            className="text-secondary leading-relaxed"
                                            style={{ 
                                                wordBreak: 'break-word',
                                                overflowWrap: 'anywhere' 
                                            }}
                                        >
                                            {currentQuestion.explanation}
                                        </div>
                                    </div>
                                )}

                                <div className="d-flex justify-content-between mt-5 pt-4 border-top">
                                    <button 
                                        className="btn btn-outline-secondary rounded-pill px-4" 
                                        disabled={filteredIndices.indexOf(currentIdx) === 0}
                                        onClick={() => setCurrentIdx(filteredIndices[filteredIndices.indexOf(currentIdx) - 1])}
                                    >
                                        <ChevronLeft size={18} className="me-2" /> Previous
                                    </button>
                                    <button 
                                        className="btn btn-primary rounded-pill px-4 fw-bold" 
                                        disabled={filteredIndices.indexOf(currentIdx) === filteredIndices.length - 1}
                                        onClick={() => setCurrentIdx(filteredIndices[filteredIndices.indexOf(currentIdx) + 1])}
                                    >
                                        Next <ChevronRight size={18} className="ms-2" />
                                    </button>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="bg-white p-5 rounded-4 shadow-sm border text-center">
                                <AlertTriangle size={48} className="text-muted mb-3" />
                                <p className="text-muted">No questions found for the selected filter.</p>
                            </div>
                        )}
                    </div>

                    {/* Right Side: Palette */}
                    <div className="col-lg-4">
                        <div className="bg-white p-4 rounded-4 shadow-sm border sticky-top" style={{ top: '20px' }}>
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <h6 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                                    <FileText size={18} className="text-primary" /> Navigator
                                </h6>
                                {(result?.answers?.length || 0) > questionsPerPage && (
                                    <div className="d-flex gap-1">
                                        {Array.from({ length: Math.ceil((result?.answers?.length || 0) / questionsPerPage) }).map((_, i) => (
                                            <button 
                                                key={i}
                                                onClick={() => setPalettePage(i)}
                                                className={`btn btn-xs rounded-pill px-2 py-0 fs-xs ${palettePage === i ? 'btn-primary' : 'btn-light text-muted'}`}
                                                style={{ fontSize: '0.6rem', minWidth: '45px' }}
                                            >
                                                {i * questionsPerPage + 1}-{(i + 1) * questionsPerPage}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="overflow-auto scroll-hide mb-4" style={{ maxHeight: '400px' }} ref={paletteRef}>
                                <div 
                                    className="d-grid gap-1 p-1"
                                    style={{ 
                                        gridTemplateColumns: 'repeat(auto-fill, minmax(30px, 1fr))',
                                    }}
                                >
                                    {(result?.answers || []).slice(palettePage * questionsPerPage, (palettePage + 1) * questionsPerPage).map((ans, i) => {
                                        const actualIdx = (palettePage * questionsPerPage) + i;
                                        const isMatch = filter === 'ALL' || 
                                                    (filter === 'CORRECT' && ans.status === 'CORRECT') ||
                                                    (filter === 'WRONG' && ans.status === 'WRONG') ||
                                                    (filter === 'SKIPPED' && (ans.status === 'NOT_ATTEMPTED' || !ans.selected));

                                        return (
                                            <button
                                                key={actualIdx}
                                                onClick={() => {
                                                    if (isMatch) setCurrentIdx(actualIdx);
                                                }}
                                                className={`palette-btn transition-all ${currentIdx === actualIdx ? 'active' : ''} ${(ans?.status || '').toLowerCase()}`}
                                                style={{ 
                                                    opacity: isMatch ? 1 : 0.25,
                                                    cursor: isMatch ? 'pointer' : 'not-allowed'
                                                }}
                                            >
                                                {actualIdx + 1}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="border-top pt-3">
                                <div className="row g-2">
                                    <div className="col-6">
                                        <div className="d-flex align-items-center gap-2 text-muted small">
                                            <div className="bg-success rounded-circle" style={{ width: '10px', height: '10px' }}></div> Correct
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <div className="d-flex align-items-center gap-2 text-muted small">
                                            <div className="bg-danger rounded-circle" style={{ width: '10px', height: '10px' }}></div> Wrong
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <div className="d-flex align-items-center gap-2 text-muted small">
                                            <div className="bg-secondary rounded-circle" style={{ width: '10px', height: '10px' }}></div> Skipped
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <div className="d-flex align-items-center gap-2 text-muted small">
                                            <div className="border border-primary rounded-circle" style={{ width: '10px', height: '10px' }}></div> Current
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .bg-royal { background: #f8fafc; }
                .fw-black { font-weight: 900; }
                .ls-1 { letter-spacing: 0.05em; }
                .leading-relaxed { line-height: 1.6; }
                .palette-btn {
                    width: 30px; height: 30px; font-size: 0.7rem; font-weight: bold;
                    border: 1px solid #e2e8f0; border-radius: 6px; background: white;
                    display: flex; align-items: center; justify-content: center;
                }
                .palette-btn.active { border-color: #3b82f6; border-width: 2px; transform: scale(1.05); box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1); }
                .palette-btn.correct { background: #dcfce7; color: #166534; border-color: #bbf7d0; }
                .palette-btn.wrong { background: #fee2e2; color: #991b1b; border-color: #fecaca; }
                .palette-btn.not_attempted { background: #f1f5f9; color: #475569; border-color: #e2e8f0; }
                .cursor-pointer { cursor: pointer; }
                .hover-bg-light:hover { background: #f8fafc; }
                .scroll-hide::-webkit-scrollbar { display: none; }
                .scroll-hide { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
};

export default Result;
