// src/frontend_user/MyBills.jsx

import React, { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import { useCart } from '../context/CartContext';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

function BillCard({ tagihan, onAddToCart }) {
  const navigate = useNavigate(); // Hook navigasi

  const formatRupiah = (angka) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency', currency: 'IDR', minimumFractionDigits: 0
    }).format(angka);
  };

  // Logika Tombol
  const renderButton = () => {
    // Jika tagihan nyangkut di transaksi pending
    if (tagihan.pending_transaction_id) {
      return (
        <button
          onClick={() => navigate(`/user/payment/${tagihan.pending_transaction_id}`)}
          className="px-4 py-2 font-medium text-white bg-orange-500 rounded-md hover:bg-orange-600 transition flex items-center"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          Lanjut Bayar
        </button>
      );
    }

    // Tombol normal tambah ke keranjang
    return (
      <button
        onClick={() => onAddToCart(tagihan)}
        className="px-4 py-2 font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition"
      >
        + Tambah ke Keranjang
      </button>
    );
  };

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden flex flex-col border border-gray-100">
      <div className="p-5 flex-grow">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-500">{tagihan.tanggal}</span>
          {/* Badge Status */}
          {tagihan.pending_transaction_id ? (
             <span className="px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">
               Menunggu Pembayaran
             </span>
          ) : (
             <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
               Belum Lunas
             </span>
          )}
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
        {renderButton()}
      </div>
    </div>
  );
}

function MyBills() {
  const [bills, setBills] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    axiosClient.get('/user/my-unpaid-bills')
      .then(response => {
        setBills(response.data.data);
      })
      .catch(error => {
        console.error("Error fetching my bills:", error);
        toast.error("Gagal memuat tagihan Anda.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return <div className="text-center p-10">Memuat tagihan Anda...</div>;
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