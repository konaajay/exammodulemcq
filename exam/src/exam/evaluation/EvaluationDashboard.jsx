import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { 
    FiCheckSquare, 
    FiClock, 
    FiUser, 
    FiBook, 
    FiArrowRight, 
    FiSearch, 
    FiFilter,
    FiAlertCircle,
    FiAward
} from "react-icons/fi";
import { examService } from "../services/examService";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

const EvaluationDashboard = () => {
    const [attempts, setAttempts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filter, setFilter] = useState("PENDING");

    useEffect(() => {
        fetchAttempts();
    }, []);

    const fetchAttempts = async () => {
        setLoading(true);
        try {
            const data = await examService.getAttemptsForEvaluation();
            setAttempts(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Failed to fetch attempts for evaluation:", error);
        } finally {
            setLoading(false);
        }
    };

    const stats = {
        pending: attempts.filter(a => a.status !== 'EVALUATED').length,
        evaluated: attempts.filter(a => a.status === 'EVALUATED').length,
        avgScore: attempts.length > 0 ? (attempts.reduce((acc, curr) => acc + (curr.score || 0), 0) / attempts.length).toFixed(1) : 0
    };

    const filteredAttempts = attempts.filter(attempt => {
        const matchesSearch = 
            (attempt.examTitle || attempt.examId?.toString() || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (attempt.studentName || attempt.studentId?.toString() || "").toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesFilter = 
            filter === "ALL" || 
            (filter === "PENDING" && (attempt.status === "SUBMITTED" || attempt.status === "PENDING_EVALUATION" || attempt.status === "EVALUATING")) ||
            (filter === "EVALUATED" && attempt.status === "EVALUATED");

        return matchesSearch && matchesFilter;
    });

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100 bg-white">
                <Loader2 className="animate-spin text-primary" size={48} />
            </div>
        );
    }

    return (
        <div className="evaluation-page">
            <div className="container-fluid px-4 pt-0 pb-4">
                {/* Header Section */}
                <div className="row align-items-center mb-3">
                    <div className="col">
                        <h4 className="fw-bold text-dark mb-1">Evaluation Center</h4>
                        <p className="text-muted small mb-0">Review student submissions and provide detailed grading feedback.</p>
                    </div>
                    <div className="col-auto">
                        <button className="btn btn-white border shadow-sm btn-sm px-3 py-2 fw-bold d-flex align-items-center gap-2" onClick={fetchAttempts}>
                            <Loader2 size={14} className={loading ? 'animate-spin' : ''} /> Refresh Data
                        </button>
                    </div>
                </div>

                {/* Dashboard Stats */}
                <div className="row g-3 mb-3">
                    <div className="col-md-4">
                        <div className="card border-0 shadow-sm rounded-4 p-3 overflow-hidden position-relative h-100">
                            <div className="d-flex align-items-center gap-3">
                                <div className="bg-warning bg-opacity-10 text-warning p-3 rounded-4">
                                    <FiAlertCircle size={24} />
                                </div>
                                <div>
                                    <h3 className="fw-bold mb-0">{stats.pending}</h3>
                                    <span className="text-muted small fw-bold uppercase">Pending Reviews</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="card border-0 shadow-sm rounded-4 p-3 h-100">
                            <div className="d-flex align-items-center gap-3">
                                <div className="bg-success bg-opacity-10 text-success p-3 rounded-4">
                                    <FiCheckSquare size={24} />
                                </div>
                                <div>
                                    <h3 className="fw-bold mb-0">{stats.evaluated}</h3>
                                    <span className="text-muted small fw-bold uppercase">Evaluated Results</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="card border-0 shadow-sm rounded-4 p-3 h-100">
                            <div className="d-flex align-items-center gap-3">
                                <div className="bg-primary bg-opacity-10 text-primary p-3 rounded-4">
                                    <FiAward size={24} />
                                </div>
                                <div>
                                    <h3 className="fw-bold mb-0">{stats.avgScore}</h3>
                                    <span className="text-muted small fw-bold uppercase">Avg Performance</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters Area */}
                <div className="card border-0 shadow-sm rounded-4 p-3 mb-3 bg-white">
                    <div className="row g-3">
                        <div className="col-lg-7 col-md-6">
                            <div className="input-group">
                                <span className="input-group-text bg-transparent border-end-0 border-light ps-3">
                                    <FiSearch className="text-muted" />
                                </span>
                                <input 
                                    type="text" 
                                    className="form-control border-start-0 border-light py-2 bg-transparent"
                                    placeholder="Search student or exam name..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="col-lg-5 col-md-6">
                            <div className="d-flex gap-1 p-1 bg-light rounded-3">
                                {['PENDING', 'EVALUATED', 'ALL'].map((f) => (
                                    <button 
                                        key={f}
                                        className={`btn btn-sm flex-fill rounded-2 border-0 fw-bold py-2 transition-all ${filter === f ? 'bg-white text-primary shadow-sm' : 'text-muted'}`}
                                        onClick={() => setFilter(f)}
                                    >
                                        {f === 'PENDING' && <FiAlertCircle className="me-1" size={14}/>}
                                        {f === 'EVALUATED' && <FiCheckSquare className="me-1" size={14}/>}
                                        {f === 'ALL' && <FiFilter className="me-1" size={14}/>}
                                        {f.charAt(0) + f.slice(1).toLowerCase()}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Table Section */}
                <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-5">
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0 custom-table">
                            <thead className="bg-light bg-opacity-50 text-muted small fw-bold uppercase tracking-wider">
                                <tr>
                                    <th className="ps-4 py-3">Student Name</th>
                                    <th className="py-3">Exam Details</th>
                                    <th className="py-3">Submission Info</th>
                                    <th className="text-center py-3">Auto Score</th>
                                    <th className="text-center py-3">Status</th>
                                    <th className="text-end pe-4 py-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredAttempts.length > 0 ? (
                                    filteredAttempts.map((attempt) => (
                                        <tr key={attempt.attemptId} className="border-bottom-gray transition-all">
                                            <td className="ps-4 py-4">
                                                <div className="d-flex align-items-center gap-3">
                                                    <div className="avatar-sm bg-indigo-soft text-indigo-6 fw-bold rounded-circle d-flex align-items-center justify-content-center" style={{ width: 40, height: 40}}>
                                                        {attempt.studentName?.charAt(0) || <FiUser />}
                                                    </div>
                                                    <div>
                                                        <div className="text-dark fw-bold">{attempt.studentName}</div>
                                                        <div className="text-muted x-small">SID: {attempt.studentId}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4">
                                                <div className="fw-semibold text-dark">{attempt.examTitle}</div>
                                                <div className="text-muted x-small d-flex align-items-center gap-1">
                                                    <FiBook size={10} /> Batch Exam
                                                </div>
                                            </td>
                                            <td className="py-4 text-muted small">
                                                <div className="d-flex align-items-center gap-1">
                                                    <FiClock size={12} /> {new Date(attempt.endTime || attempt.submittedAt).toLocaleDateString()}
                                                </div>
                                                <div className="opacity-50 ms-3">{new Date(attempt.endTime || attempt.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                            </td>
                                            <td className="text-center py-4">
                                                <span className="fw-bold text-dark">{attempt.score?.toFixed(1) || "0.0"}</span>
                                            </td>
                                            <td className="text-center py-4">
                                                <span className={`badge rounded-pill px-3 py-2 fw-bold small ${(attempt.status === 'SUBMITTED' || attempt.status === 'PENDING_EVALUATION' || attempt.status === 'EVALUATING') ? 'bg-warning-subtle text-warning' : 'bg-success-subtle text-success'}`}>
                                                    {(attempt.status === 'SUBMITTED' || attempt.status === 'PENDING_EVALUATION' || attempt.status === 'EVALUATING') ? 'Wait Review' : 'Evaluated'}
                                                </span>
                                            </td>
                                            <td className="text-end pe-4 py-4">
                                                <Link 
                                                    to={`/exams/evaluation/${attempt.attemptId}`} 
                                                    className="btn btn-sm px-4 rounded-pill fw-bold text-white shadow-sm transition-all hover-lift"
                                                    style={{ background: '#4f46e5', border: 'none', height: 32, fontSize: 13 }}
                                                >
                                                    Evaluate
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="text-center py-5">
                                            <div className="opacity-10 mb-2"><FiCheckSquare size={64}/></div>
                                            <h6 className="text-muted fw-bold">Queue Empty</h6>
                                            <p className="small text-muted mb-0">No exam submissions found for this filter.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <style>{`
                .container-fluid { max-width: 1400px; }
                .border-bottom-gray { border-bottom: 1px solid #f1f5f9; }
                .x-small { font-size: 11px; }
                .hover-lift { transition: all 0.2s ease; }
                .hover-lift:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(79, 70, 229, 0.25); }
                .bg-indigo-soft { background: #eef2ff; }
                .text-indigo-6 { color: #4f46e5; }
                .btn-white { background: #ffffff; color: #1e293b; }
                .btn-white:hover { background: #f8fafc; color: #000; }
                .custom-table th { border-bottom: none !important; }
            `}</style>
        </div>
    );
};


export default EvaluationDashboard;
