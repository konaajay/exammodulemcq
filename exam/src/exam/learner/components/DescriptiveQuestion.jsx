import React from 'react';

const DescriptiveQuestion = ({ answer, onAnswerChange }) => {
    return (
        <div className="mt-3">
            <label className="form-label fw-bold text-secondary small text-uppercase ls-1">Your response</label>
            <textarea
                className="form-control border-1 shadow-none focus-ring p-3"
                style={{
                    minHeight: '200px',
                    borderRadius: '12px',
                    fontSize: '1.05rem',
                    lineHeight: '1.6',
                    border: '1px solid #e0e0e0'
                }}
                rows={8}
                value={answer || ''}
                onChange={(e) => onAnswerChange(e.target.value)}
                placeholder="Type your detailed answer here..."
            ></textarea>
            <div className="form-text text-muted small mt-2">
                <i className="bi bi-info-circle me-1"></i>
                Your progress is auto-saved as you type.
            </div>
            <style>{`
                .ls-1 { letter-spacing: 0.5px; }
                .focus-ring:focus { box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.1); border-color: #0d6efd; }
            `}</style>
        </div>
    );
};

export default DescriptiveQuestion;
