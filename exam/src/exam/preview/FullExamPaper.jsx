import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { examService } from "../services/examService";
import { Loader2, AlertCircle } from "lucide-react";

const FullExamPaper = () => {
    const { id } = useParams();
    const [exam, setExam] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (examService.isValidId(id)) {
            const fetchExam = async () => {
                try {
                    const data = await examService.getExamById(id);
                    if (data) {
                        let questions = [];
                        try {
                            // Use the View endpoint as requested for full paper details
                            questions = await examService.getExamQuestionsView(id);
                        } catch (e) {
                            console.warn("Questions view load failed, falling back to standard list", e);
                            // Fallback if view endpoint doesn't exist yet
                            questions = await examService.getExamQuestions(id);
                        }

                        if (!Array.isArray(questions)) questions = [];

                        const sections = data.sections || [{
                            id: "default",
                            title: "General Section",
                            questionIds: questions.map((_, i) => i)
                        }];

                        setExam({ ...data, questions, sections });
                    }
                } catch (error) {
                    console.error("Failed to load exam", error);
                } finally {
                    setLoading(false);
                }
            };

            fetchExam();
        } else {
            setLoading(false);
        }
    }, [id]);

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100">
                <Loader2 className="animate-spin text-primary" size={48} />
            </div>
        );
    }

    if (!exam) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100 flex-column">
                <AlertCircle size={48} className="text-danger mb-3" />
                <h3>Exam Not Found</h3>
            </div>
        );
    }

    // Prepare questions map for easy lookup
    // In our mock, questions is an array of objects.
    // Sections might contain IDs (indices) or actual IDs. 
    // Adapting for safety:
    const getQuestionsForSection = (section) => {
        if (!section.questionIds) return exam.questions; // Fallback

        // If questionIds are indices (numbers)
        if (section.questionIds.length > 0 && typeof section.questionIds[0] === 'number') {
            return section.questionIds.map(idx => exam.questions[idx]).filter(Boolean);
        }

        // If questionIds are IDs (strings/numbers matching q.id)
        return section.questionIds.map(qid => exam.questions.find(q => q.id === qid)).filter(Boolean);
    };

    return (
        <div className="container py-5" style={{ maxWidth: '900px' }}>
            <div className="text-center mb-5 border-bottom pb-4">
                <h1 className="fw-bold">{exam.title}</h1>
                <p className="text-muted">{exam.course} | {exam.duration || 60} Minutes | Total Marks: {exam.totalMarks || 0}</p>
                <div className="badge bg-primary fs-6 px-3 py-2">Full Question Paper</div>
            </div>

            {exam.sections && exam.sections.length > 0 ? (
                exam.sections.map((section, sIdx) => {
                    const sectionQuestions = getQuestionsForSection(section);
                    if (sectionQuestions.length === 0) return null;

                    return (
                        <div key={sIdx} className="mb-5">
                            <h3 className="fw-bold text-primary mb-3 border-start border-4 border-primary ps-3 bg-light py-2">
                                {section.title || section.name || `Section ${sIdx + 1}`}
                            </h3>
                            {section.description && <p className="text-muted mb-4 fst-italic">{section.description}</p>}

                            <div className="d-flex flex-column gap-4">
                                {sectionQuestions.map((q, qIdx) => (
                                    <QuestionItem key={qIdx} question={q} index={qIdx + 1} />
                                ))}
                            </div>
                        </div>
                    );
                })
            ) : (
                <div className="d-flex flex-column gap-4">
                    {exam.questions.map((q, qIdx) => (
                        <QuestionItem key={qIdx} question={q} index={qIdx + 1} />
                    ))}
                </div>
            )}

            <div className="text-center mt-5 pt-5 border-top text-muted small">
                End of Question Paper
            </div>
        </div>
    );
};

const QuestionItem = ({ question, index }) => {
    return (
        <div className="card border shadow-sm">
            <div className="card-header bg-white d-flex justify-content-between align-items-center py-3">
                <span className="fw-bold">Q{index}</span>
                <span className="badge bg-light text-dark border">
                    {question.marks} Marks {question.negative ? `(-${question.negative} Neg.)` : ''}
                </span>
            </div>
            <div className="card-body p-4">
                <div className="mb-4" style={{ fontSize: '1.05rem', lineHeight: '1.6' }}>
                    {question.question || question.text}
                </div>

                {question.type === 'coding' && (
                    <div className="bg-light p-3 rounded border font-monospace small mb-3">
                        <strong>Test Cases:</strong>
                        <ul className="mt-2 mb-0 ps-3">
                            {(question.testCases || []).map((tc, i) => (
                                <li key={i} className="mb-1">Input: {tc.input} → Output: {tc.output}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Options for Quiz/MCQ */}
                {question.options && question.options.length > 0 && (
                    <div className="d-flex flex-column gap-2">
                        {question.options.map((opt, i) => (
                            <div key={i} className="d-flex align-items-center gap-3 p-3 border rounded bg-light bg-opacity-50">
                                <span className="fw-bold text-secondary" style={{ minWidth: '24px' }}>
                                    {String.fromCharCode(65 + i)}.
                                </span>
                                <span>{opt.text || opt}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FullExamPaper;
