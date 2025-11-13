// src/components/EditKramaModal.jsx

import React, { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';

function EditKramaModal({ isOpen, onClose, onSave, kramaData }) {
  // State untuk data form Krama
  const [nik, setNik] = useState('');
  const [name, setName] = useState('');
  const [gender, setGender] = useState('laki-laki');
  const [status, setStatus] = useState('kramadesa');
  const [banjarId, setBanjarId] = useState('');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(''); 

  const [banjarList, setBanjarList] = useState([]);
  const [isLoadingBanjars, setIsLoadingBanjars] = useState(true);
  
  const [errors, setErrors] = useState(null); 

  // 1. Ambil daftar Banjar saat komponen dimuat (sekali saja)
  useEffect(() => {
    setIsLoadingBanjars(true);
    // --- (PERBAIKAN) ---
    axiosClient.get('/admin/banjar-list') // Tambah prefix /admin
      .then(response => {
        setBanjarList(response.data);
      })
      .catch(error => {
        console.error("Error fetching banjar list:", error);
      })
      .finally(() => {
        setIsLoadingBanjars(false);
      });
  }, []); 

  // 2. Isi form saat 'kramaData' (props) berubah
  useEffect(() => {
    if (kramaData) {
      setNik(kramaData.nik || '');
      setName(kramaData.name || '');
      setGender(kramaData.gender || 'laki-laki');
      setStatus(kramaData.status || 'kramadesa');
      setBanjarId(kramaData.banjar?.banjar_id || '');
      setEmail(kramaData.email || ''); 
      setPassword(''); 
      setErrors(null); 
    }
  }, [kramaData]); 

  // 3. Fungsi untuk submit (memanggil onSave dari props)
  const handleSubmit = (e) => {
    e.preventDefault();
    
    onSave({
      nik,
      name,
      gender,
      status,
      banjar_id: banjarId,
      email,
      password: password || null, 
    });
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={onClose}
    >
      {/* Konten Modal */}
      <div 
        className="bg-white rounded-lg shadow-xl w-full max-w-4xl m-4 transform"
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit}>
          {/* Header Modal */}
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="text-xl font-semibold text-gray-900">Edit Data Krama & Akun</h3>
            <button
              type="button" onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          {/* Body Modal (Form) */}
          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* --- KOLOM 1: DATA DIRI --- */}
            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 p-4 border rounded-md">
              <h3 className="md:col-span-2 text-lg font-semibold text-gray-800 border-b pb-2 mb-2">Data Kependudukan</h3>
              {/* NIK */}
              <div>
                <label htmlFor="edit-nik" className="block text-sm font-medium text-gray-700">NIK</label>
                <input
                  id="edit-nik" type="text" value={nik} onChange={(e) => setNik(e.target.value)}
                  required maxLength="16" minLength="16"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              {/* Nama */}
              <div>
                <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700">Nama Lengkap</label>
                <input
                  id="edit-name" type="text" value={name} onChange={(e) => setName(e.target.value)}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              {/* Banjar */}
              <div>
                <label htmlFor="edit-banjar" className="block text-sm font-medium text-gray-700">Banjar</label>
                <select
                  id="edit-banjar" value={banjarId} onChange={(e) => setBanjarId(e.target.value)}
                  required disabled={isLoadingBanjars}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="" disabled>-- Pilih Banjar --</option>
                  {banjarList.map(banjar => (
                    <option key={banjar.banjar_id} value={banjar.banjar_id}>
                      {banjar.nama_banjar}
                    </option>
                  ))}
                </select>
              </div>
              {/* Status Krama */}
              <div>
                <label htmlFor="edit-status" className="block text-sm font-medium text-gray-700">Status Krama</label>
                <select
                  id="edit-status" value={status} onChange={(e) => setStatus(e.target.value)}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="kramadesa">Krama Desa</option>
                  <option value="krama_tamiu">Krama Tamiu</option>
                  <option value="tamiu">Tamiu</option>
                </select>
              </div>
              {/* Gender */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Jenis Kelamin</label>
                <div className="flex items-center space-x-4 mt-1">
                  <label><input type="radio" value="laki-laki" checked={gender === 'laki-laki'} onChange={(e) => setGender(e.target.value)} className="mr-1" /> Laki-laki</label>
                  <label><input type="radio" value="perempuan" checked={gender === 'perempuan'} onChange={(e) => setGender(e.target.value)} className="mr-1" /> Perempuan</label>
                </div>
              </div>
            </div>

            {/* --- KOLOM 2: DATA AKUN (BARU) --- */}
            <div className="md:col-span-1 p-4 border rounded-md bg-yellow-50">
              <h3 className="text-lg font-semibold text-gray-800 border-b border-yellow-200 pb-2 mb-4">Data Akun Login (User)</h3>
              {/* Email */}
              <div className="mb-4">
                <label htmlFor="edit-email" className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  id="edit-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Password */}
              <div>
                <label htmlFor="edit-password" className="block text-sm font-medium text-gray-700">Password Baru</label>
                <input
                  id="edit-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="(Biarkan kosong jika tidak ganti)" minLength="6"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Footer Modal (Tombol) */}
          <div className="flex items-center justify-end p-4 border-t space-x-3">
            <button
              type="button" onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-yellow-500 rounded-md hover:bg-yellow-600"
            >
              Simpan Perubahan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditKramaModal;