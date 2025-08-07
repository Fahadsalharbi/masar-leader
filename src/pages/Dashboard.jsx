import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import dayjs from 'dayjs';
import 'dayjs/locale/ar';
import duration from 'dayjs/plugin/duration';
import relativeTime from 'dayjs/plugin/relativeTime';
import Header from '../components/dashboard/Header';
import ProjectList from '../components/dashboard/ProjectList';
import ProjectForm from '../components/dashboard/ProjectForm';
import TaskList from '../components/dashboard/TaskList';
import TaskForm from '../components/dashboard/TaskForm';
import AttachmentViewer from '../components/dashboard/AttachmentViewer';
import CalendarModal from '../components/dashboard/CalendarModal';
import ReportsModal from '../components/dashboard/ReportsModal';
import {
  initDB,
  getProjects,
  saveProject,
  deleteProject,
  getTasks,
  saveTask,
  deleteTask
} from '../services/dbService';

dayjs.locale('ar');
dayjs.extend(duration);
dayjs.extend(relativeTime);

export default function Dashboard() {
  const navigate = useNavigate();
  const [db, setDb] = useState(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [time, setTime] = useState(dayjs());
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showProjectDetails, setShowProjectDetails] = useState(false);
  const [viewedAttachment, setViewedAttachment] = useState(null);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [showReportsModal, setShowReportsModal] = useState(false);
  const [projectForm, setProjectForm] = useState({ name: '', owner: '' });
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    startDate: dayjs().format('YYYY-MM-DD'),
    endDate: '',
    priority: 'medium',
    projectId: '',
    status: 'not-started'
  });

  // تهيئة قاعدة البيانات عند التحميل
  useEffect(() => {
    const initializeDatabase = async () => {
      try {
        const database = await initDB();
        setDb(database);
        
        // تحميل المشاريع والمهام
        const loadedProjects = await getProjects(database);
        const loadedTasks = await getTasks(database);
        
        setProjects(loadedProjects || []);
        setTasks(loadedTasks || []);
      } catch (error) {
        console.error('Failed to initialize DB:', error);
      }
    };

    initializeDatabase();
  }, []);

  // تحقق من صحة المستخدم عند التحميل
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
      navigate('/');
    } else {
      setCurrentUser(user);
      setAuthenticated(true);
    }
  }, [navigate]);

  // تحديث الوقت كل ثانية
  useEffect(() => {
    const timer = setInterval(() => setTime(dayjs()), 1000);
    return () => clearInterval(timer);
  }, []);

  // تسجيل الخروج
  const handleLogout = () => {
    localStorage.removeItem('user');
    setAuthenticated(false);
    setCurrentUser(null);
    navigate('/');
  };

  // دالة التعامل مع النقر على الأيقونات
  const handleIconClick = (iconName) => {
    if (iconName === 'calendar') {
      setShowCalendarModal(true);
      setShowReportsModal(false);
    } else if (iconName === 'reports') {
      setShowReportsModal(true);
      setShowCalendarModal(false);
    } else {
      setShowCalendarModal(false);
      setShowReportsModal(false);
    }
  };

  // إدارة المشاريع
  const handleProjectSubmit = async (e) => {
    e.preventDefault();
    if (!db) return;

    try {
      let updatedProjects;
      if (editingProject !== null) {
        const updatedProject = { ...projectForm, id: projects[editingProject].id };
        await saveProject(db, updatedProject);
        
        updatedProjects = [...projects];
        updatedProjects[editingProject] = updatedProject;
        setProjects(updatedProjects);
        setEditingProject(null);
      } else {
        const newProject = { ...projectForm, id: Date.now() };
        await saveProject(db, newProject);
        
        updatedProjects = [...projects, newProject];
        setProjects(updatedProjects);
        setSelectedProject(newProject);
      }
      
      setProjectForm({ name: '', owner: '' });
      setShowProjectForm(false);
    } catch (error) {
      console.error('Error saving project:', error);
    }
  };

  const handleProjectDelete = async (project) => {
    if (!db) return;

    try {
      const index = projects.findIndex(p => p.id === project.id);
      const projectId = projects[index].id;
      
      // حذف المهام المرتبطة بالمشروع
      const relatedTasks = tasks.filter(task => task.projectId === projectId);
      for (const task of relatedTasks) {
        await deleteTask(db, task.id);
      }
      
      // حذف المشروع
      await deleteProject(db, projectId);
      
      const updatedProjects = projects.filter((_, i) => i !== index);
      setProjects(updatedProjects);
      
      if (selectedProject?.id === projectId) {
        setSelectedProject(null);
      }
      
      const updatedTasks = tasks.filter(task => task.projectId !== projectId);
      setTasks(updatedTasks);
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  const handleProjectClick = (project) => {
    if (selectedProject?.id === project.id) {
      setShowProjectDetails(!showProjectDetails);
    } else {
      setSelectedProject(project);
      setShowProjectDetails(true);
    }
  };

  // إدارة المهام
  const changeTaskStatus = async (taskId, newStatus) => {
    if (!db) return;

    try {
      const updatedTasks = tasks.map(task => {
        if (task.id === taskId) {
          const updatedTask = { ...task, status: newStatus };
          
          if (newStatus === 'cancelled') {
            updatedTask.originalPriority = task.priority;
            updatedTask.priority = 'cancelled';
          } else if (task.originalPriority) {
            updatedTask.priority = task.originalPriority;
          }
          
          // حفظ التغييرات في قاعدة البيانات
          saveTask(db, updatedTask);
          
          return updatedTask;
        }
        return task;
      });
      
      setTasks(updatedTasks);
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const handleTaskSubmit = async (e) => {
    e.preventDefault();
    if (!db || !selectedProject) return;

    try {
      const taskData = {
        ...taskForm,
        projectId: selectedProject.id,
        id: editingTask !== null ? tasks[editingTask].id : Date.now(),
        // الحفاظ على المرفقات الموجودة عند التعديل
        attachments: editingTask !== null ? tasks[editingTask].attachments : [],
        status: taskForm.status
      };

      // حفظ المهمة في قاعدة البيانات
      await saveTask(db, taskData);

      // تحديث حالة المهام
      if (editingTask !== null) {
        const updatedTasks = [...tasks];
        updatedTasks[editingTask] = taskData;
        setTasks(updatedTasks);
        setEditingTask(null);
      } else {
        setTasks([...tasks, taskData]);
      }
      
      // إعادة تعيين النموذج
      setTaskForm({
        title: '',
        description: '',
        startDate: dayjs().format('YYYY-MM-DD'),
        endDate: '',
        priority: 'medium',
        projectId: '',
        status: 'not-started'
      });
      setShowTaskForm(false);
    } catch (error) {
      console.error('Error saving task:', error);
    }
  };

  const handleTaskDelete = async (index) => {
    if (!db) return;

    try {
      const taskToDelete = tasks[index];
      await deleteTask(db, taskToDelete.id);
      
      const updatedTasks = tasks.filter((_, i) => i !== index);
      setTasks(updatedTasks);
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  // إدارة المرفقات
    const handleAttachment = async (e, taskId) => {
      const files = Array.from(e.target.files);
      if (files.length === 0) return;

      try {
        // تحويل الملفات إلى صيغة قابلة للتخزين
        const attachments = await Promise.all(files.map(async (file) => {
          return {
            name: file.name,
            type: file.type,
            size: file.size,
            lastModified: file.lastModified,
            data: await readFileAsArrayBuffer(file)
          };
        }));

        // تحديث حالة المهام
        setTasks(tasks.map(task => {
          if (task.id === taskId) {
            const updatedTask = {
              ...task,
              attachments: [
                ...(task.attachments || []),
                ...attachments
              ]
            };
            
            // حفظ المهمة المحدثة في قاعدة البيانات
            saveTask(db, updatedTask);
            
            return updatedTask;
          }
          return task;
        }));
      } catch (error) {
        console.error('Error handling attachment:', error);
      }
    };

    // دالة مساعدة لقراءة الملف كـ ArrayBuffer
    const readFileAsArrayBuffer = (file) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
      });
    };

  const handleViewAttachment = (attachment) => {
    if (attachment.url) {
      setViewedAttachment(attachment);
      return;
    }

    // إنشاء Blob من البيانات المخزنة
    const blob = new Blob([new Uint8Array(attachment.data)], { type: attachment.type });
    const fileUrl = URL.createObjectURL(blob);
    
    setViewedAttachment({
      ...attachment,
      url: fileUrl
    });
  };

  const handleCloseAttachment = () => {
    if (viewedAttachment?.url) {
      URL.revokeObjectURL(viewedAttachment.url);
    }
    setViewedAttachment(null);
  };

  const removeAttachment = async (taskId, index) => {
    try {
      const taskIndex = tasks.findIndex(task => task.id === taskId);
      if (taskIndex === -1) return;

      const updatedTasks = [...tasks];
      const task = updatedTasks[taskIndex];
      const attachments = [...task.attachments];
      
      // تحرير الذاكرة إذا كان هناك URL
      if (attachments[index]?.url) {
        URL.revokeObjectURL(attachments[index].url);
      }
      
      // إزالة المرفق
      attachments.splice(index, 1);
      
      // تحديث المهمة
      updatedTasks[taskIndex] = {
        ...task,
        attachments
      };
      
      // حفظ التغييرات في قاعدة البيانات
      await saveTask(db, updatedTasks[taskIndex]);
      
      // تحديث الحالة
      setTasks(updatedTasks);
    } catch (error) {
      console.error('Error removing attachment:', error);
    }
  };

  // طباعة المهام والمشاريع
  const handlePrintTask = (task) => {
    const project = projects.find(p => p.id === task.projectId);
    
    const statusText = {
      'completed': 'مكتملة',
      'in-progress': 'قيد التنفيذ',
      'not-started': 'لم تبدأ',
      'cancelled': 'ملغاة'
    };

    const priorityText = {
      'high': 'عاجلة',
      'medium': 'عادية',
      'low': 'مجدولة'
    };

    const printWindow = window.open('', '_blank');
    
    const printContent = `
      <!DOCTYPE html>
      <html dir="rtl">
      <head>
        <meta charset="UTF-8">
        <title>طباعة المهمة - ${task.title}</title>
        <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700&display=swap" rel="stylesheet">
        <style>
          body {
            font-family: 'Tajawal', sans-serif;
            margin: 0;
            padding: 20px;
            background-color: white;
          }
          .print-header {
            text-align: center;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 2px solid #245C36;
          }
          .print-header h1 {
            color: #245C36;
            margin: 0;
            font-size: 22px;
          }
          .print-header p {
            color: #666;
            margin: 5px 0 0;
            font-size: 14px;
          }
          .single-row-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            box-shadow: 0 0 5px rgba(0,0,0,0.05);
          }
          .single-row-table th {
            background-color: #f5f7fa;
            padding: 10px 15px;
            text-align: right;
            border: 1px solid #e0e0e0;
            color: #245C36;
            font-weight: 600;
            width: 15%;
          }
          .single-row-table td {
            padding: 10px 15px;
            border: 1px solid #e0e0e0;
            text-align: right;
          }
          .status-badge {
            display: inline-block;
            padding: 4px 10px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 500;
          }
          .status-completed { background: #e6f7ee; color: #2e7d32; }
          .status-in-progress { background: #fff8e1; color: #d4af37; }
          .status-not-started { background: #f5f5f5; color: #607d8b; }
          .status-cancelled { background: #ffebee; color: #c62828; }
          .priority-high { color: #c62828; font-weight: bold; }
          .priority-medium { color: #d4af37; font-weight: bold; }
          .priority-low { color: #245C36; font-weight: bold; }
          .progress-container {
            display: inline-block;
            width: 100px;
            height: 10px;
            background: #e0e0e0;
            border-radius: 5px;
            margin-left: 10px;
            vertical-align: middle;
            overflow: hidden;
          }
          .progress-bar {
            height: 100%;
            background: linear-gradient(90deg, #245C36, #4CAF50);
            border-radius: 5px;
          }
          .attachments-list {
            margin: 10px 0 0 0;
            padding: 0;
            list-style-type: none;
          }
          .attachments-list li {
            margin-bottom: 5px;
            padding: 5px;
            background: #f9f9f9;
            border-radius: 4px;
          }
          .footer {
            text-align: center;
            margin-top: 20px;
            font-size: 12px;
            color: #777;
            border-top: 1px solid #eee;
            padding-top: 10px;
          }
          @media print {
            body {
              padding: 10mm;
            }
          }
        </style>
      </head>
      <body>
        <div class="print-header">
          <h1>نظام مسار القادة - بطاقة المهمة</h1>
          <p>تاريخ الطباعة: ${new Date().toLocaleDateString('ar-SA')}</p>
        </div>
        
        <table class="single-row-table">
          <tr>
            <th>المشروع</th>
            <td>${project ? project.name : 'غير محدد'}</td>
            <th>المسؤول</th>
            <td>${project ? project.owner : 'غير محدد'}</td>
            <th>عنوان المهمة</th>
            <td colspan="3">${task.title}</td>
          </tr>
          <tr>
            <th>الحالة</th>
            <td>
              <span class="status-badge status-${task.status.replace('-', '')}">
                ${statusText[task.status]}
              </span>
            </td>
            <th>الأولوية</th>
            <td class="priority-${task.priority}">
              ${priorityText[task.priority]}
            </td>
            <th>التقدم</th>
            <td>
              ${calculateTaskProgress(task)}%
              <div class="progress-container">
                <div class="progress-bar" style="width: ${calculateTaskProgress(task)}%"></div>
              </div>
            </td>
          </tr>
          <tr>
            <th>تاريخ البدء</th>
            <td>${dayjs(task.startDate).format('DD/MM/YYYY')}</td>
            <th>تاريخ الانتهاء</th>
            <td>${dayjs(task.endDate).format('DD/MM/YYYY')}</td>
            <th>المدة</th>
            <td>${dayjs(task.endDate).diff(dayjs(task.startDate), 'day')} يوم</td>
          </tr>
          <tr>
            <th>الوصف</th>
            <td colspan="7">${task.description || 'لا يوجد وصف'}</td>
          </tr>
          ${task.attachments.length > 0 ? `
          <tr>
            <th>المرفقات</th>
            <td colspan="7">
              <ul class="attachments-list">
                ${task.attachments.map(att => `
                  <li>
                    ${att.name} (${att.type || 'غير معروف'}) - ${(att.file.size / 1024).toFixed(2)} ك.ب
                  </li>
                `).join('')}
              </ul>
            </td>
          </tr>
          ` : ''}
        </table>
        
        <div class="footer">
          نظام مسار القادة - إصدار ${new Date().getFullYear()}
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

  const handlePrintProject = (project) => {
    const projectTasks = tasks.filter(task => task.projectId === project.id);
    
    const statusText = {
      'completed': 'مكتملة',
      'in-progress': 'قيد التنفيذ',
      'not-started': 'لم تبدأ',
      'cancelled': 'ملغاة'
    };

    const priorityText = {
      'high': 'عاجلة',
      'medium': 'عادية',
      'low': 'مجدولة'
    };

    const printWindow = window.open('', '_blank');
    
    const printContent = `
      <!DOCTYPE html>
      <html dir="rtl">
      <head>
        <meta charset="UTF-8">
        <title>طباعة المشروع - ${project.name}</title>
        <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700&display=swap" rel="stylesheet">
        <style>
          body {
            font-family: 'Tajawal', sans-serif;
            margin: 0;
            padding: 20px;
            background-color: white;
          }
          .print-header {
            text-align: center;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 2px solid #245C36;
          }
          .print-header h1 {
            color: #245C36;
            margin: 0;
            font-size: 22px;
          }
          .print-header p {
            color: #666;
            margin: 5px 0 0;
            font-size: 14px;
          }
          .single-row-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            box-shadow: 0 0 5px rgba(0,0,0,0.05);
          }
          .single-row-table th {
            background-color: #f5f7fa;
            padding: 10px 15px;
            text-align: right;
            border: 1px solid #e0e0e0;
            color: #245C36;
            font-weight: 600;
            width: 15%;
          }
          .single-row-table td {
            padding: 10px 15px;
            border: 1px solid #e0e0e0;
            text-align: right;
          }
          .status-badge {
            display: inline-block;
            padding: 4px 10px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 500;
          }
          .status-completed { background: #e6f7ee; color: #2e7d32; }
          .status-in-progress { background: #fff8e1; color: #d4af37; }
          .status-not-started { background: #f5f5f5; color: #607d8b; }
          .status-cancelled { background: #ffebee; color: #c62828; }
          .priority-high { color: #c62828; font-weight: bold; }
          .priority-medium { color: #d4af37; font-weight: bold; }
          .priority-low { color: #245C36; font-weight: bold; }
          .progress-container {
            display: inline-block;
            width: 100px;
            height: 10px;
            background: #e0e0e0;
            border-radius: 5px;
            margin-left: 10px;
            vertical-align: middle;
            overflow: hidden;
          }
          .progress-bar {
            height: 100%;
            background: linear-gradient(90deg, #245C36, #4CAF50);
            border-radius: 5px;
          }
          .tasks-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
            box-shadow: 0 0 5px rgba(0,0,0,0.05);
          }
          .tasks-table th {
            background-color: #f5f7fa;
            padding: 8px 12px;
            text-align: right;
            border: 1px solid #e0e0e0;
            color: #245C36;
            font-weight: 600;
          }
          .tasks-table td {
            padding: 8px 12px;
            border: 1px solid #e0e0e0;
            text-align: right;
          }
          .footer {
            text-align: center;
            margin-top: 20px;
            font-size: 12px;
            color: #777;
            border-top: 1px solid #eee;
            padding-top: 10px;
          }
          @media print {
            body {
              padding: 10mm;
            }
          }
        </style>
      </head>
      <body>
        <div class="print-header">
          <h1>نظام مسار القادة - بطاقة المشروع</h1>
          <p>تاريخ الطباعة: ${new Date().toLocaleDateString('ar-SA')}</p>
        </div>
        
        <table class="single-row-table">
          <tr>
            <th>اسم المشروع</th>
            <td colspan="3">${project.name}</td>
            <th>المسؤول</th>
            <td>${project.owner}</td>
          </tr>
          <tr>
            <th>تاريخ الإنشاء</th>
            <td>${dayjs(project.createdAt).format('DD/MM/YYYY')}</td>
            <th>عدد المهام</th>
            <td>${projectTasks.length}</td>
            <th>التقدم العام</th>
            <td>
              ${calculateProjectProgress(project.id)}%
              <div class="progress-container">
                <div class="progress-bar" style="width: ${calculateProjectProgress(project.id)}%"></div>
              </div>
            </td>
          </tr>
          ${project.description ? `
          <tr>
            <th>وصف المشروع</th>
            <td colspan="5">${project.description}</td>
          </tr>
          ` : ''}
        </table>
        
        <h3 style="color: #245C36; margin: 25px 0 10px; border-bottom: 1px solid #eee; padding-bottom: 8px;">
          مهام المشروع (${projectTasks.length})
        </h3>
        
        <table class="tasks-table">
          <thead>
            <tr>
              <th width="25%">المهمة</th>
              <th width="15%">الحالة</th>
              <th width="15%">الأولوية</th>
              <th width="15%">التقدم</th>
              <th width="15%">تاريخ البدء</th>
              <th width="15%">تاريخ الانتهاء</th>
            </tr>
          </thead>
          <tbody>
            ${projectTasks.map(task => `
              <tr>
                <td>${task.title}</td>
                <td>
                  <span class="status-badge status-${task.status.replace('-', '')}">
                    ${statusText[task.status]}
                  </span>
                </td>
                <td class="priority-${task.priority}">
                  ${priorityText[task.priority]}
                </td>
                <td>
                  ${calculateTaskProgress(task)}%
                  <div class="progress-container">
                    <div class="progress-bar" style="width: ${calculateTaskProgress(task)}%"></div>
                  </div>
                </td>
                <td>${dayjs(task.startDate).format('DD/MM/YYYY')}</td>
                <td>${dayjs(task.endDate).format('DD/MM/YYYY')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="footer">
          نظام مسار القادة - إصدار ${new Date().getFullYear()}
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

  const handlePrintAllProjects = () => {
    if (projects.length === 0) {
      alert('لا توجد مشاريع للطباعة');
      return;
    }

    const statusText = {
      'completed': 'مكتملة',
      'in-progress': 'قيد التنفيذ',
      'not-started': 'لم تبدأ',
      'cancelled': 'ملغاة'
    };

    const priorityText = {
      'high': 'عاجلة',
      'medium': 'عادية',
      'low': 'مجدولة'
    };

    const printWindow = window.open('', '_blank');
    
    const printContent = `
      <!DOCTYPE html>
      <html dir="rtl">
      <head>
        <meta charset="UTF-8">
        <title>طباعة كافة المشاريع مع المهام</title>
        <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700&display=swap" rel="stylesheet">
        <style>
          body {
            font-family: 'Tajawal', sans-serif;
            margin: 0;
            padding: 20px;
            background-color: white;
          }
          .print-header {
            text-align: center;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 2px solid #245C36;
          }
          .print-header h1 {
            color: #245C36;
            margin: 0;
            font-size: 22px;
          }
          .print-header p {
            color: #666;
            margin: 5px 0 0;
            font-size: 14px;
          }
          .project-card {
            margin-bottom: 30px;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          }
          .project-header {
            background-color: #f5f7fa;
            padding: 15px;
            border-bottom: 1px solid #e0e0e0;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .project-title {
            color: #245C36;
            margin: 0;
            font-size: 18px;
            font-weight: 600;
          }
          .project-meta {
            display: flex;
            gap: 15px;
          }
          .project-meta-item {
            display: flex;
            align-items: center;
          }
          .progress-container {
            display: inline-block;
            width: 100px;
            height: 10px;
            background: #e0e0e0;
            border-radius: 5px;
            margin-right: 10px;
            overflow: hidden;
          }
          .progress-bar {
            height: 100%;
            background: linear-gradient(90deg, #245C36, #4CAF50);
            border-radius: 5px;
          }
          .tasks-table {
            width: 100%;
            border-collapse: collapse;
          }
          .tasks-table th {
            background-color: #f8f9fa;
            padding: 10px 15px;
            text-align: right;
            border: 1px solid #e0e0e0;
            color: #245C36;
            font-weight: 600;
          }
          .tasks-table td {
            padding: 10px 15px;
            border: 1px solid #e0e0e0;
            text-align: right;
          }
          .tasks-table tr:nth-child(even) {
            background-color: #f9f9f9;
          }
          .task-description {
            padding: 10px;
            background-color: #f8f8f8;
            border-radius: 5px;
            margin-top: 5px;
            font-size: 14px;
            line-height: 1.5;
            border-right: 3px solid #245C36;
          }
          .status-badge {
            display: inline-block;
            padding: 4px 10px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 500;
          }
          .status-completed { background: #e6f7ee; color: #2e7d32; }
          .status-in-progress { background: #fff8e1; color: #d4af37; }
          .status-not-started { background: #f5f5f5; color: #607d8b; }
          .status-cancelled { background: #ffebee; color: #c62828; }
          .priority-high { color: #c62828; font-weight: bold; }
          .priority-medium { color: #d4af37; font-weight: bold; }
          .priority-low { color: #245C36; font-weight: bold; }
          .footer {
            text-align: center;
            margin-top: 20px;
            font-size: 12px;
            color: #777;
            border-top: 1px solid #eee;
            padding-top: 10px;
          }
          @media print {
            body {
              padding: 10mm;
            }
            .project-card {
              page-break-inside: avoid;
            }
          }
        </style>
      </head>
      <body>
        <div class="print-header">
          <h1>نظام مسار القادة - كافة المشاريع مع المهام</h1>
          <p>تاريخ الطباعة: ${new Date().toLocaleDateString('ar-SA')}</p>
          <p>عدد المشاريع: ${projects.length} | عدد المهام: ${tasks.length}</p>
        </div>
        
        ${projects.map(project => {
          const projectTasks = tasks.filter(task => task.projectId === project.id);
          return `
            <div class="project-card">
              <div class="project-header">
                <h3 class="project-title">${project.name}</h3>
                <div class="project-meta">
                  <div class="project-meta-item">
                    <span>المسؤول: ${project.owner}</span>
                  </div>
                  <div class="project-meta-item">
                    <span>عدد المهام: ${projectTasks.length}</span>
                  </div>
                  <div class="project-meta-item">
                    <span>التقدم: ${calculateProjectProgress(project.id)}%</span>
                    <div class="progress-container">
                      <div class="progress-bar" style="width: ${calculateProjectProgress(project.id)}%"></div>
                    </div>
                  </div>
                </div>
              </div>
              
              ${projectTasks.length > 0 ? `
                <table class="tasks-table">
                  <thead>
                    <tr>
                      <th width="20%">المهمة</th>
                      <th width="10%">الحالة</th>
                      <th width="10%">الأولوية</th>
                      <th width="10%">التقدم</th>
                      <th width="15%">تاريخ البدء</th>
                      <th width="15%">تاريخ الانتهاء</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${projectTasks.map(task => `
                      <tr>
                        <td>${task.title}</td>
                        <td>
                          <span class="status-badge status-${task.status.replace('-', '')}">
                            ${statusText[task.status]}
                          </span>
                        </td>
                        <td class="priority-${task.priority}">
                          ${priorityText[task.priority]}
                        </td>
                        <td>
                          ${calculateTaskProgress(task)}%
                          <div class="progress-container">
                            <div class="progress-bar" style="width: ${calculateTaskProgress(task)}%"></div>
                          </div>
                        </td>
                        <td>${dayjs(task.startDate).format('DD/MM/YYYY')}</td>
                        <td>${dayjs(task.endDate).format('DD/MM/YYYY')}</td>
                      </tr>
                      ${task.description ? `
                        <tr>
                          <td colspan="6" style="padding: 0;">
                            <div class="task-description">
                              <strong>وصف المهمة:</strong> ${task.description}
                            </div>
                          </td>
                        </tr>
                      ` : ''}
                    `).join('')}
                  </tbody>
                </table>
              ` : `
                <div style="padding: 20px; text-align: center; color: #666;">
                  لا توجد مهام لهذا المشروع
                </div>
              `}
            </div>
          `;
        }).join('')}
        
        <div class="footer">
          نظام مسار القادة - إصدار ${new Date().getFullYear()}
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

  // دالة مساعدة لحساب تقدم المهمة
  const calculateTaskProgress = (task) => {
    if (task.status === 'completed') return 100;
    if (task.status === 'cancelled') return 0;
    
    const now = dayjs();
    const start = dayjs(task.startDate);
    const end = dayjs(task.endDate);
    
    if (!start.isValid() || !end.isValid() || end.isBefore(start)) return 0;
    
    const totalDuration = end.diff(start, 'day');
    const elapsedDuration = now.diff(start, 'day');
    
    if (elapsedDuration <= 0) return 0;
    if (elapsedDuration >= totalDuration) return 100;
    
    return Math.round((elapsedDuration / totalDuration) * 100);
  };

  // دالة مساعدة لحساب تقدم المشروع
  const calculateProjectProgress = (projectId) => {
    const projectTasks = tasks.filter(task => task.projectId === projectId);
    if (projectTasks.length === 0) return 0;
    
    const totalProgress = projectTasks.reduce((sum, task) => {
      return sum + calculateTaskProgress(task);
    }, 0);
    
    return Math.round(totalProgress / projectTasks.length);
  };

  const filteredTasks = selectedProject 
    ? tasks.filter(task => task.projectId === selectedProject.id)
    : [];

  return (
    <div className="flex flex-col min-h-screen bg-[#f7f6f2] text-right" dir="rtl">
      <Header 
        currentUser={currentUser} 
        time={time} 
        onLogout={handleLogout} 
        tasks={tasks}
        onIconClick={handleIconClick}
      />

      <main className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 p-4">
        {/* قسم المشاريع */}
        <section className="bg-white p-4 rounded-2xl shadow lg:col-span-1">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-green-800">المشاريع</h2>
            <div className="flex gap-2">
              <button 
                onClick={handlePrintAllProjects}
                className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
              >
                طباعة الكل
              </button>
              <button 
                onClick={() => setShowProjectForm(true)}
                className="flex items-center gap-1 bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
              >
                <Plus size={16} /> إضافة
              </button>
            </div>
          </div>
          
          {showProjectForm && (
            <ProjectForm 
              editingProject={editingProject}
              projectForm={projectForm}
              onFormChange={(field, value) => setProjectForm({...projectForm, [field]: value})}
              onSubmit={handleProjectSubmit}
              onCancel={() => {
                setShowProjectForm(false);
                setEditingProject(null);
                setProjectForm({ name: '', owner: '' });
              }}
            />
          )}

          {projects.length === 0 ? (
            <p className="text-gray-500">لا توجد مشاريع حالياً.</p>
          ) : (
            <ProjectList 
              projects={projects}
              selectedProject={selectedProject}
              showProjectDetails={showProjectDetails}
              filteredTasks={filteredTasks}
              onProjectClick={handleProjectClick}
              onProjectEdit={(project) => {
                const index = projects.findIndex(p => p.id === project.id);
                setProjectForm(projects[index]);
                setEditingProject(index);
                setShowProjectForm(true);
              }}
              onProjectDelete={handleProjectDelete}
              onPrintProject={handlePrintProject}
            />
          )}
        </section>

        {/* قسم المهام */}
        <section className="bg-white p-4 rounded-2xl shadow lg:col-span-3">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-green-800">
              {selectedProject 
                ? `مهام مشروع: ${selectedProject.name}` 
                : 'اختر مشروعاً لعرض مهامه'}
            </h2>
            <button 
              onClick={() => setShowTaskForm(true)}
              className={`flex items-center gap-1 px-3 py-1 rounded ${
                selectedProject 
                  ? 'bg-green-600 text-white hover:bg-green-700' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              disabled={!selectedProject}
            >
              <Plus size={16} /> إضافة مهمة
            </button>
          </div>
          
          {showTaskForm && (
            <TaskForm 
              editingTask={editingTask}
              taskForm={taskForm}
              selectedProject={selectedProject}
              onFormChange={(field, value) => setTaskForm({...taskForm, [field]: value})}
              onSubmit={handleTaskSubmit}
              onCancel={() => {
                setShowTaskForm(false);
                setEditingTask(null);
                setTaskForm({
                  title: '',
                  description: '',
                  startDate: dayjs().format('YYYY-MM-DD'),
                  endDate: '',
                  priority: 'medium',
                  projectId: '',
                  status: 'not-started'
                });
              }}
            />
          )}

          {!selectedProject ? (
            <div className="text-center py-8 text-gray-500">
              <p>الرجاء اختيار مشروع لعرض المهام المرتبطة به</p>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>لا توجد مهام لهذا المشروع حالياً</p>
              <button 
                onClick={() => setShowTaskForm(true)}
                className="mt-2 flex items-center gap-1 bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 mx-auto"
              >
                <Plus size={16} /> إضافة مهمة جديدة
              </button>
            </div>
          ) : (
            <TaskList 
              tasks={filteredTasks}
              onStatusChange={changeTaskStatus}
              onAttachmentAdd={handleAttachment}
              onAttachmentView={handleViewAttachment}
              onAttachmentRemove={removeAttachment}
              onTaskEdit={(index) => {
                const taskToEdit = filteredTasks[index];
                const originalTaskIndex = tasks.findIndex(task => task.id === taskToEdit.id);
                if (originalTaskIndex !== -1) {
                  setTaskForm({
                    ...tasks[originalTaskIndex],
                    id: undefined,
                    attachments: undefined,
                    completed: undefined
                  });
                  setEditingTask(originalTaskIndex);
                  setShowTaskForm(true);
                }
              }}
              onTaskDelete={(index) => {
                const taskToDelete = filteredTasks[index];
                const originalTaskIndex = tasks.findIndex(task => task.id === taskToDelete.id);
                if (originalTaskIndex !== -1) {
                  handleTaskDelete(originalTaskIndex);
                }
              }}
              onTaskPrint={handlePrintTask}
            />
          )}
        </section>
      </main>

      {viewedAttachment && (
        <AttachmentViewer 
          attachment={viewedAttachment}
          onClose={handleCloseAttachment}
        />
      )}

      {/* نافذة التقويم المنبثقة */}
      {showCalendarModal && (
        <CalendarModal 
          tasks={tasks}
          projects={projects}
          onClose={() => setShowCalendarModal(false)}
        />
      )}

      {/* نافذة التقارير المنبثقة */}
      {showReportsModal && (
        <ReportsModal 
          tasks={tasks}
          projects={projects}
          onClose={() => setShowReportsModal(false)}
        />
      )}
    </div>
  );
}
