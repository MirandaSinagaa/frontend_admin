// src/frontend_user/PaymentHistory.jsx

import React, { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext'; // Ambil data user login

// Helper Format
const formatRupiah = (angka) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR', minimumFractionDigits: 0
  }).format(angka);
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString('id-ID', {
    dateStyle: 'medium', timeStyle: 'short'
  });
};

// Helper Format Tanggal Tagihan (Hanya Tanggal)
const formatBillDate = (dateString) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric'
  });
};

function PaymentHistory() {
  const { user } = useAuth(); // Ambil data user yang sedang login
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);

  const fetchHistory = (page) => {
    setIsLoading(true);
    axiosClient.get('/user/my-transactions', { params: { page } })
      .then(response => {
        setTransactions(response.data.data);
      })
      .catch(error => {
        console.error("Error fetching payment history:", error);
        toast.error("Gagal memuat riwayat pembayaran.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchHistory(page);
  }, [page]);

  return (
    <>
      <h1 className="text-3xl font-bold text-slate-900 mb-6">Riwayat Pembayaran</h1>

      {isLoading && transactions.length === 0 ? (
        <div className="text-center p-10">Memuat riwayat...</div>
      ) : null}

      {!isLoading && transactions.length === 0 ? (
        <div className="bg-white p-6 rounded-lg shadow-md text-center text-gray-600">
          Anda belum memiliki riwayat transaksi (checkout).
        </div>
      ) : (
        <div className="space-y-8">
          {transactions.map(trx => (
            <div key={trx.transaction_id} className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
              
              {/* --- Header Transaksi (Nota Induk) --- */}
              <div className="bg-slate-50 p-4 border-b border-gray-200">
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">ID Transaksi</p>
                    <p className="font-bold text-slate-700">#{trx.transaction_id}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Waktu Pembayaran</p>
                    <p className="font-medium text-slate-700">{formatDate(trx.created_at)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Metode</p>
                    <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
                      {trx.payment_method || 'QRIS'}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Total Bayar</p>
                    <p className="font-bold text-xl text-green-600">{formatRupiah(trx.total_amount)}</p>
                  </div>
                </div>
              </div>
              
              {/* --- Rincian Item (Siapa yang dibayarkan?) --- */}
              <div className="p-0">
                <table className="min-w-full divide-y divide-gray-100">
                  <thead className="bg-white">
                    <tr>
                      <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal Tagihan</th>
                      <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pemilik Tagihan (Warga)</th>
                      <th className="px-5 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {trx.details.map(detail => {
                      // Logika Cek Pemilik
                      const kramaName = detail.tagihan?.krama?.name || 'N/A';
                      const kramaNik = detail.tagihan?.krama?.nik || '-';
                      // Cek kasar apakah ini akun sendiri (berdasarkan nama user login)
                      const isMe = user && kramaName.toLowerCase() === user.name.toLowerCase();

                      return (
                        <tr key={detail.transaction_detail_id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-600">
                             Tagihan {formatBillDate(detail.tagihan?.tanggal)}
                          </td>
                          <td className="px-5 py-4 whitespace-nowrap">
                            <div className="flex flex-col">
                              <span className={`font-semibold text-sm ${isMe ? 'text-blue-600' : 'text-gray-900'}`}>
                                {kramaName} {isMe && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full ml-2">Saya</span>}
                              </span>
                              <span className="text-xs text-gray-400">NIK: {kramaNik}</span>
                              <span className="text-xs text-gray-400">{detail.tagihan?.krama?.banjar?.nama_banjar}</span>
                            </div>
                          </td>
                          <td className="px-5 py-4 whitespace-nowrap text-right text-sm font-medium text-slate-700">
                            {formatRupiah(detail.amount)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Footer Card (Status) */}
              <div className="bg-gray-50 px-5 py-3 border-t border-gray-200 flex justify-end">
                 <div className="flex items-center">
                    <span className="mr-2 text-sm text-gray-500">Status Pembayaran:</span>
                    <span className={`px-3 py-1 text-sm font-bold rounded-full capitalize
                      ${trx.status === 'paid' ? 'bg-green-100 text-green-800 border border-green-200' : ''}
                      ${trx.status === 'pending' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' : ''}
                      ${trx.status === 'failed' ? 'bg-red-100 text-red-800 border border-red-200' : ''}
                    `}>
                      {trx.status === 'paid' ? 'Berhasil (Lunas)' : trx.status}
                    </span>
                 </div>
              </div>

            </div>
          ))}
        </div>
      )}
    </>
  );
}

export default PaymentHistory;