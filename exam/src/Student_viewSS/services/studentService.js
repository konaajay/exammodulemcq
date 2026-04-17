import { apiFetch } from "../../../services/apiFetch";

const API_BASE_URL = "/api/student";
const V1_STUDENT_BASE = "/api/v1/student";

const unwrap = (res) => (res && res.success && res.data !== undefined) ? res.data : res;

export const studentService = {

    // ===== BASIC =====
    getMyBatches: () => apiFetch(`${API_BASE_URL}/my/batches`).then(unwrap),

    getMyCourses: () => apiFetch(`${API_BASE_URL}/my/courses`).then(unwrap),

    getMyAttendance: () => apiFetch(`${API_BASE_URL}/attendance/summary`).then(unwrap),
    getMyAttendanceHistory: () => apiFetch(`${API_BASE_URL}/attendance/history`).then(unwrap),

    getCourseContent: async (courseId) => {
        try {
            // Note: backend CourseController mapping is /api/courses/{id}
            const res = await apiFetch(`/api/courses/${courseId}`);
            return unwrap(res);
        } catch (e) {
            console.warn("⚠️ Falling back to base course API");
            const res = await apiFetch(`/api/courses/${courseId}`);
            return unwrap(res);
        }
    },

    getMyCertificates: (userId) =>
        (userId
            ? apiFetch(`/api/certificates/user/${userId}`)
            : apiFetch(`/api/certificates/my`)).then(unwrap),

    downloadCertificate: (token) =>
        apiFetch(`${API_BASE_URL}/download/${token}`).then(unwrap),

    getProfile: () => apiFetch(`/student/me`).then(unwrap),

    updateProfile: (id, data) =>
        apiFetch(`/api/v1/profile/${id}`, {
            method: "PUT",
            body: JSON.stringify(data),
        }).then(unwrap),

    // ===== CALENDAR =====
    getCalendarEvents: (year, month) =>
        apiFetch(`${API_BASE_URL}/calendar?year=${year}&month=${month}`).then(unwrap),

    addPersonalEvent: (data) =>
        apiFetch(`${API_BASE_URL}/calendar/personal`, {
            method: "POST",
            body: JSON.stringify(data),
        }).then(unwrap),

    // ===== GRADES =====
    getMyGrades: () => apiFetch(`${API_BASE_URL}/student/grades/my`).then(unwrap),

    // ===== EXAMS =====
    getMyExams: () => apiFetch(`/api/student/exams`).then(unwrap),

    getExamDetails: (examId) =>
        apiFetch(`/api/student/exams/${examId}`).then(unwrap),

    getActiveAttempt: (examId) =>
        apiFetch(`/api/student/exams/${examId}/active-attempt`).then(unwrap),

    getExamAttempts: () => 
        apiFetch(`/api/student/exams/attempts`).then(unwrap),

    startExam: (examId) =>
        apiFetch(`/api/student/exams/${examId}/start`, {
            method: "POST"
        }).then(unwrap),

    getExamSections: (examId) =>
        apiFetch(`${API_BASE_URL}/exams/${examId}/questions`).then(unwrap),

    // ===== QUESTIONS =====
    getExamQuestions: async (sectionId) => {
        console.log("🔥 Fetching questions for Section ID:", sectionId);

        try {
            // Updated endpoint
            const data = await apiFetch(`/api/exam-sections/${sectionId}/questions`).then(unwrap);
            const questions = data || [];

            // Fetch options for each MCQ question if missing
            return await Promise.all(questions.map(async (q) => {
                const coreQ = q.question && typeof q.question === 'object' ? q.question : q;
                const realQuestionId = coreQ.questionId || coreQ.id || q.questionId || q.id;
                
                let qType = "MCQ";
                const typeId = coreQ.questionTypeId || coreQ.typeId || q.questionTypeId;
                if (typeId === 2 || String(coreQ.questionType || q.questionType).toUpperCase() === 'DESCRIPTIVE') qType = "DESCRIPTIVE";
                if (typeId === 3 || String(coreQ.questionType || q.questionType).toUpperCase() === 'CODING') qType = "CODING";

                const normalizedQ = {
                    ...q,
                    id: q.examQuestionId || q.id || realQuestionId,
                    questionId: realQuestionId,
                    questionText: coreQ.questionText || coreQ.question || q.questionText || "Untitled Question",
                    questionType: qType,
                    marks: q.marks || 1
                };

                let options = q.options || q.question?.options || q.examQuestionOptions || [];

                // If it's MCQ and options are missing, try fetching them
                if (options.length === 0 && qType === "MCQ" && realQuestionId) {
                    try {
                        const fetchedOpts = await apiFetch(`/api/questions/${realQuestionId}/options`).then(unwrap);
                        if (Array.isArray(fetchedOpts)) options = fetchedOpts;
                    } catch (e) {
                        console.warn(`[StudentService] Failed to fetch options for Q ${realQuestionId}`, e);
                    }
                }

                normalizedQ.options = (options || []).map((opt, idx) => ({
                    id: opt.optionId || opt.id || idx,
                    optionText: opt.optionText || opt.text || "",
                    optionImageUrl: opt.optionImageUrl || opt.optionImage || opt.image || null
                }));

                return normalizedQ;
            }));
        } catch (err) {
            console.error("❌ Failed to fetch questions for section", err);
            throw err;
        }
    },

    // ===== SUBMIT EXAM =====
    submitExam: async (examId) => {
        try {
            // Use the student-specific endpoint: /api/student/exams/{examId}/submit
            const res = await apiFetch(
                `/api/student/exams/${examId}/submit`,
                {
                    method: "POST"
                }
            ).then(unwrap);

            console.log("✅ Exam submitted successfully");
            return res;
        } catch (err) {
            console.error("❌ Submit failed", err);
            throw err;
        }
    },

    // ===== SAVE RESPONSE =====
    saveResponse: async (examId, payload) => {

        if (!examId || !payload?.examQuestionId) {
            console.error("❌ Invalid save payload", payload);
            throw new Error("Invalid payload");
        }

        let body = {
            examQuestionId: Number(payload.examQuestionId)
        };

        if (payload.selectedOptionId != null) {
            body.selectedOptionId = Number(payload.selectedOptionId);
        } else if (payload.descriptiveAnswer) {
            body.descriptiveAnswer = payload.descriptiveAnswer;
        } else if (payload.codingSubmissionCode) {
            body.codingSubmissionCode = payload.codingSubmissionCode;
        }

        console.log("💾 Saving student response:", body);

        // Use the student-specific endpoint: /api/student/exams/{examId}/save
        return apiFetch(`/api/student/exams/${examId}/save`, {
            method: "POST",
            body: JSON.stringify(body),
        }).then(unwrap);
    },

    // ===== CODING =====
    runCodingQuestion: (responseId) =>
        apiFetch(`${API_BASE_URL}/exam-responses/${responseId}/run`, {
            method: "POST",
            body: JSON.stringify({ status: "Execution completed" }),
        }).then(unwrap),

    // ===== RESULT =====
    getSpecificAttemptResult: async (examId, attemptId) => {
        if (!examId || !attemptId) {
            throw new Error("❌ examId or attemptId missing");
        }

        return apiFetch(
            `${API_BASE_URL}/exams/${Number(examId)}/attempts/${Number(attemptId)}/result`
        ).then(unwrap);
    },

    // ===== 🔥 RESULT WITH SMART RETRY =====
    getResultWithRetry: async (examId, attemptId, retries = 6) => {
        for (let i = 0; i < retries; i++) {
            try {
                console.log(`📊 محاولة ${i + 1} to fetch result...`);

                const res = await studentService.getSpecificAttemptResult(
                    examId,
                    attemptId
                );

                console.log("✅ Result received");
                return res;

            } catch (err) {

                // 🚨 Only retry for "Result not available"
                if (err?.message?.includes("Result not available")) {
                    console.warn(`⏳ Result not ready... retry ${i + 1}`);

                    await new Promise((res) => setTimeout(res, 2000));
                } else {
                    console.error("❌ Non-retry error", err);
                    throw err;
                }
            }
        }

        throw new Error("❌ Result not available after retries");
    },

    // ===== DASHBOARD =====
    getStudentDashboard: (id) =>
        apiFetch(`${V1_STUDENT_BASE}/dashboard/${id}`),

    // ===== LIBRARY =====
    getLibraryBooks: (page = 0, size = 10) => 
        apiFetch(`${V1_STUDENT_BASE}/library/books?page=${page}&size=${size}`).then(unwrap),
    getMyLibraryBooks: () => apiFetch(`${V1_STUDENT_BASE}/library/my/books`).then(unwrap),
    getLibraryHistory: () => apiFetch(`${V1_STUDENT_BASE}/library/my/history`).then(unwrap),
    getLibraryReservations: () => apiFetch(`${V1_STUDENT_BASE}/library/my/reservations`).then(unwrap),
    getLibraryFines: () => apiFetch(`${V1_STUDENT_BASE}/library/my/fines`).then(unwrap),
    reserveBook: (bookId) => apiFetch(`${V1_STUDENT_BASE}/library/reserve/${bookId}`, {
        method: "POST"
    }).then(unwrap),
    cancelReservation: (reservationId) => apiFetch(`${V1_STUDENT_BASE}/library/reservations/${reservationId}`, {
        method: "DELETE"
    }).then(unwrap),

    submitCertificateRequest: (payload) =>
        apiFetch(`/api/certificates/requests`, {
            method: "POST",
            body: JSON.stringify(payload)
        }).then(unwrap),

    // ===== WEBINARS =====
    getWebinars: () => apiFetch(`/api/webinars`).then(unwrap),
};