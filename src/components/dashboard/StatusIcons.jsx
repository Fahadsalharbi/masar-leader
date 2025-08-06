import React from 'react';
import { Clock, X, CheckCircle } from 'lucide-react';

export default function StatusIcons({ taskId, currentStatus, onChange }) {
  const statusOptions = [
    { value: 'not-started', icon: <Clock size={16} />, title: 'لم تبدأ' },
    { value: 'in-progress', icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v4"/><path d="m16 8-4 4-4-4"/><path d="M8 16l4-4 4 4"/><path d="M12 20v-4"/></svg>, title: 'قيد التنفيذ' },
    { value: 'completed', icon: <CheckCircle size={16} />, title: 'مكتملة' },
    { value: 'cancelled', icon: <X size={16} />, title: 'ملغاة' }
  ];

  return (
    <div className="flex gap-1 bg-gray-100 p-1 rounded-full">
      {statusOptions.map(option => (
        <button
          key={option.value}
          onClick={() => onChange(taskId, option.value)}
          className={`p-1 rounded-full ${currentStatus === option.value ? 
            (option.value === 'completed' ? 'text-green-600 bg-green-100' : 
            option.value === 'cancelled' ? 'text-red-600 bg-red-100' : 
            option.value === 'in-progress' ? 'text-yellow-600 bg-yellow-100' : 
            'text-gray-600 bg-gray-200') : 
            'text-gray-400 hover:bg-gray-200'}`}
          title={option.title}
        >
          {option.icon}
        </button>
      ))}
    </div>
  );
}