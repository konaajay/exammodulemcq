import React from 'react';
import { Layout, Search, Trash2, CheckCircle, Copy, Edit3 } from 'lucide-react';

const ReviewSidebar = ({ currentSet, onRemoveQuestion, onDuplicateQuestion, onEditQuestion, onFinalSubmit, submitting }) => {
    const totalMarks = currentSet.questions.reduce((sum, q) => sum + (Number(q.marks) || 0), 0);

    return (
        <div className="review-sidebar">
            <div className="review-header">
                <h5 className="fw-bold d-flex align-items-center gap-2">
                    <Layout size={20} className="text-success" /> Review & Build
                </h5>
            </div>
            <div className="review-stats p-3 border-bottom bg-light">
                <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="small fw-bold">Active: {currentSet.setName}</span>
                    <span className="badge bg-success rounded-pill">{totalMarks} Marks</span>
                </div>
                <p className="x-small text-muted mb-0">{currentSet.questions.length} questions in this paper.</p>
            </div>
            <div className="review-questions-list">
                {currentSet.questions.length === 0 ? (
                    <div className="empty-review py-5 text-center">
                        <Search size={32} className="text-muted opacity-25 mb-2" />
                        <p className="small text-muted">Add questions to review</p>
                    </div>
                ) : (
                    currentSet.questions.map((q, idx) => (
                        <div key={q.id} className="review-item animate-fade-in">
                            <div className="item-content">
                                <div className="small fw-bold">{idx + 1}. {q.questionText}</div>
                                <div className="x-small text-muted">Ans: {q.correctOption} • {q.marks} Marks</div>
                                {q.explanation && <div className="x-small text-info mt-1 italic">💡 {q.explanation}</div>}
                            </div>
                            <div className="d-flex gap-1">
                                <button className="item-delete" title="Duplicate" onClick={() => onDuplicateQuestion(q.id)}>
                                     <Copy size={14} className="text-muted" />
                                 </button>
                                 <button className="item-delete text-primary" title="Edit" onClick={() => onEditQuestion(q)}>
                                     <Edit3 size={14} />
                                 </button>
                                <button className="item-delete" title="Delete" onClick={() => onRemoveQuestion(q.id)}>
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
            <div className="review-footer p-3">
                <button 
                    className="btn-build w-100" 
                    onClick={onFinalSubmit}
                    disabled={submitting || currentSet.questions.length === 0}
                >
                    {submitting ? (
                        <>
                            <span className="spinner-border spinner-border-sm me-2" />
                            Building...
                        </>
                    ) : (
                        <>
                            <CheckCircle size={18} /> Final Build & Create
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default ReviewSidebar;
