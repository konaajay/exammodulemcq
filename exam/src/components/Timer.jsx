import React, { useState, useEffect } from 'react';

const Timer = ({ initialTime, onTimeUp }) => {
    const [seconds, setSeconds] = useState(initialTime);

    useEffect(() => {
        if (seconds <= 0) {
            onTimeUp();
            return;
        }

        const interval = setInterval(() => {
            setSeconds((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(interval);
    }, [seconds, onTimeUp]);

    const formatTime = (totalSeconds) => {
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className={`fw-bold fs-4 ${seconds < 60 ? 'text-danger' : 'text-primary'}`}>
            {formatTime(seconds)}
        </div>
    );
};

export default Timer;
