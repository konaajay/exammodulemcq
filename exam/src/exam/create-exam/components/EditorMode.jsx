import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

// Extracted Components
import EditorToolbar from './EditorToolbar';
import EditorSidebar from './EditorSidebar';
import ExamPaper from './ExamPaper';
import MNCPreview from './MNCPreview';

const EditorMode = ({ examData, setExamData, onSave, onBack }) => {
    const navigate = useNavigate();
    const [zoom, setZoom] = useState(100);
    const [activeTab, setActiveTab] = useState('add');
    const [editingIndex, setEditingIndex] = useState(null);
    const [isMncView, setIsMncView] = useState(true); // Default to true as per user request "mnc view only"

    const handleOnlinePreview = () => {
        if (examData.questions.length === 0) {
            toast.warn("Please add some questions first.");
            return;
        }
        const safeId = examData.id && !isNaN(Number(examData.id)) ? examData.id : 'preview';
        navigate(`/exams/simulation/mnc-preview/${safeId}`, { state: { examData } });
    };

    const handleAddOrUpdateQuestion = (q) => {
        if (editingIndex !== null) {
            console.log("📝[QuestionEditor] Updating existing question:", q);
            const updatedQuestions = [...examData.questions];
            updatedQuestions[editingIndex] = q;
            setExamData(prev => ({ ...prev, questions: updatedQuestions }));
            setEditingIndex(null);
            toast.success("Question Updated");
        } else {
            console.log("➕[QuestionEditor] Adding new question to state:", q);
            setExamData(prev => ({ ...prev, questions: [...prev.questions, q] }));
            setEditingIndex(examData.questions.length); // Auto-select the newly added question for viewing
            toast.success("Question Added");
        }
    };

    const removeQuestion = (idx) => {
        if (window.confirm("Remove this question?")) {
            setExamData(prev => ({
                ...prev,
                questions: prev.questions.filter((_, i) => i !== idx)
            }));
            if (editingIndex === idx) setEditingIndex(null);
        }
    };

    const editQuestion = (idx) => {
        setEditingIndex(idx);
        setActiveTab('add');
    };

    const handleDuplicateQuestion = (idx) => {
        const questionToCopy = examData.questions[idx];
        const newQuestion = JSON.parse(JSON.stringify(questionToCopy)); // Deep copy
        setExamData(prev => ({
            ...prev,
            questions: [...prev.questions, newQuestion]
        }));
        toast.success("Question Duplicated");
        setEditingIndex(examData.questions.length); // Select the clone
    };

    // Performance Optimization: useMemo for total marks calculation
    const currentTotal = useMemo(() =>
        examData.questions.reduce((acc, q) => acc + (q.marks || 0), 0)
        , [examData.questions]);

    return (
        <div className="vh-100 d-flex flex-column bg-light overflow-hidden">
            {/* 1. Navbar / Toolbar */}
            <EditorToolbar
                title={examData.title}
                course={examData.course}
                zoom={zoom}
                setZoom={setZoom}
                onPreview={handleOnlinePreview}
                onSave={onSave}
                onBack={onBack}
                isMncView={isMncView}
                onViewChange={setIsMncView}
            />

            {/* 2. Main Content Area */}
            <div className="container-fluid flex-grow-1 overflow-hidden p-0">
                <div className="row h-100 g-0">

                    {/* Left Sidebar (3/12 or 4/12 columns) */}
                    <div className="col-md-4 col-lg-3 h-100 border-end">
                        <EditorSidebar
                            activeTab={activeTab}
                            setActiveTab={setActiveTab}
                            examData={examData}
                            setExamData={setExamData}
                            addQuestion={handleAddOrUpdateQuestion}
                            currentTotal={currentTotal}
                            editingQuestion={editingIndex !== null ? examData.questions[editingIndex] : null}
                            cancelEdit={() => setEditingIndex(null)}
                        />
                    </div>

                    {/* Main Canvas (8/12 or 9/12 columns) */}
                    <div className="col-md-8 col-lg-9 h-100 bg-secondary bg-opacity-10 overflow-auto p-4 p-lg-5">
                        <div className="d-flex flex-column align-items-center min-vh-100 h-100">
                            {!isMncView ? (
                                <ExamPaper
                                    examData={examData}
                                    zoom={zoom}
                                    removeQuestion={removeQuestion}
                                    editQuestion={editQuestion}
                                    duplicateQuestion={handleDuplicateQuestion}
                                    editingIndex={editingIndex}
                                />
                            ) : (
                                <MNCPreview 
                                    question={editingIndex !== null ? examData.questions[editingIndex] : examData.questions[examData.questions.length - 1]}
                                    index={editingIndex !== null ? editingIndex : examData.questions.length - 1}
                                    total={examData.questions.length}
                                />
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default EditorMode;