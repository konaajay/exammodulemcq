import axios from 'axios';

const BASE_URL = '/api/exam-sections';

export const examSectionService = {
    createSection: async (sectionData) => {
        try {
            const response = await axios.post(BASE_URL, sectionData);
            return response.data;
        } catch (error) {
            console.error('Error creating exam section:', error);
            throw error;
        }
    },

    getSectionById: async (id) => {
        try {
            const response = await axios.get(`${BASE_URL}/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching exam section with ID ${id}:`, error);
            throw error;
        }
    },

    getSectionsByExamId: async (examId) => {
        try {
            const response = await axios.get(`${BASE_URL}/exam/${examId}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching sections for exam ID ${examId}:`, error);
            throw error;
        }
    },

    updateSection: async (id, sectionData) => {
        try {
            const response = await axios.put(`${BASE_URL}/${id}`, sectionData);
            return response.data;
        } catch (error) {
            console.error(`Error updating exam section with ID ${id}:`, error);
            throw error;
        }
    },

    deleteSection: async (id) => {
        try {
            const response = await axios.delete(`${BASE_URL}/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error deleting exam section with ID ${id}:`, error);
            throw error;
        }
    }
};
