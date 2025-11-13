// src/frontend_user/PaymentPage.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { toast } from 'react-hot-toast';

// Helper Format Rupiah
const formatRupiah = (angka) => {
  if (!angka) return "Rp 0";
  return new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR', minimumFractionDigits: 0
  }).format(angka);
};

// Placeholder untuk QRIS
const FakeQRIS = () => (
  <svg className="w-64 h-64 mx-auto" viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="256" height="256" fill="white"/>
    <rect x="32" y="32" width="64" height="64" fill="black"/>
    <rect x="44" y="44" width="40" height="40" fill="white"/>
    <rect x="52" y="52" width="24" height="24" fill="black"/>
    <rect x="160" y="32" width="64" height="64" fill="black"/>
    <rect x="172" y="44" width="40" height="40" fill="white"/>
    <rect x="180" y="52" width="24" height="24" fill="black"/>
    <rect x="32" y="160" width="64" height="64" fill="black"/>
    <rect x="44" y="172" width="40" height="40" fill="white"/>
    <rect x="52" y="180" width="24" height="24" fill="black"/>
    <rect x="112" y="112" width="16" height="16" fill="black"/>
    <rect x="128" y="112" width="16" height="16" fill="black"/>
    <rect x="144" y="112" width="16" height="16" fill="black"/>
    <rect x="160" y="112" width="16" height="16" fill="black"/>
    <rect x="176" y="112" width="16" height="16" fill="black"/>
    <rect x="192" y="112" width="16" height="16" fill="black"/>
    <rect x="112" y="128" width="16" height="16" fill="black"/>
    <rect x="112" y="144" width="16" height="16" fill="black"/>
    <rect x="112" y="160" width="16" height="16" fill="black"/>
    <rect x="112" y="176" width="16" height="16" fill="black"/>
    <rect x="112" y="192" width="16" height="16" fill="black"/>
    <rect x="112" y="208" width="16" height="16" fill="black"/>
    <rect x="128" y="144" width="16" height="16" fill="black"/>
    <rect x="128" y="176" width="16" height="16" fill="black"/>
    <rect x="128" y="208" width="16" height="16" fill="black"/>
    <rect x="144" y="128" width="16" height="16" fill="black"/>
    <rect x="144" y="160" width="16" height="16" fill="black"/>
    <rect x="144" y="192" width="16" height="16" fill="black"/>
    <rect x="160" y="144" width="16" height="16" fill="black"/>
    <rect x="160" y="176" width="16" height="16" fill="black"/>
    <rect x="160" y="208" width="16" height="16" fill="black"/>
    <rect x="176" y="128" width="16" height="16" fill="black"/>
    <rect x="176" y="160" width="16" height="16" fill="black"/>
    <rect x="176" y="192" width="16" height="16" fill="black"/>
    <rect x="192" y="144" width="16" height="16" fill="black"/>
    <rect x="192" y="176" width="16" height="16" fill="black"/>
    <rect x="192" y="208" width="16" height="16" fill="black"/>
    <rect x="208" y="128" width="16" height="16" fill="black"/>
    <rect x="208" y="160" width="16" height="16" fill="black"/>
    <rect x="208" y="192" width="16" height="16" fill="black"/>
    <rect x="128" y="32" width="16" height="16" fill="black"/>
    <rect x="112" y="48" width="16" height="16" fill="black"/>
    <rect x="128" y="64" width="16" height="16" fill="black"/>
    <rect x="144" y="80" width="16" height="16" fill="black"/>
    <rect x="160" y="96" width="16" height="16" fill="black"/>
  </svg>
);


function PaymentPage() {
  const { transaction_id } = useParams(); // Ambil ID dari URL
  const navigate = useNavigate();
  const [transaction, setTransaction] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isPaid, setIsPaid] = useState(false);

  // Ambil data transaksi (meskipun API Checkout sudah mengembalikan)
  // Ini untuk memastikan jika user refresh halaman
  useEffect(() => {
    // Di aplikasi nyata, kita akan panggil:
    // axiosClient.get(`/user/transaction/${transaction_id}`)
    // Tapi karena kita tidak buat API itu, kita anggap
    // data dari halaman checkout sudah cukup.
    // Untuk simulasi ini, kita anggap 'isLoading' false
    // dan kita hanya akan fokus pada konfirmasi.
    
    // Namun, kita butuh total amount. Kita coba ambil dari checkout API
    // (Ini hanya workaround, idealnya ada API GET /transaction/id)
    setIsLoading(false); 
    // Kita tidak punya data 'transaction',
    // jadi kita akan fokus ke tombol konfirmasi saja.
    
  }, [transaction_id]);

  // Fungsi Konfirmasi Pembayaran
  const handleConfirmPayment = async () => {
    setIsConfirming(true);
    try {
      // 1. Panggil API Konfirmasi
      const response = await axiosClient.post('/user/confirm-payment', { //
        transaction_id: transaction_id 
      });

      // 2. Jika sukses
      toast.success(response.data.message);
      setIsPaid(true); // Tampilkan pesan sukses

      // 3. Arahkan kembali ke 'Tagihan Saya' setelah 3 detik
      setTimeout(() => {
        navigate('/user/tagihan-saya');
      }, 3000);

    } catch (error) {
      console.error("Error confirming payment:", error);
      const errorMsg = error.response?.data?.message || "Gagal konfirmasi pembayaran.";
      toast.error(errorMsg);
      setIsConfirming(false);
    }
  };

  if (isLoading) {
    return <div className="text-center">Memuat data pembayaran...</div>;
  }
  
  // Tampilan Sukses (setelah bayar)
  if (isPaid) {
    return (
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md text-center">
        <h1 className="text-2xl font-bold text-green-600 mb-4">Pembayaran Berhasil!</h1>
        <p className="text-gray-600 mb-2">
          Transaksi Anda (ID: {transaction_id}) telah berhasil dikonfirmasi.
        </p>
        <p className="text-gray-600">
          Status tagihan di Admin Panel sudah LUNAS. Anda akan diarahkan...
        </p>
      </div>
    );
  }

  // Tampilan Halaman Pembayaran
  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md text-center">
      <h1 className="text-2xl font-bold text-slate-900 mb-4">Konfirmasi Pembayaran</h1>
      <p className="text-gray-600 mb-2">
        Silakan lakukan pembayaran untuk Transaksi ID:
      </p>
      <p className="text-3xl font-bold text-blue-600 mb-6">{transaction_id}</p>
      
      {/* Di aplikasi nyata, kita akan mengambil 'total_amount'
        const response = await axiosClient.get(`/user/transaction/${transaction_id}`);
        setTransaction(response.data);
        <p>Total: {formatRupiah(transaction.total_amount)}</p>
      */}

      <p className="text-gray-600 mb-4">Metode Pembayaran: <strong>QRIS</strong></p>
      <div className="p-4 border rounded-md">
        <FakeQRIS />
      </div>
      <p className="text-sm text-gray-500 mt-4 mb-6">
        (Ini adalah simulasi. Di aplikasi nyata, gambar QRIS akan digenerate oleh Payment Gateway berdasarkan total tagihan).
      </p>

      <button
        onClick={handleConfirmPayment}
        disabled={isConfirming}
        className="w-full px-6 py-3 font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:bg-gray-400"
      >
        {isConfirming ? 'Mengkonfirmasi...' : 'Saya Sudah Bayar (Konfirmasi)'}
      </button>
    </div>
  );
}

export default PaymentPage;