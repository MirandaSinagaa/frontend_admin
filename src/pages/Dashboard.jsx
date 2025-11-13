// src/pages/Dashboard.jsx

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axiosClient from '../api/axiosClient';

// (BARU) Impor Chart.js dan komponen 'Bar'
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// (BARU) Daftarkan komponen Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Komponen kecil untuk kartu statistik (tetap sama)
function StatCard({ title, value, isLoading }) {
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
      <p className="text-3xl font-bold text-slate-800">{value}</p>
    </div>
  );
}

// Opsi konfigurasi untuk Chart
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
    },
    title: {
      display: true,
      text: 'Total Tagihan Masuk per Bulan (6 Bulan Terakhir)',
      fontSize: 16,
    },
  },
};

export default function Dashboard() {
  const { user } = useAuth();
  
  const [stats, setStats] = useState(null);
  const [isStatsLoading, setIsStatsLoading] = useState(true);

  const [chartData, setChartData] = useState(null); 
  const [isChartLoading, setIsChartLoading] = useState(true);

  const formatRupiah = (angka) => {
    if (angka === null || angka === undefined) return "Rp 0";
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(angka);
  };

  // useEffect untuk ambil data STATS (Kartu)
  useEffect(() => {
    // --- (PERBAIKAN) ---
    axiosClient.get('/admin/dashboard-stats') // Tambahkan prefix /admin
      .then(response => {
        setStats(response.data);
      })
      .catch(error => console.error("Error fetching dashboard stats:", error))
      .finally(() => {
        setIsStatsLoading(false);
      });
  }, []);

  // (BARU) useEffect untuk ambil data CHART
  useEffect(() => {
    // --- (PERBAIKAN) ---
    axiosClient.get('/admin/dashboard-chart') // Tambahkan prefix /admin
      .then(response => {
        const apiData = response.data;
        setChartData({
          labels: apiData.labels,
          datasets: [
            {
              label: 'Total Tagihan (Rp)',
              data: apiData.data,
              backgroundColor: 'rgba(54, 162, 235, 0.6)', 
              borderColor: 'rgba(54, 162, 235, 1)',
              borderWidth: 1,
            },
          ],
        });
      })
      .catch(error => console.error("Error fetching chart data:", error))
      .finally(() => {
        setIsChartLoading(false);
      });
  }, []);

  return (
    <>
      {/* --- Bagian Header --- */}
      <h1 className="text-4xl font-bold text-slate-900 mb-2">
        Halo, {user?.name} 👋
      </h1>
      <p className="text-lg text-slate-600 mb-8">
        Selamat datang di Dashboard Billing Krama.
      </p>

      {/* --- Bagian Kartu Statistik --- */}
      <h2 className="text-2xl font-semibold text-slate-800 mb-4">Ringkasan Sistem</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatCard 
          title="Total Krama Terdaftar" 
          value={isStatsLoading ? 0 : stats?.total_krama} 
          isLoading={isStatsLoading} 
        />
        <StatCard 
          title="Tagihan Bulan Ini" 
          value={isStatsLoading ? 0 : formatRupiah(stats?.tagihan_bulan_ini)} 
          isLoading={isStatsLoading} 
        />
        <StatCard 
          title="Lunas Bulan Ini (Transaksi)" 
          value={isStatsLoading ? 0 : stats?.lunas_bulan_ini} 
          isLoading={isStatsLoading} 
        />
        <StatCard 
          title="Total Belum Lunas" 
          value={isStatsLoading ? 0 : stats?.belum_lunas_total} 
          isLoading={isStatsLoading} 
        />
      </div>

      {/* --- (BARU) Bagian Chart --- */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-10">
        {isChartLoading ? (
          <div className="text-center p-10">Memuat data grafik...</div>
        ) : (
          <div style={{ height: '300px' }}> 
            {chartData && (
              <Bar options={chartOptions} data={chartData} />
            )}
          </div>
        )}
      </div>

      {/* --- Bagian Link Navigasi --- */}
      <h2 className="text-2xl font-semibold text-slate-800 mb-4">Aksi Cepat</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* CARD 1: Tambah Warga */}
        <Link
          to="/admin/tambah-krama"
          className="group block p-6 bg-white rounded-2xl border border-gray-100 shadow-md 
                     hover:shadow-xl hover:border-indigo-500 transition-all duration-300"
        >
          <h2 className="text-2xl font-semibold text-indigo-600 group-hover:text-indigo-700">
            Tambah Warga Baru
          </h2>
          <p className="mt-2 text-slate-600">
            Daftarkan krama (warga) baru ke dalam sistem.
          </p>
        </Link>
        {/* CARD 2: Buat Tagihan */}
        <Link
          to="/admin/create-tagihan"
          className="group block p-6 bg-white rounded-2xl border border-gray-100 shadow-md 
                     hover:shadow-xl hover:border-blue-500 transition-all duration-300"
        >
          <h2 className="text-2xl font-semibold text-blue-600 group-hover:text-blue-700">
            Buat Tagihan Baru
          </h2>
          <p className="mt-2 text-slate-600">
            Mulai buat tagihan baru untuk krama dengan mudah.
          </p>
        </Link>
        {/* CARD 3: Lihat Laporan */}
        <Link
          to="/admin/laporan"
          className="group block p-6 bg-white rounded-2xl border border-gray-100 shadow-md 
                     hover:shadow-xl hover:border-green-500 transition-all duration-300"
        >
          <h2 className="text-2xl font-semibold text-green-600 group-hover:text-green-700">
            Lihat Laporan
          </h2>
          <p className="mt-2 text-slate-600">
            Periksa seluruh data tagihan yang sudah tercatat.
          </p>
        </Link>
      </div>
    </>
  );
}