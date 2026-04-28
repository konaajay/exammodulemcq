import React from 'react';
import { ChevronLeft, ChevronRight, Check, BookOpen } from 'lucide-react';

const Palette = ({ 
    total, 
    currentIdx, 
    visited, 
    answers, 
    questions, 
    onSelect 
}) => {
    return (
        <aside className="exam-sidebar bg-light border-start d-flex flex-column shadow-sm overflow-hidden">
            <div className="p-4 border-bottom bg-white">
                <h6 className="fw-bold d-flex align-items-center gap-2 mb-0">
                    <BookOpen size={18} className="text-primary" /> Question Navigator
                </h6>
            </div>

            <div className="flex-grow-1 overflow-auto p-4 custom-scrollbar">
                <div className="question-grid">
                    {questions.map((q, idx) => {
                        const isAnswered = !!answers[q.id];
                        const isVisited = visited.has(idx);
                        const isCurrent = currentIdx === idx;

                        let btnClass = "q-btn ";
                        if (isCurrent) btnClass += "current ";
                        else if (isAnswered) btnClass += "answered ";
                        else if (isVisited) btnClass += "visited ";
                        else btnClass += "default ";

                        return (
                            <button 
                                key={q.id}
                                className={btnClass}
                                onClick={() => onSelect(idx)}
                            >
                                {idx + 1}
                                {isAnswered && <div className="indicator shadow-sm"><Check size={8} strokeWidth={4} /></div>}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="p-4 bg-white border-top mt-auto shadow-sm">
                <div className="vstack gap-2">
                    <div className="d-flex justify-content-between x-small">
                        <span className="text-muted fw-bold">PROGRESS</span>
                        <span className="text-primary fw-bold">
                            {Object.keys(answers).length} / {total}
                        </span>
                    </div>
                    <div className="progress rounded-pill shadow-inner" style={{ height: '6px' }}>
                        <div 
                            className="progress-bar progress-bar-striped progress-bar-animated bg-primary" 
                            style={{ width: `${(Object.keys(answers).length / total) * 100}%` }} 
                        />
                    </div>
                </div>
            </div>
            
            <style>{`
                .exam-sidebar { width: 320px; flex-shrink: 0; }
                .question-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; }
                .q-btn {
                    aspect-ratio: 1;
                    border: none;
                    border-radius: 12px;
                    font-weight: 800;
                    font-size: 0.9rem;
                    position: relative;
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .q-btn.default { background: #ffffff; color: #64748b; border: 2px solid #e2e8f0; }
                .q-btn.visited { background: #fff7ed; color: #f97316; border: 2px solid #fdba74; }
                .q-btn.answered { background: #f0fdf4; color: #16a34a; border: 2px solid #86efac; }
                .q-btn.current { 
                    background: #2563eb; 
                    color: white; 
                    border: 2px solid #2563eb; 
                    transform: scale(1.1); 
                    z-index: 10;
                    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
                }
                .q-btn .indicator {
                    position: absolute;
                    top: -4px;
                    right: -4px;
                    width: 16px;
                    height: 16px;
                    background: #10b981;
                    color: white;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: 2px solid white;
                }
                .q-btn:hover:not(.current) { transform: translateY(-2px); border-color: #cbd5e1; }
                .x-small { font-size: 0.75rem; }
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
            `}</style>
        </aside>
    );
};

export default Palette;
