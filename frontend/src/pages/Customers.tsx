import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, Smartphone, MapPin, 
  ShoppingBag, Wrench, Star, MoreHorizontal, UserCheck, X,
  Calendar, CheckCircle, ArrowLeft, UploadCloud, Loader2, MessageSquare, Zap, ShieldAlert, Clock, Send
} from 'lucide-react';
import * as XLSX from 'xlsx';

// Types
type CustomerType = 'buyer' | 'service' | 'both';
type CustomerTag = 'warranty_expiring' | 'antivirus_expiring' | 'service_due';

interface Customer {
  id: number;
  name: string;
  phone: string;
  type: CustomerType;
  totalSpent: number;
  lastVisit: string;
  itemsBought: number;
  servicesCount: number;
  tags?: CustomerTag[]; // Added for smart filtering
}

// SMS Campaign Types
type SmsFilterType = 'all' | 'warranty_expiring' | 'antivirus_renewal' | 'periodic_service';

// Mock Data
const MOCK_CUSTOMERS: Customer[] = [
  {
    id: 1,
    name: 'رضا کمالی',
    phone: '09123334444',
    type: 'buyer', 
    totalSpent: 45000000,
    lastVisit: '1402/08/10',
    itemsBought: 1,
    servicesCount: 0,
    tags: ['warranty_expiring']
  },
  {
    id: 2,
    name: 'محمد حسینی',
    phone: '09121111111',
    type: 'service', 
    totalSpent: 1200000,
    lastVisit: '1402/08/15',
    itemsBought: 0,
    servicesCount: 1,
    tags: ['service_due']
  },
  {
    id: 3,
    name: 'سارا احمدی',
    phone: '09122222222',
    type: 'both', 
    totalSpent: 43000000, 
    lastVisit: '1402/08/10',
    itemsBought: 1,
    servicesCount: 1,
    tags: ['antivirus_expiring', 'warranty_expiring']
  },
  {
    id: 4,
    name: 'کیوان رحیمی',
    phone: '09350001122',
    type: 'buyer',
    totalSpent: 8500000,
    lastVisit: '1401/10/15',
    itemsBought: 1,
    servicesCount: 0
  },
  {
    id: 5,
    name: 'امید زند',
    phone: '09198887777',
    type: 'service', 
    totalSpent: 350000,
    lastVisit: '1403/01/20',
    itemsBought: 0,
    servicesCount: 2,
    tags: ['antivirus_expiring']
  }
];

