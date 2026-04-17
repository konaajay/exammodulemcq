import axios from 'axios';

const BASE_URL = '/api/section-questions';

export const sectionQuestionService = {
    addQuestionToSection: async (mappingData) => {
        try {
            const response = await axios.post(BASE_URL, mappingData);
            return response.data;
        } catch (error) {
            console.error('Error adding question to section:', error);
            throw error;
        }
    },

    getQuestionsBySectionId: async (sectionId) => {
        try {
            const response = await axios.get(`${BASE_URL}/section/${sectionId}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching sequence for section ID ${sectionId}:`, error);
            throw error;
        }
    },

    removeQuestionFromSection: async (id) => {
        try {
            const response = await axios.delete(`${BASE_URL}/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error removing mapping ID ${id}:`, error);
            throw error;
        }
    }
};
