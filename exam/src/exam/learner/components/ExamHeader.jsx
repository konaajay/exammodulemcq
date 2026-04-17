import React from 'react';
import ExamTimer from './ExamTimer';

const ExamHeader = ({
    examTitle,
    onShowInstructions,
    onViewQuestionPaper,
    timeLeft,
    formatTime
}) => {
    return (
        <header className="mnc-header">
            <div className="mnc-logo">
                <span>SYSTEM PREVIEW</span>
            </div>
            <div className="mnc-exam-title d-none d-md-block fs-5 fw-bold text-truncate" style={{ flex: 1, textAlign: 'center' }}>
                {examTitle}
            </div>

            <div className="d-flex align-items-center gap-2">
                <div className="d-flex gap-2 me-3">
                    <button
                        className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
                        onClick={onShowInstructions}
                        title="Read Instructions"
                    >
                        <i className="bi bi-info-circle"></i>
                        <span className="d-none d-lg-inline">Instructions</span>
                    </button>
                    <button
                        className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
                        onClick={onViewQuestionPaper}
                        title="View Full Question Paper"
                    >
                        <i className="bi bi-file-earmark-text"></i>
                        <span className="d-none d-lg-inline">Paper</span>
                    </button>
                </div>
                <ExamTimer timeLeft={timeLeft} formatTime={formatTime} />
            </div>
        </header>
    );
};

export default ExamHeader;
