// src/pages/DaftarKrama.jsx

import React, { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import { Link } from 'react-router-dom';
import EditKramaModal from '../components/EditKramaModal'; 
import ConfirmationModal from '../components/ConfirmationModal';
import { toast } from 'react-hot-toast'; 

function DaftarKrama() {
  const [kramaList, setKramaList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // State untuk modal Edit
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedKrama, setSelectedKrama] = useState(null);

  // State untuk Modal Hapus
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [kramaToDelete, setKramaToDelete] = useState(null);

  // Fungsi fetchKrama
  const fetchKrama = async () => {
    setIsLoading(true);
    try {
      // --- (PERBAIKAN) ---
      const response = await axiosClient.get('/admin/krama'); // Tambah prefix /admin
      setKramaList(response.data.data);
    } catch (err) {
      console.error("Gagal mengambil daftar krama:", err);
      // (Pesan error Anda berasal dari sini)
      toast.error("Gagal memuat data krama.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchKrama();
  }, []);

  // Logika Hapus Krama
  const handleOpenDeleteModal = (krama) => {
    setKramaToDelete(krama);
    setIsDeleteModalOpen(true);
  };
  const handleCloseDeleteModal = () => {
    setKramaToDelete(null);
    setIsDeleteModalOpen(false);
  };
  const handleConfirmDelete = async () => {
    if (!kramaToDelete) return;
    try {
      // --- (PERBAIKAN) ---
      await axiosClient.delete(`/admin/krama/${kramaToDelete.krama_id}`); // Tambah prefix /admin
      toast.success(`Krama "${kramaToDelete.name}" dan akunnya berhasil dihapus.`);
      handleCloseDeleteModal();
      fetchKrama();
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Gagal menghapus krama.";
      toast.error(errorMsg);
      handleCloseDeleteModal();
    }
  };

  // Logika Modal Edit
  const handleOpenEditModal = (krama) => {
    setSelectedKrama(krama);
    setIsEditModalOpen(true);
  };
  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedKrama(null);
  };
  const handleUpdateKrama = async (formData) => {
    if (!selectedKrama) return;
    try {
      // --- (PERBAIKAN) ---
      await axiosClient.put(`/admin/krama/${selectedKrama.krama_id}`, formData); // Tambah prefix /admin
      toast.success("Data krama dan akun berhasil diperbarui!");
      handleCloseEditModal();
      fetchKrama();
    } catch (err) {
      console.error("Gagal update krama:", err);
      if (err.response && err.response.status === 422) {
        const errors = err.response.data;
        if(errors.email) toast.error(errors.email[0]);
        else if(errors.nik) toast.error(errors.nik[0]);
        else toast.error("Data tidak valid.");
      } else {
        const errorMsg = err.response?.data?.message || "Gagal menyimpan data.";
        toast.error(errorMsg);
      }
    }
  };

  return (
    <>
      <EditKramaModal 
        isOpen={isEditModalOpen} 
        onClose={handleCloseEditModal} 
        onSave={handleUpdateKrama}
        kramaData={selectedKrama}
      />
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        title="Konfirmasi Hapus Krama"
        message={`Apakah Anda yakin ingin menghapus krama "${kramaToDelete?.name}"? Tindakan ini akan menghapus data warga DAN akun login user terkait.`}
        confirmText="Ya, Hapus Krama & Akun"
        variant="danger" 
      />

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Data Warga (Krama)</h1>
        <Link
          to="/admin/tambah-krama"
          className="px-4 py-2 font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          + Tambah Warga Baru
        </Link>
      </div>
      
      {isLoading && (<div className="text-center p-4">Memuat data krama...</div>)}

      {!isLoading && (
        <div className="bg-white shadow-md rounded-lg overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email (Akun Login)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NIK</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Banjar</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {kramaList.length > 0 ? (
                kramaList.map((krama) => {
                  
                  const isDataLengkap = krama.nik && krama.banjar;
                  
                  return (
                    <tr 
                      key={krama.krama_id} 
                      className={!isDataLengkap ? 'bg-yellow-50' : ''}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {krama.name}
                        {!isDataLengkap && (
                          <span className="ml-2 text-xs font-bold text-yellow-700">(Data Belum Lengkap)</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {krama.email || <span className="text-red-500">Tidak ada akun</span>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {krama.nik || <span className="text-red-500">NULL</span>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {krama.banjar?.nama_banjar || <span className="text-red-500">NULL</span>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {krama.status ? (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700 capitalize">
                            {krama.status?.replace('_', ' ')}
                          </span>
                        ) : (
                          <span className="text-red-500">NULL</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex flex-col space-y-2">
                          <Link 
                            to={`/admin/krama/${krama.krama_id}`}
                            className="w-full text-center px-3 py-1 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                          >
                            Riwayat
                          </Link>
                          <button 
                            onClick={() => handleOpenEditModal(krama)}
                            className={`w-full px-3 py-1 text-xs font-medium text-white rounded-md 
                              ${!isDataLengkap ? 'bg-yellow-600 hover:bg-yellow-700 animate-pulse' : 'bg-yellow-500 hover:bg-yellow-600'}`}
                          >
                            {!isDataLengkap ? 'Lengkapi Data' : 'Edit'}
                          </button>
                          <button 
                            onClick={() => handleOpenDeleteModal(krama)}
                            className="w-full px-3 py-1 text-xs font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                          >
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                    Belum ada data krama.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

export default DaftarKrama;