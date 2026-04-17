import React from 'react';

const MNCPreview = ({ question, index, total, onRunCode, executing, executionResults }) => {
    if (!question) return (
        <div className="d-flex flex-column align-items-center justify-content-center h-100 text-muted">
            <i className="bi bi-cursor fs-1 mb-3 opacity-25"></i>
            <p className="fw-medium">Select a question to see the MNC Player preview</p>
        </div>
    );

    const qType = (question.type || "mcq").toLowerCase();

    return (
        <div className="mnc-preview-card bg-white shadow-sm rounded-3 overflow-hidden d-flex flex-column h-100 border" style={{ maxWidth: '900px', margin: '0 auto' }}>
            {/* MNC Header Style */}
            <div className="bg-light border-bottom px-4 py-3 d-flex justify-content-between align-items-center">
                <h6 className="mb-0 fw-bold">Question {index + 1} <span className="text-muted fw-normal">of {total}</span></h6>
                <span className="badge bg-primary px-3 py-2 rounded-pill shadow-sm">{question.marks} Marks</span>
            </div>

            {/* MNC Question Area */}
            <div className="flex-grow-1 p-4 overflow-auto">
                <div className="mb-4">
                    <h5 className="fw-bold text-dark" style={{ lineHeight: '1.6' }}>{question.question || "Untitled Question"}</h5>
                </div>

                {question.image && (
                    <div className="mb-4">
                        <img src={question.image} alt="Reference" className="img-fluid rounded border shadow-sm" style={{ maxHeight: '250px' }} />
                    </div>
                )}

                {/* Options / Input based on Type */}
                <div className="options-area mt-4">
                    {qType === 'mcq' || qType === 'quiz' ? (
                        <div className="vstack gap-3">
                            {(question.options || []).map((opt, i) => (
                                <div key={i} className="p-3 border rounded-3 bg-light bg-opacity-50 d-flex align-items-start gap-3 transition-all">
                                    <div className="rounded-circle border border-2 d-flex align-items-center justify-content-center bg-white shadow-sm" style={{ width: '32px', height: '32px', flexShrink: 0, fontWeight: 'bold' }}>
                                        {String.fromCharCode(65 + i)}
                                    </div>
                                    <div className="flex-grow-1 pt-1">
                                        <div className="d-flex flex-column gap-3">
                                            <span className="fw-medium fs-5 text-dark">{typeof opt === 'object' ? (opt.optionText || opt.text || "") : opt}</span>
                                            {typeof opt === 'object' && opt.image && (
                                                <img src={opt.image} alt="Option preview" className="rounded border" style={{ maxHeight: "120px", maxWidth: "200px" }} />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : qType === 'coding' ? (
                        <div className="coding-area border rounded-3 overflow-hidden shadow-sm">
                            <div className="bg-dark text-light px-3 py-2 d-flex justify-content-between align-items-center">
                                <span className="small font-monospace opacity-75">{question.language?.toUpperCase() || 'JAVA'} Editor Preview</span>
                                <button className="btn btn-primary btn-sm px-3" onClick={onRunCode} disabled={executing}>
                                    {executing ? 'Executing...' : 'Run Output'}
                                </button>
                            </div>
                            <div className="bg-dark text-white p-3 font-monospace x-small" style={{ minHeight: '200px' }}>
                                <pre className="mb-0">{question.starterCode || '// Write your code here...'}</pre>
                            </div>
                        </div>
                    ) : (
                        <div className="p-4 border border-dashed rounded-3 bg-light text-center">
                            <i className="bi bi-pencil-square text-muted fs-3 mb-2 d-block"></i>
                            <p className="small text-muted mb-0 fst-italic">Subjective text answer area will appear here for candidates.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* MNC Footer / Actions Panel */}
            <div className="bg-light border-top p-3 d-flex justify-content-between align-items-center">
                <div className="d-flex gap-2">
                    <button className="btn btn-outline-secondary btn-sm px-3 fw-bold rounded-pill border-2">Mark for Review</button>
                    <button className="btn btn-outline-danger btn-sm px-3 fw-bold rounded-pill border-2">Clear Response</button>
                </div>
                <button className="btn btn-primary px-4 fw-bold rounded-pill shadow-sm">Save & Next</button>
            </div>

            <style>{`
                .mnc-preview-card .fs-5 { font-size: 1rem !important; }
                .mnc-preview-card h5 { font-size: 1.15rem !important; }
            `}</style>
        </div>
    );
};

export default MNCPreview;
