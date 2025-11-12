// src/context/AuthContext.jsx

import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios'; // <-- Impor axios biasa untuk login
import axiosClient from '../api/axiosClient'; // <-- Impor API Client kita

// 1. Buat Context-nya
const AuthContext = createContext();

// 2. Buat Provider (Penyedia)
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('authToken') || null);
  const [isLoading, setIsLoading] = useState(true);

  // Efek ini berjalan saat token berubah
  useEffect(() => {
    if (token) {
      localStorage.setItem('authToken', token);

      // Ambil data pengguna dari API menggunakan token
      // Kita gunakan endpoint /profile
      axiosClient.get('/profile') // [cite: 953]
        .then(response => {
          setUser(response.data); // Simpan data pengguna
        })
        .catch(error => {
          console.error("Gagal mengambil profil:", error);
          localStorage.removeItem('authToken'); // Hapus token buruk
          setToken(null);
          setUser(null);
        })
        .finally(() => {
          setIsLoading(false); // Selesai loading
        });

    } else {
      // Jika tidak ada token
      localStorage.removeItem('authToken');
      setUser(null);
      setIsLoading(false); // Selesai loading
    }
  }, [token]); // Bergantung pada 'token'

  // Fungsi untuk Login
  const login = async (email, password) => {
    // Kita HARUS pakai axios biasa untuk login (endpoint publik)
    const response = await axios.post('http://127.0.0.1:8000/api/login', {
      email,
      password,
    });

    // Jika sukses, simpan token.
    // useEffect di atas akan otomatis berjalan.
    setToken(response.data.token);
  };

  // Fungsi untuk Logout
  const logout = async () => {
    try {
      // Panggil endpoint /logout (endpoint aman, pakai axiosClient)
      await axiosClient.post('/logout'); [cite_start]// [cite: 958]
    } catch (error) {
      console.error("Logout gagal:", error);
    } finally {
      setToken(null); 
    }
  };

  // 3. Sediakan nilai-nilai ini
  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {/* Jangan render App sampai kita tahu status login-nya */}
      {!isLoading && children}
    </AuthContext.Provider>
  );
};

// 4. Buat Custom Hook
export const useAuth = () => {
  return useContext(AuthContext);
};