import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Play, GraduationCap, Clock, AlertCircle } from 'lucide-react';
import { mcqService } from '../../services/mcqService';
import { examService } from '../services/examService';

const PublicExamLanding = () => {
    const { id: examId } = useParams();
    const navigate = useNavigate();
    
    const [exam, setExam] = useState(null);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(true);
    const [starting, setStarting] = useState(false);

    useEffect(() => {
        const fetchExamInfo = async () => {
            try {
                // We use legacy service to get exam info initially
                const data = await examService.getExamById(examId);
                setExam(data);
            } catch (error) {
                console.error("Failed to load exam info");
            } finally {
                setLoading(false);
            }
        };
        fetchExamInfo();
    }, [examId]);

    const handleStart = async (e) => {
        e.preventDefault();
        if (!name || !email) return;

        setStarting(true);
        try {
            const attempt = await mcqService.startPublicAttempt(examId, { name, email });
            if (attempt && attempt.id) {
                // Navigate to the exam view with the attempt ID
                navigate(`/exams/public/session/${examId}`, { state: { attemptId: attempt.id, examData: exam } });
            }
        } catch (error) {
            alert("Failed to start exam. Please try again.");
        } finally {
            setStarting(false);
        }
    };

    if (loading) return <div className="min-vh-100 d-flex align-items-center justify-content-center">Loading...</div>;

    if (!exam) return <div className="min-vh-100 d-flex align-items-center justify-content-center text-danger">Exam not found or inactive.</div>;

    return (
        <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center p-4">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-5 rounded-4 shadow-lg max-w-500 w-100 border border-info-subtle"
            >
                <div className="text-center mb-4">
                    <div className="bg-primary-subtle d-inline-flex p-3 rounded-circle mb-3">
                        <GraduationCap className="text-primary" size={40} />
                    </div>
                    <h2 className="fw-bold text-dark">{exam.title}</h2>
                    <p className="text-muted">Welcome to the examination portal. Please provide your details to begin.</p>
                </div>

                <div className="row g-3 mb-4">
                    <div className="col-6">
                        <div className="p-3 bg-light rounded-3 text-center">
                            <Clock size={20} className="text-primary mb-1" />
                            <div className="small text-muted">Duration</div>
                            <div className="fw-bold">{exam.duration || 60}m</div>
                        </div>
                    </div>
                    <div className="col-6">
                        <div className="p-3 bg-light rounded-3 text-center">
                            <AlertCircle size={20} className="text-warning mb-1" />
                            <div className="small text-muted">Questions</div>
                            <div className="fw-bold">{exam.totalQuestions || 0} MCQ</div>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleStart}>
                    <div className="mb-3">
                        <label className="form-label small fw-bold text-muted">Full Name</label>
                        <div className="input-group">
                            <span className="input-group-text bg-white border-end-0"><User size={18} /></span>
                            <input 
                                type="text" 
                                className="form-control border-start-0 ps-0" 
                                placeholder="Enter your name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required 
                            />
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="form-label small fw-bold text-muted">Email Address</label>
                        <div className="input-group">
                            <span className="input-group-text bg-white border-end-0"><Mail size={18} /></span>
                            <input 
                                type="email" 
                                className="form-control border-start-0 ps-0" 
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required 
                            />
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={starting}
                        className="btn btn-primary w-100 py-3 rounded-pill fw-bold d-flex align-items-center justify-content-center gap-2 shadow"
                    >
                        {starting ? 'Initializing...' : (
                            <>Start Examination <Play size={18} /></>
                        )}
                    </button>
                    
                    <div className="mt-4 p-3 bg-warning-subtle rounded-3 small text-warning-emphasis">
                        <strong>Important:</strong> The exam will open in fullscreen mode. Switching tabs or exiting fullscreen may lead to automatic submission.
                    </div>
                </form>
            </motion.div>

            <style>{`
                .max-w-500 { max-width: 500px; }
            `}</style>
        </div>
    );
};

export default PublicExamLanding;
