import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { Lock, User, AlertTriangle } from 'lucide-react';
import Swal from 'sweetalert2';

const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.onmouseenter = Swal.stopTimer;
    toast.onmouseleave = Swal.resumeTimer;
  }
});

export default function AdminLogin() {
  const { language, t } = useLanguage();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // If already logged in, redirect to dashboard
    if (sessionStorage.getItem('admin_token')) {
      navigate('/admin/dashboard');
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok) {
        sessionStorage.setItem('admin_token', data.token);
        sessionStorage.setItem('admin_username', data.username);
        // Force header update
        window.dispatchEvent(new Event('storage'));

        Toast.fire({
          icon: 'success',
          title: language === 'en' ? 'Logged in successfully!' : 'सफलतापूर्वक लॉग इन किया गया!'
        });

        navigate('/admin/dashboard');
      } else {
        Toast.fire({
          icon: 'error',
          title: data.message || (language === 'en' ? 'Login failed' : 'लॉगिन विफल रहा')
        });
      }
    } catch (err) {
      console.error('Login error:', err);
      Toast.fire({
        icon: 'error',
        title: language === 'en' ? 'Connection to server failed. Please try again.' : 'सर्वर से कनेक्शन विफल रहा। कृपया पुन: प्रयास करें।'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="auth-wrapper glass">
        <div style={{ textAlign: 'center', marginBottom: '25px' }}>
          <h2 style={{ fontSize: '24px', color: 'var(--color-text-primary)' }}>
            {language === 'en' ? 'Administrator Portal' : 'व्यवस्थापक पोर्टल'}
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '13px', marginTop: '6px' }}>
            {language === 'en' ? 'Log in to write and manage news updates.' : 'समाचार अपडेट लिखने और प्रबंधित करने के लिए लॉग इन करें।'}
          </p>
        </div>



        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ position: 'relative' }}>
            <label htmlFor="username">{language === 'en' ? 'Username' : 'उपयोगकर्ता नाम'}</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                id="username"
                className="form-control"
                style={{ paddingLeft: '40px' }}
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <User size={16} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--color-text-secondary)' }} />
            </div>
          </div>

          <div className="form-group" style={{ position: 'relative' }}>
            <label htmlFor="password">{language === 'en' ? 'Password' : 'पासवर्ड'}</label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                id="password"
                className="form-control"
                style={{ paddingLeft: '40px' }}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Lock size={16} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--color-text-secondary)' }} />
            </div>
          </div>

          <button type="submit" className="btn" disabled={loading} style={{ marginTop: '10px' }}>
            {loading
              ? (language === 'en' ? 'Logging in...' : 'लॉग इन किया जा रहा है...')
              : (language === 'en' ? 'Secure Login' : 'सुरक्षित लॉगिन')}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '12px', color: 'var(--color-text-secondary)' }}>

        </div>
      </div>
    </div>
  );
}
