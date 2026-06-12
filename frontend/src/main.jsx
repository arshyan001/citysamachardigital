import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// Global API URL configuration
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
window.API_BASE_URL = API_URL;

// Intercept fetch to add API URL prefix for relative paths
const originalFetch = window.fetch;
window.fetch = function(...args) {
  let url = args[0];
  
  // If it's a relative path starting with /api or /uploads, prepend the API URL
  if (typeof url === 'string' && (url.startsWith('/api') || url.startsWith('/uploads'))) {
    url = `${API_URL}${url}`;
    args[0] = url;
  }
  
  return originalFetch.apply(this, args);
};

console.log('✅ API Base URL configured:', API_URL);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
