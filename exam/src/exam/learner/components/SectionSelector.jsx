import React from 'react';

const SectionSelector = ({
    sections,
    activeSectionId,
    onSectionChange
}) => {
    if (sections.length <= 1) return null;

    return (
        <div className="bg-light border-bottom px-3 py-2 d-flex align-items-center gap-3">
            <label className="fw-bold text-muted mb-0 small">Current Section:</label>
            <select
                className="form-select form-select-sm"
                style={{ maxWidth: '300px' }}
                value={activeSectionId}
                onChange={(e) => onSectionChange(e.target.value)}
            >
                {sections.map((sec, idx) => (
                    <option key={sec.id} value={sec.id}>
                        Section {idx + 1}: {sec.name} ({sec.questions.length} questions)
                    </option>
                ))}
            </select>
            <small className="text-muted ms-auto">
                <i className="bi bi-info-circle me-1"></i>
                Preview mode: Can jump between sections
            </small>
        </div>
    );
};

export default SectionSelector;
