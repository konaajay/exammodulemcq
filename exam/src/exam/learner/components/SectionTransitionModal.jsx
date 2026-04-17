import React from 'react';

const SectionTransitionModal = ({
    show,
    completedSectionName,
    nextSectionName,
    onContinue
}) => {
    if (!show) return null;

    return (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center section-modal-overlay">
            <div className="card border-0 shadow-lg section-modal-card">
                <div className="card-body p-5 text-center">
                    <div className="mb-4 text-success">
                        <i className="bi bi-check-circle-fill" style={{ fontSize: '64px' }}></i>
                    </div>
                    <h3 className="fw-bold mb-3">Section Complete!</h3>
                    <p className="text-muted mb-4">
                        You've completed: <strong>{completedSectionName}</strong>
                        {nextSectionName && (
                            <>
                                <br />
                                Next up: <strong>{nextSectionName}</strong>
                            </>
                        )}
                    </p>
                    <button
                        className="btn btn-success btn-lg px-5 rounded-pill fw-bold"
                        onClick={onContinue}
                    >
                        Continue to Next Section
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SectionTransitionModal;
