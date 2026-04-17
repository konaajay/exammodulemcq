import { Route, Navigate } from "react-router-dom";

import ExamDashboard from "../dashboard/ExamDashboard";
import QuestionBank from "../question-bank/QuestionBank";
import CreateExam from "../create-exam/CreateExam";
import ExamSchedule from "../schedule/ExamSchedule";
import ReattemptRules from "../reattempt/ReattemptRules";
import ExamReports from "../reports/ExamReports";
import Leaderboard from "../leaderboard/Leaderboard";
import MNCExamView from "../learner/MNCExamView";
import FullExamPaper from "../preview/FullExamPaper";
import ExamPaperView from "../preview/ExamPaperView";
import ExamLayout from "../layouts/ExamLayout";

const ExamRoutes = (
  <>
    <Route path="simulation/mnc-preview/:id" element={<MNCExamView />} />
    <Route path="full-paper/:id" element={<FullExamPaper />} />
    <Route element={<ExamLayout />}>
      <Route path="/" element={<Navigate to="dashboard" replace />} />
      <Route path="dashboard" element={<ExamDashboard />} />
      <Route path="question-bank" element={<QuestionBank />} />
      <Route path="create-exam" element={<CreateExam />} />
      <Route path="edit-exam/:id" element={<CreateExam />} />
      <Route path="schedule" element={<ExamSchedule />} />
      <Route path="reattempt" element={<ReattemptRules />} />
      <Route path="reports" element={<ExamReports />} />
      <Route path="leaderboard" element={<Leaderboard />} />
      <Route path="view-paper/:id" element={<ExamPaperView />} />
    </Route>
  </>
);

export default ExamRoutes;
