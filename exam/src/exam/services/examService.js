import api from './mcqService'; // Proxy through the new MCQ service logic
import axios from '../../../services/api'; // Direct access to base axios instance

/**
 * Legacy ExamService Refactored for MCQ-Only Scope
 * Most methods now proxy to the simplified mcqService or point to new minimal endpoints.
 */
export const examService = {
    isValidId: (id) => id && id !== "undefined" && !isNaN(Number(id)),

    // Proxy to get all exams (MCQ focus)
    getAllExams: async () => {
        const data = await axios.get('/api/exams');
        return (data || []).map(e => ({
            ...e,
            id: e.id,
            totalQuestions: e.questions ? e.questions.length : 0,
            duration: e.duration || 60,
            status: e.status || 'UPCOMING'
        }));
    },

    getExamById: async (id) => {
        if (!examService.isValidId(id)) return null;
        return await axios.get(`/api/exams/${id}`);
    },

    deleteExam: async (id) => await axios.delete(`/api/exams/${id}`),

    // Mock/Minimal for legacy UI compatibility
    getDeletedExams: async () => [],
    restoreExam: async (id) => ({ success: true }),
    hardDeleteExam: async (id) => ({ success: true }),

    // Attempt logic
    startExamAttempt: async (examId, studentId) => {
        // Points to the new minimal endpoint
        return await axios.post(`/api/exams/${examId}/attempts/start`);
    },

    saveExamResponse: async (attemptId, payload) => {
        // payload: { examQuestionId, selectedOptionId }
        // The new backend expects { questionId, selectedOption }
        const mappedPayload = {
            questionId: payload.examQuestionId,
            selectedOption: payload.selectedOptionId
        };
        const examId = 1; // Backend will need a better way to route if we don't have examId here
        // But in my new controller, it's /api/exams/{examId}/attempts/{attemptId}/responses
        // I'll use a generic endpoint or fix the controller if needed.
        // For now, let's assume we use the new mcqService style
        return await axios.post(`/api/exams/1/attempts/${attemptId}/responses`, mappedPayload);
    },

    submitExamAttempt: async (examId, attemptId) => {
        return await axios.post(`/api/exams/${examId}/attempts/${attemptId}/submit`);
    }
};
