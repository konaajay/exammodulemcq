import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const StatCard = ({
    title,
    value,
    icon: Icon,
    trend,
    trendDirection = 'up',
    trendLabel,
    iconBg,
    iconColor
}) => {
    return (
        <div className="stat-card h-100">
            <div className="stat-card-header">
                <div className="stat-info">
                    <p className="stat-title">{title}</p>
                    <h3 className="stat-value">{value}</h3>
                </div>
                <div
                    className="stat-icon-container"
                    style={{ background: iconBg, color: iconColor }}
                >
                    {Icon && <Icon size={24} />}
                </div>
            </div>
            {trend && (
                <div className="stat-footer">
                    <span className={`stat-trend ${trendDirection === 'up' ? 'trend-up' : 'text-danger'}`}>
                        {trendDirection === 'up' ? <TrendingUp size={16} className="me-1" /> : <TrendingDown size={16} className="me-1" />}
                        {trend}
                    </span>
                    <span className="text-secondary small ms-2">{trendLabel}</span>
                </div>
            )}
        </div>
    );
};

export default StatCard;
