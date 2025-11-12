// src/components/GuestRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const GuestRoute = () => {
  const { user } = useAuth(); // Ambil status user

  if (user) {
    // Jika user SUDAH login, jangan tunjukkan halaman login lagi
    // Redirect mereka ke halaman utama admin
    return <Navigate to="/admin" replace />;
  }

  // Jika belum login, tampilkan halaman (misal: LoginPage)
  return <Outlet />;
};

export default GuestRoute;