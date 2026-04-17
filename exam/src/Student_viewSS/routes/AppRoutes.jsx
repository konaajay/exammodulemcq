import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Loading from '../components/common/Loading';
import { useAuth } from '../../../../pages/Library/context/AuthContext';

// Lazy Load Student Pages
const StudentDashboard = lazy(() => import('../pages/Student/Dashboard/StudentDashboard'));
const StudentCourses = lazy(() => import('../pages/Student/Courses/StudentCourses'));
const StudentBatches = lazy(() => import('../pages/Student/Batches/StudentBatches'));
const StudentAttendance = lazy(() => import('../pages/Student/Attendance/StudentAttendance'));
const StudentLibrary = lazy(() => import('../pages/Student/Library/StudentLibrary'));
const LearningContent = lazy(() => import('../pages/Student/LearningContent/LearningContent'));
const StudentLayout = lazy(() => import('../components/layout/StudentLayout'));
const StudentGrades = lazy(() => import('../pages/Student/Grades/StudentGrades'));
const StudentCertificates = lazy(() => import('../pages/Student/Certificates/StudentCertificates'));
const StudentProfile = lazy(() => import('../pages/Student/Profile/StudentProfile'));
const StudentCalendar = lazy(() => import('../pages/Student/Calendar/StudentCalendar'));
const StudentExams = lazy(() => import('../pages/Student/Exams/StudentExams'));
const StudentNotifications = lazy(() => import('../pages/Student/Notifications/StudentNotifications'));
const StudentWebinars = lazy(() => import('../pages/Student/Webinars/StudentWebinars'));
const StudentTransport = lazy(() => import('../pages/Student/Transport/StudentTransport'));
const StudentHostel = lazy(() => import('../pages/Student/Hostel/StudentHostel'));
const StudentCommunication = lazy(() => import('../pages/Student/Communication/StudentCommunication'));
const StudentHelpDesk = lazy(() => import('../pages/Student/HelpDesk/StudentHelpDesk'));
const StudentReferral = lazy(() => import('../pages/Student/Sttudent_refferal/ReferralDashboard'));
const StudentFeePage = lazy(() => import('../pages/Student/Fee/StudentFeePage'));
const StudentExamHall = lazy(() => import('../pages/Student/Exams/StudentExamHall'));
const StudentSessions = lazy(() => import('../pages/Student/Sessions/StudentSessions'));

// Lazy Load Public/Shared Pages
const CourseOverview = lazy(() => import('../pages/Courses/CourseOverview'));
const PublicVerificationPage = lazy(() => import('../pages/Certificates/PublicVerificationPage'));
const AffiliateRegister = lazy(() => import('../pages/Affiliates/AffiliateRegister'));
const LoginPage = lazy(() => import('../pages/Login/LoginPage'));
const PayPage = lazy(() => import('../pages/Pay/PayPage'));
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
        <Route path="/pay/:orderId" element={<PayPage />} />
        <Route path="/course-overview/:id" element={<CourseOverview />} />
        <Route path="/share/:shareCode" element={<CourseOverview />} />
        <Route path="/affiliate/join" element={<AffiliateRegister />} />
        <Route path="/verify/:id" element={<PublicVerificationPage />} />

        {/* ================= STUDENT PORTAL ================= */}
        <Route element={<StudentLayout />}>
          <Route path="/student">
            <Route index element={<Navigate to="/student/dashboard" replace />} />
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="sessions/:batchId" element={<StudentSessions />} />
            <Route path="courses" element={<StudentCourses />} />
            <Route path="batches" element={<StudentBatches />} />
            <Route path="attendance" element={<StudentAttendance />} />
            <Route path="library" element={<StudentLibrary />} />
            <Route path="content/:id?" element={<LearningContent />} />
            <Route path="grades" element={<StudentGrades />} />
            <Route path="exams" element={<StudentExams />} />
            <Route path="exams/:examId/take" element={<StudentExamHall />} />
            <Route path="calendar" element={<StudentCalendar />} />
            <Route path="webinars" element={<StudentWebinars />} />
            <Route path="transport" element={<StudentTransport />} />
            <Route path="hostel" element={<StudentHostel />} />
            <Route path="communication" element={<StudentCommunication />} />
            <Route path="support" element={<StudentHelpDesk />} />
            <Route path="profile" element={<StudentProfile />} />
            <Route path="certificates" element={<StudentCertificates />} />
            <Route path="notifications" element={<StudentNotifications />} />
            <Route path="referral" element={<StudentReferral />} />
            <Route path="sessions/:batchId" element={<StudentSessions />} />
            <Route path="fee" element={<StudentFeePage />} />
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
