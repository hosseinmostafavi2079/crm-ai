import React, { useState } from 'react';
import { 
  Save, Server, Smartphone, Shield, Database, 
  RefreshCw, CheckCircle, Store, BellRing, Key, Users, Plus, Trash2, X
} from 'lucide-react';

const Settings: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  
  // Admin Management State
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [newAdmin, setNewAdmin] = useState({ name: '', phone: '', password: '' });
  const [admins, setAdmins] = useState([
      { id: 1, name: 'علی رضایی', phone: '09130000000', role: 'مدیر کل' },
      { id: 2, name: 'سارا احمدی', phone: '09121111111', role: 'پشتیبان' }
  ]);

  // Mock State
  const [config, setConfig] = useState({
    storeName: 'آیدی 724',
    managerName: 'علی رضایی',
    phone: '02188889999',
    address: 'تهران، خیابان ولیعصر، پاساژ کامپیوتر',
    autoBackup: true,
    backupFrequency: 'daily', // daily, weekly
    smsApiKey: 'a1b2c3d4e5f6g7h8i9j0',
    smsProvider: 'kavenegar',
    sendSmsOnRepairComplete: true,
    sendSmsOnWarrantyWarning: true,
  });

  const handleSave = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }, 1500);
  };

  const handleAddAdmin = () => {
      if(newAdmin.name && newAdmin.phone && newAdmin.password) {
          setAdmins([...admins, { id: Date.now(), name: newAdmin.name, phone: newAdmin.phone, role: 'ادمین' }]);
          setNewAdmin({ name: '', phone: '', password: '' });
          setIsAdminModalOpen(false);
      }
  };

  const handleRemoveAdmin = (id: number) => {
      setAdmins(admins.filter(a => a.id !== id));
  };

  const ToggleSwitch = ({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) => (
    <button 
      onClick={() => onChange(!checked)}
      className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${checked ? 'bg-indigo-600' : 'bg-gray-300'}`}
    >
      <div 
        className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${checked ? 'translate-x-6' : 'translate-x-0'}`}
      />
    </button>
  );

  return (
    <div className="space-y-6 relative pb-10">
      
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 bg-emerald-600 text-white px-6 py-3 rounded-xl shadow-2xl z-50 flex items-center gap-3 animate-fadeIn">
          <CheckCircle size={20} />
          <span>تنظیمات سیستم با موفقیت ذخیره شد.</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">تنظیمات سیستم</h1>
          <p className="text-gray-500 mt-1">مدیریت اطلاعات فروشگاه، ادمین‌ها و سرویس‌ها</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={isLoading}
          className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? <RefreshCw size={20} className="animate-spin" /> : <Save size={20} />}
          <span>ذخیره تغییرات</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* General Info Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center gap-3 bg-gray-50/50">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
              <Store size={20} />
            </div>
            <h3 className="font-bold text-gray-800">مشخصات فروشگاه</h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">نام فروشگاه</label>
              <input 
                type="text" 
                value={config.storeName}
                onChange={(e) => setConfig({...config, storeName: e.target.value})}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">نام مدیر</label>
                <input 
                  type="text" 
                  value={config.managerName}
                  onChange={(e) => setConfig({...config, managerName: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">شماره تماس</label>
                <input 
                  type="text" 
                  value={config.phone}
                  onChange={(e) => setConfig({...config, phone: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all outline-none"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">آدرس</label>
              <textarea 
                value={config.address}
                onChange={(e) => setConfig({...config, address: e.target.value})}
                rows={2}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all outline-none resize-none"
              />
            </div>
          </div>
        </div>

        {/* Admin Management Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                    <Users size={20} />
                </div>
                <h3 className="font-bold text-gray-800">مدیران و دسترسی‌ها</h3>
            </div>
            <button 
                onClick={() => setIsAdminModalOpen(true)}
                className="text-xs flex items-center gap-1 bg-white border border-gray-200 hover:bg-indigo-50 hover:text-indigo-600 px-3 py-1.5 rounded-lg transition-colors font-medium"
            >
                <Plus size={14} />
                افزودن ادمین
            </button>
          </div>
          <div className="p-0">
             <div className="max-h-[300px] overflow-y-auto">
                 <table className="w-full text-sm">
                     <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
                         <tr>
                             <th className="px-4 py-3 text-right">نام</th>
                             <th className="px-4 py-3 text-right">موبایل</th>
                             <th className="px-4 py-3 text-right">نقش</th>
                             <th className="px-4 py-3 text-right"></th>
                         </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-100">
                         {admins.map(admin => (
                             <tr key={admin.id} className="hover:bg-gray-50/50">
                                 <td className="px-4 py-3 font-medium text-gray-800">{admin.name}</td>
                                 <td className="px-4 py-3 text-gray-600 font-mono text-xs">{admin.phone}</td>
                                 <td className="px-4 py-3">
                                     <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded text-xs">{admin.role}</span>
                                 </td>
                                 <td className="px-4 py-3 text-left">
                                     <button 
                                        onClick={() => handleRemoveAdmin(admin.id)}
                                        className="text-gray-400 hover:text-red-500 transition-colors p-1"
                                     >
                                         <Trash2 size={16} />
                                     </button>
                                 </td>
                             </tr>
                         ))}
                     </tbody>
                 </table>
             </div>
          </div>
        </div>

        {/* Database & Backup Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center gap-3 bg-gray-50/50">
            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
              <Database size={20} />
            </div>
            <h3 className="font-bold text-gray-800">پشتیبان‌گیری و دیتابیس</h3>
          </div>
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-800">پشتیبان‌گیری خودکار</h4>
                <p className="text-xs text-gray-400 mt-1">ذخیره خودکار دیتابیس هر شب ساعت ۰۰:۰۰</p>
              </div>
              <ToggleSwitch checked={config.autoBackup} onChange={(v) => setConfig({...config, autoBackup: v})} />
            </div>
            
            <div className={`space-y-2 transition-opacity ${!config.autoBackup ? 'opacity-50 pointer-events-none' : ''}`}>
              <label className="text-sm font-medium text-gray-700">دوره زمانی</label>
              <select 
                value={config.backupFrequency}
                onChange={(e) => setConfig({...config, backupFrequency: e.target.value})}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all outline-none"
              >
                <option value="daily">روزانه (پیشنهادی)</option>
                <option value="weekly">هفتگی</option>
                <option value="monthly">ماهانه</option>
              </select>
            </div>

            <div className="pt-4 border-t border-gray-100">
               <div className="flex items-center justify-between bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-3">
                     <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                     <span className="text-sm text-gray-600">آخرین بکاپ: ۱۴۰۲/۰۸/۱۵ - ۱۰:۳۰</span>
                  </div>
                  <button className="text-sm text-indigo-600 font-medium hover:bg-indigo-50 px-3 py-1 rounded-lg transition-colors">
                    دانلود
                  </button>
               </div>
            </div>
          </div>
        </div>

        {/* SMS & API Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center gap-3 bg-gray-50/50">
            <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
              <Smartphone size={20} />
            </div>
            <h3 className="font-bold text-gray-800">تنظیمات پیامک (SMS)</h3>
          </div>
          <div className="p-6 space-y-6">
             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">ارائه‌دهنده</label>
                  <select 
                    value={config.smsProvider}
                    onChange={(e) => setConfig({...config, smsProvider: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all outline-none"
                  >
                    <option value="kavenegar">کاوه نگار</option>
                    <option value="melli_payamak">ملی پیامک</option>
                    <option value="ghasedak">قاصدک</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">API Key</label>
                  <div className="relative">
                    <Key className="absolute right-3 top-2.5 text-gray-400 w-4 h-4" />
                    <input 
                      type="password" 
                      value={config.smsApiKey}
                      onChange={(e) => setConfig({...config, smsApiKey: e.target.value})}
                      className="w-full pr-9 pl-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all outline-none text-left"
                      dir="ltr"
                    />
                  </div>
                </div>
             </div>

             <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 flex items-center gap-2">
                     <BellRing size={16} className="text-gray-400" />
                     ارسال پیامک تکمیل تعمیر
                  </span>
                  <ToggleSwitch checked={config.sendSmsOnRepairComplete} onChange={(v) => setConfig({...config, sendSmsOnRepairComplete: v})} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 flex items-center gap-2">
                     <Shield size={16} className="text-gray-400" />
                     هشدار انقضای گارانتی (۳ روز قبل)
                  </span>
                  <ToggleSwitch checked={config.sendSmsOnWarrantyWarning} onChange={(v) => setConfig({...config, sendSmsOnWarrantyWarning: v})} />
                </div>
             </div>
          </div>
        </div>

      </div>

      {/* Add Admin Modal */}
      {isAdminModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h3 className="font-bold text-gray-800">افزودن مدیر جدید</h3>
                    <button onClick={() => setIsAdminModalOpen(false)} className="text-gray-400 hover:text-gray-600 rounded-lg p-1">
                        <X size={20} />
                    </button>
                </div>
                <div className="p-6 space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">نام و نام خانوادگی</label>
                        <input 
                            type="text" 
                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-100 outline-none"
                            value={newAdmin.name}
                            onChange={(e) => setNewAdmin({...newAdmin, name: e.target.value})}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">شماره موبایل</label>
                        <input 
                            type="tel" 
                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-100 outline-none"
                            dir="ltr"
                            placeholder="09..."
                            value={newAdmin.phone}
                            onChange={(e) => setNewAdmin({...newAdmin, phone: e.target.value})}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">رمز عبور</label>
                        <input 
                            type="password" 
                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-100 outline-none"
                            dir="ltr"
                            value={newAdmin.password}
                            onChange={(e) => setNewAdmin({...newAdmin, password: e.target.value})}
                        />
                    </div>
                    <button 
                        onClick={handleAddAdmin}
                        className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors mt-2"
                    >
                        ثبت مدیر
                    </button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
};

export default Settings;