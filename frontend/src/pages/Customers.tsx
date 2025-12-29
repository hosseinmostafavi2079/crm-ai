import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, Smartphone, MapPin, 
  ShoppingBag, Wrench, Star, MoreHorizontal, UserCheck, X,
  Calendar, CheckCircle, ArrowLeft, UploadCloud, Loader2, MessageSquare, Zap, ShieldAlert, Clock, Send, Laptop, Shield, Monitor, ShieldCheck, CalendarDays, BellRing, AlertTriangle, FileSpreadsheet, History, Mail, FileText, Activity, PlusCircle, Hash
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { DateObject } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

// Types
type CustomerType = 'buyer' | 'service' | 'both';

interface DeviceInfo {
    id: number; // Unique ID of the record
    brand: string;
    model: string;
    serial: string;
    warrantyExp: string;
    antivirus: string;
    antivirusExp: string; 
    hasWindows: boolean;
    receptionDate: string;
}

interface Customer {
  // We use phone as the unique key for aggregation
  name: string;
  phone: string;
  type: CustomerType;
  totalSpent: number;
  itemsBought: number;
  devices: DeviceInfo[]; // Array of all devices
}

interface CustomerHistory {
    id: number;
    type: 'sale' | 'repair' | 'sms';
    date: string;
    title: string;
    details: string;
    cost?: number;
    status?: string;
}

const logSystemAction = (action: string, details: string, type: 'create' | 'update' | 'delete' | 'renew') => {
    const logs = JSON.parse(localStorage.getItem('system_logs') || '[]');
    const date = new DateObject({ calendar: persian, locale: persian_fa }).format("YYYY/MM/DD HH:mm:ss");
    logs.push({
        id: Date.now(),
        action,
        details,
        user: 'مدیر سیستم', 
        timestamp: date,
        type
    });
    localStorage.setItem('system_logs', JSON.stringify(logs));
};

