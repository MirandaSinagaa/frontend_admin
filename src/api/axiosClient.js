// src/api/axiosClient.js

import axios from 'axios';

// Buat instance Axios baru
const axiosClient = axios.create({
  // Tetapkan URL dasar untuk semua permintaan
  baseURL: 'http://127.0.0.1:8000/api', 
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});

// Tambahkan "interceptor" permintaan
// Ini adalah fungsi yang akan berjalan SEBELUM setiap permintaan dikirim
axiosClient.interceptors.request.use(
  (config) => {
    // Ambil token dari localStorage
    const token = localStorage.getItem('authToken');

    // Jika token ada, tambahkan ke header Authorization
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // Sesuai format Bearer Token [cite: 882]
    }

    return config;
  },
  (error) => {
    // Lakukan sesuatu jika terjadi error pada konfigurasi permintaan
    return Promise.reject(error);
  }
);

// (Opsional tapi disarankan) Tambahkan "interceptor" respons
// Ini menangani error global, seperti jika token kita kedaluwarsa
axiosClient.interceptors.response.use(
  (response) => {
    // Jika respons sukses (status 2xx), langsung kembalikan respons
    return response;
  },
  (error) => {
    // Tangani error di sini
    if (error.response && error.response.status === 401) {
      // Jika error 401 (Unauthenticated)
      // Hapus token yang tidak valid
      localStorage.removeItem('authToken');
      
      // Redirect ke halaman login
      // Kita beri sedikit pesan agar pengguna tahu
      alert('Sesi Anda telah berakhir. Silakan login kembali.');
      window.location.href = '/login'; 
    }

    // Kembalikan error agar bisa ditangani juga oleh komponen yang memanggil
    return Promise.reject(error);
  }
);

export default axiosClient;