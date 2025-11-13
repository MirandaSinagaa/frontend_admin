// src/context/CartContext.jsx

import React, { createContext, useContext, useState } from 'react';
import { toast } from 'react-hot-toast';

// 1. Buat Context
const CartContext = createContext();

// 2. Buat Provider
export const CartProvider = ({ children }) => {
  // State 'cart' akan berisi array dari objek 'Tagihan'
  const [cart, setCart] = useState([]);

  // Fungsi untuk Menambah Tagihan ke Keranjang
  const addToCart = (tagihan) => {
    // Cek apakah tagihan ini sudah ada di keranjang
    const isExists = cart.find(item => item.tagihan_id === tagihan.tagihan_id);
    
    if (isExists) {
      toast.error('Tagihan ini sudah ada di keranjang.');
      return;
    }
    
    // Tambahkan ke keranjang
    setCart(prevCart => [...prevCart, tagihan]);
    toast.success(`Tagihan ${tagihan.krama.name} (${tagihan.tanggal}) ditambahkan ke keranjang.`);
  };

  // Fungsi untuk Menghapus Tagihan dari Keranjang
  const removeFromCart = (tagihan_id) => {
    setCart(prevCart => prevCart.filter(item => item.tagihan_id !== tagihan_id));
    toast.success('Tagihan dihapus dari keranjang.');
  };

  // Fungsi untuk Mengosongkan Keranjang (setelah checkout)
  const clearCart = () => {
    setCart([]);
  };

  // Fungsi untuk menghitung Total Keranjang
  const getCartTotal = () => {
    return cart.reduce((total, item) => total + item.total_tagihan, 0);
  };

  // Sediakan semua fungsi dan state ini
  const value = {
    cart,
    addToCart,
    removeFromCart,
    clearCart,
    getCartTotal,
    itemCount: cart.length
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

// 3. Buat Custom Hook
export const useCart = () => {
  return useContext(CartContext);
};