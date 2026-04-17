import axios from 'axios';

const BASE_URL = '/api/exam-attempts';

export const examAttemptService = {
    createAttempt: async (attemptData) => {
        try {
            const response = await axios.post(BASE_URL, attemptData);
            return response.data;
        } catch (error) {
            console.error('Error creating exam attempt:', error);
            throw error;
        }
    },

    getAttemptById: async (id) => {
        try {
            const response = await axios.get(`${BASE_URL}/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching exam attempt ID ${id}:`, error);
            throw error;
        }
    },

    getAttemptsByExamId: async (examId) => {
        try {
            const response = await axios.get(`${BASE_URL}/exam/${examId}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching attempts for exam ID ${examId}:`, error);
            throw error;
        }
    },

    updateAttempt: async (id, attemptData) => {
        try {
            const response = await axios.put(`${BASE_URL}/${id}`, attemptData);
            return response.data;
        } catch (error) {
            console.error(`Error updating exam attempt ID ${id}:`, error);
            throw error;
        }
    }
};
