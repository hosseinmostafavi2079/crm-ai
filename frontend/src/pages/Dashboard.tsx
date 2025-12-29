import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, AreaChart, Area
} from 'recharts';
import { Link } from 'react-router-dom';
import { 
  Users, ShoppingBag, ChevronLeft, ShieldCheck, Clock, CheckCircle, Filter, BarChart2, Laptop, ShieldAlert, Activity, Loader2
} from 'lucide-react';
import api from '../api/axios';

const Dashboard: React.FC = () => {
  const [timeRange, setTimeRange] = useState<number>(6); 
  const [isLoading, setIsLoading] = useState(true);

  // Real Data State
  const [kpi, setKpi] = useState({
      totalDevices: 0,
      activeWarranty: 0,
      expiringSoon: 0,
      expired: 0,
      hasWindows: 0,
      hasAntivirus: 0
  });

  const [trendData, setTrendData] = useState<any[]>([]);
  const [brandData, setBrandData] = useState<any[]>([]);
  const [expiryForecast, setExpiryForecast] = useState<any[]>([]);
  const [healthData, setHealthData] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
        setIsLoading(true);
        try {
            // Fetch stats from backend
            // Params: range in months
            const response = await api.get(`dashboard-stats/?range=${timeRange}`);
            const data = response.data;

            setKpi(data.kpi);
            setTrendData(data.trendData);
            setBrandData(data.brandData);
            setExpiryForecast(data.expiryForecast);
            setHealthData(data.healthData);
        } catch (error) {
            console.error("Failed to fetch dashboard stats", error);
            // Optional: fallback to empty or show error
        } finally {
            setIsLoading(false);
        }
    };

    fetchData();
  }, [timeRange]);

  const StatCard = ({ title, value, icon: Icon, color, subText, iconColor }: any) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 group">
      <div className="flex justify-between items-start">
        <div><p className="text-gray-500 text-sm font-medium mb-1">{title}</p><h3 className="text-3xl font-bold text-gray-800 group-hover:text-indigo-600 transition-colors">{value}</h3></div>
        <div className={`p-3 rounded-xl ${color} shadow-lg shadow-indigo-50/50`}><Icon size={24} className={iconColor} /></div>
      </div>
      <div className="mt-4 flex items-center gap-2"><span className="text-gray-400 text-xs bg-gray-50 px-2 py-1 rounded-lg">{subText}</span></div>
    </div>
  );

  const QuickAction = ({ title, desc, icon: Icon, to, colorClass }: any) => (
    <Link to={to} className="flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-2xl hover:shadow-md hover:border-indigo-100 transition-all group">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClass} group-hover:scale-110 transition-transform shadow-sm`}><Icon size={24} className="text-white" /></div>
      <div className="flex-1"><h4 className="font-bold text-gray-800 text-sm">{title}</h4><p className="text-xs text-gray-400 mt-1">{desc}</p></div>
      <div className="bg-gray-50 p-2 rounded-lg group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors"><ChevronLeft size={16} /></div>
    </Link>
  );

  if (isLoading) {
      return (
          <div className="flex items-center justify-center h-full min-h-[500px]">
              <Loader2 className="animate-spin text-indigo-600" size={40} />
          </div>
      );
  }

  return (
    <div className="space-y-8 pb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div><h1 className="text-2xl font-bold text-gray-800">داشبورد تحلیلی</h1><p className="text-gray-500 mt-1">گزارش وضعیت دستگاه‌های پذیرش شده و گارانتی‌ها</p></div>
        <div className="flex items-center gap-2 bg-white p-2 rounded-2xl shadow-sm border border-gray-100"><Filter size={18} className="text-gray-400 mr-2" /><select value={timeRange} onChange={(e) => setTimeRange(Number(e.target.value))} className="text-sm font-bold text-gray-700 bg-transparent outline-none cursor-pointer"><option value="3">۳ ماه اخیر</option><option value="6">۶ ماه اخیر</option><option value="12">یک سال گذشته</option></select></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <QuickAction title="پذیرش دستگاه نو" desc="ثبت سریال و گارانتی" icon={ShoppingBag} to="/sales" colorClass="bg-indigo-500 shadow-indigo-200" />
        <QuickAction title="مدیریت مشتریان" desc="مشاهده سوابق و وضعیت" icon={Users} to="/customers" colorClass="bg-blue-500 shadow-blue-200" />
        <QuickAction title="ارسال پیامک انبوه" desc="اطلاع‌رسانی به مشتریان" icon={ShieldCheck} to="/messages" colorClass="bg-purple-500 shadow-purple-200" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="کل دستگاه‌ها" value={kpi.totalDevices} icon={Laptop} color="bg-indigo-50" iconColor="text-indigo-600" subText="پذیرش موفق" />
        <StatCard title="گارانتی‌های فعال" value={kpi.activeWarranty} icon={CheckCircle} color="bg-emerald-50" iconColor="text-emerald-600" subText="دارای اعتبار" />
        <StatCard title="رو به انقضا (۳۰ روز)" value={kpi.expiringSoon} icon={Clock} color="bg-amber-50" iconColor="text-amber-600" subText="نیازمند تمدید فوری" />
        <StatCard title="خدمات ویندوز" value={kpi.hasWindows} icon={Activity} color="bg-blue-50" iconColor="text-blue-600" subText="نصب شده" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-96">
            <div className="flex justify-between items-center mb-6"><h3 className="text-lg font-bold text-gray-800 flex items-center gap-2"><Activity size={20} className="text-indigo-500" />روند پذیرش دستگاه نو</h3></div>
            <div className="flex-1 w-full h-full min-h-[250px]"><ResponsiveContainer width="100%" height="100%"><AreaChart data={trendData}><defs><linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/><stop offset="95%" stopColor="#6366f1" stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" /><XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10} /><YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} /><Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', direction: 'rtl'}} /><Area type="monotone" dataKey="count" name="تعداد دستگاه" stroke="#6366f1" fillOpacity={1} fill="url(#colorCount)" /></AreaChart></ResponsiveContainer></div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-96">
             <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2"><BarChart2 size={20} className="text-purple-500" />محبوب‌ترین برندها</h3>
            <div className="flex-1 w-full"><ResponsiveContainer width="100%" height="100%"><BarChart layout="vertical" data={brandData} margin={{ left: 20 }}><CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f3f4f6" /><XAxis type="number" hide /><YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#4b5563', fontSize: 12, fontWeight: 'bold'}} width={70} /><Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 5px 10px rgba(0,0,0,0.1)'}} /><Bar dataKey="count" name="تعداد" fill="#8b5cf6" radius={[0, 8, 8, 0]} barSize={24} /></BarChart></ResponsiveContainer></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-96">
          <div className="flex justify-between items-center mb-6">
            <div><h3 className="text-lg font-bold text-gray-800 flex items-center gap-2"><ShieldAlert size={20} className="text-amber-500" />پیش‌بینی انقضای خدمات</h3><p className="text-xs text-gray-400 mt-1">تعداد دستگاه‌هایی که خدمات آن‌ها در ۶ ماه آینده تمام می‌شود</p></div>
            <Link to="/messages" className="text-xs bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg font-bold hover:bg-indigo-100 transition-colors">ارسال پیامک انبوه</Link>
          </div>
          <div className="flex-1 w-full h-full min-h-[250px]"><ResponsiveContainer width="100%" height="100%"><BarChart data={expiryForecast} barSize={30}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" /><XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10} /><YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} /><Tooltip cursor={{fill: '#f9fafb'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', direction: 'rtl'}} /><Legend iconType="circle" /><Bar name="انقضای گارانتی" dataKey="warranty" fill="#f59e0b" radius={[4, 4, 0, 0]} /><Bar name="انقضای آنتی‌ویروس" dataKey="antivirus" fill="#10b981" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-96">
          <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2"><CheckCircle size={20} className="text-emerald-500" />وضعیت کلی گارانتی‌ها</h3>
          <div className="flex-1 w-full relative"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={healthData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" cornerRadius={6}>{healthData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} stroke="none" />))}</Pie><Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 5px 10px rgba(0,0,0,0.1)'}} /><Legend verticalAlign="bottom" height={36} iconType="circle" /></PieChart></ResponsiveContainer><div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none pb-8"><span className="text-2xl font-bold text-gray-800">{kpi.totalDevices}</span><span className="text-xs text-gray-400">کل دستگاه‌ها</span></div></div>
        </div>
      </div>
    </div>
  );
};
export default Dashboard;