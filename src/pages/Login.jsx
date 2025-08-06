import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, Eye, EyeOff, Globe, Building2, Rocket, Landmark } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [shake, setShake] = useState(false);

  // بيانات المستخدمين
  const users = [
    { username: 'FAHAD', password: 'fahad123', name: 'ابو سلطان' },
    { username: 'ABUANAS', password: 'abuanas123', name: 'أبو أنس' }

  ];

  // تأثير اهتزاز عند خطأ
  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    setTimeout(() => {
      const user = users.find(u => 
        u.username === formData.username && 
        u.password === formData.password
      );

      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
        navigate('/dashboard');
      } else {
        setError('اسم المستخدم أو كلمة المرور غير صحيحة');
        triggerShake();
      }
      setIsLoading(false);
    }, 1000);
  };

  // تأثيرات حركية للخلفية
  useEffect(() => {
    document.body.classList.add('login-page');
    return () => document.body.classList.remove('login-page');
  }, []);

  return (
    <div className={`min-h-screen flex items-center justify-center relative overflow-hidden ${shake ? 'animate-shake' : ''}`}>
      
      {/* الخلفية الجديدة - مدينة الرياض مع تدرج أخضر */}
      <div className="absolute inset-0 z-0">
        {/* صورة مدينة الرياض مع تدرج أخضر */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `linear-gradient(to bottom, rgba(0, 100, 50, 0.7), rgba(0, 60, 30, 0.9)), url('https://c4.wallpaperflare.com/wallpaper/724/28/962/city-building-cityscape-mist-wallpaper-preview.jpg')`
          }}
        ></div>
        
        {/* عناصر زخرفية إضافية */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/asfalt-light.png')] opacity-10"></div>
        
      </div>

      {/* كرت تسجيل الدخول */}
      <div className="relative bg-white/90 backdrop-blur-sm rounded-xl shadow-2xl p-8 w-full max-w-md z-10 border border-white/20 transition-all hover:shadow-xl">
        {/* العنوان مع شعار الرؤية */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#005c30] mb-2 animate-fade-in">
            نــظــام مـسـار القادة
          </h1>
          <p className="text-gray-600">إدارة مشاريعك ومهامك</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg animate-fade-in">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* حقل اسم المستخدم */}
          <div className="relative">
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
              <User size={18} />
            </div>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              className="w-full pr-10 pl-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#005c30] focus:border-transparent"
              placeholder="اسم المستخدم"
              required
            />
          </div>

          {/* حقل كلمة المرور */}
          <div className="relative">
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
              <Lock size={18} />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full pr-10 pl-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#005c30] focus:border-transparent"
              placeholder="كلمة المرور"
              required
            />
            <button 
              type="button"
              className="absolute left-3 top-3 text-gray-400 hover:text-gray-600"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* زر الدخول */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 px-4 bg-gradient-to-r from-[#005c30] to-[#003820] text-white rounded-lg font-medium hover:from-[#003820] hover:to-[#005c30] transition-all ${isLoading ? 'opacity-70' : ''}`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                جارٍ التحميل...
              </span>
            ) : 'تسجيل الدخول'}
          </button>
        </form>

        {/* حقوق الملكية */}
        <p className="mt-8 text-center text-sm text-gray-500">
          © 2025 نظام مسار القيادة. جميع الحقوق محفوظة.
        </p>
      </div>
    </div>
  );
};


export default Login;
