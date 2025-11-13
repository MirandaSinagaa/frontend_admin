// src/frontend_user/Checkout.jsx

import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate, Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { toast } from 'react-hot-toast';

function Checkout() {
  const { cart, removeFromCart, getCartTotal, clearCart, itemCount } = useCart();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const formatRupiah = (angka) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency', currency: 'IDR', minimumFractionDigits: 0
    }).format(angka);
  };

  const handleCheckout = async () => {
    setIsLoading(true);
    
    // 1. Ambil semua tagihan_id dari keranjang
    const tagihanIds = cart.map(item => item.tagihan_id);

    try {
      // 2. Panggil API Checkout
      const response = await axiosClient.post('/user/checkout', { //
        tagihan_ids: tagihanIds,
        payment_method: 'QRIS' // Sesuai whiteboard
      });

      // 3. Jika sukses, API mengembalikan data Transaksi
      const transaction = response.data;
      toast.success("Faktur berhasil dibuat. Mengarahkan ke pembayaran...");
      
      // 4. Kosongkan keranjang
      clearCart();

      // 5. Arahkan ke Halaman Pembayaran (yang akan kita buat)
      navigate(`/user/payment/${transaction.transaction_id}`);

    } catch (error) {
      console.error("Error during checkout:", error);
      const errorMsg = error.response?.data?.message || "Gagal membuat checkout.";
      toast.error(errorMsg);
      setIsLoading(false);
    }
    // 'isLoading' tidak di-set false jika sukses, karena kita navigasi
  };

  return (
    <>
      <h1 className="text-3xl font-bold text-slate-900 mb-6">Keranjang Pembayaran</h1>

      {itemCount === 0 ? (
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <p className="text-gray-600 mb-4">Keranjang Anda kosong.</p>
          <Link to="/user/tagihan-saya" className="px-4 py-2 font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
            Lihat Tagihan Saya
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Kolom 1: Daftar Item (Keranjang) */}
          <div className="md:col-span-2 bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Rincian Tagihan</h2>
            <div className="space-y-4">
              {cart.map(item => (
                <div key={item.tagihan_id} className="flex items-start justify-between p-4 border rounded-md">
                  <div>
                    <p className="font-semibold text-gray-900">{item.krama.name}</p>
                    <p className="text-sm text-gray-500">Tagihan Tanggal: {item.tanggal}</p>
                    <p className="text-lg font-bold text-blue-600">
                      {formatRupiah(item.total_tagihan)}
                    </p>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.tagihan_id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Hapus
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Kolom 2: Ringkasan & Tombol Checkout */}
          <div className="md:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow-md sticky top-8">
              <h2 className="text-xl font-semibold mb-4 border-b pb-2">Ringkasan</h2>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Jumlah Tagihan:</span>
                  <span className="font-medium">{itemCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Biaya Admin:</span>
                  <span className="font-medium">{formatRupiah(0)}</span>
                </div>
                <hr className="my-2"/>
                <div className="flex justify-between text-xl font-bold">
                  <span>Total Pembayaran:</span>
                  <span className="text-blue-600">{formatRupiah(getCartTotal())}</span>
                </div>
              </div>
              <button
                onClick={handleCheckout}
                disabled={isLoading}
                className="w-full px-6 py-3 font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:bg-gray-400"
              >
                {isLoading ? 'Memproses...' : 'Lanjut ke Pembayaran'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Checkout;