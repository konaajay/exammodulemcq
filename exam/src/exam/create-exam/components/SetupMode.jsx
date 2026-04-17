import React, { useState, useEffect } from 'react';
import { EXAM_TEMPLATES } from '../data/constants';
import { toast } from 'react-toastify';
import { courseService } from '../../../Courses/services/courseService';
import { batchService } from '../../../Batches/services/batchService';

const SetupMode = ({ onComplete, initialData }) => {

    // Default Instructions Text provided by user
    const DEFAULT_INSTRUCTIONS = `General Instructions:

1. Total duration of examination is 60 minutes.
2. The clock will be set at the server. The countdown timer in the top right corner of screen will display the remaining time available for you to complete the examination. When the timer reaches zero, the examination will end by itself. You will not be required to end or submit your examination.
3. The Question Palette displayed on the right side of screen will show the status of each question using one of the following symbols:
   - You have not visited the question yet.
   - You have not answered the question.
   - You have answered the question.
   - You have NOT answered the question, but have marked the question for review.
   - The question(s) "Answered and Marked for Review" will be considered for evaluation.
4. You can click on the ">" arrow which appears to the left of question palette to collapse the question palette thereby maximizing the question window. To view the question palette again, you can click on "<" which appears on the right side of question window.
5. Navigating to a question:
   - Click on the question number in the Question Palette at the right of your screen to go to that numbered question directly. Note that using this option does NOT save your answer to the current question.
   - Click on Save & Next to save your answer for the current question and then go to the next question.
   - Click on Mark for Review & Next to save your answer for the current question, mark it for review, and then go to the next question.
6. Answering a Question:
   - To select your answer, click on the button of one of the options.
   - To deselect your chosen answer, click on the button of the chosen option again or click on the Clear Response button.
   - To change your chosen answer, click on the button of another option.
   - To save your answer, you MUST click on the Save & Next button.
   - To mark the question for review, click on the Mark for Review & Next button.`;

    // --- PRESETS / PROFILES ---
    const EXAM_PROFILES = {
        'practice': {
            label: 'Practice Mode',
            description: 'Low stress, learning focused. unlimited attempts.',
            icon: 'bi-bicycle',
            color: 'success',
            settings: {
                maxAttempts: 10,
                gradingStrategy: 'highest',
                negativeMarking: false,
                autoSubmit: false,
                shuffleQuestions: false,
                allowResume: true,
                allowReattempt: true,
                showResults: true,
                resultView: 'full', // Show everything
                proctoring: { enabled: false }
            }
        },
        'mock': {
            label: 'Mock Exam',
            description: 'Simulation of real exam conditions. Strict timing.',
            icon: 'bi-stopwatch',
            color: 'warning',
            settings: {
                maxAttempts: 2,
                gradingStrategy: 'latest',
                negativeMarking: true,
                negativeMarkingPenalty: 0.25,
                autoSubmit: true,
                shuffleQuestions: true,
                allowResume: true, // Allow resume for mocks usually
                allowReattempt: true,
                showResults: true,
                resultView: 'score_correct',
                proctoring: { enabled: false }
            }
        },
        'final': {
            label: 'Final Certification',
            description: 'High stakes, high security. Proctoring enabled.',
            icon: 'bi-shield-lock',
            color: 'danger',
            settings: {
                maxAttempts: 1,
                gradingStrategy: 'latest',
                negativeMarking: true,
                negativeMarkingPenalty: 0.25,
                autoSubmit: true,
                shuffleQuestions: true,
                allowResume: false, // Strict
                allowReattempt: false,
                showResults: false, // Don't show immediately
                proctoring: {
                    enabled: true,
                    cameraRequired: true,
                    forceFullScreen: true,
                    maxViolations: 2
                }
            }
        }
    };

    // Phases: 'selection' | 'configuration'
    const [phase, setPhase] = useState(initialData ? 'configuration' : 'selection');
    const [activeTab, setActiveTab] = useState('details');
    const [selectedProfile, setSelectedProfile] = useState('custom');

    // Configuration State
    const [config, setConfig] = useState({
        title: '',
        courseId: '',
        batchId: '',
        type: 'mixed',
        totalMarks: 100,
        duration: 60,
        instructions: DEFAULT_INSTRUCTIONS,
        ...initialData
    });

    const [courses, setCourses] = useState([]);
    const [batches, setBatches] = useState([]);
    const [loadingData, setLoadingData] = useState(false);

    useEffect(() => {
        loadInitialData();
    }, []);

    const loadInitialData = async () => {
        setLoadingData(true);
        try {
            const courseData = await courseService.getCourses();
            setCourses(courseData || []);

            // Fix: Load batches if course is already selected (e.g. Edit Mode)
            if (config.courseId) {
                const batchData = await batchService.getBatchesByCourseId(config.courseId);
                setBatches(batchData || []);
            }
        } catch (error) {
            console.error("Failed to load data", error);
        } finally {
            setLoadingData(false);
        }
    };

    const handleCourseChange = async (courseId) => {
        const selectedCourse = courses.find(c => String(c.courseId) === String(courseId));
        setConfig(prev => ({
            ...prev,
            courseId,
            course: selectedCourse ? selectedCourse.courseName : '',
            batchId: ''
        }));
        if (!courseId) {
            setBatches([]);
            return;
        }

        try {
            const batchData = await batchService.getBatchesByCourseId(courseId);
            setBatches(batchData || []);
        } catch (error) {
            console.error("Failed to load batches", error);
            setBatches([]);
        }
    };

    const [assets, setAssets] = useState({
        logo: null,
        bgImage: null,
        watermark: null,
        watermarkOpacity: 0.1,
        orientation: 'portrait',
        ...initialData?.customAssets
    });

    const [settings, setSettings] = useState({
        maxAttempts: 2, // Safer default (was 1)
        gradingStrategy: 'highest',
        cooldownPeriod: 0,

        // Settings
        negativeMarking: false,
        negativeMarkingPenalty: 0.25,
        autoSubmit: true, // Often expected for exams, but "practice" turns it off
        shuffleQuestions: false,
        shuffleOptions: false,
        allowResume: true,
        allowReattempt: false,
        allowLateEntry: false,
        lateEntryWindow: 15,
        networkStrictness: 'lenient', // 'strict' | 'lenient'

        // Grading
        autoEvaluation: true,
        partialMarking: false,

        // Results
        showResults: true,
        resultView: 'score', // 'score' | 'score_correct' | 'full'
        showRank: false,
        showPercentile: false,

        // Notifications
        scheduledNotification: false,
        examReminder: 0,
        collectFeedback: false,

        // Accessibility
        screenReader: false,

        ...initialData?.settings
    });

    const [proctoring, setProctoring] = useState({
        enabled: false,
        cameraRequired: false,
        microphoneRequired: false,
        cameraMonitoring: false,
        maxViolations: 5,
        maxTabSwitches: 2,
        blockOnTabSwitch: true,
        forceFullScreen: false,
        disableCopyPaste: false,
        deviceRestriction: 'any',
        ...initialData?.proctoring
    });

    const applyProfile = (profileKey) => {
        const p = EXAM_PROFILES[profileKey];
        if (!p) return;

        setSelectedProfile(profileKey);

        // Merge Settings
        setSettings(prev => ({
            ...prev,
            ...p.settings,
            // Exclude proctoring from spread, handle separately
        }));

        // Handle Proctoring
        if (p.settings.proctoring) {
            setProctoring(prev => ({
                ...prev,
                ...p.settings.proctoring
            }));
        }

        toast.info(`Applied ${p.label} settings.`);
    };

    // Initial Data Load (if editing)
    useEffect(() => {
        if (initialData) {
            // ... (Existing logic mostly handled by useState initializers above)
            // If needed we can force update here, but the useState spread handles it.
        }
    }, [initialData]);

    const handleSelection = (choice, template = null) => {
        if (choice === 'template' && template) {
            setConfig(prev => ({
                ...prev,
                title: template.title,
                course: template.course,
                type: template.questions.some(q => q.type === 'coding') ? 'coding' : 'mixed',
                // Keep default marks/duration or infer from template if added to data
            }));
            // Pass questions up via onComplete, but here just set Config phase
        } else if (choice === 'blank') {
            setConfig(prev => ({ ...prev, type: template })); // template is 'mixed'/'coding' string here
        }
        setPhase('configuration');
    };

    const handleAssetChange = (key, value) => {
        setAssets(prev => ({ ...prev, [key]: value }));
    };

    const handleFileChange = (e, key) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                handleAssetChange(key, ev.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const validateAndContinue = () => {
        if (!config.title.trim()) {
            toast.error("Please enter Exam Title.");
            return;
        }
        onComplete({
            ...config,
            customAssets: assets,
            settings,
            proctoring
        });
    };

    if (phase === 'selection') {
        return (
            <div className="exam-container py-5 animate-fade-in">
                <div className="text-center mb-5">
                    <h1 className="fw-bold display-4 mb-3" style={{ letterSpacing: '-0.02em', color: '#1e293b' }}>Create New Assessment</h1>
                    <p className="panel-sub-header fs-5">Choose your starting point to build an engaging exam experience</p>
                </div>

                <div className="row g-4 justify-content-center">
                    {/* Blank */}
                    <div className="col-md-5 col-lg-4">
                        <div className="glass-card h-100 p-5 text-center d-flex flex-column justify-content-center align-items-center cursor-pointer transition-all hover-translate-y" 
                             onClick={() => handleSelection('blank', 'mixed')}
                             style={{ minHeight: '320px' }}
                        >
                            <div className="icon-box bg-indigo-6 text-white mb-4" style={{ width: '80px', height: '80px' }}>
                                <i className="bi bi-file-earmark-plus fs-1"></i>
                            </div>
                            <h4 className="fw-bold text-dark mb-2">Blank Canvas</h4>
                            <p className="small text-muted mb-0 px-3">Start fresh with a clean slate and add your custom questions manually.</p>
                        </div>
                    </div>

                    {/* Templates */}
                    <div className="col-md-5 col-lg-4">
                        <div className="glass-card h-100 p-4 d-flex flex-column">
                            <div className="text-center mb-4">
                                <div className="icon-box bg-teal-6 text-white mb-3 mx-auto" style={{ width: '60px', height: '60px' }}>
                                    <i className="bi bi-grid-1x2 fs-3"></i>
                                </div>
                                <h5 className="fw-bold text-dark mb-0">Use Smart Template</h5>
                            </div>
                            <div className="d-flex flex-row overflow-auto gap-2 pb-2 mb-3">
                                {EXAM_TEMPLATES.map(t => (
                                    <button 
                                        key={t.id} 
                                        className="filter-pill whitespace-nowrap" 
                                        onClick={() => handleSelection('template', t)}
                                    >
                                        {t.title}
                                    </button>
                                ))}
                            </div>
                            <div className="mt-auto pt-3 border-top text-center opacity-50 small">
                                Rapidly build using pre-configured question sets
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="exam-container animate-fade-in pb-5">
            <div className="glass-card overflow-hidden">
                <div className="bg-primary p-4 text-white">
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <h4 className="fw-bold mb-1" style={{ letterSpacing: '-0.02em' }}>Quick Configure</h4>
                            <p className="small mb-0 opacity-75">Define the core DNA of your assessment</p>
                        </div>
                        {!initialData && (
                            <button className="btn btn-primary bg-white text-primary rounded-pill btn-sm px-3 fw-bold" onClick={() => setPhase('selection')}>
                                <i className="bi bi-arrow-left me-1"></i> Back
                            </button>
                        )}
                    </div>
                </div>

                <div className="p-4 p-md-5">

                    {/* --- PROFILES SELECTOR --- */}
                    <div className="mb-5">
                        <label className="fw-bold small text-uppercase mb-4 d-block text-center text-muted" style={{ letterSpacing: '0.1em' }}>Target Exam Profile</label>
                        <div className="row g-3 justify-content-center">
                            {Object.entries(EXAM_PROFILES).map(([key, p]) => (
                                <div className="col-md-4" key={key}>
                                    <div
                                        className={`glass-card h-100 cursor-pointer p-4 text-center transition-all ${selectedProfile === key ? 'active-profile bg-primary text-white border-primary shadow-lg' : 'hover-bg-light'}`}
                                        onClick={() => applyProfile(key)}
                                        style={{
                                            transform: selectedProfile === key ? 'scale(1.02)' : 'scale(1)',
                                            borderColor: selectedProfile === key ? 'var(--primary)' : 'rgba(0,0,0,0.05)'
                                        }}
                                    >
                                        <i className={`bi ${p.icon} fs-3 mb-2 d-block ${selectedProfile === key ? 'text-white' : `text-${p.color}`}`}></i>
                                        <h6 className="fw-bold mb-1">{p.label}</h6>
                                        <p className="small mb-0 opacity-75" style={{ fontSize: '0.7rem' }}>{p.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* TABS HEADER - Consistent with Dashboard */}
                    <div className="mb-5 text-center">
                        <div className="filter-pills-switcher d-inline-flex p-1 bg-light rounded-pill border">
                            {['details', 'design', 'settings', 'proctoring', 'grading', 'notify'].map(tab => (
                                <button
                                    key={tab}
                                    type="button"
                                    onClick={() => setActiveTab(tab)}
                                    className={`filter-pill ${activeTab === tab ? 'active' : ''}`}
                                >
                                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="tab-content">
                        {/* 1. DETAILS TAB */}
                        {activeTab === 'details' && (
                            <div className="row g-4">
                                <div className="col-12 text-center mb-2">
                                    <h6 className="fw-bold text-muted text-uppercase small ls-1">Basic Configuration</h6>
                                </div>
                                <div className="col-md-8">
                                    <label className="form-label small fw-bold text-muted">Assessment Title <span className="text-danger">*</span></label>
                                    <input className="exam-form-control fs-6 py-3" value={config.title} onChange={(e) => setConfig({ ...config, title: e.target.value })} placeholder="e.g. Q4 Final Examination" autoFocus />
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label small fw-bold text-muted">Type</label>
                                    <select className="exam-form-control" value={config.type} onChange={(e) => setConfig({ ...config, type: e.target.value })}>
                                        <option value="mixed">Mixed Assessment</option>
                                        <option value="quiz">Objective Quiz (MCQ)</option>
                                        <option value="coding">Practical Coding</option>
                                    </select>
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label small fw-bold text-muted">Time Limit (Minutes)</label>
                                    <input type="number" className="exam-form-control" value={config.duration} onChange={(e) => setConfig({ ...config, duration: e.target.value })} />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label small fw-bold text-muted">Maximum Points</label>
                                    <input type="number" className="exam-form-control" value={config.totalMarks} onChange={(e) => setConfig({ ...config, totalMarks: e.target.value })} />
                                </div>
                                <div className="col-12">
                                    <label className="form-label small fw-bold text-muted">Student Guidance Instructions</label>
                                    <textarea
                                        className="exam-form-control"
                                        rows="6"
                                        placeholder="Outline the rules for this assessment..."
                                        value={config.instructions || ''}
                                        onChange={(e) => setConfig({ ...config, instructions: e.target.value })}
                                    ></textarea>
                                </div>
                            </div>
                        )}

                        {/* 2. DESIGN TAB */}
                        {activeTab === 'design' && (
                            <div className="row g-4">
                                {/* Orientation */}
                                <div className="col-12 text-center mb-2">
                                    <h6 className="fw-bold text-muted text-uppercase small ls-1">Paper Appearance</h6>
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label small fw-bold">Paper Orientation</label>
                                    <div className="d-flex gap-3">
                                        <div
                                            className={`card border-2 p-3 cursor-pointer w-100 text-center transition-all ${assets.orientation === 'portrait' ? 'border-primary bg-primary bg-opacity-10' : 'border-light'}`}
                                            onClick={() => handleAssetChange('orientation', 'portrait')}
                                        >
                                            <i className="bi bi-file-earmark-text fs-2 mb-2 d-block"></i>
                                            <span className="small fw-bold">Portrait</span>
                                        </div>
                                        <div
                                            className={`card border-2 p-3 cursor-pointer w-100 text-center transition-all ${assets.orientation === 'landscape' ? 'border-primary bg-primary bg-opacity-10' : 'border-light'}`}
                                            onClick={() => handleAssetChange('orientation', 'landscape')}
                                        >
                                            <i className="bi bi-file-earmark-spreadsheet fs-2 mb-2 d-block"></i>
                                            <span className="small fw-bold">Landscape</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Logo */}
                                <div className="col-md-6">
                                    <label className="form-label small fw-bold">Institute Logo</label>
                                    <div className="d-flex gap-3 align-items-center">
                                        {assets.logo && (
                                            <img src={assets.logo} alt="logo" className="rounded border shadow-sm" style={{ width: 60, height: 60, objectFit: 'contain' }} />
                                        )}
                                        <input
                                            type="file"
                                            className="form-control"
                                            accept="image/*"
                                            onChange={(e) => handleFileChange(e, 'logo')}
                                        />
                                    </div>
                                    <div className="form-text small">Displayed at the top of the exam paper.</div>
                                </div>

                                {/* Background Image */}
                                <div className="col-md-6">
                                    <label className="form-label small fw-bold">Background Image</label>
                                    <div className="d-flex gap-3 align-items-center">
                                        {assets.bgImage && (
                                            <img src={assets.bgImage} alt="bg" className="rounded border shadow-sm" style={{ width: 60, height: 80, objectFit: 'cover' }} />
                                        )}
                                        <input
                                            type="file"
                                            className="form-control"
                                            accept="image/*"
                                            onChange={(e) => handleFileChange(e, 'bgImage')}
                                        />
                                    </div>
                                    <div className="form-text small">Optional. Used as paper texture or pattern.</div>
                                </div>

                                {/* Watermark */}
                                <div className="col-12">
                                    <div className="card h-100 bg-light border-0">
                                        <div className="card-body">
                                            <h6 className="fw-bold mb-3">Watermark Settings</h6>
                                            <div className="row g-3">
                                                <div className="col-md-4">
                                                    <label className="small fw-bold mb-2">Watermark Type</label>
                                                    <select
                                                        className="form-select"
                                                        value={typeof assets.watermark === 'string' && !assets.watermark.startsWith('data:') ? 'text' : 'image'}
                                                        onChange={(e) => handleAssetChange('watermark', e.target.value === 'text' ? 'CONFIDENTIAL' : null)}
                                                    >
                                                        <option value="text">Text Watermark</option>
                                                        <option value="image">Image Watermark</option>
                                                    </select>
                                                </div>

                                                {(typeof assets.watermark === 'string' && !assets.watermark.startsWith('data:')) ? (
                                                    <div className="col-md-8">
                                                        <label className="small fw-bold mb-2">Watermark Text</label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            value={assets.watermark || ''}
                                                            onChange={(e) => handleAssetChange('watermark', e.target.value)}
                                                            placeholder="e.g. DRAFT"
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="col-md-8">
                                                        <label className="small fw-bold mb-2">Upload Watermark</label>
                                                        <div className="d-flex gap-3 align-items-center">
                                                            {assets.watermark && assets.watermark.startsWith('data:') && (
                                                                <img src={assets.watermark} alt="wm" className="rounded border" style={{ width: 40, height: 40, objectFit: 'contain' }} />
                                                            )}
                                                            <input
                                                                type="file"
                                                                className="form-control"
                                                                accept="image/*"
                                                                onChange={(e) => handleFileChange(e, 'watermark')}
                                                            />
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="col-12">
                                                    <label className="small fw-bold mb-1">Opacity: {Math.round(assets.watermarkOpacity * 100)}%</label>
                                                    <input
                                                        type="range"
                                                        className="form-range"
                                                        min="0.05"
                                                        max="0.5"
                                                        step="0.05"
                                                        value={assets.watermarkOpacity}
                                                        onChange={(e) => handleAssetChange('watermarkOpacity', parseFloat(e.target.value))}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 3. SETTINGS TAB */}
                        {activeTab === 'settings' && (
                            <div className="row g-4">
                                {/* A. Negative Marking */}
                                <div className="col-md-6">
                                    <div className="card h-100 bg-secondary bg-opacity-10 border-0">
                                        <div className="card-body">
                                            <div className="d-flex justify-content-between">
                                                <div className="form-check form-switch mb-2">
                                                    <input className="form-check-input" type="checkbox" checked={settings.negativeMarking} onChange={e => setSettings({ ...settings, negativeMarking: e.target.checked })} />
                                                    <label className="form-check-label fw-bold">Negative Marking</label>
                                                </div>
                                                {settings.negativeMarking && <span className="badge bg-warning text-dark">Strict</span>}
                                            </div>

                                            {settings.negativeMarking && (
                                                <div className="mt-2 animate-slide-down p-3 bg-white rounded shadow-sm">
                                                    <label className="small text-muted mb-2">Deduction per wrong answer</label>
                                                    <div className="d-flex gap-2 mb-2">
                                                        {[0.25, 0.33, 0.50].map(val => (
                                                            <button
                                                                key={val}
                                                                className={`btn btn-sm ${settings.negativeMarkingPenalty === val ? 'btn-primary' : 'btn-outline-secondary'}`}
                                                                onClick={() => setSettings({ ...settings, negativeMarkingPenalty: val })}
                                                            >
                                                                {val}
                                                            </button>
                                                        ))}
                                                    </div>
                                                    <div className="input-group input-group-sm">
                                                        <span className="input-group-text">Custom</span>
                                                        <input type="number" step="0.01" className="form-control" value={settings.negativeMarkingPenalty} onChange={(e) => setSettings({ ...settings, negativeMarkingPenalty: parseFloat(e.target.value) })} />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* B. Auto Submit */}
                                <div className="col-md-6">
                                    <div className={`card h-100 border-0 ${settings.autoSubmit ? 'bg-danger bg-opacity-10' : 'bg-light'}`}>
                                        <div className="card-body">
                                            <div className="form-check form-switch">
                                                <input className="form-check-input" type="checkbox" checked={settings.autoSubmit} onChange={e => setSettings({ ...settings, autoSubmit: e.target.checked })} />
                                                <label className="form-check-label fw-bold">Auto Submit on Timeout</label>
                                                {settings.autoSubmit && <i className="bi bi-exclamation-triangle-fill text-danger ms-2" title="High Risk: Submits immediately when time ends"></i>}
                                                <div className="small text-muted mt-1">
                                                    {settings.autoSubmit ? "Proceed with caution. Student work submits instantly at 00:00." : "Student must manually submit (Timer allows overflow)."}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* C. Shuffle */}
                                <div className="col-md-6">
                                    <div className="card h-100 bg-light border-0">
                                        <div className="card-body">
                                            <label className="fw-bold mb-3 d-block">Shuffling Strategy</label>
                                            <div className="form-check form-switch mb-2">
                                                <input className="form-check-input" type="checkbox" checked={settings.shuffleQuestions} onChange={e => setSettings({ ...settings, shuffleQuestions: e.target.checked })} />
                                                <label className="form-check-label">Shuffle Questions</label>
                                            </div>
                                            <div className="form-check form-switch">
                                                <input className="form-check-input" type="checkbox" checked={settings.shuffleOptions} onChange={e => setSettings({ ...settings, shuffleOptions: e.target.checked })} />
                                                <label className="form-check-label">Shuffle Options</label>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* D. Network & Attempts */}
                                <div className="col-md-6">
                                    <div className="card h-100 bg-light border-0">
                                        <div className="card-body">
                                            {/* Network / Resume */}
                                            <div className="mb-4">
                                                <label className="fw-bold mb-2 d-block">Network Disconnect Behavior</label>
                                                <select className="form-select form-select-sm mb-1" value={settings.allowResume ? (settings.networkStrictness || 'strict') : 'none'} onChange={e => {
                                                    const val = e.target.value;
                                                    if (val === 'none') setSettings({ ...settings, allowResume: false });
                                                    else setSettings({ ...settings, allowResume: true, networkStrictness: val });
                                                }}>
                                                    <option value="none">Block Resume (Strict - High Risk)</option>
                                                    <option value="strict">Allow Resume (Timer Continues)</option>
                                                    <option value="lenient">Lenient (Pause Timer on Disconnect)</option>
                                                </select>
                                                <small className="text-muted d-block" style={{ fontSize: '0.75rem' }}>
                                                    {(!settings.allowResume) ? "Students cannot re-enter if internet fails." :
                                                        (settings.networkStrictness === 'lenient' ? "Best for practice. Timer pauses." : "Standard for exams. Clock keeps running.")}
                                                </small>
                                            </div>

                                            <div className="form-check form-switch">
                                                <input className="form-check-input" type="checkbox" checked={settings.allowReattempt} onChange={e => setSettings({ ...settings, allowReattempt: e.target.checked })} />
                                                <label className="form-check-label fw-bold">Allow Reattempt</label>
                                            </div>

                                            <div className="mt-2 text-end">
                                                <label className="small text-muted me-2">Max Attempts:</label>
                                                <input
                                                    type="number"
                                                    className="form-control form-control-sm d-inline-block text-center"
                                                    style={{ width: '60px' }}
                                                    value={settings.maxAttempts}
                                                    onChange={(e) => setSettings({ ...settings, maxAttempts: e.target.value })}
                                                    disabled={!settings.allowReattempt}
                                                />
                                                <div className="x-small text-muted mt-1">Recommended: 1 for Final, 2+ for Mocks</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* F. Late Entry */}
                                <div className="col-12">
                                    <div className="card bg-warning bg-opacity-10 border-0">
                                        <div className="card-body d-flex align-items-center justify-content-between">
                                            <div className="form-check form-switch">
                                                <input className="form-check-input" type="checkbox" checked={settings.allowLateEntry} onChange={e => setSettings({ ...settings, allowLateEntry: e.target.checked })} />
                                                <label className="form-check-label fw-bold">Allow Late Entry</label>
                                            </div>
                                            {settings.allowLateEntry && (
                                                <div className="d-flex align-items-center gap-2">
                                                    <span className="small text-muted text-nowrap">Window (mins):</span>
                                                    <input type="number" className="form-control form-control-sm" style={{ width: 80 }} value={settings.lateEntryWindow} onChange={(e) => setSettings({ ...settings, lateEntryWindow: e.target.value })} />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 3. PROCTORING TAB */}
                        {activeTab === 'proctoring' && (
                            <div className="row g-4">
                                <div className="col-12 mb-2">
                                    <div className={`form-check form-switch p-3 rounded border-2 ${proctoring.enabled ? 'border-primary bg-primary bg-opacity-10' : 'border-light'}`}>
                                        <input className="form-check-input ms-0 me-3" type="checkbox" checked={proctoring.enabled} onChange={e => setProctoring({ ...proctoring, enabled: e.target.checked })} style={{ float: 'none', width: '3em', height: '1.5em' }} />
                                        <label className="form-check-label fw-bold h5 mb-0 align-middle">Enable Proctoring System</label>
                                        <div className="small text-muted mt-1">Enables system checks, camera requirements and violation tracking.</div>
                                    </div>
                                </div>

                                {proctoring.enabled && (
                                    <>
                                        {/* A & B. Hardware */}
                                        <div className="col-md-6">
                                            <div className="card h-100 border-danger border-opacity-25 bg-danger bg-opacity-10">
                                                <div className="card-body">
                                                    <h6 className="fw-bold text-danger mb-3"><i className="bi bi-camera-video me-2"></i>Hardware Access</h6>

                                                    <div className="d-flex flex-column gap-3">
                                                        <div className="form-check form-switch">
                                                            <input className="form-check-input" type="checkbox" checked={proctoring.cameraRequired} onChange={e => setProctoring({ ...proctoring, cameraRequired: e.target.checked })} />
                                                            <label className="form-check-label">Camera Required</label>
                                                        </div>
                                                        <div className="form-check form-switch">
                                                            <input className="form-check-input" type="checkbox" checked={proctoring.microphoneRequired} onChange={e => setProctoring({ ...proctoring, microphoneRequired: e.target.checked })} />
                                                            <label className="form-check-label">Microphone Required</label>
                                                        </div>
                                                        <div className="p-2 bg-white rounded border-start border-4 border-danger">
                                                            <div className="form-check form-switch">
                                                                <input className="form-check-input" type="checkbox" checked={proctoring.cameraMonitoring} onChange={e => setProctoring({ ...proctoring, cameraMonitoring: e.target.checked })} />
                                                                <label className="form-check-label fw-bold text-danger">Continuous Monitoring <i className="bi bi-eye-fill ms-1"></i></label>
                                                            </div>
                                                            <small className="d-block text-muted mt-1 x-small">Takes snapshots every 10s. High Bandwidth.</small>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* D & E. Violations */}
                                        <div className="col-md-6">
                                            <div className="card h-100 border-warning border-opacity-25 bg-warning bg-opacity-10">
                                                <div className="card-body">
                                                    <h6 className="fw-bold text-dark mb-3"><i className="bi bi-exclamation-triangle me-2"></i>Violations & Limits</h6>

                                                    <div className="mb-3">
                                                        <label className="small fw-bold d-flex justify-content-between">
                                                            Max Violations (Auto Block)
                                                            {parseInt(proctoring.maxViolations) <= 2 && <span className="badge bg-danger">Strict</span>}
                                                        </label>
                                                        <div className="d-flex align-items-center gap-2">
                                                            <input type="range" className="form-range" min="1" max="10" value={proctoring.maxViolations} onChange={(e) => setProctoring({ ...proctoring, maxViolations: e.target.value })} />
                                                            <span className="fw-bold h5 mb-0">{proctoring.maxViolations}</span>
                                                        </div>
                                                    </div>

                                                    <div className="p-2 bg-white rounded border-start border-4 border-warning">
                                                        <label className="small fw-bold mb-1">Tab Switching Policy</label>
                                                        <div className="d-flex align-items-center gap-3">
                                                            <div className="input-group input-group-sm w-auto">
                                                                <span className="input-group-text">Limit</span>
                                                                <input type="number" className="form-control" style={{ maxWidth: '60px' }} value={proctoring.maxTabSwitches} onChange={(e) => setProctoring({ ...proctoring, maxTabSwitches: e.target.value })} />
                                                            </div>
                                                            <div className="form-check form-switch mb-0">
                                                                <input className="form-check-input" type="checkbox" checked={proctoring.blockOnTabSwitch} onChange={e => setProctoring({ ...proctoring, blockOnTabSwitch: e.target.checked })} />
                                                                <label className="form-check-label small fw-bold text-danger">Auto Terminate</label>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* F, G, H. Environment */}
                                        <div className="col-12">
                                            <div className="card bg-light border-0">
                                                <div className="card-body">
                                                    <h6 className="fw-bold mb-3">Environment Security</h6>
                                                    <div className="row g-3">
                                                        <div className="col-md-4">
                                                            <div className="form-check form-switch">
                                                                <input className="form-check-input" type="checkbox" checked={proctoring.forceFullScreen} onChange={e => setProctoring({ ...proctoring, forceFullScreen: e.target.checked })} />
                                                                <label className="form-check-label">Force Full Screen</label>
                                                                {proctoring.forceFullScreen && <span className="badge bg-secondary ms-2 small">Rec.</span>}
                                                            </div>
                                                        </div>
                                                        <div className="col-md-4">
                                                            <div className="form-check form-switch">
                                                                <input className="form-check-input" type="checkbox" checked={proctoring.disableCopyPaste} onChange={e => setProctoring({ ...proctoring, disableCopyPaste: e.target.checked })} />
                                                                <label className="form-check-label">Disable Copy/Paste</label>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-4 d-flex align-items-center gap-2">
                                                            <label className="small fw-bold text-nowrap">Device:</label>
                                                            <select className="form-select form-select-sm" value={proctoring.deviceRestriction} onChange={(e) => setProctoring({ ...proctoring, deviceRestriction: e.target.value })}>
                                                                <option value="any">Any Device</option>
                                                                <option value="desktop">Desktop / Laptop Only</option>
                                                                <option value="mobile">Mobile Only</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}

                        {/* 4. GRADING & RESULTS TAB */}
                        {activeTab === 'grading' && (
                            <div className="row g-4">
                                <div className="col-md-6">
                                    <h6 className="fw-bold text-uppercase text-muted small ls-1 mb-3">Evaluation</h6>
                                    <div className="card bg-light border-0">
                                        <div className="card-body">
                                            <div className="form-check form-switch mb-3">
                                                <input className="form-check-input" type="checkbox" checked={settings.autoEvaluation} onChange={e => setSettings({ ...settings, autoEvaluation: e.target.checked })} />
                                                <label className="form-check-label fw-bold">Auto Evaluation</label>
                                                <div className="small text-muted">For MCQs and objective answers</div>
                                            </div>
                                            <div className="form-check form-switch">
                                                <input className="form-check-input" type="checkbox" checked={settings.partialMarking} onChange={e => setSettings({ ...settings, partialMarking: e.target.checked })} />
                                                <label className="form-check-label fw-bold">Partial Marking</label>
                                                <div className="small text-muted">Award marks for partially correct answers</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="col-md-6">
                                    <h6 className="fw-bold text-uppercase text-muted small ls-1 mb-3">Results Display</h6>
                                    <div className="card bg-light border-0">
                                        <div className="card-body">
                                            <div className="form-check form-switch mb-3">
                                                <input className="form-check-input" type="checkbox" checked={settings.showResults} onChange={e => setSettings({ ...settings, showResults: e.target.checked })} />
                                                <label className="form-check-label fw-bold">Show Result Instantly</label>
                                            </div>

                                            {settings.showResults && (
                                                <div className="mb-3">
                                                    <label className="small fw-bold mb-2">Analysis Level</label>
                                                    <div className="btn-group w-100" role="group">
                                                        <input type="radio" className="btn-check" name="resView" id="rv1" checked={settings.resultView === 'score'} onChange={() => setSettings({ ...settings, resultView: 'score' })} />
                                                        <label className="btn btn-outline-primary btn-sm" htmlFor="rv1">Score Only</label>

                                                        <input type="radio" className="btn-check" name="resView" id="rv2" checked={settings.resultView === 'score_correct'} onChange={() => setSettings({ ...settings, resultView: 'score_correct' })} />
                                                        <label className="btn btn-outline-primary btn-sm" htmlFor="rv2">+ Answers</label>

                                                        <input type="radio" className="btn-check" name="resView" id="rv3" checked={settings.resultView === 'full'} onChange={() => setSettings({ ...settings, resultView: 'full' })} />
                                                        <label className="btn btn-outline-primary btn-sm" htmlFor="rv3">Full Review</label>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="d-flex gap-3 mt-3">
                                                <div className="form-check">
                                                    <input className="form-check-input" type="checkbox" checked={settings.showRank} onChange={e => setSettings({ ...settings, showRank: e.target.checked })} />
                                                    <label className="form-check-label text-muted small">Show Rank</label>
                                                </div>
                                                <div className="form-check">
                                                    <input className="form-check-input" type="checkbox" checked={settings.showPercentile} onChange={e => setSettings({ ...settings, showPercentile: e.target.checked })} />
                                                    <label className="form-check-label text-muted small">Show Percentile</label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 5. NOTIFICATIONS & ACCESS TAB */}
                        {activeTab === 'notify' && (
                            <div className="row g-4">
                                <div className="col-md-6">
                                    <div className="card h-100 bg-info bg-opacity-10 border-0">
                                        <div className="card-body">
                                            <h6 className="fw-bold text-dark mb-3"><i className="bi bi-bell me-2"></i>Notifications</h6>
                                            <div className="form-check form-switch mb-3">
                                                <input className="form-check-input" type="checkbox" checked={settings.scheduledNotification} onChange={e => setSettings({ ...settings, scheduledNotification: e.target.checked })} />
                                                <label className="form-check-label">Send Scheduled Notification</label>
                                            </div>
                                            <div className="mb-3">
                                                <label className="small fw-bold">Reminder Before Exam</label>
                                                <select className="form-select form-select-sm" value={settings.examReminder} onChange={(e) => setSettings({ ...settings, examReminder: parseInt(e.target.value) })}>
                                                    <option value={0}>No Reminder</option>
                                                    <option value={15}>15 Minutes Before</option>
                                                    <option value={60}>1 Hour Before</option>
                                                    <option value={1440}>24 Hours Before</option>
                                                </select>
                                            </div>
                                            <div className="form-check form-switch">
                                                <input className="form-check-input" type="checkbox" checked={settings.collectFeedback} onChange={e => setSettings({ ...settings, collectFeedback: e.target.checked })} />
                                                <label className="form-check-label">Collect Feedback after Exam</label>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="col-md-6">
                                    <div className="card h-100 bg-light border-0">
                                        <div className="card-body">
                                            <h6 className="fw-bold text-dark mb-3"><i className="bi bi-person-wheelchair me-2"></i>Accessibility</h6>
                                            <p className="small text-muted mb-3">
                                                Ensure your exam is accessible to all students.
                                            </p>
                                            <div className="form-check form-switch">
                                                <input className="form-check-input" type="checkbox" checked={settings.screenReader} onChange={e => setSettings({ ...settings, screenReader: e.target.checked })} />
                                                <label className="form-check-label fw-bold">Screen Reader Optimization</label>
                                                <div className="small text-muted mt-1">Enables ARIA labels and simplified navigation structure.</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div> {/* Close tab-content */}
                </div> {/* Close p-4 p-md-5 */}
            </div> {/* Close glass-card overflow-hidden */}

            <div className="glass-card mt-3 p-4 d-flex justify-content-end gap-3 bg-white">
                <button className="filter-pill px-5 py-2 fw-bold text-muted border-0" onClick={() => onComplete(null)}>
                    Discard
                </button>
                <button className="btn btn-primary rounded-pill px-5 py-2 fw-bold shadow-sm" onClick={validateAndContinue}>
                    Continue to Builder <i className="bi bi-arrow-right ms-2"></i>
                </button>
            </div>
        </div>
    );
};

export default SetupMode;
