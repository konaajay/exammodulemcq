import React from 'react';

const ExamPaper = ({ examData, zoom, removeQuestion, editQuestion, duplicateQuestion, editingIndex }) => {
    const { title, course, duration, totalMarks, questions, customAssets, instructions } = examData;

    const paperContainerStyle = {
        transform: `scale(${zoom / 100})`,
        transformOrigin: 'top center',
        transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        maxWidth: customAssets.orientation === 'landscape' ? '1123px' : '850px',
        width: '100%',
        margin: '0 auto',
        pointerEvents: 'auto'
    };

    const paperContentStyle = {
        backgroundColor: '#ffffff',
        backgroundImage: customAssets.bgImage ? `url(${customAssets.bgImage})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '1123px',
        position: 'relative',
        color: '#000000'
    };

    return (
        <div style={paperContainerStyle} className="shadow-lg rounded-1 bg-white">
            <div style={paperContentStyle} className="p-5 d-flex flex-column rounded-1">
                {/* Watermark Overlay */}
                {customAssets.watermark && (
                    <div className="position-absolute top-50 start-50 translate-middle w-50"
                        style={{
                            zIndex: 1,
                            opacity: customAssets.watermarkOpacity || 0.1,
                            pointerEvents: 'none',
                            userSelect: 'none'
                        }}>
                        <img src={customAssets.watermark} alt="" className="img-fluid" />
                    </div>
                )}

                {/* Content Layer */}
                <div className="position-relative h-100" style={{ zIndex: 2 }}>
                    {/* Header */}
                    <div className="text-center border-bottom border-dark pb-4 mb-5">
                        {customAssets.logo && (
                            <img src={customAssets.logo} alt="Logo" className="mb-3 d-block mx-auto" style={{ height: '64px', objectFit: 'contain' }} />
                        )}
                        <h1 className="fw-bold mb-3 text-uppercase" style={{ letterSpacing: '2px', fontSize: '2.5rem' }}>{title}</h1>
                        <div className="d-flex justify-content-center gap-4 text-muted small fw-bold text-uppercase ls-1">
                            <span>{course}</span>
                            <span className="opacity-50">•</span>
                            <span>{duration} Minutes</span>
                            <span className="opacity-50">•</span>
                            <span>Max Marks: {totalMarks}</span>
                        </div>

                        {instructions && (
                            <div className="mt-4 text-start bg-light p-4 rounded-3 border">
                                <h6 className="fw-bold x-small text-uppercase mb-2 text-primary">Instructions:</h6>
                                <p className="small mb-0 opacity-75" style={{ whiteSpace: 'pre-line', lineHeight: '1.6' }}>{instructions}</p>
                            </div>
                        )}
                    </div>

                    {/* Questions Body */}
                    <div className="questions-container">
                        {questions.length === 0 ? (
                            <div className="text-center text-muted py-5 border border-dashed rounded-3 bg-light opacity-50">
                                <i className="bi bi-file-earmark-plus display-4 mb-2 d-block"></i>
                                <p className="mb-0 fw-medium">Paper is currently empty. <br /> Add questions from the left panel.</p>
                            </div>
                        ) : (
                            <div className="vstack gap-5">
                                {questions.map((q, idx) => (
                                    <div key={idx} className={`question-item position-relative p-3 rounded-3 transition-all hover-paper-q border ${editingIndex === idx ? 'border-primary bg-primary bg-opacity-5' : 'border-transparent'}`}>
                                        <div className="d-flex justify-content-between align-items-start mb-3">
                                            <div className="d-flex gap-2">
                                                <span className="fw-bold fs-5">{idx + 1}.</span>
                                                <span className="fw-bold fs-5 leading-snug">{q.question}</span>
                                            </div>
                                            <div className="d-flex gap-2 align-items-center">
                                                <span className="badge bg-secondary bg-opacity-10 text-dark fw-bold px-3 py-2 border rounded-pill">
                                                    {q.marks} Marks
                                                </span>
                                                 <div className="d-flex gap-1 ms-2">
                                                    <button
                                                        className="btn btn-outline-info btn-sm rounded-circle d-flex align-items-center justify-content-center"
                                                        style={{ width: '32px', height: '32px' }}
                                                        onClick={() => duplicateQuestion(idx)}
                                                        title="Duplicate Question (Add Similar)"
                                                    >
                                                        <i className="bi bi-copy"></i>
                                                    </button>
                                                    <button
                                                        className="btn btn-outline-primary btn-sm rounded-circle d-flex align-items-center justify-content-center"
                                                        style={{ width: '32px', height: '32px' }}
                                                        onClick={() => editQuestion(idx)}
                                                        title="Edit Question"
                                                    >
                                                        <i className="bi bi-pencil-square"></i>
                                                    </button>
                                                    <button
                                                        className="btn btn-outline-danger btn-sm rounded-circle d-flex align-items-center justify-content-center"
                                                        style={{ width: '32px', height: '32px' }}
                                                        onClick={() => removeQuestion(idx)}
                                                        title="Remove Question"
                                                    >
                                                        <i className="bi bi-trash"></i>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {q.image && (
                                            <div className="mb-3">
                                                <img src={q.image} alt="Ref" className="img-fluid rounded border shadow-sm" style={{ maxHeight: '200px' }} />
                                            </div>
                                        )}

                                        {/* Question Types UI */}
                                        {q.type === 'mcq' && (
                                            <div className="ps-4 row g-3 mt-1">
                                                {(q.options || []).map((o, i) => (
                                                    <div key={i} className="col-6">
                                                        <div className="d-flex gap-2 align-items-center">
                                                            <div className="rounded-circle border border-dark d-flex align-items-center justify-content-center" style={{ width: '24px', height: '24px', fontSize: '10px', flexShrink: 0 }}>
                                                                {String.fromCharCode(97 + i).toUpperCase()}
                                                            </div>
                                                            <div className="d-flex flex-column gap-2">
                                                                <span className="small text-muted text-truncate">{typeof o === 'object' ? (o.optionText || o.text || "") : o}</span>
                                                                {typeof o === 'object' && o.image && (
                                                                    <img src={o.image} alt="Option preview" style={{ maxHeight: "80px", maxWidth: "120px", display: 'block', borderRadius: '4px', border: '1px solid #dee2e6' }} />
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {q.type === 'coding' && (
                                            <div className="ps-4 mt-2">
                                                <div className="bg-dark text-light p-3 rounded-3 font-monospace x-small opacity-75">
                                                    {q.starterCode ? q.starterCode.substring(0, 150) + '...' : '// Write code here'}
                                                </div>
                                                {q.testCases && q.testCases.length > 0 && (
                                                    <div className="mt-2 d-flex gap-2">
                                                        <span className="badge bg-info bg-opacity-10 text-info border border-info border-opacity-25 fw-normal">
                                                            <i className="bi bi-check2-circle me-1"></i>
                                                            {q.testCases.length} Test Cases
                                                        </span>
                                                        <span className="badge bg-light text-muted border fw-normal">
                                                            {q.testCases.filter(tc => tc.isHidden).length} Hidden
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Question Toolbar Overlay on Hover */}
                                        <div className="q-action-overlay position-absolute top-0 end-0 p-2 opacity-0">
                                            <button
                                                className="btn btn-danger btn-sm shadow-sm rounded-circle"
                                                onClick={() => removeQuestion(idx)}
                                                title="Remove Question"
                                            >
                                                <i className="bi bi-trash"></i>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Paper Footer */}
                    <div className="mt-5 pt-4 text-center text-muted small border-top opacity-50">
                        Exam ID: {examData.id || 'Draft'} | Page 1 of 1
                    </div>
                </div>
            </div>

            <style>
                {`
                    .hover-paper-q:hover {
                        background-color: #f8fafc;
                        border-color: #e2e8f0 !important;
                    }
                    .hover-paper-q:hover .q-action-overlay {
                        opacity: 1;
                    }
                    .leading-snug { line-height: 1.4; }
                `}
            </style>
        </div >
    );
};

export default ExamPaper;
