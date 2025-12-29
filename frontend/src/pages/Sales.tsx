import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, Search, Calendar, FileSpreadsheet, 
  Edit, Trash, X, Laptop, Clock, CheckCircle, UploadCloud, 
  Monitor, Shield, ChevronDown, ChevronUp, PlusCircle, ShieldCheck, 
  Save, RefreshCw, Banknote, FileText, AlertTriangle, Hash, Info
} from 'lucide-react';
import DatePicker, { DateObject } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import * as XLSX from 'xlsx';

// Initial Constants
const INITIAL_BRANDS = ["Asus", "Lenovo", "HP", "Dell", "Acer", "MSI", "Apple", "Samsung", "Microsoft", "Xiaomi", "Huawei", "Surface", "سایر"];
const INITIAL_WARRANTIES = ["سازگار ارقام", "آواژنگ", "ماتریس", "حامی", "الماس رایان", "پانا", "امر تات", "مدیران", "شرکتی", "همتا سرویس", "اندیشه", "آیده آل", "بدون گارانتی"];

// Types Matching the Excel Columns
interface ServiceRecord {
  id: number;
  customerName: string;      
  phoneNumber: string;       
  brand: string;             
  model: string;             
  serialNumber: string;      
  warrantyCompany: string;   
  warrantyExpiration: string; 
  receptionDate: string;     
  hasWindows: boolean;       
  antivirusType: 'none' | 'single' | 'double'; 
  antivirusExpiration: string; // New Explicit Field
  totalPrice: string; 
  description: string;
}

// Helper for Logging
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

// --- Normalization Helpers ---

const normalizeBrand = (input: string) => {
    if (!input) return '';
    const lowerInput = input.toLowerCase().trim();
    const match = INITIAL_BRANDS.find(b => b.toLowerCase() === lowerInput);
    if (match) return match;
    if (lowerInput.includes('surface')) return 'Microsoft';
    return input.charAt(0).toUpperCase() + input.slice(1);
};

const normalizeWarranty = (input: string) => {
    if (!input) return 'بدون گارانتی';
    const lowerInput = input.toLowerCase().trim().replace(/ي/g, "ی").replace(/ك/g, "ک");
    if (lowerInput.includes('hami') || lowerInput.includes('حامی')) return 'حامی';
    if (lowerInput.includes('sazgar') || lowerInput.includes('سازگار')) return 'سازگار ارقام';
    if (lowerInput.includes('avajang') || lowerInput.includes('آواژنگ')) return 'آواژنگ';
    if (lowerInput.includes('matris') || lowerInput.includes('ماتریس')) return 'ماتریس';
    if (lowerInput.includes('almas') || lowerInput.includes('الماس')) return 'الماس رایان';
    if (lowerInput.includes('pana') || lowerInput.includes('پانا')) return 'پانا';
    if (lowerInput.includes('amertat') || lowerInput.includes('امر تات') || lowerInput.includes('امرتات')) return 'امر تات';
    if (lowerInput.includes('hamta') || lowerInput.includes('همتا')) return 'همتا سرویس';
    if (lowerInput.includes('andishe') || lowerInput.includes('اندیشه')) return 'اندیشه';
    if (lowerInput.includes('ide') || lowerInput.includes('ایده') || lowerInput.includes('آیده')) return 'آیده آل';
    if (lowerInput.includes('tat') || lowerInput.includes('تات')) return 'امر تات';
    const match = INITIAL_WARRANTIES.find(w => w.includes(lowerInput) || lowerInput.includes(w));
    if (match) return match;
    return input;
};

// Helper to calculate date + 1 year (Persian)
const calculateOneYearLater = (dateStr: string) => {
    if (!dateStr || dateStr.length < 6) return '';
    try {
        const d = new DateObject({ date: dateStr, calendar: persian, locale: persian_fa });
        d.add(1, 'year');
        return d.format();
    } catch (e) { return ''; }
};

// --- Custom Components ---

