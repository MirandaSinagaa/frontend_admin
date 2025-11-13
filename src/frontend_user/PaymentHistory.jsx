// src/frontend_user/PaymentHistory.jsx

import React, { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import { toast } from 'react-hot-toast';

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

function PaymentHistory() {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);

  const fetchHistory = (page) => {
    setIsLoading(true);
    axiosClient.get('/user/my-transactions', { params: { page } })
      .then(response => {
        setTransactions(response.data.data);
        setPagination(response.data.meta);
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
        <div className="text-center">Memuat riwayat...</div>
      ) : null}

      {!isLoading && transactions.length === 0 ? (
        <div className="bg-white p-6 rounded-lg shadow-md text-center text-gray-600">
          Anda belum memiliki riwayat transaksi (checkout).
        </div>
      ) : (
        <div className="space-y-6">
          {transactions.map(trx => (
            <div key={trx.transaction_id} className="bg-white shadow-md rounded-lg overflow-hidden">
              {/* Header Transaksi */}
              <div className="bg-gray-50 p-4 flex flex-col md:flex-row justify-between md:items-center border-b">
                <div>
                  <p className="text-sm text-gray-500">ID Transaksi</p>
                  <p className="font-semibold text-gray-900">#{trx.transaction_id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Tanggal</p>
                  <p className="font-semibold text-gray-900">{formatDate(trx.created_at)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Pembayaran</p>
                  <p className="font-bold text-2xl text-blue-600">{formatRupiah(trx.total_amount)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize
                    ${trx.status === 'paid' ? 'bg-green-100 text-green-800' : ''}
                    ${trx.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                    ${trx.status === 'failed' ? 'bg-red-100 text-red-800' : ''}
                  `}>
                    {trx.status}
                  </span>
                </div>
              </div>
              
              {/* Rincian Transaksi */}
              <div className="p-4">
                <h4 className="font-semibold mb-2">Rincian Tagihan:</h4>
                <table className="min-w-full">
                  <thead className="text-sm text-gray-500 text-left">
                    <tr>
                      <th className="py-1">Nama Krama</th>
                      <th className="py-1">Tanggal Tagihan</th>
                      <th className="py-1 text-right">Jumlah</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trx.details.map(detail => (
                      <tr key={detail.transaction_detail_id} className="text-sm border-t">
                        <td className="py-2">{detail.tagihan?.krama?.name || 'N/A'}</td>
                        <td className="py-2">{detail.tagihan?.tanggal || 'N/A'}</td>
                        <td className="py-2 text-right font-medium">{formatRupiah(detail.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}

          {/* (TODO: Tambahkan Paginasi jika pagination.last_page > 1) */}
        </div>
      )}
    </>
  );
}

export default PaymentHistory;