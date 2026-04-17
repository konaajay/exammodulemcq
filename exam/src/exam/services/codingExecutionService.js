import axios from 'axios';

const BASE_URL = '/api/exam-responses';

export const codingExecutionService = {
    runCodeSubmission: async (responseId) => {
        try {
            const response = await axios.post(`${BASE_URL}/${responseId}/run`);
            return response.data;
        } catch (error) {
            console.error(`Error running code submission for response ID ${responseId}:`, error);
            throw error;
        }
    },

    getExecutionResults: async (responseId) => {
        try {
            const response = await axios.get(`${BASE_URL}/${responseId}/execution-results`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching execution results for response ID ${responseId}:`, error);
            throw error;
        }
    }
};
