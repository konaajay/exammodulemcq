import { useEffect, useMemo, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { examService } from "../services/examService";
import { mcqService } from "../../services/mcqService";
import { Eye, Trash2, Database, Search, FileText, Loader2, Play, BookOpen, Upload, Download } from "lucide-react";
import { FaPlus } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const QuestionBank = () => {
    const [viewMode, setViewMode] = useState("exams"); // "exams" or "questions"
    const [type, setType] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    
    const fileInputRef = useRef(null);

    useEffect(() => {
        fetchData();
    }, [viewMode]);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (viewMode === "exams") {
                const exams = await examService.getAllExams();
                setData(exams || []);
            } else {
                const questions = await examService.getAllQuestions();
                setData(questions || []);
            }
        } catch (error) {
            toast.error(`Failed to load ${viewMode}`);
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setUploading(true);
        const toastId = toast.loading("Uploading MCQ data...");
        try {
            await mcqService.uploadMCQ(file);
            toast.update(toastId, { render: "Questions uploaded successfully!", type: "success", isLoading: false, autoClose: 3000 });
            fetchData();
        } catch (error) {
            toast.update(toastId, { render: "Upload failed. Please check CSV format.", type: "error", isLoading: false, autoClose: 3000 });
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const downloadSample = () => {
        const headers = "question,optionA,optionB,optionC,optionD,correctOption,explanation\n";
        const sample = "What is Java?,Language,Animal,Car,Food,A,Java is a programming language\n";
        const blob = new Blob([headers + sample], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'mcq_sample.csv';
        a.click();
    };

    const handleDelete = async (id) => {
        const itemType = viewMode === "exams" ? "exam paper" : "question";
        if (!window.confirm(`Are you sure you want to delete this ${itemType}? This action cannot be undone.`)) return;

        try {
            if (viewMode === "exams") {
                await examService.deleteExam(id);
            } else {
                await examService.deleteQuestion(id);
            }
            setData(prev => prev.filter(item => (item.id || item.questionId) !== id));
            toast.success(`${itemType.charAt(0).toUpperCase() + itemType.slice(1)} deleted successfully`);
        } catch {
            toast.error(`Failed to delete ${itemType}`);
        }
    };

    const filtered = useMemo(() => {
        return data.filter(item => {
            if (viewMode === "exams") {
                const title = item.title || "";
                return title.toLowerCase().includes(searchTerm.toLowerCase());
            } else {
                const qType = (item.questionType || item.type || "all").toLowerCase();
                const matchesType = type === "all" || qType === type;
                const text = item.questionText || item.question || "";
                return matchesType && text.toLowerCase().includes(searchTerm.toLowerCase());
            }
        });
    }, [data, type, searchTerm, viewMode]);

    return (
        <div className="exam-question-bank-container">
            <ToastContainer theme="light" position="bottom-right" />
            <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                accept=".csv" 
                style={{ display: 'none' }} 
            />

            {/* Header */}
            <header className="mb-5">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-4"
                >
                    <div>
                        <h1 className="fw-bold mb-2 text-dark">Question Bank</h1>
                        <p className="text-muted mb-0">Central repository for all created exam papers and assessment logic.</p>
                    </div>

                    <div className="d-flex flex-column flex-sm-row gap-2 align-items-stretch align-items-sm-center">
                        <div className="position-relative flex-grow-1" style={{ minWidth: '280px' }}>
                            <Search className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" size={18} />
                            <input
                                type="text"
                                className="form-control bg-white border-0 shadow-sm ps-5 py-2 rounded-3 text-dark fs-7"
                                placeholder={`Search ${viewMode}...`}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button 
                            className="btn btn-outline-primary d-flex align-items-center gap-2 px-3 fw-medium h-42" 
                            onClick={() => fileInputRef.current.click()}
                            disabled={uploading}
                        >
                            <Upload size={16} /> Bulk Upload
                        </button>
                        <button className="btn btn-light-subtle d-flex align-items-center gap-2 px-3 h-42" title="Download Sample CSV" onClick={downloadSample}>
                            <Download size={16} />
                        </button>
                        <Link to="/exams/create-exam" className="btn btn-premium gap-2 px-4 h-42">
                            <FaPlus size={14} /> <span>New Paper</span>
                        </Link>
                    </div>
                </motion.div>
            </header>

            {/* View Switcher & Filters */}
            <div className="mb-4 d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-4">
                <div className="filter-pills-switcher border-0 shadow-sm">
                    <button
                        className={`filter-pill ${viewMode === 'exams' ? 'active' : ''}`}
                        onClick={() => setViewMode('exams')}
                    >
                        <BookOpen size={16} className="me-2" />
                        Papers
                    </button>
                    <button
                        className={`filter-pill ${viewMode === 'questions' ? 'active' : ''}`}
                        onClick={() => setViewMode('questions')}
                    >
                        <Database size={16} className="me-2" />
                        Pool
                    </button>
                </div>

                {viewMode === 'questions' && (
                    <div className="filter-pills-switcher scrollbar-hide py-1 shadow-sm">
                        {["all", "MCQ"].map(t => (
                            <button
                                key={t}
                                className={`filter-pill ${type === t.toLowerCase() || (type === 'all' && t === 'all') ? 'active' : ''}`}
                                onClick={() => setType(t.toLowerCase())}
                                style={{ fontSize: '11px' }}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* List View */}
            <div className="glass-card shadow-lg border-0 overflow-hidden rounded-4">
                <div className="table-responsive">
                    <table className="table table-hover mb-0 align-middle">
                        <thead>
                            <tr className="bg-light bg-opacity-50 text-muted small text-uppercase fw-bold">
                                <th className="ps-4 py-4 border-0">{viewMode === 'exams' ? 'Reference Title' : 'Question Context'}</th>
                                <th className="py-4 border-0 text-center">Classification</th>
                                <th className="py-4 border-0">Structure</th>
                                <th className="pe-4 py-4 border-0 text-end">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            <AnimatePresence mode="popLayout">
                                {loading ? (
                                    <tr>
                                        <td colSpan="4" className="text-center py-5">
                                            <Loader2 size={32} className="animate-spin text-primary opacity-50 mb-2 mx-auto" />
                                            <div className="text-muted small fw-medium">Accessing secure repository...</div>
                                        </td>
                                    </tr>
                                ) : filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="text-center py-5">
                                            <div className="py-4 d-flex flex-column align-items-center opacity-40">
                                                <Database size={48} strokeWidth={1.5} className="mb-2" />
                                                <p className="mb-0 fw-medium text-dark">No archived {viewMode} found</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filtered.map((item, idx) => {
                                        const id = item.id || item.questionId;
                                        const title = viewMode === "exams" ? item.title : (item.questionText || item.question || "No primary text");
                                        const status = viewMode === "exams" ? (item.status || 'DRAFT') : (item.questionType || item.type || "MCQ");

                                        return (
                                            <motion.tr
                                                key={id}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: idx * 0.05 }}
                                            >
                                                <td className="ps-4 py-3" style={{ maxWidth: '450px' }}>
                                                    <div className="fw-bold mb-1 text-dark text-truncate">
                                                        {title}
                                                    </div>
                                                    <div className="small text-muted font-monospace opacity-75">
                                                        #{String(id).slice(-8).toUpperCase()}
                                                    </div>
                                                </td>
                                                <td className="text-center">
                                                    <span className={`status-pill status-${status.toLowerCase()}`}>
                                                        {status}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="small text-muted">
                                                        {viewMode === 'exams' ? (
                                                            <div className="d-flex flex-column">
                                                                <span className="fw-medium text-dark"><FileText size={12} className="me-1" /> Exam Paper</span>
                                                                <span className="text-xs mt-1">Duration: {item.duration || 0}m • {item.totalQuestions || 0} Qs</span>
                                                            </div>
                                                        ) : (
                                                            <div className="d-flex align-items-center gap-1 fw-medium text-dark">
                                                                <Database size={12} /> MCQ Pool
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="pe-4 text-end">
                                                    <div className="d-flex justify-content-end gap-2">
                                                        {viewMode === 'exams' && (
                                                            <Link to={`/exams/full-paper/${id}`} className="btn-icon-light" title="View Paper">
                                                                <Play size={16} />
                                                            </Link>
                                                        )}
                                                        <button onClick={() => handleDelete(id)} className="btn-icon-light text-danger" title="Delete Entry">
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        );
                                    })
                                )}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>
            </div>

            <style>{`
                .h-42 { height: 42px; }
                .btn-light-subtle { background: #f8f9fa; border: 1px solid #e2e8f0; color: #64748b; }
                .btn-light-subtle:hover { background: #f1f5f9; }
                .text-xs { font-size: 0.75rem; }
            `}</style>
        </div>
    );
};

export default QuestionBank;
