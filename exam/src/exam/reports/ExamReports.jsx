import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FolderX, Search, Download, Printer, Eye, BarChart2, PieChart as PieIcon, FileText, ChevronDown, Award } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, AreaChart, Area
} from "recharts";
import { examService } from "../services/examService";
import { toast, ToastContainer } from "react-toastify";
import { Loader2 } from "lucide-react";

const ExamReports = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [renderCharts, setRenderCharts] = useState(false);
  const [filters, setFilters] = useState({ search: "", exam: "All", startDate: "", endDate: "" });

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const data = await examService.getReports();
      setResults(data || []);
    } catch (error) {
      toast.error("Failed to load analytics data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!loading && results.length > 0) {
      const timer = setTimeout(() => setRenderCharts(true), 150);
      return () => clearTimeout(timer);
    }
  }, [loading, results]);

  const filteredResults = useMemo(() => {
    return results.filter(r => {
      const matchSearch = r.studentName?.toLowerCase().includes(filters.search.toLowerCase()) ||
        r.studentId?.toLowerCase().includes(filters.search.toLowerCase());
      const matchExam = filters.exam === "All" || r.examName === filters.exam;
      let matchDate = true;
      if (filters.startDate) matchDate = new Date(r.examDate) >= new Date(filters.startDate);
      if (filters.endDate) matchDate = matchDate && new Date(r.examDate) <= new Date(filters.endDate);
      return matchSearch && matchExam && matchDate;
    });
  }, [results, filters]);

  const uniqueExams = useMemo(() => [...new Set(results.map(r => r.examName))], [results]);

  const stats = useMemo(() => {
    const total = filteredResults.length;
    const passCount = filteredResults.filter(r => r.passed).length;
    const failCount = total - passCount;
    const avgScore = total > 0 ? Math.round(filteredResults.reduce((a, r) => a + r.score, 0) / total) : 0;

    const ranges = [
      { name: "0-49", count: 0 }, { name: "50-69", count: 0 },
      { name: "70-89", count: 0 }, { name: "90+", count: 0 }
    ];
    filteredResults.forEach(r => {
      if (r.score < 50) ranges[0].count++;
      else if (r.score < 70) ranges[1].count++;
      else if (r.score < 90) ranges[2].count++;
      else ranges[3].count++;
    });

    return { total, passCount, failCount, avgScore, passRate: total ? Math.round((passCount / total) * 100) : 0, ranges };
  }, [filteredResults]);

  if (loading && results.length === 0) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 bg-light text-dark">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  return (
    <div className="exam-container px-3 px-md-4 pt-4">
      <ToastContainer theme="light" />

        {/* Header */}
        <header className="panel-header mb-4 d-flex flex-column flex-md-row justify-content-between align-items-end gap-4">
          <motion.div initial={{ opacity: 0, x: -25 }} animate={{ opacity: 1, x: 0 }}>
            <h1 className="d-flex align-items-center gap-3">
              <BarChart2 className="text-indigo-6" size={42} />
              Analytics Hub
            </h1>
            <p className="panel-sub-header">Comprehensive insights into candidate performance and exam trends</p>
          </motion.div>

          <div className="d-flex gap-3 align-items-center">
            <button className="btn-icon-light shadow-sm" onClick={() => window.print()} title="Print Report">
              <Printer size={18} />
            </button>
            <button className="btn btn-primary rounded-pill px-4 py-2 fw-bold d-flex align-items-center gap-2 premium-btn shadow-sm">
              <Download size={18} /> <span>Export Dataset</span>
            </button>
          </div>
        </header>

        {/* Quick Stats */}
        <div className="row g-4 mb-5">
          <StatCard title="Pass Rate" value={`${stats.passRate}%`} icon={<Award size={24} />} color="#10b981" delay={0.1} />
          <StatCard title="Average Score" value={`${stats.avgScore}%`} icon={<BarChart2 size={24} />} color="#6366f1" delay={0.2} />
          <StatCard title="Candidates" value={stats.total} icon={<FileText size={24} />} color="#f59e0b" delay={0.3} />
          <StatCard title="Qualified" value={stats.passCount} icon={<BarChart2 size={24} />} color="#ec4899" delay={0.4} />
        </div>

        <div className="row g-4 mb-5">
          {/* Main Chart */}
          <div className="col-lg-8">
            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="glass-card p-4 h-100"
            >
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h6 className="fw-bold mb-0 text-dark">Performance Spectrum</h6>
                <div className="text-muted small">Frequency Distribution</div>
              </div>
              <div style={{ width: '100%', height: 350, minHeight: 350, position: 'relative' }}>
                {renderCharts && (
                  <ResponsiveContainer width="99%" height="100%">
                    <AreaChart data={stats.ranges}>
                    <defs>
                      <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={11} axisLine={false} tickLine={false} dy={10} />
                    <YAxis stroke="#64748b" fontSize={11} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                    />
                    <Area type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" dot={{ r: 4, fill: '#6366f1' }} />
                  </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </motion.div>
          </div>

          {/* Filters */}
          <div className="col-lg-4">
            <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="glass-card p-4 h-100"
            >
              <h6 className="fw-bold mb-4 text-dark d-flex align-items-center gap-2">
                <Search size={18} className="text-primary" /> Multi-Filter
              </h6>
              <div className="d-flex flex-column gap-4">
                <div className="filter-group">
                  <label className="exam-label mb-2">Search Candidates</label>
                  <div className="position-relative">
                    <Search className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" size={16} />
                    <input
                      className="exam-form-control ps-5"
                      placeholder="Name or Registration ID..."
                      value={filters.search}
                      onChange={e => setFilters({ ...filters, search: e.target.value })}
                    />
                  </div>
                </div>
                <div className="filter-group">
                  <label className="exam-label mb-2">Target Examination</label>
                  <select
                    className="exam-form-control"
                    value={filters.exam}
                    onChange={e => setFilters({ ...filters, exam: e.target.value })}
                  >
                    <option value="All">Global Overview</option>
                    {uniqueExams.map(ex => <option key={ex} value={ex}>{ex}</option>)}
                  </select>
                </div>
                <div className="row g-3">
                  <div className="col-6">
                    <label className="exam-label mb-2">Since</label>
                    <input type="date" className="exam-form-control"
                      value={filters.startDate} onChange={e => setFilters({ ...filters, startDate: e.target.value })} />
                  </div>
                  <div className="col-6">
                    <label className="exam-label mb-2">Until</label>
                    <input type="date" className="exam-form-control"
                      value={filters.endDate} onChange={e => setFilters({ ...filters, endDate: e.target.value })} />
                  </div>
                </div>
                <button
                  className="filter-pill w-100 py-3 mt-2 fw-bold"
                  onClick={() => setFilters({ search: "", exam: "All", startDate: "", endDate: "" })}
                >
                  Clear All Filters
                </button>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Detailed Table */}
        <div className="glass-card overflow-hidden">
          <div className="table-responsive">
            <table className="table table-hover mb-0 align-middle">
              <thead>
                <tr className="bg-light bg-opacity-50 text-muted small text-uppercase fw-bold">
                  <th className="ps-4 py-3 border-0">Identity</th>
                  <th className="py-3 border-0">Examination Name</th>
                  <th className="py-3 border-0">Attempt Date</th>
                  <th className="py-3 border-0 text-center">Score</th>
                  <th className="py-3 border-0">Evaluation</th>
                  <th className="pe-4 py-3 border-0 text-end">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredResults.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-5">
                      <div className="py-4 d-flex flex-column align-items-center opacity-50">
                        <FolderX size={48} strokeWidth={1.5} className="mb-2" />
                        <p className="mb-0 fw-medium">No records matching selected criteria</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredResults.map(r => (
                    <tr key={r.id}>
                      <td className="ps-4">
                        <div className="d-flex align-items-center gap-3">
                          <div className="avatar-initials text-primary bg-primary bg-opacity-10 border border-primary border-opacity-10">
                            {r.studentName?.charAt(0)}
                          </div>
                          <div>
                            <div className="fw-bold text-dark">{r.studentName}</div>
                            <div className="small text-muted">{r.studentId}</div>
                          </div>
                        </div>
                      </td>
                      <td className="text-dark fw-semibold">{r.examName}</td>
                      <td className="text-muted small">{new Date(r.examDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                      <td className="text-center">
                        <div className="h6 mb-0 fw-bold text-primary">{r.score}%</div>
                      </td>
                      <td>
                        <span className={`status-pill ${r.passed ? 'status-passed' : 'status-failed'}`}>
                          {r.passed ? "Passed" : "Failed"}
                        </span>
                      </td>
                      <td className="pe-4 text-end">
                        <button className="btn-icon-light ms-auto">
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, color, delay }) => (
  <div className="col-6 col-md-3">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="glass-card"
    >
      <div className="p-4 d-flex flex-column flex-sm-row align-items-center gap-3 gap-sm-4 text-center text-sm-start h-100">
        <div className="p-3 rounded-circle d-flex align-items-center justify-content-center" style={{ backgroundColor: `${color}15`, color: color }}>
          {icon}
        </div>
        <div>
          <div className="small text-muted fw-bold text-uppercase tracking-wider mb-1" style={{ fontSize: '0.65rem' }}>{title}</div>
          <div className="h4 fw-bold mb-0 text-dark font-monospace">{value}</div>
        </div>
      </div>
    </motion.div>
  </div>
);

export default ExamReports;
