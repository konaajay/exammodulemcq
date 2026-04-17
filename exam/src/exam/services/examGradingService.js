import axios from 'axios';

const BASE_URL = '/api/exam-gradings';

export const examGradingService = {
    submitGrade: async (gradingData) => {
        try {
            const response = await axios.post(BASE_URL, gradingData);
            return response.data;
        } catch (error) {
            console.error('Error submitting exam grade:', error);
            throw error;
        }
    },

    getGradingByAttemptId: async (attemptId) => {
        try {
            const response = await axios.get(`${BASE_URL}/attempt/${attemptId}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching grades for attempt ID ${attemptId}:`, error);
            throw error;
        }
    }
};
