// src/frontend_user/EditProfile.jsx

import React, { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import axios from 'axios'; // Untuk banjar-list-public
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

function EditProfile() {
  const { user, updateUser } = useAuth(); // Ambil user & fungsi updateUser
  
  // State untuk form
  const [nik, setNik] = useState('');
  const [name, setName] = useState('');
  const [gender, setGender] = useState('laki-laki');
  const [status, setStatus] = useState('kramadesa');
  const [banjarId, setBanjarId] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // State untuk UI
  const [banjarList, setBanjarList] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // Loading data profil
  const [isSaving, setIsSaving] = useState(false); // Saving form
  const [errors, setErrors] = useState(null);

  // 1. Ambil daftar Banjar (Publik)
  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/banjar-list-public') //
      .then(response => {
        setBanjarList(response.data);
      })
      .catch(error => {
        console.error("Error fetching banjar list:", error);
        toast.error("Gagal memuat daftar banjar.");
      });
  }, []);

  // 2. Ambil data profil user saat ini
  useEffect(() => {
    setIsLoading(true);
    axiosClient.get('/user/my-profile') // <-- Panggil API baru
      .then(response => {
        const kramaData = response.data.data;
        // Isi semua state
        setNik(kramaData.nik || '');
        setName(kramaData.name || '');
        setGender(kramaData.gender || 'laki-laki');
        setStatus(kramaData.status || 'kramadesa');
        setBanjarId(kramaData.banjar?.banjar_id || '');
        setEmail(kramaData.email || '');
      })
      .catch(error => {
        console.error("Error fetching profile:", error);
        toast.error(error.response?.data?.message || "Gagal memuat data profil.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  // 3. Fungsi untuk submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setErrors(null);

    // Kumpulkan payload
    const payload = {
      nik, name, gender, status,
      banjar_id: banjarId,
      email,
    };
    // Hanya kirim password jika diisi
    if (password) {
      payload.password = password;
    }

    try {
      const response = await axiosClient.put('/user/my-profile', payload); // <-- Panggil API update
      
      // (PENTING) Update AuthContext
      updateUser(response.data); // 'response.data' adalah objek User baru
      
      toast.success('Profil berhasil diperbarui!');
      setPassword(''); // Kosongkan field password

    } catch (error) {
      if (error.response && error.response.status === 422) {
        setErrors(error.response.data);
        toast.error("Data tidak valid. Periksa kembali isian Anda.");
      } else {
        console.error("Error saving profile:", error);
        toast.error("Gagal menyimpan profil.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="text-center">Memuat profil Anda...</div>;
  }

  return (
    <>
      <h1 className="text-3xl font-bold mb-6">Profil Saya</h1>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md max-w-4xl mx-auto">
        
        {errors?.general && (
          <div className="mb-4 p-3 text-sm text-red-800 bg-red-100 border border-red-300 rounded-md">
            {errors.general}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* --- KOLOM 1: DATA DIRI --- */}
          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 p-4 border rounded-md">
            <h3 className="md:col-span-2 text-lg font-semibold text-gray-800 border-b pb-2 mb-2">Data Kependudukan</h3>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nama Lengkap</label>
              <input
                id="name" type="text" value={name} onChange={(e) => setName(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              />
              {errors?.name && <p className="text-red-600 text-sm mt-1">{errors.name[0]}</p>}
            </div>
            <div>
              <label htmlFor="nik" className="block text-sm font-medium text-gray-700">NIK</label>
              <input
                id="nik" type="text" value={nik} onChange={(e) => setNik(e.target.value)}
                required maxLength="16" minLength="16"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              />
              {errors?.nik && <p className="text-red-600 text-sm mt-1">{errors.nik[0]}</p>}
            </div>
            <div>
              <label htmlFor="banjar" className="block text-sm font-medium text-gray-700">Banjar</label>
              <select
                id="banjar" value={banjarId} onChange={(e) => setBanjarId(e.target.value)}
                required disabled={banjarList.length === 0}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              >
                <option value="" disabled>-- Pilih Banjar --</option>
                {banjarList.map(banjar => (
                  <option key={banjar.banjar_id} value={banjar.banjar_id}>
                    {banjar.nama_banjar}
                  </option>
                ))}
              </select>
              {errors?.banjar_id && <p className="text-red-600 text-sm mt-1">{errors.banjar_id[0]}</p>}
            </div>
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status Krama</label>
              <select
                id="status" value={status} onChange={(e) => setStatus(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              >
                <option value="kramadesa">Krama Desa</option>
                <option value="krama_tamiu">Krama Tamiu</option>
                <option value="tamiu">Tamiu</option>
              </select>
              {errors?.status && <p className="text-red-600 text-sm mt-1">{errors.status[0]}</p>}
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Jenis Kelamin</label>
              <div className="flex items-center space-x-4 mt-1">
                <label><input type="radio" value="laki-laki" checked={gender === 'laki-laki'} onChange={(e) => setGender(e.target.value)} className="mr-1" /> Laki-laki</label>
                <label><input type="radio" value="perempuan" checked={gender === 'perempuan'} onChange={(e) => setGender(e.target.value)} className="mr-1" /> Perempuan</label>
              </div>
              {errors?.gender && <p className="text-red-600 text-sm mt-1">{errors.gender[0]}</p>}
            </div>
          </div>
          
          {/* --- KOLOM 2: DATA AKUN --- */}
          <div className="md:col-span-1 p-4 border rounded-md bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">Data Akun Login</h3>
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
              <input
                id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              />
              {errors?.email && <p className="text-red-600 text-sm mt-1">{errors.email[0]}</p>}
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password Baru</label>
              <input
                id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="(Kosongkan jika tidak ganti)" minLength="6"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              />
              {errors?.password && <p className="text-red-600 text-sm mt-1">{errors.password[0]}</p>}
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button
            type="submit"
            disabled={isSaving}
            className={`px-6 py-2 font-medium text-white rounded-md transition
              ${isSaving
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700'
              }
            `}
          >
            {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </div>
      </form>
    </>
  );
}

export default EditProfile;