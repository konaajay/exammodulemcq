import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { 
    ChevronLeft, Settings, Shield, Layout, Plus, Trash2,
    Terminal, ChevronDown, ChevronUp
} from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import { courseService } from '../services/courseService';

import { useExamBuilder } from '../components/ExamBuilder/useExamBuilder';
import QuestionForm from '../components/ExamBuilder/QuestionForm';
import ReviewSidebar from '../components/ExamBuilder/ReviewSidebar';

const CreateExam = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [courses, setCourses] = useState([]);
    const [showDebug, setShowDebug] = useState(false);
    
    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = searchParams.get('tab') || 'questions';
    const setActiveTab = (tab) => setSearchParams({ tab });

    const {
        activeSetIndex, setActiveSetIndex,
        examDetails, setExamDetails,
        questionSets,
        submitting, parsing,
        handleDetailChange,
        addQuestionSet,
        removeQuestionSet,
        addQuestionToSet,
        removeQuestionFromSet,
        duplicateQuestion,
        editingQuestion,
        setEditingQuestion,
        updateQuestionInSet,
        debugLogs,
        handleBulkUpload,
        saveExam
    } = useExamBuilder();

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const list = await courseService.getAllCourses();
                setCourses(list || []);
            } catch (e) { toast.error("Failed to load courses"); }
        };
        fetchCourses();
    }, []);

    const currentSet = questionSets[activeSetIndex];

    const downloadTemplate = () => {
        const headers = "questionText,optionA,optionB,optionC,optionD,correctOption,explanation,marks\n";
        const blob = new Blob([headers], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = 'template.csv'; a.click();
    };

    return (
        <div className="create-exam-container animate-fade-in">
            <ToastContainer />
            
            {/* Local header removed in favor of global Navbar */}

            <div className="content-layout">
                <div className="main-content-scroll">
                    {activeTab === 'questions' && (
                        <div className="animate-fade-in">
                            <div className="papers-tabs">
                                {questionSets.map((set, idx) => (
                                    <div 
                                        key={idx} 
                                        className={`paper-tab ${activeSetIndex === idx ? 'active' : ''}`}
                                        onClick={() => setActiveSetIndex(idx)}
                                    >
                                        {set.setName} ({set.questions.length})
                                        {questionSets.length > 1 && (
                                            <button className="delete-paper" onClick={(e) => { e.stopPropagation(); removeQuestionSet(idx); }}>
                                                <Trash2 size={12} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                                <button className="add-paper-btn" onClick={addQuestionSet}>
                                    <Plus size={16} />
                                </button>
                            </div>

                            <QuestionForm 
                                activeSetName={currentSet.setName}
                                onAddQuestion={addQuestionToSet}
                                onBulkUpload={handleBulkUpload}
                                downloadTemplate={downloadTemplate}
                                editingQuestion={editingQuestion}
                                setEditingQuestion={setEditingQuestion}
                                onUpdateQuestion={updateQuestionInSet}
                            />
                        </div>
                    )}

                    {activeTab === 'general' && (
                        <div className="settings-section animate-fade-in">
                            <h4 className="fw-bold mb-4">Exam Configuration</h4>
                            <div className="row g-4">
                                <div className="col-12">
                                    <label className="form-label-sm">Exam Title</label>
                                    <input className="form-control-minimal" name="title" value={examDetails.title} onChange={handleDetailChange} placeholder="Enter Exam Title" />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label-sm">Course</label>
                                    <select className="form-select-minimal" name="course" value={examDetails.course} onChange={handleDetailChange}>
                                        <option value="">Select Course</option>
                                        {courses.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label-sm">Duration (Minutes)</label>
                                    <input type="number" className="form-control-minimal" name="durationMinutes" value={examDetails.durationMinutes} onChange={handleDetailChange} />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label-sm">Start Time</label>
                                    <input type="datetime-local" className="form-control-minimal" name="startTime" value={examDetails.startTime} onChange={handleDetailChange} />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label-sm">End Time</label>
                                    <input type="datetime-local" className="form-control-minimal" name="endTime" value={examDetails.endTime} onChange={handleDetailChange} />
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label-sm">Pass %</label>
                                    <input type="number" className="form-control-minimal" name="passPercentage" value={examDetails.passPercentage} onChange={handleDetailChange} />
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label-sm">Negative Marks</label>
                                    <input type="number" step="0.25" className="form-control-minimal" name="negativeMarks" value={examDetails.negativeMarks} onChange={handleDetailChange} />
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label-sm">Max Attempts</label>
                                    <input type="number" className="form-control-minimal" name="maxAttempts" value={examDetails.maxAttempts} onChange={handleDetailChange} />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="security-section animate-fade-in">
                            <h4 className="fw-bold mb-4">Security & Proctoring</h4>
                            <div className="vstack gap-4">
                                {[
                                    { label: 'Browser Tab Lock', name: 'tabLock', desc: 'Prevent students from switching tabs.' },
                                    { label: 'Fullscreen Mode', name: 'fullscreenMode', desc: 'Force exam window to stay in fullscreen.' },
                                    { label: 'Question Randomization', name: 'randomize', desc: 'Shuffle questions for every student.' }
                                ].map(item => (
                                    <div key={item.name} className="security-item p-3 rounded-4 bg-light d-flex justify-content-between align-items-center">
                                        <div>
                                            <h6 className="mb-1 fw-bold">{item.label}</h6>
                                            <p className="text-muted small mb-0">{item.desc}</p>
                                        </div>
                                        <div className="form-check form-switch">
                                            <input type="checkbox" className="form-check-input" name={item.name} checked={examDetails[item.name]} onChange={handleDetailChange} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <ReviewSidebar 
                    currentSet={currentSet}
                    onRemoveQuestion={removeQuestionFromSet}
                    onDuplicateQuestion={duplicateQuestion}
                    onEditQuestion={(q) => setEditingQuestion(q)}
                    onFinalSubmit={saveExam}
                    submitting={submitting}
                />
            </div>

            <div className={`debug-console ${showDebug ? 'expanded' : ''}`}>
                <div className="debug-header" onClick={() => setShowDebug(!showDebug)}>
                    <div className="d-flex align-items-center gap-2">
                        <Terminal size={16} />
                        <span className="small fw-bold">Debug Console</span>
                    </div>
                    {showDebug ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                </div>
                {showDebug && (
                    <div className="debug-content">
                        <div className="row g-3">
                            <div className="col-md-4">
                                <label className="x-small fw-bold text-muted uppercase">Live Activity Log</label>
                                <div className="debug-log-list">
                                    {debugLogs.length === 0 && <div className="text-muted small">No logs yet...</div>}
                                    {debugLogs.map((log, i) => (
                                        <div key={i} className={`debug-log-item ${log.type}`}>
                                            <span className="timestamp">[{log.timestamp}]</span>
                                            <span className="message">{log.msg}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="col-md-4">
                                <label className="x-small fw-bold text-muted uppercase">Exam Details</label>
                                <pre>{JSON.stringify(examDetails, null, 2)}</pre>
                            </div>
                            <div className="col-md-4">
                                <label className="x-small fw-bold text-muted uppercase">Question Sets</label>
                                <pre>{JSON.stringify(questionSets, null, 2)}</pre>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                .create-exam-container { display: flex; flex-direction: column; min-height: calc(100vh - 75px); background: #f8fafc; font-family: 'Inter', sans-serif; }
                .back-btn { width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; border-radius: 50%; border: 1px solid #e2e8f0; background: white; color: #64748b; transition: all 0.2s; margin: 1.5rem 0 0 1.5rem; }
                .back-btn:hover { background: #f8fafc; color: #1e293b; border-color: #cbd5e1; }
                .tab-navigation { display: flex; gap: 0.5rem; background: #f1f5f9; padding: 0.35rem; border-radius: 14px; }
                .tab-btn { padding: 0.5rem 1.25rem; border: none; background: transparent; color: #64748b; font-weight: 700; font-size: 0.9rem; border-radius: 10px; display: flex; align-items: center; gap: 0.5rem; transition: all 0.2s; }
                .tab-btn.active { background: #ffffff; color: #0d6efd; box-shadow: 0 2px 6px rgba(0,0,0,0.05); }
                .content-layout { display: flex; flex: 1; }
                @media (max-width: 992px) {
                    .content-layout { flex-direction: column; overflow-y: auto; }
                    .main-content-scroll { overflow-y: visible; height: auto; padding: 1rem; }
                    .review-sidebar { width: 100% !important; border-left: none; border-top: 1px solid #e2e8f0; height: auto !important; }
                    .create-exam-container { height: auto; min-height: calc(100vh - 75px); overflow-y: auto; }
                }
                .main-content-scroll { flex: 1; padding: 2rem; }
                .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
                .btn-ghost { background: transparent; border: 1px solid #e2e8f0; padding: 0.5rem 1rem; border-radius: 10px; font-size: 0.85rem; font-weight: 700; color: #64748b; display: flex; align-items: center; gap: 0.5rem; transition: all 0.2s; }
                .btn-ghost:hover { background: #f1f5f9; color: #1e293b; }
                .btn-primary-sm { background: #0d6efd; color: white; border: none; padding: 0.5rem 1rem; border-radius: 10px; font-size: 0.85rem; font-weight: 700; display: flex; align-items: center; gap: 0.5rem; transition: all 0.2s; cursor: pointer; }
                .btn-primary-sm:hover { background: #0b5ed7; transform: translateY(-1px); }
                .papers-tabs { display: flex; gap: 0.75rem; margin-bottom: 1.5rem; flex-wrap: wrap; }
                .paper-tab { padding: 0.6rem 1.25rem; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 30px; font-weight: 700; font-size: 0.85rem; color: #64748b; cursor: pointer; display: flex; align-items: center; gap: 0.75rem; transition: all 0.2s; }
                .paper-tab.active { background: #1e293b; color: #ffffff; border-color: #1e293b; }
                .delete-paper { background: rgba(239, 68, 68, 0.1); border: none; color: #ef4444; width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
                .delete-paper:hover { background: #ef4444; color: white; }
                .add-paper-btn { width: 36px; height: 36px; border-radius: 50%; border: 2px dashed #cbd5e1; background: transparent; color: #64748b; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
                .add-paper-btn:hover { border-color: #0d6efd; color: #0d6efd; background: #f0f7ff; }
                .question-form-card { background: #ffffff; border-radius: 20px; border: 1px solid #0d6efd33; overflow: hidden; border-left: 4px solid #0d6efd; }
                .form-header { padding: 1rem 1.5rem; border-bottom: 1px solid #f1f5f9; }
                .form-body { padding: 1.5rem; }
                .form-control-minimal { width: 100%; padding: 0.75rem 1rem; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; font-size: 0.95rem; transition: all 0.2s; }
                .form-control-minimal:focus { outline: none; background: #ffffff; border-color: #0d6efd; box-shadow: 0 0 0 4px rgba(13, 110, 253, 0.05); }
                .input-group-minimal { display: flex; align-items: center; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; }
                .opt-label { padding: 0 1rem; font-weight: 800; color: #64748b; border-right: 1px solid #e2e8f0; }
                .input-group-minimal .form-control-minimal { border: none; background: transparent; }
                .form-label-sm { display: block; font-size: 0.75rem; font-weight: 800; color: #64748b; text-transform: uppercase; margin-bottom: 0.4rem; }
                .form-select-minimal { width: 100%; padding: 0.6rem; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; font-weight: 700; font-size: 0.9rem; cursor: pointer; }
                .btn-accent-sm { background: #22d3ee; color: #1e293b; border: none; padding: 0.75rem; border-radius: 12px; font-weight: 800; display: flex; align-items: center; justify-content: center; gap: 0.5rem; transition: all 0.2s; }
                .btn-accent-sm:hover { background: #06b6d4; transform: translateY(-1px); }
                .btn-update-sm { background: #f59e0b; color: white; border: none; padding: 0.75rem; border-radius: 12px; font-weight: 800; display: flex; align-items: center; justify-content: center; gap: 0.5rem; transition: all 0.2s; }
                .btn-update-sm:hover { background: #d97706; transform: translateY(-1px); }
                .btn-build { background: #10b981; color: white; border: none; padding: 1rem; border-radius: 14px; font-weight: 800; display: flex; align-items: center; justify-content: center; gap: 0.75rem; transition: all 0.2s; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25); width: 100%; }
                .btn-build:hover:not(:disabled) { background: #059669; transform: translateY(-2px); }
                .btn-build:disabled { opacity: 0.6; cursor: not-allowed; box-shadow: none; }
                .review-sidebar { width: 320px; background: #ffffff; border-left: 1px solid #e2e8f0; display: flex; flex-direction: column; }
                .btn-build:hover:not(:disabled) { background: #059669; transform: translateY(-2px); }
                .btn-build:disabled { opacity: 0.6; cursor: not-allowed; box-shadow: none; }
                .animate-fade-in { animation: fadeIn 0.4s ease-out; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .x-small { font-size: 0.75rem; }
                .cursor-pointer { cursor: pointer; }
                .text-primary { color: #0d6efd !important; }
                .text-success { color: #10b981 !important; }
                ::-webkit-scrollbar { width: 6px; }
                ::-webkit-scrollbar-track { background: transparent; }
                ::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
                ::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
                
                .debug-console { position: fixed; bottom: 0; left: 0; right: 0; background: #1e293b; color: #f8fafc; transition: all 0.3s; z-index: 1000; border-top: 1px solid #334155; }
                .debug-header { padding: 0.75rem 1.5rem; cursor: pointer; display: flex; justify-content: space-between; align-items: center; background: #0f172a; }
                .debug-content { height: 300px; padding: 1.5rem; overflow-y: auto; font-family: monospace; font-size: 0.8rem; }
                .debug-content pre { color: #38bdf8; background: transparent; border: none; padding: 0; margin: 0; }
                .debug-content .uppercase { color: #94a3b8; margin-bottom: 0.5rem; display: block; }
                .debug-log-list { display: flex; flex-direction: column; gap: 0.4rem; }
                .debug-log-item { font-size: 0.75rem; display: flex; gap: 0.5rem; padding: 0.2rem 0; }
                .debug-log-item.error { color: #f87171; }
                .debug-log-item.info { color: #34d399; }
                .debug-log-item .timestamp { color: #64748b; flex-shrink: 0; }
            `}</style>
        </div>
    );
};

export default CreateExam;
