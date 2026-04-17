import axios from 'axios';

const BASE_URL = '/api/exam-questions';

export const examQuestionService = {
    createQuestion: async (questionData) => {
        try {
            const response = await axios.post(BASE_URL, questionData);
            return response.data;
        } catch (error) {
            console.error('Error creating exam question:', error);
            throw error;
        }
    },

    getQuestionById: async (id) => {
        try {
            const response = await axios.get(`${BASE_URL}/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching exam question with ID ${id}:`, error);
            throw error;
        }
    },

    getQuestionsByExamId: async (examId) => {
        try {
            const response = await axios.get(`${BASE_URL}/exam/${examId}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching questions for exam ID ${examId}:`, error);
            throw error;
        }
    },

    updateQuestion: async (id, questionData) => {
        try {
            const response = await axios.put(`${BASE_URL}/${id}`, questionData);
            return response.data;
        } catch (error) {
            console.error(`Error updating exam question with ID ${id}:`, error);
            throw error;
        }
    },

    deleteQuestion: async (id) => {
        try {
            const response = await axios.delete(`${BASE_URL}/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error deleting exam question with ID ${id}:`, error);
            throw error;
        }
    }
};
