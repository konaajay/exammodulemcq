import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import {
    FiSettings,
    FiShield,
    FiCheckCircle,
    FiEye,
    FiLayout,
    FiClock,
    FiSave,
    FiInfo,
    FiChevronRight
} from "react-icons/fi";
import { examService } from "../services/examService";
import { Loader2 } from "lucide-react";

/* ================= DEFAULT SETTINGS ================= */
const DEFAULT_SETTINGS = {
    defaults: { duration: 60, totalMarks: 100 },
    visuals: { orientation: "portrait", bgImage: null, watermarkType: "none", watermarkText: "", watermarkOpacity: 0.1 },
    attemptRules: { maxAttempts: 1, evaluationStrategy: "highest" },
    behavior: { autoSubmit: true, shuffleQuestions: true, shuffleOptions: true, disconnectBehavior: "continue_timer", violationHandling: "warning", maxViolations: 3 },
    grading: { scoreType: "marks", resultVisibility: "immediate", allowReview: true, showCorrectAnswers: false, enableNegativeMarking: false, enableAIEvaluation: false, gradeScale: [] },
    proctoring: { defaultEnabled: false, noiseDetection: false, screenMonitoring: false, fullScreen: true, autoRedirect: true },
    instructions: { liveExamInstructions: "", learnerConsentText: "" }
};

