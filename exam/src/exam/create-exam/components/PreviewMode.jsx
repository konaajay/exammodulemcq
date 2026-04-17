import React, { useEffect, useState } from 'react';

const PreviewMode = ({ examData, onClose }) => {
    const {
        title, course, questions, customAssets, totalMarks, duration
    } = examData;

    const [viewMode, setViewMode] = useState('slide'); // 'slide' | 'paper'
    const [currentIndex, setCurrentIndex] = useState(0);

    // Lock Body Scroll
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = ''; };
    }, []);

    const paperStyle = {
        width: customAssets.orientation === 'landscape' ? '1123px' : '794px',
        minHeight: customAssets.orientation === 'landscape' ? '794px' : '1123px',
        margin: '50px auto',
        backgroundColor: '#ffffff',
        backgroundImage: customAssets.bgImage ? `url(${customAssets.bgImage})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative',
        boxShadow: '0 0 50px rgba(0,0,0,0.5)',
        color: '#000',
        printColorAdjust: 'exact',
        WebkitPrintColorAdjust: 'exact'
    };

    const handleNext = () => {
        if (currentIndex < questions.length - 1) setCurrentIndex(prev => prev + 1);
    };

    const handlePrev = () => {
        if (currentIndex > 0) setCurrentIndex(prev => prev - 1);
    };

    return (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex flex-column animate-fade-in" style={{ zIndex: 2000, background: '#333' }}>
            {/* Toolbar */}
            <div className="bg-dark text-white px-4 py-3 d-flex justify-content-between align-items-center shadow-sm">
                <div className="d-flex align-items-center gap-3">
                    <h5 className="mb-0 fw-bold"><i className="bi bi-eye me-2 text-info"></i>Exam Preview</h5>
                    <div className="vr bg-secondary mx-2"></div>
                    <div className="btn-group btn-group-sm">
                        <button
                            className={`btn ${viewMode === 'slide' ? 'btn-primary' : 'btn-outline-secondary text-white'}`}
                            onClick={() => setViewMode('slide')}
                        >
                            <i className="bi bi-display me-1"></i> Slide View
                        </button>
                        <button
                            className={`btn ${viewMode === 'paper' ? 'btn-primary' : 'btn-outline-secondary text-white'}`}
                            onClick={() => setViewMode('paper')}
                        >
                            <i className="bi bi-file-text me-1"></i> Paper View
                        </button>
                    </div>
                </div>
                <div>
                    <span className="badge bg-secondary me-3">{customAssets.orientation === 'landscape' ? 'Landscape' : 'Portrait'} A4</span>
                    <button className="btn btn-light btn-sm rounded-pill px-4 fw-bold" onClick={onClose}>
                        Close Preview
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-grow-1 overflow-auto p-4 customize-scrollbar d-flex justify-content-center">

                {/* --- SLIDE VIEW (ONE BY ONE) --- */}
                {viewMode === 'slide' && (
                    <div className="w-100 h-100 d-flex flex-column align-items-center justify-content-center">
                        {questions.length === 0 ? (
                            <div className="text-white text-center">
                                <i className="bi bi-exclamation-circle fs-1 mb-3 text-muted"></i>
                                <p>No questions to preview.</p>
                            </div>
                        ) : (
                            <div className="card border-0 shadow-lg" style={{ width: '100%', maxWidth: '900px', minHeight: '500px' }}>
                                <div className="card-header bg-white border-bottom p-4 d-flex justify-content-between align-items-center">
                                    <div>
                                        <h5 className="fw-bold mb-0">Question {currentIndex + 1} of {questions.length}</h5>
                                    </div>
                                    <div className="badge bg-primary fs-6">{questions[currentIndex].marks} Marks</div>
                                </div>
                                <div className="card-body p-5 overflow-auto" style={{ maxHeight: '600px' }}>
                                    <h4 className="fw-bold mb-4" style={{ lineHeight: '1.6' }}>{questions[currentIndex].question}</h4>

                                    {questions[currentIndex].image && (
                                        <div className="mb-4">
                                            <img src={questions[currentIndex].image} alt="Ref" className="img-fluid rounded border shadow-sm" style={{ maxHeight: '300px' }} />
                                        </div>
                                    )}

                                    {/* Options / Answer Area */}
                                    {questions[currentIndex].type === 'mcq' && (
                                        <div className="vstack gap-3">
                                            {questions[currentIndex].options.map((opt, i) => (
                                                <div key={i} className="p-3 border rounded bg-light d-flex align-items-center">
                                                    <div className="badge bg-white text-dark border me-3" style={{ width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        {String.fromCharCode(65 + i)}
                                                    </div>
                                                    <div className="d-flex flex-column gap-2">
                                                        <span className="fs-5">{typeof opt === 'object' ? (opt.optionText || opt.text || "") : opt}</span>
                                                        {typeof opt === 'object' && opt.image && (
                                                            <img src={opt.image} alt="Option preview" style={{ maxHeight: "100px", maxWidth: "150px", display: 'block', borderRadius: '4px', border: '1px solid #dee2e6' }} />
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {questions[currentIndex].type === 'coding' && (
                                        <div className="bg-dark text-white p-3 rounded font-monospace">
                                            <div className="text-muted small mb-2 text-uppercase">// Editor Preview</div>
                                            <pre className="mb-0 text-white" style={{ whiteSpace: 'pre-wrap' }}>{questions[currentIndex].starterCode || '// No starter code'}</pre>
                                        </div>
                                    )}

                                    {['short', 'long', 'fill'].includes(questions[currentIndex].type) && (
                                        <div className="p-3 border-bottom border-2 bg-light text-muted fst-italic">
                                            [Text Answer Area]
                                        </div>
                                    )}
                                </div>
                                <div className="card-footer bg-light p-3 d-flex justify-content-between">
                                    <button
                                        className="btn btn-outline-dark px-4"
                                        disabled={currentIndex === 0}
                                        onClick={handlePrev}
                                    >
                                        <i className="bi bi-arrow-left me-2"></i> Previous
                                    </button>
                                    <button
                                        className="btn btn-primary px-4 fw-bold"
                                        disabled={currentIndex === questions.length - 1}
                                        onClick={handleNext}
                                    >
                                        Next <i className="bi bi-arrow-right ms-2"></i>
                                    </button>
                                </div>
                            </div>
                        )}
                        <div className="mt-3 text-white-50 small">
                            <i className="bi bi-info-circle me-1"></i> This is a quick slide preview. Use "Online Preview" for full simulation.
                        </div>
                    </div>
                )}

                {/* --- PAPER VIEW (SCROLL PDF) --- */}
                {viewMode === 'paper' && (
                    <div style={paperStyle}>
                        {/* Watermark Overlay */}
                        {customAssets.watermark && (
                            <div className="position-absolute top-50 start-50 translate-middle"
                                style={{
                                    zIndex: 0,
                                    opacity: customAssets.watermarkOpacity,
                                    width: '60%',
                                    pointerEvents: 'none'
                                }}>
                                <img src={customAssets.watermark} alt="Watermark" className="img-fluid" />
                            </div>
                        )}

                        {/* Content Layer */}
                        <div className="position-relative p-5 h-100 d-flex flex-column" style={{ zIndex: 1, minHeight: 'inherit' }}>
                            {/* Header */}
                            <div className="text-center border-bottom border-dark pb-4 mb-4">
                                <h1 className="fw-bold mb-2 text-uppercase display-6" style={{ letterSpacing: '2px' }}>{title}</h1>
                                <div className="d-flex justify-content-center gap-4 text-muted small fw-bold text-uppercase">
                                    <span>{course}</span>
                                    <span>•</span>
                                    <span>{duration} Minutes</span>
                                    <span>•</span>
                                    <span>Max Marks: {totalMarks}</span>
                                </div>
                            </div>

                            {/* Questions */}
                            <div className="flex-grow-1">
                                {questions.length === 0 ? (
                                    <div className="text-center text-muted py-5">
                                        <p className="mb-0 fst-italic">-- No Questions Added --</p>
                                    </div>
                                ) : (
                                    <div className="vstack gap-4">
                                        {/* Check if exam has sections */}
                                        {examData.sections && examData.sections.length > 0 ? (
                                            /* Render with section headers */
                                            examData.sections.map((section, secIdx) => (
                                                <div key={section.id} className="mb-4">
                                                    {/* Section Header */}
                                                    <div className="bg-dark bg-opacity-10 p-3 rounded mb-3 border-start border-5 border-primary">
                                                        <h5 className="fw-bold mb-1">Section {secIdx + 1}: {section.title}</h5>
                                                        {section.description && (
                                                            <p className="mb-0 small text-muted">{section.description}</p>
                                                        )}
                                                    </div>

                                                    {/* Questions in section */}
                                                    {section.questionIds.map((qIdx, posInSection) => {
                                                        const q = questions[qIdx];
                                                        return (
                                                            <div key={qIdx} className="mb-3 break-inside-avoid">
                                                                <div className="d-flex justify-content-between align-items-start mb-2">
                                                                    <span className="fw-bold fs-5 me-3">{qIdx + 1}.</span>
                                                                    <div className="flex-grow-1">
                                                                        <p className="fw-bold mb-2 fs-5">{q.question}</p>

                                                                        {q.image && (
                                                                            <div className="mb-3">
                                                                                <img src={q.image} alt="Reference" className="img-fluid border rounded" style={{ maxHeight: '250px' }} />
                                                                            </div>
                                                                        )}

                                                                        {q.type === 'mcq' && (
                                                                            <div className="ps-3 border-start border-3 border-light">
                                                                                {q.options.map((opt, i) => (
                                                                                    <div key={i} className="form-check mb-2">
                                                                                        <input className="form-check-input mt-2" type="radio" disabled />
                                                                                        <label className="form-check-label text-dark d-flex flex-column gap-2">
                                                                                            <span>{typeof opt === 'object' ? (opt.optionText || opt.text || "") : opt}</span>
                                                                                            {typeof opt === 'object' && opt.image && (
                                                                                                <img src={opt.image} alt="Option preview" style={{ maxHeight: "80px", maxWidth: "120px", display: 'block', borderRadius: '4px', border: '1px solid #dee2e6' }} />
                                                                                            )}
                                                                                        </label>
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        )}

                                                                        {q.type === 'coding' && (
                                                                            <div className="bg-light p-3 rounded border font-monospace small text-muted">
                                                                                {q.starterCode || '// Write your code here...'}
                                                                            </div>
                                                                        )}

                                                                        {(q.type === 'short' || q.type === 'long') && (
                                                                            <div className="border-bottom border-light mt-4" style={{ height: q.type === 'short' ? '50px' : '150px' }}></div>
                                                                        )}
                                                                    </div>
                                                                    <span className="fw-bold ms-4 text-nowrap">[{q.marks}]</span>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            ))
                                        ) : (
                                            /* No sections, render all questions */
                                            questions.map((q, idx) => (
                                                <div key={idx} className="mb-3 break-inside-avoid">
                                                    <div className="d-flex justify-content-between align-items-start mb-2">
                                                        <span className="fw-bold fs-5 me-3">{idx + 1}.</span>
                                                        <div className="flex-grow-1">
                                                            <p className="fw-bold mb-2 fs-5">{q.question}</p>

                                                            {q.image && (
                                                                <div className="mb-3">
                                                                    <img src={q.image} alt="Reference" className="img-fluid border rounded" style={{ maxHeight: '250px' }} />
                                                                </div>
                                                            )}

                                                            {q.type === 'mcq' && (
                                                                <div className="ps-3 border-start border-3 border-light">
                                                                    {q.options.map((opt, i) => (
                                                                        <div key={i} className="form-check mb-2">
                                                                            <input className="form-check-input mt-2" type="radio" disabled />
                                                                            <label className="form-check-label text-dark d-flex flex-column gap-2">
                                                                                <span>{typeof opt === 'object' ? (opt.optionText || opt.text || "") : opt}</span>
                                                                                {typeof opt === 'object' && opt.image && (
                                                                                    <img src={opt.image} alt="Option preview" style={{ maxHeight: "80px", maxWidth: "120px", display: 'block', borderRadius: '4px', border: '1px solid #dee2e6' }} />
                                                                                )}
                                                                            </label>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}

                                                            {q.type === 'coding' && (
                                                                <div className="bg-light p-3 rounded border font-monospace small text-muted">
                                                                    {q.starterCode || '// Write your code here...'}
                                                                </div>
                                                            )}

                                                            {(q.type === 'short' || q.type === 'long') && (
                                                                <div className="border-bottom border-light mt-4" style={{ height: q.type === 'short' ? '50px' : '150px' }}></div>
                                                            )}
                                                        </div>
                                                        <span className="fw-bold ms-4 text-nowrap">[{q.marks}]</span>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="mt-auto pt-5 text-center text-muted x-small border-top">
                                <div className="row">
                                    <div className="col-4 text-start">Candidate Name: _________________</div>
                                    <div className="col-4">Page 1</div>
                                    <div className="col-4 text-end">Signature: _________________</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PreviewMode;
