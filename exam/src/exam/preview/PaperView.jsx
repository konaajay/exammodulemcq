import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
    ChevronLeft,
    Printer,
    FileText,
    Download,
    Clock,
    Award,
    AlertCircle,
    Loader2,
    CheckCircle2,
    BookOpen
} from "lucide-react";
import { examService } from "../services/examService";
import { toast, ToastContainer } from "react-toastify";

/**
 * PaperView Component
 * Displays the entire exam paper (all questions) on a single page.
 * Optimized for review and printing.
 */
const PaperView = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [exam, setExam] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (examService.isValidId(id)) {
            fetchFullPaper();
        } else {
            setLoading(false);
        }
    }, [id]);

    const fetchFullPaper = async () => {
        setLoading(true);
        try {
            // Fetch exam details and questions in parallel or sequentially
            const examData = await examService.getExamById(id);
            if (!examData) throw new Error("Exam not found");

            const questionsData = await examService.getExamQuestionsView(id);

            // Fetch extra data for CODING questions (Test Cases)
            const enrichedQuestions = await Promise.all((questionsData || []).map(async (q) => {
                const qType = (q.type || q.questionType || '').toLowerCase();
                if (qType === 'coding') {
                    try {
                        const testCaseData = await examService.getTestCases(q.id || q.questionId);
                        // Backend returns list of test cases
                        // Map them to standard format just in case
                        return {
                            ...q,
                            testCases: Array.isArray(testCaseData) ? testCaseData : []
                        };
                    } catch (e) {
                        console.warn("Failed to fetch test cases for Q" + (q.id || q.questionId));
                        return { ...q, testCases: [] };
                    }
                }
                return q;
            }));

            setExam(examData);
            setQuestions(enrichedQuestions || []);
        } catch (error) {
            console.error("Failed to load paper:", error);
            toast.error("Failed to load full paper view");
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return (
            <div className="min-vh-100 bg-white d-flex align-items-center justify-content-center">
                <div className="text-center">
                    <Loader2 className="animate-spin text-primary mb-3" size={48} />
                    <h5 className="text-muted fw-light">Generating Question Paper...</h5>
                </div>
            </div>
        );
    }

    if (!exam) {
        return (
            <div className="min-vh-100 bg-white d-flex align-items-center justify-content-center flex-column gap-3">
                <AlertCircle size={64} className="text-danger opacity-20" />
                <h4 className="text-muted">Assessment Not Found</h4>
                <button onClick={() => navigate(-1)} className="btn btn-primary rounded-pill px-4">Go Back</button>
            </div>
        );
    }

    return (
        <div className="min-vh-100 bg-light-subtle pb-5 font-sans">
            <ToastContainer theme="light" />

            {/* Header / Toolbar - Hidden on Print */}
            <header className="bg-white border-bottom border-light-subtle sticky-top z-10 d-print-none shadow-sm">
                <div className="container-fluid px-4 py-3 d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center gap-3">
                        <button onClick={() => navigate(-1)} className="btn btn-icon-sm">
                            <ChevronLeft size={20} />
                        </button>
                        <div>
                            <h5 className="fw-bold mb-0 text-dark">{exam.title}</h5>
                            <span className="small text-muted">{exam.course} • Full Paper View</span>
                        </div>
                    </div>

                    <div className="d-flex align-items-center gap-2">
                        <button onClick={handlePrint} className="btn btn-outline-primary d-flex align-items-center gap-2 rounded-pill px-4 fw-semibold">
                            <Printer size={18} /> Print Paper
                        </button>
                        <button className="btn btn-primary d-flex align-items-center gap-2 rounded-pill px-4 fw-semibold shadow-sm">
                            <Download size={18} /> Export PDF
                        </button>
                    </div>
                </div>
            </header>

            {/* Paper Content */}
            <main className="container-fluid py-5 d-print-block">
                <div className="max-w-900 mx-auto">

                    {/* Exam Metadata Card */}
                    <div className="bg-white rounded-4 shadow-sm border border-light-subtle p-4 p-md-5 mb-5 position-relative overflow-hidden">
                        <div className="position-absolute top-0 end-0 p-4 opacity-10 d-none d-md-block">
                            <BookOpen size={120} />
                        </div>

                        <div className="row g-4 align-items-center">
                            <div className="col-md-8">
                                <h1 className="display-6 fw-bold text-dark mb-3">{exam.title}</h1>
                                <p className="text-secondary fs-5 mb-4">{exam.course} | {exam.batch || "All Candidates"}</p>

                                <div className="d-flex flex-wrap gap-4">
                                    <div className="d-flex align-items-center gap-2">
                                        <div className="p-2 bg-primary-subtle rounded-3 text-primary">
                                            <Clock size={20} />
                                        </div>
                                        <div>
                                            <div className="small text-muted text-uppercase fw-bold tracking-wider">Duration</div>
                                            <div className="fw-bold text-dark">{exam.durationMinutes || exam.duration} Minutes</div>
                                        </div>
                                    </div>

                                    <div className="d-flex align-items-center gap-2">
                                        <div className="p-2 bg-success-subtle rounded-3 text-success">
                                            <Award size={20} />
                                        </div>
                                        <div>
                                            <div className="small text-muted text-uppercase fw-bold tracking-wider">Total Marks</div>
                                            <div className="fw-bold text-dark">{exam.totalMarks} Marks</div>
                                        </div>
                                    </div>

                                    <div className="d-flex align-items-center gap-2">
                                        <div className="p-2 bg-indigo-subtle rounded-3 text-indigo">
                                            <FileText size={20} />
                                        </div>
                                        <div>
                                            <div className="small text-muted text-uppercase fw-bold tracking-wider">Questions</div>
                                            <div className="fw-bold text-dark">{questions.length} Items</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="col-md-4 text-md-end border-start-md border-light-subtle ps-md-5">
                                <div className="p-3 bg-light rounded-4 border border-light-subtle text-start">
                                    <h6 className="fw-bold text-dark mb-2">Instructions:</h6>
                                    <ul className="small text-secondary mb-0 ps-3">
                                        <li>All questions are compulsory.</li>
                                        <li>Total time allowed: {exam.durationMinutes} mins.</li>
                                        <li>Answers should be clear and concise.</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Question List */}
                    <div className="questions-container d-flex flex-column gap-4">
                        {questions.length === 0 ? (
                            <div className="text-center py-5 bg-white rounded-4 border border-dashed border-light-subtle">
                                <FileText size={48} className="text-muted opacity-20 mb-3" />
                                <h5 className="text-muted">No questions found for this exam.</h5>
                            </div>
                        ) : (
                            questions.map((q, index) => (
                                <motion.div
                                    key={q.id || index}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="bg-white rounded-4 shadow-sm border border-light-subtle p-4 p-md-5 page-break-inside-avoid"
                                >
                                    <div className="d-flex justify-content-between align-items-start mb-4">
                                        <div className="d-flex align-items-center gap-3">
                                            <span className="badge bg-primary rounded-pill px-3 py-2 fw-bold">Q{index + 1}</span>
                                            <span className="small text-muted text-uppercase fw-bold tracking-widest">{q.type}</span>
                                        </div>
                                        <div className="text-primary fw-bold">
                                            [ {q.marks || 1} Marks ]
                                        </div>
                                    </div>

                                    <h4 className="fw-normal text-dark lh-base mb-5" style={{ fontSize: '1.25rem' }}>
                                        {q.question}
                                    </h4>

                                    {q.type === 'mcq' && q.options && q.options.length > 0 && (
                                        <div className="row g-3">
                                            {q.options.map((opt, oIdx) => (
                                                <div key={oIdx} className="col-md-6">
                                                    <div className="p-3 border rounded-3 bg-light-subtle d-flex align-items-center gap-3">
                                                        <div className="small font-monospace fw-bold text-muted border rounded px-2 bg-white">
                                                            {String.fromCharCode(65 + oIdx)}
                                                        </div>
                                                        <div className="text-secondary">{opt.text}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {q.type === 'coding' && (
                                        <div className="mt-4">
                                            <div className="small text-muted mb-2 font-monospace tracking-tighter">STUDENT WORKSPACE / STARTER CODE ({q.language || 'javascript'})</div>
                                            <pre className="p-4 bg-dark text-white rounded-3 small font-monospace overflow-hidden border border-secondary shadow-inner mb-4">
                                                <code>{q.starterCode || '// Write your resolution here...'}</code>
                                            </pre>

                                            {/* Render Test Cases Table */}
                                            {q.testCases && q.testCases.length > 0 && (
                                                <div className="mt-3">
                                                    <h6 className="fw-bold text-secondary mb-2 small text-uppercase">Test Cases (Public)</h6>
                                                    <div className="table-responsive border rounded-3 overflow-hidden">
                                                        <table className="table table-sm table-striped mb-0 small">
                                                            <thead className="table-light">
                                                                <tr>
                                                                    <th scope="col" className="px-3 py-2 border-bottom-0">Input</th>
                                                                    <th scope="col" className="px-3 py-2 border-bottom-0">Expected Output</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {q.testCases.map((tc, tcIdx) => (
                                                                    <tr key={tcIdx}>
                                                                        <td className="px-3 py-2 font-monospace text-wrap">{tc.inputData}</td>
                                                                        <td className="px-3 py-2 font-monospace text-wrap">{tc.expectedOutput}</td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {q.type === 'long' && (
                                        <div className="mt-4 pt-4 border-top border-light-subtle">
                                            <div className="text-muted small italic">Candidate's response area below...</div>
                                            <div style={{ height: '150px', border: '1px dashed #ced4da', borderRadius: '8px', marginTop: '1rem' }}></div>
                                        </div>
                                    )}
                                </motion.div>
                            ))
                        )}
                    </div>
                </div>
            </main>

            {/* Custom Styles */}
            <style>{`
                .max-w-900 { max-width: 900px; }
                .text-indigo { color: #6366f1; }
                .bg-indigo-subtle { background: rgba(99, 102, 241, 0.1); }
                .btn-icon-sm { 
                    width: 40px; height: 40px; border-radius: 12px; 
                    display: flex; align-items: center; justify-content: center; 
                    background: #f8fafc; border: 1px solid #e2e8f0; color: #64748b; 
                    transition: all 0.2s;
                }
                .btn-icon-sm:hover { background: #e2e8f0; color: #1e293b; }
                .page-break-inside-avoid { page-break-inside: avoid; }
                
                @media print {
                    body { background: white !important; }
                    .bg-light-subtle { background: white !important; }
                    .shadow-sm { box-shadow: none !important; }
                    .border { border: 1px solid #dee2e6 !important; }
                    .container-fluid { width: 100% !important; padding: 0 !important; }
                    .p-md-5 { padding: 2rem !important; }
                    header, footer { display: none !important; }
                    .btn { display: none !important; }
                    .max-w-900 { max-width: 100% !important; }
                }

                @media (min-width: 768px) {
                    .border-start-md { border-left: 1px solid !important; }
                }
            `}</style>
        </div>
    );
};

export default PaperView;
