import React from 'react';
import { FiUser } from "react-icons/fi";

const SidebarPalette = ({
    candidateName,
    counts,
    activeSection,
    statusMap,
    currentQIndex,
    onSelectQuestion,
    onSubmit
}) => {
    return (
        <aside className="mnc-sidebar">
            <div className="user-info-section">
                <div className="user-img-placeholder">
                    <FiUser size={32} />
                </div>
                <div className="user-name">
                    <div className="small text-muted fw-normal" style={{ fontSize: '0.75rem' }}>Candidate:</div>
                    {candidateName}
                </div>
            </div>

            <div className="palette-legend-grid">
                <div className="legend-item"><div className="legend-sym sym-ans">{counts.answered}</div> Answered</div>
                <div className="legend-item"><div className="legend-sym sym-not-ans">{counts.notAnswered}</div> Not Answered</div>
                <div className="legend-item"><div className="legend-sym sym-not-visit">{counts.notVisited}</div> Not Visited</div>
                <div className="legend-item"><div className="legend-sym sym-mark">{counts.marked}</div> Marked</div>
                <div className="legend-item d-flex align-items-center gap-2" style={{ gridColumn: 'span 2' }}>
                    <div className="legend-sym sym-mark-ans" style={{ position: 'relative' }}>
                        {counts.markedAnswered}
                        <div style={{ position: 'absolute', bottom: '-4px', right: '-4px', background: '#4caf50', color: 'white', width: '12px', height: '12px', borderRadius: '50%', fontSize: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid white' }}>✓</div>
                    </div>
                    <span>Answered & Marked for Review</span>
                </div>
            </div>

            <div className="palette-container">
                <span className="palette-section-title">SECTION: {activeSection?.name || "Main Section"}</span>
                <div className="grid-buttons">
                    {activeSection?.questions.map((q, idx) => {
                        let statusClass = 'not-visited';
                        if (statusMap[q.id]) statusClass = statusMap[q.id];
                        if (currentQIndex === idx) statusClass += ' current';

                        return (
                            <button
                                key={q.id}
                                className={`p-btn ${statusClass}`}
                                onClick={() => onSelectQuestion(idx)}
                            >
                                <span className="p-btn-text">{idx + 1}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="sidebar-footer">
                <button className="btn-submit-final mt-auto" onClick={onSubmit}>Submit Exam</button>
            </div>
        </aside>
    );
};

export default SidebarPalette;
