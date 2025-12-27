import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { Link } from 'react-router-dom';
import { 
  TrendingUp, Users, Wrench, AlertCircle, ArrowUp, Calendar, 
  PlusCircle, FileText, ShoppingBag, ArrowLeft, ChevronLeft,
  ShieldCheck, Clock, Hourglass
} from 'lucide-react';

const Dashboard: React.FC = () => {
  
  // Mock Data
  const salesData = [
    { name: 'شنبه', sales: 4000 },
    { name: 'یکشنبه', sales: 3000 },
    { name: 'دوشنبه', sales: 2000 },
    { name: 'سه‌شنبه', sales: 2780 },
    { name: 'چهارشنبه', sales: 1890 },
    { name: 'پنج‌شنبه', sales: 2390 },
    { name: 'جمعه', sales: 3490 },
  ];

  // Customer Type Segmentation Data (Buyer vs Service)
  const customerTypeData = [
    { name: 'خریداران کالا', value: 65, color: '#10B981' }, // emerald-500
    { name: 'خدمات و تعمیرات', value: 35, color: '#3B82F6' }, // blue-500
  ];

  const StatCard = ({ title, value, trend, icon: Icon, color, subText }: any) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 group">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-gray-800 group-hover:text-indigo-600 transition-colors">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl ${color} shadow-lg shadow-indigo-100`}>
          <Icon size={24} className="text-white" />
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2">
        <span className={`flex items-center text-xs font-bold px-2 py-1 rounded-lg ${trend.includes('+') ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'}`}>
          <ArrowUp size={12} className={`ml-1 ${trend.includes('-') ? 'rotate-180' : ''}`} /> {trend}
        </span>
        <span className="text-gray-400 text-xs">{subText || 'نسبت به ماه گذشته'}</span>
      </div>
    </div>
  );

  const QuickAction = ({ title, desc, icon: Icon, to, colorClass }: any) => (
    <Link to={to} className="flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-2xl hover:shadow-md hover:border-indigo-100 transition-all group">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClass} group-hover:scale-110 transition-transform`}>
        <Icon size={24} className="text-white" />
      </div>
      <div className="flex-1">
        <h4 className="font-bold text-gray-800 text-sm">{title}</h4>
        <p className="text-xs text-gray-400 mt-1">{desc}</p>
      </div>
      <div className="bg-gray-50 p-2 rounded-lg group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
        <ChevronLeft size={16} />
      </div>
    </Link>
  );

  return (
    <div className="space-y-8 pb-8">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">داشبورد مدیریتی</h1>
          <p className="text-gray-500 mt-1">گزارش وضعیت فروشگاه و خدمات فنی امروز</p>
        </div>
        <div className="flex items-center gap-3 bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100">
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium shadow-lg shadow-indigo-200">هفتگی</button>
          <button className="px-4 py-2 text-gray-500 hover:bg-gray-50 rounded-xl text-sm transition-colors">ماهانه</button>
          <button className="px-4 py-2 text-gray-500 hover:bg-gray-50 rounded-xl text-sm transition-colors">سالانه</button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <QuickAction 
          title="ثبت فروش جدید" 
          desc="ایجاد فاکتور و گارانتی" 
          icon={ShoppingBag} 
          to="/sales" 
          colorClass="bg-emerald-500 shadow-emerald-200"
        />
        <QuickAction 
          title="پذیرش دستگاه" 
          desc="ثبت تعمیرات و خدمات" 
          icon={Wrench} 
          to="/repairs" 
          colorClass="bg-indigo-500 shadow-indigo-200"
        />
        <QuickAction 
          title="لیست مشتریان" 
          desc="مدیریت و ایمپورت اکسل" 
          icon={Users} 
          to="/customers" 
          colorClass="bg-blue-500 shadow-blue-200"
        />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
            title="فروش کل" 
            value="۱۲۵,۰۰۰,۰۰۰ تومان" 
            trend="+۱۲٪" 
            icon={TrendingUp} 
            color="bg-indigo-500" 
        />
        <StatCard 
            title="گارانتی‌های فعال" 
            value="۱۴۸ دستگاه" 
            trend="+۸٪" 
            icon={ShieldCheck} 
            color="bg-emerald-500"
            subText="محصولات تحت پوشش" 
        />
        <StatCard 
            title="تعمیرات در جریان" 
            value="۱۲ دستگاه" 
            trend="+۲٪" 
            icon={Wrench} 
            color="bg-blue-500"
            subText="درحال کار توسط تکنیسین"
        />
        <StatCard 
            title="تعمیرات معلق" 
            value="۵ مورد" 
            trend="-۲٪" 
            icon={Clock} 
            color="bg-amber-500"
            subText="در انتظار قطعه/تایید"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-96">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-800">نمودار درآمد</h3>
            <span className="text-xs bg-gray-100 text-gray-500 px-3 py-1 rounded-full">۷ روز گذشته</span>
          </div>
          <div className="flex-1 w-full h-full min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', direction: 'rtl'}} 
                  formatter={(value) => [`${value} تومان`, 'فروش']}
                />
                <Area type="monotone" dataKey="sales" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Customer Type Segmentation Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-96">
          <h3 className="text-lg font-bold text-gray-800 mb-2">تفکیک مشتریان</h3>
          <p className="text-xs text-gray-400 mb-4">مقایسه خریداران کالا و متقاضیان خدمات</p>
          <div className="flex-1 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={customerTypeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  cornerRadius={6}
                >
                  {customerTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 5px 10px rgba(0,0,0,0.1)'}} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Text Overlay */}
            <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none pb-8">
                <span className="text-3xl font-bold text-gray-800">100%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h3 className="text-lg font-bold text-gray-800">آخرین ورودی‌های سیستم</h3>
            <Link to="/repairs" className="flex items-center gap-1 text-indigo-600 text-sm font-medium hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors">
              <span>مشاهده همه</span>
              <ArrowLeft size={16} />
            </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">مشتری</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">نوع خدمت</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">تاریخ</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">وضعیت</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">مبلغ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[
                  { name: 'علی صادقی', type: 'تعمیرات (نصب ویندوز)', device: 'Asus ROG', date: '1402/08/15', status: 'pending', amount: '5,400,000' },
                  { name: 'مریم راد', type: 'فروش (لپ‌تاپ)', device: 'iPhone 13', date: '1402/08/14', status: 'completed', amount: '35,000,000' },
                  { name: 'شرکت افق', type: 'تعمیرات (سخت‌افزار)', device: 'Printer HP', date: '1402/08/14', status: 'waiting', amount: '850,000' },
                  { name: 'رضا کمالی', type: 'فروش (لوازم جانبی)', device: 'Mouse Gaming', date: '1402/08/13', status: 'completed', amount: '1,200,000' },
              ].map((item, i) => (
                <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${item.type.includes('فروش') ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}`}>
                            {item.name.charAt(0)}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-800">{item.name}</span>
                        </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                          <span className="text-sm text-gray-800">{item.device}</span>
                          <span className="text-xs text-gray-400">{item.type}</span>
                      </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 flex items-center gap-2">
                      <Calendar size={14} className="text-gray-400" />
                      {item.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {item.status === 'completed' && <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-emerald-50 text-emerald-700">تکمیل شده</span>}
                    {item.status === 'pending' && <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-50 text-indigo-700">در حال بررسی</span>}
                    {item.status === 'waiting' && <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-amber-50 text-amber-700">منتظر قطعه</span>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-800">
                    {item.amount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;