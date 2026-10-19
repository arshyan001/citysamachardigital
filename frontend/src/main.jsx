import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// Smart API URL detection:
const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1' ||
  window.location.hostname.startsWith('192.168.')
);

export const API_BASE_URL = isLocalhost
  ? (import.meta.env.VITE_API_URL || 'http://localhost:5000')
  : (import.meta.env.VITE_API_URL && !import.meta.env.VITE_API_URL.includes('localhost')
      ? import.meta.env.VITE_API_URL
      : 'https://citysamachardigital.onrender.com');

console.log('🔗 API Base URL:', API_BASE_URL);

// Global fetch interceptor - prepend API URL to relative paths
const originalFetch = window.fetch;
window.fetch = function(...args) {
  let [resource, config] = args;
  
  // If resource is a relative path starting with /api or /uploads, prepend the API URL
  if (typeof resource === 'string' && (resource.startsWith('/api') || resource.startsWith('/uploads'))) {
    resource = `${API_BASE_URL}${resource}`;
    args[0] = resource;
  }
  
  return originalFetch.apply(this, args);
};

// Register Service Worker early on page load
if ('serviceWorker' in navigator && (window.location.protocol === 'https:' || isLocalhost)) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((reg) => console.log('✅ [SW] Registered scope:', reg.scope))
      .catch((err) => console.warn('⚠️ [SW] Registration failed:', err.message));
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
