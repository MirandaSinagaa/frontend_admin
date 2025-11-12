import React, { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';

function TambahKrama() {
  // State untuk data form
  const [nik, setNik] = useState('');
  const [name, setName] = useState('');
  const [gender, setGender] = useState('laki-laki');
  const [status, setStatus] = useState('kramadesa');
  const [banjarId, setBanjarId] = useState('');

  // State untuk daftar banjar (dropdown)
  const [banjarList, setBanjarList] = useState([]);
  
  // State untuk loading & error
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState(null);
  const [success, setSuccess] = useState(null);

  // 1. Ambil daftar Banjar saat komponen dimuat
  useEffect(() => {
    axiosClient.get('/banjar-list')
      .then(response => {
        setBanjarList(response.data);
        // Set banjar_id default ke banjar pertama jika ada
        if (response.data.length > 0) {
          setBanjarId(response.data[0].banjar_id);
        }
      })
      .catch(error => {
        console.error("Error fetching banjar list:", error);
      });
  }, []);

  // 2. Fungsi untuk submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors(null);
    setSuccess(null);

    const payload = { nik, name, gender, status, banjar_id: banjarId };

    try {
      await axiosClient.post('/krama', payload);
      setSuccess('Data krama baru berhasil ditambahkan!');
      // Reset form
      setNik('');
      setName('');
      setGender('laki-laki');
      setStatus('kramadesa');
      setBanjarId(banjarList[0]?.banjar_id || '');
    } catch (error) {
      if (error.response && error.response.status === 422) {
        // Tangani error validasi dari Laravel
        setErrors(error.response.data);
      } else {
        console.error("Error submitting form:", error);
        setErrors({ general: 'Terjadi kesalahan pada server.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <h1 className="text-3xl font-bold mb-6">Tambah Data Warga (Krama)</h1>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto">
        
        {success && (
          <div className="mb-4 p-3 text-sm text-green-800 bg-green-100 border border-green-300 rounded-md">
            {success}
          </div>
        )}
        {errors?.general && (
          <div className="mb-4 p-3 text-sm text-red-800 bg-red-100 border border-red-300 rounded-md">
            {errors.general}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* NIK */}
          <div>
            <label htmlFor="nik" className="block text-sm font-medium text-gray-700">NIK</label>
            <input
              id="nik" type="text" value={nik} onChange={(e) => setNik(e.target.value)}
              required maxLength="16" minLength="16"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            {errors?.nik && <p className="text-red-600 text-sm mt-1">{errors.nik[0]}</p>}
          </div>

          {/* Nama */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nama Lengkap</label>
            <input
              id="name" type="text" value={name} onChange={(e) => setName(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            {errors?.name && <p className="text-red-600 text-sm mt-1">{errors.name[0]}</p>}
          </div>

          {/* Banjar */}
          <div>
            <label htmlFor="banjar" className="block text-sm font-medium text-gray-700">Banjar</label>
            <select
              id="banjar" value={banjarId} onChange={(e) => setBanjarId(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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

          {/* Status Krama */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status Krama</label>
            <select
              id="status" value={status} onChange={(e) => setStatus(e.g.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="kramadesa">Krama Desa</option>
              <option value="krama_tamiu">Krama Tamiu</option>
              <option value="tamiu">Tamiu</option>
            </select>
            {errors?.status && <p className="text-red-600 text-sm mt-1">{errors.status[0]}</p>}
          </div>

          {/* Gender */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Jenis Kelamin</label>
            <div className="flex items-center space-x-4 mt-1">
              <label><input type="radio" value="laki-laki" checked={gender === 'laki-laki'} onChange={(e) => setGender(e.target.value)} className="mr-1" /> Laki-laki</label>
              <label><input type="radio" value="perempuan" checked={gender === 'perempuan'} onChange={(e) => setGender(e.target.value)} className="mr-1" /> Perempuan</label>
            </div>
            {errors?.gender && <p className="text-red-600 text-sm mt-1">{errors.gender[0]}</p>}
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button
            type="submit"
            disabled={isLoading || banjarList.length === 0}
            className={`px-6 py-2 font-medium text-white rounded-md transition
              ${(isLoading || banjarList.length === 0)
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
              }
            `}
          >
            {isLoading ? 'Menyimpan...' : 'Simpan Krama'}
          </button>
        </div>
      </form>
    </>
  );
}

export default TambahKrama;