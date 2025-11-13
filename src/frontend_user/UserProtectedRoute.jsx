// src/frontend_user/UserProtectedRoute.jsx

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import UserLayout from './UserLayout'; // <-- Impor layout dari folder yang sama

const UserProtectedRoute = () => {
  const { user } = useAuth();

  // 1. Cek apakah user login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 2. Cek apakah user adalah 'admin'
  if (user.role === 'admin') {
    // Jika admin, kembalikan dia ke dashboard admin
    return <Navigate to="/admin" replace />;
  }
  
  // 3. Jika rolenya 'user', tampilkan layout user.
  return <UserLayout />;
};

export default UserProtectedRoute;