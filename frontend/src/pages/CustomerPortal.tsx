import React, { useState } from 'react';
import { 
  Smartphone, Wrench, ShoppingBag, Clock, CheckCircle, 
  AlertCircle, ChevronDown, ChevronUp, LogOut, Calendar,
  ShieldCheck, Loader2
} from 'lucide-react';

const CustomerPortal: React.FC = () => {
  const [expandedItem, setExpandedItem] = useState<number | null>(null);

  // Mock Logged-in Customer Data
  const customer = {
    name: 'محمد حسینی',
    phone: '09351112233',
    memberSince: '1401/05/20',
    loyaltyPoints: 150
  };

  // Mock Active Repairs
  const activeRepairs = [
    {
      id: 201,
      device: 'iPhone 13 Pro Max',
      issue: 'تعویض ال‌سی‌دی و باتری',
      status: 'in_progress', // in_progress, waiting_parts, completed
      progress: 65,
      estimatedCompletion: '1403/08/18',
      costEstimated: '8,500,000',
      trackingCode: 'REP-2024-885'
    }
  ];

  // Mock Purchase History
  const history = [
    {
      id: 101,
      type: 'purchase',
      title: 'MacBook Air M2',
      date: '1403/01/15',
      warrantyStatus: 'active', // active, expiring, expired
      warrantyDate: '1404/01/15',
      price: '55,000,000'
    },
    {
      id: 102,
      type: 'service',
      title: 'سرویس دوره‌ای لپ‌تاپ HP',
      date: '1402/11/20',
      status: 'completed',
      price: '950,000'
    },
    {
      id: 103,
      type: 'purchase',
      title: 'Mouse Logitech MX Master 3',
      date: '1401/10/05',
      warrantyStatus: 'expired',
      warrantyDate: '1402/10/05',
      price: '4,500,000'
    }
  ];

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'in_progress':
        return <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"><Loader2 size={12} className="animate-spin" /> در حال تعمیر</span>;
      case 'waiting_parts':
        return <span className="bg-amber-100 text-amber-600 px-3 py-1 rounded-full text-xs font-bold">منتظر قطعه</span>;
      case 'completed':
        return <span className="bg-emerald-100 text-emerald-600 px-3 py-1 rounded-full text-xs font-bold">تکمیل شده</span>;
      default:
        return null;
    }
  };

  const getWarrantyBadge = (status: string) => {
    switch(status) {
      case 'active':
        return <span className="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded text-[10px] font-bold border border-emerald-100 flex items-center gap-1"><ShieldCheck size={10} /> گارانتی فعال</span>;
      case 'expiring':
        return <span className="bg-amber-50 text-amber-600 px-2 py-0.5 rounded text-[10px] font-bold border border-amber-100 flex items-center gap-1"><Clock size={10} /> رو به انقضا</span>;
      case 'expired':
        return <span className="bg-gray-50 text-gray-500 px-2 py-0.5 rounded text-[10px] font-bold border border-gray-200">منقضی شده</span>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-10" dir="rtl">
      
      {/* Navbar */}
      <nav className="bg-white shadow-sm sticky top-0 z-20">
        <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-200">
                M
             </div>
             <div>
                <h1 className="text-sm font-bold text-gray-800">پنل مشتریان</h1>
                <p className="text-[10px] text-gray-500">Mostech CRM</p>
             </div>
          </div>
          <button onClick={() => window.location.reload()} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
             <LogOut size={20} />
          </button>
        </div>
      </nav>

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        
        {/* Welcome Card */}
        <div className="bg-gradient-to-br from-indigo-600 to-violet-600 rounded-3xl p-6 text-white shadow-xl shadow-indigo-200 relative overflow-hidden">
           <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
           <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full blur-2xl -ml-5 -mb-5"></div>
           
           <div className="relative z-10">
              <p className="text-indigo-100 text-sm mb-1">خوش آمدید،</p>
              <h2 className="text-2xl font-bold mb-4">{customer.name}</h2>
              
              <div className="flex items-center justify-between bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20">
                 <div className="flex items-center gap-2">
                    <Smartphone size={18} className="text-indigo-200" />
                    <span className="text-sm font-medium">{customer.phone}</span>
                 </div>
                 <div className="h-4 w-[1px] bg-white/20"></div>
                 <div className="flex items-center gap-1 text-xs">
                    <span className="text-indigo-200">امتیاز:</span>
                    <span className="font-bold text-amber-300">{customer.loyaltyPoints}</span>
                 </div>
              </div>
           </div>
        </div>

        {/* Active Repairs Section */}
        {activeRepairs.length > 0 && (
            <div className="space-y-3">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
                    تعمیرات فعال
                </h3>
                {activeRepairs.map(repair => (
                    <div key={repair.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <h4 className="font-bold text-gray-800 text-lg">{repair.device}</h4>
                                <p className="text-sm text-gray-500 mt-1">{repair.issue}</p>
                            </div>
                            {getStatusBadge(repair.status)}
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="mb-4">
                            <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                                <span>پیشرفت کار</span>
                                <span>{repair.progress}%</span>
                            </div>
                            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-blue-500 rounded-full transition-all duration-1000 ease-out"
                                    style={{ width: `${repair.progress}%` }}
                                ></div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-gray-50 text-sm">
                            <div className="flex flex-col gap-1">
                                <span className="text-xs text-gray-400">کد رهگیری</span>
                                <span className="font-mono font-bold text-gray-700">{repair.trackingCode}</span>
                            </div>
                            <div className="flex flex-col gap-1 text-left">
                                <span className="text-xs text-gray-400">تحویل تقریبی</span>
                                <span className="font-bold text-gray-700 flex items-center justify-end gap-1">
                                    <Calendar size={12} className="text-gray-400" />
                                    {repair.estimatedCompletion}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )}

        {/* History Section */}
        <div className="space-y-3">
            <h3 className="font-bold text-gray-800">سوابق خدمات و خرید</h3>
            <div className="space-y-3">
                {history.map((item) => (
                    <div 
                        key={item.id} 
                        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all"
                    >
                        <div 
                            className="p-4 flex items-center justify-between cursor-pointer"
                            onClick={() => setExpandedItem(expandedItem === item.id ? null : item.id)}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${item.type === 'purchase' ? 'bg-emerald-100 text-emerald-600' : 'bg-indigo-100 text-indigo-600'}`}>
                                    {item.type === 'purchase' ? <ShoppingBag size={18} /> : <Wrench size={18} />}
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-800 text-sm">{item.title}</h4>
                                    <span className="text-xs text-gray-400 mt-0.5 block">{item.date}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {item.type === 'purchase' && getWarrantyBadge(item.warrantyStatus || '')}
                                {expandedItem === item.id ? <ChevronUp size={18} className="text-gray-300" /> : <ChevronDown size={18} className="text-gray-300" />}
                            </div>
                        </div>
                        
                        {/* Expanded Details */}
                        {expandedItem === item.id && (
                            <div className="px-4 pb-4 pt-0 bg-gray-50/50 border-t border-gray-50">
                                <div className="grid grid-cols-2 gap-4 mt-3">
                                    <div className="bg-white p-3 rounded-xl border border-gray-100">
                                        <span className="text-xs text-gray-400 block mb-1">مبلغ کل</span>
                                        <span className="font-bold text-gray-800 text-sm">{item.price} تومان</span>
                                    </div>
                                    {item.type === 'purchase' && (
                                        <div className="bg-white p-3 rounded-xl border border-gray-100">
                                            <span className="text-xs text-gray-400 block mb-1">پایان گارانتی</span>
                                            <span className={`font-bold text-sm ${item.warrantyStatus === 'expired' ? 'text-red-500' : 'text-gray-800'}`}>
                                                {item.warrantyDate}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <button className="w-full mt-3 py-2 text-xs text-indigo-600 font-medium bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors">
                                    مشاهده فاکتور دیجیتال
                                </button>
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