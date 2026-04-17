import axios from 'axios';

const BASE_URL = '/api/question-options';

export const questionOptionService = {
    createOption: async (optionData) => {
        try {
            const response = await axios.post(BASE_URL, optionData);
            return response.data;
        } catch (error) {
            console.error('Error creating question option:', error);
            throw error;
        }
    },

    getOptionsByQuestionId: async (questionId) => {
        try {
            const response = await axios.get(`${BASE_URL}/question/${questionId}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching options for question ID ${questionId}:`, error);
            throw error;
        }
    },

    updateOption: async (id, optionData) => {
        try {
            const response = await axios.put(`${BASE_URL}/${id}`, optionData);
            return response.data;
        } catch (error) {
            console.error(`Error updating question option ID ${id}:`, error);
            throw error;
        }
    },

    deleteOption: async (id) => {
        try {
            const response = await axios.delete(`${BASE_URL}/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error deleting question option ID ${id}:`, error);
            throw error;
        }
    }
};
