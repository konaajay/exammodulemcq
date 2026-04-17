import React from 'react';
import MixedQuestionManager from './MixedQuestionManager';
import QuestionForm from '../../components/QuestionForm';
import SectionManager from './SectionManager';

const EditorSidebar = ({
    activeTab,
    setActiveTab,
    examData,
    setExamData,
    addQuestion,
    currentTotal,
    editingQuestion,
    cancelEdit
}) => {
    const { questions, totalMarks, duration, type, sections } = examData;

    return (
        <div className="card border-0 rounded-0 h-100 shadow-sm bg-white overflow-hidden">
            <div className="card-header bg-light border-bottom p-3">
                <div className="nav nav-pills nav-fill bg-white rounded p-1 border shadow-sm small">
                    <button
                        className={`nav-link py-2 fw-bold ${activeTab === 'add' ? 'active' : 'text-muted'}`}
                        onClick={() => setActiveTab('add')}
                    >
                        <i className="bi bi-plus-lg me-1"></i> Add
                    </button>
                    <button
                        className={`nav-link py-2 fw-bold ${activeTab === 'sections' ? 'active' : 'text-muted'}`}
                        onClick={() => setActiveTab('sections')}
                    >
                        <i className="bi bi-collection me-1"></i> Sections
                    </button>
                    <button
                        className={`nav-link py-2 fw-bold ${activeTab === 'settings' ? 'active' : 'text-muted'}`}
                        onClick={() => setActiveTab('settings')}
                    >
                        <i className="bi bi-sliders me-1"></i> Settings
                    </button>
                </div>
            </div>

            <div className="card-body p-0 overflow-auto">
                {activeTab === 'add' ? (
                    <div className="p-0">
                        <MixedQuestionManager onAdd={addQuestion} initialData={editingQuestion} onCancel={cancelEdit} />
                    </div>
                ) : activeTab === 'sections' ? (
                    <SectionManager
                        sections={sections || []}
                        questions={questions}
                        onSectionsUpdate={(newSections) => setExamData(prev => ({ ...prev, sections: newSections }))}
                    />
                ) : (
                    <div className="p-4">
                        <section className="mb-4">
                            <h6 className="fw-bold text-muted text-uppercase x-small mb-3">Overview</h6>
                            <div className="card border shadow-none rounded-3">
                                <ul className="list-group list-group-flush small">
                                    <li className="list-group-item d-flex justify-content-between p-3 border-bottom">
                                        <span className="text-secondary">Questions</span>
                                        <span className="fw-bold">{questions.length}</span>
                                    </li>
                                    <li className="list-group-item d-flex justify-content-between p-3 border-bottom">
                                        <span className="text-secondary">Marks</span>
                                        <span className={`fw-bold ${currentTotal > totalMarks ? 'text-danger' : 'text-success'}`}>
                                            {currentTotal} / {totalMarks}
                                        </span>
                                    </li>
                                    <li className="list-group-item d-flex justify-content-between p-3">
                                        <span className="text-secondary">Duration</span>
                                        <span className="fw-bold">{duration} min</span>
                                    </li>
                                </ul>
                            </div>
                        </section>

                        <section className="mb-4">
                            <h6 className="fw-bold text-muted text-uppercase x-small mb-3">Controls</h6>
                            <div className="card border-0 bg-light rounded-3 p-3">
                                <div className="form-check form-switch mb-3">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        id="negMark"
                                        checked={examData.settings?.negativeMarking || false}
                                        onChange={(e) => setExamData(prev => ({ ...prev, settings: { ...prev.settings, negativeMarking: e.target.checked } }))}
                                    />
                                    <label className="form-check-label small fw-medium" htmlFor="negMark">Negative Marking</label>
                                </div>
                                <div className="form-check form-switch mb-3">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        id="autoSub"
                                        checked={examData.settings?.autoSubmit || false}
                                        onChange={(e) => setExamData(prev => ({ ...prev, settings: { ...prev.settings, autoSubmit: e.target.checked } }))}
                                    />
                                    <label className="form-check-label small fw-medium" htmlFor="autoSub">Auto Submit</label>
                                </div>
                                <div className="form-check form-switch">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        id="shuffle"
                                        checked={examData.settings?.shuffleQuestions || false}
                                        onChange={(e) => setExamData(prev => ({ ...prev, settings: { ...prev.settings, shuffleQuestions: e.target.checked } }))}
                                    />
                                    <label className="form-check-label small fw-medium" htmlFor="shuffle">Shuffle Questions</label>
                                </div>
                            </div>
                        </section>

                        <section className="mb-4">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h6 className="fw-bold text-danger text-uppercase x-small mb-0">Security</h6>
                                <div className="form-check form-switch m-0">
                                    <input
                                        className="form-check-input bg-danger border-danger"
                                        type="checkbox"
                                        checked={examData.proctoring?.enabled || false}
                                        onChange={(e) => setExamData(prev => ({ ...prev, proctoring: { ...prev.proctoring, enabled: e.target.checked } }))}
                                    />
                                </div>
                            </div>

                            {examData.proctoring?.enabled && (
                                <div className="card border-0 bg-danger bg-opacity-10 rounded-3 p-3">
                                    <div className="form-check form-switch mb-3">
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            checked={examData.proctoring?.cameraRequired || false}
                                            onChange={(e) => setExamData(prev => ({ ...prev, proctoring: { ...prev.proctoring, cameraRequired: e.target.checked } }))}
                                        />
                                        <label className="form-check-label small text-danger fw-medium">Camera Required</label>
                                    </div>
                                    <div className="form-check form-switch">
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            checked={examData.proctoring?.forceFullScreen || false}
                                            onChange={(e) => setExamData(prev => ({ ...prev, proctoring: { ...prev.proctoring, forceFullScreen: e.target.checked } }))}
                                        />
                                        <label className="form-check-label small text-danger fw-medium">Full Screen Mode</label>
                                    </div>
                                </div>
                            )}
                        </section>

                        <div className="alert alert-info py-2 px-3 border-0 rounded-3 shadow-none">
                            <small className="fw-medium"><i className="bi bi-info-circle me-1"></i>Auto-saved in real-time.</small>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EditorSidebar;
