import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8080', // Use 'https://exammodulemcq.onrender.com' for production
    timeout: 10000 // Reduced timeout to 10s for better local testing experience
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor for consistent data access
api.interceptors.response.use(
    (response) => response.data,
    (error) => {
        const msg = error.response?.data?.message || error.message || 'API Error';
        console.error('[API Error]:', msg);
        
        // Handle 401 Unauthorized or 403 Forbidden globally
        if (error.response?.status === 401 || error.response?.status === 403) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        
        return Promise.reject(error);
    }
);

export default api;