const Customers: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<CustomerType | 'all'>('all');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  
  // History State
  const [customerHistory, setCustomerHistory] = useState<CustomerHistory[]>([]);
  const [activeModalTab, setActiveModalTab] = useState<'info' | 'history'>('info');

  // Import State
  const [isImporting, setIsImporting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Renew & SMS State
  const [isRenewModalOpen, setIsRenewModalOpen] = useState(false);
  const [isSmsModalOpen, setIsSmsModalOpen] = useState(false);
  const [targetDevice, setTargetDevice] = useState<DeviceInfo | null>(null);
  const [renewTarget, setRenewTarget] = useState<'warranty' | 'antivirus'>('warranty');
  const [renewDuration, setRenewDuration] = useState<number>(12); // Months
  const [smsText, setSmsText] = useState('');

  // --- Helper: Calculate Days Remaining ---
  const getDaysRemaining = (dateStr: string) => {
      if (!dateStr || dateStr.length < 6) return -9999; 
      try {
          const targetDate = new DateObject({ date: dateStr, calendar: persian, locale: persian_fa });
          const today = new DateObject({ calendar: persian, locale: persian_fa });
          const diffTime = targetDate.toUnix() - today.toUnix();
          const diffDays = Math.ceil(diffTime / (60 * 60 * 24));
          return diffDays;
      } catch (e) {
          return -9999;
      }
  };

  // LOAD DATA
  const loadCustomers = () => {
    const savedSales = localStorage.getItem('service_records');
    const salesRecords: any[] = savedSales ? JSON.parse(savedSales) : [];

    const customerMap = new Map<string, Customer>();

    salesRecords.forEach(rec => {
        const phone = rec.phoneNumber ? String(rec.phoneNumber) : '';
        if (!phone) return;

        const price = parseInt(String(rec.totalPrice).replace(/,/g, '')) || 0;
        const avExp = rec.antivirusExpiration || ''; 

        const newDevice: DeviceInfo = {
            id: rec.id,
            brand: rec.brand,
            model: rec.model,
            serial: rec.serialNumber,
            warrantyExp: rec.warrantyExpiration,
            antivirus: rec.antivirusType === 'none' ? 'غیرفعال' : (rec.antivirusType === 'single' ? 'تک کاربره' : 'دو کاربره'),
            antivirusExp: avExp,
            hasWindows: rec.hasWindows,
            receptionDate: rec.receptionDate
        };

        if (customerMap.has(phone)) {
            const existing = customerMap.get(phone)!;
            existing.totalSpent += price;
            existing.itemsBought += 1;
            existing.devices.push(newDevice); 
            if (rec.customerName) existing.name = rec.customerName; 
        } else {
            customerMap.set(phone, {
                name: rec.customerName || 'بدون نام',
                phone: phone,
                type: 'buyer', 
                totalSpent: price,
                itemsBought: 1,
                devices: [newDevice]
            });
        }
    });

    setCustomers(Array.from(customerMap.values()).reverse());
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  // --- BUILD HISTORY ---
  useEffect(() => {
      if (selectedCustomer) {
          const sales: any[] = JSON.parse(localStorage.getItem('service_records') || '[]');
          const repairs: any[] = JSON.parse(localStorage.getItem('repair_records') || '[]');
          const smsLogs: any[] = JSON.parse(localStorage.getItem('sms_logs') || '[]');
          
          const history: CustomerHistory[] = [];

          // 1. Add Sales
          sales.filter(s => String(s.phoneNumber) === selectedCustomer.phone).forEach(s => {
              history.push({
                  id: s.id,
                  type: 'sale',
                  date: s.receptionDate,
                  title: 'خرید / پذیرش',
                  details: `دستگاه: ${s.brand} ${s.model} - سریال: ${s.serialNumber}`,
                  cost: parseInt(String(s.totalPrice).replace(/,/g, '')),
                  status: 'completed'
              });
          });

          // 2. Add Repairs
          repairs.filter(r => String(r.phoneNumber) === selectedCustomer.phone).forEach(r => {
              history.push({
                  id: r.id,
                  type: 'repair',
                  date: r.serviceDate,
                  title: 'تعمیرات',
                  details: `دستگاه: ${r.deviceModel} - ${r.serviceType === 'hardware' ? 'سخت‌افزاری' : 'نرم‌افزاری'}`,
                  cost: r.cost,
                  status: r.status
              });
          });

          // 3. Add SMS
          smsLogs.filter(msg => String(msg.recipientPhone) === selectedCustomer.phone).forEach(msg => {
              history.push({
                  id: msg.id,
                  type: 'sms',
                  date: msg.sentDate.split(' ')[0],
                  title: 'ارسال پیامک',
                  details: `متن: ${msg.messageContent.substring(0, 40)}...`,
                  status: 'sent'
              });
          });

          history.sort((a, b) => b.date.localeCompare(a.date));
          setCustomerHistory(history);
      }
  }, [selectedCustomer]);


  const filteredCustomers = customers.filter(c => {
    const query = searchQuery ? searchQuery.toLowerCase() : '';
    const name = c.name ? String(c.name).toLowerCase() : '';
    const phone = c.phone ? String(c.phone) : '';

    const matchesSearch = name.includes(query) || phone.includes(query);
    const matchesFilter = filterType === 'all' || c.type === filterType;
    return matchesSearch && matchesFilter;
  });

  // --- ACTIONS ---

  const handleRenewClick = (device: DeviceInfo, type: 'warranty' | 'antivirus') => {
      setTargetDevice(device);
      setRenewTarget(type);
      setRenewDuration(12);
      setIsRenewModalOpen(true);
  };

  const handleSmsClick = (device: DeviceInfo) => {
      setTargetDevice(device);
      setSmsText(`مشتری گرامی، سرویس دستگاه ${device.brand} ${device.model} شما رو به اتمام است. لطفا جهت تمدید اقدام نمایید.`);
      setIsSmsModalOpen(true);
  };

  const handleConfirmRenew = () => {
      if (!selectedCustomer || !targetDevice) return;

      let currentExpStr = renewTarget === 'warranty' ? targetDevice.warrantyExp : targetDevice.antivirusExp;
      let dateObj;
      try {
        if(currentExpStr && currentExpStr.length > 5) {
            dateObj = new DateObject({ date: currentExpStr, calendar: persian, locale: persian_fa });
            const today = new DateObject({ calendar: persian, locale: persian_fa });
            if (dateObj.toUnix() < today.toUnix()) dateObj = today; // If expired, start from today
        } else {
            dateObj = new DateObject({ calendar: persian, locale: persian_fa });
        }
      } catch {
        dateObj = new DateObject({ calendar: persian, locale: persian_fa });
      }

      dateObj.add(renewDuration, "months");
      const newDateStr = dateObj.format();

      // Update LocalStorage
      const savedSales = JSON.parse(localStorage.getItem('service_records') || '[]');
      const updatedSales = savedSales.map((record: any) => {
          if (record.id === targetDevice.id) {
              const updatedRecord = { ...record };
              if (renewTarget === 'warranty') {
                  updatedRecord.warrantyExpiration = newDateStr;
                  updatedRecord.description = (record.description || '') + ` | تمدید گارانتی (${renewDuration} ماه) در ${new Date().toLocaleDateString('fa-IR')}`;
              } else {
                  updatedRecord.antivirusExpiration = newDateStr; 
                  if (updatedRecord.antivirusType === 'none') updatedRecord.antivirusType = 'single';
                  updatedRecord.description = (record.description || '') + ` | تمدید آنتی‌ویروس (${renewDuration} ماه) در ${new Date().toLocaleDateString('fa-IR')}`;
              }
              return updatedRecord;
          }
          return record;
      });
      localStorage.setItem('service_records', JSON.stringify(updatedSales));
      
      logSystemAction('تمدید سرویس', `تمدید ${renewTarget === 'warranty' ? 'گارانتی' : 'آنتی‌ویروس'} برای ${selectedCustomer.name} (دستگاه ${targetDevice.model})`, 'renew');

      // Auto SMS
      const smsConfig = JSON.parse(localStorage.getItem('sms_config') || '{}');
      if (smsConfig.sendOnRenewal !== false) { 
           const message = `مشتری گرامی، ${renewTarget === 'warranty' ? 'گارانتی' : 'آنتی‌ویروس'} دستگاه ${targetDevice.model} تا ${newDateStr} تمدید شد.`;
           const smsLogs = JSON.parse(localStorage.getItem('sms_logs') || '[]');
           smsLogs.push({
               id: Date.now() + Math.random(),
               recipientName: selectedCustomer.name,
               recipientPhone: selectedCustomer.phone,
               category: 'تاییدیه تمدید',
               messageContent: message,
               sentDate: new DateObject({ calendar: persian, locale: persian_fa }).format("YYYY/MM/DD HH:mm:ss"),
               status: 'sent'
           });
           localStorage.setItem('sms_logs', JSON.stringify(smsLogs));
           setToastMessage('تمدید انجام شد و پیامک ارسال گردید.');
      } else {
           setToastMessage('تمدید با موفقیت ثبت شد.');
      }

      // Reload
      loadCustomers();
      
      // Immediate UI Update
      const updatedDeviceList = selectedCustomer.devices.map(d => {
          if (d.id === targetDevice.id) {
              const n = {...d};
              if (renewTarget === 'warranty') n.warrantyExp = newDateStr;
              else {
                  n.antivirusExp = newDateStr;
                  if (n.antivirus === 'غیرفعال') n.antivirus = 'تک کاربره';
              }
              return n;
          }
          return d;
      });
      setSelectedCustomer({...selectedCustomer, devices: updatedDeviceList});

      setShowToast(true);
      setIsRenewModalOpen(false);
      setTimeout(() => setShowToast(false), 4000);
  };

  const handleSendDeviceSms = () => {
      if (!selectedCustomer || !targetDevice) return;

      const smsLogs = JSON.parse(localStorage.getItem('sms_logs') || '[]');
      smsLogs.push({
           id: Date.now() + Math.random(),
           recipientName: selectedCustomer.name,
           recipientPhone: selectedCustomer.phone,
           category: 'یادآوری دستی',
           messageContent: `${smsText} (مدل: ${targetDevice.model})`,
           sentDate: new DateObject({ calendar: persian, locale: persian_fa }).format("YYYY/MM/DD HH:mm:ss"),
           status: 'sent'
      });
      localStorage.setItem('sms_logs', JSON.stringify(smsLogs));
      
      setToastMessage('پیامک با موفقیت در صف ارسال قرار گرفت.');
      setShowToast(true);
      setIsSmsModalOpen(false);
      setTimeout(() => setShowToast(false), 3000);
      
      // Update history tab immediately
      setCustomerHistory(prev => [{
          id: Date.now(),
          type: 'sms',
          date: new DateObject({ calendar: persian, locale: persian_fa }).format("YYYY/MM/DD"),
          title: 'ارسال پیامک',
          details: `برای ${targetDevice.model}: ${smsText.substring(0, 20)}...`,
          status: 'sent'
      }, ...prev]);
  };

  // UI Helpers
  const getTypeBadge = (type: CustomerType) => {
    switch (type) {
      case 'buyer': return <span className="px-3 py-1 inline-flex items-center gap-1.5 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100"><ShoppingBag size={12} />خریدار کالا</span>;
      case 'service': return <span className="px-3 py-1 inline-flex items-center gap-1.5 text-xs font-semibold rounded-full bg-blue-50 text-blue-700 border border-blue-100"><Wrench size={12} />مشتری خدمات</span>;
      case 'both': return <span className="px-3 py-1 inline-flex items-center gap-1.5 text-xs font-semibold rounded-full bg-purple-50 text-purple-700 border border-purple-100"><Star size={12} />مشتری وفادار (VIP)</span>;
    }
  };

  const renderStatusBadge = (days: number, label: string) => {
      if (days === -9999) return <span className="text-[10px] text-gray-300">ثبت نشده</span>;
      if (days < 0) return <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-bold">منقضی شده</span>;
      if (days <= 30) return <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-bold animate-pulse">رو به اتمام ({days} روز)</span>;
      return <span className="text-[10px] bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded font-bold">فعال</span>;
  };

  const handleExportExcel = () => {
    const flatData: any[] = [];

    // Loop through customers and then their devices to create a flat structure
    filteredCustomers.forEach(c => {
        c.devices.forEach(d => {
            flatData.push({
                'نام مشتری': c.name,
                'شماره تماس': c.phone,
                'برند دستگاه': d.brand,
                'مدل': d.model,
                'شماره سریال': d.serial,
                'تاریخ پذیرش': d.receptionDate,
                'وضعیت ویندوز': d.hasWindows ? 'دارد' : 'ندارد',
                'وضعیت آنتی‌ویروس': d.antivirus,
                'انقضای آنتی‌ویروس': d.antivirusExp || '-',
                'انقضای گارانتی': d.warrantyExp || '-',
                'هزینه کل (مشتری)': c.totalSpent.toLocaleString() // Note: This is total per customer, not per device, as per original data structure
            });
        });
    });

    const ws = XLSX.utils.json_to_sheet(flatData);
    
    // Auto-width for better readability
    const wscols = [
        {wch: 20}, // Name
        {wch: 15}, // Phone
        {wch: 15}, // Brand
        {wch: 20}, // Model
        {wch: 20}, // Serial
        {wch: 15}, // Date
        {wch: 10}, // Win
        {wch: 15}, // Antivirus
        {wch: 15}, // AV Exp
        {wch: 15}, // Warranty Exp
        {wch: 15}, // Total Cost
    ];
    ws['!cols'] = wscols;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Customers_Devices");
    XLSX.writeFile(wb, "Customers_Detailed.xlsx");
    
    setToastMessage('خروجی جامع اکسل (به تفکیک دستگاه) ایجاد شد.');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <div className="space-y-6 relative">
      
      {showToast && (
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 bg-emerald-600 text-white px-6 py-3 rounded-xl shadow-2xl z-50 flex items-center gap-3 animate-fadeIn">
          <CheckCircle size={20} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">لیست مشتریان</h1>
          <p className="text-gray-500 mt-1">مدیریت یکپارچه مشتریان و سوابق دستگاه‌ها</p>
        </div>
        <div className="flex flex-wrap gap-3">
            <button onClick={handleExportExcel} className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all">
                <FileSpreadsheet size={20} />
                <span className="hidden sm:inline">خروجی اکسل جامع</span>
            </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4 justify-between items-center">
           <div className="flex items-center bg-gray-50 rounded-xl px-4 py-2 border border-gray-100 focus-within:ring-2 focus-within:ring-indigo-100 w-full sm:w-96">
              <Search size={18} className="text-gray-400 ml-2" />
              <input 
                type="text" 
                placeholder="جستجو..." 
                className="bg-transparent border-none outline-none text-sm w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
           </div>
           
           <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 hover:border-indigo-200 transition-colors w-full sm:w-auto">
                  <Filter size={16} className="text-gray-400" />
                  <select 
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value as any)}
                    className="bg-transparent border-none outline-none text-sm text-gray-700 font-medium cursor-pointer w-full"
                  >
                    <option value="all">همه مشتریان</option>
                    <option value="buyer">خریداران کالا</option>
                    <option value="service">مشتریان خدمات</option>
                    <option value="both">مشتریان وفادار (VIP)</option>
                  </select>
              </div>
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">مشتری</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">وضعیت</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">تعداد دستگاه</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">آخرین مراجعه</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredCustomers.map((customer) => (
                <tr 
                    key={customer.phone} 
                    onClick={() => { setSelectedCustomer(customer); setActiveModalTab('info'); }}
                    className="hover:bg-indigo-50/30 transition-colors cursor-pointer group"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-transform group-hover:scale-110 ${customer.type === 'buyer' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}`}>
                            {customer.name ? customer.name.charAt(0) : '?'}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-800">{customer.name}</span>
                            <span className="text-xs text-gray-400 font-mono">{customer.phone}</span>
                        </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">{getTypeBadge(customer.type)}</td>
                  <td className="px-6 py-4">
                     <span className="text-sm font-bold text-gray-700 bg-gray-100 px-3 py-1 rounded-lg">
                         {customer.itemsBought} دستگاه
                     </span>
                  </td>
                   <td className="px-6 py-4 text-sm text-gray-600 font-mono">
                     {customer.devices.length > 0 ? customer.devices[customer.devices.length - 1].receptionDate : '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <button className="p-2 text-gray-400 hover:bg-gray-200 rounded-lg">
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
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
                <div className="p-6 border-b border-gray-100 flex justify-between items-start bg-gray-50/50">
                    <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold ${selectedCustomer.type === 'buyer' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}`}>
                            {selectedCustomer.name.charAt(0)}
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-800">{selectedCustomer.name}</h3>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-gray-500 text-sm font-mono">{selectedCustomer.phone}</span>
                                {getTypeBadge(selectedCustomer.type)}
                            </div>
                        </div>
                    </div>
                    <button onClick={() => setSelectedCustomer(null)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex border-b border-gray-100 px-6">
                    <button onClick={() => setActiveModalTab('info')} className={`py-3 px-4 text-sm font-bold border-b-2 transition-colors ${activeModalTab === 'info' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500'}`}>
                        لیست دستگاه‌ها ({selectedCustomer.devices.length})
                    </button>
                    <button onClick={() => setActiveModalTab('history')} className={`py-3 px-4 text-sm font-bold border-b-2 transition-colors ${activeModalTab === 'history' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500'}`}>
                        تاریخچه تعاملات ({customerHistory.length})
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1 bg-gray-50/30">
                    {activeModalTab === 'info' && (
                        <div className="space-y-4 animate-fadeIn">
                            {selectedCustomer.devices.map((device, idx) => (
                                <div key={idx} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-1 h-full bg-indigo-500"></div>
                                    <div className="flex justify-between items-start mb-4 pl-2">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
                                                <Laptop size={24} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-800 text-lg">{device.brand} {device.model}</h4>
                                                <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                                                    <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded">SN: {device.serial}</span>
                                                    <span>•</span>
                                                    <span>خرید: {device.receptionDate}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => handleSmsClick(device)}
                                            className="flex items-center gap-1.5 text-xs bg-white border border-indigo-200 text-indigo-600 px-3 py-2 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                                        >
                                            <MessageSquare size={16} />
                                            ارسال پیامک
                                        </button>
                                    </div>

                                    {/* Services Grid */}
                                    <div className="grid grid-cols-2 gap-3 mb-4">
                                        <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Monitor size={16} className={device.hasWindows ? 'text-blue-500' : 'text-gray-400'} />
                                                <span className="text-xs text-gray-600">نصب ویندوز:</span>
                                            </div>
                                            <span className={`text-xs font-bold ${device.hasWindows ? 'text-blue-600' : 'text-gray-400'}`}>
                                                {device.hasWindows ? 'دارد' : 'خیر'}
                                            </span>
                                        </div>
                                        <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Shield size={16} className={device.antivirus !== 'غیرفعال' ? 'text-emerald-500' : 'text-gray-400'} />
                                                <span className="text-xs text-gray-600">آنتی‌ویروس:</span>
                                            </div>
                                            <span className={`text-xs font-bold ${device.antivirus !== 'غیرفعال' ? 'text-emerald-600' : 'text-gray-400'}`}>
                                                {device.antivirus}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-gray-100">
                                        {/* Warranty */}
                                        <div className="flex items-center justify-between">
                                            <div className="flex flex-col">
                                                <span className="text-xs text-gray-500 mb-0.5">وضعیت گارانتی</span>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-mono font-bold text-gray-800">{device.warrantyExp || '---'}</span>
                                                    {renderStatusBadge(getDaysRemaining(device.warrantyExp), '')}
                                                </div>
                                            </div>
                                            <button onClick={() => handleRenewClick(device, 'warranty')} className="text-[10px] text-indigo-600 hover:bg-indigo-50 px-2 py-1 rounded font-bold">تمدید</button>
                                        </div>

                                        {/* Antivirus Expiry */}
                                        <div className="flex items-center justify-between">
                                            <div className="flex flex-col">
                                                <span className="text-xs text-gray-500 mb-0.5">انقضای آنتی‌ویروس</span>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-mono font-bold text-gray-800">{device.antivirusExp || '---'}</span>
                                                    {device.antivirus !== 'غیرفعال' && renderStatusBadge(getDaysRemaining(device.antivirusExp), '')}
                                                </div>
                                            </div>
                                            <button onClick={() => handleRenewClick(device, 'antivirus')} className="text-[10px] text-indigo-600 hover:bg-indigo-50 px-2 py-1 rounded font-bold">
                                                {device.antivirus === 'غیرفعال' ? 'خرید' : 'تمدید'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeModalTab === 'history' && (
                        <div className="space-y-4 animate-fadeIn">
                             <div className="relative border-r-2 border-gray-200 mr-2 space-y-6 pr-6">
                                {customerHistory.length === 0 ? (
                                    <p className="text-sm text-gray-400">هیچ سابقه‌ای یافت نشد.</p>
                                ) : (
                                    customerHistory.map((item, idx) => (
                                        <div key={idx} className="relative">
                                            <div className="absolute -right-[31px] top-0 w-4 h-4 rounded-full border-2 border-white bg-gray-300 ring-2 ring-gray-100"></div>
                                            <div className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm">
                                                <div className="flex justify-between items-start mb-1">
                                                    <span className="text-xs font-bold text-gray-700">{item.title}</span>
                                                    <span className="text-[10px] text-gray-400 font-mono">{item.date}</span>
                                                </div>
                                                <p className="text-xs text-gray-600 leading-relaxed">{item.details}</p>
                                                {item.cost && <p className="text-xs font-bold text-gray-800 mt-2">{item.cost.toLocaleString()} تومان</p>}
                                            </div>
                                        </div>
                                    ))
                                )}
                             </div>
                        </div>
                    )}
                </div>
                
                <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
                    <div className="flex flex-col">
                        <span className="text-xs text-gray-500">مجموع هزینه کل</span>
                        <span className="text-lg font-bold text-gray-800">{selectedCustomer.totalSpent.toLocaleString()} تومان</span>
                    </div>
                    <button onClick={() => setSelectedCustomer(null)} className="px-6 py-2 bg-gray-800 text-white rounded-xl hover:bg-gray-700 transition-colors text-sm font-medium">بستن</button>
                </div>
            </div>
        </div>
        )}

        {/* Renewal Modal */}
        {isRenewModalOpen && targetDevice && (
             <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col">
                    <div className="p-4 border-b border-gray-100 bg-indigo-50/50">
                        <h3 className="font-bold text-gray-800 text-sm">تمدید {renewTarget === 'warranty' ? 'گارانتی' : 'آنتی‌ویروس'}</h3>
                        <p className="text-xs text-gray-500 mt-1">{targetDevice.brand} {targetDevice.model}</p>
                    </div>
                    <div className="p-6 space-y-4">
                        <div className="grid grid-cols-3 gap-3">
                             {[6, 12, 24].map(m => (
                                 <button key={m} onClick={() => setRenewDuration(m)} className={`p-3 rounded-xl border text-sm font-medium flex flex-col items-center gap-1 transition-all ${renewDuration === m ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white border-gray-200 text-gray-600'}`}>
                                    <span className="font-bold text-lg">{m === 12 ? '1' : m === 24 ? '2' : '6'}</span>
                                    <span className="text-xs opacity-80">{m >= 12 ? 'سال' : 'ماه'}</span>
                                 </button>
                             ))}
                        </div>
                        <button onClick={handleConfirmRenew} className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all">
                            تایید و ثبت
                        </button>
                        <button onClick={() => setIsRenewModalOpen(false)} className="w-full py-2 text-gray-500 text-xs">انصراف</button>
                    </div>
                </div>
             </div>
        )}

        {/* SMS Modal */}
        {isSmsModalOpen && targetDevice && (
             <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col">
                    <div className="p-4 border-b border-gray-100 bg-indigo-50/50">
                        <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2"><MessageSquare size={16}/> ارسال پیامک</h3>
                        <p className="text-xs text-gray-500 mt-1">به: {targetDevice.brand} {targetDevice.model}</p>
                    </div>
                    <div className="p-5 space-y-4">
                        <textarea 
                            value={smsText}
                            onChange={(e) => setSmsText(e.target.value)}
                            rows={4}
                            className="w-full p-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-500"
                        ></textarea>
                        <button onClick={handleSendDeviceSms} className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center justify-center gap-2">
                            <Send size={16} /> ارسال پیام
                        </button>
                        <button onClick={() => setIsSmsModalOpen(false)} className="w-full py-2 text-gray-500 text-xs">انصراف</button>
                    </div>
                </div>
             </div>
        )}
    </div>
  );
};

export default Customers;