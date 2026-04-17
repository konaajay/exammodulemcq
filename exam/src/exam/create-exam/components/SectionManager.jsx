import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const SectionManager = ({ sections = [], questions = [], onSectionsUpdate }) => {
    const [localSections, setLocalSections] = useState(sections);
    const [editingSection, setEditingSection] = useState(null);
    const [newSectionTitle, setNewSectionTitle] = useState('');
    const [newSectionDescription, setNewSectionDescription] = useState('');

    // Get unassigned questions
    const getUnassignedQuestions = () => {
        const assignedQIds = new Set();
        localSections.forEach(sec => {
            sec.questionIds?.forEach(qId => assignedQIds.add(qId));
        });
        return questions.map((q, idx) => ({ ...q, index: idx }))
            .filter((_, idx) => !assignedQIds.has(idx));
    };

    const unassignedQuestions = getUnassignedQuestions();

    // Sync with parent whenever localSections changes
    useEffect(() => {
        onSectionsUpdate(localSections);
    }, [localSections]);

    const handleAddSection = () => {
        if (!newSectionTitle.trim()) {
            toast.warn('Please enter a section title');
            return;
        }

        const newSection = {
            id: `sec-${Date.now()}`,
            title: newSectionTitle,
            description: newSectionDescription,
            questionIds: []
        };

        setLocalSections([...localSections, newSection]);
        setNewSectionTitle('');
        setNewSectionDescription('');
        toast.success('Section added');
    };

    const handleDeleteSection = (sectionId) => {
        if (window.confirm('Delete this section? Questions will become unassigned.')) {
            setLocalSections(localSections.filter(s => s.id !== sectionId));
            toast.info('Section deleted');
        }
    };

    const handleEditSection = (section) => {
        setEditingSection(section);
        setNewSectionTitle(section.title);
        setNewSectionDescription(section.description || '');
    };

    const handleSaveEdit = () => {
        if (!newSectionTitle.trim()) {
            toast.warn('Section title cannot be empty');
            return;
        }

        setLocalSections(localSections.map(s =>
            s.id === editingSection.id
                ? { ...s, title: newSectionTitle, description: newSectionDescription }
                : s
        ));
        setEditingSection(null);
        setNewSectionTitle('');
        setNewSectionDescription('');
        toast.success('Section updated');
    };

    const handleAssignQuestion = (questionIdx, sectionId) => {
        // Remove question from any existing section
        const updatedSections = localSections.map(sec => ({
            ...sec,
            questionIds: sec.questionIds.filter(qId => qId !== questionIdx)
        }));

        // Add to target section
        const finalSections = updatedSections.map(sec =>
            sec.id === sectionId
                ? { ...sec, questionIds: [...sec.questionIds, questionIdx] }
                : sec
        );

        setLocalSections(finalSections);
    };

    const handleUnassignQuestion = (questionIdx, sectionId) => {
        setLocalSections(localSections.map(sec =>
            sec.id === sectionId
                ? { ...sec, questionIds: sec.questionIds.filter(qId => qId !== questionIdx) }
                : sec
        ));
    };

    const handleMoveQuestion = (questionIdx, fromSectionId, direction) => {
        const fromSection = localSections.find(s => s.id === fromSectionId);
        const currentIndex = fromSection.questionIds.indexOf(questionIdx);
        const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

        if (newIndex < 0 || newIndex >= fromSection.questionIds.length) return;

        const newQuestionIds = [...fromSection.questionIds];
        [newQuestionIds[currentIndex], newQuestionIds[newIndex]] =
            [newQuestionIds[newIndex], newQuestionIds[currentIndex]];

        setLocalSections(localSections.map(sec =>
            sec.id === fromSectionId ? { ...sec, questionIds: newQuestionIds } : sec
        ));
    };

    return (
        <div className="p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="fw-bold mb-0">
                    <i className="bi bi-collection me-2 text-primary"></i>
                    Exam Sections
                </h5>
                <span className="badge bg-secondary">{localSections.length} sections</span>
            </div>

            {/* Add/Edit Section Form */}
            <div className="card border-0 bg-light mb-4">
                <div className="card-body p-3">
                    <h6 className="fw-bold small text-uppercase text-muted mb-3">
                        {editingSection ? 'Edit Section' : 'Add New Section'}
                    </h6>
                    <div className="mb-2">
                        <input
                            type="text"
                            className="form-control form-control-sm border-0 mb-2"
                            placeholder="Section Title (e.g., Aptitude - Part 1)"
                            value={newSectionTitle}
                            onChange={(e) => setNewSectionTitle(e.target.value)}
                        />
                        <input
                            type="text"
                            className="form-control form-control-sm border-0"
                            placeholder="Description (optional)"
                            value={newSectionDescription}
                            onChange={(e) => setNewSectionDescription(e.target.value)}
                        />
                    </div>
                    <div className="d-flex gap-2">
                        {editingSection ? (
                            <>
                                <button className="btn btn-success btn-sm" onClick={handleSaveEdit}>
                                    <i className="bi bi-check2 me-1"></i> Save
                                </button>
                                <button className="btn btn-outline-secondary btn-sm" onClick={() => {
                                    setEditingSection(null);
                                    setNewSectionTitle('');
                                    setNewSectionDescription('');
                                }}>
                                    Cancel
                                </button>
                            </>
                        ) : (
                            <button className="btn btn-primary btn-sm" onClick={handleAddSection}>
                                <i className="bi bi-plus-lg me-1"></i> Add Section
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Sections List */}
            <div className="vstack gap-3">
                {localSections.map((section, secIdx) => {
                    const sectionQuestions = section.questionIds.map(qId => ({
                        ...questions[qId],
                        index: qId
                    }));

                    return (
                        <div key={section.id} className="card border shadow-sm">
                            <div className="card-header bg-white border-bottom d-flex justify-content-between align-items-center py-2 px-3">
                                <div className="d-flex align-items-center gap-2">
                                    <span className="badge bg-primary">Section {secIdx + 1}</span>
                                    <div>
                                        <h6 className="mb-0 fw-bold">{section.title}</h6>
                                        {section.description && (
                                            <small className="text-muted">{section.description}</small>
                                        )}
                                    </div>
                                </div>
                                <div className="d-flex gap-1">
                                    <button
                                        className="btn btn-sm btn-outline-secondary"
                                        onClick={() => handleEditSection(section)}
                                        title="Edit Section"
                                    >
                                        <i className="bi bi-pencil"></i>
                                    </button>
                                    <button
                                        className="btn btn-sm btn-outline-danger"
                                        onClick={() => handleDeleteSection(section.id)}
                                        title="Delete Section"
                                    >
                                        <i className="bi bi-trash"></i>
                                    </button>
                                </div>
                            </div>
                            <div className="card-body p-2">
                                {sectionQuestions.length === 0 ? (
                                    <div className="text-center text-muted py-3 small">
                                        <i className="bi bi-inbox"></i> No questions assigned.
                                        Drag questions from the unassigned pool below.
                                    </div>
                                ) : (
                                    <div className="vstack gap-1">
                                        {sectionQuestions.map((q, qIdx) => (
                                            <div
                                                key={q.index}
                                                className="d-flex align-items-center justify-content-between p-2 bg-light rounded small"
                                            >
                                                <div className="d-flex align-items-center gap-2 flex-grow-1">
                                                    <span className="badge bg-white text-dark border">Q{q.index + 1}</span>
                                                    <span className="text-truncate" style={{ maxWidth: '200px' }}>
                                                        {q.question}
                                                    </span>
                                                    <span className="badge bg-secondary ms-auto">{q.marks}m</span>
                                                </div>
                                                <div className="d-flex gap-1 ms-2">
                                                    <button
                                                        className="btn btn-sm btn-link p-0 text-secondary"
                                                        onClick={() => handleMoveQuestion(q.index, section.id, 'up')}
                                                        disabled={qIdx === 0}
                                                        title="Move Up"
                                                    >
                                                        <i className="bi bi-arrow-up"></i>
                                                    </button>
                                                    <button
                                                        className="btn btn-sm btn-link p-0 text-secondary"
                                                        onClick={() => handleMoveQuestion(q.index, section.id, 'down')}
                                                        disabled={qIdx === sectionQuestions.length - 1}
                                                        title="Move Down"
                                                    >
                                                        <i className="bi bi-arrow-down"></i>
                                                    </button>
                                                    <button
                                                        className="btn btn-sm btn-link p-0 text-danger"
                                                        onClick={() => handleUnassignQuestion(q.index, section.id)}
                                                        title="Remove from Section"
                                                    >
                                                        <i className="bi bi-x-lg"></i>
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Unassigned Questions Pool */}
            <div className="card border border-warning mt-4">
                <div className="card-header bg-warning bg-opacity-10 border-bottom border-warning py-2 px-3">
                    <h6 className="mb-0 fw-bold">
                        <i className="bi bi-exclamation-triangle me-2"></i>
                        Unassigned Questions ({unassignedQuestions.length})
                    </h6>
                    <small className="text-muted">Assign these questions to sections</small>
                </div>
                <div className="card-body p-2">
                    {unassignedQuestions.length === 0 ? (
                        <div className="text-center text-success py-3 small">
                            <i className="bi bi-check-circle"></i> All questions are assigned to sections!
                        </div>
                    ) : (
                        <div className="vstack gap-1">
                            {unassignedQuestions.map((q) => (
                                <div
                                    key={q.index}
                                    className="d-flex align-items-center justify-content-between p-2 bg-light rounded small"
                                >
                                    <div className="d-flex align-items-center gap-2 flex-grow-1">
                                        <span className="badge bg-white text-dark border">Q{q.index + 1}</span>
                                        <span className="text-truncate" style={{ maxWidth: '150px' }}>
                                            {q.question}
                                        </span>
                                        <span className="badge bg-secondary">{q.marks}m</span>
                                    </div>
                                    <div className="dropdown">
                                        <button
                                            className="btn btn-sm btn-primary dropdown-toggle"
                                            type="button"
                                            data-bs-toggle="dropdown"
                                        >
                                            Assign to...
                                        </button>
                                        <ul className="dropdown-menu">
                                            {localSections.length === 0 ? (
                                                <li className="dropdown-item-text text-muted small">
                                                    No sections available
                                                </li>
                                            ) : (
                                                localSections.map((sec, idx) => (
                                                    <li key={sec.id}>
                                                        <button
                                                            className="dropdown-item small"
                                                            onClick={() => handleAssignQuestion(q.index, sec.id)}
                                                        >
                                                            Section {idx + 1}: {sec.title}
                                                        </button>
                                                    </li>
                                                ))
                                            )}
                                        </ul>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Info Alert */}
            {localSections.length === 0 && questions.length > 0 && (
                <div className="alert alert-info mt-3 small d-flex align-items-center">
                    <i className="bi bi-info-circle me-2"></i>
                    <span>
                        Create sections to organize your {questions.length} question{questions.length !== 1 ? 's' : ''}.
                        Students will see section transitions during the exam.
                    </span>
                </div>
            )}
        </div>
    );
};

export default SectionManager;
