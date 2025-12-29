import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, Settings, History, PenTool, Send, 
  CheckCircle, AlertTriangle, FileText, Save, Key, 
  Server, BellRing, Users, Loader2, X, RefreshCw, Laptop
} from 'lucide-react';
import { DateObject } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import * as XLSX from 'xlsx';

interface SmsConfig { apiKey: string; provider: string; lineNumber: string; sendOnRenewal: boolean; }
interface SmsTemplate { id: string; title: string; text: string; }
interface SmsLogEntry { id: number; recipientName: string; recipientPhone: string; category: string; messageContent: string; sentDate: string; status: 'sent' | 'failed'; }

const Messages: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'send' | 'history' | 'templates' | 'config'>('send');
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const [config, setConfig] = useState<SmsConfig>({ apiKey: '', provider: 'kavenegar', lineNumber: '', sendOnRenewal: true });
  const [templates, setTemplates] = useState<SmsTemplate[]>([
      { id: 'warranty_warning', title: 'هشدار انقضای گارانتی', text: 'مشتری گرامی {name}، گارانتی دستگاه {model} شما رو به پایان است. جهت تمدید مراجعه فرمایید. فروشگاه ماستک' },
      { id: 'antivirus_warning', title: 'هشدار انقضای آنتی‌ویروس', text: 'مشتری گرامی {name}، اعتبار آنتی‌ویروس دستگاه {model} شما ۳ روز دیگر به پایان می‌رسد. فروشگاه ماستک' },
      { id: 'renewal_success', title: 'تاییدیه تمدید', text: 'مشتری گرامی {name}، سرویس {service} شما با موفقیت تا تاریخ {date} تمدید شد. با تشکر، ماستک' },
      { id: 'repair_ready', title: 'آماده تحویل تعمیرات', text: 'مشتری گرامی {name}، دستگاه شما آماده تحویل می‌باشد. هزینه: {cost} تومان. فروشگاه ماستک' },
  ]);

  const [targetFilter, setTargetFilter] = useState<'warranty' | 'antivirus'>('warranty');
  const [daysThreshold, setDaysThreshold] = useState<number>(30);
  const [targets, setTargets] = useState<any[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('warranty_warning');
  const [customMessage, setCustomMessage] = useState('');
  const [logs, setLogs] = useState<SmsLogEntry[]>([]);

  useEffect(() => {
      const savedConfig = localStorage.getItem('sms_config'); if (savedConfig) setConfig(JSON.parse(savedConfig));
      const savedTemplates = localStorage.getItem('sms_templates'); if (savedTemplates) setTemplates(JSON.parse(savedTemplates));
      const savedLogs = localStorage.getItem('sms_logs'); if (savedLogs) setLogs(JSON.parse(savedLogs));
  }, []);

  useEffect(() => { calculateTargets(); }, [targetFilter, daysThreshold]);
  useEffect(() => { const tmpl = templates.find(t => t.id === selectedTemplateId); if(tmpl) setCustomMessage(tmpl.text); }, [selectedTemplateId, templates]);

  const saveConfig = () => {
      localStorage.setItem('sms_config', JSON.stringify(config));
      localStorage.setItem('sms_templates', JSON.stringify(templates));
      triggerToast('تنظیمات و قالب‌ها ذخیره شدند.');
  };
  const triggerToast = (msg: string) => { setToastMsg(msg); setShowToast(true); setTimeout(() => setShowToast(false), 3000); };

  const calculateTargets = () => {
      const savedRecords = JSON.parse(localStorage.getItem('service_records') || '[]');
      const today = new DateObject({ calendar: persian, locale: persian_fa });
      
      const found = savedRecords.filter((rec: any) => {
          let dateStr = '';
          if (targetFilter === 'warranty') {
              dateStr = rec.warrantyExpiration;
          } else {
              // Antivirus check: must not be 'none'
              if (rec.antivirusType === 'none') return false;
              // Use explicit antivirusExpiration calculated in Sales.tsx
              dateStr = rec.antivirusExpiration || ''; 
          }
          if (!dateStr || dateStr.length < 5) return false;

          try {
             const expDate = new DateObject({ date: dateStr, calendar: persian, locale: persian_fa });
             const diff = Math.ceil((expDate.toUnix() - today.toUnix()) / (24 * 60 * 60));
             return diff <= daysThreshold;
          } catch { return false; }
      }).map((rec: any) => ({
          name: rec.customerName, phone: rec.phoneNumber, model: rec.model, serial: rec.serialNumber, 
          expiry: targetFilter === 'warranty' ? rec.warrantyExpiration : rec.antivirusExpiration
      }));
      setTargets(found);
  };

  const executeBatchSend = () => {
      setIsLoading(true);
      setTimeout(() => {
          const newLogs: SmsLogEntry[] = targets.map((t: any) => ({
              id: Date.now() + Math.random(),
              recipientName: t.name, recipientPhone: t.phone,
              category: targetFilter === 'warranty' ? 'هشدار گارانتی' : 'هشدار آنتی‌ویروس',
              messageContent: customMessage.replace('{name}', t.name).replace('{model}', t.model),
              sentDate: new DateObject({ calendar: persian, locale: persian_fa }).format("YYYY/MM/DD HH:mm:ss"),
              status: 'sent'
          }));
          const updatedLogs = [...logs, ...newLogs];
          setLogs(updatedLogs);
          localStorage.setItem('sms_logs', JSON.stringify(updatedLogs));
          setIsLoading(false); setIsConfirmModalOpen(false);
          triggerToast(`${newLogs.length} پیامک با موفقیت در صف ارسال قرار گرفت.`);
      }, 2000);
  };

  const handleExportHistory = () => {
      const ws = XLSX.utils.json_to_sheet(logs);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "SMS_History");
      XLSX.writeFile(wb, `SMS_Report.xlsx`);
  };

  return (
    <div className="space-y-6 relative h-full flex flex-col">
       {showToast && <div className="fixed top-24 left-1/2 transform -translate-x-1/2 bg-emerald-600 text-white px-6 py-3 rounded-xl shadow-2xl z-50 flex items-center gap-3 animate-fadeIn"><CheckCircle size={20} /><span>{toastMsg}</span></div>}
      <div><h1 className="text-2xl font-bold text-gray-800">پنل مدیریت پیامک</h1><p className="text-gray-500 mt-1">مدیریت ارسال‌ها، قالب‌ها و اتصال به درگاه</p></div>
      <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-gray-200 w-fit">
          <button onClick={() => setActiveTab('send')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'send' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}><Send size={16} /> ارسال هوشمند</button>
          <button onClick={() => setActiveTab('history')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'history' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}><History size={16} /> تاریخچه</button>
           <button onClick={() => setActiveTab('templates')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'templates' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}><FileText size={16} /> قالب‌ها</button>
          <button onClick={() => setActiveTab('config')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'config' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}><Settings size={16} /> تنظیمات درگاه</button>
      </div>

      {activeTab === 'send' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
              <div className="lg:col-span-2 space-y-6">
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                      <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><Users size={20} className="text-indigo-500" />انتخاب مخاطبین هدف</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2"><label className="text-sm font-medium text-gray-700">دسته‌بندی انقضا</label><div className="flex gap-2"><button onClick={() => setTargetFilter('warranty')} className={`flex-1 py-2.5 rounded-xl border text-sm font-medium transition-all ${targetFilter === 'warranty' ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-gray-50 border-gray-200 text-gray-600'}`}>گارانتی</button><button onClick={() => setTargetFilter('antivirus')} className={`flex-1 py-2.5 rounded-xl border text-sm font-medium transition-all ${targetFilter === 'antivirus' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-gray-50 border-gray-200 text-gray-600'}`}>آنتی‌ویروس</button></div></div>
                           <div className="space-y-2"><label className="text-sm font-medium text-gray-700">بازه زمانی</label><select value={daysThreshold} onChange={(e) => setDaysThreshold(Number(e.target.value))} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none"><option value={3}>فوری (۳ روز)</option><option value={7}>هفتگی (۷ روز)</option><option value={30}>ماهانه (۳۰ روز)</option><option value={60}>دو ماهه (۶۰ روز)</option></select></div>
                      </div>
                      <div className="mt-4 bg-blue-50 text-blue-700 p-3 rounded-xl flex items-center justify-between"><span className="text-sm flex items-center gap-2"><BellRing size={16} /> تعداد مخاطبین یافت شده:</span><span className="font-bold text-lg">{targets.length} نفر</span></div>
                  </div>
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                       <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><PenTool size={20} className="text-indigo-500" />متن پیامک</h3>
                      <div className="space-y-4">
                          <div className="space-y-2"><label className="text-sm font-medium text-gray-700">انتخاب قالب آماده</label><select value={selectedTemplateId} onChange={(e) => setSelectedTemplateId(e.target.value)} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none text-sm">{templates.map(t => (<option key={t.id} value={t.id}>{t.title}</option>))}</select></div>
                          <div className="space-y-2"><label className="text-sm font-medium text-gray-700">متن نهایی</label><textarea value={customMessage} onChange={(e) => setCustomMessage(e.target.value)} rows={4} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none resize-none focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all" /><p className="text-xs text-gray-400 text-left">{customMessage.length} کاراکتر</p></div>
                      </div>
                  </div>
              </div>
              <div className="space-y-6">
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                      <h3 className="font-bold text-gray-800 mb-4">پیش‌فاکتور ارسال</h3>
                      <div className="space-y-3 mb-6"><div className="flex justify-between text-sm"><span className="text-gray-500">تعداد گیرندگان</span><span className="font-bold">{targets.length}</span></div><div className="flex justify-between text-sm"><span className="text-gray-500">هزینه هر پیام</span><span className="font-bold">85 تومان</span></div><div className="h-px bg-gray-100 my-2"></div><div className="flex justify-between text-base font-bold text-indigo-600"><span>هزینه کل</span><span>{(targets.length * 85).toLocaleString()} تومان</span></div></div>
                      <button onClick={() => setIsConfirmModalOpen(true)} disabled={isLoading || targets.length === 0} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">{isLoading ? <Loader2 className="animate-spin" /> : <Send size={20} />} ارسال پیامک‌ها</button>
                  </div>
                  <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 max-h-[300px] overflow-y-auto">
                       <h4 className="text-sm font-bold text-gray-700 mb-2">لیست گیرندگان</h4>
                       {targets.length === 0 ? <p className="text-xs text-gray-400 text-center py-4">مخاطبی یافت نشد.</p> : <div className="space-y-2">{targets.map((t: any, idx: number) => (<div key={idx} className="flex flex-col text-xs p-2 bg-gray-50 rounded-lg border border-gray-100"><div className="flex justify-between items-center mb-1"><span className="font-bold text-gray-700">{t.name}</span><span className="font-mono text-gray-500 bg-white px-1 rounded">{t.expiry || '-'}</span></div><div className="flex items-center gap-1 text-gray-500"><Laptop size={12} /><span className="font-medium">{t.model}</span><span className="text-[9px] text-gray-400 font-mono">({t.serial})</span></div></div>))}</div>}
                  </div>
              </div>
          </div>
      )}

      {/* History, Config, Templates tabs omitted for brevity - logic remains same but using updated logs */}
      {activeTab === 'history' && (
           <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full animate-fadeIn">
               <div className="p-4 border-b border-gray-100 flex justify-between items-center"><h3 className="font-bold text-gray-800">گزارش ارسال‌ها</h3><button onClick={handleExportHistory} className="flex items-center gap-2 text-sm text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg hover:bg-emerald-100"><FileText size={16} /> خروجی اکسل</button></div>
               <div className="overflow-auto flex-1"><table className="w-full text-right"><thead className="bg-gray-50 sticky top-0"><tr><th className="px-6 py-3 text-xs font-semibold text-gray-500">زمان</th><th className="px-6 py-3 text-xs font-semibold text-gray-500">گیرنده</th><th className="px-6 py-3 text-xs font-semibold text-gray-500">شماره</th><th className="px-6 py-3 text-xs font-semibold text-gray-500">دسته / متن</th><th className="px-6 py-3 text-xs font-semibold text-gray-500">وضعیت</th></tr></thead><tbody className="divide-y divide-gray-100">{logs.length === 0 && (<tr><td colSpan={5} className="text-center py-8 text-gray-400">تاریخچه‌ای موجود نیست.</td></tr>)}{[...logs].reverse().map(log => (<tr key={log.id} className="hover:bg-gray-50"><td className="px-6 py-3 text-xs font-mono text-gray-500">{log.sentDate}</td><td className="px-6 py-3 text-sm font-medium text-gray-800">{log.recipientName}</td><td className="px-6 py-3 text-xs font-mono text-gray-500">{log.recipientPhone}</td><td className="px-6 py-3"><div className="flex flex-col"><span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-[10px] w-fit mb-1">{log.category}</span><span className="text-[10px] text-gray-400 truncate max-w-[200px]">{log.messageContent}</span></div></td><td className="px-6 py-3"><span className="text-emerald-600 text-xs font-bold flex items-center gap-1"><CheckCircle size={12}/> موفق</span></td></tr>))}</tbody></table></div>
           </div>
      )}
      
      {activeTab === 'templates' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">{templates.map((tmpl, index) => (<div key={tmpl.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"><div className="flex justify-between mb-2"><label className="text-sm font-bold text-gray-800">{tmpl.title}</label><span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded">ID: {tmpl.id}</span></div><textarea value={tmpl.text} onChange={(e) => { const newTemplates = [...templates]; newTemplates[index].text = e.target.value; setTemplates(newTemplates); }} rows={3} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none resize-none focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all text-sm" /><div className="mt-2 flex justify-between items-center"><p className="text-xs text-gray-400">متغیرهای مجاز: {"{name}"} , {"{model}"}, {"{date}"}</p><button onClick={saveConfig} className="text-xs bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg font-bold hover:bg-indigo-100">ذخیره</button></div></div>))}</div>
      )}
      
      {activeTab === 'config' && (
          <div className="max-w-2xl mx-auto bg-white p-8 rounded-3xl shadow-sm border border-gray-100 animate-fadeIn"><div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-100"><div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl"><Server size={24} /></div><div><h3 className="font-bold text-gray-800 text-lg">تنظیمات درگاه پیامک</h3><p className="text-sm text-gray-500">اتصال به پنل SMS جهت ارسال خودکار</p></div></div><div className="space-y-6"><div className="space-y-2"><label className="text-sm font-medium text-gray-700">نام سرویس دهنده</label><select value={config.provider} onChange={(e) => setConfig({...config, provider: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-100"><option value="kavenegar">کاوه نگار (Kavenegar)</option><option value="ippanel">IPPanel (فراز اس‌ام‌اس)</option><option value="meli_payamak">ملی پیامک</option></select></div><div className="space-y-2"><label className="text-sm font-medium text-gray-700">API Key</label><div className="relative"><Key className="absolute right-4 top-3.5 text-gray-400" size={18} /><input type="password" value={config.apiKey} onChange={(e) => setConfig({...config, apiKey: e.target.value})} className="w-full pr-12 pl-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-100 font-mono text-sm" /></div></div><div className="space-y-2"><label className="text-sm font-medium text-gray-700">شماره خط</label><div className="relative"><MessageSquare className="absolute right-4 top-3.5 text-gray-400" size={18} /><input type="text" value={config.lineNumber} onChange={(e) => setConfig({...config, lineNumber: e.target.value})} className="w-full pr-12 pl-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-100 font-mono text-sm" /></div></div><div className="flex items-center justify-between bg-indigo-50 p-4 rounded-xl"><div className="flex items-center gap-3"><div className="p-2 bg-white text-indigo-600 rounded-lg shadow-sm"><RefreshCw size={18} /></div><div><p className="font-bold text-indigo-900 text-sm">ارسال اتوماتیک تمدید</p></div></div><input type="checkbox" checked={config.sendOnRenewal} onChange={(e) => setConfig({...config, sendOnRenewal: e.target.checked})} className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500" /></div><button onClick={saveConfig} className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"><Save size={20} /> ذخیره تنظیمات درگاه</button></div></div>
      )}

      {isConfirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn"><div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col"><div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center"><h3 className="font-bold text-gray-800 flex items-center gap-2"><Send size={18} className="text-indigo-600"/> تایید ارسال گروهی</h3><button onClick={() => !isLoading && setIsConfirmModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button></div><div className="p-6 space-y-4"><div className="bg-amber-50 text-amber-800 p-3 rounded-xl text-sm flex gap-3 items-start border border-amber-100"><AlertTriangle size={20} className="shrink-0 mt-0.5" /><p>آیا از ارسال پیامک به لیست انتخاب شده اطمینان دارید؟</p></div><div className="space-y-3 text-sm"><div className="flex justify-between"><span className="text-gray-500">تعداد گیرندگان:</span><span className="font-bold text-gray-800">{targets.length} نفر</span></div><div className="flex justify-between"><span className="text-gray-500">هزینه هر پیام:</span><span className="font-bold text-gray-800">85 تومان</span></div><div className="h-px bg-gray-100"></div><div className="flex justify-between text-base"><span className="font-bold text-indigo-900">مبلغ قابل پرداخت:</span><span className="font-bold text-indigo-600">{(targets.length * 85).toLocaleString()} تومان</span></div></div><div className="flex gap-3 mt-4"><button onClick={() => setIsConfirmModalOpen(false)} disabled={isLoading} className="flex-1 py-2.5 border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition-colors">انصراف</button><button onClick={executeBatchSend} disabled={isLoading} className="flex-1 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors flex justify-center items-center gap-2 shadow-lg shadow-indigo-200">{isLoading ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle size={18} />} تایید و ارسال</button></div></div></div></div>
      )}
    </div>
  );
};
export default Messages;