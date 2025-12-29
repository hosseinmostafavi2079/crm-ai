import React, { useState } from 'react';
import { Lock, ArrowLeft, Smartphone, Loader2, AlertCircle, UserCheck } from 'lucide-react';
import api from '../api/axios';

interface LoginProps {
    onLogin: (role: 'admin' | 'customer') => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [step, setStep] = useState<'phone' | 'password'>('phone');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // لیست شماره‌هایی که ادمین هستند و نیاز به رمز دارند
  const ADMIN_NUMBERS = ['09123456789'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // --- مرحله اول: بررسی شماره موبایل ---
    if (step === 'phone') {
        if (phone.length < 11 || !phone.startsWith('09')) {
            setError('لطفا شماره موبایل معتبر وارد کنید.');
            return;
        }

        // بررسی اینکه آیا کاربر ادمین است یا مشتری
        if (ADMIN_NUMBERS.includes(phone)) {
            // اگر ادمین بود، برو به مرحله رمز عبور
            setStep('password');
        } else {
            // اگر مشتری بود، مستقیم لاگین کن (بدون رمز)
            handleCustomerLogin();
        }
        return;
    } 
    
    // --- مرحله دوم: احراز هویت ادمین (با رمز) ---
    if (!password) {
        setError('لطفا کلمه عبور را وارد کنید.');
        return;
    }

    setIsLoading(true);

    // بک‌دور برای توسعه (Admin Dev Mode)
    if (phone === '09123456789' && password === 'admin1234') {
        setTimeout(() => {
            localStorage.setItem('access_token', 'dev_mock_token_admin');
            localStorage.setItem('user_phone', phone);
            onLogin('admin');
            setIsLoading(false);
        }, 1000);
        return;
    }

    // تلاش برای لاگین واقعی به سرور (برای ادمین)
    try {
        const response = await api.post('token/', {
            username: phone,
            password: password
        });

        const { access, refresh } = response.data;

        if (access) {
            localStorage.setItem('access_token', access);
            localStorage.setItem('refresh_token', refresh);
            localStorage.setItem('user_phone', phone);
            onLogin('admin');
        } else {
            setError('پاسخ نامعتبر از سرور.');
        }

    } catch (err: any) {
        console.error("Login failed", err);
        if (err.response?.status === 401) {
            setError('رمز عبور اشتباه است.');
        } else {
            // فال‌بک برای حالتی که سرور قطع است اما ادمین می‌خواهد تست کند
            setError('خطا در اتصال به سرور (برای تست لوکال از رمز admin1234 استفاده کنید)');
        }
    } finally {
        setIsLoading(false);
    }
  };

  const handleCustomerLogin = () => {
      setIsLoading(true);
      
      // شبیه‌سازی تاخیر برای تجربه کاربری بهتر
      setTimeout(() => {
          // ذخیره شماره مشتری برای نمایش در پنل
          localStorage.setItem('user_phone', phone);
          
          // هدایت به عنوان مشتری
          onLogin('customer');
          setIsLoading(false);
      }, 800);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-gray-100 font-sans" dir="rtl">
      
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-100 via-white to-blue-50 z-0"></div>
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>

      <div className="w-full max-w-md p-6 relative z-10">
        <div className="bg-white/60 backdrop-blur-xl border border-white/60 rounded-3xl shadow-2xl p-8 transition-all">
          
          <div className="text-center mb-8">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg mx-auto mb-4 transition-colors ${step === 'password' ? 'bg-indigo-600' : 'bg-emerald-500'}`}>
                {step === 'password' ? <Lock className="text-white" /> : <UserCheck className="text-white" />}
            </div>
            <h2 className="text-2xl font-black text-gray-800">آیدی ۷۲۴</h2>
            <p className="text-gray-500 mt-2 text-sm">
                {step === 'phone' ? 'پیگیری سفارشات و خدمات' : `ورود مدیریت (${phone})`}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="bg-rose-50 text-rose-600 p-3 rounded-xl text-sm flex items-center gap-2 border border-rose-100 animate-fadeIn">
                    <AlertCircle size={18} className="shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {step === 'phone' && (
                <div className="space-y-2 animate-fadeIn">
                    <label className="text-sm font-medium text-gray-700 block">شماره موبایل</label>
                    <div className="relative">
                        <Smartphone className="absolute right-4 top-3.5 text-gray-400 h-5 w-5" />
                        <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full pr-12 pl-4 py-3 bg-white/50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 dir-ltr text-left transition-all"
                            placeholder="09..."
                            dir="ltr"
                            maxLength={11}
                            autoFocus
                        />
                    </div>
                    <p className="text-[10px] text-gray-400 pr-1">جهت پیگیری وضعیت دستگاه، شماره تماس خود را وارد کنید.</p>
                </div>
            )}

            {step === 'password' && (
                <div className="space-y-4 animate-fadeIn">
                    <div className="flex justify-between">
                         <label className="text-sm font-medium text-gray-700">کلمه عبور (مدیر)</label>
                         <button type="button" onClick={() => { setStep('phone'); setPassword(''); setError(''); }} className="text-xs text-indigo-600">تغییر شماره</button>
                    </div>
                    <div className="relative">
                        <Lock className="absolute right-4 top-3.5 text-gray-400 h-5 w-5" />
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full pr-12 pl-4 py-3 bg-white/50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 dir-ltr text-left"
                            placeholder="••••••••"
                            autoFocus
                        />
                    </div>
                </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70 transform active:scale-95 ${step === 'password' ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/30' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/30'}`}
            >
              {isLoading ? <Loader2 className="animate-spin" /> : (
                  <>
                    {step === 'phone' ? 'ورود / پیگیری' : 'ورود به پنل مدیریت'}
                    {step === 'phone' && <ArrowLeft size={18} />}
                  </>
              )}
            </button>
          </form>
          
          <div className="mt-6 text-center border-t border-gray-100 pt-4">
              <p className="text-[10px] text-gray-400">سامانه جامع مدیریت خدمات و گارانتی</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;