const Customers: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>(MOCK_CUSTOMERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<CustomerType | 'all'>('all');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  
  // Import State
  const [isImporting, setIsImporting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // SMS Modal State
  const [isSmsModalOpen, setIsSmsModalOpen] = useState(false);
  const [smsFilter, setSmsFilter] = useState<SmsFilterType>('warranty_expiring');
  const [smsMessage, setSmsMessage] = useState('');
  const [isSendingSms, setIsSendingSms] = useState(false);
  const [targetCount, setTargetCount] = useState(0);

  const filteredCustomers = customers.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.phone.includes(searchQuery);
    const matchesFilter = filterType === 'all' || c.type === filterType;
    return matchesSearch && matchesFilter;
  });

  // Calculate target audience based on SMS filter
  useEffect(() => {
    let count = 0;
    let template = "";

    switch (smsFilter) {
        case 'all':
            count = customers.length;
            template = "مشتری گرامی {نام_مشتری}،\nجشنواره فروش ویژه فروشگاه ماستک شروع شد.\nمنتظر دیدار شما هستیم.";
            break;
        case 'warranty_expiring':
            count = customers.filter(c => c.tags?.includes('warranty_expiring')).length;
            template = "مشتری گرامی {نام_مشتری}،\nگارانتی دستگاه شما رو به پایان است. جهت تمدید گارانتی یا سرویس جنرال با ما تماس بگیرید.\nفروشگاه ماستک";
            break;
        case 'antivirus_renewal':
            count = customers.filter(c => c.tags?.includes('antivirus_expiring')).length;
            template = "سلام {نام_مشتری} عزیز،\nاعتبار لایسنس آنتی‌ویروس شما ظرف ۷ روز آینده به پایان می‌رسد. جهت تمدید آنلاین کلیک کنید:\nlink.com/renew";
            break;
        case 'periodic_service':
            count = customers.filter(c => c.tags?.includes('service_due')).length;
            template = "مشتری گرامی،\nزمان سرویس دوره‌ای لپ‌تاپ شما فرا رسیده است. سرویس به موقع عمر دستگاه شما را افزایش می‌دهد.\nفروشگاه ماستک";
            break;
    }
    setTargetCount(count);
    setSmsMessage(template);
  }, [smsFilter, customers]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsImporting(true);
      
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
            const bstr = evt.target?.result;
            const wb = XLSX.read(bstr, { type: 'binary' });
            const wsname = wb.SheetNames[0];
            const ws = wb.Sheets[wsname];
            const data = XLSX.utils.sheet_to_json(ws);
            
            // Map data to Customer structure
            const newCustomers: Customer[] = data.map((row: any, index: number) => {
                // Heuristic mapping for Persian or English headers
                const name = row['نام'] || row['نام مشتری'] || row['Name'] || row['name'] || 'کاربر ناشناس';
                const phone = row['تلفن'] || row['موبایل'] || row['شماره تماس'] || row['Phone'] || row['phone'] || '---';
                const typeRaw = row['نوع'] || row['نوع مشتری'] || row['Type'] || 'buyer';
                
                let type: CustomerType = 'buyer';
                if (String(typeRaw).toLowerCase().includes('خدمات') || String(typeRaw).toLowerCase().includes('service')) type = 'service';
                if (String(typeRaw).toLowerCase().includes('هر دو') || String(typeRaw).toLowerCase().includes('both') || String(typeRaw).toLowerCase().includes('vip')) type = 'both';

                return {
                    id: Date.now() + index,
                    name: String(name),
                    phone: String(phone),
                    type: type,
                    totalSpent: 0, // Default for imported
                    lastVisit: new Date().toLocaleDateString('fa-IR'),
                    itemsBought: 0,
                    servicesCount: 0,
                    tags: []
                };
            });

            if (newCustomers.length > 0) {
                setCustomers(prev => [...newCustomers, ...prev]);
                setToastMessage(`${newCustomers.length} مشتری با موفقیت افزوده شدند.`);
                setShowToast(true);
            } else {
                 setToastMessage('فایل اکسل خالی است یا ستون‌ها شناسایی نشدند.');
                 setShowToast(true);
            }

        } catch (error) {
            console.error('Excel Import Error:', error);
            setToastMessage('خطا در خواندن فایل اکسل. لطفا فرمت فایل را بررسی کنید.');
            setShowToast(true);
        } finally {
            setIsImporting(false);
            e.target.value = ''; // Reset input to allow re-uploading same file
            setTimeout(() => setShowToast(false), 4000);
        }
      };
      
      reader.readAsBinaryString(file);
    }
  };

  const handleSendSms = () => {
    setIsSendingSms(true);
    setTimeout(() => {
        setIsSendingSms(false);
        setIsSmsModalOpen(false);
        setToastMessage(`پیامک با موفقیت برای ${targetCount} نفر در صف ارسال قرار گرفت.`);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    }, 1500);
  };

  const getTypeBadge = (type: CustomerType) => {
    switch (type) {
      case 'buyer':
        return (
          <span className="px-3 py-1 inline-flex items-center gap-1.5 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
            <ShoppingBag size={12} />
            خریدار کالا
          </span>
        );
      case 'service':
        return (
          <span className="px-3 py-1 inline-flex items-center gap-1.5 text-xs font-semibold rounded-full bg-blue-50 text-blue-700 border border-blue-100">
            <Wrench size={12} />
            مشتری خدمات
          </span>
        );
      case 'both':
        return (
          <span className="px-3 py-1 inline-flex items-center gap-1.5 text-xs font-semibold rounded-full bg-purple-50 text-purple-700 border border-purple-100">
            <Star size={12} />
            مشتری وفادار (VIP)
          </span>
        );
    }
  };

  const getCustomerHistory = (customer: Customer) => {
    // Mock history generation
    const sales = customer.itemsBought > 0 ? [
        { id: 101, product: 'Lenovo Legion 5 Pro', date: '1402/08/10', price: 45000000, warranty: '18 ماه ماتریس' },
        ...(customer.itemsBought > 1 || customer.type === 'both' ? [{ id: 102, product: 'Logitech MX Master 3', date: '1402/08/10', price: 4500000, warranty: '12 ماه پانا' }] : [])
    ] : [];

    const repairs = customer.servicesCount > 0 ? [
        { id: 201, device: 'iPhone 13 Promax', service: 'تعویض ال‌سی‌دی', date: '1402/09/15', cost: 8500000, status: 'completed' },
        ...(customer.servicesCount > 1 ? [{ id: 202, device: 'HP Victus 15', service: 'سرویس دوره ای و خمیر سیلیکون', date: '1403/02/05', cost: 950000, status: 'in_progress' }] : [])
    ] : [];

    return { sales, repairs };
  };

  return (
    <div className="space-y-6 relative">
      
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 bg-emerald-600 text-white px-6 py-3 rounded-xl shadow-2xl z-50 flex items-center gap-3 animate-fadeIn">
          <CheckCircle size={20} />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">لیست مشتریان</h1>
          <p className="text-gray-500 mt-1">تفکیک خریداران کالا و دریافت‌کنندگان خدمات فنی</p>
        </div>
        <div className="flex gap-3">
            <button 
                onClick={() => setIsSmsModalOpen(true)}
                className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all"
            >
                <MessageSquare size={20} />
                <span className="hidden sm:inline">ارسال پیامک هوشمند</span>
            </button>
            <label 
                className={`
                cursor-pointer flex items-center gap-2 bg-white text-gray-600 border border-gray-200 px-4 py-2.5 rounded-xl hover:bg-gray-50 transition-all shadow-sm
                ${isImporting ? 'opacity-70 pointer-events-none' : ''}
                `}
            >
                {isImporting ? (
                <Loader2 size={20} className="animate-spin" />
                ) : (
                <UploadCloud size={20} />
                )}
                <span className="hidden sm:inline">
                {isImporting ? 'در حال پردازش...' : 'وارد کردن لیست اکسل'}
                </span>
                <input 
                type="file" 
                className="hidden" 
                accept=".xlsx,.xls,.csv" 
                onChange={handleFileUpload}
                />
            </label>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row gap-4">
           <div className="flex-1 flex items-center bg-gray-50 rounded-xl px-4 py-2 border border-gray-100 focus-within:ring-2 focus-within:ring-indigo-100 focus-within:bg-white transition-all">
              <Search size={18} className="text-gray-400 ml-2" />
              <input 
                type="text" 
                placeholder="جستجو نام مشتری یا شماره تماس..." 
                className="bg-transparent border-none outline-none text-sm w-full text-gray-700 placeholder-gray-400"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
           </div>
           
           <div className="flex items-center gap-2 bg-white rounded-xl">
              <div className="relative">
                <Filter size={18} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value as CustomerType | 'all')}
                    className="pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all cursor-pointer appearance-none min-w-[180px]"
                >
                    <option value="all">همه مشتریان</option>
                    <option value="buyer">خریداران کالا</option>
                    <option value="service">مشتریان خدمات</option>
                    <option value="both">مشتریان وفادار (VIP)</option>
                </select>
              </div>
           </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">نام مشتری</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">نوع مشتری</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">تاریخ آخرین مراجعه</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">تعداد خرید</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">تعداد خدمات</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">جمع کل (تومان)</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredCustomers.map((customer) => (
                <tr 
                    key={customer.id} 
                    onClick={() => setSelectedCustomer(customer)}
                    className="hover:bg-indigo-50/30 transition-colors cursor-pointer group"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-transform group-hover:scale-110 ${customer.type === 'buyer' ? 'bg-emerald-100 text-emerald-600' : customer.type === 'service' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}>
                            {customer.name.charAt(0)}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-800 group-hover:text-indigo-600 transition-colors">{customer.name}</span>
                            <span className="text-xs text-gray-400 flex items-center gap-1">
                                <Smartphone size={10} />
                                {customer.phone}
                            </span>
                        </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getTypeBadge(customer.type)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {customer.lastVisit}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 text-center">
                    {customer.itemsBought > 0 ? (
                        <span className="font-bold text-gray-800">{customer.itemsBought} دستگاه</span>
                    ) : (
                        <span className="text-gray-300">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 text-center">
                    {customer.servicesCount > 0 ? (
                        <span className="font-bold text-gray-800">{customer.servicesCount} مورد</span>
                    ) : (
                        <span className="text-gray-300">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-800">
                    {customer.totalSpent.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button className="p-2 text-gray-400 hover:bg-gray-200 hover:text-gray-600 rounded-lg transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Detail Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex justify-between items-start bg-gray-50/50">
                    <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold ${selectedCustomer.type === 'buyer' ? 'bg-emerald-100 text-emerald-600' : selectedCustomer.type === 'service' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}>
                            {selectedCustomer.name.charAt(0)}
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-800">{selectedCustomer.name}</h3>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-gray-500 text-sm flex items-center gap-1">
                                    <Smartphone size={14} />
                                    {selectedCustomer.phone}
                                </span>
                                <span className="text-gray-300">|</span>
                                {getTypeBadge(selectedCustomer.type)}
                            </div>
                        </div>
                    </div>
                    <button 
                        onClick={() => setSelectedCustomer(null)}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto space-y-8">
                        {(() => {
                        const { sales, repairs } = getCustomerHistory(selectedCustomer);
                        return (
                            <>
                                {sales.length > 0 && (
                                    <div className="space-y-3">
                                        <h4 className="flex items-center gap-2 text-lg font-bold text-gray-800">
                                            <div className="p-1.5 bg-emerald-100 text-emerald-600 rounded-lg">
                                                <ShoppingBag size={18} />
                                            </div>
                                            سوابق خرید
                                        </h4>
                                        <div className="grid gap-3">
                                            {sales.map(sale => (
                                                <div key={sale.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:border-emerald-200 hover:bg-emerald-50/30 transition-all">
                                                    <div>
                                                        <p className="font-bold text-gray-800">{sale.product}</p>
                                                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                                                            <CheckCircle size={12} className="text-emerald-500"/>
                                                            گارانتی: {sale.warranty}
                                                        </p>
                                                    </div>
                                                    <div className="text-left">
                                                        <p className="font-bold text-gray-800">{sale.price.toLocaleString()} تومان</p>
                                                        <p className="text-xs text-gray-400 mt-1 flex items-center justify-end gap-1">
                                                            <Calendar size={12} />
                                                            {sale.date}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {repairs.length > 0 && (
                                    <div className="space-y-3">
                                        <h4 className="flex items-center gap-2 text-lg font-bold text-gray-800">
                                            <div className="p-1.5 bg-blue-100 text-blue-600 rounded-lg">
                                                <Wrench size={18} />
                                            </div>
                                            سوابق تعمیرات
                                        </h4>
                                        <div className="grid gap-3">
                                            {repairs.map(repair => (
                                                <div key={repair.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:border-blue-200 hover:bg-blue-50/30 transition-all">
                                                    <div>
                                                        <p className="font-bold text-gray-800">{repair.device}</p>
                                                        <p className="text-sm text-gray-600 mt-1">{repair.service}</p>
                                                    </div>
                                                    <div className="text-left">
                                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium mb-1 ${repair.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                                            {repair.status === 'completed' ? 'تکمیل شده' : 'در حال انجام'}
                                                        </span>
                                                        <p className="font-bold text-gray-800 text-sm">{repair.cost.toLocaleString()} تومان</p>
                                                        <p className="text-xs text-gray-400 mt-0.5 flex items-center justify-end gap-1">
                                                            <Calendar size={12} />
                                                            {repair.date}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </>
                        );
                        })()}
                </div>
                
                {/* Footer */}
                <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
                    <div className="flex flex-col">
                        <span className="text-xs text-gray-500">مجموع پرداختی</span>
                        <span className="text-lg font-bold text-gray-800">{selectedCustomer.totalSpent.toLocaleString()} تومان</span>
                    </div>
                    <button 
                        onClick={() => setSelectedCustomer(null)}
                        className="px-6 py-2 bg-gray-800 text-white rounded-xl hover:bg-gray-700 transition-colors text-sm font-medium"
                    >
                        بستن
                    </button>
                </div>
            </div>
        </div>
        )}

        {/* Smart SMS Modal */}
        {isSmsModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm animate-fadeIn">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                                <Zap size={20} />
                            </div>
                            <h3 className="text-lg font-bold text-gray-800">پنل ارسال پیامک هوشمند</h3>
                        </div>
                        <button onClick={() => setIsSmsModalOpen(false)} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg p-1 transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="p-6 space-y-6">
                        {/* Step 1: Filter */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">هدف کمپین (فیلتر مخاطبین)</label>
                            <div className="grid grid-cols-2 gap-3">
                                <button 
                                    onClick={() => setSmsFilter('warranty_expiring')}
                                    className={`p-3 rounded-xl border text-sm font-medium flex flex-col items-center justify-center gap-2 transition-all ${smsFilter === 'warranty_expiring' ? 'bg-amber-50 border-amber-200 text-amber-700 ring-2 ring-amber-100' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                                >
                                    <ShieldAlert size={20} />
                                    انقضای گارانتی
                                </button>
                                <button 
                                    onClick={() => setSmsFilter('antivirus_renewal')}
                                    className={`p-3 rounded-xl border text-sm font-medium flex flex-col items-center justify-center gap-2 transition-all ${smsFilter === 'antivirus_renewal' ? 'bg-emerald-50 border-emerald-200 text-emerald-700 ring-2 ring-emerald-100' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                                >
                                    <CheckCircle size={20} />
                                    تمدید آنتی‌ویروس
                                </button>
                                <button 
                                    onClick={() => setSmsFilter('periodic_service')}
                                    className={`p-3 rounded-xl border text-sm font-medium flex flex-col items-center justify-center gap-2 transition-all ${smsFilter === 'periodic_service' ? 'bg-blue-50 border-blue-200 text-blue-700 ring-2 ring-blue-100' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                                >
                                    <Clock size={20} />
                                    سرویس دوره‌ای
                                </button>
                                <button 
                                    onClick={() => setSmsFilter('all')}
                                    className={`p-3 rounded-xl border text-sm font-medium flex flex-col items-center justify-center gap-2 transition-all ${smsFilter === 'all' ? 'bg-gray-800 text-white border-gray-800' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                                >
                                    <UserCheck size={20} />
                                    همه مشتریان
                                </button>
                            </div>
                            <p className="text-xs text-indigo-600 mt-2 flex items-center gap-1 bg-indigo-50 p-2 rounded-lg inline-block">
                                <UserCheck size={12} />
                                تعداد مخاطبین یافت شده: <b>{targetCount} نفر</b>
                            </p>
                        </div>

                        {/* Step 2: Message */}
                        <div className="space-y-2">
                             <div className="flex justify-between items-center">
                                <label className="text-sm font-medium text-gray-700">متن پیامک</label>
                                <span className="text-xs text-gray-400">{smsMessage.length} / 160 کاراکتر</span>
                             </div>
                             <textarea 
                                value={smsMessage}
                                onChange={(e) => setSmsMessage(e.target.value)}
                                rows={4}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all outline-none resize-none text-sm leading-relaxed"
                             />
                             <div className="flex flex-wrap gap-2">
                                <span className="text-xs text-gray-500">متغیرهای هوشمند:</span>
                                {['{نام_مشتری}', '{شماره_فاکتور}', '{نام_دستگاه}'].map(tag => (
                                    <button 
                                        key={tag}
                                        onClick={() => setSmsMessage(prev => prev + ' ' + tag)}
                                        className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs text-gray-600 transition-colors"
                                    >
                                        {tag}
                                    </button>
                                ))}
                             </div>
                        </div>
                    </div>

                    <div className="p-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
                        <button 
                            onClick={() => setIsSmsModalOpen(false)}
                            className="px-5 py-2.5 text-gray-600 hover:bg-gray-200 font-medium rounded-xl transition-colors"
                        >
                            انصراف
                        </button>
                        <button 
                            onClick={handleSendSms}
                            disabled={isSendingSms || targetCount === 0}
                            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isSendingSms ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                            <span>ارسال به {targetCount} نفر</span>
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default Customers;