const ExamSettings = () => {
    const [settings, setSettings] = useState(DEFAULT_SETTINGS);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState("general");

    const tabs = [
        { id: "general", label: "General Defaults", icon: <FiSettings /> },
        { id: "visuals", label: "Branding & Layout", icon: <FiLayout /> },
        { id: "behavior", label: "Rules & Integrity", icon: <FiShield /> },
        { id: "grading", label: "Grading & Results", icon: <FiCheckCircle /> },
        { id: "proctoring", label: "Proctoring", icon: <FiEye /> },
        { id: "instructions", label: "Instructions", icon: <FiInfo /> },
    ];

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        setLoading(true);
        try {
            const data = await examService.getGlobalSettings();
            if (data) {
                setSettings(prev => ({ ...prev, ...data }));
            }
        } catch (error) {
            console.error("Load settings failed:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await examService.saveGlobalSettings(settings);
            toast.success("Global exam settings updated successfully!");
        } catch (error) {
            toast.error("Failed to save settings. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    const update = (path, value) => {
        setSettings(prev => {
            const newState = { ...prev };
            const keys = path.split(".");
            let current = newState;
            for (let i = 0; i < keys.length - 1; i++) {
                current[keys[i]] = { ...current[keys[i]] };
                current = current[keys[i]];
            }
            current[keys[keys.length - 1]] = value;
            return newState;
        });
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100 bg-dark text-white">
                <Loader2 className="animate-spin" size={48} />
            </div>
        );
    }

    return (
        <div className="exam-container">
            <ToastContainer theme="light" position="bottom-right" />

            <div className="panel-header mb-5 d-flex flex-column flex-md-row justify-content-between align-items-end gap-3">
                <motion.div initial={{ opacity: 0, x: -25 }} animate={{ opacity: 1, x: 0 }}>
                    <h1 className="d-flex align-items-center gap-3">
                        <FiSettings className="text-secondary" size={42} />
                        Global Configuration
                    </h1>
                    <p className="panel-sub-header">Define default rules and behaviors for all newly created exams</p>
                </motion.div>
                <div className="d-flex gap-3">
                    <button
                        className="btn btn-primary rounded-pill px-4 py-2 fw-bold d-flex align-items-center gap-2 premium-btn shadow-sm"
                        onClick={handleSave}
                        disabled={saving}
                    >
                        {saving ? <Loader2 className="animate-spin" size={18} /> : <FiSave />}
                        {saving ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </div>

            <div className="row g-4 h-100">
                {/* Sidebar */}
                <aside className="col-lg-3">
                    <div className="glass-card p-3 sticky-top" style={{ top: '2rem' }}>
                        <div className="nav flex-column gap-2">
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    className={`filter-pill text-start w-100 py-3 px-4 d-flex align-items-center justify-content-between transition-all ${activeTab === tab.id ? "active bg-primary border-primary" : "border-transparent"}`}
                                    onClick={() => setActiveTab(tab.id)}
                                    style={{ borderRadius: '14px', border: '1px solid transparent' }}
                                >
                                    <div className="d-flex align-items-center gap-3 fw-bold">
                                        <span className="fs-5">{tab.icon}</span>
                                        {tab.label}
                                    </div>
                                    <FiChevronRight size={14} className={activeTab === tab.id ? 'opacity-100' : 'opacity-30'} />
                                </button>
                            ))}
                        </div>
                    </div>
                </aside>

                {/* Content */}
                <main className="col-lg-9">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            transition={{ duration: 0.2 }}
                        >
                            {activeTab === "general" && (
                                <Section title="General Exam Defaults" icon={<FiSettings className="text-primary" />}>
                                    <div className="row g-4">
                                        <div className="col-md-6 text-input-group">
                                            <label className="form-label small fw-bold text-muted uppercase tracking-wider">Default Duration (Mins)</label>
                                            <input
                                                type="number" className="form-control light-input"
                                                value={settings.defaults.duration}
                                                onChange={e => update("defaults.duration", parseInt(e.target.value))}
                                            />
                                        </div>
                                        <div className="col-md-6 text-input-group">
                                            <label className="form-label small fw-bold text-muted uppercase tracking-wider">Default Total Marks</label>
                                            <input
                                                type="number" className="form-control light-input"
                                                value={settings.defaults.totalMarks}
                                                onChange={e => update("defaults.totalMarks", parseInt(e.target.value))}
                                            />
                                        </div>
                                        <div className="col-md-6 text-input-group">
                                            <label className="form-label small fw-bold text-muted uppercase tracking-wider">Max Attempts</label>
                                            <input
                                                type="number" className="form-control light-input"
                                                value={settings.attemptRules.maxAttempts}
                                                onChange={e => update("attemptRules.maxAttempts", parseInt(e.target.value))}
                                            />
                                        </div>
                                        <div className="col-md-6 text-input-group">
                                            <label className="form-label small fw-bold text-muted uppercase tracking-wider">Evaluation Strategy</label>
                                            <select
                                                className="form-select light-input"
                                                value={settings.attemptRules.evaluationStrategy}
                                                onChange={e => update("attemptRules.evaluationStrategy", e.target.value)}
                                            >
                                                <option value="highest">Best Score</option>
                                                <option value="latest">Latest attempt</option>
                                                <option value="average">Score average</option>
                                            </select>
                                        </div>
                                    </div>
                                </Section>
                            )}

                            {/* Visuals, Behavior, Grading, etc. follow the same pattern... */}
                            {activeTab === "visuals" && (
                                <Section title="Branding & Layout" icon={<FiLayout className="text-info" />}>
                                    <div className="mb-4 text-input-group">
                                        <label className="form-label small fw-bold text-muted">Paper Orientation</label>
                                        <div className="d-flex gap-3">
                                            {["portrait", "landscape"].map(o => (
                                                <button
                                                    key={o}
                                                    className={`btn flex-grow-1 rounded-4 p-3 border transition-all ${settings.visuals.orientation === o ? "border-primary bg-primary-subtle text-primary shadow-sm" : "border-gray-200 bg-white text-secondary"}`}
                                                    onClick={() => update("visuals.orientation", o)}
                                                >
                                                    {o.charAt(0).toUpperCase() + o.slice(1)}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="text-input-group">
                                        <label className="form-label small fw-bold text-muted">Watermark Type</label>
                                        <select
                                            className="form-select light-input"
                                            value={settings.visuals.watermarkType}
                                            onChange={e => update("visuals.watermarkType", e.target.value)}
                                        >
                                            <option value="none">None</option>
                                            <option value="text">Custom Text</option>
                                            <option value="logo">Institute Logo</option>
                                        </select>
                                    </div>
                                    {settings.visuals.watermarkType === 'text' && (
                                        <div className="mt-4 text-input-group">
                                            <label className="form-label small fw-bold text-muted">Watermark Content</label>
                                            <input
                                                type="text" className="form-control light-input"
                                                value={settings.visuals.watermarkText}
                                                onChange={e => update("visuals.watermarkText", e.target.value)}
                                                placeholder="CONFIDENTIAL"
                                            />
                                        </div>
                                    )}
                                </Section>
                            )}

                            {activeTab === "behavior" && (
                                <Section title="Process & Integrity" icon={<FiShield className="text-warning" />}>
                                    <div className="d-flex flex-column gap-4">
                                        <SwitchItem
                                            label="Automatic Submission"
                                            desc="Auto-submit exam when the countdown reaches zero."
                                            checked={settings.behavior.autoSubmit}
                                            onChange={v => update("behavior.autoSubmit", v)}
                                        />
                                        <SwitchItem
                                            label="Shuffle Questions"
                                            desc="Randomize question sequence for every learner."
                                            checked={settings.behavior.shuffleQuestions}
                                            onChange={v => update("behavior.shuffleQuestions", v)}
                                        />
                                        <SwitchItem
                                            label="Shuffle Options"
                                            desc="Randomize MCQ options for every learner."
                                            checked={settings.behavior.shuffleOptions}
                                            onChange={v => update("behavior.shuffleOptions", v)}
                                        />
                                        <hr className="border-gray-100" />
                                        <div className="row g-4">
                                            <div className="col-md-6 text-input-group">
                                                <label className="form-label small fw-bold text-muted">Violation Policy</label>
                                                <select
                                                    className="form-select light-input"
                                                    value={settings.behavior.violationHandling}
                                                    onChange={e => update("behavior.violationHandling", e.target.value)}
                                                >
                                                    <option value="warning">Warn Only</option>
                                                    <option value="auto_submit">Auto Submit</option>
                                                    <option value="terminate">Terminate Instantly</option>
                                                </select>
                                            </div>
                                            <div className="col-md-6 text-input-group">
                                                <label className="form-label small fw-bold text-muted">Max Allowed Deviations</label>
                                                <input
                                                    type="number" className="form-control light-input"
                                                    value={settings.behavior.maxViolations}
                                                    onChange={e => update("behavior.maxViolations", parseInt(e.target.value))}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </Section>
                            )}

                            {activeTab === "grading" && (
                                <Section title="Grading Controls" icon={<FiCheckCircle className="text-success" />}>
                                    <div className="d-flex flex-column gap-4">
                                        <div className="row g-4">
                                            <div className="col-md-6 text-input-group">
                                                <label className="form-label small fw-bold text-muted">Score Calculation</label>
                                                <select
                                                    className="form-select light-input"
                                                    value={settings.grading.scoreType}
                                                    onChange={e => update("grading.scoreType", e.target.value)}
                                                >
                                                    <option value="marks">Point Based (Marks)</option>
                                                    <option value="percentage">Percentage based (%)</option>
                                                </select>
                                            </div>
                                            <div className="col-md-6 text-input-group">
                                                <label className="form-label small fw-bold text-muted">Result Release</label>
                                                <select
                                                    className="form-select light-input"
                                                    value={settings.grading.resultVisibility}
                                                    onChange={e => update("grading.resultVisibility", e.target.value)}
                                                >
                                                    <option value="immediate">Immediately</option>
                                                    <option value="manual">Admin Release Only</option>
                                                </select>
                                            </div>
                                        </div>
                                        <SwitchItem
                                            label="Enable Answer Review"
                                            desc="Allow students to look back at their answers after submission."
                                            checked={settings.grading.allowReview}
                                            onChange={v => update("grading.allowReview", v)}
                                        />
                                        <SwitchItem
                                            label="Dynamic Negative Marking"
                                            desc="Deduct marks for incorrect answers globally."
                                            checked={settings.grading.enableNegativeMarking}
                                            onChange={v => update("grading.enableNegativeMarking", v)}
                                        />
                                        <hr className="border-gray-100" />
                                        <SwitchItem
                                            label="AI-Assisted Evaluation"
                                            desc="Use AI to automatically score and provide feedback for descriptive and coding questions."
                                            checked={settings.grading.enableAIEvaluation || false}
                                            onChange={v => update("grading.enableAIEvaluation", v)}
                                        />
                                    </div>
                                </Section>
                            )}

                            {activeTab === "proctoring" && (
                                <Section title="Enhanced Proctoring" icon={<FiEye className="text-secondary" />}>
                                    <SwitchItem
                                        label="Enforce AI Proctoring"
                                        desc="Enable camera and environmental monitoring by default."
                                        checked={settings.proctoring.defaultEnabled}
                                        onChange={v => update("proctoring.defaultEnabled", v)}
                                    />
                                    {settings.proctoring.defaultEnabled && (
                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="ps-4 mt-4 d-flex flex-column gap-3 border-start border-light-20">
                                            <SwitchItem label="Noise Detection" desc="" checked={settings.proctoring.noiseDetection} onChange={v => update("proctoring.noiseDetection", v)} />
                                            <SwitchItem label="Screen Tracking" desc="" checked={settings.proctoring.screenMonitoring} onChange={v => update("proctoring.screenMonitoring", v)} />
                                            <SwitchItem label="Full Screen Enforcement" desc="" checked={settings.proctoring.fullScreen} onChange={v => update("proctoring.fullScreen", v)} />
                                        </motion.div>
                                    )}
                                </Section>
                            )}

                            {activeTab === "instructions" && (
                                <Section title="Candidate Instructions" icon={<FiInfo className="text-danger" />}>
                                    <div className="mb-4 text-input-group">
                                        <label className="form-label small fw-bold text-muted">Global Instructions</label>
                                        <textarea
                                            className="form-control light-input" rows={6}
                                            value={settings.instructions.liveExamInstructions}
                                            onChange={e => update("instructions.liveExamInstructions", e.target.value)}
                                            placeholder="Enter rules for the exam room..."
                                        />
                                    </div>
                                    <div className="text-input-group">
                                        <label className="form-label small fw-bold text-muted">Consent Requirement Statement</label>
                                        <input
                                            className="form-control light-input"
                                            value={settings.instructions.learnerConsentText}
                                            onChange={e => update("instructions.learnerConsentText", e.target.value)}
                                            placeholder="I agree to follow the code of conduct..."
                                        />
                                    </div>
                                </Section>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>

            <style>{`
                .bg-gray-5 { background: #f8fafc; }
                .bg-gray-10 { background: #f1f5f9; }
                .hover-bg-gray-10:hover { background: #f1f5f9; }
                .border-light-20 { border-color: rgba(0,0,0,0.05) !important; }
                .light-input { background: #ffffff; border: 1px solid #e2e8f0; color: #1e293b; border-radius: 12px; padding: 12px; transition: all 0.2s; }
                .light-input:focus { background: #ffffff; border-color: #6366f1; box-shadow: 0 0 0 4px rgba(99,102,241,0.1); color: #1e293b; }
                .max-w-800 { max-width: 800px; }
                .premium-btn { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
                .premium-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(99,102,241,0.2); }
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .uppercase { text-transform: uppercase; }
                .tracking-wider { letter-spacing: 0.05em; }
            `}</style>
        </div>
    );
};

const Section = ({ title, icon, children }) => (
    <div className="mb-5">
        <div className="d-flex align-items-center gap-3 mb-4">
            <span className="icon-box bg-white text-primary shadow-sm">{icon}</span>
            <h5 className="fw-bold mb-0 text-dark" style={{ letterSpacing: '-0.01em' }}>{title}</h5>
        </div>
        <div className="glass-card p-4 p-md-5">
            {children}
        </div>
    </div>
);

const SwitchItem = ({ label, desc, checked, onChange }) => (
    <div className="d-flex justify-content-between align-items-center gap-4 py-2">
        <div className="flex-grow-1">
            <h6 className="fw-bold mb-1 text-dark fs-7">{label}</h6>
            <p className="small text-muted mb-0" style={{ fontSize: '0.75rem', lineHeight: '1.4' }}>{desc}</p>
        </div>
        <div className="form-check form-switch custom-switch">
            <input
                className="form-check-input" type="checkbox" role="switch"
                checked={checked} onChange={e => onChange(e.target.checked)}
            />
        </div>
    </div>
);

export default ExamSettings;
