// src/frontend_user/MyBills.jsx

import React, { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import { useCart } from '../context/CartContext';
import { toast } from 'react-hot-toast';

// Komponen Card Tagihan (Bisa dipisah jika mau)
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
        
        {/* Rincian Tagihan */}
        <div className="space-y-1 text-sm mb-4">
          <div className="flex justify-between"><span>Iuran Wajib:</span> <span className="font-medium">{formatRupiah(tagihan.iuran)}</span></div>
          <div className="flex justify-between"><span>Dedosan:</span> <span className="font-medium">{formatRupiah(tagihan.dedosan)}</span></div>
          <div className="flex justify-between"><span>Peturuhan:</span> <span className="font-medium">{formatRupiah(tagihan.peturuhan)}</span></div>
        </div>
      </div>
      
      {/* Footer Card */}
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


// Komponen Halaman Utama
function MyBills() {
  const [bills, setBills] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    // 1. Panggil API "Tagihan Saya"
    axiosClient.get('/user/my-unpaid-bills') //
      .then(response => {
        setBills(response.data.data);
      })
      .catch(error => {
        // (INI YANG MENAMPILKAN ERROR ANDA)
        console.error("Error fetching my bills:", error);
        toast.error("Gagal memuat tagihan Anda.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return <div className="text-center">Memuat tagihan Anda...</div>;
  }

  return (
    <>
      <h1 className="text-3xl font-bold text-slate-900 mb-6">Tagihan Saya</h1>
      
      {bills.length === 0 ? (
        <div className="bg-white p-6 rounded-lg shadow-md text-center text-gray-600">
          Anda tidak memiliki tagihan yang belum lunas.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bills.map(tagihan => (
            <BillCard 
              key={tagihan.tagihan_id} 
              tagihan={tagihan}
              onAddToCart={addToCart}
            />
          ))}
        </div>
      )}
    </>
  );
}

export default MyBills;