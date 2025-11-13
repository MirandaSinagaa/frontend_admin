// src/frontend_user/UserDashboard.jsx

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosClient from '../api/axiosClient';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';

// --- (PERUBAHAN) ---
// Komponen Kartu Statistik (disederhanakan)
// Logika formatRupiah dihapus dari sini
function StatCard({ title, value, isLoading }) {
  
  // (DIUBAH) 'displayValue' sekarang hanya 'value'
  // Komponen ini tidak lagi memformat angka.
  let displayValue = value;
  
  if (isLoading) {
    return (
      <div className="p-4 bg-white rounded-lg shadow-md animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-8 bg-gray-300 rounded w-1/2"></div>
      </div>
    );
  }
  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <span className="text-sm font-medium text-gray-500">{title}</span>
      <p className="text-3xl font-bold text-slate-800">{displayValue}</p>
    </div>
  );
}
// --- (AKHIR PERUBAHAN) ---


// Komponen Kartu Aksi Cepat (Tetap Sama)
function ActionCard({ to, title, description, colorClass }) {
  return (
    <Link
      to={to}
      className={`group block p-6 bg-white rounded-2xl border border-gray-100 shadow-md 
                 hover:shadow-xl ${colorClass} transition-all duration-300`}
    >
      <h2 className={`text-2xl font-semibold`}>
        {title}
      </h2>
      <p className="mt-2 text-slate-600">
        {description}
      </p>
    </Link>
  );
}


function UserDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // useEffect (Tetap Sama)
  useEffect(() => {
    axiosClient.get('/user/dashboard-stats') 
      .then(response => {
        setStats(response.data);
      })
      .catch(error => {
        console.error("Error fetching user dashboard stats:", error);
        toast.error(error.response?.data?.message || "Gagal memuat statistik.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);
  
  // (PERUBAHAN) Logika formatRupiah tetap di sini (di induk)
  const formatRupiah = (angka) => {
    if (!angka) return "Rp 0";
    return new Intl.NumberFormat('id-ID', {
      style: 'currency', currency: 'IDR', minimumFractionDigits: 0
    }).format(angka);
  };

  return (
    <>
      <h1 className="text-4xl font-bold text-slate-900 mb-2">
        Halo, {user?.name}!
      </h1>
      <p className="text-lg text-slate-600 mb-8">
        Selamat datang di Dashboard Krama Anda.
      </p>

      {/* Bagian Kartu Statistik */}
      <h2 className="text-2xl font-semibold text-slate-800 mb-4">Ringkasan Keuangan Anda</h2>
      
      {/* --- (PERUBAHAN) ---
          Logika pemanggilan StatCard sudah benar,
          karena 'formatRupiah()' hanya dipanggil untuk nominal uang.
          'stats?.jumlah_tagihan_belum_lunas' (angka) akan ditampilkan sebagai angka.
      --- (AKHIR PERUBAHAN) --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatCard 
          title="Total Tagihan Belum Lunas" 
          value={isLoading ? "Rp 0" : formatRupiah(stats?.total_tagihan_belum_lunas)} 
          isLoading={isLoading} 
        />
        <StatCard 
          title="Jumlah Tagihan (Belum Lunas)" 
          value={isLoading ? 0 : stats?.jumlah_tagihan_belum_lunas} 
          isLoading={isLoading} 
        />
        <StatCard 
          title="Total Riwayat Pembayaran" 
          value={isLoading ? "Rp 0" : formatRupiah(stats?.total_pembayaran_lunas)} 
          isLoading={isLoading} 
        />
        <StatCard 
          title="Total Transaksi Sukses" 
          value={isLoading ? 0 : stats?.jumlah_transaksi_sukses} 
          isLoading={isLoading} 
        />
      </div>

      {/* Bagian Aksi Cepat (Tetap Sama) */}
      <h2 className="text-2xl font-semibold text-slate-800 mb-4">Aksi Cepat</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ActionCard
          to="/user/tagihan-saya"
          title="Bayar Tagihan Saya"
          description="Lihat dan bayar semua tagihan Anda yang belum lunas."
          colorClass="hover:border-blue-500 text-blue-600"
        />
        <ActionCard
          to="/user/bayar-warga-lain"
          title="Bayar Tagihan Warga Lain"
          description="Bantu bayar tagihan warga lain dengan mencari NIK."
          colorClass="hover:border-green-500 text-green-600"
        />
        <ActionCard
          to="/user/payment-history"
          title="Riwayat Pembayaran"
          description="Lihat semua riwayat transaksi checkout Anda."
          colorClass="hover:border-purple-500 text-purple-600"
        />
        <ActionCard
          to="/user/edit-profile"
          title="Profil Saya"
          description="Perbarui data diri, NIK, Banjar, dan akun Anda."
          colorClass="hover:border-yellow-500 text-yellow-600"
        />
      </div>
    </>
  );
}

export default UserDashboard;