import axios from 'axios';

const BASE_URL = '/api/question-descriptive-answers';

export const questionDescriptiveAnswerService = {
    createAnswer: async (answerData) => {
        try {
            const response = await axios.post(BASE_URL, answerData);
            return response.data;
        } catch (error) {
            console.error('Error creating descriptive answer:', error);
            throw error;
        }
    },

    getAnswerByQuestionId: async (questionId) => {
        try {
            const response = await axios.get(`${BASE_URL}/question/${questionId}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching descriptive answer for question ID ${questionId}:`, error);
            throw error;
        }
    },

    updateAnswer: async (id, answerData) => {
        try {
            const response = await axios.put(`${BASE_URL}/${id}`, answerData);
            return response.data;
        } catch (error) {
            console.error(`Error updating descriptive answer ID ${id}:`, error);
            throw error;
        }
    }
};
