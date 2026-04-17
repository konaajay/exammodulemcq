import { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion } from "framer-motion";
import { Calendar, Clock, Mail, Search, RotateCcw, CheckCircle2, AlertCircle } from "lucide-react";
import { examService } from "../services/examService";
import { batchService } from "../../Batches/services/batchService";
import { courseService } from "../../Courses/services/courseService";

const ExamSchedule = () => {
    const [exams, setExams] = useState([]);
    const [courses, setCourses] = useState([]);
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Search terms
    const [searchTermExam, setSearchTermExam] = useState("");
    const [searchTermCourse, setSearchTermCourse] = useState("");
    const [searchTermBatch, setSearchTermBatch] = useState("");

    // Form data
    const [selectedExam, setSelectedExam] = useState(null);
    const [selectedCourses, setSelectedCourses] = useState([]);
    const [selectedBatches, setSelectedBatches] = useState([]);
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [emailNotify, setEmailNotify] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [examsData, coursesData, batchesData] = await Promise.all([
                examService.getAllExams().catch(() => []),
                courseService.getCourses().catch(() => []),
                batchService.getAllBatches().catch(() => [])
            ]);
            setExams(Array.isArray(examsData) ? examsData : []);
            setCourses(Array.isArray(coursesData) ? coursesData : []);
            setBatches(Array.isArray(batchesData) ? batchesData : []);
        } catch (error) {
            toast.error("Failed to load data");
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setSearchTermExam("");
        setSearchTermCourse("");
        setSearchTermBatch("");
        setSelectedExam(null);
        setSelectedCourses([]);
        setSelectedBatches([]);
        setStartTime("");
        setEndTime("");
        setEmailNotify(false);
    };

    const handleSchedule = async (e) => {
        if (e) e.preventDefault();

        if (!selectedExam) {
            toast.error("Please select a target exam");
            return;
        }

        if (selectedCourses.length === 0 && selectedBatches.length === 0) {
            toast.error("Please select at least one course or batch");
            return;
        }

        if (!startTime) {
            toast.error("Please set a start window");
            return;
        }

        setSubmitting(true);
        try {
            const promises = [];
            const formattedStart = startTime.includes('T') && startTime.length === 16 ? startTime + ":00" : startTime;
            const formattedEnd = endTime && endTime.length === 16 ? endTime + ":00" : endTime;

            // Collect all target batches
            const uniqueBatches = new Set();
            
            // Add directly selected batches
            selectedBatches.forEach(b => uniqueBatches.add(b));

            // Add batches from selected courses
            selectedCourses.forEach(courseId => {
                const courseBatches = batches.filter(b => {
                    const bcId = b.courseId || b.course?.id || b.course?.courseId;
                    return String(bcId) === String(courseId);
                });
                courseBatches.forEach(b => uniqueBatches.add(b.id || b.batchId));
            });

            if (uniqueBatches.size === 0) {
                toast.error("No batches found for the selected targets");
                setSubmitting(false);
                return;
            }

            uniqueBatches.forEach(bId => {
                const batchObj = batches.find(b => String(b.id || b.batchId) === String(bId));
                let cId = batchObj?.courseId || batchObj?.course?.id || batchObj?.course?.courseId;
                
                // Fallback: If cId is missing, try to find it from selectedCourses
                if (!cId && selectedCourses.length > 0) {
                    // This is an educated guess based on what was selected in the UI
                    cId = selectedCourses[0]; 
                }

                if (!cId) {
                    console.error(`Missing courseId for batch ${bId}`);
                    return; // Skip this one
                }

                promises.push(examService.scheduleExam({
                    examId: parseInt(selectedExam.id || selectedExam.examId),
                    courseId: parseInt(cId),
                    batchId: parseInt(bId),
                    startTime: formattedStart,
                    endTime: formattedEnd
                }));
            });

            await Promise.all(promises);
            toast.success("Exam scheduled successfully!");
            handleReset();
        } catch (error) {
            console.error(error);
            toast.error("Failed to schedule exam");
        } finally {
            setSubmitting(false);
        }
    };

    const filteredExams = exams.filter(e => (e.title || '').toLowerCase().includes(searchTermExam.toLowerCase()));
    const filteredCourses = courses.filter(c => (c.courseName || c.name || '').toLowerCase().includes(searchTermCourse.toLowerCase()));
    const filteredBatches = batches.filter(b => (b.batchName || b.name || '').toLowerCase().includes(searchTermBatch.toLowerCase()));

    return (
        <div className="min-vh-100 bg-light py-5 px-3">
            <ToastContainer />
            
            <div className="container" style={{ maxWidth: '850px' }}>
                <header className="text-center mb-5">
                    <h1 className="fw-bold text-dark display-6 mb-2">Schedule Exam</h1>
                    <p className="text-muted fs-5">Set the timing and accessibility parameters for your assessment</p>
                </header>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-5 shadow-sm border p-4 p-md-5"
                >
                    <div className="vstack gap-5">
                        {/* TARGET EXAM */}
                        <section>
                            <label className="text-uppercase fw-bold text-muted small ls-1 mb-3 d-block">Target Exam</label>
                            <div className="position-relative mb-3">
                                <Search className="position-absolute top-50 translate-middle-y ms-3 text-muted opacity-50" size={18} />
                                <input 
                                    type="text" 
                                    className="form-control form-control-lg ps-5 border-light-subtle bg-light bg-opacity-10 rounded-3 shadow-none" 
                                    placeholder="Search exams..." 
                                    value={searchTermExam}
                                    onChange={e => setSearchTermExam(e.target.value)}
                                />
                            </div>
                            <div className="border rounded-3 p-2 bg-light bg-opacity-25 scrollbar-hide" style={{ maxHeight: '150px', overflowY: 'auto' }}>
                                {filteredExams.length === 0 ? (
                                    <div className="py-4 text-center text-muted small">No exams found</div>
                                ) : (
                                    filteredExams.map(exam => {
                                        const isSelected = selectedExam?.id === exam.id || selectedExam?.examId === exam.examId;
                                        return (
                                            <div 
                                                key={exam.id || exam.examId}
                                                onClick={() => setSelectedExam(exam)}
                                                className={`p-2 px-3 mb-1 rounded-2 cursor-pointer transition-all ${isSelected ? 'bg-primary text-white' : 'hover-bg-light text-dark fw-medium'}`}
                                            >
                                                {exam.title}
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </section>

                        {/* SELECT COURSES */}
                        <section>
                            <label className="text-uppercase fw-bold text-muted small ls-1 mb-3 d-block">Select Courses</label>
                            <div className="position-relative mb-3">
                                <Search className="position-absolute top-50 translate-middle-y ms-3 text-muted opacity-50" size={18} />
                                <input 
                                    type="text" 
                                    className="form-control form-control-lg ps-5 border-light-subtle bg-light bg-opacity-10 rounded-3 shadow-none" 
                                    placeholder="Search courses..." 
                                    value={searchTermCourse}
                                    onChange={e => setSearchTermCourse(e.target.value)}
                                />
                            </div>
                            <div className="border rounded-3 p-2 bg-light bg-opacity-25 scrollbar-hide" style={{ maxHeight: '150px', overflowY: 'auto' }}>
                                {filteredCourses.length === 0 ? (
                                    <div className="py-4 text-center text-muted small">No courses found</div>
                                ) : (
                                    filteredCourses.map(course => {
                                        const cId = course.id || course.courseId;
                                        const isSelected = selectedCourses.includes(cId);
                                        return (
                                            <div 
                                                key={cId}
                                                onClick={() => {
                                                    if (isSelected) setSelectedCourses(selectedCourses.filter(id => id !== cId));
                                                    else setSelectedCourses([...selectedCourses, cId]);
                                                }}
                                                className={`p-2 px-3 mb-1 rounded-2 cursor-pointer transition-all d-flex align-items-center justify-content-between ${isSelected ? 'bg-indigo-6 text-white' : 'hover-bg-light text-dark fw-medium'}`}
                                            >
                                                <span>{course.courseName || course.name}</span>
                                                {isSelected && <CheckCircle2 size={16} />}
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </section>

                        {/* SELECT BATCHES */}
                        <section>
                            <label className="text-uppercase fw-bold text-muted small ls-1 mb-3 d-block">Select Batches / Groups</label>
                            <div className="position-relative mb-3">
                                <Search className="position-absolute top-50 translate-middle-y ms-3 text-muted opacity-50" size={18} />
                                <input 
                                    type="text" 
                                    className="form-control form-control-lg ps-5 border-light-subtle bg-light bg-opacity-10 rounded-3 shadow-none" 
                                    placeholder="Search batches..." 
                                    value={searchTermBatch}
                                    onChange={e => setSearchTermBatch(e.target.value)}
                                />
                            </div>
                            <div className="border rounded-3 p-2 bg-light bg-opacity-25 scrollbar-hide" style={{ maxHeight: '150px', overflowY: 'auto' }}>
                                {filteredBatches.length === 0 ? (
                                    <div className="py-4 text-center text-muted small">No batches found</div>
                                ) : (
                                    filteredBatches.map(batch => {
                                        const bId = batch.id || batch.batchId;
                                        const isSelected = selectedBatches.includes(bId);
                                        return (
                                            <div 
                                                key={bId}
                                                onClick={() => {
                                                    if (isSelected) setSelectedBatches(selectedBatches.filter(id => id !== bId));
                                                    else setSelectedBatches([...selectedBatches, bId]);
                                                }}
                                                className={`p-2 px-3 mb-1 rounded-2 cursor-pointer transition-all d-flex align-items-center justify-content-between ${isSelected ? 'bg-success text-white' : 'hover-bg-light text-dark fw-medium'}`}
                                            >
                                                <span>{batch.batchName || batch.name}</span>
                                                {isSelected && <CheckCircle2 size={16} />}
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </section>

                        {/* WINDOWS */}
                        <div className="row g-4">
                            <div className="col-md-6">
                                <label className="text-uppercase fw-bold text-muted small ls-1 mb-2 d-flex align-items-center gap-2">
                                    <Calendar size={14} className="text-primary" /> Start Window
                                </label>
                                <input 
                                    type="datetime-local" 
                                    className="form-control form-control-lg border-light-subtle bg-light bg-opacity-10 rounded-3 shadow-none"
                                    value={startTime}
                                    onChange={e => setStartTime(e.target.value)}
                                />
                            </div>
                            <div className="col-md-6">
                                <label className="text-uppercase fw-bold text-muted small ls-1 mb-2 d-flex align-items-center gap-2">
                                    <Clock size={14} className="text-primary" /> End Window (Optional)
                                </label>
                                <input 
                                    type="datetime-local" 
                                    className="form-control form-control-lg border-light-subtle bg-light bg-opacity-10 rounded-3 shadow-none"
                                    value={endTime}
                                    onChange={e => setEndTime(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* NOTIFICATION */}
                        <div className="p-4 rounded-4 border bg-primary bg-opacity-5 d-flex align-items-center justify-content-between">
                            <div className="d-flex align-items-center gap-3">
                                <div className="icon-box bg-white shadow-sm text-primary rounded-circle" style={{ width: '48px', height: '48px' }}>
                                    <Mail size={22} />
                                </div>
                                <div className="vstack">
                                    <span className="fw-bold text-dark">Email Notifications</span>
                                    <span className="text-muted small">Send automated invites to all enrolled students</span>
                                </div>
                            </div>
                            <div className="form-check form-switch m-0 fs-4">
                                <input 
                                    className="form-check-input cursor-pointer" 
                                    type="checkbox" 
                                    role="switch" 
                                    checked={emailNotify}
                                    onChange={e => setEmailNotify(e.target.checked)}
                                />
                            </div>
                        </div>

                        {/* INFO BOX */}
                        <div className="d-flex align-items-start gap-3 text-muted p-2">
                            <AlertCircle size={18} className="mt-1 flex-shrink-0" />
                            <p className="small mb-0">
                                Students will only be able to start the exam within the specified start window. 
                                Ensure you have properly configured the exam settings first.
                            </p>
                        </div>

                        {/* FOOTER */}
                        <div className="row g-3 pt-3">
                            <div className="col-sm-4">
                                <button 
                                    type="button"
                                    onClick={handleReset}
                                    className="btn btn-outline-secondary w-100 py-3 fw-bold rounded-3 d-flex align-items-center justify-content-center gap-2"
                                >
                                    <RotateCcw size={18} /> Reset Form
                                </button>
                            </div>
                            <div className="col-sm-8">
                                <button 
                                    disabled={submitting}
                                    onClick={handleSchedule}
                                    className="btn btn-primary w-100 py-3 fw-bold rounded-3 shadow d-flex align-items-center justify-content-center gap-2"
                                    style={{ background: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)', border: 'none' }}
                                >
                                    {submitting ? (
                                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                    ) : (
                                        <ChevronRight size={18} />
                                    )}
                                    Confirm Schedule
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            <style>{`
                .ls-1 { letter-spacing: 0.5px; }
                .cursor-pointer { cursor: pointer; }
                .hover-bg-light:hover { background-color: #f8f9fa; }
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
                .bg-indigo-6 { background-color: #4f46e5; }
                .text-indigo-6 { color: #4f46e5; }
                .btn-outline-secondary { border-color: #dee2e6; color: #6c757d; }
                .btn-outline-secondary:hover { background-color: #f8f9fa; border-color: #ced4da; color: #495057; }
                .icon-box { display: flex; align-items: center; justify-content: center; }
            `}</style>
        </div>
    );
};

const ChevronRight = ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="m9 18 6-6-6-6" />
    </svg>
);

export default ExamSchedule;
