// src/api/axiosClient.js

import axios from 'axios';

// Buat instance Axios baru
const axiosClient = axios.create({
  // (PERBAIKAN) Gunakan Logika Pintar ini:
  // Cek apakah ada VITE_API_BASE_URL (dari Vercel)? Jika ada pakai itu.
  // Jika tidak ada, baru pakai localhost.
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api', 
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});

axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login'; 
    }
    return Promise.reject(error);
  }
);

export default axiosClient;