// src/pages/Login.jsx

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext'; // <-- BARU: Impor hook useAuth kita

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // State ini sekarang HANYA untuk form ini
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Ambil fungsi 'login' dari context
  const { login } = useAuth(); // <-- BARU: Jauh lebih bersih!

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // <-- BARU: Cukup panggil fungsi login dari context
      await login(email, password);
      
      // Jika berhasil, context akan menangani penyimpanan token
      // dan pengambilan data pengguna.
      
      // Kita tidak perlu redirect manual di sini,
      // karena di langkah selanjutnya (Routing), kita akan
      // membuat halaman ini otomatis redirect jika user sudah login.

    } catch (err) {
      // Tangkap error jika 'login' gagal (misal: password salah)
      console.error('Login gagal!', err);
      if (err.response && (err.response.status === 422 || err.response.status === 401)) {
        setError(err.response.data.message || 'Email atau password salah.');
      } else {
        setError('Terjadi kesalahan pada server. Silakan coba lagi.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // --- Tidak ada perubahan pada bagian JSX (tampilan) ---
  // Tampilannya tetap sama bagusnya dengan sebelumnya
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center">Admin Login</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {error && (
            <div className="p-3 text-sm text-red-800 bg-red-100 border border-red-300 rounded-md">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full px-4 py-2 font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                ${isLoading 
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
                }
              `}
            >
              {isLoading ? 'Loading...' : 'Login'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;