import React, { useEffect, useState } from 'react';

const CountdownTimer = ({ createdAt }) => {
    const [timeLeft, setTimeLeft] = useState('');

    useEffect(() => {
        const intervalId = setInterval(() => {
            const now = new Date();
            const createdDate = new Date(createdAt);
            const deadline = new Date(createdDate.getTime() + 24 * 60 * 60 * 1000); // 24 hours after creation
            const timeRemaining = deadline - now;

            if (timeRemaining > 0) {
                const hours = Math.floor((timeRemaining / (1000 * 60 * 60)) % 24);
                const minutes = Math.floor((timeRemaining / 1000 / 60) % 60);
                const seconds = Math.floor((timeRemaining / 1000) % 60);
                setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
            } else {
                setTimeLeft('Đã hủy');
                clearInterval(intervalId);
            }
        }, 1000);

        return () => clearInterval(intervalId); // Cleanup on component unmount
    }, [createdAt]);

    return (
        <p className={`text-sm uppercase text-gray-600 font-medium ${timeLeft === 'Đã hủy' ? 'text-red-500' : 'text-green-500'}`}>
            Thời gian còn lại: {timeLeft}
        </p>
    );
};

export default CountdownTimer;
