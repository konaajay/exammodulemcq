import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import ExamDashboard from './pages/ExamDashboard';
import CreateExam from './pages/CreateExam';
import AttemptExam from './pages/AttemptExam';
import Result from './pages/Result';
import AdminPreview from './pages/AdminPreview';
import CreateStudent from './pages/CreateStudent';
import ManageCourses from './pages/ManageCourses';
import ExamResults from './pages/ExamResults';
import StudentList from './pages/StudentList';
import StudentHistory from './pages/StudentHistory';
import StudentDashboard from './pages/StudentDashboard';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';

const MainLayout = ({ children }) => {
  const location = useLocation();
  const isExcluded = (path) => {
    return !path.startsWith('/admin/');
  };

  const showSidebar = !isExcluded(location.pathname);
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  return (
    <div className="d-flex">
      {showSidebar && (
        <Sidebar
          isCollapsed={isCollapsed}
          onToggle={() => setIsCollapsed(!isCollapsed)}
        />
      )}
      <div
        className="flex-grow-1"
        style={{
          marginLeft: showSidebar ? (isCollapsed ? '75px' : '260px') : '0',
          transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          minHeight: '100vh',
          backgroundColor: '#f8f9fa'
        }}
      >
        {children}
      </div>
    </div>
  );
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
            <Route path="/admin/students/create" element={<ProtectedRoute><CreateStudent /></ProtectedRoute>} />
            <Route path="/admin/students" element={<ProtectedRoute><StudentList /></ProtectedRoute>} />
            <Route path="/admin/courses" element={<ProtectedRoute><ManageCourses /></ProtectedRoute>} />
            <Route path="/admin/results/:id" element={<ProtectedRoute><ExamResults /></ProtectedRoute>} />
            <Route path="/admin/students/history/:id" element={<ProtectedRoute><StudentHistory /></ProtectedRoute>} />

            {/* Student Routes (Public via Link) */}
            <Route path="/exam/:id" element={<AttemptExam />} />
            <Route path="/result" element={<Result />} />
            <Route path="/student/dashboard" element={<ProtectedRoute><StudentDashboard /></ProtectedRoute>} />

            {/* Fallback Redirect */}
            <Route path="/" element={<Navigate to="/admin/dashboard" />} />
          </Routes>
        </MainLayout>
      </Router>
    </AuthProvider>
  );
}

export default App;
