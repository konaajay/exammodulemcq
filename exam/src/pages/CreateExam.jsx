import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { examService } from '../services/examService';
import { questionService } from '../services/questionService';
import { courseService } from '../services/courseService';
import { 
    Settings2, CheckCircle, Info, Plus, Upload, Trash2, 
    FileText, Save, Download, AlertTriangle, ListChecks, 
    Clock, Calendar, BookOpen, GraduationCap, ShieldAlert
} from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';

const CreateExam = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = !!id;
    
    // 1. Core Exam State
    const [examDetails, setExamDetails] = useState({
        title: '',
        instructions: 'General Instructions:\n1. Duration: 60 minutes.\n2. Do not refresh the page.',
        durationMinutes: 60,
        totalMarks: 0,
        startTime: '',
        endTime: '',
        randomize: false,
        maxAttempts: 1,
        negativeMarks: 0,
        passingPercentage: 40, // Local UI name
        passPercentage: 40,    // Backend name
        tabLock: false,
        fullscreenMode: false,
        course: ''
    });

    // 2. Questions List (Local State)
    const [addedQuestions, setAddedQuestions] = useState([]);

    // 3. Manual Question Form State
    const [manualQuestion, setManualQuestion] = useState({
        questionText: '',
        optionA: '', optionB: '', optionC: '', optionD: '',
        correctOption: 'A',
        marks: 1,
        explanation: ''
    });

    const [courses, setCourses] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [parsing, setParsing] = useState(false);
    const [activeTab, setActiveTab] = useState('config'); // 'config', 'proctor', 'questions'

    const fetchInitialData = async () => {
        try {
            const courseList = await courseService.getAllCourses();
            setCourses(courseList || []);

            if (isEditMode) {
                const data = await examService.getExamById(id);
                if (data) {
                    // Map backend data to UI state
                    const { questions, ...details } = data;
                    
                    const formatDate = (dateString) => {
                        if (!dateString) return '';
                        const d = new Date(dateString);
                        return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
                    };

                    setExamDetails(prev => ({
                        ...prev,
                        ...details,
                        startTime: formatDate(details.startTime),
                        endTime: formatDate(details.endTime),
                        passPercentage: details.passPercentage || details.passingPercentage || 40
                    }));

                    if (questions) setAddedQuestions(questions);
                }
            }
        } catch (error) {
            toast.error("Error loading exam/courses.");
        }
    };

    useEffect(() => {
        fetchInitialData();
    }, [id, isEditMode]);

    // Derived total marks
    const currentTotalMarks = addedQuestions.reduce((sum, q) => sum + (Number(q.marks) || 0), 0);

    // Sync total marks to examDetails
    useEffect(() => {
        setExamDetails(prev => ({ ...prev, totalMarks: currentTotalMarks }));
    }, [currentTotalMarks]);

    const handleDetailChange = (e) => {
        const { name, value, type, checked } = e.target;
        setExamDetails(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleManualChange = (e) => {
        const { name, value } = e.target;
        setManualQuestion(prev => ({ ...prev, [name]: value }));
    };

    const addQuestionManually = () => {
        if (!manualQuestion.questionText) { toast.error("Question text is required."); return; }
        setAddedQuestions(prev => [...prev, { ...manualQuestion, questionType: 'MCQ', id: Date.now() }]);
        setManualQuestion({
            questionText: '',
            optionA: '', optionB: '', optionC: '', optionD: '',
            correctOption: 'A',
            marks: 1,
            explanation: ''
        });
        toast.success(`Question added to local list!`);
    };

    const handleBulkUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        setParsing(true);
        try {
            const resp = await questionService.parseCsv(file);
            // resp is already the array of questions due to axios interceptor
            const parsedQuestions = (resp || []).map(q => ({ ...q, id: Math.random() }));
            setAddedQuestions(prev => [...prev, ...parsedQuestions]);
            toast.success(`${parsedQuestions.length} questions parsed from CSV!`);
        } catch (error) {
            const errorMsg = error.response?.data?.message || error.message || "Unknown error";
            toast.error(`Parsing failed: ${errorMsg}`);
        } finally {
            setParsing(false);
            e.target.value = null;
        }
    };

    const removeQuestion = (id) => {
        setAddedQuestions(prev => prev.filter(q => q.id !== id));
    };

    const handleFinalSubmit = async () => {
        if (!examDetails.title) { toast.error("Exam Title is required."); return; }
        if (!examDetails.course) { toast.error("Course selection is required."); return; }
        if (addedQuestions.length === 0) { toast.error("Please add at least one question."); return; }

        // Time Validation
        if (examDetails.startTime && examDetails.endTime) {
            const start = new Date(examDetails.startTime);
            const end = new Date(examDetails.endTime);
            const durationMs = examDetails.durationMinutes * 60 * 1000;

            if (start >= end) {
                toast.error("Invalid Schedule: End Time must be later than Start Time.");
                return;
            }

            if ((end - start) < durationMs) {
                toast.error(`Invalid Schedule: The exam window must be at least ${examDetails.durationMinutes} minutes long to accommodate the exam duration.`);
                return;
            }
        }

        setSubmitting(true);
        try {
            const payload = {
                examDetails: { ...examDetails },
                questions: addedQuestions.map(({ id, ...q }) => {
                    // If it's a real backend id (Number), keep it for the update update
                    // If it's a Math.random() temp id, remove it
                    if (typeof id === 'number') return { ...q, id };
                    return q;
                })
            };
            await examService.createWithQuestions(payload);
            toast.success(isEditMode ? "Exam Updated Successfully!" : "Exam Created Successfully!");
            setTimeout(() => navigate('/admin/dashboard'), 2000);
        } catch (error) {
            toast.error(error.response?.data?.message || "Final submission failed.");
        } finally {
            setSubmitting(false);
        }
    };

    const downloadTemplate = () => {
        const headers = "questionText,optionA,optionB,optionC,optionD,correctOption,explanation,marks\n";
        const sample = "What is React?,A Library,A Framework,A DB,A Tool,A,Popular JS Library,1\n";
        const filename = 'mcq_template.csv';

        const blob = new Blob([headers + sample], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
    };

    return (
        <div className="container py-5 mt-5">
            <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
            
            <div className="row g-4">
                {/* Tab Navigation Hub */}
                <div className="col-lg-8">
                    <div className="bg-white p-2 rounded-pill shadow-sm border mb-4 d-flex gap-2">
                        {[
                            { id: 'config', label: 'Configuration', icon: <Settings2 size={18} /> },
                            { id: 'proctor', label: 'Proctoring', icon: <ShieldAlert size={18} /> },
                            { id: 'questions', label: 'Questions', icon: <Plus size={18} /> }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`btn flex-grow-1 rounded-pill py-2 fw-bold d-flex align-items-center justify-content-center gap-2 transition-all ${
                                    activeTab === tab.id ? 'btn-primary shadow-sm' : 'btn-light border-0 opacity-75'
                                }`}
                            >
                                {tab.icon} {tab.label}
                            </button>
                        ))}
                    </div>

                    {activeTab === 'config' && (
                        <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4 animate-fade-in">
                        <div className="card-header bg-primary bg-opacity-10 border-0 p-4">
                            <h4 className="fw-bold mb-0 d-flex align-items-center gap-2">
                                <FileText className="text-primary" /> 1. Exam Configuration
                            </h4>
                        </div>
                        <div className="card-body p-4">
                            <div className="row g-3">
                                <div className="col-md-12">
                                    <label className="form-label small fw-bold">Assessment Title</label>
                                    <input name="title" value={examDetails.title} onChange={handleDetailChange} className="form-control rounded-3" placeholder="e.g. Final Semester Examination" />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label small fw-bold">Target Course</label>
                                    <select name="course" value={examDetails.course} onChange={handleDetailChange} className="form-select rounded-3">
                                        <option value="">Select Course</option>
                                        {courses.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div className="col-md-3">
                                    <label className="form-label small fw-bold">Duration (Mins)</label>
                                    <input type="number" name="durationMinutes" value={examDetails.durationMinutes} onChange={handleDetailChange} className="form-control rounded-3" />
                                </div>
                                <div className="col-md-3">
                                    <label className="form-label small fw-bold">Calculated Marks</label>
                                    <input type="number" name="totalMarks" value={examDetails.totalMarks} readOnly className="form-control rounded-3 bg-light opacity-75" />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label small fw-bold">Start Window (24-Hour Format)</label>
                                    <input type="datetime-local" name="startTime" value={examDetails.startTime} onChange={handleDetailChange} className="form-control rounded-3" />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label small fw-bold">End Window (24-Hour Format)</label>
                                    <input type="datetime-local" name="endTime" value={examDetails.endTime} onChange={handleDetailChange} className="form-control rounded-3" />
                                </div>
                            </div>
                        </div>
                        </div>
                    )}

                    {activeTab === 'proctor' && (
                        <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4 animate-fade-in">
                            <div className="card-header bg-dark bg-opacity-10 border-0 p-4">
                                <h4 className="fw-bold mb-0 d-flex align-items-center gap-2">
                                    <ShieldAlert className="text-dark" /> 2. Proctoring & Security
                                </h4>
                            </div>
                            <div className="card-body p-4">
                                <div className="row g-4">
                                    <div className="col-md-6">
                                        <div className={`p-4 rounded-4 border-2 transition-all ${examDetails.fullscreenMode ? 'border-primary bg-primary bg-opacity-10' : 'border-light bg-light'}`}>
                                            <div className="form-check form-switch mb-2">
                                                <input className="form-check-input" type="checkbox" name="fullscreenMode" checked={examDetails.fullscreenMode} onChange={handleDetailChange} />
                                                <label className="form-check-label fw-bold">Fullscreen Mode</label>
                                            </div>
                                            <p className="text-muted small mb-0">Force student into fullscreen. Auto-submits on exit.</p>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className={`p-4 rounded-4 border-2 transition-all ${examDetails.tabLock ? 'border-primary bg-primary bg-opacity-10' : 'border-light bg-light'}`}>
                                            <div className="form-check form-switch mb-2">
                                                <input className="form-check-input" type="checkbox" name="tabLock" checked={examDetails.tabLock} onChange={handleDetailChange} />
                                                <label className="form-check-label fw-bold">Tab Switching Lock</label>
                                            </div>
                                            <p className="text-muted small mb-0">Strictly block tab switching or window minimization.</p>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label small fw-bold">Negative Marks (per wrong answer)</label>
                                        <input type="number" step="0.25" name="negativeMarks" value={examDetails.negativeMarks} onChange={handleDetailChange} className="form-control rounded-3" />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label small fw-bold">Passing Percentage (%)</label>
                                        <input type="number" name="passPercentage" value={examDetails.passPercentage} onChange={handleDetailChange} className="form-control rounded-3" />
                                    </div>
                                    <div className="col-md-6">
                                        <div className="form-check form-switch">
                                            <input className="form-check-input" type="checkbox" name="randomize" checked={examDetails.randomize} onChange={handleDetailChange} />
                                            <label className="form-check-label fw-bold">Shuffle Questions</label>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label small fw-bold">Max Allowed Attempts</label>
                                        <input type="number" name="maxAttempts" value={examDetails.maxAttempts} onChange={handleDetailChange} className="form-control rounded-3" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'questions' && (
                        <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4 animate-fade-in">
                        <div className="card-header bg-dark bg-opacity-10 border-0 p-4 d-flex justify-content-between align-items-center">
                            <h4 className="fw-bold mb-0 d-flex align-items-center gap-2">
                                <Plus className="text-dark" /> 2. Add Questions
                            </h4>
                            <div className="d-flex gap-2">
                                <button onClick={downloadTemplate} className="btn btn-outline-dark btn-sm rounded-pill px-3 d-flex align-items-center gap-1">
                                    <Download size={14} /> Download Template
                                </button>
                                <label className="btn btn-primary btn-sm rounded-pill px-3 d-flex align-items-center gap-1 cursor-pointer">
                                    <Upload size={14} /> {parsing ? 'Parsing...' : 'Bulk Upload'}
                                    <input type="file" className="d-none" accept=".csv" onChange={handleBulkUpload} disabled={parsing} />
                                </label>
                            </div>
                        </div>
                        <div className="card-body p-4 bg-light bg-opacity-50">
                                <div className="bg-white p-4 rounded-4 border border-info border-opacity-25 mb-3">
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <h6 className="fw-bold mb-0 text-info d-flex align-items-center gap-2 small">
                                            <Info size={16} /> MCQ QUESTION INPUT
                                        </h6>
                                    </div>
                                    <div className="row g-3">
                                        <div className="col-12">
                                            <textarea name="questionText" value={manualQuestion.questionText} onChange={handleManualChange} className="form-control rounded-3" placeholder="Enter Question Statement..." rows="2"></textarea>
                                        </div>
                                        
                                        {['A', 'B', 'C', 'D'].map(opt => (
                                            <div key={opt} className="col-md-6">
                                                <div className="input-group">
                                                    <span className="input-group-text bg-light border-end-0">{opt}</span>
                                                    <input name={`option${opt}`} value={manualQuestion[`option${opt}`]} onChange={handleManualChange} className="form-control border-start-0 py-2" placeholder={`Option ${opt}`} />
                                                </div>
                                            </div>
                                        ))}
                                        <div className="col-md-4">
                                            <label className="form-label fs-xs fw-bold">Correct Option</label>
                                            <select name="correctOption" value={manualQuestion.correctOption} onChange={handleManualChange} className="form-select rounded-3">
                                                <option value="A">A</option><option value="B">B</option><option value="C">C</option><option value="D">D</option>
                                            </select>
                                        </div>

                                        <div className="col-md-2">
                                            <label className="form-label fs-xs fw-bold">Marks</label>
                                            <input type="number" name="marks" value={manualQuestion.marks} onChange={handleManualChange} className="form-control rounded-3" />
                                        </div>
                                        <div className="col-12">
                                            <label className="form-label fs-xs fw-bold text-muted">Logical Explanation (For Students)</label>
                                            <textarea name="explanation" value={manualQuestion.explanation} onChange={handleManualChange} className="form-control rounded-3" placeholder="Provide context or step-by-step solution..." rows="1"></textarea>
                                        </div>
                                        <div className="col-12 pt-2">
                                            <button onClick={addQuestionManually} className="btn btn-info text-white w-100 rounded-pill fw-bold py-2 shadow-sm">
                                                <Plus size={18} className="me-1" /> Append to List
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* RIGHT SIDE: PREVIEW AND SUBMIT */}
                <div className="col-lg-4">
                    <div className="sticky-top" style={{ top: '100px' }}>
                        <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
                            <div className="card-header bg-success bg-opacity-10 border-0 p-4">
                                <h4 className="fw-bold mb-0 d-flex align-items-center gap-2 text-success">
                                    <ListChecks /> 3. Build Preview
                                </h4>
                            </div>
                            <div className="card-body p-0">
                                <div className="bg-light p-3 border-bottom d-flex justify-content-between align-items-center">
                                    <span className="small fw-bold">Items in state: {addedQuestions.length}</span>
                                    <span className="badge bg-success rounded-pill fw-bold">{currentTotalMarks} Total Marks</span>
                                </div>
                                <div className="overflow-auto" style={{ maxHeight: '400px' }}>
                                    {addedQuestions.length === 0 ? (
                                        <div className="text-center py-5 opacity-50">
                                            <AlertTriangle size={40} className="mb-2" />
                                            <p className="small mb-0">No questions added yet.</p>
                                        </div>
                                    ) : (
                                        addedQuestions.map((q, idx) => (
                                            <div key={q.id} className="p-3 border-bottom bg-white hover-bg-gray transition-all d-flex justify-content-between align-items-center">
                                                <div className="overflow-hidden me-2">
                                                    <div className="d-flex align-items-center gap-2">
                                                        <div className="small fw-bold text-truncate">{idx + 1}. {q.questionText}</div>
                                                    </div>
                                                    <div className="fs-xs text-muted mt-1">
                                                        <span>Ans: {q.correctOption} • </span>
                                                        {q.marks} Marks
                                                    </div>
                                                </div>
                                                <button onClick={() => removeQuestion(q.id)} className="btn btn-link text-danger p-0 border-0 bg-transparent">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                            <div className="card-footer p-4 border-0 bg-white">
                                <button 
                                    onClick={handleFinalSubmit} 
                                    className="btn btn-success w-100 py-3 rounded-pill fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2"
                                    disabled={submitting}
                                >
                                    {submitting ? <span className="spinner-border spinner-border-sm" /> : <Save size={20} />}
                                    {submitting ? 'Creating Assessment...' : 'Final Build & Create'}
                                </button>
                                <p className="text-center text-muted fs-xs mt-3 mb-0">
                                    This will persist the exam and all questions to the database.
                                </p>
                            </div>
                        </div>
                        
                        <div className="alert alert-warning rounded-4 border-0 shadow-sm p-4 d-flex gap-3">
                            <Info size={24} className="flex-shrink-0" />
                            <div className="small">
                                <strong>Safety Link:</strong> Changes made here are only saved to the database once you click "Final Build". If you refresh the page, the local questions list will be lost.
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <style>{`
                .fs-xs { font-size: 0.75rem; }
                .hover-bg-gray:hover { background-color: #f8f9fa !important; }
                .cursor-pointer { cursor: pointer; }
            `}</style>
        </div>
    );
};

export default CreateExam;
