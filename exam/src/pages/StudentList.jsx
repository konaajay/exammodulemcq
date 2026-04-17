import React, { useState, useEffect } from 'react';
import { studentService } from '../services/studentService';
import { 
    Users, Search, Filter, Mail, Phone, 
    BookOpen, Trash2, MoreVertical, CheckCircle, 
    Clock, MailCheck, Award
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';

const StudentList = () => {
    const navigate = useNavigate();
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCourse, setFilterCourse] = useState('All');
    const [activeMenuId, setActiveMenuId] = useState(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const toggleMenu = (e, id) => {
        e.stopPropagation();
        setActiveMenuId(activeMenuId === id ? null : id);
    };

    useEffect(() => {
        const closeMenu = () => setActiveMenuId(null);
        window.addEventListener('click', closeMenu);
        return () => window.removeEventListener('click', closeMenu);
    }, []);

    const handleShare = (student, type) => {
        const msg = encodeURIComponent(
            `Hello ${student.name},\n\nYour Exam Portal credentials:\nUser ID: ${student.email}\nPassword: ${student.password}\n\nLogin: ${window.location.origin}/login`
        );
        if (type === 'wa') window.open(`https://wa.me/${student.phone}?text=${msg}`, '_blank');
        else window.location.href = `mailto:${student.email}?subject=Exam Credentials&body=${msg}`;
    };

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            const data = await studentService.getAllStudents();
            setStudents(data || []);
        } catch (error) {
            toast.error("Failed to load student directory");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to remove this student? This action cannot be undone.")) return;
        try {
            await studentService.deleteStudent(id);
            setStudents(prev => prev.filter(s => s.id !== id));
            toast.success("Student removed successfully");
        } catch (error) {
            toast.error("Failed to remove student");
        }
    };

    const filteredStudents = students.filter(s => {
        const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              s.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterCourse === 'All' || s.course === filterCourse;
        return matchesSearch && matchesFilter;
    });

    const courses = ['All', ...new Set(students.map(s => s.course))].filter(Boolean);

    if (loading) return (
        <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light">
            <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading Students...</span>
            </div>
        </div>
    );

    return (
        <div className="container-fluid p-4 p-lg-5 bg-royal min-vh-100">
            <ToastContainer />
            <div className="d-flex justify-content-between align-items-center mb-5">
                <div>
                    <h2 className="fw-bold text-dark mb-1">Student Directory</h2>
                    <p className="text-secondary small">Manage enrolled candidates and track their platform availability</p>
                </div>
                <div className="d-flex gap-3">
                    <div className="badge bg-white shadow-sm border p-3 rounded-4 d-flex align-items-center gap-2 text-dark">
                        <Users size={18} className="text-primary" />
                        <span className="fw-bold fs-6">{students.length} Total Enrolled</span>
                    </div>
                </div>
            </div>

            {/* Search & Filters */}
            <div className="row g-3 mb-5">
                <div className="col-12 col-md-7 col-lg-8">
                    <div className="input-group input-group-lg shadow-sm rounded-4 overflow-hidden border bg-white">
                        <span className="input-group-text bg-transparent border-0 pe-1"><Search size={20} className="text-muted" /></span>
                        <input 
                            type="text" 
                            className="form-control border-0 ps-2" 
                            placeholder="Find student by name or email ID..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <div className="col-12 col-md-5 col-lg-4">
                    <div className="input-group input-group-lg shadow-sm rounded-4 overflow-hidden border bg-white">
                        <span className="input-group-text bg-transparent border-0 pe-1"><Filter size={20} className="text-muted" /></span>
                        <select 
                            className="form-select border-0 shadow-none ps-2 fw-medium"
                            value={filterCourse}
                            onChange={(e) => setFilterCourse(e.target.value)}
                        >
                            {courses.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            {/* Students List Container */}
            <div className="mb-5">
                {!isMobile ? (
                    /* Desktop View: Professional Table */
                    <div className="card border-0 shadow-sm rounded-4">
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0">
                                <thead className="bg-light border-bottom">
                                    <tr>
                                        <th className="px-4 py-3 border-0 text-muted small fw-bold text-uppercase ls-1">Student Details</th>
                                        <th className="py-3 border-0 text-muted small fw-bold text-uppercase ls-1">Course</th>
                                        <th className="py-3 border-0 text-muted small fw-bold text-uppercase ls-1">Contact Info</th>
                                        <th className="py-3 border-0 text-muted small fw-bold text-uppercase ls-1">Access Status</th>
                                        <th className="px-4 py-3 border-0 text-muted small fw-bold text-uppercase ls-1 text-end">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white">
                                    {filteredStudents.length > 0 ? filteredStudents.map((s) => (
                                        <tr key={s.id} className="transition-all hover-bg-light">
                                            <td className="px-4 py-3">
                                                <div className="d-flex align-items-center gap-3">
                                                    <div className="bg-primary-subtle text-primary fw-bold rounded-circle d-flex align-items-center justify-content-center border border-primary-subtle shadow-sm" style={{ width: '42px', height: '42px', fontSize: '0.9rem' }}>
                                                        {s.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="fw-bold text-dark fs-6">{s.name}</div>
                                                        <div className="text-muted small">Student ID: #{s.id}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3">
                                                <div className="badge bg-light text-primary border border-primary-subtle py-2 px-3 rounded-pill fw-medium d-inline-flex align-items-center gap-2">
                                                    <BookOpen size={14} /> {s.course}
                                                </div>
                                            </td>
                                            <td className="py-3">
                                                <div className="d-flex flex-column gap-1">
                                                    <div className="small text-dark d-flex align-items-center gap-2"><Mail size={14} className="text-muted" /> {s.email}</div>
                                                    <div className="small text-dark d-flex align-items-center gap-2"><Phone size={14} className="text-muted" /> {s.phone}</div>
                                                </div>
                                            </td>
                                            <td className="py-3">
                                                {s.firstLogin ? (
                                                    <div className="badge bg-warning-subtle text-warning border border-warning-subtle px-3 py-2 rounded-pill d-inline-flex align-items-center gap-2">
                                                        <Clock size={14} /> Pending Setup
                                                    </div>
                                                ) : (
                                                    <div className="badge bg-success-subtle text-success border border-success-subtle px-3 py-2 rounded-pill d-inline-flex align-items-center gap-2">
                                                        <CheckCircle size={14} /> Active Account
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-end">
                                                <div className="d-flex justify-content-end gap-2 position-relative">
                                                    <button 
                                                        onClick={(e) => toggleMenu(e, s.id)}
                                                        className={`btn btn-sm rounded-3 p-2 transition-all ${activeMenuId === s.id ? 'bg-indigo text-white shadow-indigo' : 'btn-light text-muted'}`}
                                                        style={{ width: '38px', height: '38px' }}
                                                    >
                                                        <MoreVertical size={18} />
                                                    </button>

                                                    {activeMenuId === s.id && (
                                                        <div className="position-absolute end-0 mt-2 bg-white shadow-2xl border rounded-4 py-3 animate-fade-in" style={{ zIndex: 1100, top: '100%', minWidth: '220px' }}>
                                                            <div className="px-4 py-1 small fw-bold text-muted text-uppercase mb-2 ls-1" style={{ fontSize: '0.65rem' }}>Individual Review</div>
                                                            <button onClick={() => navigate(`/admin/students/history/${s.id}`)} className="dropdown-item px-4 py-2 d-flex align-items-center gap-3 transition-all">
                                                                <div className="bg-indigo bg-opacity-10 text-indigo p-2 rounded-3"><Award size={16} /></div>
                                                                <span className="fw-bold small">Performance Report</span>
                                                            </button>
                                                            
                                                            <div className="dropdown-divider my-2 opacity-10"></div>
                                                            <div className="px-4 py-1 small fw-bold text-muted text-uppercase mb-2 ls-1" style={{ fontSize: '0.65rem' }}>Direct Share</div>
                                                            <button onClick={() => handleShare(s, 'wa')} className="dropdown-item px-4 py-2 d-flex align-items-center gap-3 transition-all">
                                                                <div className="bg-success bg-opacity-10 text-success p-2 rounded-3">
                                                                    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.067 2.877 1.215 3.076.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                                                                </div>
                                                                <span className="fw-bold small">WhatsApp Credentials</span>
                                                            </button>
                                                            <button onClick={() => handleShare(s, 'email')} className="dropdown-item px-4 py-2 d-flex align-items-center gap-3 transition-all">
                                                                <div className="bg-danger bg-opacity-10 text-danger p-2 rounded-3"><Mail size={16} /></div>
                                                                <span className="fw-bold small">Email Credentials</span>
                                                            </button>
                                                            
                                                            <div className="dropdown-divider my-2 opacity-10"></div>
                                                            <button onClick={() => handleDelete(s.id)} className="dropdown-item px-4 py-2 d-flex align-items-center gap-3 small text-danger hover-bg-danger-subtle fw-bold">
                                                                <Trash2 size={16} /> Remove Candidate
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="5" className="text-center py-5">
                                                <div className="text-muted py-4">
                                                    <Users size={48} className="mb-3 opacity-25" />
                                                    <p className="fs-6 fw-light mb-0">No students found matching your criteria.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    /* Mobile View: Dynamic Cards */
                    <div className="row g-3">
                        {filteredStudents.length > 0 ? filteredStudents.map((s) => (
                            <div className="col-12" key={s.id}>
                                <div className="card border-0 shadow-sm rounded-4 p-3 hover-row transition-all position-relative">
                                    <div className="d-flex align-items-start justify-content-between mb-3">
                                        <div className="d-flex align-items-center gap-3">
                                            <div className="bg-primary-subtle text-primary fw-bold rounded-circle d-flex align-items-center justify-content-center border border-primary-subtle" style={{ width: '48px', height: '48px' }}>
                                                {s.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="fw-bold text-dark fs-5">{s.name}</div>
                                                <div className="text-muted small">#{s.id} | {s.course}</div>
                                            </div>
                                        </div>
                                        
                                        <div className="position-relative">
                                            <button 
                                                onClick={(e) => toggleMenu(e, s.id)}
                                                className={`btn btn-sm rounded-pill p-2 ${activeMenuId === s.id ? 'bg-indigo text-white shadow-indigo' : 'btn-light text-muted'}`}
                                            >
                                                <MoreVertical size={20} />
                                            </button>
                                            
                                            {activeMenuId === s.id && (
                                                <div className="position-absolute end-0 mt-2 bg-white shadow-2xl border rounded-4 py-3 animate-fade-in" style={{ zIndex: 1100, top: '100%', minWidth: '220px' }}>
                                                    <div className="px-4 py-1 small fw-bold text-muted text-uppercase mb-2 ls-1" style={{ fontSize: '0.6rem' }}>Actions</div>
                                                    <button onClick={() => navigate(`/admin/students/history/${s.id}`)} className="dropdown-item px-4 py-2 d-flex align-items-center gap-3">
                                                        <Award size={18} className="text-indigo" /> Performance Report
                                                    </button>
                                                    <button onClick={() => handleShare(s, 'wa')} className="dropdown-item px-4 py-2 d-flex align-items-center gap-3">
                                                        <div className="text-success"><svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.067 2.877 1.215 3.076.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg></div> WhatsApp
                                                    </button>
                                                    <button onClick={() => handleDelete(s.id)} className="dropdown-item px-4 py-2 text-danger fw-bold">
                                                        <Trash2 size={18} className="me-2" /> Remove
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div className="d-flex flex-column gap-2 mb-3">
                                        <div className="d-flex align-items-center gap-2 text-muted small"><Mail size={14} /> {s.email}</div>
                                        <div className="d-flex align-items-center gap-2 text-muted small"><Phone size={14} /> {s.phone}</div>
                                    </div>

                                    <div className="pt-3 border-top d-flex justify-content-between align-items-center">
                                        {s.firstLogin ? (
                                            <span className="text-warning small fw-bold d-flex align-items-center gap-1">
                                                <Clock size={14} /> Pending Setup
                                            </span>
                                        ) : (
                                            <span className="text-success small fw-bold d-flex align-items-center gap-1">
                                                <CheckCircle size={14} /> Active Account
                                            </span>
                                        )}
                                        <button onClick={() => handleShare(s, 'email')} className="btn btn-sm btn-light text-primary fw-bold px-3 rounded-pill border">
                                            Send Email
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="col-12 text-center py-5">
                                <Users size={48} className="mb-3 opacity-25 mx-auto" />
                                <p className="text-muted">No students matching your search.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <style>{`
                .ls-1 { letter-spacing: 0.05em; }
                .bg-royal { background: #f8fafc; }
                .hover-bg-light:hover { background-color: rgba(13, 110, 253, 0.02); }
                .transition-all { transition: all 0.2s ease-in-out; }
                .hover-primary:hover { color: #0d6efd !important; }
                .hover-bg-danger-subtle:hover { background-color: #fee2e2; color: #dc2626 !important; }
                .shadow-2xl { box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.08); }
                .hover-row { transition: transform 0.2s; }
                .hover-row:hover { transform: translateY(-2px); }
                .ls-1 { letter-spacing: 0.1em; }
            `}</style>
        </div>
    );
};

export default StudentList;
