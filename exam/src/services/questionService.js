import api from './api';

export const questionService = {
    // ADMIN: Bulk Upload MCQ Questions from CSV
    bulkUpload: async (file, course) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('course', course);
        return await api.post('/api/questions/upload-mcq', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    },

    // ADMIN: Fetch all questions for "Build Assessment"
    getAllQuestions: async () => {
        return await api.get('/api/questions');
    },

    // ADMIN: Delete a question from the bank
    deleteQuestion: async (id) => {
        return await api.delete(`/api/questions/${id}`);
    },

    // ADMIN: Create a single question manually
    createQuestion: async (questionData) => {
        return await api.post('/api/questions', questionData);
    },

    parseCsv: async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        return await api.post('/api/questions/parse-csv', formData);
    }
};

export default questionService;
