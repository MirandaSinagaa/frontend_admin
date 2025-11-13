// src/components/GuestRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const GuestRoute = () => {
  const { user } = useAuth(); // Ambil status user

  if (user) {
    // --- (PERUBAHAN) ---
    // Cek peran user dan arahkan ke dashboard yang sesuai
    
    if (user.role === 'admin') {
      // Jika user ADALAH admin, arahkan ke dashboard admin
      return <Navigate to="/admin" replace />;
    }
    
    if (user.role === 'user') {
      // Jika user ADALAH user biasa, arahkan ke dashboard user
      return <Navigate to="/user" replace />;
    }
    
    // Fallback (jika punya peran lain, arahkan ke login)
    return <Navigate to="/login" replace />;
    // --- (AKHIR PERUBAHAN) ---
  }

  // Jika belum login, tampilkan halaman (misal: LoginPage atau RegisterPage)
  return <Outlet />;
};

export default GuestRoute;