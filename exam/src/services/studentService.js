import api from './api';

export const studentService = {
    createStudent: async (studentData) => {
        return await api.post('/api/students/create', studentData);
    },
    getAllStudents: async () => {
        return await api.get('/api/students');
    },
    getStudentById: async (id) => {
        return await api.get(`/api/students/${id}`);
    }
};

export default studentService;
