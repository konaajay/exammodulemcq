import api from './api';

export const courseService = {
    getAllCourses: async () => {
        return await api.get('/api/courses/all');
    },

    createCourse: async (courseData) => {
        return await api.post('/api/courses/create', courseData);
    },

    deleteCourse: async (id) => {
        return await api.delete(`/api/courses/${id}`);
    }
};

export default courseService;
