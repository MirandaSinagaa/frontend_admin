import React, { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import { Link } from 'react-router-dom';
import EditKramaModal from '../components/EditKramaModal'; 
import ConfirmationModal from '../components/ConfirmationModal';
import { toast } from 'react-hot-toast'; // <-- (BARU) Impor toast

function DaftarKrama() {
  const [kramaList, setKramaList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // (DIHAPUS) State 'error' dan 'successMessage' sudah tidak perlu
  // const [error, setError] = useState(null);
  // const [successMessage, setSuccessMessage] = useState(null);

  // State untuk modal Edit
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedKrama, setSelectedKrama] = useState(null);

  // State untuk Modal Hapus
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [kramaToDelete, setKramaToDelete] = useState(null);

  // Fungsi fetchKrama
  const fetchKrama = async () => {
    setIsLoading(true);
    // (DIHAPUS) Tidak perlu reset error/sukses
    try {
      const response = await axiosClient.get('/krama');
      setKramaList(response.data.data);
    } catch (err) {
      console.error("Gagal mengambil daftar krama:", err);
      // (DIUBAH) Tampilkan toast error
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
      await axiosClient.delete(`/krama/${kramaToDelete.krama_id}`);
      // (DIUBAH) Tampilkan toast sukses
      toast.success(`Krama "${kramaToDelete.name}" berhasil dihapus.`);
      handleCloseDeleteModal();
      fetchKrama();
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Gagal menghapus krama.";
      // (DIUBAH) Tampilkan toast error
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
      await axiosClient.put(`/krama/${selectedKrama.krama_id}`, formData);
      // (DIUBAH) Tampilkan toast sukses
      toast.success("Data krama berhasil diperbarui!");
      handleCloseEditModal();
      fetchKrama();
    } catch (err) {
      console.error("Gagal update krama:", err);
      const errorMsg = err.response?.data?.message || "Gagal menyimpan data.";
      // (DIUBAH) Tampilkan toast error
      toast.error(errorMsg);
      // Kita tidak menutup modal agar user bisa perbaiki
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
        message={`Apakah Anda yakin ingin menghapus krama atas nama "${kramaToDelete?.name}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Ya, Hapus"
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

      {/* (DIHAPUS) Div 'error' dan 'successMessage' dihapus dari sini */}
      
      {isLoading && (<div className="text-center p-4">Memuat data krama...</div>)}

      {!isLoading && (
        <div className="bg-white shadow-md rounded-lg overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NIK</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Banjar</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {kramaList.length > 0 ? (
                kramaList.map((krama) => (
                  <tr key={krama.krama_id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {krama.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{krama.nik}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{krama.banjar?.nama_banjar || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700 capitalize">
                        {krama.status?.replace('_', ' ')}
                      </span>
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
                          className="w-full px-3 py-1 text-xs font-medium text-white bg-yellow-500 rounded-md hover:bg-yellow-600"
                        >
                          Edit
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
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
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