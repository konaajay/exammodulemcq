import React, { useState } from 'react';
import { EXAM_TEMPLATES } from '../data/constants';

const ExamSetupCard = ({ onStart, onTemplateSelect }) => {
    const [selectedType, setSelectedType] = useState('mixed');

    return (
        <div className="container py-5">
            <div className="row justify-content-center">
                <div className="col-lg-8 text-center mb-5">
                    <h1 className="fw-bold display-5 mb-3">Create New Assessment</h1>
                    <p className="text-muted lead">Choose how you want to start building your exam.</p>
                </div>
            </div>

            <div className="row g-4 justify-content-center">
                {/* Option 1: Start Blank */}
                <div className="col-md-5">
                    <div className="card h-100 border-0 shadow-lg hover-lift transition-all" style={{ borderRadius: '20px' }}>
                        <div className="card-body p-5 text-center d-flex flex-column">
                            <div className="mb-4">
                                <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-inline-flex align-items-center justify-content-center" style={{ width: 80, height: 80 }}>
                                    <i className="bi bi-file-earmark-plus display-6"></i>
                                </div>
                            </div>
                            <h4 className="fw-bold mb-3">Start from Scratch</h4>
                            <p className="text-muted mb-4 flex-grow-1">Define your own structure. Choose a specific format or mix different question types.</p>

                            <div className="mb-3 text-start">
                                <label className="form-label small fw-bold text-uppercase text-muted ls-1">Select Format</label>
                                <select className="form-select form-select-lg bg-light border-0" value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
                                    <option value="mixed">Mixed (Flexible)</option>
                                    <option value="coding">Coding Challenge</option>
                                    <option value="quiz">Quiz (MCQ Only)</option>
                                    <option value="short">Short Answer</option>
                                </select>
                            </div>

                            <button className="btn btn-primary btn-lg w-100 fw-bold shadow-sm" onClick={() => onStart(selectedType)}>
                                Create Blank Exam <i className="bi bi-arrow-right ms-2"></i>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Option 2: Use Template */}
                <div className="col-md-5">
                    <div className="card h-100 border-0 shadow-lg hover-lift transition-all" style={{ borderRadius: '20px' }}>
                        <div className="card-body p-5 text-center d-flex flex-column">
                            <div className="mb-4">
                                <div className="bg-success bg-opacity-10 text-success rounded-circle d-inline-flex align-items-center justify-content-center" style={{ width: 80, height: 80 }}>
                                    <i className="bi bi-grid-1x2 display-6"></i>
                                </div>
                            </div>
                            <h4 className="fw-bold mb-3">Use a Template</h4>
                            <p className="text-muted mb-4 flex-grow-1">Jumpstart with pre-built exams for popular topics like React, Node.js, and Algorithms.</p>

                            <div className="d-grid gap-2">
                                {EXAM_TEMPLATES.map(t => (
                                    <button key={t.id} className="btn btn-outline-light text-dark border-light bg-light text-start d-flex align-items-center p-3 rounded-3" onClick={() => onTemplateSelect(t)}>
                                        <i className="bi bi-file-text me-3 fs-5 text-secondary"></i>
                                        <div>
                                            <div className="fw-bold text-dark">{t.title}</div>
                                            <div className="small text-muted">{t.course}</div>
                                        </div>
                                        <i className="bi bi-chevron-right ms-auto text-muted"></i>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExamSetupCard;
