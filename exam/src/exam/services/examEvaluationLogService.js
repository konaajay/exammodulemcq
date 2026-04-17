import axios from 'axios';

const BASE_URL = '/api/exam-evaluation-logs';

export const examEvaluationLogService = {
    createLog: async (logData) => {
        try {
            const response = await axios.post(BASE_URL, logData);
            return response.data;
        } catch (error) {
            console.error('Error creating evaluation log:', error);
            throw error;
        }
    },

    getLogsByAttemptId: async (attemptId) => {
        try {
            const response = await axios.get(`${BASE_URL}/attempt/${attemptId}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching evaluation logs for attempt ID ${attemptId}:`, error);
            throw error;
        }
    }
};
