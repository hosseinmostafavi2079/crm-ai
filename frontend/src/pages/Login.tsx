import React, { useState } from 'react';
import { User, Lock, ArrowLeft, KeyRound, Smartphone, Loader2, AlertCircle } from 'lucide-react';

interface LoginProps {
    onLogin: (role: 'admin' | 'customer') => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [step, setStep] = useState<'phone' | 'password'>('phone');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (step === 'phone') {
        if (phone.length < 11) {
            setError('لطفا شماره موبایل ۱۱ رقمی را کامل وارد کنید.');
            return;
        }

        setIsLoading(true);
        // Simulate network delay
        setTimeout(() => {
            setIsLoading(false);
            
            // Logic: Specific number for Admin, others are Customers
            if(phone === '09130000000' || phone === '09121111111') {
                setStep('password'); // Ask for password
            } else {
                // Customer: Login immediately
                onLogin('customer'); 
            }
        }, 800);
    } else {
        if (!password) {
            setError('لطفا کلمه عبور را وارد کنید.');
            return;
        }
        // Admin Password Verification
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            if (password === 'admin12345') { 
                onLogin('admin');
            } else {
                setError('رمز عبور اشتباه است (پیش‌فرض: admin12345)');
            }
        }, 1000);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-gray-100 font-sans">
      
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
                {step === 'phone' ? 'سیستم یکپارچه فروشگاه و خدمات' : 'ورود مدیریت'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {error && (
                <div className="bg-rose-50 text-rose-600 text-sm p-3 rounded-xl flex items-center gap-2 border border-rose-100 animate-fadeIn">
                    <AlertCircle size={16} />
                    {error}
                </div>
            )}

            {step === 'phone' && (
                <div className="space-y-2 animate-fadeIn">
                    <label className="text-sm font-medium text-gray-700 block">شماره موبایل</label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                            <Smartphone className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                        </div>
                        <input
                            type="tel"
                            value={phone}
                            onChange={(e) => {
                                setPhone(e.target.value.replace(/[^0-9]/g, ''));
                                setError('');
                            }}
                            className="w-full pr-12 pl-4 py-4 bg-white/50 border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-left text-lg font-medium tracking-wide"
                            placeholder="09..."
                            dir="ltr"
                            maxLength={11}
                            autoFocus
                        />
                        <p className="text-[11px] text-gray-400 mt-2 mr-1">
                            * جهت ورود به پنل مدیریت با شماره ۰۹۱۳۰۰۰۰۰۰۰ وارد شوید.
                        </p>
                    </div>
                </div>
            )}

            {step === 'password' && (
                <div className="space-y-4 animate-fadeIn">
                    <div className="flex items-center justify-between">
                         <label className="text-sm font-medium text-gray-700 block">کلمه عبور مدیریت</label>
                         <button 
                            type="button" 
                            onClick={() => { setStep('phone'); setPassword(''); setError(''); }} 
                            className="text-xs text-indigo-600 hover:text-indigo-800 font-medium bg-indigo-50 px-2 py-1 rounded-lg transition-colors"
                         >
                            تغییر شماره
                         </button>
                    </div>
                    
                    <div className="relative group">
                        <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                            <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                        </div>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                setError('');
                            }}
                            className="w-full pr-12 pl-4 py-4 bg-white/50 border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-left text-lg tracking-widest"
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
                    {step === 'phone' ? 'ادامه' : 'ورود به پنل مدیریت'}
                    <ArrowLeft size={18} />
                  </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center border-t border-gray-200/50 pt-6">
             <div className="flex justify-center items-center gap-1 text-xs text-gray-400">
                <Lock size={12} />
                <span>ID 724 CRM v2.0 - Powered by React</span>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;