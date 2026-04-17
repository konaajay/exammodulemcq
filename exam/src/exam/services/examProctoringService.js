import axios from 'axios';

const BASE_URL = '/api/exam-proctoring';

export const examProctoringService = {
    createProctoringRule: async (ruleData) => {
        try {
            const response = await axios.post(BASE_URL, ruleData);
            return response.data;
        } catch (error) {
            console.error('Error creating proctoring rule:', error);
            throw error;
        }
    },

    getProctoringByExamId: async (examId) => {
        try {
            const response = await axios.get(`${BASE_URL}/exam/${examId}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching proctoring rules for exam ID ${examId}:`, error);
            throw error;
        }
    },

    updateProctoringRule: async (id, ruleData) => {
        try {
            const response = await axios.put(`${BASE_URL}/${id}`, ruleData);
            return response.data;
        } catch (error) {
            console.error(`Error updating proctoring rule ID ${id}:`, error);
            throw error;
        }
    }
};
