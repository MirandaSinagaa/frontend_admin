// src/components/ProtectedRoute.jsx

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AdminLayout from './AdminLayout'; // <-- Impor Layout Admin

const ProtectedRoute = () => {
  const { user } = useAuth(); // <-- Hanya perlu 'user'

  // 1. Cek apakah user login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 2. (PERUBAHAN) Cek apakah user adalah 'user' biasa
  if (user.role === 'user') {
    // Jika 'user' biasa mencoba akses /admin,
    // arahkan dia ke dashboard user miliknya.
    return <Navigate to="/user" replace />;
  }

  // 3. (PERUBAHAN) Cek apakah user adalah 'admin'
  if (user.role === 'admin') {
    // Tampilkan AdminLayout (jika lolos)
    return <AdminLayout />;
  }
  
  // Fallback (jika role tidak dikenali, kirim ke login)
  return <Navigate to="/login" replace />;
};

export default ProtectedRoute;