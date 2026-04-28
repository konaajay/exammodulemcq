import api from './api';

export const authService = {
    login: async (credentials) => {
        // Send email and password to backend
        const response = await api.post('/api/auth/login', credentials);
        if (response.success && response.token) {
            localStorage.setItem('user', JSON.stringify(response));
            localStorage.setItem('token', response.token);
        }
        return response;
    },

    logout: () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
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
