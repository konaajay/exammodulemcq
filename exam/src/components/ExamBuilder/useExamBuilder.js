import { useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { questionService } from '../../services/questionService';
import { examService } from '../../services/examService';
import { useNavigate } from 'react-router-dom';

export const useExamBuilder = (initialData = null) => {
    const navigate = useNavigate();
    const [activeSetIndex, setActiveSetIndex] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [loading, setLoading] = useState(false);
    const [parsing, setParsing] = useState(false);
    const [debugLogs, setDebugLogs] = useState([]);
    const [editingQuestion, setEditingQuestion] = useState(null);

    const addDebugLog = useCallback((msg, type = 'info') => {
        setDebugLogs(prev => [{ timestamp: new Date().toLocaleTimeString(), msg, type }, ...prev].slice(0, 50));
    }, []);

    const [examDetails, setExamDetails] = useState(initialData?.examDetails || {
        title: '',
        instructions: 'General Instructions:\n1. Duration: 60 minutes.\n2. Do not refresh the page.',
        durationMinutes: 60,
        randomize: false,
        negativeMarks: 0,
        passPercentage: 40,
        maxAttempts: 1,
        course: '',
        startTime: '',
        endTime: '',
        tabLock: false,
        fullscreenMode: false
    });

    const [questionSets, setQuestionSets] = useState(initialData?.questionSets || [
        { setName: 'Paper 1', questions: [] }
    ]);

    const handleDetailChange = useCallback((e) => {
        const { name, value, type, checked } = e.target;
        setExamDetails(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    }, []);

    const validateQuestion = (q) => {
        if (!q.questionText?.trim()) {
            addDebugLog("Validation Failed: Missing question text", "error");
            return "Question text is required";
        }
        
        const optionKeys = ['optionA', 'optionB', 'optionC', 'optionD'];
        const filledOptions = optionKeys
            .map(k => ({ key: k.replace('option', ''), val: q[k]?.trim() }))
            .filter(o => o.val);

        if (filledOptions.length < 2) {
            addDebugLog("Validation Failed: At least 2 options required", "error");
            return "At least two options are required";
        }

        // Detailed duplicate check
        const seen = {};
        for (const opt of filledOptions) {
            if (seen[opt.val]) {
                const errorMsg = `Duplicate options detected: Option ${seen[opt.val]} and Option ${opt.key} both contain "${opt.val}"`;
                addDebugLog(errorMsg, "error");
                return errorMsg;
            }
            seen[opt.val] = opt.key;
        }

        const correctKey = q.correctOption; // "A", "B", etc.
        const isCorrectFilled = filledOptions.some(o => o.key === correctKey);
        if (!isCorrectFilled) {
            const errorMsg = `Option ${correctKey} is marked as correct but it is empty`;
            addDebugLog(errorMsg, "error");
            return errorMsg;
        }

        if (Number(q.marks) <= 0) {
            addDebugLog("Validation Failed: Marks must be > 0", "error");
            return "Marks must be greater than 0";
        }
        
        return null;
    };

    const addQuestionSet = useCallback(() => {
        setQuestionSets(prev => [
            ...prev, 
            { setName: `Paper ${prev.length + 1}`, questions: [] }
        ]);
        setActiveSetIndex(prev => prev + 1);
    }, []);

    const removeQuestionSet = useCallback((index) => {
        setQuestionSets(prev => {
            if (prev.length === 1) return prev;
            const newSets = prev.filter((_, i) => i !== index);
            return newSets;
        });
        setActiveSetIndex(prev => Math.max(0, prev - 1));
    }, []);

    const addQuestionToSet = useCallback((question) => {
        const error = validateQuestion(question);
        if (error) {
            toast.error(error);
            return false;
        }

        const newQuestion = { ...question, id: crypto.randomUUID() };
        
        setQuestionSets(prev => prev.map((set, idx) => 
            idx === activeSetIndex 
                ? { ...set, questions: [...set.questions, newQuestion] }
                : set
        ));
        
        addDebugLog(`Success: Added question to ${questionSets[activeSetIndex].setName}`, "info");
        toast.success("Question added successfully");
        return true;
    }, [activeSetIndex, questionSets]);

    const updateQuestionInSet = useCallback((question) => {
        const error = validateQuestion(question);
        if (error) {
            toast.error(error);
            return false;
        }

        setQuestionSets(prev => prev.map((set, idx) => 
            idx === activeSetIndex 
                ? { ...set, questions: set.questions.map(q => q.id === question.id ? question : q) }
                : set
        ));
        
        setEditingQuestion(null);
        toast.success("Question updated successfully");
        return true;
    }, [activeSetIndex]);

    const removeQuestionFromSet = useCallback((qId) => {
        setQuestionSets(prev => prev.map((set, idx) => 
            idx === activeSetIndex 
                ? { ...set, questions: set.questions.filter(q => q.id !== qId) }
                : set
        ));
    }, [activeSetIndex]);
    
    const duplicateQuestion = useCallback((qId) => {
        setQuestionSets(prev => prev.map((set, idx) => {
            if (idx !== activeSetIndex) return set;
            const original = set.questions.find(q => q.id === qId);
            if (!original) return set;
            const clone = { ...original, id: crypto.randomUUID() };
            return { ...set, questions: [...set.questions, clone] };
        }));
        toast.info("Question cloned");
    }, [activeSetIndex]);

    const handleBulkUpload = useCallback(async (file) => {
        if (!file) return;
        setParsing(true);
        try {
            const resp = await questionService.parseCsv(file);
            const validQuestions = [];
            const errors = [];

            resp.forEach((q, index) => {
                const error = validateQuestion(q);
                if (error) errors.push(`Row ${index + 1}: ${error}`);
                else validQuestions.push({ ...q, id: crypto.randomUUID() });
            });

            if (validQuestions.length > 0) {
                setQuestionSets(prev => prev.map((set, idx) => 
                    idx === activeSetIndex 
                        ? { ...set, questions: [...set.questions, ...validQuestions] }
                        : set
                ));
                toast.success(`Successfully uploaded ${validQuestions.length} questions`);
            }

            if (errors.length > 0) {
                console.error("Bulk Upload Errors:", errors);
                toast.warning(`${errors.length} rows were skipped due to errors.`);
            }
        } catch (error) {
            toast.error("Failed to parse CSV file");
        } finally {
            setParsing(false);
        }
    }, [activeSetIndex]);

    const saveExam = useCallback(async () => {
        if (!examDetails.title?.trim()) {
            toast.error("Exam Title is required");
            return;
        }

        const totalQuestions = questionSets.reduce((sum, set) => sum + set.questions.length, 0);
        if (totalQuestions === 0) {
            toast.error("Please add at least one question to the exam");
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                examDetails,
                questionSets: questionSets.map(set => ({
                    setName: set.setName,
                    questions: set.questions.map(({ id, ...q }) => ({
                        ...q,
                        // If id is a UUID (string), it's new. If it's a number/existing ID, pass it.
                        id: typeof id === 'string' ? null : id
                    }))
                }))
            };
            await examService.createWithQuestions(payload);
            toast.success("Exam saved successfully!");
            navigate('/admin/dashboard');
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to save exam");
        } finally {
            setSubmitting(false);
        }
    }, [examDetails, questionSets, navigate]);

    return {
        activeSetIndex, setActiveSetIndex,
        examDetails, setExamDetails,
        questionSets, setQuestionSets,
        submitting, loading, parsing, debugLogs,
        handleDetailChange,
        addQuestionSet,
        removeQuestionSet,
        addQuestionToSet,
        removeQuestionFromSet,
        duplicateQuestion,
        editingQuestion,
        setEditingQuestion,
        updateQuestionInSet,
        handleBulkUpload,
        saveExam
    };
};
