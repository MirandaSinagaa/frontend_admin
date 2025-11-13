import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Impor Halaman Admin & Guest
import LoginPage from './pages/Login.jsx';
import RegisterPage from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import CreateTagihan from './pages/CreateTagihan.jsx';
import Laporan from './pages/Laporan.jsx';
import TambahKrama from './pages/TambahKrama.jsx';
import DaftarKrama from './pages/DaftarKrama.jsx';
import DetailKrama from './pages/DetailKrama.jsx';

// Impor Komponen Penjaga Rute Admin & Guest
import ProtectedRoute from './components/ProtectedRoute.jsx';
import GuestRoute from './components/GuestRoute.jsx';

// Impor Halaman User
import UserProtectedRoute from './frontend_user/UserProtectedRoute.jsx';
import UserDashboard from './frontend_user/UserDashboard.jsx';
import MyBills from './frontend_user/MyBills.jsx';
import SearchKrama from './frontend_user/SearchKrama.jsx';
import Checkout from './frontend_user/Checkout.jsx';
import PaymentPage from './frontend_user/PaymentPage.jsx';

// --- (PERUBAHAN) 1. Impor 2 Halaman Baru ---
import PaymentHistory from './frontend_user/PaymentHistory.jsx';
import EditProfile from './frontend_user/EditProfile.jsx';


function App() {
  return (
    <BrowserRouter>
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
          <Route path="/register" element={<RegisterPage />} />
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
        
        {/* Rute User (Protected) */}
        <Route path="/user" element={<UserProtectedRoute />}>
          <Route index element={<UserDashboard />} />
          <Route path="tagihan-saya" element={<MyBills />} />
          <Route path="bayar-warga-lain" element={<SearchKrama />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="payment/:transaction_id" element={<PaymentPage />} />
          
          {/* --- (PERUBAHAN) 2. Tambahkan 2 Rute Baru --- */}
          <Route path="payment-history" element={<PaymentHistory />} />
          <Route path="edit-profile" element={<EditProfile />} />
        </Route>

        {/* Redirect halaman utama (/) */}
        <Route
          path="/"
          element={<Navigate to="/login" replace />} 
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