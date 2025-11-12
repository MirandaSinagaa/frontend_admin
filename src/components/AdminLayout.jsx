import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// --- ICONS ---
const DashboardIcon = () => (
  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18M3 6h18M3 18h18" /></svg>
);
const CreateIcon = () => (
  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
);
const ReportIcon = () => (
  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
);
const UserAddIcon = () => (
  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
);
// (BARU) Ikon untuk "Data Warga"
const UsersIcon = () => (
  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
);
// --- END ICONS ---

const activeClass =
  "flex items-center px-4 py-3 rounded-lg bg-blue-600 text-white shadow-md transition";
const inactiveClass =
  "flex items-center px-4 py-3 rounded-lg text-gray-300 hover:text-white hover:bg-blue-600/20 transition";

export default function AdminLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="flex h-screen bg-slate-100">
      <aside className="w-64 bg-slate-900 text-gray-200 shadow-2xl flex-shrink-0">
        <div className="h-16 border-b border-slate-700 flex items-center justify-center">
          <h1 className="text-xl font-bold tracking-wide text-white">
            Billing Krama
          </h1>
        </div>
        <nav className="p-4 space-y-3">
          <NavLink to="/admin" end className={({ isActive }) => isActive ? activeClass : inactiveClass}>
            <DashboardIcon /> Dashboard
          </NavLink>
          
          <hr className="border-slate-700" />
          
          {/* --- (DIUBAH) Urutan Menu --- */}
          
          <NavLink to="/admin/tambah-krama" className={({ isActive }) => isActive ? activeClass : inactiveClass}>
            <UserAddIcon /> Tambah Warga
          </NavLink>

          {/* (BARU) Link ke Data Warga */}
          <NavLink to="/admin/daftar-krama" className={({ isActive }) => isActive ? activeClass : inactiveClass}>
            <UsersIcon /> Data Warga
          </NavLink>
          
          <hr className="border-slate-700" />

          <NavLink to="/admin/create-tagihan" className={({ isActive }) => isActive ? activeClass : inactiveClass}>
            <CreateIcon /> Buat Tagihan
          </NavLink>
          <NavLink to="/admin/laporan" className={({ isActive }) => isActive ? activeClass : inactiveClass}>
            <ReportIcon /> Laporan
          </NavLink>
        </nav>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="backdrop-blur-md bg-white/70 border-b border-gray-200 shadow-sm">
          <div className="h-16 px-6 flex items-center justify-end">
            <span className="text-gray-700 mr-4 text-sm">
              Selamat datang, <strong>{user?.name}</strong>
            </span>
            <button
              onClick={logout}
              className="px-4 py-2 rounded-md bg-red-600 text-white text-sm font-medium hover:bg-red-700 shadow-md transition"
            >
              Logout
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-8 bg-gradient-to-b from-slate-100 to-slate-200">
          <Outlet />
        </main>
      </div>
    </div>
  );
}