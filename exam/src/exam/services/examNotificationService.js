import axios from 'axios';

const BASE_URL = '/api/exam-notifications';

export const examNotificationService = {
    sendNotification: async (notificationData) => {
        try {
            const response = await axios.post(BASE_URL, notificationData);
            return response.data;
        } catch (error) {
            console.error('Error sending exam notification:', error);
            throw error;
        }
    },

    getNotificationsByExamId: async (examId) => {
        try {
            const response = await axios.get(`${BASE_URL}/exam/${examId}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching notifications for exam ID ${examId}:`, error);
            throw error;
        }
    }
};
