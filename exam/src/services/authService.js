import api from './api';

export const authService = {
    login: async (credentials) => {
        // Send email and password to backend
        const response = await api.post('/api/auth/login', credentials);
        if (response.success) {
            localStorage.setItem('user', JSON.stringify(response));
        }
        return response;
    },

    logout: () => {
        localStorage.removeItem('user');
    },

    getCurrentUser: () => {
        try {
            return JSON.parse(localStorage.getItem('user'));
        } catch (e) {
            return null;
        }
    }
};

export default authService;
