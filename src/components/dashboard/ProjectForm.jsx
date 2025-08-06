import React from 'react';
import { X } from 'lucide-react';

export default function ProjectForm({
  editingProject,
  projectForm,
  onFormChange,
  onSubmit,
  onCancel
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">{editingProject !== null ? 'تعديل المشروع' : 'إضافة مشروع جديد'}</h3>
          <button onClick={onCancel}>
            <X className="text-gray-500" />
          </button>
        </div>
        <form onSubmit={onSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-1">اسم المشروع</label>
            <input
              type="text"
              className="w-full p-2 border rounded"
              value={projectForm.name}
              onChange={(e) => onFormChange('name', e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-1">المسؤول</label>
            <input
              type="text"
              className="w-full p-2 border rounded"
              value={projectForm.owner}
              onChange={(e) => onFormChange('owner', e.target.value)}
              required
            />
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
              {editingProject !== null ? 'حفظ التعديلات' : 'إضافة'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}