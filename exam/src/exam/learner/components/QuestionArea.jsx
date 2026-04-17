import React from 'react';
import MCQQuestion from './MCQQuestion';
import CodingQuestion from './CodingQuestion';
import DescriptiveQuestion from './DescriptiveQuestion';

const QuestionArea = ({
    currentQIndex,
    currentQ,
    activeSection,
    answers,
    onAnswerChange,
    onRunCode,
    executing,
    executionResults,
    testCases,
    onMarkForReview,
    onClearResponse,
    onSaveAndNext
}) => {
    if (!currentQ && activeSection?.questions?.length === 0) {
        return (
            <main className="mnc-question-area">
                <div className="p-5 text-center text-muted border-bottom h-100 d-flex flex-column align-items-center justify-content-center">
                    <i className="bi bi-folder2-open display-1 opacity-25 mb-3"></i>
                    <h5 className="fw-light">No questions available in this section.</h5>
                </div>
            </main>
        );
    }

    if (!currentQ) {
        return (
            <main className="mnc-question-area">
                <div className="p-5 text-center text-muted h-100 d-flex flex-column align-items-center justify-content-center">
                    <i className="bi bi-hand-index-thumb display-1 opacity-25 mb-3"></i>
                    <h5 className="fw-light">Please select a question from the palette to begin.</h5>
                </div>
            </main>
        );
    }

    const currentAnswer = answers[currentQ.id];

    return (
        <main className="mnc-question-area shadow-sm">
            <div className="q-top-bar border-bottom">
                <div className="q-number d-flex align-items-center gap-2">
                    <span className="badge bg-primary rounded-circle" style={{ width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{currentQIndex + 1}</span>
                    <span className="fw-bold text-dark">Question No. {currentQIndex + 1}</span>
                </div>
                <div className="q-marks-info d-flex gap-3 align-items-center">
                    <div className="d-flex align-items-center gap-1">
                        <span className="text-muted small">Marks:</span>
                        <span className="q-mark-val text-success">+{currentQ?.marks || 0}</span>
                    </div>
                    <div className="d-flex align-items-center gap-1">
                        <span className="text-muted small">Negative:</span>
                        <span className="q-neg-val text-danger">-{currentQ?.negative || 0}</span>
                    </div>
                </div>
            </div>

            <div className="q-scroll-content bg-white">
                <div className="q-text border-bottom pb-4 mb-4">
                    {currentQ?.text || currentQ?.question}
                </div>

                {currentQ.type === 'coding' ? (
                    <CodingQuestion
                        question={currentQ}
                        answer={currentAnswer}
                        onAnswerChange={onAnswerChange}
                        onRunCode={onRunCode}
                        executing={executing}
                        executionResults={executionResults}
                        testCases={testCases}
                    />
                ) : ['short', 'long', 'fill', 'abacus', 'essay'].includes(currentQ.type) ? (
                    <DescriptiveQuestion
                        answer={currentAnswer}
                        onAnswerChange={onAnswerChange}
                    />
                ) : (
                    <MCQQuestion
                        question={currentQ}
                        answer={currentAnswer}
                        onAnswerChange={onAnswerChange}
                    />
                )}
            </div>

            <div className="mnc-footer-actions border-top bg-light">
                <div className="action-group">
                    <button className="btn-mnc btn-mark-review fw-bold px-4" onClick={onMarkForReview}>
                        <i className="bi bi-bookmark me-2"></i>Mark for Review & Next
                    </button>
                    <button className="btn-mnc btn-clear fw-bold px-4" onClick={onClearResponse}>
                        <i className="bi bi-eraser me-2"></i>Clear Response
                    </button>
                </div>
                <div className="action-group">
                    <button className="btn-mnc btn-save-next fw-bold px-5 py-2 shadow-sm" onClick={onSaveAndNext}>
                        Save & Next <i className="bi bi-arrow-right-short ms-1 fs-5"></i>
                    </button>
                </div>
            </div>
        </main>
    );
};

export default QuestionArea;
