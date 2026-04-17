import React from 'react';

const ExamTimer = ({ timeLeft, formatTime }) => {
    return (
        <div className="mnc-timer">
            <span className="timer-label">Time Left:</span>
            <span className="timer-val">{formatTime(timeLeft)}</span>
        </div>
    );
};

export default ExamTimer;
