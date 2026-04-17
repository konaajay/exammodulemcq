import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { examService } from '../services/examService';
import { 
    LayoutDashboard, Plus, Calendar, FileText, Trash2, 
    CheckCircle2, Clock, Ban, Search, BarChart3, 
    ChevronRight, Timer, Users, MoreHorizontal, Eye,
    Edit3, Settings, Trophy, MessageSquare, ShieldCheck
} from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';

const ExamDashboard = () => {
    const navigate = useNavigate();
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('TOTAL');

    useEffect(() => {
        fetchExams();
    }, []);

    const fetchExams = async () => {
        try {
            const data = await examService.getAllExams();
            setExams(data || []);
        } catch (error) {
            toast.error("Failed to load assessments.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Permanently delete this exam?")) return;
        try {
            await examService.deleteExam(id);
            setExams(prev => prev.filter(e => e.id !== id));
            toast.success("Exam deleted.");
        } catch (error) {
            toast.error("Delete failed.");
        }
    };

    const getExamStatus = (exam) => {
        const now = new Date();
        const start = exam.startTime ? new Date(exam.startTime) : null;
        const end = exam.endTime ? new Date(exam.endTime) : null;

        if (end && now > end) return 'COMPLETED';
        if (start && now < start) return 'UPCOMING';
        return 'ACTIVE';
    };

    const filteredExams = useMemo(() => {
        return exams.filter(e => {
            const status = getExamStatus(e);
            const matchesStatus = statusFilter === 'TOTAL' || status === statusFilter;
            const matchesSearch = e.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                 e.course.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesStatus && matchesSearch;
        });
    }, [exams, statusFilter, searchQuery]);

    const stats = useMemo(() => ({
        total: exams.length,
        active: exams.filter(e => getExamStatus(e) === 'ACTIVE').length,
        upcoming: exams.filter(e => getExamStatus(e) === 'UPCOMING').length,
        completed: exams.filter(e => getExamStatus(e) === 'COMPLETED').length
    }), [exams]);

    if (loading) return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center bg-royal">
            <div className="spinner-border text-primary border-4" style={{ width: '3rem', height: '3rem' }}></div>
        </div>
    );

    return (
        <div className="min-vh-100 bg-royal pb-5">
            <ToastContainer position="bottom-right" />
            


            <div className="container mt-4 animate-fade-in">
                {/* Header Information */}
                <div className="d-flex align-items-center gap-2 mb-4">
                    <div className="bg-primary text-white p-2 rounded-3 shadow-sm">
                        <LayoutDashboard size={24} />
                    </div>
                    <h1 className="h4 fw-bold text-dark mb-0">Exams Control Center</h1>
                </div>

                <div className="row g-4 mb-5">
                    {/* Status Stats Summary */}
                    <div className="col-lg-8">
                        <div className="bg-white p-4 rounded-4 shadow-sm border h-100 d-flex align-items-center overflow-hidden position-relative">
                            <div className="row g-4 w-100">
                                <div className="col-4 border-end">
                                    <div className="d-flex flex-column align-items-center">
                                        <div className="h3 fw-bold text-primary mb-0">{stats.active}</div>
                                        <div className="text-muted small fw-bold text-uppercase ls-wide">Active Exams</div>
                                    </div>
                                </div>
                                <div className="col-4 border-end">
                                    <div className="d-flex flex-column align-items-center">
                                        <div className="h3 fw-bold text-success mb-0">{stats.completed}</div>
                                        <div className="text-muted small fw-bold text-uppercase ls-wide">Completed</div>
                                    </div>
                                </div>
                                <div className="col-4">
                                    <div className="d-flex flex-column align-items-center">
                                        <div className="h3 fw-bold text-warning mb-0">{stats.upcoming}</div>
                                        <div className="text-muted small fw-bold text-uppercase ls-wide">Upcoming</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Activity Gauge Placeholder */}
                    <div className="col-lg-4">
                        <div className="bg-white p-4 rounded-4 shadow-sm border h-100 d-flex align-items-center justify-content-center position-relative overflow-hidden">
                            <div className="text-center">
                                <div className="position-relative d-inline-block">
                                    <svg width="120" height="120" viewBox="0 0 120 120">
                                        <circle cx="60" cy="60" r="50" fill="transparent" stroke="#f1f5f9" strokeWidth="10" />
                                        <circle cx="60" cy="60" r="50" fill="transparent" stroke="#fbbf24" strokeWidth="10" strokeDasharray="314.159" strokeDashoffset={314 * (1 - (stats.active / (stats.total || 1)))} strokeLinecap="round" transform="rotate(-90 60 60)" />
                                    </svg>
                                    <div className="position-absolute top-50 start-50 translate-middle text-center">
                                        <div className="h4 fw-bold mb-0">{Math.round((stats.active / (stats.total || 1)) * 100)}%</div>
                                        <div className="fs-xs text-muted fw-bold">Active</div>
                                    </div>
                                </div>
                            </div>
                            <div className="ms-4">
                                <div className="d-flex align-items-center gap-2 mb-1">
                                    <div className="bg-primary rounded-circle" style={{ width: 8, height: 8 }}></div>
                                    <span className="fs-xs text-muted fw-bold">Active</span>
                                </div>
                                <div className="d-flex align-items-center gap-2 mb-1">
                                    <div className="bg-success rounded-circle" style={{ width: 8, height: 8 }}></div>
                                    <span className="fs-xs text-muted fw-bold">Completed</span>
                                </div>
                                <div className="d-flex align-items-center gap-2">
                                    <div className="bg-warning rounded-circle" style={{ width: 8, height: 8 }}></div>
                                    <span className="fs-xs text-muted fw-bold">Upcoming</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Management Hub */}
                <div className="bg-white rounded-4 shadow-sm border overflow-hidden">
                    <div className="p-4 border-bottom bg-light bg-opacity-10">
                        <div className="row g-3 align-items-center">
                            <div className="col-md-4">
                                <div className="input-group input-group-sm bg-white border rounded-pill px-3 py-1">
                                    <Search size={16} className="text-muted mt-1" />
                                    <input 
                                        type="text" 
                                        className="form-control border-0 bg-transparent py-2" 
                                        placeholder="Search exams or courses..." 
                                        value={searchQuery}
                                        onChange={e => setSearchQuery(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="col-md-8 text-md-end">
                                <div className="d-inline-flex bg-light p-1 rounded-pill border">
                                    {['TOTAL', 'ACTIVE', 'UPCOMING', 'COMPLETED', 'DELETED'].map(status => (
                                        <button 
                                            key={status}
                                            onClick={() => setStatusFilter(status)}
                                            className={`btn btn-sm rounded-pill px-3 py-1 fw-bold fs-xs transition-all border-0 ${statusFilter === status ? 'bg-white text-primary shadow-sm' : 'text-muted'}`}
                                        >
                                            {status}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="bg-light bg-opacity-50">
                                <tr>
                                    <th className="px-4 py-3 border-0 small fw-bold text-muted text-uppercase ls-wide">ID</th>
                                    <th className="px-4 py-3 border-0 small fw-bold text-muted text-uppercase ls-wide">Exam Details</th>
                                    <th className="px-4 py-3 border-0 small fw-bold text-muted text-uppercase ls-wide">Target Audience</th>
                                    <th className="px-4 py-3 border-0 small fw-bold text-muted text-uppercase ls-wide">Status</th>
                                    <th className="px-4 py-3 border-0 small fw-bold text-muted text-uppercase ls-wide text-end">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredExams.length > 0 ? filteredExams.map(exam => {
                                    const status = getExamStatus(exam);
                                    return (
                                        <tr key={exam.id} className="transition-all hover-row">
                                            <td className="px-4 py-4 text-muted small fw-bold">#{exam.id}</td>
                                            <td className="px-4 py-4">
                                                <div className="fw-bold text-dark">{exam.title}</div>
                                                <div className="d-flex align-items-center gap-3 mt-1 text-muted fs-xs">
                                                    <span className="d-flex align-items-center gap-1"><Clock size={12} /> {exam.durationMinutes}m</span>
                                                    <span className="d-flex align-items-center gap-1"><FileText size={12} /> {exam.questions?.length || 0} Qs</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="fw-bold text-secondary small">{exam.course}</div>
                                                <div className="fs-xs text-muted opacity-75">Global Batch</div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className={`badge px-3 py-2 rounded-pill small fw-bold ${
                                                    status === 'ACTIVE' ? 'bg-success-subtle text-success' : 
                                                    status === 'UPCOMING' ? 'bg-warning-subtle text-warning' : 'bg-danger-subtle text-danger'
                                                }`}>
                                                    {status === 'UPCOMING' ? 'SCHEDULED' : status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-end">
                                                <div className="d-flex justify-content-end gap-2 text-muted">
                                                    <button onClick={() => navigate(`/admin/results/${exam.id}`)} className="btn btn-light btn-sm rounded-pill p-2 hover-text-success border-0 bg-transparent" title="View Results">
                                                        <BarChart3 size={18} />
                                                    </button>
                                                    <button onClick={() => navigate(`/admin/preview/${exam.id}`)} className="btn btn-light btn-sm rounded-pill p-2 hover-text-primary border-0 bg-transparent" title="Preview Exam">
                                                        <Eye size={18} />
                                                    </button>
                                                    <button onClick={() => navigate(`/admin/create/${exam.id}`)} className="btn btn-light btn-sm rounded-pill p-2 hover-text-warning border-0 bg-transparent" title="Edit Exam">
                                                        <Edit3 size={18} />
                                                    </button>
                                                    <button onClick={() => handleDelete(exam.id)} className="btn btn-light btn-sm rounded-pill p-2 hover-text-danger border-0 bg-transparent" title="Delete Exam">
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                }) : (
                                    <tr>
                                        <td colSpan="5" className="px-4 py-5 text-center text-muted">
                                            <div className="opacity-25 mb-2"><Search size={40} className="mx-auto" /></div>
                                            <div>No assessments matching your criteria.</div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <style>{`
                .bg-royal { background: #f8fafc; }
                .ls-wide { letter-spacing: 0.1em; }
                .fs-xs { font-size: 0.7rem; }
                .z-1030 { z-index: 1030; }
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .hover-row:hover { background: rgba(13, 110, 253, 0.02) !important; }
                .hover-text-primary:hover { color: #0d6efd !important; }
                .hover-text-warning:hover { color: #f59e0b !important; }
                .hover-text-danger:hover { color: #ef4444 !important; }
                .transition-all { transition: all 0.2s ease-in-out; }
                .animate-fade-in { animation: fadeIn 0.4s ease-out; }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                .hover-opacity-100:hover { opacity: 1 !important; }
                .max-w-150 { max-width: 150px; }
            `}</style>
        </div>
    );
};

export default ExamDashboard;
;
