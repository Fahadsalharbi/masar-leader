import React from 'react';
import { X } from 'lucide-react';

export default function AttachmentViewer({ attachment, onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-6 rounded-lg max-w-4xl w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">{attachment.name}</h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>
        <div className="max-h-[80vh] overflow-auto">
          {attachment.type === 'application/pdf' ? (
            <iframe 
              src={attachment.url} 
              className="w-full h-[70vh] border-0"
              title={attachment.name}
              key={attachment.url}
            />
          ) : attachment.type.startsWith('image/') ? (
            <img 
              src={attachment.url} 
              alt={attachment.name} 
              className="max-w-full mx-auto"
            />
          ) : (
            <div className="text-center py-8">
              <p>لا يمكن عرض معاينة لهذا النوع من الملفات</p>
              <a 
                href={attachment.url}
                download={attachment.name}
                className="mt-4 inline-block bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                تنزيل الملف
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}