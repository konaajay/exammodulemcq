import axios from 'axios';

const BASE_URL = '/api/exam-designs';

export const examDesignService = {
    createDesign: async (designData) => {
        try {
            const response = await axios.post(BASE_URL, designData);
            return response.data;
        } catch (error) {
            console.error('Error creating exam design:', error);
            throw error;
        }
    },

    getDesignById: async (id) => {
        try {
            const response = await axios.get(`${BASE_URL}/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching exam design ID ${id}:`, error);
            throw error;
        }
    },

    getDesignByExamId: async (examId) => {
        try {
            const response = await axios.get(`${BASE_URL}/exam/${examId}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching design for exam ID ${examId}:`, error);
            throw error;
        }
    },

    updateDesign: async (id, designData) => {
        try {
            const response = await axios.put(`${BASE_URL}/${id}`, designData);
            return response.data;
        } catch (error) {
            console.error(`Error updating exam design ID ${id}:`, error);
            throw error;
        }
    }
};
