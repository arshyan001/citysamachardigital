import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// Configure API URL for production
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
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
  
  console.log(`📡 Fetch: ${resource}`);
  return originalFetch.apply(this, args);
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
