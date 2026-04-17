import { apiFetch } from "../../../services/api";

const BASE_URL = "/api/exams";
const DEBUG = false;

const logApi = (method, endpoint, payload = null, response = null, error = null) => {
    if (!DEBUG) return;
    console.group(`%c[ExamSettingsService] ${method} ${endpoint}`, "color: #9c27b0; font-weight: bold;");
    if (payload) console.log("Payload:", payload);
    if (response) console.log("Response:", response);
    if (error) console.error("Error:", error);
    console.groupEnd();
};

export const ExamSettingsService = {
    // 1. Core Settings (exam_settings Table)
    saveSettings: async (examId, settings) => {
        const url = `${BASE_URL}/${examId}/settings`;
        // Payload exactly aligned with ExamSettings.java
        const payload = {
            examId: Number(examId),
            attemptsAllowed: Number(settings.attemptsAllowed || 1),
            negativeMarking: Boolean(settings.negativeMarking),
            negativeMarkValue: Number(settings.negativeMarkValue || 0),
            shuffleQuestions: Boolean(settings.shuffleQuestions),
            shuffleOptions: Boolean(settings.shuffleOptions),
            allowLateEntry: Boolean(settings.allowLateEntry),
            networkMode: String(settings.networkMode || "LENIENT")
        };
        if (DEBUG) return { ...payload, id: 1 };
        try {
            const data = await apiFetch(url, { method: "POST", body: JSON.stringify(payload) });
            logApi("POST", url, payload, data);
            return data;
        } catch (error) {
            logApi("POST", url, payload, null, error);
            throw error;
        }
    },

    getExamSettings: async (examId) => {
        const url = `${BASE_URL}/${examId}/settings`;
        if (DEBUG) return { attemptsAllowed: 1 };
        try {
            const data = await apiFetch(url);
            if (!data) return null;
            // Map Table 3 snake_case to camelCase
            return {
                attemptsAllowed: data.attempts_allowed || data.attemptsAllowed || 1,
                negativeMarking: data.negative_marking ?? data.negativeMarking ?? false,
                negativeMarkValue: data.negative_mark_value || data.negativeMarkValue || 0,
                shuffleQuestions: data.shuffle_questions ?? data.shuffleQuestions ?? false,
                shuffleOptions: data.shuffle_options ?? data.shuffleOptions ?? false,
                allowLateEntry: data.allow_late_entry ?? data.allowLateEntry ?? false,
                networkMode: data.network_mode || data.networkMode || "LENIENT"
            };
        } catch (error) {
            logApi("GET", url, null, null, error);
            return null;
        }
    },

    // 2. Branding (exam_design Table)
    saveDesign: async (examId, designData) => {
        const url = `${BASE_URL}/${examId}/design/upload`;
        const formData = new FormData();
        formData.append("orientation", (designData.orientation || "PORTRAIT").toUpperCase());
        formData.append("watermarkType", designData.watermarkType || "TEXT");
        formData.append("watermarkValue", designData.watermarkValue || "");
        formData.append("watermarkOpacity", Math.round((designData.watermarkOpacity || 0.1) * 100));

        if (designData.instituteLogo) formData.append("instituteLogo", designData.instituteLogo);
        if (designData.backgroundImage) formData.append("backgroundImage", designData.backgroundImage);

        try {
            const data = await apiFetch(url, {
                method: "POST",
                body: formData,
                headers: { "Content-Type": null }
            });
            logApi("POST (Design)", url, designData, data);
            return data;
        } catch (error) {
            logApi("POST (Design)", url, designData, null, error);
            throw error;
        }
    },

    getExamDesign: async (examId) => {
        const url = `${BASE_URL}/${examId}/design`;
        if (DEBUG) return { orientation: 'PORTRAIT', watermarkType: 'TEXT' };
        try {
            const data = await apiFetch(url);
            logApi("GET", url, null, data);
            return data;
        } catch (error) {
            logApi("GET", url, null, null, error);
            return null;
        }
    },

    // 3. Proctoring (exam_proctoring Table)
    saveProctoring: async (examId, proctoring) => {
        const url = `${BASE_URL}/${examId}/proctoring`;
        const payload = {
            enabled: proctoring.enabled,
            cameraRequired: proctoring.cameraRequired,
            systemCheckRequired: proctoring.systemCheckRequired ?? true,
            violationLimit: proctoring.violationLimit || 5
        };
        if (DEBUG) return { ...payload, id: 1 };
        try {
            const data = await apiFetch(url, { method: "POST", body: JSON.stringify(payload) });
            logApi("POST", url, payload, data);
            return data;
        } catch (error) {
            logApi("POST", url, payload, null, error);
            throw error;
        }
    },

    getExamProctoring: async (examId) => {
        const url = `${BASE_URL}/${examId}/proctoring`;
        if (DEBUG) return { enabled: false };
        try {
            const data = await apiFetch(url);
            logApi("GET", url, null, data);
            return data;
        } catch (error) {
            logApi("GET", url, null, null, error);
            return null;
        }
    },

    // 4. Grading (exam_grading Table)
    saveGrading: async (examId, grading) => {
        const url = `${BASE_URL}/${examId}/grading`;
        const payload = {
            autoEvaluation: grading.autoEvaluation,
            partialMarking: grading.partialMarking,
            showResult: grading.showResult,
            showRank: grading.showRank,
            showPercentile: grading.showPercentile
        };
        if (DEBUG) return { ...payload, id: 1 };
        try {
            const data = await apiFetch(url, { method: "POST", body: JSON.stringify(payload) });
            logApi("POST", url, payload, data);
            return data;
        } catch (error) {
            logApi("POST", url, payload, null, error);
            throw error;
        }
    },

    getExamGrading: async (examId) => {
        const url = `${BASE_URL}/${examId}/grading`;
        if (DEBUG) return { autoEvaluation: true };
        try {
            const data = await apiFetch(url);
            logApi("GET", url, null, data);
            return data;
        } catch (error) {
            logApi("GET", url, null, null, error);
            return null;
        }
    },

    // 5. Notifications (exam_notification Table)
    saveNotification: async (examId, notification) => {
        const url = `${BASE_URL}/${examId}/notification`;
        const payload = {
            scheduledNotification: notification.scheduledNotification,
            reminderBefore: notification.reminderBefore || "NONE",
            feedbackAfterExam: notification.feedbackAfterExam || false
        };
        if (DEBUG) return { ...payload, id: 1 };
        try {
            const data = await apiFetch(url, { method: "POST", body: JSON.stringify(payload) });
            logApi("POST", url, payload, data);
            return data;
        } catch (error) {
            logApi("POST", url, payload, null, error);
            throw error;
        }
    },

    getNotification: async (examId) => {
        const url = `${BASE_URL}/${examId}/notification`;
        if (DEBUG) return { scheduledNotification: false };
        try {
            const data = await apiFetch(url);
            logApi("GET", url, null, data);
            return data;
        } catch (error) {
            logApi("GET", url, null, null, error);
            return null;
        }
    },

    // 6. Global Presets
    getGlobalSettings: async () => {
        const url = "/api/exam-settings/global";
        if (DEBUG) {
            return {
                defaults: { duration: 60, totalMarks: 100 },
                visuals: { orientation: "PORTRAIT" },
                attemptRules: { attemptsAllowed: 2 }
            };
        }
        try {
            return await apiFetch(url);
        } catch (error) {
            logApi("GET", url, null, null, error);
            return null;
        }
    },

    saveGlobalSettings: async (settings) => {
        const url = "/api/exam-settings/global";
        if (DEBUG) return { status: "success" };
        return await apiFetch(url, { method: "POST", body: JSON.stringify(settings) });
    }
};
