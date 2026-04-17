import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { RotateCcw, AlertCircle } from "lucide-react";

const ReattemptRules = ({ value, onChange }) => {
  const [attempts, setAttempts] = useState(value ?? 0);

  useEffect(() => {
    onChange?.(attempts);
  }, [attempts, onChange]);

  return (
    <div className="glass-panel p-4 rounded-4 border border-light shadow-sm bg-white text-dark">
      <div className="d-flex align-items-center gap-3 mb-3">
        <div className="p-2 bg-primary bg-opacity-10 rounded-circle text-primary border border-primary border-opacity-10">
          <RotateCcw size={20} />
        </div>
        <div>
          <h6 className="fw-bold mb-0">Reattempt Strategy</h6>
          <div className="small text-muted">Control assessment accessibility</div>
        </div>
      </div>

      <div className="mb-3">
        <label className="form-label text-muted small fw-bold text-uppercase mb-2 ls-1">
          Allowed Retries
        </label>

        <select
          className="form-select bg-light border-light shadow-sm text-dark py-2"
          value={attempts}
          onChange={(e) => setAttempts(Number(e.target.value))}
        >
          <option value={0}>No Reattempts Allowed</option>
          <option value={1}>1 Additional Attempt</option>
          <option value={2}>2 Additional Attempts</option>
          <option value={-1}>Unlimited Attempts</option>
        </select>
      </div>

      <div className="d-flex align-items-center gap-2 p-3 bg-light rounded-3 border border-light small text-muted">
        <AlertCircle size={16} className="flex-shrink-0 text-primary" />
        <span>Rules apply immediately after the initial submission. Best used for mock tests and practice.</span>
      </div>

      <style>{`
        .glass-panel { background: #ffffff; backdrop-filter: blur(12px); border: 1px solid #f1f5f9; }
        .ls-1 { letter-spacing: 0.05em; }
        .bg-black-20 { background: #f8fafc; }
        .bg-white-5 { background: #f8fafc; }
      `}</style>
    </div>
  );
};

export default ReattemptRules;
