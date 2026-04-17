import axios from 'axios';

const BASE_URL = '/api/files';

export const fileUploadService = {
    uploadFile: async (file, contextData = {}) => {
        try {
            const formData = new FormData();
            formData.append('file', file);

            Object.keys(contextData).forEach(key => {
                formData.append(key, contextData[key]);
            });

            const response = await axios.post(`${BASE_URL}/upload`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error uploading file:', error);
            throw error;
        }
    },

    deleteFile: async (fileId) => {
        try {
            const response = await axios.delete(`${BASE_URL}/${fileId}`);
            return response.data;
        } catch (error) {
            console.error(`Error deleting file ID ${fileId}:`, error);
            throw error;
        }
    }
};
