import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ExamLayout from "./layouts/ExamLayout";
import ExamDashboard from "./dashboard/ExamDashboard";
import QuestionBank from "./question-bank/QuestionBank";
import CreateExam from "./create-exam/CreateExam";
import StudentExamDashboard from "./student/StudentExamDashboard";
import MNCExamView from "./learner/MNCExamView";
import PublicExamLanding from "./learner/PublicExamLanding";
import PublicExamResult from "./learner/PublicExamResult";
import ExamPaperView from "./preview/ExamPaperView";

const Exams = () => {
    return (
        <Routes>
            <Route element={<ExamLayout />}>
                <Route path="/" element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<ExamDashboard />} />
                <Route path="question-bank" element={<QuestionBank />} />
                <Route path="create-exam" element={<CreateExam />} />
                <Route path="edit-exam/:id" element={<CreateExam />} />
                <Route path="preview/:id" element={<MNCExamView />} />
            </Route>

            {/* Learner/Student View (Standalone) */}
            <Route path="student/dashboard" element={<StudentExamDashboard />} />
            <Route path="student/attempt/:id" element={<MNCExamView />} />
            
            {/* Public Exam Access (Shareable Link Flow) */}
            <Route path="public/attempt/:id" element={<PublicExamLanding />} />
            <Route path="public/session/:id" element={<MNCExamView />} />
            <Route path="public/result/:id" element={<PublicExamResult />} />

            {/* Unified Preview (Standalone) */}
            <Route path="view-paper/:id" element={<ExamPaperView />} />
            <Route path="full-paper/:id" element={<ExamPaperView />} />
        </Routes>
    );
};

export default Exams;
