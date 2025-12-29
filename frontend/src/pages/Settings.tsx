import React, { useState, useEffect } from 'react';
import { 
  Save, Server, Smartphone, Shield, Database, 
  RefreshCw, CheckCircle, Store, BellRing, Key, Users, Plus, Trash2, X,
  FileSpreadsheet, Activity, Download, History, Clock, FileArchive
} from 'lucide-react';
import * as XLSX from 'xlsx';
import JSZip from 'jszip'; // Now available via importmap
import { DateObject } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

interface LogEntry {
    id: number;
    action: string;
    details: string;
    user: string;
    timestamp: string;
    type: 'create' | 'update' | 'delete' | 'renew' | 'login';
}

const Settings: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  
  // Admin Management State
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [newAdmin, setNewAdmin] = useState({ name: '', phone: '', password: '' });
  const [admins, setAdmins] = useState([
      { id: 1, name: 'علی رضایی', phone: '09130000000', role: 'مدیر کل' },
      { id: 2, name: 'سارا احمدی', phone: '09121111111', role: 'پشتیبان' }
  ]);

  // Logs State
  const [logs, setLogs] = useState<LogEntry[]>([]);

  useEffect(() => {
      const savedLogs = localStorage.getItem('system_logs');
      if (savedLogs) setLogs(JSON.parse(savedLogs));
  }, []);

  // Config State
  const [config, setConfig] = useState({
    storeName: 'آیدی 724',
    managerName: 'علی رضایی',
    phone: '02188889999',
    address: 'تهران، خیابان ولیعصر، پاساژ کامپیوتر',
    autoBackup: true,
    backupFrequency: 'daily',
    autoBackupTime: '23:00' // New: Specific time
  });

  useEffect(() => {
      const savedConfig = localStorage.getItem('app_config');
      if(savedConfig) setConfig(JSON.parse(savedConfig));
  }, []);

  const triggerToast = (msg: string) => {
      setToastMsg(msg);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
  };

  const handleSave = () => {
    setIsLoading(true);
    localStorage.setItem('app_config', JSON.stringify(config));
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      triggerToast('تنظیمات سیستم با موفقیت ذخیره شد.');
    }, 1500);
  };

  // --- ZIP BACKUP LOGIC ---
  const handleFullSystemBackup = async () => {
      setIsLoading(true);
      
      try {
        const zip = new JSZip();
        const dateStr = new DateObject({ calendar: persian, locale: persian_fa }).format("YYYY-MM-DD_HH-mm");
        
        // Helper to create Excel Buffer
        const createExcelBuffer = (data: any[], sheetName: string) => {
            const ws = XLSX.utils.json_to_sheet(data);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, sheetName);
            return XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        };

        // 1. Customers & Sales (service_records)
        const salesData = JSON.parse(localStorage.getItem('service_records') || '[]');
        if (salesData.length > 0) {
            zip.file("Customers_Sales.xlsx", createExcelBuffer(salesData, "Customers"));
        }

        // 2. Repairs (repair_records)
        const repairsData = JSON.parse(localStorage.getItem('repair_records') || '[]');
        if (repairsData.length > 0) {
            zip.file("Repairs.xlsx", createExcelBuffer(repairsData, "Repairs"));
        }

        // 3. SMS Logs
        const smsLogsData = JSON.parse(localStorage.getItem('sms_logs') || '[]');
        if (smsLogsData.length > 0) {
            zip.file("SMS_History_Logs.xlsx", createExcelBuffer(smsLogsData, "SMS Logs"));
        }

        // 4. System Logs & Renewals
        const logsData = JSON.parse(localStorage.getItem('system_logs') || '[]');
        if (logsData.length > 0) {
            zip.file("System_Audit_Logs.xlsx", createExcelBuffer(logsData, "Audit"));
            
            // Extract Renewals specifically
            const renewals = logsData.filter((l: any) => l.type === 'renew');
            if (renewals.length > 0) {
                zip.file("Renewals_Report.xlsx", createExcelBuffer(renewals, "Renewals"));
            }
        }

        // 5. Config (JSON)
        const fullConfig = {
            appConfig: config,
            smsConfig: JSON.parse(localStorage.getItem('sms_config') || '{}'),
            smsTemplates: JSON.parse(localStorage.getItem('sms_templates') || '[]'),
            backupDate: dateStr
        };
        zip.file("System_Config.json", JSON.stringify(fullConfig, null, 2));

        // Generate Zip
        const content = await zip.generateAsync({ type: "blob" });
        
        // Download Trigger
        const url = window.URL.createObjectURL(content);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Backup_${config.storeName.replace(/\s+/g, '_')}_${dateStr}.zip`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        triggerToast('فایل بکاپ جامع (ZIP) ایجاد و دانلود شد.');
      } catch (error) {
        console.error(error);
        triggerToast('خطا در ایجاد بکاپ.');
      } finally {
        setIsLoading(false);
      }
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

  const getActionColor = (type: string) => {
      switch(type) {
          case 'create': return 'text-emerald-600 bg-emerald-50';
          case 'update': return 'text-blue-600 bg-blue-50';
          case 'delete': return 'text-rose-600 bg-rose-50';
          case 'renew': return 'text-amber-600 bg-amber-50';
          default: return 'text-gray-600 bg-gray-50';
      }
  };

  return (
    <div className="space-y-6 relative pb-10">
      
      {showToast && (
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 bg-emerald-600 text-white px-6 py-3 rounded-xl shadow-2xl z-50 flex items-center gap-3 animate-fadeIn">
          <CheckCircle size={20} />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">تنظیمات و پشتیبان‌گیری</h1>
          <p className="text-gray-500 mt-1">مدیریت اطلاعات فروشگاه، بکاپ‌گیری عمیق و لاگ سیستم</p>
        </div>
        <div className="flex gap-3">
             <button 
                onClick={handleFullSystemBackup}
                disabled={isLoading}
                className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-2.5 rounded-xl shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
            >
                {isLoading ? <RefreshCw size={20} className="animate-spin" /> : <FileArchive size={20} />}
                <span>دانلود بکاپ جامع (ZIP)</span>
            </button>
            <button 
                onClick={handleSave}
                disabled={isLoading}
                className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
            >
                {isLoading ? <RefreshCw size={20} className="animate-spin" /> : <Save size={20} />}
                <span>ذخیره تنظیمات</span>
            </button>
        </div>
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

        {/* System Logs Viewer */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[400px]">
             <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-200 text-gray-700 rounded-lg">
                        <Activity size={20} />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-800">گزارش عملکرد سیستم (Log)</h3>
                        <p className="text-[10px] text-gray-500">ثبت تمام رخدادها برای بکاپ</p>
                    </div>
                </div>
                <span className="bg-gray-200 text-gray-600 px-2 py-0.5 rounded text-xs">{logs.length} رکورد</span>
             </div>
             <div className="overflow-y-auto flex-1 p-0">
                 {logs.length === 0 ? (
                     <div className="flex flex-col items-center justify-center h-full text-gray-400">
                         <History size={40} className="mb-2 opacity-50" />
                         <p>هنوز رخدادی ثبت نشده است.</p>
                     </div>
                 ) : (
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 sticky top-0">
                            <tr>
                                <th className="px-4 py-2 text-right font-medium text-gray-500">زمان</th>
                                <th className="px-4 py-2 text-right font-medium text-gray-500">کاربر</th>
                                <th className="px-4 py-2 text-right font-medium text-gray-500">عملیات</th>
                                <th className="px-4 py-2 text-right font-medium text-gray-500">جزئیات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {[...logs].reverse().map(log => (
                                <tr key={log.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 text-gray-500 text-xs font-mono">{log.timestamp}</td>
                                    <td className="px-4 py-3 text-gray-700 font-bold text-xs">{log.user}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded text-[10px] font-bold ${getActionColor(log.type)}`}>
                                            {log.action}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-gray-600 text-xs truncate max-w-[150px]" title={log.details}>
                                        {log.details}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                 )}
             </div>
        </div>

        {/* Database & Backup Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center gap-3 bg-gray-50/50">
            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
              <Database size={20} />
            </div>
            <h3 className="font-bold text-gray-800">وضعیت دیتابیس و بکاپ</h3>
          </div>
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-800">پشتیبان‌گیری خودکار</h4>
                <p className="text-xs text-gray-400 mt-1">ذخیره خودکار تمام اطلاعات در ساعت مشخص شده</p>
              </div>
              <ToggleSwitch checked={config.autoBackup} onChange={(v) => setConfig({...config, autoBackup: v})} />
            </div>
            
            <div className={`space-y-4 transition-all duration-300 ${!config.autoBackup ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
              <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Clock size={16} className="text-indigo-500" />
                      زمان دقیق بکاپ خودکار
                  </label>
                  <input 
                    type="time" 
                    value={config.autoBackupTime}
                    onChange={(e) => setConfig({...config, autoBackupTime: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-100 outline-none font-mono text-center text-lg tracking-widest"
                  />
                  <p className="text-[10px] text-gray-400">سیستم هر روز در این ساعت، فایل ZIP بکاپ را آماده دانلود می‌کند.</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">دوره زمانی</label>
                <select 
                  value={config.backupFrequency}
                  onChange={(e) => setConfig({...config, backupFrequency: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-100 outline-none"
                >
                  <option value="daily">روزانه (هر روز)</option>
                  <option value="weekly">هفتگی</option>
                  <option value="monthly">ماهانه</option>
                </select>
              </div>
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