import axios from 'axios';

const BASE_URL = '/api/exam-responses';

export const examResponseService = {
    submitResponse: async (responseData) => {
        try {
            const response = await axios.post(BASE_URL, responseData);
            return response.data;
        } catch (error) {
            console.error('Error submitting exam response:', error);
            throw error;
        }
    },

    getResponsesByAttemptId: async (attemptId) => {
        try {
            const response = await axios.get(`${BASE_URL}/attempt/${attemptId}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching responses for attempt ID ${attemptId}:`, error);
            throw error;
        }
    },

    updateResponse: async (id, responseData) => {
        try {
            const response = await axios.put(`${BASE_URL}/${id}`, responseData);
            return response.data;
        } catch (error) {
            console.error(`Error updating exam response ID ${id}:`, error);
            throw error;
        }
    }
};
