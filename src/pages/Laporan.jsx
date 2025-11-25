// src/pages/Laporan.jsx

import React, { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import ConfirmationModal from '../components/ConfirmationModal';
import { toast } from 'react-hot-toast';

// Opsi Filter (Tetap Sama)
const currentYear = new Date().getFullYear();
const currentMonth = new Date().getMonth() + 1;
const years = [currentYear, currentYear - 1, currentYear - 2];
const months = [
  { value: 1, name: 'Januari' }, { value: 2, name: 'Februari' },
  { value: 3, name: 'Maret' }, { value: 4, name: 'April' },
  { value: 5, name: 'Mei' }, { value: 6, name: 'Juni' },
  { value: 7, name: 'Juli' }, { value: 8, name: 'Agustus' },
  { value: 9, name: 'September' }, { value: 10, name: 'Oktober' },
  { value: 11, name: 'November' }, { value: 12, name: 'Desember' },
];

// Helper Paginasi (Tetap Sama)
const generatePageNumbers = (currentPage, lastPage, delta = 1) => {
  const range = [];
  for (let i = Math.max(2, currentPage - delta); i <= Math.min(lastPage - 1, currentPage + delta); i++) {
    range.push(i);
  }
  if (currentPage - delta > 2) {
    range.unshift('...');
  }
  if (currentPage + delta < lastPage - 1) {
    range.push('...');
  }
  range.unshift(1);
  if (lastPage > 1) {
    range.push(lastPage);
  }
  const uniqueRange = [...new Set(range)];
  if (uniqueRange[1] === '...' && uniqueRange[2] === 2) {
    uniqueRange.splice(1, 1);
  }
  if (uniqueRange[uniqueRange.length - 2] === '...' && uniqueRange[uniqueRange.length - 3] === lastPage - 1) {
    uniqueRange.splice(uniqueRange.length - 2, 1);
  }
  return uniqueRange;
};


function Laporan() {
  const [tagihanList, setTagihanList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  // State khusus untuk loading tombol export
  const [isExporting, setIsExporting] = useState(false); 

  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTagihanId, setSelectedTagihanId] = useState(null);
  const [selectedKramaName, setSelectedKramaName] = useState("");
  const [paginationMeta, setPaginationMeta] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Fungsi formatRupiah (Tetap Sama)
  const formatRupiah = (angka) => {
    if (!angka) return "Rp 0";
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(angka);
  };

  // Fungsi fetchLaporan (Tetap Sama)
  const fetchLaporan = async (bulan, tahun, page) => {
    setIsLoading(true);
    try {
      const response = await axiosClient.get('/admin/tagihan', { 
        params: { 
          bulan: bulan, 
          tahun: tahun,
          page: page 
        }
      });
      setTagihanList(response.data.data);
      setPaginationMeta(response.data.meta); 
      setCurrentPage(response.data.meta.current_page); 
    } catch (err) {
      console.error("Gagal mengambil laporan:", err);
      toast.error("Gagal memuat data laporan.");
      setTagihanList([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLaporan(selectedMonth, selectedYear, 1);
  }, []);

  // Handle (Tetap Sama)
  const handleFilterSubmit = () => {
    setCurrentPage(1); 
    fetchLaporan(selectedMonth, selectedYear, 1);
  };
  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= paginationMeta.last_page) {
      fetchLaporan(selectedMonth, selectedYear, newPage);
    }
  };
  const handleOpenValidationModal = (tagihan) => {
    setSelectedTagihanId(tagihan.tagihan_id);
    setSelectedKramaName(tagihan.krama?.name || "Warga Ini");
    setIsModalOpen(true);
  };
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTagihanId(null);
    setSelectedKramaName("");
  };
  const handleConfirmValidasi = async () => {
    const tagihanId = selectedTagihanId;
    if (!tagihanId) return;
    handleCloseModal();
    setIsLoading(true);
    try {
      await axiosClient.post('/admin/pembayaran', { 
        tagihan_id: tagihanId
      });
      toast.success("Tagihan berhasil divalidasi Lunas!");
      fetchLaporan(selectedMonth, selectedYear, currentPage);
    } catch (error) {
      console.error("Error validasi pembayaran:", error);
      const errorMsg = error.response?.data?.message || "Validasi gagal. Mungkin tagihan ini sudah dibayar?";
      toast.error(errorMsg);
      setIsLoading(false);
    }
  };

  // --- (BARU) FUNGSI EXPORT KE GOOGLE SHEET ---
  const handleExportToSheet = async () => {
    if(!confirm("Apakah Anda yakin ingin mengekspor 10 data terbaru ke Google Sheet?")) return;
    
    setIsExporting(true);
    try {
        // Panggil API Backend yang sudah kita buat
        const response = await axiosClient.get('/admin/export-to-sheet');
        
        toast.success(response.data.message);
        
        // Buka link spreadsheet di tab baru agar admin bisa langsung lihat
        if(response.data.spreadsheet_url) {
            window.open(response.data.spreadsheet_url, '_blank');
        }
    } catch (error) {
        console.error("Export failed:", error);
        toast.error("Gagal mengekspor ke Google Sheet. Periksa konfigurasi server.");
    } finally {
        setIsExporting(false);
    }
  };
  
  // Fungsi PDF (Tetap Sama)
  const handleDownloadSummaryPdf = () => {
    const doc = new jsPDF();
    doc.text(`Laporan Tagihan - ${months.find(m => m.value == selectedMonth).name} ${selectedYear}`, 14, 15);
    const tableColumns = [
      { header: 'Nama Krama', dataKey: 'nama' },
      { header: 'Banjar', dataKey: 'banjar' }, { header: 'Tanggal', dataKey: 'tanggal' },
      { header: 'Status', dataKey: 'status' }, { header: 'Total', dataKey: 'total' },
    ];
    const tableRows = tagihanList.map(tagihan => ({
      nama: tagihan.krama?.name || 'N/A',
      banjar: tagihan.krama?.banjar?.nama_banjar || 'N/A',
      tanggal: tagihan.tanggal,
      status: tagihan.status_pembayaran === 'belum_bayar' ? 'Belum Bayar' : 'Lunas',
      total: formatRupiah(tagihan.total_tagihan),
    }));
    autoTable(doc, {
      columns: tableColumns, body: tableRows, startY: 25,
      styles: { fontSize: 8 }, headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    });
    doc.save(`laporan_ringkasan_${selectedMonth}_${selectedYear}.pdf`);
  };
  const handleDownloadIndividualPdf = (tagihan) => {
    const doc = new jsPDF();
    const isLunas = tagihan.status_pembayaran !== 'belum_bayar';
    const statusText = isLunas ? "LUNAS" : "BELUM LUNAS";
    const statusColor = isLunas ? [0, 150, 0] : [255, 0, 0];
    doc.setFontSize(50);
    doc.saveGraphicsState();
    doc.setGState(new doc.GState({ opacity: 0.1 }));
    doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
    doc.text(statusText, doc.internal.pageSize.getWidth() / 2, doc.internal.pageSize.getHeight() / 2, { angle: -45, align: 'center' });
    doc.restoreGraphicsState();
    doc.setFontSize(18);
    doc.text("Bukti Tagihan Krama", 14, 22);
    doc.setFontSize(11);
    doc.text("Data Warga", 14, 35);
    doc.setFontSize(10);
    doc.text(`Nama    : ${tagihan.krama?.name || 'N/A'}`, 14, 42);
    doc.text(`NIK     : ${tagihan.krama?.nik || 'N/A'}`, 14, 48);
    doc.text(`Banjar  : ${tagihan.krama?.banjar?.nama_banjar || 'N/A'}`, 14, 54);
    doc.text(`Status  : ${tagihan.krama?.status?.replace('_', ' ') || 'N/A'}`, 14, 60);
    doc.setFontSize(11);
    doc.text("Rincian Tagihan", 14, 75);
    doc.setFontSize(10);
    doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
    doc.setFont(undefined, 'bold');
    doc.text(`Status  : ${statusText}`, 14, 82);
    doc.setTextColor(0, 0, 0);
    doc.setFont(undefined, 'normal');
    doc.text(`Tanggal : ${tagihan.tanggal}`, 14, 88);
    
    let startY = 95; // Y-Position awal untuk tabel
    
    if (isLunas && tagihan.dibayar_oleh) {
         let label = 'Dibayar oleh';
         if (tagihan.dibayar_oleh.role === 'admin') {
            label = 'Validasi Admin';
         }
         doc.text(`${label}: ${tagihan.dibayar_oleh.name}`, 14, 94);
         startY = 101; 
    }

    autoTable(doc, {
      startY: startY, theme: 'grid',
      head: [['Komponen Tagihan', 'Jumlah']],
      body: [
        ['Iuran Wajib', formatRupiah(tagihan.iuran)],
        ['Dedosan', formatRupiah(tagihan.dedosan)],
        ['Peturuhan', formatRupiah(tagihan.peturuhan)],
      ],
      foot: [['TOTAL TAGIHAN', formatRupiah(tagihan.total_tagihan)]],
      footStyles: { fillColor: [220, 220, 220], textColor: 20, fontStyle: 'bold' },
      headStyles: { fillColor: [240, 240, 240], textColor: 20 },
    });
    doc.setFontSize(9);
    doc.text("Dicetak oleh Sistem Billing Krama", 14, (doc.lastAutoTable.finalY || 95) + 10);
    const filename = `tagihan_${tagihan.krama?.name.replace(/ /g, '_')}_${tagihan.tanggal}.pdf`;
    doc.save(filename);
  };

  // --- TAMPILAN (UI) ---
  return (
    <>
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirmValidasi}
        title="Konfirmasi Pembayaran"
        message={`Apakah Anda yakin ingin memvalidasi tagihan untuk ${selectedKramaName} sebagai "Lunas"? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Ya, Konfirmasi Lunas"
        variant="primary" 
      />

      {/* Header dan Tombol Aksi */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <h1 className="text-3xl font-bold">Laporan Tagihan</h1>
        
        <div className="flex gap-2">
            {/* (BARU) Tombol Export Google Sheet */}
            <button
              onClick={handleExportToSheet}
              disabled={isExporting}
              className={`px-4 py-2 font-medium text-white rounded-md transition flex items-center
                ${isExporting ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}
              `}
            >
              {isExporting ? (
                  'Mengekspor...'
              ) : (
                  <>
                    {/* Ikon Spreadsheet Sederhana */}
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                    Export ke Sheet
                  </>
              )}
            </button>

            {/* Tombol PDF */}
            <button
              onClick={handleDownloadSummaryPdf}
              disabled={isLoading || tagihanList.length === 0}
              className={`px-4 py-2 font-medium text-white rounded-md transition flex items-center
                ${(isLoading || tagihanList.length === 0) ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}
              `}
            >
              Download PDF
            </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        {/* ... (Filter Bulan/Tahun Tetap Sama) ... */}
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[150px]">
            <label htmlFor="filter-bulan" className="block text-sm font-medium text-gray-700">Bulan</label>
            <select id="filter-bulan" value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              {months.map(month => <option key={month.value} value={month.value}>{month.name}</option>)}
            </select>
          </div>
          <div className="flex-1 min-w-[150px]">
            <label htmlFor="filter-tahun" className="block text-sm font-medium text-gray-700">Tahun</label>
            <select id="filter-tahun" value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              {years.map(year => <option key={year} value={year}>{year}</option>)}
            </select>
          </div>
          <button onClick={handleFilterSubmit} disabled={isLoading}
            className={`px-6 py-2 font-medium text-white rounded-md transition
              ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}
            `}
          >
            {isLoading ? 'Memuat...' : 'Terapkan Filter'}
          </button>
        </div>
      </div>

      {isLoading && (<div className="text-center p-4">Memuat data laporan...</div>)}

      {!isLoading && (
        <>
          <div className="bg-white shadow-md rounded-lg overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Krama</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Banjar</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Iuran</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dedosan</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Peturuhan</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {/* Isi tabel */}
                {tagihanList.length > 0 ? (
                  tagihanList.map((tagihan) => (
                    <tr key={tagihan.tagihan_id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{tagihan.krama?.name || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{tagihan.krama?.banjar?.nama_banjar || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{tagihan.tanggal}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatRupiah(tagihan.iuran)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatRupiah(tagihan.dedosan)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatRupiah(tagihan.peturuhan)}</td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {tagihan.status_pembayaran === 'belum_bayar' ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                            Belum Bayar
                          </span>
                        ) : (
                          <div>
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              Lunas
                            </span>
                            {tagihan.dibayar_oleh && (
                              tagihan.dibayar_oleh.role === 'admin' ? (
                                <span className="block text-xs text-orange-600 mt-1 font-medium">
                                  (Validasi: {tagihan.dibayar_oleh.name})
                                </span>
                              ) : (
                                <span className="block text-xs text-blue-600 mt-1 font-medium">
                                  (Dibayar: {tagihan.dibayar_oleh.name})
                                </span>
                              )
                            )}
                          </div>
                        )}
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{formatRupiah(tagihan.total_tagihan)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex flex-col space-y-2">
                          {tagihan.status_pembayaran === 'belum_bayar' && (
                            <button
                              onClick={() => handleOpenValidationModal(tagihan)}
                              className="w-full px-3 py-1 text-xs font-medium text-white bg-orange-500 rounded-md hover:bg-orange-600 focus:outline-none"
                            >
                              Validasi Lunas
                            </button>
                          )}
                          <button
                            onClick={() => handleDownloadIndividualPdf(tagihan)}
                            className="w-full px-3 py-1 text-xs font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none"
                          >
                            Download
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" className="px-6 py-4 text-center text-sm text-gray-500">
                      Tidak ada data tagihan untuk periode ini.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Paginasi (Tetap Sama) */}
          {paginationMeta && paginationMeta.last_page > 1 && (
            <div className="flex items-center justify-between mt-4">
              <span className="text-sm text-gray-700">
                Menampilkan <span className="font-semibold">{paginationMeta.from}</span>
                {' '}sampai <span className="font-semibold">{paginationMeta.to}</span>
                {' '}dari <span className="font-semibold">{paginationMeta.total}</span> hasil
              </span>
              
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1 || isLoading}
                  className="relative inline-flex items-center px-3 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                  Sebelumnya
                </button>

                {generatePageNumbers(currentPage, paginationMeta.last_page).map((page, index) => {
                  if (page === '...') {
                    return (
                      <span key={index} className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                        ...
                      </span>
                    );
                  }
                  const isCurrent = page === currentPage;
                  return (
                    <button
                      key={index}
                      onClick={() => handlePageChange(page)}
                      disabled={isLoading}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium
                        ${isCurrent 
                          ? 'z-10 bg-blue-600 text-white border-blue-600' 
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                        }
                      `}
                    >
                      {page}
                    </button>
                  );
                })}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === paginationMeta.last_page || isLoading}
                  className="relative inline-flex items-center px-3 py-2 rounded-r-md border border-gray-300 bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                  Berikutnya
                </button>
              </nav>
            </div>
          )}
        </>
      )}
    </>
  );
}

export default Laporan;