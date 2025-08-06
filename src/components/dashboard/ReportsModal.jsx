// components/dashboard/ReportsModal.jsx
import React from 'react';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { X, Printer } from 'lucide-react';

dayjs.extend(duration);

export default function ReportsModal({ tasks, projects, onClose }) {
  // حساب الإحصائيات
  const totalProjects = projects.length;
  const totalTasks = tasks.length;
  
  // حساب متوسط وقت إكمال المهام المكتملة
  const completedTasks = tasks.filter(task => task.status === 'completed');
  const avgCompletionTime = completedTasks.length > 0
    ? completedTasks.reduce((sum, task) => {
        const duration = dayjs(task.endDate).diff(dayjs(task.startDate), 'day');
        return sum + duration;
      }, 0) / completedTasks.length
    : 0;

  // حساب توزيع حالات المهام
  const taskStatusDistribution = tasks.reduce((acc, task) => {
    acc[task.status] = (acc[task.status] || 0) + 1;
    return acc;
  }, {});

  // طباعة التقارير
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    const printContent = `
      <!DOCTYPE html>
      <html dir="rtl">
      <head>
        <meta charset="UTF-8">
        <title>التقارير والإحصائيات</title>
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
          .stats-container {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
            margin-top: 20px;
          }
          .stat-card {
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            padding: 20px;
            border: 1px solid #e0e0e0;
          }
          .stat-title {
            color: #245C36;
            font-size: 18px;
            margin: 0 0 10px 0;
            text-align: center;
          }
          .stat-value {
            font-size: 24px;
            font-weight: bold;
            text-align: center;
            margin: 10px 0;
          }
          .stat-description {
            text-align: center;
            color: #666;
          }
          .progress-bar {
            height: 10px;
            background: #e0e0e0;
            border-radius: 5px;
            margin: 15px 0;
            overflow: hidden;
          }
          .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #245C36, #4CAF50);
            border-radius: 5px;
          }
          @media print {
            body {
              padding: 10mm;
              background: white;
            }
            .stat-card {
              box-shadow: none;
              border: 1px solid #ddd;
              page-break-inside: avoid;
            }
          }
        </style>
      </head>
      <body>
        <div class="print-header">
          <h1>التقارير والإحصائيات</h1>
          <p>تاريخ الطباعة: ${dayjs().format('DD/MM/YYYY')}</p>
        </div>
        
        <div class="stats-container">
          <div class="stat-card">
            <h3 class="stat-title">عدد المشاريع</h3>
            <div class="stat-value">${totalProjects}</div>
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${Math.min(100, totalProjects * 10)}%"></div>
            </div>
            <p class="stat-description">إجمالي المشاريع في النظام</p>
          </div>
          
          <div class="stat-card">
            <h3 class="stat-title">عدد المهام</h3>
            <div class="stat-value">${totalTasks}</div>
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${Math.min(100, totalTasks * 2)}%"></div>
            </div>
            <p class="stat-description">إجمالي المهام في النظام</p>
          </div>
          
          <div class="stat-card">
            <h3 class="stat-title">متوسط وقت الإنجاز</h3>
            <div class="stat-value">${avgCompletionTime.toFixed(1)} يوم</div>
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${Math.min(100, avgCompletionTime * 5)}%"></div>
            </div>
            <p class="stat-description">متوسط وقت إكمال المهام المنجزة</p>
          </div>
          
          <div class="stat-card">
            <h3 class="stat-title">توزيع حالات المهام</h3>
            <div style="margin-top: 15px;">
              ${Object.entries(taskStatusDistribution).map(([status, count]) => `
                <div style="margin-bottom: 8px;">
                  <div style="display: flex; justify-content: space-between;">
                    <span>${getStatusText(status)}</span>
                    <span>${count} (${((count / totalTasks) * 100 || 0).toFixed(1)}%)</span>
                  </div>
                  <div class="progress-bar">
                    <div class="progress-fill" style="width: ${((count / totalTasks) * 100 || 0).toFixed(1)}%"></div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
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

  // دالة مساعدة للحصول على نص الحالة
  const getStatusText = (status) => {
    switch(status) {
      case 'completed': return 'مكتملة';
      case 'in-progress': return 'قيد التنفيذ';
      case 'not-started': return 'لم تبدأ';
      case 'cancelled': return 'ملغاة';
      default: return status;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-auto">
        <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold text-green-800">التقارير والإحصائيات</h2>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* بطاقة عدد المشاريع */}
            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <h3 className="text-lg font-semibold text-green-700 text-center">عدد المشاريع</h3>
              <p className="text-4xl font-bold text-center my-4">{totalProjects}</p>
              <div className="h-2 bg-gray-200 rounded-full">
                <div 
                  className="h-full bg-green-600 rounded-full" 
                  style={{ width: `${Math.min(100, totalProjects * 10)}%` }}
                ></div>
              </div>
              <p className="text-gray-600 text-center mt-2">إجمالي المشاريع في النظام</p>
            </div>
            
            {/* بطاقة عدد المهام */}
            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <h3 className="text-lg font-semibold text-green-700 text-center">عدد المهام</h3>
              <p className="text-4xl font-bold text-center my-4">{totalTasks}</p>
              <div className="h-2 bg-gray-200 rounded-full">
                <div 
                  className="h-full bg-green-600 rounded-full" 
                  style={{ width: `${Math.min(100, totalTasks * 2)}%` }}
                ></div>
              </div>
              <p className="text-gray-600 text-center mt-2">إجمالي المهام في النظام</p>
            </div>
            
            {/* بطاقة متوسط وقت الإنجاز */}
            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <h3 className="text-lg font-semibold text-green-700 text-center">متوسط وقت الإنجاز</h3>
              <p className="text-4xl font-bold text-center my-4">
                {avgCompletionTime.toFixed(1)} يوم
              </p>
              <div className="h-2 bg-gray-200 rounded-full">
                <div 
                  className="h-full bg-green-600 rounded-full" 
                  style={{ width: `${Math.min(100, avgCompletionTime * 5)}%` }}
                ></div>
              </div>
              <p className="text-gray-600 text-center mt-2">متوسط وقت إكمال المهام المنجزة</p>
            </div>
            
            {/* بطاقة توزيع حالات المهام */}
            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <h3 className="text-lg font-semibold text-green-700 text-center">توزيع حالات المهام</h3>
              <div className="mt-4 space-y-4">
                {Object.entries(taskStatusDistribution).map(([status, count]) => (
                  <div key={status}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">{getStatusText(status)}</span>
                      <span className="text-sm font-medium">
                        {count} ({((count / totalTasks) * 100 || 0).toFixed(1)}%)
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full">
                      <div 
                        className="h-full bg-green-600 rounded-full" 
                        style={{ width: `${((count / totalTasks) * 100 || 0).toFixed(1)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}