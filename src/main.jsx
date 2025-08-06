import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import './styles/index.css';

// دالة للتحقق من المصادقة
const checkAuth = () => {
  const user = localStorage.getItem('user');
  return !!user;
};

// حماية المسارات
const ProtectedRoute = ({ children }) => {
  if (!checkAuth()) {
    return <Login />;
  }
  return children;
};

const router = createBrowserRouter([
  {
    path: '/',
    element: <Login />,
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ),
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);