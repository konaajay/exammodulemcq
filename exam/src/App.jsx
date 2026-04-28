import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import ExamDashboard from './pages/ExamDashboard';
import CreateExam from './pages/CreateExam';
import AttemptExam from './pages/AttemptExam';
import Result from './pages/Result';
import AdminPreview from './pages/AdminPreview';
import ExamResults from './pages/ExamResults';
import StudentDashboard from './pages/StudentDashboard';
import StudentHistory from './pages/StudentHistory';
import CreateStudent from './pages/CreateStudent';
import StudentList from './pages/StudentList';
import ManageCourses from './pages/ManageCourses';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';

const MainLayout = ({ children }) => {
  const location = useLocation();
  const isExcluded = (path) => {
    return path === '/login' || path.startsWith('/exam/');
  };

  const showNavigation = !isExcluded(location.pathname);

  return <div className="container-fluid p-0 bg-transparent">
      {showNavigation && <Navbar />}
      <main className="p-4 pt-5" style={{ height: 'auto', overflow: 'visible' }}>
        {children}
      </main>
    </div>;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <MainLayout>
          <Routes>
            {/* Public Login Route */}
            <Route path="/login" element={<Login />} />

            {/* Protected Admin Routes */}
            <Route path="/admin/dashboard" element={<ProtectedRoute><ExamDashboard /></ProtectedRoute>} />
            <Route path="/admin/create" element={<ProtectedRoute><CreateExam /></ProtectedRoute>} />
            <Route path="/admin/create/:id" element={<ProtectedRoute><CreateExam /></ProtectedRoute>} />
            <Route path="/admin/preview/:id" element={<ProtectedRoute><AdminPreview /></ProtectedRoute>} />
            <Route path="/admin/results/:id" element={<ProtectedRoute><ExamResults /></ProtectedRoute>} />
            <Route path="/admin/students" element={<ProtectedRoute><StudentList /></ProtectedRoute>} />
            <Route path="/admin/students/create" element={<ProtectedRoute><CreateStudent /></ProtectedRoute>} />
            <Route path="/admin/courses" element={<ProtectedRoute><ManageCourses /></ProtectedRoute>} />

            {/* Student Routes */}
            <Route path="/exam/:id" element={<AttemptExam />} />
            <Route path="/result" element={<Result />} />
            <Route path="/student/dashboard" element={<ProtectedRoute><StudentDashboard /></ProtectedRoute>} />
            <Route path="/student/history/:id" element={<ProtectedRoute><StudentHistory /></ProtectedRoute>} />

            {/* Fallback Redirect */}
            <Route path="/" element={<Navigate to="/admin/dashboard" />} />
          </Routes>
        </MainLayout>
      </Router>
    </AuthProvider>
  );
}

export default App;
