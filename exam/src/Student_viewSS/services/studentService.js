import { apiFetch } from "../../../services/apiFetch";

const API_BASE_URL = "/api/student";

const unwrap = (res) => (res && res.success && res.data !== undefined) ? res.data : res;

export const studentService = {

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
        try {
            const data = await apiFetch(`/api/exam-sections/${sectionId}/questions`).then(unwrap);
            const questions = data || [];

            return await Promise.all(questions.map(async (q) => {
                const coreQ = q.question && typeof q.question === 'object' ? q.question : q;
                const realQuestionId = coreQ.questionId || coreQ.id || q.questionId || q.id;
                
                const normalizedQ = {
                    ...q,
                    id: q.examQuestionId || q.id || realQuestionId,
                    questionId: realQuestionId,
                    questionText: coreQ.questionText || coreQ.question || q.questionText || "Untitled Question",
                    questionType: "MCQ",
                    marks: q.marks || 1
                };

                let options = q.options || q.question?.options || q.examQuestionOptions || [];

                if (options.length === 0 && realQuestionId) {
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
            console.error("❌ Failed to fetch questions", err);
            throw err;
        }
    },

    // ===== SUBMIT EXAM =====
    submitExam: async (examId) => {
        try {
            return await apiFetch(
                `/api/student/exams/${examId}/submit`,
                { method: "POST" }
            ).then(unwrap);
        } catch (err) {
            console.error("❌ Submit failed", err);
            throw err;
        }
    },

    // ===== SAVE RESPONSE =====
    saveResponse: async (examId, payload) => {
        if (!examId || !payload?.examQuestionId) throw new Error("Invalid payload");

        let body = {
            examQuestionId: Number(payload.examQuestionId),
            selectedOptionId: Number(payload.selectedOptionId)
        };

        return apiFetch(`/api/student/exams/${examId}/save`, {
            method: "POST",
            body: JSON.stringify(body),
        }).then(unwrap);
    },

    // ===== RESULT =====
    getSpecificAttemptResult: async (examId, attemptId) => {
        return apiFetch(
            `${API_BASE_URL}/exams/${Number(examId)}/attempts/${Number(attemptId)}/result`
        ).then(unwrap);
    },

    getResultWithRetry: async (examId, attemptId, retries = 6) => {
        for (let i = 0; i < retries; i++) {
            try {
                const res = await studentService.getSpecificAttemptResult(examId, attemptId);
                return res;
            } catch (err) {
                if (err?.message?.includes("Result not available")) {
                    await new Promise((res) => setTimeout(res, 2000));
                } else {
                    throw err;
                }
            }
        }
        throw new Error("❌ Result not available after retries");
    },
};