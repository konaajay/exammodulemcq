import axios from 'axios';

const BASE_URL = '/api/exam-violations';

export const examViolationService = {
    reportViolation: async (violationData) => {
        try {
            const response = await axios.post(BASE_URL, violationData);
            return response.data;
        } catch (error) {
            console.error('Error reporting exam violation:', error);
            throw error;
        }
    },

    getViolationsByAttemptId: async (attemptId) => {
        try {
            const response = await axios.get(`${BASE_URL}/attempt/${attemptId}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching violations for attempt ID ${attemptId}:`, error);
            throw error;
        }
    },

    resolveViolation: async (id, resolutionData) => {
        try {
            const response = await axios.put(`${BASE_URL}/${id}/resolve`, resolutionData);
            return response.data;
        } catch (error) {
            console.error(`Error resolving violation ID ${id}:`, error);
            throw error;
        }
    }
};
