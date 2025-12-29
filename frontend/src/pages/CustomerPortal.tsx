import React, { useState, useEffect } from 'react';
import { 
  Smartphone, Wrench, ShoppingBag, Clock, CheckCircle, 
  AlertCircle, ChevronDown, ChevronUp, LogOut, Calendar,
  ShieldCheck, Loader2, Frown, User
} from 'lucide-react';
import { DateObject } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

// Helper for date status
const getWarrantyStatus = (expireDate?: string) => {
    if (!expireDate) return 'unknown';
    try {
        const today = new DateObject({ calendar: persian, locale: persian_fa });
        const exp = new DateObject({ date: expireDate, calendar: persian, locale: persian_fa });
        // Calculate difference in days
        const diffTime = exp.toUnix() - today.toUnix();
        const diffDays = Math.ceil(diffTime / (24 * 60 * 60));
        
        if (diffDays < 0) return 'expired';
        if (diffDays <= 30) return 'expiring';
        return 'active';
    } catch { return 'unknown'; }
};

const CustomerPortal: React.FC = () => {
  const [expandedItem, setExpandedItem] = useState<number | null>(null);
  const [userPhone, setUserPhone] = useState('');
  
  // Dynamic Data States
  const [customerInfo, setCustomerInfo] = useState<{name: string, phone: string, points: number, joinDate: string} | null>(null);
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Identify User
    const phone = localStorage.getItem('user_phone');
    if (!phone) {
        // Redirect if no phone found (should ideally go back to login)
        setLoading(false);
        return;
    }
    setUserPhone(phone);

    // 2. Fetch Data Source
    const allRecords = JSON.parse(localStorage.getItem('service_records') || '[]');
    
    // 3. Filter specific to this user (Robust matching)
    // Normalize function: remove leading zero and country codes, remove spaces
    const normalize = (p: string) => String(p).replace(/^(\+98|0098|98|0)/, '').replace(/\s/g, '');
    
    const myRecords = allRecords.filter((r: any) => {
        const recPhone = r.phoneNumber ? String(r.phoneNumber) : '';
        return normalize(recPhone) === normalize(phone);
    });

    // 4. Process Data
    if (myRecords.length > 0) {
        // Calculate total spent for points (1 point per 100,000 Tomans)
        const totalSpent = myRecords.reduce((acc: number, curr: any) => {
             const price = parseInt(String(curr.totalPrice).replace(/,/g, '')) || 0;
             return acc + price;
        }, 0);
        
        const points = Math.floor(totalSpent / 100000);
        const firstRecord = myRecords[0]; // Assuming latest or earliest based on array order
        
        setCustomerInfo({
            name: firstRecord.customerName,
            phone: phone,
            points: points,
            joinDate: firstRecord.receptionDate // Simple logic: first interaction date
        });

        // Map records to UI format
        setRecords(myRecords.map((r: any) => ({
            id: r.id,
            title: `${r.brand} ${r.model}`,
            type: r.brand ? 'device' : 'service', // Simple heuristic
            date: r.receptionDate,
            price: r.totalPrice,
            warrantyDate: r.warrantyExpiration,
            warrantyStatus: getWarrantyStatus(r.warrantyExpiration),
            details: r
        })));
    }

    setLoading(false);
  }, []);

  const getWarrantyBadge = (status: string) => {
    switch(status) {
      case 'active':
        return <span className="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded text-[10px] font-bold border border-emerald-100 flex items-center gap-1"><ShieldCheck size={10} /> گارانتی فعال</span>;
      case 'expiring':
        return <span className="bg-amber-50 text-amber-600 px-2 py-0.5 rounded text-[10px] font-bold border border-amber-100 flex items-center gap-1 animate-pulse"><Clock size={10} /> رو به انقضا</span>;
      case 'expired':
        return <span className="bg-red-50 text-red-500 px-2 py-0.5 rounded text-[10px] font-bold border border-red-100">منقضی شده</span>;
      default:
        return null;
    }
  };

  if (loading) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
              <Loader2 className="animate-spin text-indigo-600" size={32} />
          </div>
      );
  }

  // --- EMPTY STATE (If number not found) ---
  if (!customerInfo) {
      return (
        <div className="min-h-screen bg-gray-50 font-sans flex flex-col items-center justify-center p-6 text-center" dir="rtl">
            <div className="bg-white p-8 rounded-3xl shadow-xl max-w-sm w-full">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                    <Frown size={40} />
                </div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">اطلاعاتی یافت نشد!</h2>
                <p className="text-gray-500 text-sm mb-6">
                    کاربری با شماره <b>{userPhone}</b> در سیستم ثبت نشده است. اگر اخیراً خریدی داشته‌اید، لطفاً با پشتیبانی تماس بگیرید.
                </p>
                <button 
                    onClick={() => { localStorage.removeItem('user_phone'); window.location.reload(); }}
                    className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors"
                >
                    بازگشت به ورود
                </button>
            </div>
        </div>
      );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-10" dir="rtl">
      
      {/* Navbar */}
      <nav className="bg-white shadow-sm sticky top-0 z-20">
        <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-200">
                ID
             </div>
             <div>
                <h1 className="text-sm font-bold text-gray-800">پنل مشتریان</h1>
                <p className="text-[10px] text-gray-500">ID 724 CRM</p>
             </div>
          </div>
          <button 
            onClick={() => { localStorage.removeItem('user_phone'); window.location.reload(); }}
            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
          >
             <LogOut size={20} />
          </button>
        </div>
      </nav>

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        
        {/* Profile Card */}
        <div className="bg-gradient-to-br from-indigo-600 to-violet-600 rounded-3xl p-6 text-white shadow-xl shadow-indigo-200 relative overflow-hidden">
           <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
           <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full blur-2xl -ml-5 -mb-5"></div>
           
           <div className="relative z-10">
              <p className="text-indigo-100 text-sm mb-1">خوش آمدید،</p>
              <h2 className="text-2xl font-bold mb-4">{customerInfo.name}</h2>
              
              <div className="flex items-center justify-between bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20">
                 <div className="flex items-center gap-2">
                    <Smartphone size={18} className="text-indigo-200" />
                    <span className="text-sm font-medium">{customerInfo.phone}</span>
                 </div>
                 <div className="h-4 w-[1px] bg-white/20"></div>
                 <div className="flex items-center gap-1 text-xs">
                    <span className="text-indigo-200">امتیاز باشگاه:</span>
                    <span className="font-bold text-amber-300 text-lg">{customerInfo.points}</span>
                 </div>
              </div>
           </div>
        </div>

        {/* Records List */}
        <div className="space-y-3">
            <h3 className="font-bold text-gray-800 flex items-center justify-between">
                <span>دستگاه‌ها و خدمات من</span>
                <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">{records.length} مورد</span>
            </h3>
            
            <div className="space-y-3">
                {records.map((item) => (
                    <div 
                        key={item.id} 
                        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all"
                    >
                        <div 
                            className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                            onClick={() => setExpandedItem(expandedItem === item.id ? null : item.id)}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${item.details.brand ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                    {item.details.brand ? <ShoppingBag size={20} /> : <Wrench size={20} />}
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-800 text-sm">{item.title}</h4>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-xs text-gray-400 font-mono">{item.date}</span>
                                        {item.warrantyDate && (
                                            <>
                                                <span className="text-gray-300 text-[10px]">|</span>
                                                {getWarrantyBadge(item.warrantyStatus)}
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="text-gray-300">
                                {expandedItem === item.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                            </div>
                        </div>
                        
                        {/* Expanded Details */}
                        {expandedItem === item.id && (
                            <div className="px-4 pb-4 pt-2 bg-gray-50/50 border-t border-gray-100 animate-fadeIn">
                                <div className="grid grid-cols-2 gap-3 mt-2">
                                    <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                                        <span className="text-xs text-gray-400 block mb-1">سریال دستگاه</span>
                                        <span className="font-mono font-bold text-gray-700 text-xs">{item.details.serialNumber || '---'}</span>
                                    </div>
                                    <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                                        <span className="text-xs text-gray-400 block mb-1">هزینه کل</span>
                                        <span className="font-bold text-gray-700 text-sm">{item.price} ت</span>
                                    </div>
                                    <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm col-span-2">
                                        <span className="text-xs text-gray-400 block mb-1">وضعیت آنتی‌ویروس</span>
                                        <div className="flex justify-between items-center">
                                            <span className="font-bold text-gray-700 text-sm">
                                                {item.details.antivirusType === 'single' ? 'تک کاربره' : 
                                                 item.details.antivirusType === 'double' ? 'دو کاربره' : 'ندارد'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm col-span-2">
                                         <span className="text-xs text-gray-400 block mb-1">توضیحات</span>
                                         <p className="text-xs text-gray-600 leading-relaxed">{item.details.description || 'توضیحاتی ثبت نشده است.'}</p>
                                    </div>
                                </div>
                                {item.warrantyStatus === 'expiring' && (
                                    <div className="mt-3 bg-amber-50 text-amber-700 p-3 rounded-xl text-xs flex items-start gap-2 border border-amber-100">
                                        <AlertCircle size={16} className="shrink-0 mt-0.5" />
                                        <p>مشتری گرامی، گارانتی یا آنتی‌ویروس این دستگاه رو به اتمام است. جهت تمدید آنلاین یا حضوری اقدام نمایید.</p>
                                    </div>
                                )}
                                {item.warrantyStatus === 'expired' && (
                                    <div className="mt-3 bg-red-50 text-red-700 p-3 rounded-xl text-xs flex items-start gap-2 border border-red-100">
                                        <AlertCircle size={16} className="shrink-0 mt-0.5" />
                                        <p>مشتری گرامی، سرویس این دستگاه منقضی شده است.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>

      </div>
    </div>
  );
};

export default CustomerPortal;