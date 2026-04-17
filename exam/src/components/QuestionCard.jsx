import React from 'react';

const QuestionCard = ({ question, idx, total, selectedOption, onSelect, examMarks, negativeMarks, disabled }) => {
    if (!question) return null;

    const options = [
        { id: 'A', text: question.optionA },
        { id: 'B', text: question.optionB },
        { id: 'C', text: question.optionC },
        { id: 'D', text: question.optionD },
    ];

    return (
        <div className={`bg-white rounded-4 shadow-sm border border-light-subtle overflow-hidden ${disabled ? 'opacity-75' : ''}`}>
            {/* Question Header */}
            <div className="bg-light px-4 py-3 border-bottom d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center gap-2">
                    <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center text-white fw-bold" style={{ width: '28px', height: '28px', fontSize: '0.85rem' }}>
                        {idx + 1}
                    </div>
                    <span className="fw-bold text-dark">Question No. {idx + 1}</span>
                </div>
                <div className="d-flex gap-3 small fw-medium">
                    <span className="text-muted">Marks: <span className="text-success">+{question.marks || 1}</span></span>
                    <span className="text-muted">Negative: <span className="text-danger">-{negativeMarks || 0}</span></span>
                </div>
            </div>

            {/* Question Body */}
            <div className="p-4">
                <p className="fs-5 text-dark mb-5 lh-base" style={{ whiteSpace: 'pre-wrap' }}>
                    {question.questionText}
                </p>

                <div className="d-flex flex-column gap-3">
                    {options.map((opt) => (
                        <div 
                            key={opt.id}
                            onClick={() => !disabled && onSelect(opt.id)}
                            className={`d-flex align-items-center gap-3 p-3 rounded-3 border transition-all ${
                                !disabled ? 'cursor-pointer hover-bg-light' : 'cursor-default'
                            } ${
                                selectedOption === opt.id 
                                ? 'border-primary bg-primary bg-opacity-10' 
                                : 'border-light-subtle'
                            }`}
                            style={{ cursor: disabled ? 'default' : 'pointer' }}
                        >
                            <div className={`rounded-circle border d-flex align-items-center justify-content-center flex-shrink-0 ${
                                selectedOption === opt.id ? 'border-primary bg-primary text-white' : 'border-secondary-subtle bg-white text-muted'
                            }`} style={{ width: '24px', height: '24px', fontSize: '0.75rem' }}>
                                {opt.id}
                            </div>
                            <span className={`fs-6 ${selectedOption === opt.id ? 'text-primary fw-medium' : 'text-dark'}`}>
                                {opt.text}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <style>{`
                .hover-bg-light:hover { background-color: #f8f9fa; border-color: #dee2e6; }
                .cursor-pointer { cursor: pointer; }
                .transition-all { transition: all 0.2s ease-in-out; }
            `}</style>
        </div>
    );
};

export default QuestionCard;
