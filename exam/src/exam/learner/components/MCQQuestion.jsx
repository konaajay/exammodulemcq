import React from 'react';

const MCQQuestion = ({ question, answer, onAnswerChange }) => {
    return (
        <div className="mnc-options animate-fade-in">
            {question.options.map((opt, idx) => (
                <label
                    key={opt.id || idx}
                    className={`mnc-option d-flex align-items-center gap-3 p-3 mb-3 border rounded-3 transition-all cursor-pointer ${answer === (opt.id || opt.text) ? 'selected border-primary bg-primary bg-opacity-10' : 'bg-white hover-bg-light'}`}
                    style={{ cursor: 'pointer' }}
                >
                    <div className="d-flex align-items-center justify-content-center" style={{ minWidth: '24px' }}>
                        <input
                            type="radio"
                            className="form-check-input m-0 shadow-none"
                            name={`q-${question.id}`}
                            checked={answer === (opt.id || opt.text)}
                            onChange={() => onAnswerChange(opt.id || opt.text)}
                            style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                        />
                    </div>

                    <div className="flex-grow-1 d-flex flex-column gap-2">
                        <div className="d-flex gap-2 align-items-baseline">
                            <span className="fw-bold text-muted" style={{ fontSize: '0.9rem' }}>{String.fromCharCode(65 + idx)}.</span>
                            <span className="fw-medium text-dark">{opt.text || opt.optionText}</span>
                        </div>

                        {(opt.image || opt.optionImage) && (
                            <div className="mt-1">
                                <img
                                    src={opt.image || opt.optionImage}
                                    alt={`Option ${idx + 1}`}
                                    className="img-fluid rounded border bg-white p-1"
                                    style={{ maxHeight: '180px', width: 'auto', objectFit: 'contain' }}
                                />
                            </div>
                        )}
                    </div>
                </label>
            ))}

            <style>{`
                .hover-bg-light:hover { background-color: #f8f9fa !important; border-color: #dee2e6; }
                .mnc-option.selected { border-width: 2px !important; }
            `}</style>
        </div>
    );
};

export default MCQQuestion;
