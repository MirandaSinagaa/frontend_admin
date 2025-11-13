// src/context/AuthContext.jsx

import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios'; 
import axiosClient from '../api/axiosClient'; 

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
      setIsLoading(false); 
    }
  }, []); 

  // Fungsi untuk menyimpan data setelah login/register
  const setUserAndToken = (userData, userToken) => {
    localStorage.setItem('authToken', userToken);
    setToken(userToken);
    setUser(userData);
  };

  /**
   * Fungsi untuk Login.
   */
  const login = async (email, password) => {
    const response = await axios.post('http://127.0.0.1:8000/api/login', {
      email,
      password,
    });
    setUserAndToken(response.data.user, response.data.token);
  };

  /**
   * Fungsi untuk Register.
   */
  const register = async (payload) => {
    const response = await axios.post('http://127.0.0.1:8000/api/register', payload);
    setUserAndToken(response.data.user, response.data.token);
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

  // --- (PERUBAHAN) ---
  /**
   * Fungsi baru untuk mengupdate data user di state
   * (Dipanggil setelah Edit Profil berhasil)
   */
  const updateUser = (newUserData) => {
    setUser(newUserData);
  };
  // --- (AKHIR PERUBAHAN) ---

  // 3. Sediakan nilai-nilai ini
  return (
    <AuthContext.Provider value={{ user, token, login, logout, register, isLoading, updateUser }}>
      {/* (PERUBAHAN) tambahkan 'updateUser' ke value */}
      {!isLoading && children}
    </AuthContext.Provider>
  );
};

// 4. Buat Custom Hook (TETAP SAMA)
export const useAuth = () => {
  return useContext(AuthContext);
};