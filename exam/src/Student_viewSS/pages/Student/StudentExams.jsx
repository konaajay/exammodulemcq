import React, { useState, useEffect } from 'react';
import { studentService } from '../../services/studentService';
import {
    Clock,
    Calendar,
    CheckCircle,
    AlertCircle,
    FileText,
    Play,
    BookOpen
} from 'lucide-react';
import './StudentExams.css';

const StudentExams = () => {
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');

    useEffect(() => {
        const fetchExams = async () => {
            try {
                // Mock behavior instead of API
                const mockExams = [
                    { id: 1, title: 'Midterm Assessment', courseName: 'UI/UX Masterclass', date: 'Mar 15, 2024', startTime: '10:00 AM', duration: '2 Hours', totalMarks: 100, status: 'Scheduled', type: 'Midterm' },
                    { id: 2, title: 'React Basics Quiz', courseName: 'Front-end Dev', date: 'Feb 28, 2024', startTime: '02:00 PM', duration: '30 Mins', totalMarks: 50, obtainedMarks: 45, status: 'Completed', type: 'Quiz' }
                ];
                setExams(mockExams);
            } catch (error) {
                console.error("Failed to fetch exams", error);
            } finally {
                setLoading(false);
            }
        };
        fetchExams();
    }, []);

    const filteredExams = filter === 'All'
        ? exams
        : exams.filter(e => e.status === filter);

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-70">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="student-exams-page container-fluid px-0">
            {/* Header with Stats */}
            <div className="row g-4 mb-4">
                <div className="col-12 col-md-8">
                    <h3 className="fw-bold text-body mb-1">My Exams</h3>
                    <p className="text-muted small">View upcoming schedules and past results.</p>
                </div>
                <div className="col-12 col-md-4 d-flex justify-content-end align-items-center">
                    <div className="glass-card px-3 py-2 d-flex gap-2">
                        {['All', 'Scheduled', 'Completed'].map(tab => (
                            <button
                                key={tab}
                                className={`btn btn-sm ${filter === tab ? 'btn-primary' : 'btn-ghost-light'}`}
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
                    filteredExams.map(exam => (
                        <div className="col-12 col-md-6 col-xl-4" key={exam.id}>
                            <div className={`glass-card h-100 exam-card ${exam.status.toLowerCase()}`}>
                                <div className="d-flex justify-content-between align-items-start mb-3">
                                    <span className={`status-badge ${exam.status.toLowerCase()}`}>
                                        {exam.status === 'Scheduled' ? <AlertCircle size={14} /> : <CheckCircle size={14} />}
                                        {exam.status}
                                    </span>
                                    <span className="exam-type-badge">{exam.type}</span>
                                </div>

                                <h5 className="fw-bold text-body mb-2">{exam.title}</h5>
                                <div className="d-flex align-items-center gap-2 text-primary small mb-3">
                                    <BookOpen size={16} />
                                    <span>{exam.courseName}</span>
                                </div>

                                <div className="exam-details p-3 rounded mb-3">
                                    <div className="d-flex justify-content-between mb-2">
                                        <div className="d-flex align-items-center gap-2 text-secondary small">
                                            <Calendar size={14} /> {exam.date}
                                        </div>
                                        <div className="d-flex align-items-center gap-2 text-secondary small">
                                            <Clock size={14} /> {exam.startTime}
                                        </div>
                                    </div>
                                    <div className="d-flex justify-content-between">
                                        <div className="text-secondary small">Duration: {exam.duration}</div>
                                        <div className="text-secondary small">Marks: {exam.totalMarks}</div>
                                    </div>
                                </div>

                                {exam.status === 'Completed' ? (
                                    <div className="result-area mt-auto">
                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                            <span className="text-muted small">Score Achieved</span>
                                            <span className="fw-bold text-body">{exam.obtainedMarks}/{exam.totalMarks}</span>
                                        </div>
                                        <div className="progress" style={{ height: '6px' }}>
                                            <div
                                                className="progress-bar bg-success"
                                                style={{ width: `${(exam.obtainedMarks / exam.totalMarks) * 100}%` }}
                                            ></div>
                                        </div>
                                        <button className="btn btn-outline-secondary btn-sm w-100 mt-3">View Result Analysis</button>
                                    </div>
                                ) : (
                                    <div className="mt-auto">
                                        <div className="alert alert-info-glass d-flex align-items-start gap-2 p-2 mb-3">
                                            <AlertCircle size={16} className="mt-1 flex-shrink-0" />
                                            <span className="x-small">Ensure you're ready 15 mins before start time. Requires webcam access.</span>
                                        </div>
                                        <button className="btn btn-primary w-100 d-flex align-items-center justify-content-center gap-2">
                                            <Play size={16} /> Start Exam
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-12 py-5 text-center">
                        <FileText size={48} className="text-secondary opacity-25 mb-3" />
                        <h5 className="text-secondary">No exams found</h5>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentExams;
