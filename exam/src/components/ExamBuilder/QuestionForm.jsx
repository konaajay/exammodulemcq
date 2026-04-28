import React, { useState, useEffect } from 'react';
import { Plus, Layout, Download, Upload, Check, X } from 'lucide-react';

const QuestionForm = ({ 
    activeSetName, onAddQuestion, onBulkUpload, 
    downloadTemplate, editingQuestion, setEditingQuestion, onUpdateQuestion 
}) => {
    const [manualQuestion, setManualQuestion] = useState({
        questionText: '',
        optionA: '', optionB: '', optionC: '', optionD: '',
        correctOption: 'A',
        marks: 1,
        explanation: ''
    });

    useEffect(() => {
        if (editingQuestion) {
            setManualQuestion(editingQuestion);
            // Scroll form into view if needed
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [editingQuestion]);

    const resetForm = () => {
        setManualQuestion({
            questionText: '',
            optionA: '', optionB: '', optionC: '', optionD: '',
            correctOption: 'A',
            marks: 1,
            explanation: ''
        });
        if (setEditingQuestion) setEditingQuestion(null);
    };

    const handleSubmit = () => {
        if (editingQuestion) {
            const success = onUpdateQuestion(manualQuestion);
            if (success) resetForm();
        } else {
            const success = onAddQuestion(manualQuestion);
            if (success) resetForm();
        }
    };

    return (
        <div className="questions-section animate-fade-in">
            <div className="section-header">
                <h4 className="fw-bold d-flex align-items-center gap-2">
                    <Layout size={22} className="text-primary" /> 2. Question Banks
                </h4>
                <div className="header-actions d-flex gap-2">
                    <button className="btn-ghost" onClick={downloadTemplate}>
                        <Download size={16} /> Template
                    </button>
                    <label className="btn-primary-sm cursor-pointer mb-0">
                        <Upload size={16} /> Bulk Upload
                        <input 
                            type="file" 
                            className="d-none" 
                            accept=".csv" 
                            onChange={(e) => onBulkUpload(e.target.files[0])} 
                        />
                    </label>
                </div>
            </div>

            <div className="question-form-card shadow-sm">
                <div className="form-header d-flex justify-content-between align-items-center">
                    <span className={editingQuestion ? "text-warning fw-bold" : "text-primary fw-bold"}>
                        {editingQuestion ? `Editing Question in ${activeSetName}` : `Manual Add to ${activeSetName}`}
                    </span>
                    {editingQuestion && (
                        <button className="btn btn-sm btn-outline-secondary border-0 rounded-pill" onClick={resetForm}>
                            <X size={14} className="me-1" /> Cancel Edit
                        </button>
                    )}
                </div>
                <div className="form-body">
                    <div className="mb-3">
                        <textarea 
                            className="form-control-minimal"
                            placeholder="Enter question text..."
                            rows="3"
                            value={manualQuestion.questionText}
                            onChange={e => setManualQuestion({...manualQuestion, questionText: e.target.value})}
                        />
                    </div>
                    <div className="row g-3">
                        {['A', 'B', 'C', 'D'].map(opt => (
                            <div key={opt} className="col-md-6">
                                <div className="input-group-minimal">
                                    <span className="opt-label">{opt}</span>
                                    <input 
                                        className="form-control-minimal"
                                        placeholder={`Option ${opt}`}
                                        value={manualQuestion[`option${opt}`]}
                                        onChange={e => setManualQuestion({...manualQuestion, [`option${opt}`]: e.target.value})}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="form-footer mt-4">
                        <div className="row g-3 align-items-center">
                            <div className="col-md-4">
                                <label className="form-label-sm">Correct Option</label>
                                <select 
                                    className="form-select-minimal"
                                    value={manualQuestion.correctOption}
                                    onChange={e => setManualQuestion({...manualQuestion, correctOption: e.target.value})}
                                >
                                    <option value="A">A</option>
                                    <option value="B">B</option>
                                    <option value="C">C</option>
                                    <option value="D">D</option>
                                </select>
                            </div>
                            <div className="col-md-2">
                                <label className="form-label-sm">Marks</label>
                                <input 
                                    type="number" 
                                    className="form-control-minimal text-center"
                                    value={manualQuestion.marks}
                                    onChange={e => setManualQuestion({...manualQuestion, marks: e.target.value})}
                                />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label-sm">Explanation (Optional)</label>
                                <input 
                                    className="form-control-minimal"
                                    placeholder="Why is this the correct answer?"
                                    value={manualQuestion.explanation}
                                    onChange={e => setManualQuestion({...manualQuestion, explanation: e.target.value})}
                                />
                            </div>
                            <div className="col-md-4">
                                <button 
                                    className={`w-100 ${editingQuestion ? 'btn-update-sm' : 'btn-accent-sm'}`} 
                                    onClick={handleSubmit}
                                >
                                    {editingQuestion ? (
                                        <><Check size={18} /> Update Question</>
                                    ) : (
                                        <><Plus size={18} /> Append to {activeSetName}</>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuestionForm;
