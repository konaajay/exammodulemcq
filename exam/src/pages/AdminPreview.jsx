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
    const [palettePage, setPalettePage] = useState(0);
    const questionsPerPage = 100;
    const paletteRef = React.useRef(null);

    useEffect(() => {
        const fetchExam = async () => {
            try {
                const data = await examService.getExamById(examId);
                setExam(data);
                
                // If the new questionSets structure is used, load the first set by default
                if (data.questionSets && data.questionSets.length > 0) {
                    setQuestions(data.questionSets[0].questions || []);
                } else {
                    setQuestions(data.questions || []);
                }
                
                setLoading(false);
            } catch (err) {
                alert("Failed to load exam preview.");
                navigate('/admin/dashboard');
            }
        };
        fetchExam();
    }, [examId, navigate]);

    // Auto-scroll and page synchronization
    useEffect(() => {
        const targetPage = Math.floor(currentIdx / questionsPerPage);
        if (targetPage !== palettePage) {
            setPalettePage(targetPage);
        }

        if (paletteRef.current) {
            const activeButton = paletteRef.current.querySelector('.palette-btn.current');
            if (activeButton) {
                activeButton.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        }
    }, [currentIdx, questions, palettePage]);

    if (loading) return (
        <div className="min-vh-100 d-flex flex-column align-items-center justify-content-center bg-white">
            <Loader className="animate-spin text-primary mb-3" size={40} />
            <h5 className="text-secondary fw-light">Preparing Administrative Preview...</h5>
        </div>
    );

    return (
        <div className="min-vh-100 d-flex flex-column bg-white" style={{ fontFamily: "'Inter', sans-serif" }}>
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

            <div className="d-flex flex-grow-1">
                {/* Main Content Area */}
                <main className="flex-grow-1 bg-light p-4 p-lg-5">
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
                <aside className="bg-white border-start flex-shrink-0 d-flex flex-column" style={{ width: '350px' }}>
                    <div className="flex-grow-1 overflow-auto p-4" ref={paletteRef}>
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

                    {/* Paper Switcher for Multi-paper Exams */}
                    {exam?.questionSets && exam.questionSets.length > 1 && (
                        <div className="mb-4">
                            <h6 className="fw-bold text-dark small mb-3">SELECT PAPER TO PREVIEW</h6>
                            <div className="d-flex flex-wrap gap-2">
                                {exam.questionSets.map((set, idx) => (
                                    <button
                                        key={set.id || idx}
                                        onClick={() => {
                                            setQuestions(set.questions || []);
                                            setCurrentIdx(0);
                                        }}
                                        className={`btn btn-sm rounded-pill px-3 fw-bold transition-all ${
                                            questions === set.questions ? 'btn-dark' : 'btn-outline-dark opacity-50'
                                        }`}
                                    >
                                        {set.setName || `Paper ${idx + 1}`}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Question Palette Grid Simulation */}
                    <div className="bg-primary-subtle p-3 rounded-t-4 border-bottom border-primary-subtle d-flex justify-content-between align-items-center">
                        <h6 className="mb-0 fw-bold text-primary small">PREVIEW: MAIN SECTION</h6>
                        {questions.length > questionsPerPage && (
                            <div className="d-flex gap-1">
                                {Array.from({ length: Math.ceil(questions.length / questionsPerPage) }).map((_, i) => (
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
                    <div className="p-2 border rounded-b-4 mb-4 bg-white shadow-sm">
                        <div 
                            className="d-grid gap-1" 
                            style={{ 
                                gridTemplateColumns: 'repeat(auto-fill, minmax(30px, 1fr))',
                            }}
                        >
                            {questions.slice(palettePage * questionsPerPage, (palettePage + 1) * questionsPerPage).map((_, i) => {
                                const actualIdx = (palettePage * questionsPerPage) + i;
                                return (
                                    <button
                                        key={actualIdx}
                                        onClick={() => setCurrentIdx(actualIdx)}
                                        className={`palette-btn transition-all ${currentIdx === actualIdx ? 'current' : ''}`}
                                    >
                                        {actualIdx + 1}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="alert alert-light border small text-muted">
                        <MoreHorizontal size={14} className="me-1" /> Use this grid to verify question sequence.
                    </div>
                    </div>
                </aside>
            </div>

            <style>{`
                .palette-btn {
                    width: 30px; height: 30px; border: 1px solid #dee2e6; border-radius: 6px;
                    background: white; font-weight: bold; font-size: 0.75rem; color: #495057; display: flex; align-items: center; justify-content: center;
                }
                .palette-btn:hover { border-color: #0d6efd; color: #0d6efd; }
                .palette-btn.current { border-color: #0d6efd; border-width: 2px; box-shadow: 0 0 0 2px rgba(13, 110, 253, 0.1); }
                
                .animate-spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .transition-all { transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); }
            `}</style>
        </div>
    );
};

export default AdminPreview;
