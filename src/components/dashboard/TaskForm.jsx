import React from 'react';
import { X } from 'lucide-react';
import dayjs from 'dayjs';

export default function TaskForm({
  editingTask,
  taskForm,
  selectedProject,
  onFormChange,
  onSubmit,
  onCancel
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">{editingTask !== null ? 'تعديل المهمة' : 'إضافة مهمة جديدة'}</h3>
          <button onClick={onCancel}>
            <X className="text-gray-500" />
          </button>
        </div>
        <form onSubmit={onSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-1">عنوان المهمة</label>
            <input
              type="text"
              className="w-full p-2 border rounded"
              value={taskForm.title}
              onChange={(e) => onFormChange('title', e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-1">الوصف</label>
            <textarea
              className="w-full p-2 border rounded"
              value={taskForm.description}
              onChange={(e) => onFormChange('description', e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 mb-1">تاريخ البداية</label>
              <input
                type="date"
                className="w-full p-2 border rounded"
                value={taskForm.startDate}
                onChange={(e) => onFormChange('startDate', e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-1">تاريخ الانتهاء</label>
              <input
                type="date"
                className="w-full p-2 border rounded"
                value={taskForm.endDate}
                onChange={(e) => onFormChange('endDate', e.target.value)}
                required
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-1">الأهمية</label>
            <select
              className="w-full p-2 border rounded"
              value={taskForm.priority}
              onChange={(e) => onFormChange('priority', e.target.value)}
            >
              <option value="low">مجدولة</option>
              <option value="medium">عادية</option>
              <option value="high">عاجلة</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-1">المشروع</label>
            <div className="w-full p-2 border rounded bg-gray-100">
              {selectedProject?.name || 'لم يتم اختيار مشروع'}
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              onClick={onCancel}
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              {editingTask !== null ? 'حفظ التعديلات' : 'إضافة'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}