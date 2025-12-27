import React, { useState } from 'react';
import { HashRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Login from './frontend/src/pages/Login';
import Dashboard from './frontend/src/pages/Dashboard';
import Repairs from './frontend/src/pages/Repairs';
import Sales from './frontend/src/pages/Sales';
import Customers from './frontend/src/pages/Customers';
import Settings from './frontend/src/pages/Settings';
import CustomerPortal from './frontend/src/pages/CustomerPortal';
import Layout from './frontend/src/components/Layout';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<'admin' | 'customer' | null>(null);

  const handleLogin = (role: 'admin' | 'customer') => {
    setIsAuthenticated(true);
    setUserRole(role);
  };

  // Protected Route Wrapper for Admin
  const AdminRoute = () => {
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    if (userRole !== 'admin') return <Navigate to="/portal" replace />;
    return <Layout />;
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