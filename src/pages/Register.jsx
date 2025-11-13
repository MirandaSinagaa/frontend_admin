// src/pages/Register.jsx

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import axios from 'axios'; // Gunakan axios biasa (publik) untuk ambil banjar-list

function RegisterPage() {
  // State untuk data form User
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // (BARU) State untuk data form Krama
  const [nik, setNik] = useState('');
  const [gender, setGender] = useState('laki-laki');
  const [status, setStatus] = useState('kramadesa');
  const [banjarId, setBanjarId] = useState('');

  // (BARU) State untuk daftar banjar (dropdown)
  const [banjarList, setBanjarList] = useState([]);
  const [isLoadingBanjars, setIsLoadingBanjars] = useState(true);

  // State untuk UI
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const { register } = useAuth();

  // (BARU) Ambil daftar Banjar saat komponen dimuat
  useEffect(() => {
    setIsLoadingBanjars(true);
    // Endpoint ini harus dipindahkan ke luar 'auth:sanctum' di api.php
    // ATAU
    // Kita panggil pakai axios biasa, asumsi endpoint '/api/banjar-list'
    // tidak dilindungi (jika dilindungi, ini akan gagal)
    
    // Asumsi kita panggil endpoint publik (jika error, perlu ubah api.php)
    axios.get('http://127.0.0.1:8000/api/banjar-list-public') // Kita asumsikan ada route ini
      .then(response => {
        setBanjarList(response.data);
        if (response.data.length > 0) {
          setBanjarId(response.data[0].banjar_id);
        }
      })
      .catch(error => {
        console.error("Error fetching banjar list:", error);
        setError("Gagal memuat daftar banjar. (Pastikan API /banjar-list-public ada)");
      })
      .finally(() => {
        setIsLoadingBanjars(false);
      });
  }, []);


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    // (PERBAIKAN) Buat payload lengkap
    const payload = {
      name,
      email,
      password,
      nik,
      gender,
      status,
      banjar_id: banjarId,
    };

    try {
      // Panggil fungsi register dari context
      await register(payload);
      // AuthContext akan menangani login dan redirect
      // GuestRoute akan otomatis mengarahkan

    } catch (err) {
      console.error('Registrasi gagal!', err);
      if (err.response && err.response.status === 422) {
        // Tangani error validasi
        const validationErrors = err.response.data.errors;
        // Ambil error pertama yang muncul
        if (validationErrors) {
            const firstError = validationErrors[Object.keys(validationErrors)[0]][0];
            setError(firstError);
        } else {
            setError(err.response.data.message || 'Data tidak valid.');
        }
      } else {
        setError('Terjadi kesalahan pada server. Silakan coba lagi.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 py-12">
      <div className="w-full max-w-4xl p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-center">Registrasi Akun Krama (Warga)</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* (BARU) Layout 2 Kolom */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            
            {/* --- KOLOM 1: Data Akun --- */}
            <div className="space-y-4 p-4 border rounded-md">
              <h2 className="text-xl font-semibold border-b pb-2">Data Akun Login</h2>
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Nama Lengkap (Sesuai KTP)
                </label>
                <input
                  id="name" type="text" value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  id="email" type="email" value={email}
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
                  id="password" type="password" value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required minLength="6"
                  className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* --- KOLOM 2: Data Kependudukan --- */}
            <div className="space-y-4 p-4 border rounded-md">
              <h2 className="text-xl font-semibold border-b pb-2">Data Kependudukan</h2>
              <div>
                <label htmlFor="nik" className="block text-sm font-medium text-gray-700">
                  NIK (Nomor Induk Kependudukan)
                </label>
                <input
                  id="nik" type="text" value={nik}
                  onChange={(e) => setNik(e.target.value)}
                  required maxLength="16" minLength="16"
                  className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="banjar" className="block text-sm font-medium text-gray-700">Banjar</label>
                <select
                  id="banjar" value={banjarId} 
                  onChange={(e) => setBanjarId(e.target.value)}
                  required
                  disabled={isLoadingBanjars || banjarList.length === 0}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="" disabled>
                    {isLoadingBanjars ? 'Memuat banjar...' : '-- Pilih Banjar --'}
                  </option>
                  {banjarList.map(banjar => (
                    <option key={banjar.banjar_id} value={banjar.banjar_id}>
                      {banjar.nama_banjar}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status Krama</label>
                <select
                  id="status" value={status} 
                  onChange={(e) => setStatus(e.target.value)}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="kramadesa">Krama Desa</option>
                  <option value="krama_tamiu">Krama Tamiu</option>
                  <option value="tamiu">Tamiu</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Jenis Kelamin</label>
                <div className="flex items-center space-x-4 mt-1">
                  <label><input type="radio" value="laki-laki" checked={gender === 'laki-laki'} onChange={(e) => setGender(e.target.value)} className="mr-1" /> Laki-laki</label>
                  <label><input type="radio" value="perempuan" checked={gender === 'perempuan'} onChange={(e) => setGender(e.target.value)} className="mr-1" /> Perempuan</label>
                </div>
              </div>

            </div>
          </div>


          {error && (
            <div className="p-3 text-sm text-red-800 bg-red-100 border border-red-300 rounded-md">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading || isLoadingBanjars}
              className={`w-full px-4 py-2 font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                ${(isLoading || isLoadingBanjars)
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
                }
              `}
            >
              {isLoading ? 'Mendaftarkan...' : 'Register Akun Saya'}
            </button>
          </div>
        </form>

        <p className="text-sm text-center text-gray-600">
          Sudah punya akun?{' '}
          <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
            Login di sini
          </Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;