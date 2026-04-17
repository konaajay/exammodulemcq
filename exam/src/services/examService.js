import api from './api';

export const examService = {
    // ADMIN: Create Exam
    createExam: async (examData) => {
        return await api.post('/api/exams', examData);
    },

    // ADMIN: Get all exams for dashboard
    getAllExams: async () => {
        return await api.get('/api/exams');
    },

    // ADMIN: Fetch specific exam for editing or metadata
    getExamById: async (id) => {
        return await api.get(`/api/exams/${id}`);
    },

    // ADMIN: Soft Delete Exam
    deleteExam: async (id) => {
        return await api.delete(`/api/exams/${id}`);
    },

    // ADMIN: Assign specific questions to an exam with strict marks validation
    assignQuestions: async (examId, questionIds) => {
        return await api.post(`/api/exams/${examId}/assign-questions`, questionIds);
    },

    uploadQuestions: async (examId, file) => {
        const formData = new FormData();
        formData.append('file', file);
        return await api.post(`/api/exams/${examId}/upload-questions`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },

    // STUDENT: Start exam via token/examId
    startExam: async (examId, studentInfo) => {
        return await api.post(`/api/exams/${examId}/attempts/public-start`, studentInfo);
    },

    saveResponse: async (attemptId, response) => {
        return await api.post(`/api/exams/attempts/${attemptId}/responses`, response);
    },

    // STUDENT: Submit final exam
    submitExam: async (attemptId) => {
        return await api.post(`/api/exams/attempts/${attemptId}/submit`);
    },

    // STUDENT: Fetch result
    getResult: async (attemptId) => {
        return await api.get(`/api/exams/attempts/${attemptId}/result`);
    },

    // STUDENT: Get all my attempts
    getMyAttempts: async () => {
        return await api.get('/api/exams/attempts/my');
    },

    // ADMIN: Get attempts for a specific student ID
    getAttemptsByStudent: async (studentId) => {
        return await api.get(`/api/exams/attempts/student/${studentId}`);
    },

    // ADMIN: Get all attempts for a specific exam
    getAttemptsByExam: async (examId) => {
        return await api.get(`/api/exams/${examId}/attempts/all`);
    },

    createWithQuestions: async (data) => {
        return await api.post('/api/exams/create-with-questions', data);
    }
};

export default examService;
