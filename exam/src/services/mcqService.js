import api from './api';

export const mcqService = {
    // Admin: Bulk Upload Questions
    uploadMCQ: async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        return await api.post('/api/questions/upload-mcq', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },

    // Admin: Get all Exams
    getAllExams: async () => {
        const data = await api.get('/api/exams');
        return data || [];
    },

    // Admin: Create Exam
    createExam: async (examData) => {
        return await api.post('/api/exams', examData);
    },

    // Student: Start Attempt (Standard)
    startAttempt: async (examId) => {
        return await api.post(`/api/exams/${examId}/attempts/start`);
    },

    // Student: Start Attempt (Public/Link)
    startPublicAttempt: async (examId, studentInfo) => {
        // payload: { name, email }
        return await api.post(`/api/exams/${examId}/attempts/public-start`, studentInfo);
    },

    // Student: Record Response
    saveResponse: async (examId, attemptId, payload) => {
        // payload: { questionId, selectedOption }
        return await api.post(`/api/exams/${examId}/attempts/${attemptId}/responses`, payload);
    },

    // Student: Submit Exam
    submitAttempt: async (examId, attemptId) => {
        return await api.post(`/api/exams/${examId}/attempts/${attemptId}/submit`);
    },

    // Student: Get Result
    getResult: async (examId, attemptId) => {
        return await api.get(`/api/exams/${examId}/attempts/${attemptId}/result`);
    }
};

export default mcqService;
