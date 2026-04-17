import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { examService } from '../services/examService';
import { 
    BarChart3, ArrowLeft, Download, Search, 
    User, Mail, Calendar, Award, ExternalLink, 
    RefreshCcw, Filter
} from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';

const ExamResults = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [attempts, setAttempts] = useState([]);
    const [exam, setExam] = useState(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const loadData = async () => {
            try {
                const [attemptData, examData] = await Promise.all([
                    examService.getAttemptsByExam(id),
                    examService.getExamById(id)
                ]);
                setAttempts(attemptData || []);
                setExam(examData);
            } catch (error) {
                toast.error("Failed to retrieve result records.");
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [id]);

    const filteredAttempts = attempts.filter(a => 
        (a.studentName?.toLowerCase() || '').includes(search.toLowerCase()) ||
        (a.studentEmail?.toLowerCase() || '').includes(search.toLowerCase())
    );

    const exportToCSV = () => {
        const headers = ["Student Name", "Email", "Score", "Percentage", "Attempt No", "Date"];
        const rows = filteredAttempts.map(a => [
            a.studentName,
            a.studentEmail,
            a.score,
            `${Math.round((a.score / exam.totalMarks) * 100)}%`,
            a.attemptNumber,
            new Date(a.submittedAt).toLocaleString()
        ]);
        
        let csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].map(e => e.join(",")).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Results_${exam?.title || 'Exam'}.csv`);
        document.body.appendChild(link);
        link.click();
    };

    if (loading) return <div className="p-5 text-center">Crunching Performance Data...</div>;

    return (
        <div className="container py-5 mt-4">
            <ToastContainer />
            <div className="mx-auto" style={{ maxWidth: '1100px' }}>
                {/* Header */}
                <div className="d-flex justify-content-between align-items-center mb-5">
                    <div className="d-flex align-items-center gap-3">
                        <button onClick={() => navigate('/admin/dashboard')} className="btn btn-white shadow-sm border rounded-circle p-2">
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h2 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                                <BarChart3 className="text-primary" /> Performance Analytics
                            </h2>
                            <p className="text-muted small mb-0">{exam?.title || 'Assessment'} • Total Responses: {attempts.length}</p>
                        </div>
                    </div>
                    <div className="d-flex gap-2">
                        <button className="btn btn-light border rounded-pill px-4 fw-bold" onClick={exportToCSV}>
                            <Download size={18} className="me-2 text-primary" /> Export CSV
                        </button>
                        <button className="btn btn-primary rounded-pill px-4 fw-bold shadow" onClick={() => window.location.reload()}>
                            <RefreshCcw size={18} className="me-2" /> Refresh
                        </button>
                    </div>
                </div>

                {/* Filters & Stats Bar */}
                <div className="row g-4 mb-4">
                    <div className="col-md-8">
                        <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                            <div className="card-body p-2 d-flex align-items-center bg-white border">
                                <div className="ps-3 text-muted"><Search size={20} /></div>
                                <input 
                                    className="form-control border-0 shadow-none py-3" 
                                    placeholder="Search by student name or email..." 
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                />
                                <div className="pe-3"><Filter size={20} className="text-muted" /></div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="bg-primary text-white p-4 rounded-4 shadow-sm d-flex justify-content-between align-items-center h-100">
                            <div>
                                <div className="small opacity-75 uppercase-tracking fw-bold">Average Score</div>
                                <div className="h3 fw-bold mb-0">
                                    {attempts.length > 0 
                                        ? Math.round(attempts.reduce((s, a) => s + a.score, 0) / attempts.length) 
                                        : 0} / {exam?.totalMarks}
                                </div>
                            </div>
                            <Award size={40} className="opacity-25" />
                        </div>
                    </div>
                </div>

                {/* Results Table */}
                <div className="card border-0 shadow-sm rounded-4 overflow-hidden border">
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="bg-light border-bottom">
                                <tr>
                                    <th className="p-4 small fw-bold text-uppercase ls-1 text-muted">Student Profile</th>
                                    <th className="p-4 small fw-bold text-uppercase ls-1 text-muted">Attempt</th>
                                    <th className="p-4 small fw-bold text-uppercase ls-1 text-muted">Performance</th>
                                    <th className="p-4 small fw-bold text-uppercase ls-1 text-muted">Submission Time</th>
                                    <th className="p-4 small fw-bold text-uppercase ls-1 text-muted text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredAttempts.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="p-5 text-center text-muted">
                                            No assessment attempts found for this query.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredAttempts.map((attempt) => {
                                        const percentage = Math.round((attempt.score / exam.totalMarks) * 100);
                                        return (
                                            <tr key={attempt.id} className="transition-all">
                                                <td className="p-4">
                                                    <div className="d-flex align-items-center gap-3">
                                                        <div className="bg-primary-subtle p-2 rounded-3 text-primary"><User size={20} /></div>
                                                        <div>
                                                            <div className="fw-bold text-dark">{attempt.studentName || 'Guest User'}</div>
                                                            <div className="small text-muted d-flex align-items-center gap-1"><Mail size={12} /> {attempt.studentEmail || 'N/A'}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <span className="badge bg-light text-dark border rounded-pill px-3 py-2">
                                                        Attempt #{attempt.attemptNumber}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    <div className="mb-1 d-flex justify-content-between">
                                                        <span className="fw-bold text-dark">{attempt.score} / {exam.totalMarks}</span>
                                                        <span className="small text-primary fw-bold">{percentage}%</span>
                                                    </div>
                                                    <div className="progress rounded-pill shadow-sm" style={{ height: '6px' }}>
                                                        <div 
                                                            className={`progress-bar rounded-pill ${percentage >= 40 ? 'bg-success' : 'bg-danger'}`} 
                                                            style={{ width: `${percentage}%` }}
                                                        ></div>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="small text-dark d-flex align-items-center gap-2">
                                                        <Calendar size={14} className="text-muted" />
                                                        {new Date(attempt.submittedAt).toLocaleDateString()}
                                                    </div>
                                                    <div className="small text-muted ps-4" style={{ fontSize: '0.7rem' }}>
                                                        {new Date(attempt.submittedAt).toLocaleTimeString()}
                                                    </div>
                                                </td>
                                                <td className="p-4 text-center">
                                                    <button className="btn btn-outline-primary btn-sm rounded-pill px-3" onClick={() => window.open(`/admin/preview/${attempt.id}`, '_blank')}>
                                                        <ExternalLink size={14} className="me-1" /> View Script
                                                    </button>
                                                </td>
                                            </tr>
                                        )
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <style>{`
                .ls-1 { letter-spacing: 0.1em; }
                .uppercase-tracking { letter-spacing: 0.05em; text-transform: uppercase; font-size: 0.7rem; }
                .transition-all { transition: all 0.2s ease; }
                tbody tr:hover { background-color: #fcfdfe; }
            `}</style>
        </div>
    );
};

export default ExamResults;
