import { apiFetch } from "../../../services/api";

const BASE_URL = "/api/questions";
const DEBUG = false; // Disable debug now that backend controller is provided

const logApi = (method, endpoint, payload = null, response = null, error = null) => {
    if (!DEBUG && !error) return;
    const style = error ? "color: #ff4d4d; font-weight: bold;" : "color: #00bcd4; font-weight: bold;";
    console.group(`%c[QuestionService] ${method} ${endpoint}`, style);
    if (payload) console.log("Request:", payload);
    if (response) console.log("Response:", response);
    if (error) console.error("Error Detail:", error);
    console.groupEnd();
};

export const QuestionService = {
    // Create a new question in the global bank
    createQuestion: async (questionData) => {
        const url = `${BASE_URL}`;
        // Map frontend model to the Java backend entity: Question.java
        const payload = {
            ...questionData,
            questionText: questionData.question || questionData.questionText,
            questionType: (questionData.type || questionData.questionType || "MCQ").toUpperCase()
        };

        try {
            const data = await apiFetch(url, {
                method: "POST",
                body: JSON.stringify(payload)
            });
            logApi("POST", url, payload, data);
            return data;
        } catch (error) {
            logApi("POST", url, payload, null, error);
            throw error;
        }
    },

    // Get all questions
    getQuestions: async () => {
        try {
            const data = await apiFetch(BASE_URL);
            return (data || []).map(q => ({
                id: q.questionId || q.id,
                question: q.questionText || q.question || "No text",
                type: (q.questionType || q.type || "MCQ").toLowerCase(),
                options: q.options || [],
                marks: q.marks || 1
            }));
        } catch (error) {
            logApi("GET", BASE_URL, null, null, error);
            return [];
        }
    },

    // Get a specific question by ID
    getQuestionById: async (questionId) => {
        const url = `${BASE_URL}/${questionId}`;
        try {
            const data = await apiFetch(url);
            return data;
        } catch (error) {
            logApi("GET", url, null, null, error);
            throw error;
        }
    },

    // Update an existing question
    updateQuestion: async (questionId, questionData) => {
        const url = `${BASE_URL}/${questionId}`;
        const payload = {
            ...questionData,
            questionText: questionData.question || questionData.questionText,
            questionType: (questionData.type || questionData.questionType || "MCQ").toUpperCase()
        };

        try {
            const data = await apiFetch(url, {
                method: "PUT",
                body: JSON.stringify(payload)
            });
            logApi("PUT", url, payload, data);
            return data;
        } catch (error) {
            logApi("PUT", url, payload, null, error);
            throw error;
        }
    },

    // Delete a question
    deleteQuestion: async (questionId) => {
        const url = `${BASE_URL}/${questionId}`;
        try {
            await apiFetch(url, { method: "DELETE" });
            logApi("DELETE", url);
            return true;
        } catch (error) {
            logApi("DELETE", url, null, null, error);
            throw error;
        }
    },

    // Save options for a question (aligned with QuestionOption.java)
    saveOptions: async (questionId, options) => {
        // We try the nested endpoint first, then the flat one if needed
        const url = `${BASE_URL}/${questionId}/options`;

        const formData = new FormData();

        options.forEach(opt => {
            const isCorr = Boolean(opt.isCorrect || opt.is_correct || false);
            formData.append('isCorrect', isCorr);
        });

        options.forEach(opt => {
            const textValue = String(opt.text || opt.optionText || opt || '');
            formData.append('optionText', textValue);
        });

        try {
            const data = await apiFetch(url, {
                method: "POST",
                body: formData,
                headers: { "Content-Type": null } // Boundary managed by browser
            });
            logApi("POST OPTIONS", url, "[FormData]", data);
            return data;
        } catch (error) {
            logApi("POST OPTIONS FAILED", url, "[FormData]", null, error);
            throw error;
        }
    }
};
