// src/components/ProtectedRoute.jsx

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AdminLayout from './AdminLayout'; // <-- 1. Impor Layout baru

const ProtectedRoute = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 2. Tampilkan AdminLayout (yang di dalamnya sudah ada <Outlet>)
  return <AdminLayout />; 
};

export default ProtectedRoute;