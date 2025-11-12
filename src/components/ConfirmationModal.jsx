import React from 'react';

/**
 * (DI-UPGRADE) Komponen Modal Konfirmasi yang bisa dipakai ulang.
 * * Props:
 * - isOpen, onClose, onConfirm, title, message (tetap sama)
 * - (BARU) confirmText (string): Teks untuk tombol konfirmasi (misal: "Ya, Hapus")
 * - (BARU) variant (string): 'primary' (oranye) atau 'danger' (merah)
 */
function ConfirmationModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message,
  confirmText = "Konfirmasi", // Teks default
  variant = "primary" // Warna default
}) {
  if (!isOpen) {
    return null;
  }

  // (BARU) Tentukan warna tombol berdasarkan variant
  const buttonClass = variant === 'danger'
    ? "bg-red-600 hover:bg-red-700" // Merah untuk hapus
    : "bg-orange-500 hover:bg-orange-600"; // Oranye untuk validasi

  return (
    // Overlay
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity"
      onClick={onClose}
    >
      {/* Konten Modal */}
      <div 
        className="bg-white rounded-lg shadow-xl w-full max-w-md m-4 transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        {/* Body Modal */}
        <div className="p-6">
          <p className="text-sm text-gray-600">{message}</p>
        </div>

        {/* Footer Modal (Tombol) */}
        <div className="flex items-center justify-end p-4 border-t space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            Batal
          </button>
          {/* (DIUBAH) Tombol sekarang dinamis */}
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-sm font-medium text-white rounded-md ${buttonClass}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmationModal;