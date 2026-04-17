import React from 'react';

const EditorToolbar = ({
    title,
    course,
    zoom,
    setZoom,
    onPreview,
    onSave,
    onBack,
    isMncView,
    onViewChange
}) => {
    return (
        <nav className="navbar navbar-dark bg-primary px-4 py-2 shadow-sm border-bottom">
            <div className="container-fluid">
                <div className="d-flex align-items-center gap-3">
                    <button className="btn btn-light btn-sm fw-bold border-0 shadow-sm" onClick={onBack}>
                        <i className="bi bi-arrow-left me-1"></i> Settings
                    </button>
                    <div className="vr bg-white opacity-25" style={{ height: '24px' }}></div>
                    <div className="text-white">
                        <h6 className="mb-0 fw-bold">{title} <span className="fw-normal opacity-75">| {course}</span></h6>
                        <small className="opacity-50" style={{ fontSize: '0.7rem' }}>
                            <i className="bi bi-clock-history me-1"></i>Auto-saved just now
                        </small>
                    </div>
                </div>

                <div className="d-flex align-items-center gap-3">
                    {/* View Switcher */}
                    <div className="btn-group btn-group-sm bg-white bg-opacity-10 p-1 rounded">
                        <button 
                            className={`btn btn-sm text-white px-3 fw-bold border-0 ${!isMncView ? 'bg-white bg-opacity-25' : ''}`}
                            onClick={() => onViewChange(false)}
                        >
                            <i className="bi bi-file-text me-1"></i> Paper View
                        </button>
                        <button 
                            className={`btn btn-sm text-white px-3 fw-bold border-0 ${isMncView ? 'bg-white bg-opacity-25' : ''}`}
                            onClick={() => onViewChange(true)}
                        >
                            <i className="bi bi-display me-1"></i> MNC View
                        </button>
                    </div>

                    {/* Zoom Control */}
                    <div className="input-group input-group-sm rounded bg-white bg-opacity-10 border-0 p-1">
                        <button className="btn btn-sm text-white" onClick={() => setZoom(z => Math.max(50, z - 10))}>
                            <i className="bi bi-dash"></i>
                        </button>
                        <span className="input-group-text bg-transparent border-0 text-white fw-bold small" style={{ minWidth: '50px', justifyContent: 'center' }}>
                            {zoom}%
                        </span>
                        <button className="btn btn-sm text-white" onClick={() => setZoom(z => Math.min(150, z + 10))}>
                            <i className="bi bi-plus"></i>
                        </button>
                    </div>

                    <button className="btn btn-light btn-sm fw-semibold shadow-sm px-3" onClick={onPreview}>
                        <i className="bi bi-eye me-1"></i> Preview
                    </button>
                    <button className="btn btn-success btn-sm fw-bold shadow-sm px-3 border-0" onClick={onSave}>
                        <i className="bi bi-cloud-arrow-up me-1"></i> Save Draft
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default EditorToolbar;
