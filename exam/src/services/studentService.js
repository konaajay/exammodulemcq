import api from './api';

export const studentService = {
    // ADMIN: Create a student and get credentials back (once)
    createStudent: async (studentData) => {
        return await api.post('/api/students/create', studentData);
    },

    // ADMIN: Get all students
    getAllStudents: async () => {
        return await api.get('/api/students');
    },

    // ADMIN: Get student by ID
    getStudentById: async (id) => {
        return await api.get(`/api/students/${id}`);
    }
};

export default studentService;
