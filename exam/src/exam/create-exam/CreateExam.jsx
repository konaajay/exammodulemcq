import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { motion } from "framer-motion";
import { mcqService } from "../../services/mcqService";
import { Loader2, Plus, Trash2, Save, ArrowLeft, Clock, FileText } from "lucide-react";
import "react-toastify/dist/ReactToastify.css";

const CreateExam = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [examData, setExamData] = useState({
    title: "",
    duration: 60,
    questions: []
  });

  useEffect(() => {
    if (isEditMode) {
      fetchExam();
    }
  }, [id]);

  const fetchExam = async () => {
    try {
      // Logic for fetching by ID would go here, currently using allExams fallback
      const exams = await mcqService.getAllExams();
      const current = exams.find(e => String(e.id) === String(id));
      if (current) setExamData(current);
    } catch (e) {
        toast.error("Failed to load exam");
    } finally {
        setLoading(false);
    }
  };

  const addQuestion = () => {
    setExamData(prev => ({
      ...prev,
      questions: [
        ...prev.questions,
        { questionText: "", optionA: "", optionB: "", optionC: "", optionD: "", correctOption: "A", explanation: "" }
      ]
    }));
  };

  const updateQuestion = (index, field, value) => {
    const newQs = [...examData.questions];
    newQs[index][field] = value;
    setExamData({ ...examData, questions: newQs });
  };

  const removeQuestion = (index) => {
    setExamData(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }));
  };

  const handleSave = async () => {
    if (!examData.title) return toast.error("Please enter a title");
    if (examData.questions.length === 0) return toast.error("Add at least one question");

    setSubmitting(true);
    try {
        await mcqService.createExam(examData);
        toast.success("Exam created successfully!");
        setTimeout(() => navigate("/exams/dashboard"), 1500);
    } catch (error) {
        toast.error("Save failed. Check backend logs.");
    } finally {
        setSubmitting(false);
    }
  };

  if (loading) return <div className="p-5 text-center"><Loader2 className="animate-spin mx-auto" /></div>;

  return (
    <div className="min-vh-100 bg-white p-4 p-lg-5">
      <ToastContainer theme="colored" />
      <div className="max-w-1000 mx-auto">
        <div className="d-flex justify-content-between align-items-center mb-5">
            <button className="btn btn-light d-flex align-items-center gap-2" onClick={() => navigate(-1)}>
                <ArrowLeft size={18} /> Back
            </button>
            <h2 className="fw-bold mb-0">{isEditMode ? 'Edit' : 'Create'} MCQ Assessment</h2>
            <button 
                className="btn btn-primary d-flex align-items-center gap-2 px-4 shadow"
                onClick={handleSave}
                disabled={submitting}
            >
                {submitting ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} Save Changes
            </button>
        </div>

        <div className="row g-4 mb-5">
            <div className="col-md-8">
                <div className="p-4 bg-light rounded-4">
                    <label className="form-label small fw-bold text-muted">Assessment Title</label>
                    <input 
                        className="form-control form-control-lg border-0 shadow-sm" 
                        placeholder="e.g. Java Fundamentals Quiz"
                        value={examData.title}
                        onChange={e => setExamData({...examData, title: e.target.value})}
                    />
                </div>
            </div>
            <div className="col-md-4">
                <div className="p-4 bg-light rounded-4">
                    <label className="form-label small fw-bold text-muted">Duration (Minutes)</label>
                    <div className="input-group">
                        <span className="input-group-text bg-white border-0"><Clock size={18} /></span>
                        <input 
                            type="number"
                            className="form-control form-control-lg border-0 shadow-sm"
                            value={examData.duration}
                            onChange={e => setExamData({...examData, duration: e.target.value})}
                        />
                    </div>
                </div>
            </div>
        </div>

        <div className="d-flex justify-content-between align-items-center mb-4">
            <h4 className="fw-bold mb-0 d-flex align-items-center gap-2">
                <FileText className="text-primary" /> Questions Pool ({examData.questions.length})
            </h4>
            <button className="btn btn-outline-primary rounded-pill d-flex align-items-center gap-2" onClick={addQuestion}>
                <Plus size={18} /> Add Question
            </button>
        </div>

        <div className="d-flex flex-column gap-4">
            {examData.questions.map((q, idx) => (
                <div key={idx} className="p-4 border rounded-4 bg-white shadow-sm position-relative">
                    <button 
                        className="btn btn-sm btn-outline-danger position-absolute top-0 end-0 m-3 border-0"
                        onClick={() => removeQuestion(idx)}
                    >
                        <Trash2 size={18} />
                    </button>
                    
                    <div className="mb-3">
                        <label className="form-label small fw-bold text-muted">Question {idx + 1}</label>
                        <textarea 
                            className="form-control border-light-subtle" 
                            rows="2"
                            value={q.questionText}
                            onChange={e => updateQuestion(idx, 'questionText', e.target.value)}
                        />
                    </div>

                    <div className="row g-3">
                        {['A', 'B', 'C', 'D'].map(opt => (
                            <div key={opt} className="col-md-6">
                                <div className="input-group">
                                    <span className={`input-group-text border-0 ${q.correctOption === opt ? 'bg-success text-white' : 'bg-light'}`}>{opt}</span>
                                    <input 
                                        className="form-control border-light-subtle"
                                        placeholder={`Option ${opt}`}
                                        value={q[`option${opt}`]}
                                        onChange={e => updateQuestion(idx, `option${opt}`, e.target.value)}
                                    />
                                    <button 
                                        className={`btn border-light-subtle ${q.correctOption === opt ? 'btn-success' : 'btn-outline-secondary'}`}
                                        onClick={() => updateQuestion(idx, 'correctOption', opt)}
                                    >
                                        Correct
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-3">
                        <label className="form-label small fw-bold text-muted">Explanation (Learner View)</label>
                        <input 
                            className="form-control form-control-sm border-light-subtle"
                            value={q.explanation}
                            onChange={e => updateQuestion(idx, 'explanation', e.target.value)}
                        />
                    </div>
                </div>
            ))}
        </div>

        {examData.questions.length === 0 && (
            <div className="text-center py-5 border-dashed rounded-4 bg-light text-muted">
                No questions added yet. Use manual addition or Bulk Upload from Question Bank.
            </div>
        )}
      </div>

      <style>{`
        .max-w-1000 { max-width: 1000px; }
        .border-dashed { border: 2px dashed #e2e8f0; }
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default CreateExam;