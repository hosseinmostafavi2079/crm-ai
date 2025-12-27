import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Wrench, 
  Settings, 
  LogOut, 
  Menu, 
  Bell, 
  Search,
  User,
  Users
} from 'lucide-react';

const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  const navItems = [
    { name: 'داشبورد', path: '/', icon: LayoutDashboard },
    { name: 'مدیریت فروش', path: '/sales', icon: ShoppingCart },
    { name: 'خدمات و تعمیرات', path: '/repairs', icon: Wrench },
    { name: 'لیست مشتریان', path: '/customers', icon: Users },
    { name: 'تنظیمات سیستم', path: '/settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans text-right" dir="rtl">
      
      {/* Sidebar */}
      <aside 
        className={`
          bg-white shadow-2xl z-20 transition-all duration-300 ease-in-out flex flex-col
          ${sidebarOpen ? 'w-64' : 'w-20'}
        `}
      >
        <div className="h-24 flex items-center justify-center border-b border-gray-100 p-4">
          <div className={`flex items-center gap-3 transition-all ${!sidebarOpen && 'flex-col gap-1'}`}>
             {/* Logo Section - Replace src with your actual logo path */}
             <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200 overflow-hidden shrink-0">
                {/* Placeholder for Logo Image */}
                <span className="text-white font-bold text-xl">ID</span>
             </div>
             {sidebarOpen && (
                <div className="flex flex-col animate-fadeIn">
                  <h1 className="text-xl font-black text-gray-800 tracking-tight">آیدی ۷۲۴</h1>
                  <span className="text-xs text-indigo-500 font-bold tracking-widest uppercase">ID 724 CRM</span>
                </div>
             )}
          </div>
        </div>

        <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group
                  ${isActive 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' 
                    : 'text-gray-500 hover:bg-indigo-50 hover:text-indigo-600'
                  }
                `}
              >
                <Icon size={22} className={isActive ? 'text-white' : 'text-gray-400 group-hover:text-indigo-600'} />
                {sidebarOpen && <span className="font-medium">{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button className="flex items-center gap-3 w-full px-3 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors">
            <LogOut size={20} />
            {sidebarOpen && <span>خروج از حساب</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Header */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-xl hover:bg-gray-100 text-gray-600 transition-colors"
            >
              <Menu size={24} />
            </button>
            
            <div className="hidden md:flex items-center bg-gray-100/50 rounded-xl px-4 py-2.5 w-96 border border-gray-100 focus-within:ring-2 focus-within:ring-indigo-100 focus-within:bg-white transition-all">
              <Search size={18} className="text-gray-400 ml-2" />
              <input 
                type="text" 
                placeholder="جستجو در سفارشات، سریال‌ها..." 
                className="bg-transparent border-none outline-none text-sm w-full text-gray-700 placeholder-gray-400"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2.5 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>
            
            <div className="flex items-center gap-3 pl-2 border-r border-gray-100 mr-2">
              <div className="flex flex-col items-end hidden sm:flex">
                <span className="text-sm font-bold text-gray-800">علی رضایی</span>
                <span className="text-xs text-indigo-500 font-medium">مدیر سیستم</span>
              </div>
              <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 border border-indigo-200">
                <User size={20} />
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-8">
           <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;