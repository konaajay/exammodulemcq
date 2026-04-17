import React, { useState, useEffect } from 'react';
import { studentService } from '../../../services/studentService';
import {
    Clock,
    Calendar,
    CheckCircle,
    AlertCircle,
    FileText,
    Play,
    BookOpen,
    Info
} from 'lucide-react';
import { useToast } from '../../../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import '../StudentDashboard.css';
import './StudentExams.css';

import { useAuth } from '../../../context/useAuth';

const StudentExams = () => {
    const { user } = useAuth();
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');
    const toast = useToast();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchExams = async () => {
            setLoading(true);
            try {
                // Use verified student exams endpoint
                const data = await studentService.getMyExams();
                
                const rawExams = Array.isArray(data) ? data : (data?.data || data?.content || []);
                
                // Robust mapping for exam data
                const normalizedData = (rawExams || []).map((exam, idx) => {
                    const e = exam.exam || exam;
                    const s = exam.examSchedule || exam.schedule || exam;
                    
                    return {
                        id: exam.id || exam.sessionId || exam.examId || `exam-${idx}`,
                        examId: exam.examId || e.id || e.examId,
                        title: exam.examTitle || exam.title || e.examTitle || e.title || e.examName || "Assessment",
                        courseName: exam.courseName || exam.batchName || e.courseName || "LMS Course",
                        status: exam.status || (exam.attemptStatus === 'SUBMITTED' ? 'Completed' : 'Scheduled'),
                        type: exam.type || exam.examType || e.type || e.examType || "Examination",
                        date: exam.examDate || exam.scheduledDate || s.examDate || s.scheduledDate || s.date || s.scheduleDate || (exam.startTime ? new Date(exam.startTime).toLocaleDateString() : "N/A"),
                        startTime: exam.scheduledTime || (exam.startTime ? new Date(exam.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : (s.scheduledTime || s.startTime || s.time || s.scheduleTime || "--:--")),
                        endTime: exam.endTime ? new Date(exam.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "--:--",
                        duration: exam.durationMinutes ? `${exam.durationMinutes} mins` : (exam.duration || e.duration || "TBD"),
                        totalMarks: exam.totalMarks || e.totalMarks || 100,
                        obtainedMarks: exam.obtainedMarks || exam.score || 0
                    };
                });
                setExams(normalizedData);
            } catch (error) {
                console.error("Failed to load exams", error);
                setExams([]); 
                toast.error("Failed to sync your exam schedule.");
            } finally {
                setLoading(false);
            }
        };
        fetchExams();
    }, []);

    const filteredExams = filter === 'All'
        ? exams
        : exams.filter(e => e.status === filter);

    const handleAction = (action, examId, examTitle) => {
        if (action === 'Entering Exam Hall') {
            navigate(`/student/exams/${examId}/take`);
        } else if (action === 'Analyzing Results') {
            navigate('/student/grades');
        } else {
            toast.info(`${action}: ${examTitle}`);
        }
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '70vh' }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="container-fluid p-4 student-exams-container animate-fade-in text-body">
            {/* Page Header */}
            <div className="row mb-5 align-items-center g-3">
                <div className="col-12 col-md-6">
                    <h2 className="fw-bold mb-1 text-body">Assessment Center</h2>
                    <p className="text-muted mb-0 fw-medium">Track your performance, upcoming tests, and verified results.</p>
                </div>
                <div className="col-12 col-md-6 text-md-end">
                    <div className="btn-group" role="group" aria-label="Exam Filter">
                        {['All', 'Scheduled', 'Completed'].map(tab => (
                            <button
                                key={tab}
                                type="button"
                                className={`btn ${filter === tab ? 'btn-primary' : 'btn-outline-primary'}`}
                                onClick={() => setFilter(tab)}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="row g-4">
                {filteredExams.length > 0 ? (
                    filteredExams.map((exam, idx) => (
                        <div className="col-12 col-md-6 col-xl-4" key={`${exam.id}-${idx}`}>
                            <div className="card h-100 border shadow-sm">
                                <div className="card-body d-flex flex-column p-4">
                                    <div className="d-flex justify-content-between align-items-start mb-4">
                                        <div className={`badge rounded-pill px-3 py-2 d-flex align-items-center gap-2 ${exam.status === 'Completed' ? 'bg-success bg-opacity-10 text-success' : 'bg-warning bg-opacity-10 text-warning'}`}>
                                            {exam.status === 'Scheduled' ? <AlertCircle size={14} /> : <CheckCircle size={14} />}
                                            {exam.status}
                                        </div>
                                        <span className="small text-muted text-uppercase fw-bold">{exam.type}</span>
                                    </div>

                                    <h5 className="fw-bold mb-2 text-body">{exam.title}</h5>
                                    <div className="d-flex align-items-center gap-2 text-primary small mb-4 fw-medium">
                                        <BookOpen size={16} />
                                        <span>{exam.courseName}</span>
                                    </div>

                                    <div className="bg-light p-3 rounded-3 mb-4 border">
                                        <div className="row g-3">
                                            <div className="col-6">
                                                <div className="text-muted smaller text-uppercase fw-bold mb-1">Date</div>
                                                <div className="small fw-bold text-body d-flex align-items-center gap-2">
                                                    <Calendar size={14} className="text-primary" /> {exam.date}
                                                </div>
                                            </div>
                                            <div className="col-6">
                                                <div className="text-muted smaller text-uppercase fw-bold mb-1">Start Time</div>
                                                <div className="small fw-bold text-body d-flex align-items-center gap-2">
                                                    <Clock size={14} className="text-primary" /> {exam.startTime}
                                                </div>
                                            </div>
                                            <div className="col-6">
                                                <div className="text-muted smaller text-uppercase fw-bold mb-1">End Time</div>
                                                <div className="small fw-bold text-body d-flex align-items-center gap-2">
                                                    <Clock size={14} className="text-primary" /> {exam.endTime}
                                                </div>
                                            </div>
                                            <div className="col-6">
                                                <div className="text-muted smaller text-uppercase fw-bold mb-1">Duration</div>
                                                <div className="small fw-bold text-body">{exam.duration}</div>
                                            </div>
                                            <div className="col-6">
                                                <div className="text-muted smaller text-uppercase fw-bold mb-1">Total Marks</div>
                                                <div className="small fw-bold text-body">{exam.totalMarks} Points</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-auto pt-3 border-top">
                                        {exam.status === 'Completed' ? (
                                            <div>
                                                <div className="d-flex justify-content-between align-items-center mb-2">
                                                    <span className="text-muted small fw-bold">Grade Achieved</span>
                                                    <span className="fw-bold text-body small">{exam.obtainedMarks || 0} / {exam.totalMarks}</span>
                                                </div>
                                                <div className="progress mb-3" style={{ height: '8px' }}>
                                                    <div
                                                        className="progress-bar bg-success"
                                                        role="progressbar"
                                                        style={{ width: `${(exam.obtainedMarks / exam.totalMarks) * 100}%` }}
                                                        aria-valuenow={exam.obtainedMarks}
                                                        aria-valuemin="0"
                                                        aria-valuemax={exam.totalMarks}
                                                    ></div>
                                                </div>
                                                <button
                                                    className="btn btn-outline-secondary w-100 py-2 fw-bold small transition-all d-flex align-items-center justify-content-center gap-2"
                                                    onClick={() => handleAction('Analyzing Results', exam.examId, exam.title)}
                                                >
                                                    <FileText size={16} /> Detailed Analysis
                                                </button>
                                            </div>
                                        ) : (
                                            <div>
                                                <div className="alert alert-info d-flex align-items-start gap-2 p-2 mb-3 rounded-3 border-0 bg-info bg-opacity-10 text-info small">
                                                    <Info size={16} className="mt-1 flex-shrink-0" />
                                                    <span>Proctored session. Check system requirments beforehand.</span>
                                                </div>
                                                <button
                                                    className="btn btn-primary w-100 py-2 fw-bold shadow-sm transition-all d-flex align-items-center justify-content-center gap-2"
                                                    onClick={() => handleAction('Entering Exam Hall', exam.examId, exam.title)}
                                                >
                                                    <Play size={16} fill="currentColor" /> Enter Exam Hall
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-12 py-5 text-center">
                        <div className="bg-light p-5 rounded-3 border border-dashed">
                            <FileText size={48} className="text-muted opacity-25 mb-3 mx-auto" />
                            <h4 className="fw-bold text-body">No Records Found</h4>
                            <p className="text-muted mb-0">No exams match the selected filter.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentExams;
