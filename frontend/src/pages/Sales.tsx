import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Filter, Calendar, FileSpreadsheet, 
  Edit, Trash, X, ShoppingBag, Hash, Clock, CheckCircle, AlertCircle, UploadCloud, Loader2, BellRing, HelpCircle,
  MessageSquare, Zap, Send, ShieldAlert, Monitor, Shield, Laptop
} from 'lucide-react';
import DatePicker, { DateObject } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

// Constants for Dropdowns
const BRANDS = ["Asus", "Lenovo", "HP", "Dell", "Acer", "MSI", "Apple", "Samsung", "Microsoft", "Xiaomi", "سایر"];
const WARRANTIES = ["سازگار ارقام", "آواژنگ", "ماتریس", "حامی", "الماس رایان", "پانا", "امر تات", "مدیران", "شرکتی", "بدون گارانتی"];

// Types
interface Sale {
  id: number;
  customerName: string;
  phoneNumber: string;
  brand: string;      // Changed from productName to specific fields
  model: string;
  serialNumber: string;
  warrantyCompany: string;
  purchaseDate: string;
  warrantyMonths: number;
  warrantyExpiration: string; // Calculated
  price: number;
  hasWindows: boolean;    // New Field
  hasAntivirus: boolean;  // New Field
  antivirusExpiration?: string; // New Field
}

// Mock Data
const MOCK_SALES: Sale[] = [
  {
    id: 1,
    customerName: 'رضا کمالی',
    phoneNumber: '09123334444',
    brand: 'Lenovo',
    model: 'Legion 5 Pro',
    serialNumber: 'PF2D5X99',
    warrantyCompany: 'سازگار ارقام',
    purchaseDate: '1403/08/10',
    warrantyMonths: 18,
    warrantyExpiration: '1404/02/10',
    price: 65000000,
    hasWindows: true,
    hasAntivirus: true,
    antivirusExpiration: '1404/08/10'
  },
  {
    id: 2,
    customerName: 'مریم حسینی',
    phoneNumber: '09125556666',
    brand: 'Asus',
    model: 'ZenBook 14',
    serialNumber: 'R5CT455X',
    warrantyCompany: 'آواژنگ',
    purchaseDate: '1403/11/01', 
    warrantyMonths: 24,
    warrantyExpiration: '1405/11/01',
    price: 42000000,
    hasWindows: true,
    hasAntivirus: false
  }
];

