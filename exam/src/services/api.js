import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3131',
    timeout: 120000 // 120 seconds for large bulk uploads
});

// Response interceptor for consistent data access
api.interceptors.response.use(
    (response) => response.data,
    (error) => {
        const msg = error.response?.data?.message || error.message || 'API Error';
        console.error('[API Error]:', msg);
        return Promise.reject(error);
    }
);

export default api;
