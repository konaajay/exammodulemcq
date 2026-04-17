import React from 'react';

const InstructionView = ({
    examData,
    agreed,
    setAgreed,
    onStart
}) => {
    return (
        <div className="mnc-instructions-container bg-light min-vh-100">
            <header className="mnc-header shadow-sm border-bottom py-3 px-4 bg-white sticky-top">
                <div className="d-flex justify-content-between align-items-center w-100 container-fluid">
                    <div className="mnc-logo d-flex align-items-center gap-2">
                        <div className="bg-primary text-white p-2 rounded shadow-sm d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }}>
                            <i className="bi bi-shield-check"></i>
                        </div>
                        <span className="fw-bold ls-tight">EXAMINATION PORTAL</span>
                    </div>
                    <div className="mnc-exam-title fw-bold text-dark opacity-75">{examData?.title || examData?.examTitle || "Examination Paper"}</div>
                    <div className="text-muted small fw-semibold">v3.0.1</div>
                </div>
            </header>

            <div className="mnc-inst-body py-5 px-3">
                <div className="inst-card mx-auto shadow-lg border-0 rounded-4 overflow-hidden bg-white" style={{ maxWidth: '900px' }}>
                    <div className="bg-primary bg-opacity-10 p-4 border-bottom border-primary border-opacity-10">
                        <h2 className="h4 fw-bold mb-1 text-primary">Examination Instructions</h2>
                        <p className="text-muted small mb-0">Please read all instructions carefully before starting the assessment.</p>
                    </div>

                    <div className="p-4 p-md-5">
                        <div className="inst-content-wrapper mb-5">
                            <div className="inst-content-rich p-4 rounded-4 bg-light border-0"
                                style={{
                                    whiteSpace: 'pre-line',
                                    lineHeight: '1.8',
                                    fontSize: '1rem',
                                    color: '#475569',
                                    maxHeight: '450px',
                                    overflowY: 'auto'
                                }}>
                                {examData?.instructions || 
                                    "General Instructions: \n\n 1. Ensure you have a stable internet connection. \n 2. Do not refresh the page during the exam. \n 3. Your progress is saved automatically with every answer."}
                            </div>
                        </div>

                        <div className="inst-footer pt-4 border-top">
                            <label className="d-flex gap-3 align-items-start cursor-pointer mb-4 p-3 rounded-3 transition-all hover-bg-light">
                                <div className="mt-1">
                                    <input
                                        type="checkbox"
                                        className="form-check-input flex-shrink-0 cursor-pointer"
                                        checked={agreed}
                                        onChange={e => setAgreed(e.target.checked)}
                                        style={{ width: '22px', height: '22px' }}
                                    />
                                </div>
                                <div className="small text-muted leading-relaxed">
                                    I have read and understood the instructions. I confirm that all computer hardware and software settings are correct.
                                    I understand that any attempt to use unfair means will lead to immediate disqualification.
                                </div>
                            </label>

                            <div className="d-flex justify-content-center pt-2">
                                <button
                                    className={`btn btn-lg px-5 py-3 fw-bold rounded-pill shadow-lg transition-all ${agreed ? 'btn-ready' : 'btn-secondary opacity-50'}`}
                                    disabled={!agreed}
                                    onClick={onStart}
                                    style={{ 
                                        minWidth: '280px',
                                        backgroundColor: agreed ? '#D1A7FF' : undefined,
                                        borderColor: agreed ? '#D1A7FF' : undefined,
                                        color: agreed ? 'white' : undefined
                                    }}
                                >
                                    I am ready to begin <i className="bi bi-arrow-right ms-2"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .ls-tight { letter-spacing: -0.025em; }
                .hover-bg-light:hover { background-color: #f8fafc; }
                .cursor-pointer { cursor: pointer; }
                .leading-relaxed { line-height: 1.625; }
                .btn-ready {
                    background-color: #D1A7FF !important;
                    border-color: #D1A7FF !important;
                    color: white !important;
                }
                .btn-ready:hover {
                    opacity: 0.9;
                    transform: translateY(-2px);
                    box-shadow: 0 10px 15px -3px rgba(162, 114, 255, 0.3) !important;
                }
            `}</style>
        </div>
    );
};

export default InstructionView;
