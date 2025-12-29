import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Wrench, 
  Settings, 
  LogOut, 
  Menu, 
  Bell, 
  Search,
  User,
  Users,
  MessageSquareText,
  X,
  FileSpreadsheet,
  Activity,
  Calendar,
  CheckCircle,
  Download
} from 'lucide-react';
import * as XLSX from 'xlsx';
import JSZip from 'jszip';
import { DateObject } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

interface LayoutProps {
  onLogout?: () => void;
}

const Layout: React.FC<LayoutProps> = ({ onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [adminActivities, setAdminActivities] = useState<any[]>([]);
  const [reportRange, setReportRange] = useState<number>(1); // Months
  const location = useLocation();

  const navItems = [
    { name: 'داشبورد', path: '/', icon: LayoutDashboard },
    { name: 'پذیرش دستگاه نو', path: '/sales', icon: ShoppingCart },
    { name: 'خدمات و تعمیرات', path: '/repairs', icon: Wrench },
    { name: 'لیست مشتریان', path: '/customers', icon: Users },
    { name: 'پنل پیامک', path: '/messages', icon: MessageSquareText },
    { name: 'تنظیمات سیستم', path: '/settings', icon: Settings },
  ];

  // --- Auto Backup Checker ---
  useEffect(() => {
      const checkAutoBackup = async () => {
          const config = JSON.parse(localStorage.getItem('app_config') || '{}');
          if (!config.autoBackup || !config.autoBackupTime) return;

          const lastBackupDate = localStorage.getItem('last_auto_backup_date');
          const today = new DateObject({ calendar: persian, locale: persian_fa }).format("YYYY-MM-DD");

          // If backup already done today, skip
          if (lastBackupDate === today) return;

          // Check time
          const now = new Date();
          const currentHour = now.getHours();
          const currentMinute = now.getMinutes();
          const [schedHour, schedMinute] = config.autoBackupTime.split(':').map(Number);

          // If current time >= scheduled time
          if (currentHour > schedHour || (currentHour === schedHour && currentMinute >= schedMinute)) {
              // Trigger Backup
              console.log("Triggering Auto Backup...");
              try {
                const zip = new JSZip();
                
                // Helper
                const createExcelBuffer = (data: any[], sheetName: string) => {
                    const ws = XLSX.utils.json_to_sheet(data);
                    const wb = XLSX.utils.book_new();
                    XLSX.utils.book_append_sheet(wb, ws, sheetName);
                    return XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
                };

                const salesData = JSON.parse(localStorage.getItem('service_records') || '[]');
                if (salesData.length) zip.file("AutoBackup_Sales.xlsx", createExcelBuffer(salesData, "Sales"));

                const repairsData = JSON.parse(localStorage.getItem('repair_records') || '[]');
                if (repairsData.length) zip.file("AutoBackup_Repairs.xlsx", createExcelBuffer(repairsData, "Repairs"));

                const logsData = JSON.parse(localStorage.getItem('system_logs') || '[]');
                if (logsData.length) zip.file("AutoBackup_Logs.xlsx", createExcelBuffer(logsData, "Logs"));
                
                const smsData = JSON.parse(localStorage.getItem('sms_logs') || '[]');
                if (smsData.length) zip.file("AutoBackup_SMS.xlsx", createExcelBuffer(smsData, "SMS"));

                const content = await zip.generateAsync({ type: "blob" });
                
                const url = window.URL.createObjectURL(content);
                const a = document.createElement('a');
                a.href = url;
                a.download = `AUTO_BACKUP_${today}.zip`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);

                // Mark as done for today
                localStorage.setItem('last_auto_backup_date', today);
              } catch (e) {
                  console.error("Auto Backup Failed", e);
              }
          }
      };

      // Check every minute
      const interval = setInterval(checkAutoBackup, 60000);
      checkAutoBackup(); // Initial check

      return () => clearInterval(interval);
  }, []);

  useEffect(() => {
      if (isAdminModalOpen) {
          const logs = JSON.parse(localStorage.getItem('system_logs') || '[]');
          setAdminActivities(logs.reverse().slice(0, 10)); // Show last 10
      }
  }, [isAdminModalOpen]);

  const handleExportActivities = () => {
      const logs = JSON.parse(localStorage.getItem('system_logs') || '[]');
      const today = new DateObject({ calendar: persian, locale: persian_fa });
      
      const filteredLogs = logs.filter((log: any) => {
          try {
              return true; 
          } catch { return true; }
      });

      const dataToExport = filteredLogs.map((log: any) => ({
          'شناسه': log.id,
          'زمان': log.timestamp,
          'کاربر (ادمین)': log.user,
          'نوع عملیات': log.action,
          'جزئیات': log.details,
          'نوع': log.type === 'create' ? 'ایجاد' : log.type === 'update' ? 'ویرایش' : log.type === 'delete' ? 'حذف' : 'سایر'
      }));

      const ws = XLSX.utils.json_to_sheet(dataToExport);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Activity_Report");
      XLSX.writeFile(wb, `Admin_Report_${reportRange}_Months_${today.format("YYYY-MM-DD")}.xlsx`);
  };

  const getActionColor = (type: string) => {
      switch(type) {
          case 'create': return 'bg-emerald-100 text-emerald-600';
          case 'update': return 'bg-blue-100 text-blue-600';
          case 'delete': return 'bg-rose-100 text-rose-600';
          default: return 'bg-gray-100 text-gray-600';
      }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans text-right" dir="rtl">
      
      {/* Sidebar */}
      <aside 
        className={`
          bg-white shadow-2xl z-20 transition-all duration-300 ease-in-out flex flex-col
          ${sidebarOpen ? 'w-64' : 'w-20'}
        `}
      >
        <div className="h-24 flex items-center justify-center border-b border-gray-100 p-4">
          <div className={`flex items-center gap-3 transition-all ${!sidebarOpen && 'flex-col gap-1'}`}>
             <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200 overflow-hidden shrink-0">
                <span className="text-white font-bold text-xl">ID</span>
             </div>
             {sidebarOpen && (
                <div className="flex flex-col animate-fadeIn">
                  <h1 className="text-xl font-black text-gray-800 tracking-tight">آیدی ۷۲۴</h1>
                  <span className="text-xs text-indigo-500 font-bold tracking-widest uppercase">ID 724 CRM</span>
                </div>
             )}
          </div>
        </div>

        <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group
                  ${isActive 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' 
                    : 'text-gray-500 hover:bg-indigo-50 hover:text-indigo-600'
                  }
                `}
              >
                <Icon size={22} className={isActive ? 'text-white' : 'text-gray-400 group-hover:text-indigo-600'} />
                {sidebarOpen && <span className="font-medium whitespace-nowrap">{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button 
            onClick={onLogout}
            className="flex items-center gap-3 w-full px-3 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
          >
            <LogOut size={20} />
            {sidebarOpen && <span>خروج از حساب</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Header */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-xl hover:bg-gray-100 text-gray-600 transition-colors"
            >
              <Menu size={24} />
            </button>
            
            <div className="hidden md:flex items-center bg-gray-100/50 rounded-xl px-4 py-2.5 w-96 border border-gray-100 focus-within:ring-2 focus-within:ring-indigo-100 focus-within:bg-white transition-all">
              <Search size={18} className="text-gray-400 ml-2" />
              <input 
                type="text" 
                placeholder="جستجو در سفارشات، سریال‌ها..." 
                className="bg-transparent border-none outline-none text-sm w-full text-gray-700 placeholder-gray-400"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2.5 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>
            
            {/* Admin Profile Trigger */}
            <div 
                className="flex items-center gap-3 pl-2 border-r border-gray-100 mr-2 cursor-pointer hover:bg-gray-50 p-2 rounded-xl transition-colors"
                onClick={() => setIsAdminModalOpen(true)}
            >
              <div className="flex flex-col items-end hidden sm:flex">
                <span className="text-sm font-bold text-gray-800">علی رضایی</span>
                <span className="text-xs text-indigo-500 font-medium">مدیر سیستم</span>
              </div>
              <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 border border-indigo-200">
                <User size={20} />
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-8">
           <Outlet />
        </div>

        {/* Admin Activity Modal */}
        {isAdminModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/20 backdrop-blur-sm animate-fadeIn">
                <div className="bg-white h-full w-full max-w-md shadow-2xl p-0 flex flex-col transform transition-transform animate-slideInRight">
                    
                    {/* Modal Header */}
                    <div className="p-6 border-b border-gray-100 bg-indigo-600 text-white">
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-2xl font-bold backdrop-blur-sm border border-white/30">
                                    ER
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold">علی رضایی</h2>
                                    <span className="text-indigo-200 text-sm">مدیر کل سیستم</span>
                                </div>
                            </div>
                            <button onClick={() => setIsAdminModalOpen(false)} className="text-white/70 hover:text-white p-1">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="mt-6 flex gap-4 text-sm text-indigo-100">
                            <div className="flex flex-col">
                                <span className="opacity-70 text-xs">آخرین ورود</span>
                                <span className="font-bold">امروز، ۱۰:۳۰</span>
                            </div>
                            <div className="w-px bg-white/20"></div>
                            <div className="flex flex-col">
                                <span className="opacity-70 text-xs">سطح دسترسی</span>
                                <span className="font-bold">Full Admin</span>
                            </div>
                        </div>
                    </div>

                    {/* Report Export Section */}
                    <div className="p-5 border-b border-gray-100 bg-gray-50">
                        <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                            <FileSpreadsheet size={18} className="text-indigo-600" />
                            گزارش‌گیری مدیریتی
                        </h3>
                        <div className="flex gap-2 mb-3">
                            <button onClick={() => setReportRange(1)} className={`flex-1 py-2 text-xs rounded-lg border transition-all ${reportRange === 1 ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 hover:border-indigo-300'}`}>۱ ماه اخیر</button>
                            <button onClick={() => setReportRange(3)} className={`flex-1 py-2 text-xs rounded-lg border transition-all ${reportRange === 3 ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 hover:border-indigo-300'}`}>۳ ماه اخیر</button>
                            <button onClick={() => setReportRange(6)} className={`flex-1 py-2 text-xs rounded-lg border transition-all ${reportRange === 6 ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 hover:border-indigo-300'}`}>۶ ماه اخیر</button>
                        </div>
                        <button 
                            onClick={handleExportActivities}
                            className="w-full py-2.5 bg-emerald-600 text-white text-sm font-bold rounded-xl shadow-md hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
                        >
                            <Download size={16} />
                            دانلود اکسل عملکرد تمام پرسنل
                        </button>
                        <p className="text-[10px] text-gray-400 mt-2 text-center">شامل: فروش، تعمیرات، ویرایش‌ها و لاگین‌ها</p>
                    </div>

                    {/* Recent Activity List */}
                    <div className="flex-1 overflow-y-auto p-5">
                        <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                            <Activity size={18} className="text-gray-400" />
                            فعالیت‌های اخیر شما
                        </h3>
                        
                        <div className="space-y-4 relative before:absolute before:right-[15px] before:top-2 before:bottom-0 before:w-0.5 before:bg-gray-100">
                            {adminActivities.length === 0 ? (
                                <p className="text-center text-gray-400 text-xs py-4">هنوز فعالیتی ثبت نشده است.</p>
                            ) : (
                                adminActivities.map((act) => (
                                    <div key={act.id} className="relative pr-8">
                                        <div className={`absolute right-2 top-1 w-3 h-3 rounded-full border-2 border-white ring-1 ring-gray-200 ${getActionColor(act.type).split(' ')[0].replace('bg-', 'bg-')}`}></div>
                                        <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="font-bold text-gray-800 text-xs">{act.action}</span>
                                                <span className="text-[10px] text-gray-400 font-mono">{act.timestamp.split(' ')[1]}</span>
                                            </div>
                                            <p className="text-xs text-gray-500 leading-relaxed mb-2">{act.details}</p>
                                            <div className="flex justify-between items-center">
                                                <span className={`text-[9px] px-1.5 py-0.5 rounded ${getActionColor(act.type)}`}>
                                                    {act.type.toUpperCase()}
                                                </span>
                                                <span className="text-[10px] text-gray-400">{act.timestamp.split(' ')[0]}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                </div>
            </div>
        )}

      </main>
    </div>
  );
};

export default Layout;