// src/frontend_user/SearchKrama.jsx

import React, { useState } from 'react';
import axiosClient from '../api/axiosClient';
import { useCart } from '../context/CartContext';
import { toast } from 'react-hot-toast';

// (Helper) Komponen Kartu Tagihan yang kita buat di MyBills.jsx
// Kita bisa impor, tapi untuk kesederhanaan, kita salin & modifikasi sedikit
function BillCard({ tagihan, onAddToCart }) {
  const formatRupiah = (angka) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency', currency: 'IDR', minimumFractionDigits: 0
    }).format(angka);
  };

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden flex flex-col">
      <div className="p-5 flex-grow">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-500">{tagihan.tanggal}</span>
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
            Belum Lunas
          </span>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-1">
          {tagihan.krama?.name}
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          NIK: {tagihan.krama?.nik || 'N/A'}
        </p>
        
        <div className="space-y-1 text-sm mb-4">
          <div className="flex justify-between"><span>Iuran Wajib:</span> <span className="font-medium">{formatRupiah(tagihan.iuran)}</span></div>
          <div className="flex justify-between"><span>Dedosan:</span> <span className="font-medium">{formatRupiah(tagihan.dedosan)}</span></div>
          <div className="flex justify-between"><span>Peturuhan:</span> <span className="font-medium">{formatRupiah(tagihan.peturuhan)}</span></div>
        </div>
      </div>
      
      <div className="bg-gray-50 px-5 py-4 flex justify-between items-center">
        <div>
          <span className="text-xs text-gray-500 block">Total Tagihan</span>
          <span className="text-xl font-bold text-blue-600">
            {formatRupiah(tagihan.total_tagihan)}
          </span>
        </div>
        <button
          onClick={() => onAddToCart(tagihan)}
          className="px-4 py-2 font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition"
        >
          + Tambah ke Keranjang
        </button>
      </div>
    </div>
  );
}


// Halaman Utama Pencarian
function SearchKrama() {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]); // Hasil Krama
  const [selectedKrama, setSelectedKrama] = useState(null); // Krama yg dipilih
  const [kramaBills, setKramaBills] = useState([]); // Tagihan krama yg dipilih
  
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingBills, setIsLoadingBills] = useState(false);
  
  const { addToCart } = useCart();

  // 1. Fungsi untuk mencari Krama (API search-krama)
  const handleSearch = async (e) => {
    e.preventDefault();
    if (query.length < 3) {
      toast.error("Minimal 3 karakter untuk pencarian.");
      return;
    }
    
    setIsSearching(true);
    setSelectedKrama(null); // Reset pilihan
    setKramaBills([]);      // Reset tagihan
    
    try {
      const response = await axiosClient.get('/user/search-krama', { //
        params: { q: query }
      });
      setSearchResults(response.data.data);
      if(response.data.data.length === 0) {
        toast.success("Krama tidak ditemukan.");
      }
    } catch (error) {
      console.error("Error searching krama:", error);
      toast.error("Gagal melakukan pencarian.");
    } finally {
      setIsSearching(false);
    }
  };

  // 2. Fungsi untuk mengambil tagihan Krama yang dipilih
  const handleSelectKrama = async (krama) => {
    setSelectedKrama(krama);
    setIsLoadingBills(true);
    setSearchResults([]); // Sembunyikan hasil pencarian
    setQuery(krama.name); // Isi search bar dgn nama
    
    try {
      const response = await axiosClient.get(`/user/krama/${krama.krama_id}/unpaid-bills`); //
      setKramaBills(response.data.data);
    } catch (error) {
      console.error("Error fetching krama bills:", error);
      toast.error("Gagal memuat tagihan krama ini.");
    } finally {
      setIsLoadingBills(false);
    }
  };

  return (
    <>
      <h1 className="text-3xl font-bold text-slate-900 mb-6">Bayar Tagihan Warga Lain</h1>

      {/* Form Pencarian */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari berdasarkan NIK atau Nama..."
            className="flex-grow px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            type="submit"
            disabled={isSearching}
            className="px-6 py-2 font-medium text-white bg-blue-600 rounded-r-md hover:bg-blue-700 disabled:bg-gray-400"
          >
            {isSearching ? 'Mencari...' : 'Cari'}
          </button>
        </div>
      </form>

      {/* Hasil Pencarian (List Krama) */}
      {searchResults.length > 0 && (
        <div className="bg-white shadow-md rounded-lg mb-6">
          <ul className="divide-y divide-gray-200">
            {searchResults.map(krama => (
              <li 
                key={krama.krama_id}
                onClick={() => handleSelectKrama(krama)}
                className="p-4 hover:bg-gray-50 cursor-pointer"
              >
                <p className="font-semibold text-gray-900">{krama.name}</p>
                <p className="text-sm text-gray-600">NIK: {krama.nik} | Banjar: {krama.banjar?.nama_banjar || 'N/A'}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Hasil Tagihan dari Krama yang dipilih */}
      {selectedKrama && (
        <>
          <h2 className="text-2xl font-semibold text-slate-800 mb-4">
            Tagihan Milik: {selectedKrama.name}
          </h2>
          {isLoadingBills ? (
            <div className="text-center">Memuat tagihan...</div>
          ) : (
            kramaBills.length === 0 ? (
              <div className="bg-white p-6 rounded-lg shadow-md text-center text-gray-600">
                Warga ini tidak memiliki tagihan yang belum lunas.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {kramaBills.map(tagihan => (
                  <BillCard 
                    key={tagihan.tagihan_id} 
                    tagihan={tagihan}
                    onAddToCart={addToCart}
                  />
                ))}
              </div>
            )
          )}
        </>
      )}
    </>
  );
}

export default SearchKrama;