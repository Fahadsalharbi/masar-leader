import React, { useState } from 'react';
import dayjs from 'dayjs';
import 'dayjs/locale/ar';
import { X, Printer, ChevronLeft, ChevronRight } from 'lucide-react';

dayjs.locale('ar');

export default function CalendarModal({ tasks, projects, onClose }) {
  const [currentDate, setCurrentDate] = useState(dayjs());
  
  const currentMonth = currentDate.format('MMMM YYYY');
  const daysInMonth = currentDate.daysInMonth();
  const firstDayOfMonth = currentDate.startOf('month').day();

  // إنشاء مصفوفة الأيام
  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null); // أيام فارغة قبل بداية الشهر
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i); // أيام الشهر
  }

  // تصفية المهام لتجنب التكرار
  const getTasksForDay = (day) => {
    if (!day) return [];
    
    // الحصول على التاريخ الصحيح للشهر الحالي
    const currentYearMonth = currentDate.format('YYYY-MM');
    const currentDateObj = dayjs(`${currentYearMonth}-${day}`);
    
    return tasks.filter(task => {
      if (!task.endDate) return false; // تجاهل المهام بدون تاريخ انتهاء
      
      const endDate = dayjs(task.endDate);
      
      // عرض المهمة فقط إذا كان تاريخ اليوم الحالي يطابق تاريخ انتهاء المهمة
      return currentDateObj.isSame(endDate, 'day');
    });
  };

  // التنقل بين الشهور
  const goToPreviousMonth = () => {
    setCurrentDate(currentDate.subtract(1, 'month'));
  };

  const goToNextMonth = () => {
    setCurrentDate(currentDate.add(1, 'month'));
  };

  const goToCurrentMonth = () => {
    setCurrentDate(dayjs());
  };

  // طباعة التقويم
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    const printContent = `
      <!DOCTYPE html>
      <html dir="rtl">
      <head>
        <meta charset="UTF-8">
        <title>تقويم المهام - ${currentMonth}</title>
        <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700&display=swap" rel="stylesheet">
        <style>
          body {
            font-family: 'Tajawal', sans-serif;
            margin: 0;
            padding: 15px;
          }
          .print-header {
            text-align: center;
            margin-bottom: 20px;
            border-bottom: 2px solid #245C36;
            padding-bottom: 10px;
          }
          .calendar {
            width: 100%;
            border-collapse: collapse;
          }
          .calendar th {
            background-color: #245C36;
            color: white;
            padding: 10px;
            text-align: center;
          }
          .calendar td {
            border: 1px solid #ddd;
            padding: 8px;
            height: 100px;
            vertical-align: top;
          }
          .day-number {
            font-weight: bold;
            margin-bottom: 5px;
          }
          .task-item {
            font-size: 12px;
            margin: 2px 0;
            padding: 2px 4px;
            background-color: #f0f7f1;
            border-radius: 3px;
          }
          .empty-day {
            background-color: #f5f5f5;
          }
          @media print {
            body {
              padding: 10mm;
            }
            .task-item {
              page-break-inside: avoid;
            }
          }
        </style>
      </head>
      <body>
        <div class="print-header">
          <h1>تقويم المهام - ${currentMonth}</h1>
          <p>تاريخ الطباعة: ${dayjs().format('DD/MM/YYYY')}</p>
        </div>
        <table class="calendar">
          <thead>
            <tr>
              <th>الأحد</th>
              <th>الاثنين</th>
              <th>الثلاثاء</th>
              <th>الأربعاء</th>
              <th>الخميس</th>
              <th>الجمعة</th>
              <th>السبت</th>
            </tr>
          </thead>
          <tbody>
            ${Array.from({ length: Math.ceil(days.length / 7) }).map((_, weekIndex) => `
              <tr>
                ${Array.from({ length: 7 }).map((_, dayIndex) => {
                  const day = days[weekIndex * 7 + dayIndex];
                  const dayTasks = getTasksForDay(day);
                  return `
                    <td ${!day ? 'class="empty-day"' : ''}>
                      ${day ? `<div class="day-number">${day}</div>` : ''}
                      ${dayTasks.map(task => `
                        <div class="task-item">
                          <strong>${task.title}</strong><br>
                          <small>${projects.find(p => p.id === task.projectId)?.name || 'غير معروف'}</small>
                        </div>
                      `).join('')}
                    </td>
                  `;
                }).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
          تم الإنشاء بواسطة نظام مسار القيادة
        </div>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(printContent);
    printWindow.document.close();
    
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-auto">
        <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center z-10">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-green-800">تقويم المهام - {currentMonth}</h2>
            <div className="flex gap-2">
              <button 
                onClick={goToPreviousMonth}
                className="p-1 rounded hover:bg-gray-100"
                title="الشهر السابق"
              >
                <ChevronRight size={20} />
              </button>
              <button 
                onClick={goToCurrentMonth}
                className="text-sm px-2 py-1 rounded hover:bg-gray-100"
              >
                الشهر الحالي
              </button>
              <button 
                onClick={goToNextMonth}
                className="p-1 rounded hover:bg-gray-100"
                title="الشهر التالي"
              >
                <ChevronLeft size={20} />
              </button>
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={handlePrint}
              className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
            >
              <Printer size={16} /> طباعة
            </button>
            <button 
              onClick={onClose}
              className="flex items-center gap-1 bg-gray-200 text-gray-800 px-3 py-1 rounded hover:bg-gray-300"
            >
              <X size={16} /> إغلاق
            </button>
          </div>
        </div>
        
        <div className="p-4">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                <th className="bg-green-800 text-white p-1 text-center">الأحد</th>
                <th className="bg-green-800 text-white p-1 text-center">الاثنين</th>
                <th className="bg-green-800 text-white p-1 text-center">الثلاثاء</th>
                <th className="bg-green-800 text-white p-1 text-center">الأربعاء</th>
                <th className="bg-green-800 text-white p-1 text-center">الخميس</th>
                <th className="bg-green-800 text-white p-1 text-center">الجمعة</th>
                <th className="bg-green-800 text-white p-1 text-center">السبت</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: Math.ceil(days.length / 7) }).map((_, weekIndex) => (
                <tr key={weekIndex}>
                  {Array.from({ length: 7 }).map((_, dayIndex) => {
                    const day = days[weekIndex * 7 + dayIndex];
                    const dayTasks = getTasksForDay(day);
                    return (
                      <td 
                        key={dayIndex} 
                        className={`border p-0.5 h-20 align-top ${!day ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
                      >
                        {day && (
                          <>
                            <div className="font-bold text-right p-0.5">{day}</div>
                            <div className="overflow-y-auto max-h-16">
                              {dayTasks.map((task, index) => (
                                <div 
                                  key={index} 
                                  className="text-xs p-1 mb-1 bg-green-50 rounded border border-green-100"
                                >
                                  <div className="font-medium">{task.title}</div>
                                  <div className="text-gray-500 text-xs">
                                    {projects.find(p => p.id === task.projectId)?.name || 'غير معروف'}
                                  </div>
                                  {task.startDate && (
                                    <div className="text-xs text-gray-400">
                                      {dayjs(task.startDate).format('HH:mm')}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}