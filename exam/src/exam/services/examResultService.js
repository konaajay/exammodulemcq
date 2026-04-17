import axios from 'axios';

const BASE_URL = '/api/exam-results';

export const examResultService = {
    createResult: async (resultData) => {
        try {
            const response = await axios.post(BASE_URL, resultData);
            return response.data;
        } catch (error) {
            console.error('Error creating exam result:', error);
            throw error;
        }
    },

    getResultById: async (id) => {
        try {
            const response = await axios.get(`${BASE_URL}/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching exam result with ID ${id}:`, error);
            throw error;
        }
    },

    getResultsByExamId: async (examId) => {
        try {
            const response = await axios.get(`${BASE_URL}/exam/${examId}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching results for exam ID ${examId}:`, error);
            throw error;
        }
    },

    getResultsByStudentId: async (studentId) => {
        try {
            const response = await axios.get(`${BASE_URL}/student/${studentId}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching results for student ID ${studentId}:`, error);
            throw error;
        }
    },

    updateResult: async (id, resultData) => {
        try {
            const response = await axios.put(`${BASE_URL}/${id}`, resultData);
            return response.data;
        } catch (error) {
            console.error(`Error updating exam result with ID ${id}:`, error);
            throw error;
        }
    },

    deleteResult: async (id) => {
        try {
            const response = await axios.delete(`${BASE_URL}/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error deleting exam result with ID ${id}:`, error);
            throw error;
        }
    }
};
