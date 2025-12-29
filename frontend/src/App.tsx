import React, { useState } from 'react';
import { HashRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Repairs from './pages/Repairs';
import Sales from './pages/Sales';
import Customers from './pages/Customers';
import Settings from './pages/Settings';
import Messages from './pages/Messages'; 
import CustomerPortal from './pages/CustomerPortal';
import Layout from './components/Layout';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<'admin' | 'customer' | null>(null);

  const handleLogin = (role: 'admin' | 'customer') => {
    setIsAuthenticated(true);
    setUserRole(role);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserRole(null);
    localStorage.removeItem('access_token'); 
    localStorage.removeItem('refresh_token'); 
  };

  // Protected Route Wrapper for Admin
  const AdminRoute = () => {
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    if (userRole !== 'admin') return <Navigate to="/portal" replace />;
    return <Layout onLogout={handleLogout} />;
  };

  // Protected Route Wrapper for Customer
  const CustomerRoute = () => {
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    if (userRole !== 'customer') return <Navigate to="/" replace />;
    return <CustomerPortal />;
  };

  return (
    <HashRouter>
      <Routes>
        <Route 
          path="/login" 
          element={
            isAuthenticated ? (
              <Navigate to={userRole === 'admin' ? "/" : "/portal"} replace />
            ) : (
              <Login onLogin={handleLogin} />
            )
          } 
        />
        
        {/* Admin Routes */}
        <Route path="/" element={<AdminRoute />}>
          <Route index element={<Dashboard />} />
          <Route path="sales" element={<Sales />} />
          <Route path="repairs" element={<Repairs />} />
          <Route path="customers" element={<Customers />} />
          <Route path="messages" element={<Messages />} /> {/* New Route */}
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* Customer Portal Route */}
        <Route path="/portal" element={<CustomerRoute />} />
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />

      </Routes>
    </HashRouter>
  );
};

export default App;