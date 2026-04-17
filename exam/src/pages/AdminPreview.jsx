import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { examService } from '../services/examService';
import QuestionCard from '../components/QuestionCard';
import { 
    Loader, ArrowLeft, Eye, 
    ChevronLeft, ChevronRight, FileText, User, 
    Info, Layout, 
    MoreHorizontal
} from 'lucide-react';

const AdminPreview = () => {
    const { id: examId } = useParams();
    const navigate = useNavigate();
    
    const [exam, setExam] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchExam = async () => {
            try {
                const data = await examService.getExamById(examId);
                setExam(data);
                setQuestions(data.questions || []);
                setLoading(false);
            } catch (err) {
                alert("Failed to load exam preview.");
                navigate('/admin/dashboard');
            }
        };
        fetchExam();
    }, [examId, navigate]);

    if (loading) return (
        <div className="min-vh-100 d-flex flex-column align-items-center justify-content-center bg-white">
            <Loader className="animate-spin text-primary mb-3" size={40} />
            <h5 className="text-secondary fw-light">Preparing Administrative Preview...</h5>
        </div>
    );

    return (
        <div className="min-vh-100 d-flex flex-column bg-white overflow-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>
            {/* Admin Header */}
            <header className="navbar navbar-dark bg-dark border-bottom px-4 py-2 sticky-top" style={{ height: '70px', zIndex: 1030 }}>
                <div className="d-flex align-items-center gap-3">
                    <button 
                        onClick={() => navigate('/admin/dashboard')}
                        className="btn btn-outline-light btn-sm rounded-circle p-2 border-0"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h6 className="mb-0 fw-bold text-white">ADMIN PREVIEW: {exam.title}</h6>
                        <div className="badge bg-primary text-white p-1 px-2 rounded-pill small" style={{ fontSize: '0.65rem' }}>SIMULATION MODE</div>
                    </div>
                </div>
                
                <div className="d-flex align-items-center gap-3 text-white-50 small fw-medium">
                    <div className="d-flex align-items-center gap-2 border-end pe-3 border-secondary">
                        <Layout size={16} /> {questions.length} Questions
                    </div>
                    <div className="d-flex align-items-center gap-2">
                        <FileText size={16} /> Total: {exam.totalMarks} Marks
                    </div>
                    <button className="btn btn-primary btn-sm ms-3 fw-bold rounded-2 px-3" onClick={() => navigate('/admin/dashboard')}>
                        Exit Preview
                    </button>
                </div>
            </header>

            <div className="d-flex flex-grow-1 overflow-hidden h-100">
                {/* Main Content Area */}
                <main className="flex-grow-1 overflow-auto bg-light p-4 p-lg-5">
                    <div className="mx-auto" style={{ maxWidth: '1000px' }}>
                        <div className="alert alert-info border border-info border-opacity-25 rounded-4 mb-4 d-flex align-items-center gap-3 shadow-sm">
                            <Info className="text-info" size={24} />
                            <div>
                                <span className="fw-bold d-block">Student-View Simulation</span>
                                <span className="small text-muted">This is exactly what the student will see. Interactions here do not save results.</span>
                            </div>
                        </div>

                        <QuestionCard 
                            question={questions[currentIdx]} 
                            idx={currentIdx}
                            total={questions.length}
                            selectedOption={null}
                            onSelect={() => {}} // No interaction in preview
                            examMarks={exam.totalMarks}
                            negativeMarks={exam.negativeMarks}
                        />

                        {/* Navigation Controls */}
                        <div className="d-flex justify-content-between mt-5 pt-3">
                            <button className="btn btn-white shadow-sm border border-light-subtle rounded-pill px-4 py-2 fw-medium" disabled={currentIdx === 0} onClick={() => setCurrentIdx(currentIdx - 1)}>
                                <ChevronLeft className="me-2 text-muted" size={18} /> Previous
                            </button>
                            <div className="d-flex gap-2 align-items-center text-muted small fw-bold">
                                Question {currentIdx + 1} of {questions.length}
                            </div>
                            <button className="btn btn-primary rounded-pill px-5 py-2 fw-bold shadow" disabled={currentIdx === questions.length - 1} onClick={() => setCurrentIdx(currentIdx + 1)}>
                                Next Question <ChevronRight className="ms-2" size={18} />
                            </button>
                        </div>
                    </div>
                </main>

                {/* Right Profile & Palette Sidebar (Simulation) */}
                <aside className="bg-white border-start flex-shrink-0 p-4" style={{ width: '350px', overflowY: 'auto' }}>
                    {/* Mock Candidate Info */}
                    <div className="p-3 bg-light rounded-4 border border-light-subtle mb-4">
                        <div className="d-flex align-items-center gap-3">
                            <div className="bg-white border rounded-3 p-2 shadow-sm text-secondary"><User size={30} /></div>
                            <div className="overflow-hidden">
                                <div className="small text-muted">Previewing as:</div>
                                <div className="fw-bold text-dark text-truncate fs-6">Administrator</div>
                            </div>
                        </div>
                    </div>

                    {/* Stats Legend Simulation */}
                    <h6 className="fw-bold text-dark small mb-3">PALETTE LEGEND</h6>
                    <div className="row g-2 mb-4">
                        {[
                            { color: 'success', label: 'Answered' },
                            { color: 'danger', label: 'Not Answered' },
                            { color: 'secondary', label: 'Not Visited' },
                            { color: 'info', label: 'Marked' }
                        ].map((stat, i) => (
                            <div className="col-6" key={i}>
                                <div className="d-flex align-items-center gap-2 p-2 bg-light border rounded-2 small h-100">
                                    <div className={`bg-${stat.color} text-white rounded-circle d-flex align-items-center justify-content-center fw-bold`} style={{ width: '22px', height: '22px', fontSize: '0.65rem' }}>-</div>
                                    <span className="text-muted fw-bold" style={{ fontSize: '0.7rem' }}>{stat.label}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Question Palette Grid Simulation */}
                    <div className="bg-primary-subtle p-3 rounded-t-4 border-bottom border-primary-subtle">
                        <h6 className="mb-0 fw-bold text-primary small">PREVIEW: MAIN SECTION</h6>
                    </div>
                    <div className="p-3 border rounded-b-4 mb-4">
                        <div className="d-flex flex-wrap gap-2">
                            {questions.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrentIdx(i)}
                                    className={`palette-btn transition-all ${currentIdx === i ? 'current' : ''}`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="alert alert-light border small text-muted">
                        <MoreHorizontal size={14} className="me-1" /> Use this grid to verify question sequence.
                    </div>
                </aside>
            </div>

            <style>{`
                .palette-btn {
                    width: 40px; height: 40px; border: 1px solid #dee2e6; border-radius: 6px;
                    background: white; font-weight: bold; font-size: 0.85rem; color: #495057; display: flex; align-items: center; justify-content: center;
                }
                .palette-btn:hover { border-color: #0d6efd; color: #0d6efd; }
                .palette-btn.current { border-color: #0d6efd; border-width: 2px; box-shadow: 0 0 0 3px rgba(13, 110, 253, 0.1); }
                
                .animate-spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .transition-all { transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); }
            `}</style>
        </div>
    );
};

export default AdminPreview;
