import React from 'react';
import dayjs from 'dayjs';

export default function TimeRemaining({ task, showProgressBar = false, showText = false }) {
  const calculateTime = () => {
    if (task.status === 'completed') {
      return {
        status: 'completed',
        percentage: 100,
        text: 'انتهت المهمة'
      };
    }
    
    if (task.status === 'cancelled') {
      return {
        status: 'cancelled',
        percentage: 0,
        text: 'ملغاة'
      };
    }

    if (task.status === 'not-started') {
      return {
        status: 'not-started',
        percentage: 0,
        text: 'لم تبدأ بعد'
      };
    }

    const now = dayjs();
    const endDate = dayjs(task.endDate);
    const startDate = dayjs(task.startDate);

    if (!startDate.isValid() || !endDate.isValid() || endDate.isBefore(startDate)) {
      return { status: 'invalid', percentage: 50, text: 'انتهت المدة' };
    }

    const totalDays = endDate.diff(startDate, 'day');
    const elapsedDays = now.diff(startDate, 'day', true);
    let percentage = Math.min(100, (elapsedDays / totalDays) * 100);
    percentage = Math.max(50, percentage);

    return {
      status: 'in-progress',
      percentage: percentage,
      text: `متبقي ${Math.ceil(endDate.diff(now, 'day'))} يوم`
    };
  };

  const timeRemaining = calculateTime();

  return (
    <div>
      {showProgressBar && (
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className={`h-2.5 rounded-full ${
              task.status === 'completed' ? 'bg-green-600' :
              task.status === 'cancelled' ? 'bg-gray-400' :
              task.status === 'in-progress' ? 'bg-yellow-500' :
              timeRemaining.status === 'expired' ? 'bg-red-600' :
              'bg-gray-400'
            }`}
            style={{ width: `${timeRemaining.percentage}%`, transition: 'width 0.5s ease' }}
          ></div>
        </div>
      )}
      {showText && (
        <p className={`text-sm ${
          task.status === 'completed' ? 'text-green-600 font-bold' :  
          timeRemaining.status === 'expired' ? 'text-red-600 font-bold' : 'text-gray-600'
        }`}>
          {timeRemaining.text}
          {showProgressBar && (
            <span className="block text-xs text-gray-500 mt-1">
              {dayjs(task.startDate).format('DD/MM')} - {dayjs(task.endDate).format('DD/MM')}
            </span>
          )}
        </p>
      )}
    </div>
  );
}