const SearchableSelect = ({ 
    options, value, onChange, onAdd, placeholder, icon: Icon 
}: { 
    options: string[], value: string, onChange: (val: string) => void, onAdd: (newVal: string) => void, placeholder: string, icon: any
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) setIsOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const filteredOptions = options.filter(opt => opt.toLowerCase().includes(search.toLowerCase()));
    const handleSelect = (opt: string) => { onChange(opt); setIsOpen(false); setSearch(''); };
    const handleAddNew = () => { if (search.trim()) { onAdd(search.trim()); onChange(search.trim()); setIsOpen(false); setSearch(''); } };

    return (
        <div className="relative" ref={wrapperRef}>
            <div onClick={() => setIsOpen(!isOpen)} className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all outline-none flex items-center justify-between cursor-pointer">
                <span className={value ? 'text-gray-800' : 'text-gray-400'}>{value || placeholder}</span>
                <ChevronDown size={16} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </div>
            {Icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400"><Icon size={16} /></div>}
            {isOpen && (
                <div className="absolute z-50 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-xl max-h-60 overflow-hidden flex flex-col">
                    <div className="p-2 border-b border-gray-50">
                        <input type="text" className="w-full px-3 py-1.5 bg-gray-50 rounded-lg text-sm outline-none focus:ring-1 focus:ring-indigo-200" placeholder="جستجو یا افزودن..." value={search} onChange={(e) => setSearch(e.target.value)} autoFocus onClick={(e) => e.stopPropagation()} />
                    </div>
                    <div className="overflow-y-auto flex-1 p-1">
                        {filteredOptions.map(opt => (
                            <div key={opt} onClick={() => handleSelect(opt)} className={`px-3 py-2 text-sm rounded-lg cursor-pointer transition-colors ${value === opt ? 'bg-indigo-50 text-indigo-600 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}>{opt}</div>
                        ))}
                        {search && !filteredOptions.includes(search) && (
                            <button onClick={(e) => { e.stopPropagation(); handleAddNew(); }} className="w-full mt-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors font-medium"><PlusCircle size={14} />افزودن "{search}"</button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

const Sales: React.FC = () => {
  const [records, setRecords] = useState<ServiceRecord[]>(() => {
      const saved = localStorage.getItem('service_records');
      return saved ? JSON.parse(saved) : [];
  });
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ServiceRecord | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [availableBrands, setAvailableBrands] = useState(INITIAL_BRANDS);
  const [availableWarranties, setAvailableWarranties] = useState(INITIAL_WARRANTIES);
  
  // New state for row expansion
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  // --- SELF-HEALING DATA EFFECT ---
  useEffect(() => {
      let hasChanges = false;
      const healedRecords = records.map(record => {
          if (record.antivirusType !== 'none' && (!record.antivirusExpiration || record.antivirusExpiration.length < 5)) {
              if (record.receptionDate && record.receptionDate.length > 5) {
                  const calculatedExp = calculateOneYearLater(record.receptionDate);
                  if (calculatedExp) {
                      hasChanges = true;
                      return { ...record, antivirusExpiration: calculatedExp };
                  }
              }
          }
          return record;
      });

      if (hasChanges) {
          setRecords(healedRecords);
          localStorage.setItem('service_records', JSON.stringify(healedRecords));
      }
  }, []); 

  useEffect(() => { localStorage.setItem('service_records', JSON.stringify(records)); }, [records]);

  // Form State
  const [formData, setFormData] = useState<{
      customerName: string;
      phoneNumber: string;
      brand: string;
      model: string;
      serialNumber: string;
      warrantyCompany: string;
      warrantyExpiration: string;
      receptionDate: string;
      hasWindows: boolean;
      antivirusType: 'none' | 'single' | 'double';
      antivirusExpiration: string;
      totalPrice: string;
      description: string;
  }>({
    customerName: '', phoneNumber: '', brand: '', model: '', serialNumber: '', warrantyCompany: '', warrantyExpiration: '', receptionDate: '', 
    hasWindows: true, antivirusType: 'none', antivirusExpiration: '', totalPrice: '', description: ''
  });

  // --- AUTO CALCULATE ANTIVIRUS EXPIRATION (FORM) ---
  useEffect(() => {
      if (formData.antivirusType !== 'none' && formData.receptionDate) {
          const newExp = calculateOneYearLater(formData.receptionDate);
          if(newExp !== formData.antivirusExpiration) {
             setFormData(prev => ({...prev, antivirusExpiration: newExp}));
          }
      } else if (formData.antivirusType === 'none') {
          setFormData(prev => ({...prev, antivirusExpiration: ''}));
      }
  }, [formData.receptionDate, formData.antivirusType]);

  const triggerToast = (msg: string) => { setToastMsg(msg); setShowToast(true); setTimeout(() => setShowToast(false), 3000); };

  // EXCEL EXPORT
  const handleExportExcel = () => {
    const dataToExport = records.map(r => ({
        'نام مشتری': r.customerName || '-',
        'شماره تماس': r.phoneNumber || '-',
        'برند دستگاه': r.brand || '-',
        'مدل دقیق': r.model || '-',
        'شماره سریال': r.serialNumber || '-',
        'شرکت گارانتی': r.warrantyCompany || '-',
        'تاریخ پایان گارانتی': r.warrantyExpiration || '-',
        'تاریخ پذیرش': r.receptionDate || '-',
        'win': r.hasWindows ? 'WIN' : '',
        'nod': r.antivirusType !== 'none' ? 'NOD' : '',
        'انقضای آنتی‌ویروس': r.antivirusExpiration || '-', 
        'مبلغ کل (تومان)': r.totalPrice ? r.totalPrice.toLocaleString() : '0',
        'توضیحات تکمیلی': r.description || '-'
    }));
    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "لیست پذیرش");
    XLSX.writeFile(wb, `Service_List.xlsx`);
    triggerToast('فایل اکسل دانلود شد.');
  };

  // EXCEL IMPORT
  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const bstr = evt.target?.result;
                const wb = XLSX.read(bstr, { type: 'binary' });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const data = XLSX.utils.sheet_to_json(ws);

                const newRecords: ServiceRecord[] = data.map((row: any, index: number) => {
                    let avType: 'none' | 'single' | 'double' = 'none';
                    let hasWin = false;
                    let avExpiration = '';

                    const winStr = String(row['win'] || row['ویندوز'] || row['خدمات ویندوز'] || '').toLowerCase();
                    if(winStr.includes('win') || winStr.includes('نصب') || winStr.includes('دارد')) hasWin = true;

                    const avStr = String(row['nod'] || row['antivirus'] || row['آنتی ویروس'] || row['وضعیت آنتی‌ویروس'] || row['تی ویروس'] || '').toLowerCase();
                    if(avStr.includes('nod') || avStr.includes('single') || avStr.includes('تک') || avStr.includes('double') || avStr.includes('دو')) {
                        avType = avStr.includes('double') || avStr.includes('دو') ? 'double' : 'single';
                    }

                    const recDate = row['تاریخ پذیرش'] || row['تاریخ خروج'] || row['تاریخ'] || '';
                    if (avType !== 'none' && recDate) {
                        avExpiration = calculateOneYearLater(recDate);
                    }

                    let phoneRaw = row['شماره تماس'] || row['موبایل'] || row['تلفن'] || '';
                    let phoneStr = String(phoneRaw).trim();
                    if (phoneStr.length === 10 && phoneStr.startsWith('9')) phoneStr = '0' + phoneStr;

                    return {
                        id: Date.now() + index,
                        customerName: row['نام مشتری'] || row['نام و نام خانوادگی'] || row['نام'] || '',
                        phoneNumber: phoneStr,
                        brand: normalizeBrand(row['برند دستگاه'] || row['دستگاه'] || row['برند'] || ''),
                        model: String(row['مدل دقیق'] || row['مدل'] || '').toUpperCase(),
                        serialNumber: row['شماره سریال'] || row['سریال'] || '',
                        warrantyCompany: normalizeWarranty(row['شرکت گارانتی'] || row['گارانتی'] || ''),
                        warrantyExpiration: row['تاریخ پایان گارانتی'] || row['تاریخ گارانتی'] || '',
                        receptionDate: recDate,
                        hasWindows: hasWin,
                        antivirusType: avType,
                        antivirusExpiration: avExpiration,
                        totalPrice: row['مبلغ کل (تومان)'] || row['هزینه (تومان)'] || row['هزینه'] || '',
                        description: row['توضیحات تکمیلی'] || row['توضیحات'] || ''
                    };
                });

                setRecords(prev => [...newRecords, ...prev]);
                logSystemAction('ایمپورت اکسل', `وارد کردن ${newRecords.length} رکورد`, 'create');
                triggerToast(`${newRecords.length} رکورد با موفقیت وارد شد.`);
            } catch (err) { triggerToast('خطا در خواندن فایل اکسل.'); }
        };
        reader.readAsBinaryString(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newRecord: ServiceRecord = { id: editingRecord ? editingRecord.id : Date.now(), ...formData };
    if (editingRecord) {
      setRecords(records.map(r => r.id === newRecord.id ? newRecord : r));
      logSystemAction('بروزرسانی پذیرش', `ویرایش ${newRecord.customerName}`, 'update');
    } else {
      setRecords([newRecord, ...records]);
      logSystemAction('ثبت پذیرش جدید', `ثبت ${newRecord.brand}`, 'create');
    }
    closeModal();
    triggerToast('اطلاعات ذخیره شد.');
  };

  const handleDelete = (id: number, name: string) => {
      if(window.confirm('حذف شود؟')) {
          setRecords(records.filter(r => r.id !== id));
          logSystemAction('حذف پذیرش', `حذف ${name}`, 'delete');
      }
  };

  const openModal = (record?: ServiceRecord) => {
    if (record) {
      setEditingRecord(record);
      setFormData({
        customerName: record.customerName, phoneNumber: record.phoneNumber, brand: record.brand, model: record.model,
        serialNumber: record.serialNumber, warrantyCompany: record.warrantyCompany, warrantyExpiration: record.warrantyExpiration,
        receptionDate: record.receptionDate, hasWindows: record.hasWindows, antivirusType: record.antivirusType,
        antivirusExpiration: record.antivirusExpiration || '', totalPrice: record.totalPrice, description: record.description
      });
    } else {
      setEditingRecord(null);
      const today = new DateObject({ calendar: persian, locale: persian_fa }).format();
      setFormData({
        customerName: '', phoneNumber: '', brand: '', model: '', serialNumber: '', warrantyCompany: '', warrantyExpiration: '',
        receptionDate: today, hasWindows: true, antivirusType: 'none', antivirusExpiration: '', totalPrice: '', description: ''
      });
    }
    setIsModalOpen(true);
  };
  const closeModal = () => { setIsModalOpen(false); setEditingRecord(null); };

  const checkDateStatus = (dateStr?: string) => {
      if (!dateStr || dateStr.length < 5) return { color: 'gray', label: 'نامشخص' };
      try {
          const exp = new DateObject({ date: dateStr, calendar: persian, locale: persian_fa });
          const today = new DateObject({ calendar: persian, locale: persian_fa });
          const diffDays = Math.ceil((exp.toUnix() - today.toUnix()) / (24 * 60 * 60));
          if (diffDays < 0) return { color: 'rose', label: 'منقضی شده', diff: diffDays };
          if (diffDays <= 30) return { color: 'amber', label: 'رو به اتمام', diff: diffDays };
          return { color: 'emerald', label: 'فعال', diff: diffDays };
      } catch (e) { return { color: 'gray', label: 'نامشخص', diff: 0 }; }
  };

  // UI Handlers (AddBrand, AddWarranty, Price, Phone)
  const handleAddBrand = (n: string) => { if (!availableBrands.includes(n)) setAvailableBrands([...availableBrands, n]); };
  const handleAddWarranty = (n: string) => { if (!availableWarranties.includes(n)) setAvailableWarranties([...availableWarranties, n]); };
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, totalPrice: e.target.value.replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ',')});
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => { if (/^\d*$/.test(e.target.value) && e.target.value.length <= 11) setFormData({...formData, phoneNumber: e.target.value}); };

  // Toggle Row Expansion
  const toggleRow = (id: number) => {
      setExpandedRow(expandedRow === id ? null : id);
  };

  return (
    <div className="space-y-6 relative h-full flex flex-col">
      {showToast && (
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 bg-emerald-600 text-white px-6 py-3 rounded-xl shadow-2xl z-50 flex items-center gap-3 animate-fadeIn">
          <CheckCircle size={20} /><span>{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">خدمات نرم‌افزاری و پذیرش دستگاه نو</h1>
          <p className="text-gray-500 mt-1">مدیریت نصب ویندوز، آنتی‌ویروس و ثبت گارانتی</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button onClick={handleExportExcel} className="flex items-center gap-2 bg-emerald-50 text-emerald-600 border border-emerald-200 px-4 py-2.5 rounded-xl hover:bg-emerald-100 transition-all"><FileSpreadsheet size={18} /><span>خروجی اکسل</span></button>
          <label className="flex items-center gap-2 bg-white text-gray-600 border border-gray-200 px-4 py-2.5 rounded-xl hover:bg-gray-50 transition-all cursor-pointer"><UploadCloud size={18} /><span>وارد کردن اکسل</span><input type="file" className="hidden" accept=".xlsx,.xls" onChange={handleImportExcel} /></label>
          <button onClick={() => openModal()} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all"><Plus size={20} /><span>پذیرش جدید</span></button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex-1 flex flex-col min-h-0">
        <div className="p-4 border-b border-gray-100">
           <div className="flex items-center bg-gray-50 rounded-xl px-4 py-2 border border-gray-100 focus-within:ring-2 focus-within:ring-indigo-100 max-w-lg">
              <Search size={18} className="text-gray-400 ml-2" />
              <input type="text" placeholder="جستجو..." className="bg-transparent border-none outline-none text-sm w-full" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
           </div>
        </div>
        <div className="overflow-auto flex-1">
          <table className="w-full text-right border-collapse">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500">مشتری</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500">دستگاه/مدل</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500">گارانتی</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500">آنتی‌ویروس</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500">وضعیت آنتی‌ویروس</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {records.filter(r => (r.customerName+r.phoneNumber+r.model).includes(searchQuery)).map((record) => {
                  const avStatus = checkDateStatus(record.antivirusExpiration);
                  const isAvSet = record.antivirusType !== 'none';
                  const isExpanded = expandedRow === record.id;
                  
                  return (
                    <React.Fragment key={record.id}>
                        <tr 
                            onClick={() => toggleRow(record.id)} 
                            className={`cursor-pointer transition-colors ${isExpanded ? 'bg-indigo-50/50' : 'hover:bg-gray-50'}`}
                        >
                          <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                  <div className={`p-1 rounded-md transition-colors ${isExpanded ? 'text-indigo-600 bg-indigo-100' : 'text-gray-400'}`}>
                                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                  </div>
                                  <div>
                                      <div className="font-bold text-sm text-gray-800">{record.customerName}</div>
                                      <div className="text-xs text-gray-500 font-mono">{record.phoneNumber}</div>
                                  </div>
                              </div>
                          </td>
                          <td className="px-4 py-3 text-sm">{record.brand} - {record.model}</td>
                          <td className="px-4 py-3 text-sm">{record.warrantyCompany}</td>
                          <td className="px-4 py-3 text-center">{isAvSet ? <span className="text-emerald-600 font-bold text-xs bg-emerald-50 px-2 py-1 rounded-lg">{record.antivirusType === 'single' ? 'تک' : 'دو'}</span> : <span className="text-gray-300">-</span>}</td>
                          <td className="px-4 py-3">
                             {isAvSet ? (
                                 <div className="flex flex-col items-center">
                                     <span className="text-xs font-mono font-bold text-gray-700">{record.antivirusExpiration}</span>
                                     <span className={`text-[10px] font-bold mt-0.5 px-2 py-0.5 rounded-full whitespace-nowrap ${
                                         avStatus.color === 'rose' ? 'bg-rose-100 text-rose-600' : 
                                         avStatus.color === 'amber' ? 'bg-amber-100 text-amber-700' : 
                                         avStatus.color === 'emerald' ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400'
                                     }`}>
                                         {avStatus.label} {avStatus.color !== 'gray' && `(${Math.abs(avStatus.diff || 0)} روز ${avStatus.diff && avStatus.diff < 0 ? 'گذشته' : 'مانده'})`}
                                     </span>
                                 </div>
                             ) : <span className="text-gray-300 text-xs text-center block">---</span>}
                          </td>
                          <td className="px-4 py-3 text-center flex gap-2 justify-center" onClick={(e) => e.stopPropagation()}>
                                <button onClick={() => openModal(record)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit size={16} /></button>
                                <button onClick={() => handleDelete(record.id, record.customerName)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"><Trash size={16} /></button>
                          </td>
                        </tr>
                        {isExpanded && (
                            <tr className="bg-gray-50 animate-fadeIn">
                                <td colSpan={6} className="px-4 pb-4 pt-1 border-b border-gray-200">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm ml-8">
                                        <div className="space-y-3">
                                            <div className="flex flex-col">
                                                <span className="text-xs text-gray-400 mb-1">شماره سریال</span>
                                                <div className="flex items-center gap-2">
                                                    <Hash size={14} className="text-indigo-500" />
                                                    <span className="font-mono font-bold text-gray-700 text-sm tracking-wider bg-gray-100 px-2 py-1 rounded">{record.serialNumber || '---'}</span>
                                                </div>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-xs text-gray-400 mb-1">تاریخ پذیرش</span>
                                                <div className="flex items-center gap-2">
                                                    <Calendar size={14} className="text-indigo-500" />
                                                    <span className="font-bold text-gray-700 text-sm">{record.receptionDate}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <div className="flex flex-col">
                                                 <span className="text-xs text-gray-400 mb-1">هزینه کل</span>
                                                 <div className="flex items-center gap-2">
                                                    <Banknote size={14} className="text-emerald-600" />
                                                    <span className="font-bold text-gray-800 text-lg">{record.totalPrice ? record.totalPrice.toLocaleString() : '0'} <span className="text-xs font-normal text-gray-500">تومان</span></span>
                                                 </div>
                                            </div>
                                             <div className="flex flex-col">
                                                <span className="text-xs text-gray-400 mb-1">وضعیت ویندوز</span>
                                                <div className="flex items-center gap-2">
                                                    <Monitor size={14} className={record.hasWindows ? "text-blue-500" : "text-gray-400"} />
                                                    <span className={`text-xs font-bold ${record.hasWindows ? 'text-blue-600' : 'text-gray-500'}`}>{record.hasWindows ? 'نصب شده' : 'ندارد'}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-1 lg:col-span-1 md:col-span-2">
                                            <span className="text-xs text-gray-400 flex items-center gap-1"><Info size={12}/> توضیحات تکمیلی</span>
                                            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 h-full min-h-[60px]">
                                                <p className="text-xs text-gray-600 leading-relaxed">
                                                    {record.description || <span className="text-gray-400 italic">توضیحاتی ثبت نشده است.</span>}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </React.Fragment>
                  );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal - Same as before but with AlertTriangle Icon usage fixed */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[95vh]">
                <div className="p-6 border-b flex justify-between bg-gray-50">
                    <h3 className="font-bold">ثبت/ویرایش پذیرش</h3>
                    <button onClick={closeModal}><X size={20} /></button>
                </div>
                <div className="overflow-y-auto p-6 flex-1">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-1"><label className="text-sm">نام مشتری</label><input required className="input-std" value={formData.customerName} onChange={e => setFormData({...formData, customerName: e.target.value})} /></div>
                            <div className="space-y-1"><label className="text-sm">موبایل</label><input required className="input-std font-mono" dir="ltr" value={formData.phoneNumber} onChange={handlePhoneChange} /></div>
                        </div>
                        <div className="h-px bg-gray-100"></div>
                        <div className="grid grid-cols-3 gap-6">
                            <div className="space-y-1"><label className="text-sm">برند</label><SearchableSelect options={availableBrands} value={formData.brand} onChange={v => setFormData({...formData, brand: v})} onAdd={handleAddBrand} placeholder="انتخاب" icon={Laptop} /></div>
                            <div className="space-y-1"><label className="text-sm">مدل</label><input className="input-std" value={formData.model} onChange={e => setFormData({...formData, model: e.target.value})} /></div>
                            <div className="space-y-1"><label className="text-sm">تاریخ پذیرش</label><div className="relative"><Calendar className="absolute left-2 top-2 text-gray-400" size={16}/><DatePicker calendar={persian} locale={persian_fa} value={formData.receptionDate} onChange={(d:any) => setFormData({...formData, receptionDate: d?.toString() || ''})} inputClass="input-std pl-8" /></div></div>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-xl border space-y-4">
                             <div className="flex gap-6 items-center">
                                 <label className="flex gap-2 items-center cursor-pointer"><input type="checkbox" checked={formData.hasWindows} onChange={e => setFormData({...formData, hasWindows: e.target.checked})} className="w-5 h-5 text-indigo-600 rounded" /><span className="text-sm font-bold">نصب ویندوز</span></label>
                                 <div className="h-8 w-px bg-gray-300"></div>
                                 <div className="flex gap-4 items-center flex-1">
                                     <span className="text-sm font-bold flex gap-2"><Shield size={18}/> آنتی‌ویروس:</span>
                                     {['none', 'single', 'double'].map(t => (
                                         <label key={t} className="flex gap-1 cursor-pointer items-center">
                                             <input type="radio" name="av" checked={formData.antivirusType === t} onChange={() => setFormData({...formData, antivirusType: t as any})} className="text-emerald-600 focus:ring-emerald-500" />
                                             <span className="text-sm">{t === 'none' ? 'ندارد' : t === 'single' ? 'تک کاربر' : 'دو کاربر'}</span>
                                         </label>
                                     ))}
                                 </div>
                             </div>
                             {formData.antivirusType !== 'none' && (
                                 <div className="flex gap-2 items-center text-sm text-emerald-700 bg-emerald-50 p-2 rounded-lg animate-fadeIn">
                                     <Clock size={16} />
                                     <span>انقضای آنتی‌ویروس به صورت خودکار محاسبه شد: </span>
                                     <span className="font-bold font-mono">{formData.antivirusExpiration || 'لطفا تاریخ پذیرش را وارد کنید'}</span>
                                 </div>
                             )}
                        </div>
                         <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-1"><label className="text-sm">شرکت گارانتی</label><SearchableSelect options={availableWarranties} value={formData.warrantyCompany} onChange={v => setFormData({...formData, warrantyCompany: v})} onAdd={handleAddWarranty} placeholder="انتخاب" icon={ShieldCheck} /></div>
                             <div className="space-y-1"><label className="text-sm">پایان گارانتی</label><DatePicker calendar={persian} locale={persian_fa} value={formData.warrantyExpiration} onChange={(d:any) => setFormData({...formData, warrantyExpiration: d?.toString() || ''})} inputClass="input-std" /></div>
                         </div>
                         <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-1"><label className="text-sm">هزینه (تومان)</label><input className="input-std font-bold text-lg" value={formData.totalPrice} onChange={handlePriceChange} /></div>
                            <div className="space-y-1"><label className="text-sm">توضیحات</label><textarea rows={2} className="input-std" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} /></div>
                         </div>
                        <button type="submit" className="hidden" />
                    </form>
                </div>
                <div className="p-4 border-t flex justify-end gap-3">
                    <button onClick={closeModal} className="btn-secondary">انصراف</button>
                    <button onClick={handleSubmit} className="btn-primary">ذخیره</button>
                </div>
            </div>
        </div>
      )}
      <style>{`
        .input-std { width: 100%; padding: 0.5rem 1rem; border-radius: 0.75rem; border: 1px solid #e5e7eb; outline: none; transition: all 0.2s; }
        .input-std:focus { border-color: #818cf8; ring: 2px solid #e0e7ff; }
        .btn-primary { background: #4f46e5; color: white; padding: 0.5rem 1.5rem; border-radius: 0.75rem; font-weight: bold; }
        .btn-secondary { background: white; color: #4b5563; padding: 0.5rem 1.5rem; border-radius: 0.75rem; border: 1px solid #e5e7eb; font-weight: bold; }
      `}</style>
    </div>
  );
};

export default Sales;