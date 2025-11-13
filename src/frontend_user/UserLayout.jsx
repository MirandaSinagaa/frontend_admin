// src/frontend_user/UserLayout.jsx

import React, { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext"; 

// Ikon (BARU)
const HomeIcon = () => ( <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6-4a1 1 0 001-1v-1a1 1 0 10-2 0v1a1 1 0 001 1z" /></svg> );
const BillIcon = () => ( <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg> );
const SearchIcon = () => ( <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" /></svg> );
const CartIcon = () => ( <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg> );
const HistoryIcon = () => ( <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> );
const UserIcon = () => ( <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg> );

const activeClass = "flex items-center px-4 py-3 rounded-lg bg-blue-600 text-white shadow-md transition";
const inactiveClass = "flex items-center px-4 py-3 rounded-lg text-gray-300 hover:text-white hover:bg-blue-600/20 transition";

// (PERUBAHAN) Dropdown Menu untuk Profil
const ProfileMenu = ({ user, onLogout, onProfileClick }) => (
  <div className="relative">
    <button onClick={onProfileClick} className="flex items-center text-gray-700 focus:outline-none">
      <span className="mr-2 text-sm hidden md:block">
        Halo, <strong>{user?.name}</strong> (User)
      </span>
      <UserIcon />
    </button>
  </div>
);

export default function UserLayout() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  
  // (PERUBAHAN) State untuk dropdown
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    setIsMenuOpen(false);
    logout();
  };

  const handleProfileClick = () => {
    setIsMenuOpen(false);
    navigate('/user/edit-profile');
  };

  return (
    <div className="flex h-screen bg-slate-100">
      
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-gray-200 shadow-2xl flex-shrink-0">
        <div className="h-16 border-b border-slate-700 flex items-center justify-center">
          <h1 className="text-xl font-bold tracking-wide text-white">
            Billing Krama
          </h1>
        </div>
        <nav className="p-4 space-y-3">
          <NavLink to="/user" end className={({ isActive }) => isActive ? activeClass : inactiveClass}>
            <HomeIcon /> Dashboard
          </NavLink>
          <hr className="border-slate-700" />
          <NavLink to="/user/tagihan-saya" className={({ isActive }) => isActive ? activeClass : inactiveClass}>
            <BillIcon /> Tagihan Saya
          </NavLink>
          <NavLink to="/user/bayar-warga-lain" className={({ isActive }) => isActive ? activeClass : inactiveClass}>
            <SearchIcon /> Bayar Warga Lain
          </NavLink>
          {/* (PERUBAHAN) NavLink Riwayat */}
          <NavLink to="/user/payment-history" className={({ isActive }) => isActive ? activeClass : inactiveClass}>
            <HistoryIcon /> Riwayat Bayar
          </NavLink>
        </nav>
      </aside>

      {/* Konten Utama */}
      <div className="flex-1 flex flex-col">
        <header className="backdrop-blur-md bg-white/70 border-b border-gray-200 shadow-sm">
          <div className="h-16 px-6 flex items-center justify-end space-x-4">
            
            {/* Tombol Keranjang */}
            <NavLink to="/user/checkout" className="relative p-2 text-gray-600 hover:text-blue-600">
              <CartIcon />
              {itemCount > 0 && (
                <span className="absolute top-0 right-0 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-600 rounded-full">
                  {itemCount}
                </span>
              )}
            </NavLink>

            {/* (PERUBAHAN) Menu Dropdown Profil */}
            <div className="relative">
              <ProfileMenu 
                user={user} 
                onProfileClick={() => setIsMenuOpen(!isMenuOpen)}
              />
              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20">
                  <button
                    onClick={handleProfileClick}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Profil Saya
                  </button>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>

          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-8 bg-gradient-to-b from-slate-100 to-slate-200">
          <Outlet />
        </main>
      </div>
    </div>
  );
}