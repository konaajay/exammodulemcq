import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FaEye, FaEdit, FaTrash, FaPlus, FaSearch, FaShareAlt, FaCopy } from "react-icons/fa";
import { FiCheckSquare } from "react-icons/fi";
import { FolderX, Loader2, Award, Calendar, BarChart3, Clock, FileText, Rocket, RefreshCw, Link as LinkIcon, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from "recharts";
import { examService } from "../services/examService";
import { toast } from "react-toastify";
import './ExamDashboard.css';

const ExamDashboard = () => {
  const [exams, setExams] = useState([]);
  const [deletedExams, setDeletedExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [renderCharts, setRenderCharts] = useState(false);
  const [filter, setFilter] = useState("total");
  const [searchTerm, setSearchTerm] = useState("");
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => setRenderCharts(true), 150);
      return () => clearTimeout(timer);
    } else {
      setRenderCharts(false);
    }
  }, [loading]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [data, deletedData] = await Promise.all([
        examService.getAllExams(),
        examService.getDeletedExams()
      ]);
      const list = Array.isArray(data) ? data : [];
      list.sort((a, b) => {
        const dateA = a.dateCreated ? new Date(a.dateCreated).getTime() : 0;
        const dateB = b.dateCreated ? new Date(b.dateCreated).getTime() : 0;
        return dateB - dateA;
      });
      setExams(list);
      setDeletedExams(Array.isArray(deletedData) ? deletedData : []);
    } catch (error) {
      toast.error("Failed to fetch exams");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = (examId) => {
    const link = `${window.location.origin}/exams/public/attempt/${examId}`;
    navigator.clipboard.writeText(link);
    setCopiedId(examId);
    toast.success("Exam link copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this exam?")) return;
    try {
      await examService.deleteExam(id);
      const deleted = exams.find(e => e.id === id);
      setExams(exams.filter(e => e.id !== id));
      if (deleted) setDeletedExams([...deletedExams, deleted]);
      toast.success("Exam deleted successfully");
    } catch (error) {
      toast.error("Failed to delete exam");
    }
  };

  const handleRestore = async (id) => {
    if (!window.confirm("Are you sure you want to restore this exam?")) return;
    try {
      await examService.restoreExam(id);
      const restored = deletedExams.find(e => e.id === id);
      setDeletedExams(deletedExams.filter(e => e.id !== id));
      if (restored) setExams([...exams, restored]);
      toast.success("Exam restored successfully");
    } catch (error) {
      toast.error("Failed to restore exam");
    }
  };

  const handleHardDelete = async (id) => {
    if (!window.confirm("Are you sure you want to PERMANENTLY delete this exam? This action cannot be undone.")) return;
    try {
      await examService.hardDeleteExam(id);
      setDeletedExams(deletedExams.filter(e => e.id !== id));
      toast.success("Exam permanently deleted");
    } catch (error) {
      toast.error("Failed to permanently delete exam");
    }
  };

  const stats = useMemo(() => {
    const completed = exams.filter(e => e.status === "completed").length;
    const active = exams.filter(e => e.status === "active" || e.status === "ongoing").length;
    return {
      total: exams.length,
      completed,
      upcoming: exams.length - completed - active,
      active
    };
  }, [exams]);

  const filteredExams = useMemo(() => {
    const q = searchTerm.toLowerCase();
    const sourceList = filter === "deleted" ? deletedExams : exams;

    return sourceList.filter(exam => {
      const status = exam.status?.toLowerCase() || "upcoming";
      const matchesFilter =
        filter === "total" || filter === "deleted" ||
        (filter === "completed" && status === "completed") ||
        (filter === "upcoming" && (status === "upcoming" || status === "scheduled")) ||
        (filter === "active" && (status === "active" || status === "ongoing"));

      const matchesSearch =
        exam.title?.toLowerCase().includes(q) ||
        exam.course?.toLowerCase().includes(q);

      return matchesFilter && matchesSearch;
    });
  }, [exams, deletedExams, filter, searchTerm]);

  const pieData = pieDataMemo(stats);

  const trendData = useMemo(() => {
    const map = {};
    if (exams.length === 0) {
        return [{ name: 'Jan', exams: 0 }, { name: 'Feb', exams: 0 }, { name: 'Mar', exams: 0 }];
    }
    exams.forEach(e => {
      const date = new Date(e.dateCreated);
      if (isNaN(date)) return;
      const m = date.toLocaleString("default", { month: "short" });
      if (!map[m]) map[m] = { name: m, exams: 0 };
      map[m].exams += 1;
    });
    return Object.values(map);
  }, [exams]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 bg-white">
        <div className="text-center">
          <Loader2 className="animate-spin mb-3 text-primary" size={48} />
          <h4 className="fw-light text-secondary">Loading Dashboard Data...</h4>
        </div>
      </div>
    );
  }

  return (
    <div className="exam-dashboard-container pt-2">
        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 0 }}
          animate={{ opacity: 1, y: 0 }}
          className="dashboard-header mb-3"
        >
          <div>
            <h2 className="fw-bold mb-1">Exam Analytics</h2>
            <p className="small text-muted mb-0">Monitor performance and manage assessments</p>
          </div>
          <div className="d-flex gap-2">
            <Link to="../evaluation" className="btn btn-outline-primary btn-sm d-flex align-items-center gap-2 px-3">
              <FiCheckSquare size={14} /> <span>Evaluation</span>
            </Link>
            <Link to="../create-exam" className="btn btn-premium btn-sm d-flex align-items-center gap-2 px-3">
              <FaPlus size={14} /> <span>Create Exam</span>
            </Link>
          </div>
        </motion.div>

        {/* METRICS */}
        <div className="row g-3 mb-4">
          <MetricCard
            title="Total Exams"
            value={stats.total}
            icon={<Award size={22} />}
            iconClass="icon-primary"
            delay={0.1}
          />
          <MetricCard
            title="Active Sessions"
            value={stats.active}
            icon={<Clock size={22} />}
            iconClass="icon-indigo"
            delay={0.2}
          />
          <MetricCard
            title="Completed"
            value={stats.completed}
            icon={<BarChart3 size={22} />}
            iconClass="icon-success"
            delay={0.3}
          />
          <MetricCard
            title="Upcoming"
            value={stats.upcoming}
            icon={<Calendar size={22} />}
            iconClass="icon-warning"
            delay={0.4}
          />
        </div>

        {/* CHARTS */}
        <div className="row g-4 mb-5">
          <div className="col-lg-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className="glass-card p-4 h-100"
            >
              <h5 className="mb-4 fw-bold">Exam Activity Trend</h5>
              <div style={{ height: "320px", width: "100%", position: "relative", minHeight: 320 }}>
                {renderCharts && (
                  <ResponsiveContainer width="99%" height="100%">
                    <AreaChart data={trendData}>
                      <defs>
                        <linearGradient id="colorExams" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="name" stroke="#64748b" fontSize={12} axisLine={false} tickLine={false} dy={10} />
                      <YAxis stroke="#64748b" fontSize={12} axisLine={false} tickLine={false} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)" }}
                      />
                      <Area type="monotone" dataKey="exams" stroke="#6366f1" fillOpacity={1} fill="url(#colorExams)" strokeWidth={3} dot={{ fill: '#6366f1', strokeWidth: 2, r: 4 }} activeDot={{ r: 6, strokeWidth: 0 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </motion.div>
          </div>

          <div className="col-lg-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
              className="glass-card p-4 h-100"
            >
              <h5 className="mb-4 fw-bold">Distribution</h5>
              <div style={{ height: "320px", width: "100%", position: "relative", minHeight: 320 }}>
                {renderCharts && (
                  <ResponsiveContainer width="99%" height="100%">
                    <PieChart>
                      <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={70} outerRadius={90} paddingAngle={8} minAngle={15}>
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)" }}
                      />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </motion.div>
          </div>
        </div>

        {/* LIST TABLE SECTION */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="glass-card overflow-hidden"
        >
          <div className="table-header-filters d-flex flex-column flex-lg-row justify-content-between align-items-center gap-4 p-4">
            <div className="flex-grow-1 w-100" style={{ maxWidth: "450px" }}>
              <div className="position-relative w-100">
                <FaSearch className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
                <input
                  type="text"
                  className="form-control bg-light border-0 ps-5 py-2 rounded-3 text-dark fs-7"
                  placeholder="Search exams or courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="filter-pills-switcher">
                {['total', 'active', 'upcoming', 'completed', 'deleted'].map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`filter-pill ${filter === f ? 'active' : ''}`}
                    >
                        {f}
                    </button>
                ))}
            </div>
          </div>

          <div className="table-responsive">
            <table className="table table-hover mb-0 align-middle">
              <thead>
                <tr className="bg-light bg-opacity-50">
                  <th className="ps-4 py-3 text-muted small text-uppercase fw-bold border-0">ID</th>
                  <th className="py-3 text-muted small text-uppercase fw-bold border-0">Exam Details</th>
                  <th className="py-3 text-muted small text-uppercase fw-bold border-0">Target Audience</th>
                  <th className="py-3 text-muted small text-uppercase fw-bold border-0">Status</th>
                  <th className="pe-4 py-3 text-end text-muted small text-uppercase fw-bold border-0">Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence mode='popLayout'>
                  {filteredExams.length === 0 ? (
                    <motion.tr
                      key="no-data"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <td colSpan="5" className="text-center py-5">
                        <div className="d-flex flex-column align-items-center text-muted">
                          <FolderX size={48} strokeWidth={1.5} className="mb-3 opacity-25" />
                          <p className="mb-0 fw-medium">No results found matching your criteria</p>
                        </div>
                      </td>
                    </motion.tr>
                  ) : (
                    filteredExams.map((exam, idx) => (
                      <motion.tr
                        key={exam.id || idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="border-bottom border-light"
                      >
                        <td className="ps-4 text-muted small font-monospace">#{String(exam.id || 'N/A').slice(-6).toUpperCase()}</td>
                        <td>
                          <div className="fw-bold text-dark">{exam.title}</div>
                          <div className="small text-muted d-flex align-items-center gap-2 mt-1">
                            <Clock size={12} /> {exam.duration}m <span className="text-silver mx-1">|</span> <FileText size={12} /> {exam.totalQuestions || 0} Qs
                          </div>
                        </td>
                        <td className="text-dark">
                          <div className="fw-semibold">{exam.course || 'All Courses'}</div>
                          <div className="small text-muted">{exam.batch || 'Global Batch'}</div>
                        </td>
                        <td>
                          <span className={`status-pill status-${exam.status?.toLowerCase() || 'upcoming'}`}>
                            {exam.status || 'Upcoming'}
                          </span>
                        </td>
                        <td className="pe-4 text-end">
                          <div className="d-flex justify-content-end gap-2">
                            {filter === 'deleted' ? (
                              <>
                                <button onClick={() => handleRestore(exam.id)} className="btn-icon-light text-success" title="Restore">
                                  <RefreshCw size={14} />
                                </button>
                                <button onClick={() => handleHardDelete(exam.id)} className="btn-icon-light text-danger" title="Permanently Delete">
                                  <FaTrash size={14} />
                                </button>
                              </>
                            ) : (
                              <>
                                <button 
                                  onClick={() => handleCopyLink(exam.id)} 
                                  className={`btn-icon-light ${copiedId === exam.id ? 'text-success' : 'text-info'}`}
                                  title="Copy Exam Link"
                                >
                                  {copiedId === exam.id ? <Check size={14} /> : <FaCopy size={14} />}
                                </button>
                                <Link to={`../simulation/mnc-preview/${exam.id}`} className="btn-icon-light text-primary" title="Preview">
                                  <Rocket size={14} />
                                </Link>
                                {exam.status !== "completed" && (
                                  <>
                                    <Link to={`../edit-exam/${exam.id}`} className="btn-icon-light text-warning" title="Edit">
                                      <FaEdit size={14} />
                                    </Link>
                                    <button onClick={() => handleDelete(exam.id)} className="btn-icon-light text-danger" title="Delete">
                                      <FaTrash size={14} />
                                    </button>
                                  </>
                                )}
                              </>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </motion.div>
    </div>
  );
};

const MetricCard = ({ title, value, icon, iconClass, delay }) => (
  <div className="col-6 col-md-3">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="glass-card hover-translate-y"
    >
      <div className="p-4 d-flex align-items-center justify-content-between h-100">
        <div>
          <p className="small text-muted fw-bold text-uppercase mb-1" style={{ fontSize: '0.65rem', letterSpacing: '0.05em' }}>{title}</p>
          <h2 className="fw-bold mb-0 text-dark font-monospace" style={{ fontSize: '1.75rem' }}>{value}</h2>
        </div>
        <div className={`icon-box ${iconClass} shadow-sm`}>
          {icon}
        </div>
      </div>
    </motion.div>
  </div>
);

const pieDataMemo = (stats) => [
  { name: "Completed", value: stats.completed, color: "#10b981" },
  { name: "Upcoming", value: stats.upcoming, color: "#f59e0b" },
  { name: "Active", value: stats.active, color: "#6366f1" },
];

export default ExamDashboard;
