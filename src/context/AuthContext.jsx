// src/context/AuthContext.jsx

import React, { createContext, useState, useContext, useEffect } from 'react';
// HAPUS import axios biasa, kita tidak boleh memakainya lagi
// import axios from 'axios'; 
import axiosClient from '../api/axiosClient'; // <-- Kita WAJIB pakai ini untuk semua request

// 1. Buat Context-nya
const AuthContext = createContext();

// 2. Buat Provider (Penyedia)
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('authToken') || null);
  const [isLoading, setIsLoading] = useState(true); 

  // Efek ini berjalan saat komponen dimuat (untuk cek token lama)
  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    if (storedToken) {
      setToken(storedToken);
      // Panggil profile untuk validasi token dan ambil data user
      axiosClient.get('/profile')
        .then(response => {
          setUser(response.data); 
        })
        .catch(error => {
          console.error("Token lama tidak valid:", error);
          localStorage.removeItem('authToken'); 
          setToken(null);
          setUser(null);
        })
        .finally(() => {
          setIsLoading(false); 
        });
    } else {
      // Jika tidak ada token
      setIsLoading(false); 
    }
  }, []); 

  // Fungsi Helper untuk menyimpan data
  const setUserAndToken = (userData, userToken) => {
    localStorage.setItem('authToken', userToken);
    setToken(userToken);
    setUser(userData);
  };

  /**
   * Fungsi untuk Login.
   * (DIPERBAIKI: Menggunakan axiosClient agar URL dinamis mengikuti environment Vercel/Render)
   */
  const login = async (email, password) => {
    // GANTI 'axios.post' menjadi 'axiosClient.post'
    // HAPUS 'http://127.0.0.1...', cukup '/login' saja.
    const response = await axiosClient.post('/login', {
      email,
      password,
    });
    
    // Simpan token yang diterima
    const receivedToken = response.data.token;
    localStorage.setItem('authToken', receivedToken);
    setToken(receivedToken);

    // Karena backend login Anda mungkin belum mengirim data 'user' lengkap,
    // Kita panggil /profile segera setelah login untuk mendapatkan data user.
    try {
      const userResponse = await axiosClient.get('/profile');
      setUser(userResponse.data);
    } catch (profileError) {
      console.error("Gagal mengambil profil setelah login:", profileError);
    }
  };

  /**
   * Fungsi untuk Register.
   * (DIPERBAIKI: Menggunakan axiosClient)
   */
  const register = async (payload) => {
    // GANTI 'axios.post' menjadi 'axiosClient.post'
    const response = await axiosClient.post('/register', payload);
    
    // Jika backend register mengembalikan token, langsung login
    if (response.data.token) {
        const receivedToken = response.data.token;
        localStorage.setItem('authToken', receivedToken);
        setToken(receivedToken);
        
        // Set data user (jika dikirim oleh backend)
        if (response.data.user) {
             setUser(response.data.user);
        } else {
             // Jika tidak, ambil dari profile
             const userResponse = await axiosClient.get('/profile');
             setUser(userResponse.data);
        }
    }
  };

  // Fungsi untuk Logout
  const logout = async () => {
    try {
      await axiosClient.post('/logout');
    } catch (error) {
      console.error("Logout gagal:", error);
    } finally {
      localStorage.removeItem('authToken');
      setToken(null);
      setUser(null);
    }
  };

  /**
   * Fungsi baru untuk mengupdate data user di state
   * (Dipanggil setelah Edit Profil berhasil)
   */
  const updateUser = (newUserData) => {
    setUser(newUserData);
  };

  // 3. Sediakan nilai-nilai ini
  return (
    <AuthContext.Provider value={{ user, token, login, logout, register, isLoading, updateUser }}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};

// 4. Buat Custom Hook
export const useAuth = () => {
  return useContext(AuthContext);
};