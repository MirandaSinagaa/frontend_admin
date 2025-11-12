import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom'; // useParams untuk ambil ID dari URL
import axiosClient from '../api/axiosClient';

function DetailKrama() {
  const { krama_id } = useParams(); // Ambil krama_id dari URL

  const [krama, setKrama] = useState(null);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fungsi formatRupiah (copy dari Laporan.jsx)
  const formatRupiah = (angka) => {
    if (!angka) return "Rp 0";
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(angka);
  };

  useEffect(() => {
    const fetchKramaHistory = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Panggil API baru yang kita buat di KramaController
        const response = await axiosClient.get(`/krama/${krama_id}/history`);
        setKrama(response.data.krama);
        setHistory(response.data.history);
      } catch (err) {
        console.error("Gagal mengambil riwayat krama:", err);
        setError("Gagal memuat data. Krama mungkin tidak ditemukan.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchKramaHistory();
  }, [krama_id]); // Jalankan ulang jika krama_id berubah

  if (isLoading) {
    return <div className="text-center p-10">Memuat data riwayat krama...</div>;
  }

  if (error) {
    return <div className="text-red-600 p-4 bg-red-100 rounded-md">{error}</div>;
  }

  return (
    <>
      <div className="mb-4">
        <Link to="/admin/daftar-krama" className="text-blue-600 hover:underline">
          &larr; Kembali ke Daftar Krama
        </Link>
      </div>

      {/* --- Bagian 1: Info Detail Krama --- */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">{krama?.name}</h1>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2 text-sm">
          <span className="text-gray-500">NIK</span>
          <span className="text-gray-900 font-medium">{krama?.nik}</span>
          <span className="text-gray-500">Jenis Kelamin</span>
          <span className="text-gray-900 font-medium capitalize">{krama?.gender}</span>
          <span className="text-gray-500">Banjar</span>
          <span className="text-gray-900 font-medium">{krama?.banjar?.nama_banjar}</span>
          <span className="text-gray-500">Status Krama</span>
          <span className="text-gray-900 font-medium capitalize">{krama?.status?.replace('_', ' ')}</span>
          <span className="text-gray-500">Iuran Wajib</span>
          <span className="text-blue-600 font-bold">{formatRupiah(krama?.iuran_base)}</span>
        </div>
      </div>

      {/* --- Bagian 2: Riwayat Tagihan --- */}
      <h2 className="text-2xl font-semibold text-slate-800 mb-4">Riwayat Tagihan</h2>
      <div className="bg-white shadow-md rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Iuran</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dedosan</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Peturuhan</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {history.length > 0 ? (
              history.map((tagihan) => (
                <tr key={tagihan.tagihan_id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{tagihan.tanggal}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatRupiah(tagihan.iuran)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatRupiah(tagihan.dedosan)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatRupiah(tagihan.peturuhan)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{formatRupiah(tagihan.total_tagihan)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {tagihan.status_pembayaran === 'belum_bayar' ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                        Belum Bayar
                      </span>
                    ) : (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Lunas
                      </span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                  Tidak ada riwayat tagihan untuk warga ini.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default DetailKrama;