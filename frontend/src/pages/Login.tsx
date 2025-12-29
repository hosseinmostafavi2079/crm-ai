import React, { useState } from 'react';
import { User, Lock, ArrowLeft, Smartphone, Loader2, AlertCircle, WifiOff } from 'lucide-react';
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (step === 'phone') {
        if (phone.length < 11 || !phone.startsWith('09')) {
            setError('لطفا شماره موبایل معتبر وارد کنید (مثال: 09123456789).');
            return;
        }
        setStep('password');
    } else {
        if (!password) {
            setError('لطفا کلمه عبور را وارد کنید.');
            return;
        }

        setIsLoading(true);

        try {
            // 1. Attempt Real Authentication
            const response = await api.post('token/', {
                username: phone,
                password: password
            });

            // 2. Validate Response
            const { access, refresh, role } = response.data;

            if (!access) {
                throw new Error('توکن امنیتی از سرور دریافت نشد.');
            }

            // 3. Store Tokens
            localStorage.setItem('access_token', access);
            localStorage.setItem('refresh_token', refresh);
            localStorage.setItem('user_phone', phone);

            // 4. Determine Role SECURELY
            // Only assign 'admin' if the API says so, or allow client-side override ONLY IF auth was successful.
            // Note: In a standard Django setup, 'role' might not be sent. 
            // We assume if login is successful with these credentials, they are valid.
            
            // Logic: Use backend role if present, otherwise check if phone matches specific admin list
            const serverRole = role; 
            const isAdminPhone = ['09123456789', '09130000000'].includes(phone);
            
            const finalRole = serverRole || (isAdminPhone ? 'admin' : 'customer');
            
            onLogin(finalRole);

        } catch (err: any) {
            console.error("Login Error:", err);
            
            // 5. Handle Errors Gracefully
            if (err.response) {
                // Server responded with a status code outside 2xx
                if (err.response.status === 401) {
                    setError('رمز عبور یا نام کاربری اشتباه است.');
                } else if (err.response.status === 400) {
                    setError('اطلاعات ارسالی ناقص است.');
                } else if (err.response.status >= 500) {
                    setError('خطای سمت سرور. لطفا با پشتیبانی تماس بگیرید.');
                } else {
                    setError('خطای ناشناخته در برقراری ارتباط.');
                }
            } else if (err.message === 'Network Error') {
                // Network error (Server down / CORS / Internet issue)
                setError('عدم دسترسی به سرور. لطفا اتصال اینترنت یا سرور را بررسی کنید.');
            } else {
                setError(err.message || 'خطایی رخ داده است.');
            }
        } finally {
            setIsLoading(false);
        }
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-gray-100 font-sans" dir="rtl">
      
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-100 via-white to-blue-50 z-0"></div>
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-40 -left-20 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

      {/* Glass Card */}
      <div className="w-full max-w-md p-6 relative z-10">
        <div className="bg-white/60 backdrop-blur-xl border border-white/60 rounded-3xl shadow-2xl p-8 md:p-10 transition-all duration-500">
          
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-300 mx-auto mb-4 transform hover:scale-105 transition-transform">
                <span className="text-white font-bold text-3xl">ID</span>
            </div>
            <h2 className="text-3xl font-black text-gray-800 tracking-tight">آیدی ۷۲۴</h2>
            <p className="text-indigo-600 font-bold text-sm tracking-widest mt-1 uppercase">
                ID 724 CRM
            </p>
            <p className="text-gray-500 mt-4 text-sm">
                {step === 'phone' ? 'سیستم مدیریت یکپارچه' : `خوش آمدید، ${phone}`}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {error && (
                <div className={`text-sm p-4 rounded-xl flex items-start gap-3 border animate-fadeIn ${error.includes('سرور') ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                    {error.includes('سرور') ? <WifiOff size={20} className="shrink-0" /> : <AlertCircle size={20} className="shrink-0" />}
                    <span className="leading-5">{error}</span>
                </div>
            )}

            {step === 'phone' && (
                <div className="space-y-2 animate-fadeIn">
                    <label className="text-sm font-medium text-gray-700 block">شماره موبایل</label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                            <Smartphone className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                        </div>
                        <input
                            type="tel"
                            value={phone}
                            onChange={(e) => {
                                setPhone(e.target.value.replace(/[^0-9]/g, ''));
                                setError('');
                            }}
                            className="w-full pl-12 pr-4 py-4 bg-white/50 border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-left text-lg font-medium tracking-wide"
                            placeholder="0912..."
                            dir="ltr"
                            maxLength={11}
                            autoFocus
                        />
                    </div>
                </div>
            )}

            {step === 'password' && (
                <div className="space-y-4 animate-fadeIn">
                    <div className="flex items-center justify-between">
                         <label className="text-sm font-medium text-gray-700 block">کلمه عبور</label>
                         <button 
                            type="button" 
                            onClick={() => { setStep('phone'); setPassword(''); setError(''); }} 
                            className="text-xs text-indigo-600 hover:text-indigo-800 font-medium bg-indigo-50 px-2 py-1 rounded-lg transition-colors"
                         >
                            تغییر شماره
                         </button>
                    </div>
                    
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                            <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                        </div>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                setError('');
                            }}
                            className="w-full pl-12 pr-4 py-4 bg-white/50 border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-left text-lg tracking-widest"
                            placeholder="••••••••"
                            dir="ltr"
                            autoFocus
                        />
                    </div>
                </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-4 px-4 border border-transparent rounded-2xl shadow-lg shadow-indigo-500/30 text-base font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all transform hover:translate-y-[-2px] active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                  <Loader2 className="animate-spin" size={20} />
              ) : (
                  <>
                    {step === 'phone' ? 'ادامه' : 'ورود به حساب'}
                    <ArrowLeft size={18} className={step === 'phone' ? "hidden" : ""} />
                  </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center border-t border-gray-200/50 pt-6">
             <div className="flex justify-center items-center gap-1 text-xs text-gray-400">
                <Lock size={12} />
                <span>ID 724 CRM v2.1 (Secure Auth)</span>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;