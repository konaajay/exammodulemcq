import React, { useState, useEffect } from 'react';
import { studentService } from '../services/studentService';
import { courseService } from '../services/courseService';
import { useNavigate } from 'react-router-dom';
import { 
    UserPlus, Mail, Phone, BookOpen, Key, 
    CheckCircle, Copy, ArrowLeft, ShieldCheck, 
    ExternalLink
} from 'lucide-react';

const CreateStudent = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        course: ''
    });
    const [loading, setLoading] = useState(false);
    const [credentials, setCredentials] = useState(null); // To store { username, password } after creation
    const [courses, setCourses] = useState([]);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const data = await courseService.getAllCourses();
                setCourses(data || []);
            } catch (e) { console.error("Course fetch failed", e); }
        };
        fetchCourses();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const data = await studentService.createStudent(formData);
            if (data.success) {
                setCredentials({
                    username: data.username,
                    password: data.password,
                    name: formData.name
                });
            }
        } catch (error) {
            alert(error.response?.data?.message || "Failed to create student. Email might already exist.");
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        alert("Copied to clipboard!");
    };

    if (credentials) return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light p-4">
            <div className="bg-white p-5 rounded-4 shadow-lg border text-center max-w-600 animate-fade-in position-relative overflow-hidden">
                <div className="position-absolute top-0 start-0 w-100 h-2 bg-success"></div>
                
                <div className="bg-success-subtle d-inline-flex p-4 rounded-circle mb-4 text-success border border-success border-opacity-25 shadow-sm">
                    <ShieldCheck size={50} />
                </div>
                
                <h2 className="fw-bold text-dark mb-2">Account Created!</h2>
                <p className="text-secondary mb-5">Credentials generated successfully for <b>{credentials.name}</b>.</p>

                <div className="bg-light p-4 rounded-4 border text-start mb-5">
                    <div className="mb-4">
                        <label className="small fw-bold text-muted text-uppercase mb-1 d-block">Username (Email)</label>
                        <div className="d-flex align-items-center justify-content-between bg-white p-3 border rounded-3">
                            <code className="text-primary fs-5">{credentials.username}</code>
                            <button onClick={() => copyToClipboard(credentials.username)} className="btn btn-link p-0 text-secondary hover-primary"><Copy size={18} /></button>
                        </div>
                    </div>
                    <div>
                        <label className="small fw-bold text-muted text-uppercase mb-1 d-block">Temporary Password</label>
                        <div className="d-flex align-items-center justify-content-between bg-white p-3 border rounded-3">
                            <code className="text-dark fs-5 fw-bold">{credentials.password}</code>
                            <button onClick={() => copyToClipboard(credentials.password)} className="btn btn-link p-0 text-secondary hover-primary"><Copy size={18} /></button>
                        </div>
                    </div>
                </div>

                <div className="alert alert-warning border-warning-subtle rounded-3 small text-start d-flex gap-3 mb-5">
                    <ExternalLink size={20} className="flex-shrink-0 mt-1" />
                    <div>
                        <b>Important Note:</b> This password is generated based on the client pattern (first 4 email + @ + first 4 phone). 
                        The student will be forced to change it on their first login.
                    </div>
                </div>

                <div className="d-flex flex-column gap-3">
                    <div className="d-flex gap-2">
                        <a 
                            href={`https://wa.me/${credentials.phone || ''}?text=${encodeURIComponent(
                                `Hello ${credentials.name},\n\nYour Exam Portal credentials are ready!\n\nUser ID: ${credentials.username}\nPassword: ${credentials.password}\n\nLogin here: ${window.location.origin}/login\n\nPlease change your password after first login.`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-success flex-grow-1 rounded-pill fw-bold py-3 d-flex align-items-center justify-content-center gap-2"
                        >
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.067 2.877 1.215 3.076.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                            WhatsApp
                        </a>
                        <a 
                            href={`mailto:${credentials.username}?subject=Exam Portal Credentials&body=${encodeURIComponent(
                                `Hello ${credentials.name},\n\nYour account on the Exam Portal is ready.\n\nUsername: ${credentials.username}\nPassword: ${credentials.password}\n\nLogin: ${window.location.origin}/login`
                            )}`}
                            className="btn btn-danger flex-grow-1 rounded-pill fw-bold py-3 d-flex align-items-center justify-content-center gap-2"
                        >
                            <Mail size={20} /> Gmail
                        </a>
                    </div>
                    <button 
                        className="btn btn-primary btn-lg rounded-pill fw-bold shadow py-3"
                        onClick={() => navigate('/admin/dashboard')}
                    >
                        Return to Hub
                    </button>
                    <button 
                        className="btn btn-link text-secondary text-decoration-none"
                        onClick={() => { setCredentials(null); setFormData({name:'', email:'', phone:'', course:''}); }}
                    >
                        Enroll Another Student
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="container py-5 mt-4">
            <div className="max-w-800 mx-auto">
                <div className="d-flex align-items-center gap-3 mb-5">
                    <button onClick={() => navigate('/admin/dashboard')} className="btn btn-white shadow-sm border rounded-circle p-2"><ArrowLeft size={20} /></button>
                    <div>
                        <h2 className="fw-bold text-dark mb-0">Student Onboarding</h2>
                        <p className="text-muted small">Create a new student account with automated secure credentials</p>
                    </div>
                </div>

                <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                    <div className="card-header bg-white border-bottom p-4">
                        <h5 className="mb-0 fw-bold text-primary d-flex align-items-center gap-2">
                            <UserPlus size={20} /> Personal & Academic Details
                        </h5>
                    </div>
                    
                    <form onSubmit={handleSubmit} className="card-body p-4 bg-white">
                        <div className="row g-4">
                            <div className="col-md-6">
                                <label className="form-label fw-bold small text-secondary">FULL NAME</label>
                                <div className="input-group">
                                    <span className="input-group-text bg-light border-light-subtle"><CheckCircle size={18} className="text-muted" /></span>
                                    <input name="name" required className="form-control form-control-lg border-light-subtle" placeholder="e.g., Santosh Chavithini" value={formData.name} onChange={handleChange} />
                                </div>
                            </div>
                            <div className="col-md-6">
                                <label className="form-label fw-bold small text-secondary">CONTACT NUMBER</label>
                                <div className="input-group">
                                    <span className="input-group-text bg-light border-light-subtle"><Phone size={18} className="text-muted" /></span>
                                    <input name="phone" required className="form-control form-control-lg border-light-subtle" placeholder="e.g., 9876543210" value={formData.phone} onChange={handleChange} />
                                </div>
                            </div>
                            <div className="col-md-6">
                                <label className="form-label fw-bold small text-secondary">EMAIL ADDRESS (USER ID)</label>
                                <div className="input-group">
                                    <span className="input-group-text bg-light border-light-subtle"><Mail size={18} className="text-muted" /></span>
                                    <input name="email" type="email" required className="form-control form-control-lg border-light-subtle" placeholder="e.g., mail@example.com" value={formData.email} onChange={handleChange} />
                                </div>
                            </div>
                            <div className="col-md-6">
                                <label className="form-label fw-bold small text-secondary">SELECT COURSE</label>
                                <div className="input-group">
                                    <span className="input-group-text bg-light border-light-subtle"><BookOpen size={18} className="text-muted" /></span>
                                    <select name="course" required className="form-select form-select-lg border-light-subtle" value={formData.course} onChange={handleChange}>
                                        <option value="">Choose Course...</option>
                                        {courses.map(c => (
                                            <option key={c.id} value={c.name}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="col-12 mt-5 border-top pt-4">
                                <div className="d-flex align-items-center justify-content-between">
                                    <div className="d-flex align-items-center gap-2 text-success small fw-bold">
                                        <Key size={16} /> Secure login will be generated automatically
                                    </div>
                                    <button 
                                        type="submit" 
                                        disabled={loading}
                                        className="btn btn-primary btn-lg px-5 rounded-pill fw-bold shadow-sm d-flex align-items-center gap-2"
                                    >
                                        {loading ? <span className="spinner-border spinner-border-sm" /> : <ShieldCheck size={20} />}
                                        Generate Account
                                    </button>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            <style>{`
                .max-w-800 { max-width: 800px; }
                .max-w-600 { max-width: 600px; }
                .hover-primary:hover { color: #0d6efd !important; }
                .animate-fade-in { animation: fadeIn 0.4s ease-out; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .input-group-text { min-width: 50px; justify-content: center; }
            `}</style>
        </div>
    );
};

export default CreateStudent;
