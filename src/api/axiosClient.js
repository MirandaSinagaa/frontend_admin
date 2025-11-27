// src/api/axiosClient.js

import axios from 'axios';

// Deteksi apakah kita sedang di Vercel (Production) atau di Laptop (Development)
const isProduction = import.meta.env.MODE === 'production';

// Tentukan Base URL berdasarkan mode
const baseURL = isProduction 
  ? 'https://adminbillingkrama.onrender.com/api'  // URL RENDER (Online)
  : 'http://127.0.0.1:8000/api';                 // URL LOCALHOST (Laptop)

console.log("Environment Mode:", import.meta.env.MODE);
console.log("Axios Base URL:", baseURL);

const axiosClient = axios.create({
  baseURL: baseURL, 
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});

// Interceptor Request (Tetap Sama)
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

// Interceptor Response (Tetap Sama)
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