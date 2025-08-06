import React from 'react';
import { Paperclip, X, Edit, Trash2, Printer } from 'lucide-react';
import StatusIcons from './StatusIcons';
import TimeRemaining from './TimeRemaining';

export default function TaskList({
  tasks,
  onStatusChange,
  onAttachmentAdd,
  onAttachmentView,
  onAttachmentRemove,
  onTaskEdit,
  onTaskDelete,
  onTaskPrint
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b bg-gray-50">
            <th className="p-3 text-center text-sm font-semibold text-gray-600">الحالة</th>
            <th className="p-3 text-center text-sm font-semibold text-gray-600">المهمة</th>
            <th className="p-3 text-center text-sm font-semibold text-gray-600">التقدم</th>
            <th className="p-3 text-center text-sm font-semibold text-gray-600">العداد الزمني</th>
            <th className="p-3 text-center text-sm font-semibold text-gray-600">الأهمية</th>
            <th className="p-3 text-center text-sm font-semibold text-gray-600">المرفقات</th>
            <th className="p-3 text-center text-sm font-semibold text-gray-600">الإجراءات</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task, index) => (
            <tr key={task.id} className={`border-b hover:bg-gray-50 ${
              task.status === 'expired' ? 'bg-red-50' : ''
            }`}>
              <td className="p-3">
                <StatusIcons
                  taskId={task.id}
                  currentStatus={task.status}
                  onChange={onStatusChange}
                />
              </td>
              <td className="p-3">
                <p className={`font-bold ${
                  task.status === 'completed' ? 'line-through text-gray-500' :
                  task.status === 'cancelled' ? 'line-through text-red-500' :
                  task.status === 'expired' ? 'text-red-600' : ''
                }`}>
                  {task.title}
                </p>
                {task.description && (
                  <p className="text-xs text-gray-500 mt-1">{task.description}</p>
                )}
              </td>
              <td className="p-3">
                <TimeRemaining task={task} showProgressBar={true} />
              </td>
              <td className="p-3">
                <TimeRemaining task={task} showText={true} />
              </td>
              <td className="p-3">
                <span className={`px-3 py-1 rounded-full text-xs border ${
                  task.status === 'cancelled' ? 'bg-gray-100 text-gray-800 border-gray-200' :
                  task.priority === 'high' ? 'bg-red-100 text-red-800 border-red-200' :
                  task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                  'bg-green-100 text-green-800 border-green-200'
                }`}>
                  {task.status === 'cancelled' ? 'ملغاة' : 
                  task.priority === 'high' ? 'عاجلة' : 
                  task.priority === 'medium' ? 'عادية' : 'مجدولة'}
                </span>
              </td>
              <td className="p-3">
                <div className="flex flex-col gap-1">
                  <label className="cursor-pointer text-blue-500 hover:text-blue-700 text-sm flex items-center gap-1">
                    <Paperclip size={14} />
                    <span>إضافة مرفق</span>
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => onAttachmentAdd(e, task.id)}
                      multiple
                    />
                  </label>
                  {task.attachments.length > 0 && (
                    <div className="mt-1 space-y-1">
                      {task.attachments.map((file, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs bg-gray-100 p-1 rounded">
                          <span 
                            className="truncate max-w-[100px] cursor-pointer hover:text-blue-500"
                            onClick={() => onAttachmentView(file)}
                          >
                            {file.name}
                          </span>
                          <button 
                            onClick={() => onAttachmentRemove(task.id, idx)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </td>
              <td className="p-3">
                <div className="flex gap-2 justify-end">
                  <button 
                    onClick={() => onTaskEdit(index)}
                    className="text-blue-500 hover:text-blue-700 p-1 rounded-full hover:bg-blue-50"
                    title="تعديل"
                  >
                    <Edit size={16} />
                  </button>
                  <button 
                    onClick={() => onTaskDelete(index)}
                    className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50"
                    title="حذف"
                  >
                    <Trash2 size={16} />
                  </button>
                  <button 
                    onClick={() => onTaskPrint(task)}
                    className="text-purple-500 hover:text-purple-700 p-1 rounded-full hover:bg-purple-50"
                    title="طباعة المهمة"
                  >
                    <Printer size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}