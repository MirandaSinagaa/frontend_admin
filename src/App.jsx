import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// (BARU) Impor Toaster
import { Toaster } from 'react-hot-toast';

// Impor Halaman
import LoginPage from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import CreateTagihan from './pages/CreateTagihan.jsx';
import Laporan from './pages/Laporan.jsx';
import TambahKrama from './pages/TambahKrama.jsx';
import DaftarKrama from './pages/DaftarKrama.jsx';
import DetailKrama from './pages/DetailKrama.jsx';

// Impor Komponen Penjaga Rute
import ProtectedRoute from './components/ProtectedRoute.jsx';
import GuestRoute from './components/GuestRoute.jsx';

function App() {
  return (
    <BrowserRouter>
      {/* (BARU) Tambahkan Toaster di sini. 
          Ini adalah "wadah" untuk semua notifikasi pop-up */}
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#333',
            color: '#fff',
          },
        }}
      />
    
      <Routes>
        {/* Rute Tamu (Guest) */}
        <Route element={<GuestRoute />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>

        {/* Rute Admin (Protected) */}
        <Route path="/admin" element={<ProtectedRoute />}>
          <Route index element={<Dashboard />} />
          <Route path="create-tagihan" element={<CreateTagihan />} />
          <Route path="laporan" element={<Laporan />} />
          <Route path="tambah-krama" element={<TambahKrama />} />
          <Route path="daftar-krama" element={<DaftarKrama />} />
          <Route path="krama/:krama_id" element={<DetailKrama />} />
        </Route>

        {/* Redirect halaman utama (/) */}
        <Route
          path="/"
          element={<Navigate to="/admin" replace />} 
        />

        {/* Halaman 404 Not Found */}
        <Route path="*" element={
          <div className="flex h-screen items-center justify-center">
            404 - Halaman Tidak Ditemukan
          </div>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;