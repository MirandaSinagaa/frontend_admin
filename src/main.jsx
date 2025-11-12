// src/main.jsx

import React from 'react'; // 'StrictMode' ada di dalam 'React'
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { AuthProvider } from './context/AuthContext'; // Impor Provider

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider> {/* Bungkus App dengan AuthProvider */}
      <App />
    </AuthProvider>
  </React.StrictMode>,
);