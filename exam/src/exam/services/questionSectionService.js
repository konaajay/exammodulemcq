import axios from 'axios';

const BASE_URL = '/api/question-sections';

export const questionSectionService = {
    createSection: async (sectionData) => {
        try {
            const response = await axios.post(BASE_URL, sectionData);
            return response.data;
        } catch (error) {
            console.error('Error creating question section:', error);
            throw error;
        }
    },

    getSectionById: async (id) => {
        try {
            const response = await axios.get(`${BASE_URL}/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching question section ID ${id}:`, error);
            throw error;
        }
    },

    getAllSections: async (params = {}) => {
        try {
            const response = await axios.get(BASE_URL, { params });
            return response.data;
        } catch (error) {
            console.error('Error fetching question sections:', error);
            throw error;
        }
    },

    updateSection: async (id, sectionData) => {
        try {
            const response = await axios.put(`${BASE_URL}/${id}`, sectionData);
            return response.data;
        } catch (error) {
            console.error(`Error updating question section ID ${id}:`, error);
            throw error;
        }
    },

    deleteSection: async (id) => {
        try {
            const response = await axios.delete(`${BASE_URL}/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error deleting question section ID ${id}:`, error);
            throw error;
        }
    }
};
