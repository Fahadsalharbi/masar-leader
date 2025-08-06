import React, { useState, useRef, useEffect } from 'react';
import { Bell, LogOut, Calendar, Clock, Home, CalendarCheck, BarChart2, AlertTriangle } from 'lucide-react';
import dayjs from 'dayjs';

export default function Header({ currentUser, time, onLogout, tasks = [], onIconClick }) { // أضفنا onIconClick كخاصية
  const [showNotifications, setShowNotifications] = useState(false);
  const [activeIcon, setActiveIcon] = useState('home');
  const notificationsRef = useRef(null);
  const buttonRef = useRef(null);

  // حساب المهام القريبة من الانتهاء
  const upcomingTasks = tasks.filter(task => {
    if (!task?.endDate) return false;
    const daysLeft = dayjs(task.endDate).diff(dayjs(), 'day');
    return daysLeft <= 5 && daysLeft >= 0 && task.status !== 'completed';
  });

  // إغلاق القائمة عند النقر خارجها
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (buttonRef.current && 
          notificationsRef.current && 
          !buttonRef.current.contains(event.target) && 
          !notificationsRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleIconClick = (iconName) => {
    setActiveIcon(iconName);
    if (onIconClick) {
      onIconClick(iconName);
    }
  };

  return (
    <header className="flex justify-between items-center bg-white shadow p-4 relative" dir="rtl">
      {/* الجانب الأيمن */}
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold text-green-700">مسار القيادة</h1>
        {currentUser && (
          <div className="flex items-center gap-2 text-gray-600">
            <span>هلا، {currentUser.name}</span>
          </div>
        )}
      </div>

      {/* الأيقونات الوسطى */}
      <div className="flex items-center gap-6 bg-gray-50 rounded-full p-2 shadow-inner">
        <button 
          className={`p-2 rounded-full transition-all ${activeIcon === 'home' ? 'bg-green-100 text-green-600' : 'text-gray-600 hover:text-green-600'}`}
          onClick={() => handleIconClick('home')}
        >
          <Home size={20} />
        </button>
        
        <button 
          className={`p-2 rounded-full transition-all ${activeIcon === 'calendar' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:text-blue-600'}`}
          onClick={() => handleIconClick('calendar')}
        >
          <CalendarCheck size={20} />
        </button>
        
        <button 
          className={`p-2 rounded-full transition-all ${activeIcon === 'reports' ? 'bg-purple-100 text-purple-600' : 'text-gray-600 hover:text-purple-600'}`}
          onClick={() => handleIconClick('reports')}
        >
          <BarChart2 size={20} />
        </button>
      </div>

      {/* الجانب الأيسر */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 text-gray-600">
          <Calendar size={18} />
          <span>{time.format('dddd، D MMMM YYYY')}</span>
        </div>
        
        <div className="flex items-center gap-2 text-gray-600">
          <Clock size={18} />
          <span>{time.format('HH:mm:ss')}</span>
        </div>
        
        <div className="relative" ref={notificationsRef}>
          <button 
            ref={buttonRef}
            className="p-1 text-gray-600 hover:text-green-600 relative"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell size={20} />
            {upcomingTasks.length > 0 && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            )}
          </button>
          
          {showNotifications && (
            <div 
              className="fixed left-4 top-20 w-72 bg-white rounded-md shadow-lg z-50 border border-gray-200 max-h-[60vh] overflow-y-auto"
            >
              <div className="p-3 border-b border-gray-200 bg-green-50 text-green-800 font-medium sticky top-0">
                الإشعارات
              </div>
              
              {upcomingTasks.length > 0 ? (
                upcomingTasks.map((task, index) => (
                  <div key={index} className="p-3 border-b border-gray-100 hover:bg-gray-50">
                    <div className="flex items-start gap-2">
                      <AlertTriangle size={16} className="text-yellow-500 mt-0.5 flex-shrink-0" />
                      <div className="text-right w-full">
                        <p className="font-medium">{task.title}</p>
                        <p className="text-sm text-gray-600">
                          {dayjs(task.endDate).diff(dayjs(), 'day') === 0 
                            ? 'تنتهي اليوم' 
                            : `تبقى ${dayjs(task.endDate).diff(dayjs(), 'day')} يوم`}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          تاريخ الانتهاء: {dayjs(task.endDate).format('DD/MM/YYYY')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-gray-500">
                  لا توجد إشعارات حالياً
                </div>
              )}
            </div>
          )}
        </div>
        
        <button 
          onClick={onLogout}
          className="p-1 text-gray-600 hover:text-red-600"
        >
          <LogOut size={20} />
        </button>
      </div>
    </header>
  );
}