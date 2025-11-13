// src/main.jsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext'; // <-- (PERUBAHAN) 1. Impor CartProvider

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <CartProvider> {/* <-- (PERUBAHAN) 2. Bungkus App dengan CartProvider */}
        <App />
      </CartProvider>
    </AuthProvider>
  </React.StrictMode>,
);