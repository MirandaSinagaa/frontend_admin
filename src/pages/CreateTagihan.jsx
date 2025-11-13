// src/pages/CreateTagihan.jsx

import React, { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';

function CreateTagihan() {
  const [kramaList, setKramaList] = useState([]);
  const [selectedKramaId, setSelectedKramaId] = useState('');

  const [selectedKramaData, setSelectedKramaData] = useState(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  const [tanggal, setTanggal] = useState('');
  const [iuran, setIuran] = useState(''); 
  const [dedosan, setDedosan] = useState('0');
  const [peturuhan, setPeturuhan] = useState('0');

  const [isListLoading, setIsListLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(null);

  // 1. Ambil daftar Krama (warga) saat komponen dimuat
  useEffect(() => {
    setIsListLoading(true);
    // --- (PERBAIKAN) ---
    axiosClient.get('/admin/krama-list') // Tambah prefix /admin
      .then(response => {
        setKramaList(response.data);
      })
      .catch(error => {
        console.error("Error fetching krama list:", error);
        // (Pesan error Anda berasal dari sini)
        setSubmitError("Gagal memuat daftar krama. Coba refresh halaman.");
      })
      .finally(() => {
        setIsListLoading(false);
      });
  }, []);

  // 2. Ambil DETAIL Krama saat 'selectedKramaId' berubah
  useEffect(() => {
    if (!selectedKramaId) {
      setSelectedKramaData(null);
      setIuran(''); 
      return;
    }

    setIsDetailLoading(true);
    setSubmitError(null);
    setSubmitSuccess(null);
    
    // --- (PERBAIKAN) ---
    axiosClient.get(`/admin/krama/${selectedKramaId}`) // Tambah prefix /admin
      .then(response => {
        const kramaData = response.data.data;
        setSelectedKramaData(kramaData);
        setIuran(kramaData.iuran_base || '0'); 
      })
      .catch(error => {
        console.error("Error fetching krama detail:", error);
        setSubmitError("Gagal memuat detail krama.");
        setSelectedKramaData(null);
        setIuran(''); 
      })
      .finally(() => {
        setIsDetailLoading(false);
      });
      
  }, [selectedKramaId]); 

  // 3. Fungsi untuk submit form tagihan
  const handleSubmitTagihan = async (e) => {
    e.preventDefault();
    
    if (!selectedKramaId || !tanggal) {
      setSubmitError("Krama dan Tanggal tagihan wajib diisi.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(null);

    const payload = {
      krama_id: selectedKramaId,
      tanggal,
      iuran: iuran || 0, 
      dedosan: dedosan || 0,
      peturuhan: peturuhan || 0,
    };
    
    try {
      // --- (PERBAIKAN) ---
      await axiosClient.post('/admin/tagihan', payload); // Tambah prefix /admin
      setSubmitSuccess("Tagihan baru berhasil dibuat!");
      resetForm();

    } catch (error) {
      console.error("Error submit tagihan:", error);
      if (error.response && error.response.status === 422) {
        setSubmitError(error.response.data.message || "Data tidak valid.");
      } else {
        setSubmitError("Gagal membuat tagihan.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // 4. Fungsi untuk reset form
  const resetForm = () => {
    setSelectedKramaId(''); 
    setTanggal('');
    setIuran(''); 
    setDedosan('0');
    setPeturuhan('0');
    setSubmitError(null);
  };

  return (
    <> 
      <h1 className="text-3xl font-bold mb-6">Buat Tagihan Baru</h1>
      
      {submitSuccess && (
        <div className="mb-4 p-3 text-sm text-green-800 bg-green-100 border border-green-300 rounded-md">
          {submitSuccess}
        </div>
      )}
      {submitError && (
        <div className="mb-4 p-3 text-sm text-red-800 bg-red-100 border border-red-300 rounded-md">
          {submitError}
        </div>
      )}

      <form onSubmit={handleSubmitTagihan} className="bg-white p-6 rounded-lg shadow-md">
        
        {/* --- BAGIAN 1: PILIH KRAMA --- */}
        <div className="mb-4">
          <label htmlFor="krama" className="block text-lg font-semibold mb-2">1. Pilih Krama (Warga)</label>
          {isListLoading ? (
            <div className="text-gray-500">Memuat daftar krama...</div>
          ) : (
            <select
              id="krama"
              value={selectedKramaId}
              onChange={(e) => setSelectedKramaId(e.target.value)}
              required
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="" disabled>-- Pilih Nama Krama (NIK) --</option>
              {kramaList.map((krama) => (
                <option key={krama.krama_id} value={krama.krama_id}>
                  {krama.name} ({krama.nik})
                </option>
              ))}
            </select>
          )}
        </div>

        {/* --- BAGIAN 2: INFO DATA WARGA --- */}
        {isDetailLoading && (
          <div className="mt-4 p-4 text-center text-gray-600">
            Memuat detail krama...
          </div>
        )}
        
        {selectedKramaData && !isDetailLoading && (
          <div className="mt-4 mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200 animate-fadeIn">
            <h3 className="text-md font-semibold text-gray-800 mb-2">Data Warga Terpilih:</h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
              <span className="text-gray-500">Nama</span>
              <span className="text-gray-900 font-medium">{selectedKramaData.name}</span>
              <span className="text-gray-500">NIK</span>
              <span className="text-gray-900 font-medium">{selectedKramaData.nik}</span>
              <span className="text-gray-500">Banjar</span>
              <span className="text-gray-900 font-medium">
                {selectedKramaData.banjar?.nama_banjar || 'N/A'}
              </span>
              <span className="text-gray-500">Status</span>
              <span className="text-gray-900 font-medium capitalize">
                {selectedKramaData.status?.replace('_', ' ')}
              </span>
            </div>
          </div>
        )}

        {/* --- BAGIAN 3: FORM TAGIHAN --- */}
        {selectedKramaData && !isDetailLoading && (
          <div className="animate-fadeIn">
            <hr className="my-6" />
            <h2 className="text-lg font-semibold mb-4">2. Masukkan Detail Tagihan</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Input Tanggal (Wajib) */}
              <div>
                <label htmlFor="tanggal" className="block text-sm font-medium text-gray-700">Tanggal Tagihan (Wajib)</label>
                <input 
                  id="tanggal" type="date" value={tanggal} 
                  onChange={(e) => setTanggal(e.target.value)} 
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" 
                />
              </div>

              {/* (BARU) Input Iuran (Bisa Diedit) */}
              <div>
                <label htmlFor="iuran" className="block text-sm font-medium text-gray-700">
                  Iuran (Otomatis)
                </label>
                <input 
                  id="iuran"
                  type="number" 
                  value={iuran} // <-- Value dari state
                  onChange={(e) => setIuran(e.target.value)} // <-- Bisa diubah
                  required
                  min="0"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" 
                />
              </div>
              
              {/* Input Dedosan (Opsional) */}
              <div>
                <label htmlFor="dedosan" className="block text-sm font-medium text-gray-700">Dedosan (Opsional)</label>
                <input 
                  id="dedosan" type="number" value={dedosan} 
                  onChange={(e) => setDedosan(e.target.value)} 
                  placeholder="0" min="0"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" 
                />
              </div>
              
              {/* Input Peturuhan (Opsional) */}
              <div className="md:col-start-1"> 
                <label htmlFor="peturuhan" className="block text-sm font-medium text-gray-700">Peturuhan (Opsional)</label>
                <input 
                  id="peturuhan" type="number" value={peturuhan} 
                  onChange={(e) => setPeturuhan(e.target.value)} 
                  placeholder="0" min="0"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" 
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-4 mt-8">
              <button
                type="button" onClick={resetForm} 
                className="px-6 py-2 font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !tanggal || !iuran} 
                className={`px-6 py-2 font-medium text-white rounded-md transition
                  ${(isSubmitting || !tanggal || !iuran)
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
                  }
                `}
              >
                {isSubmitting ? 'Menyimpan...' : 'Simpan Tagihan'}
              </button>
            </div>
          </div>
        )}
      </form>
    </>
  );
}

export default CreateTagihan;