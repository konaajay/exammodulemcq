import React, { useState, useEffect } from 'react';
import { courseService } from '../services/courseService';
import { 
    BookOpen, Plus, Trash2, CheckCircle, 
    AlertCircle, Search, Layers, RefreshCw 
} from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';

const ManageCourses = () => {
    const [courses, setCourses] = useState([]);
    const [newCourse, setNewCourse] = useState({ name: '', description: '' });
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        setLoading(true);
        try {
            const data = await courseService.getAllCourses();
            setCourses(data || []);
        } catch (e) {
            toast.error("Failed to load courses.");
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!newCourse.name.trim()) return;
        
        try {
            await courseService.createCourse(newCourse);
            toast.success("Course added successfully!");
            setNewCourse({ name: '', description: '' });
            fetchCourses();
        } catch (e) {
            toast.error(e.response?.data || "Failed to create course.");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure? This may affect linked students and exams.")) return;
        try {
            await courseService.deleteCourse(id);
            toast.success("Course removed.");
            fetchCourses();
        } catch (e) {
            toast.error("Failed to delete course.");
        }
    };

    const filteredCourses = courses.filter(c => 
        c.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="container py-5 mt-4">
            <ToastContainer position="top-right" autoClose={3000} />
            
            <div className="max-w-1000 mx-auto">
                <div className="d-flex justify-content-between align-items-center mb-5">
                    <div>
                        <h2 className="fw-bold text-dark mb-1 d-flex align-items-center gap-2">
                            <Layers className="text-primary" /> Curriculum Manager
                        </h2>
                        <p className="text-muted small mb-0">Define and organize courses for student enrollment and assessments</p>
                    </div>
                    <button onClick={fetchCourses} className="btn btn-light border shadow-sm rounded-pill p-2">
                        <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>

                <div className="row g-4">
                    {/* Create Course Form */}
                    <div className="col-md-4">
                        <div className="card border-0 shadow-sm rounded-4 overflow-hidden position-sticky" style={{ top: '100px' }}>
                            <div className="card-header bg-white border-bottom p-4">
                                <h5 className="mb-0 fw-bold d-flex align-items-center gap-2">
                                    <Plus className="text-success" /> New Course
                                </h5>
                            </div>
                            <form onSubmit={handleCreate} className="card-body p-4 bg-white">
                                <div className="mb-3">
                                    <label className="form-label fw-bold small text-secondary">COURSE NAME</label>
                                    <input 
                                        className="form-control form-control-lg border-light-subtle" 
                                        placeholder="e.g., React Mastery" 
                                        required
                                        value={newCourse.name}
                                        onChange={e => setNewCourse({...newCourse, name: e.target.value})}
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="form-label fw-bold small text-secondary">DESCRIPTION (OPTIONAL)</label>
                                    <textarea 
                                        className="form-control border-light-subtle" 
                                        rows="3" 
                                        placeholder="Brief overview of the curriculum..."
                                        value={newCourse.description}
                                        onChange={e => setNewCourse({...newCourse, description: e.target.value})}
                                    ></textarea>
                                </div>
                                <button type="submit" className="btn btn-primary w-100 btn-lg rounded-pill fw-bold shadow-sm">
                                    Create Course
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Course List */}
                    <div className="col-md-8">
                        <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                            <div className="card-header bg-white border-bottom p-4">
                                <div className="input-group">
                                    <span className="input-group-text bg-light border-0"><Search size={18} className="text-muted" /></span>
                                    <input 
                                        className="form-control bg-light border-0" 
                                        placeholder="Search defined courses..."
                                        value={search}
                                        onChange={e => setSearch(e.target.value)}
                                    />
                                </div>
                            </div>
                            
                            <div className="card-body p-0">
                                {loading && <div className="p-5 text-center text-muted">Updating curriculum list...</div>}
                                {!loading && filteredCourses.length === 0 && (
                                    <div className="p-5 text-center">
                                        <BookOpen size={40} className="text-light-emphasis mb-3 opacity-25" />
                                        <p className="text-muted">No courses defined yet. Start by adding one from the left panel.</p>
                                    </div>
                                )}
                                
                                <div className="list-group list-group-flush">
                                    {filteredCourses.map(course => (
                                        <div key={course.id} className="list-group-item p-4 hover-bg-light transition-all">
                                            <div className="d-flex justify-content-between align-items-center">
                                                <div className="d-flex align-items-center gap-3">
                                                    <div className="bg-primary-subtle p-3 rounded-3 text-primary">
                                                        <BookOpen size={24} />
                                                    </div>
                                                    <div>
                                                        <h5 className="fw-bold mb-1">{course.name}</h5>
                                                        <p className="text-muted small mb-0">{course.description || "No description provided."}</p>
                                                    </div>
                                                </div>
                                                <button 
                                                    onClick={() => handleDelete(course.id)}
                                                    className="btn btn-outline-danger border-0 rounded-circle p-2 hover-bg-danger-subtle"
                                                >
                                                    <Trash2 size={20} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .max-w-1000 { max-width: 1000px; }
                .hover-bg-light:hover { background: #f8f9fa; }
                .transition-all { transition: all 0.2s ease; }
                .animate-spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default ManageCourses;
