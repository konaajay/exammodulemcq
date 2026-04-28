import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Loading from '../components/common/Loading';
import { useAuth } from '../../../context/AuthContext';

// Lazy Load Student Pages
const StudentDashboard = lazy(() => import('../pages/Student/Dashboard/StudentDashboard'));
const StudentLayout = lazy(() => import('../components/layout/StudentLayout'));
const StudentExams = lazy(() => import('../pages/Student/Exams/StudentExams'));
const StudentExamHall = lazy(() => import('../pages/Student/Exams/StudentExamHall'));
const StudentProfile = lazy(() => import('../pages/Student/Profile/StudentProfile'));

// Lazy Load Public/Shared Pages
const LoginPage = lazy(() => import('../pages/Login/LoginPage'));
const NotFound = lazy(() => import('../pages/NotFound'));

const RootRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) return <Loading />;
  const role = user?.role?.toUpperCase();

  if (role === 'STUDENT') {
    return <Navigate to="/student/dashboard" replace />;
  }
  return <Navigate to="/login" replace />;
};

const AppRoutes = () => {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        {/* ================= PUBLIC ROUTES ================= */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<RootRedirect />} />

        {/* ================= STUDENT PORTAL ================= */}
        <Route element={<StudentLayout />}>
          <Route path="/student">
            <Route index element={<Navigate to="/student/dashboard" replace />} />
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="exams" element={<StudentExams />} />
            <Route path="exams/:examId/take" element={<StudentExamHall />} />
            <Route path="profile" element={<StudentProfile />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Route>

        {/* ===== 404 ===== */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