const Sales: React.FC = () => {
  const [sales, setSales] = useState<Sale[]>(MOCK_SALES);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  
  // Import/SMS States (Existing logic preserved)
  const [isImporting, setIsImporting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isSmsModalOpen, setIsSmsModalOpen] = useState(false);
  const [smsMessage, setSmsMessage] = useState("");
  const [isSendingSms, setIsSendingSms] = useState(false);

  // Form State
  const [formData, setFormData] = useState<{
      customerName: string;
      phoneNumber: string;
      brand: string;
      model: string;
      serialNumber: string;
      warrantyCompany: string;
      purchaseDate: string;
      warrantyMonths: number;
      price: string;
      hasWindows: boolean;
      hasAntivirus: boolean;
      antivirusExpiration: string;
  }>({
    customerName: '',
    phoneNumber: '',
    brand: '',
    model: '',
    serialNumber: '',
    warrantyCompany: '',
    purchaseDate: '',
    warrantyMonths: 18,
    price: '',
    hasWindows: false,
    hasAntivirus: false,
    antivirusExpiration: ''
  });

  // Helper: Calculate Date + Months/Years
  const addTime = (dateStr: string, amount: number, unit: "month" | "year") => {
      if (!dateStr) return '';
      try {
          const date = new DateObject({ date: dateStr, calendar: persian, locale: persian_fa });
          date.add(amount, unit);
          return date.format();
      } catch (e) { return ''; }
  };

  // Logic: Auto-calculate Antivirus Expiration
  useEffect(() => {
      if (formData.hasAntivirus && formData.purchaseDate) {
          // If enabled, auto-set to 1 year from purchase date
          if (!formData.antivirusExpiration) {
            setFormData(prev => ({...prev, antivirusExpiration: addTime(prev.purchaseDate, 1, 'year')}));
          }
      } else if (!formData.hasAntivirus) {
          // If disabled, clear date
          setFormData(prev => ({...prev, antivirusExpiration: ''}));
      }
  }, [formData.hasAntivirus, formData.purchaseDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Calculate Warranty Expiration
    const warrantyExp = addTime(formData.purchaseDate, formData.warrantyMonths, 'month');

    const newSale: Sale = {
      id: editingSale ? editingSale.id : Date.now(),
      customerName: formData.customerName,
      phoneNumber: formData.phoneNumber,
      brand: formData.brand,
      model: formData.model,
      serialNumber: formData.serialNumber,
      warrantyCompany: formData.warrantyCompany,
      purchaseDate: formData.purchaseDate || new DateObject({ calendar: persian, locale: persian_fa }).format("YYYY/MM/DD"),
      warrantyMonths: Number(formData.warrantyMonths),
      warrantyExpiration: warrantyExp,
      price: Number(formData.price),
      hasWindows: formData.hasWindows,
      hasAntivirus: formData.hasAntivirus,
      antivirusExpiration: formData.antivirusExpiration
    };

    if (editingSale) {
      setSales(sales.map(s => s.id === newSale.id ? newSale : s));
    } else {
      setSales([newSale, ...sales]);
    }
    closeModal();
  };

  const openModal = (sale?: Sale) => {
    if (sale) {
      setEditingSale(sale);
      setFormData({
        customerName: sale.customerName,
        phoneNumber: sale.phoneNumber,
        brand: sale.brand,
        model: sale.model,
        serialNumber: sale.serialNumber,
        warrantyCompany: sale.warrantyCompany,
        purchaseDate: sale.purchaseDate,
        warrantyMonths: sale.warrantyMonths,
        price: String(sale.price),
        hasWindows: sale.hasWindows,
        hasAntivirus: sale.hasAntivirus,
        antivirusExpiration: sale.antivirusExpiration || ''
      });
    } else {
      setEditingSale(null);
      const today = new DateObject({ calendar: persian, locale: persian_fa }).format();
      setFormData({
        customerName: '',
        phoneNumber: '',
        brand: 'Asus', // Default
        model: '',
        serialNumber: '',
        warrantyCompany: 'سازگار ارقام', // Default
        purchaseDate: today, 
        warrantyMonths: 18,
        price: '',
        hasWindows: true, // Default true for convenience
        hasAntivirus: false,
        antivirusExpiration: ''
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingSale(null);
  };

  // Check Warranty Status Logic
  const checkDateStatus = (expirationDateStr?: string) => {
      if (!expirationDateStr) return { color: 'gray', label: '---' };
      try {
          const exp = new DateObject({ date: expirationDateStr, calendar: persian, locale: persian_fa });
          const today = new DateObject({ calendar: persian, locale: persian_fa });
          const diffDays = Math.ceil((exp.toUnix() - today.toUnix()) / (24 * 60 * 60));

          if (diffDays < 0) return { color: 'rose', label: 'منقضی شده' };
          if (diffDays < 30) return { color: 'amber', label: `${diffDays} روز مانده` };
          return { color: 'emerald', label: 'فعال' };
      } catch (e) { return { color: 'gray', label: 'نامعتبر' }; }
  };

  const expiringSales = sales.filter(s => checkDateStatus(s.warrantyExpiration).color === 'amber');

  return (
    <div className="space-y-6 relative">
      
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 bg-emerald-600 text-white px-6 py-3 rounded-xl shadow-2xl z-50 flex items-center gap-3 animate-fadeIn">
          <CheckCircle size={20} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">مدیریت فروش</h1>
          <p className="text-gray-500 mt-1">ثبت فاکتور لپ‌تاپ، گارانتی و خدمات نرم‌افزاری</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => openModal()}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all"
          >
            <Plus size={20} />
            <span>ثبت فروش جدید</span>
          </button>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 flex gap-4">
           <div className="flex-1 flex items-center bg-gray-50 rounded-xl px-4 py-2 border border-gray-100 focus-within:ring-2 focus-within:ring-indigo-100 focus-within:bg-white transition-all">
              <Search size={18} className="text-gray-400 ml-2" />
              <input 
                type="text" 
                placeholder="جستجو نام مشتری، مدل دستگاه یا سریال..." 
                className="bg-transparent border-none outline-none text-sm w-full text-gray-700 placeholder-gray-400"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
           </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">مشتری</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">دستگاه</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">خدمات نرم‌افزاری</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">گارانتی</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">آنتی‌ویروس</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">مبلغ کل</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sales.filter(s => s.customerName.includes(searchQuery) || s.model.includes(searchQuery)).map((sale) => {
                  const wStatus = checkDateStatus(sale.warrantyExpiration);
                  const avStatus = checkDateStatus(sale.antivirusExpiration);
                  
                  return (
                    <tr key={sale.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-800">{sale.customerName}</span>
                            <span className="text-xs text-gray-400">{sale.phoneNumber}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-gray-800 flex items-center gap-2">
                             <Laptop size={14} className="text-indigo-500" />
                             {sale.brand} {sale.model}
                          </span>
                          <span className="text-xs text-gray-400 font-mono flex items-center gap-1 mt-1">
                             <Hash size={12} />
                             {sale.serialNumber}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                         <div className="flex items-center gap-2">
                            {sale.hasWindows && (
                                <span className="bg-blue-50 text-blue-600 p-1.5 rounded-lg border border-blue-100" title="ویندوز نصب شده">
                                    <Monitor size={16} />
                                </span>
                            )}
                            {sale.hasAntivirus && (
                                <span className="bg-emerald-50 text-emerald-600 p-1.5 rounded-lg border border-emerald-100" title="آنتی‌ویروس نصب شده">
                                    <Shield size={16} />
                                </span>
                            )}
                            {!sale.hasWindows && !sale.hasAntivirus && <span className="text-gray-400 text-xs">-</span>}
                         </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                         <div className="flex flex-col">
                            <span className="text-xs font-medium text-gray-700">{sale.warrantyCompany}</span>
                            <span className={`text-[10px] mt-1 inline-flex items-center gap-1 text-${wStatus.color}-600`}>
                                <Clock size={10} />
                                {wStatus.label} (تا {sale.warrantyExpiration})
                            </span>
                         </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {sale.hasAntivirus ? (
                             <div className="flex flex-col">
                                <span className={`text-xs font-bold text-${avStatus.color}-600`}>
                                    {avStatus.label}
                                </span>
                                <span className="text-[10px] text-gray-400">تا {sale.antivirusExpiration}</span>
                             </div>
                        ) : (
                            <span className="text-gray-400 text-xs">ندارد</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-800">
                        {sale.price.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                            <button onClick={() => openModal(sale)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                <Edit size={16} />
                            </button>
                            <button className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                <Trash size={16} />
                            </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-visible animate-fadeIn">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h3 className="text-lg font-bold text-gray-800">
                        {editingSale ? 'ویرایش مشخصات فروش' : 'ثبت فروش لپ‌تاپ نو'}
                    </h3>
                    <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg p-1 transition-colors">
                        <X size={20} />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Customer Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">نام و نام خانوادگی مشتری</label>
                            <input 
                                required
                                type="text" 
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all outline-none"
                                value={formData.customerName}
                                onChange={e => setFormData({...formData, customerName: e.target.value})}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">شماره تماس</label>
                            <input 
                                required
                                type="text" 
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all outline-none"
                                value={formData.phoneNumber}
                                onChange={e => setFormData({...formData, phoneNumber: e.target.value})}
                            />
                        </div>
                    </div>

                    <div className="h-px bg-gray-100"></div>

                    {/* Device Info */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">برند دستگاه</label>
                            <div className="relative">
                                <select 
                                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all outline-none appearance-none"
                                    value={formData.brand}
                                    onChange={e => setFormData({...formData, brand: e.target.value})}
                                >
                                    {BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
                                </select>
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                    <Laptop size={16} />
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-medium text-gray-700">مدل دقیق</label>
                            <input 
                                required
                                type="text" 
                                placeholder="مثال: Legion 5 Pro 16IAH7"
                                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all outline-none"
                                value={formData.model}
                                onChange={e => setFormData({...formData, model: e.target.value})}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">شماره سریال (S/N)</label>
                            <input 
                                required
                                type="text" 
                                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all outline-none font-mono text-sm"
                                value={formData.serialNumber}
                                onChange={e => setFormData({...formData, serialNumber: e.target.value})}
                            />
                        </div>
                         <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">شرکت گارانتی</label>
                            <select 
                                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all outline-none"
                                value={formData.warrantyCompany}
                                onChange={e => setFormData({...formData, warrantyCompany: e.target.value})}
                            >
                                {WARRANTIES.map(w => <option key={w} value={w}>{w}</option>)}
                            </select>
                        </div>
                         <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">مدت گارانتی (ماه)</label>
                            <div className="relative">
                                <Clock className="absolute right-3 top-3 text-gray-400 w-5 h-5 pointer-events-none z-10" />
                                <input 
                                    type="number" 
                                    className="w-full pr-10 pl-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all outline-none"
                                    value={formData.warrantyMonths}
                                    onChange={e => setFormData({...formData, warrantyMonths: Number(e.target.value)})}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="h-px bg-gray-100"></div>

                    {/* Services & Dates */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                             <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">تاریخ خرید (فاکتور)</label>
                                <div className="relative">
                                    <Calendar className="absolute right-3 top-3 text-indigo-400 w-5 h-5 pointer-events-none z-10" />
                                    <DatePicker
                                        calendar={persian}
                                        locale={persian_fa}
                                        calendarPosition="top-right"
                                        value={formData.purchaseDate}
                                        onChange={(dateObject: any) => {
                                        const str = dateObject?.toString() || "";
                                        setFormData({...formData, purchaseDate: str})
                                        }}
                                        inputClass="rmdp-input"
                                        containerStyle={{ width: "100%" }}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">مبلغ نهایی فاکتور (تومان)</label>
                                <input 
                                    type="number" 
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all outline-none font-bold text-gray-800"
                                    value={formData.price}
                                    onChange={e => setFormData({...formData, price: e.target.value})}
                                />
                            </div>
                        </div>

                        <div className="bg-indigo-50/50 rounded-xl p-4 border border-indigo-100 space-y-4">
                            <h4 className="font-bold text-indigo-900 text-sm mb-2">خدمات نرم‌افزاری</h4>
                            
                            <label className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-xl cursor-pointer hover:border-indigo-300 transition-all">
                                <input 
                                    type="checkbox" 
                                    className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300"
                                    checked={formData.hasWindows}
                                    onChange={e => setFormData({...formData, hasWindows: e.target.checked})}
                                />
                                <div className="flex-1">
                                    <span className="block text-sm font-bold text-gray-800">نصب ویندوز و درایور</span>
                                    <span className="text-xs text-gray-500">ویندوز ۱۰/۱۱ نسخه اورجینال</span>
                                </div>
                                <Monitor size={20} className={formData.hasWindows ? 'text-indigo-500' : 'text-gray-300'} />
                            </label>

                            <label className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-xl cursor-pointer hover:border-indigo-300 transition-all">
                                <input 
                                    type="checkbox" 
                                    className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300"
                                    checked={formData.hasAntivirus}
                                    onChange={e => setFormData({...formData, hasAntivirus: