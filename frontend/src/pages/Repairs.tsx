import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Filter, Calendar, CheckCircle, Clock, 
  AlertTriangle, XCircle, MoreVertical, Edit, Trash, X, Laptop, Monitor
} from 'lucide-react';
import DatePicker, { DateObject } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

// Types
interface Repair {
  id: number;
  customerName: string;
  phoneNumber: string;
  deviceModel: string;
  status: 'completed' | 'in_progress' | 'waiting_parts' | 'cancelled';
  serviceType: 'hardware' | 'software'; // Added to distinguish Hardware Repair vs Software/Windows
  cost: number;
  serviceDate: string;
  warrantyExpiration: string;
}

// Mock Data - Persian Dates
const MOCK_REPAIRS: Repair[] = [
  {
    id: 1,
    customerName: 'محمد حسینی',
    phoneNumber: '09121111111',
    deviceModel: 'MacBook Pro M1',
    status: 'in_progress',
    serviceType: 'hardware',
    cost: 0,
    serviceDate: '1402/08/15',
    warrantyExpiration: '1403/08/15'
  },
  {
    id: 2,
    customerName: 'سارا احمدی',
    phoneNumber: '09122222222',
    deviceModel: 'iPhone 13',
    status: 'completed',
    serviceType: 'hardware',
    cost: 4500000,
    serviceDate: '1402/08/10',
    warrantyExpiration: '1403/08/10'
  },
  {
    id: 3,
    customerName: 'امید زند',
    phoneNumber: '09198887777',
    deviceModel: 'Lenovo Ideapad',
    status: 'completed',
    serviceType: 'software', // Example of software service
    cost: 350000,
    serviceDate: '1403/01/20',
    warrantyExpiration: '1404/01/20'
  }
];

const Repairs: React.FC = () => {
  const [repairs, setRepairs] = useState<Repair[]>(MOCK_REPAIRS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRepair, setEditingRepair] = useState<Repair | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    customerName: string;
    phoneNumber: string;
    deviceModel: string;
    status: Repair['status'];
    serviceType: Repair['serviceType'];
    cost: string;
    serviceDate: string;
    warrantyExpiration: string;
  }>({
    customerName: '',
    phoneNumber: '',
    deviceModel: '',
    status: 'in_progress',
    serviceType: 'hardware',
    cost: '',
    serviceDate: '',
    warrantyExpiration: ''
  });

  // Calculate default warranty date (1 year from now using Jalali)
  const calculateWarranty = (dateStr: string) => {
    if (!dateStr) return '';
    try {
        const date = new DateObject({ date: dateStr, calendar: persian, locale: persian_fa });
        date.add(1, "year");
        return date.format();
    } catch (e) {
        return '';
    }
  };

  // Logic: Auto-update Warranty Expiration when Service Date changes
  useEffect(() => {
    // Only update if warranty isn't manually edited (simplified: always update on service change for now)
    if (formData.serviceDate) {
        const nextYear = calculateWarranty(formData.serviceDate);
        setFormData(prev => ({
            ...prev,
            warrantyExpiration: nextYear
        }));
    }
  }, [formData.serviceDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newRepair: Repair = {
      id: editingRepair ? editingRepair.id : Date.now(),
      customerName: formData.customerName,
      phoneNumber: formData.phoneNumber,
      deviceModel: formData.deviceModel,
      status: formData.status,
      serviceType: formData.serviceType,
      cost: Number(formData.cost),
      serviceDate: formData.serviceDate,
      warrantyExpiration: formData.warrantyExpiration
    };

    if (editingRepair) {
      setRepairs(repairs.map(r => r.id === newRepair.id ? newRepair : r));
    } else {
      setRepairs([newRepair, ...repairs]);
    }
    closeModal();
  };

  const openModal = (repair?: Repair) => {
    if (repair) {
      setEditingRepair(repair);
      setFormData({
        customerName: repair.customerName,
        phoneNumber: repair.phoneNumber,
        deviceModel: repair.deviceModel,
        status: repair.status,
        serviceType: repair.serviceType,
        cost: String(repair.cost),
        serviceDate: repair.serviceDate,
        warrantyExpiration: repair.warrantyExpiration
      });
    } else {
      setEditingRepair(null);
      // Default to today (Persian)
      const today = new DateObject({ calendar: persian, locale: persian_fa }).format();
      setFormData({
        customerName: '',
        phoneNumber: '',
        deviceModel: '',
        status: 'in_progress',
        serviceType: 'hardware',
        cost: '',
        serviceDate: today,
        warrantyExpiration: calculateWarranty(today)
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingRepair(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-emerald-100 text-emerald-600';
      case 'in_progress': return 'bg-blue-100 text-blue-600';
      case 'waiting_parts': return 'bg-amber-100 text-amber-600';
      case 'cancelled': return 'bg-rose-100 text-rose-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };
  
  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'تکمیل شده';
      case 'in_progress': return 'در حال تعمیر';
      case 'waiting_parts': return 'منتظر قطعه';
      case 'cancelled': return 'لغو شده';
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">خدمات و تعمیرات</h1>
          <p className="text-gray-500 mt-1">مدیریت تعمیرات سخت‌افزاری و خدمات نرم‌افزاری (ویندوز و...)</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all"
        >
          <Plus size={20} />
          <span>پذیرش دستگاه جدید</span>
        </button>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 flex gap-4">
           <div className="flex-1 flex items-center bg-gray-50 rounded-xl px-4 py-2 border border-gray-100 focus-within:ring-2 focus-within:ring-indigo-100 focus-within:bg-white transition-all">
              <Search size={18} className="text-gray-400 ml-2" />
              <input 
                type="text" 
                placeholder="جستجو نام مشتری، شماره تماس یا مدل..." 
                className="bg-transparent border-none outline-none text-sm w-full text-gray-700 placeholder-gray-400"
              />
           </div>
           <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors">
              <Filter size={18} />
              <span className="hidden md:inline">فیلترها</span>
           </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">مشتری</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">دستگاه / نوع خدمت</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">وضعیت</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">تاریخ خدمات</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">پایان گارانتی</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">هزینه (تومان)</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {repairs.map((repair) => (
                <tr key={repair.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-800">{repair.customerName}</span>
                        <span className="text-xs text-gray-400">{repair.phoneNumber}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                     <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-800 flex items-center gap-2">
                            {repair.serviceType === 'hardware' ? <Laptop size={14} className="text-indigo-500" /> : <Monitor size={14} className="text-pink-500" />}
                            {repair.deviceModel}
                        </span>
                        <span className="text-xs text-gray-400">
                            {repair.serviceType === 'hardware' ? 'تعمیر سخت‌افزار' : 'نصب ویندوز/نرم‌افزار'}
                        </span>
                     </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(repair.status)}`}>
                      {getStatusText(repair.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-gray-400" />
                        {repair.serviceDate}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                     <div className="flex items-center gap-2">
                        <AlertTriangle size={14} className="text-indigo-400" />
                        {repair.warrantyExpiration}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                    {repair.cost.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                        <button onClick={() => openModal(repair)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                            <Edit size={16} />
                        </button>
                        <button className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash size={16} />
                        </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-visible animate-fadeIn">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h3 className="text-lg font-bold text-gray-800">
                        {editingRepair ? 'ویرایش خدمات' : 'پذیرش دستگاه جدید'}
                    </h3>
                    <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg p-1 transition-colors">
                        <X size={20} />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">نام مشتری</label>
                            <input 
                                required
                                type="text" 
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all outline-none"
                                value={formData.customerName}
                                onChange={e => setFormData({...formData, customerName: e.target.value})}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">شماره تماس</label>
                            <input 
                                required
                                type="text" 
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all outline-none"
                                value={formData.phoneNumber}
                                onChange={e => setFormData({...formData, phoneNumber: e.target.value})}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">نوع خدمات</label>
                            <select 
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all outline-none"
                                value={formData.serviceType}
                                onChange={e => setFormData({...formData, serviceType: e.target.value as any})}
                            >
                                <option value="hardware">تعمیرات سخت‌افزاری (لپ‌تاپ/موبایل)</option>
                                <option value="software">خدمات نرم‌افزاری (نصب ویندوز و...)</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">مدل دستگاه / توضیحات</label>
                            <input 
                                required
                                type="text" 
                                placeholder="مثال: Asus VivoBook / نصب ویندوز 11"
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all outline-none"
                                value={formData.deviceModel}
                                onChange={e => setFormData({...formData, deviceModel: e.target.value})}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">وضعیت</label>
                            <select 
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all outline-none"
                                value={formData.status}
                                onChange={e => setFormData({...formData, status: e.target.value as any})}
                            >
                                <option value="in_progress">در حال انجام</option>
                                <option value="waiting_parts">منتظر قطعه</option>
                                <option value="completed">تکمیل شده</option>
                                <option value="cancelled">لغو شده</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">هزینه (تومان)</label>
                            <input 
                                type="number" 
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all outline-none"
                                value={formData.cost}
                                onChange={e => setFormData({...formData, cost: e.target.value})}
                            />
                        </div>
                    </div>
                    
                    <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div className="space-y-2">
                            <label className="text-sm font-medium text-indigo-900">تاریخ خدمات/شروع (شمسی)</label>
                            <div className="relative">
                                <Calendar className="absolute right-3 top-2.5 text-indigo-400 w-5 h-5 pointer-events-none z-10" />
                                <DatePicker
                                    calendar={persian}
                                    locale={persian_fa}
                                    calendarPosition="top-right"
                                    value={formData.serviceDate}
                                    onChange={(dateObject: any) => {
                                        const str = dateObject?.toString() || "";
                                        setFormData({...formData, serviceDate: str});
                                    }}
                                    inputClass="rmdp-input"
                                    containerStyle={{ width: "100%" }}
                                    placeholder="انتخاب تاریخ..."
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-indigo-900">تاریخ پایان گارانتی خدمات (شمسی)</label>
                            <div className="relative">
                                <AlertTriangle className="absolute right-3 top-2.5 text-indigo-400 w-5 h-5 pointer-events-none z-10" />
                                <DatePicker
                                    calendar={persian}
                                    locale={persian_fa}
                                    calendarPosition="top-right"
                                    value={formData.warrantyExpiration}
                                    onChange={(dateObject: any) => {
                                        const str = dateObject?.toString() || "";
                                        setFormData({...formData, warrantyExpiration: str});
                                    }}
                                    inputClass="rmdp-input"
                                    containerStyle={{ width: "100%" }}
                                    placeholder="انتخاب تاریخ..."
                                />
                            </div>
                            <p className="text-xs text-indigo-400 mt-1">* به صورت خودکار ۳۶۵ روز بعد از تاریخ خدمات تنظیم می‌شود.</p>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                        <button 
                            type="button" 
                            onClick={closeModal}
                            className="px-6 py-2.5 text-gray-600 hover:bg-gray-100 font-medium rounded-xl transition-colors"
                        >
                            انصراف
                        </button>
                        <button 
                            type="submit" 
                            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition-all transform active:scale-95"
                        >
                            {editingRepair ? 'ذخیره تغییرات' : 'ثبت اطلاعات'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};

export default Repairs;