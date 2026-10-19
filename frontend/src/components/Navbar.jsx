import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { Clock, ChevronDown, Newspaper, Mail, UserCheck, MapPin, Sun, Moon, Menu, X, Info, ShieldCheck, Home, BellRing } from 'lucide-react';
import NotificationBell from './NotificationBell';

export default function Navbar() {
  const { t } = useLanguage();
  const [time, setTime] = useState(new Date());
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('news_theme') || 'dark');
  const navigate = useNavigate();
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith('/admin');
  const [subdivisions, setSubdivisions] = useState([]);

  useEffect(() => {
    const fetchSubdivisions = async () => {
      try {
        const res = await fetch('/api/subdivisions');
        if (res.ok) {
          const data = await res.json();
          const filtered = data.filter(sub => sub && typeof sub === 'string');
          setSubdivisions(filtered);
        }
      } catch (err) {
        console.error('Error loading subdivisions in Navbar:', err);
      }
    };
    fetchSubdivisions();
  }, [location.pathname]);

  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
    localStorage.setItem('news_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setIsOpen(false);
    setDropdownOpen(false);
  }, [location.pathname]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const recordHit = async () => {
      try {
        await fetch('/api/analytics/hit', { method: 'POST' });
      } catch (err) {
        console.error('Analytics hit error:', err);
      }
    };
    recordHit();
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString('hi-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('hi-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const isAdminLoggedIn = !!sessionStorage.getItem('admin_token');

  const handleLogout = () => {
    sessionStorage.removeItem('admin_token');
    navigate('/admin/login');
  };

  const renderNavLinks = (isMobile) => (
    <>
      <li>
        <NavLink to="/" className={({ isActive }) => isActive ? 'active' : ''} onClick={() => isMobile && setIsOpen(false)}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Home size={17} />
            {t('home')}
          </span>
        </NavLink>
      </li>

      {/* Explicit Notification Button in Menu */}
      {isMobile && (
        <li style={{ padding: '8px 0', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.4px', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <BellRing size={13} />
              सूचनाएं (Notification Alert):
            </span>
            <NotificationBell fullWidth={true} />
          </div>
        </li>
      )}

      {/* Dropdown for Sant Kabir Nagar locations */}
      <li className={`dropdown-menu ${isMobile ? 'mobile-dropdown-item' : ''}`}>
        <button
          className="dropdown-trigger"
          onClick={() => isMobile && setDropdownOpen(prev => !prev)}
          style={isMobile ? { width: '100%', justifyContent: 'space-between' } : {}}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MapPin size={17} style={{ color: 'var(--color-primary)' }} />
            {t('district')}
          </span>
          <ChevronDown
            size={16}
            style={{
              transition: 'transform 0.25s',
              transform: isMobile && dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)'
            }}
          />
        </button>
        <div className={`dropdown-content${isMobile ? (dropdownOpen ? ' mobile-dropdown-open' : ' mobile-dropdown-closed') : ''}`}>
          <Link to="/city/All" onClick={() => { if (isMobile) { setIsOpen(false); setDropdownOpen(false); } }}>{t('allLocations')}</Link>
          {subdivisions.map((sub) => (
            <Link key={sub} to={`/city/${sub}`} onClick={() => { if (isMobile) { setIsOpen(false); setDropdownOpen(false); } }}>
              {t(sub.toLowerCase()) !== sub.toLowerCase() ? t(sub.toLowerCase()) : sub}
            </Link>
          ))}
        </div>
      </li>

      <li>
        <NavLink 
          to="/epaper" 
          className={({ isActive }) => isActive ? 'active' : ''} 
          onClick={() => isMobile && setIsOpen(false)}
          style={isMobile ? {
            background: 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)', 
            color: '#000', 
            padding: '10px 18px', 
            borderRadius: '12px', 
            fontWeight: '800', 
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            margin: '6px 0',
            width: '100%',
            boxShadow: '0 2px 8px rgba(251, 191, 36, 0.25)'
          } : { 
            background: 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)', 
            color: '#000', 
            padding: '8px 18px', 
            borderRadius: '20px', 
            fontWeight: '800', 
            boxShadow: '0 2px 8px rgba(251, 191, 36, 0.3)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            width: 'auto'
          }}
        >
          <Newspaper size={16} />
          {t('epaper')}
        </NavLink>
      </li>

      <li>
        <NavLink 
          to="/newspaper" 
          className={({ isActive }) => isActive ? 'active' : ''} 
          onClick={() => isMobile && setIsOpen(false)}
          style={isMobile ? {
            background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)', 
            color: '#fff', 
            padding: '10px 18px', 
            borderRadius: '12px', 
            fontWeight: '800', 
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            margin: '6px 0',
            width: '100%',
            boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)'
          } : { 
            background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)', 
            color: '#fff', 
            padding: '8px 18px', 
            borderRadius: '20px', 
            fontWeight: '800', 
            boxShadow: '0 2px 8px rgba(239, 68, 68, 0.35)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            width: 'auto'
          }}
        >
          <span style={{ fontSize: '15px' }}>📰</span>
          अखबार PDF
        </NavLink>
      </li>

      <li>
        <NavLink to="/about" className={({ isActive }) => isActive ? 'active' : ''} onClick={() => isMobile && setIsOpen(false)}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Info size={17} />
            {t('aboutUs')}
          </span>
        </NavLink>
      </li>

      <li>
        <NavLink to="/privacy-policy" className={({ isActive }) => isActive ? 'active' : ''} onClick={() => isMobile && setIsOpen(false)}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={17} />
            {t('privacyPolicy')}
          </span>
        </NavLink>
      </li>

      <li>
        <NavLink to="/contact" className={({ isActive }) => isActive ? 'active' : ''} onClick={() => isMobile && setIsOpen(false)}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Mail size={17} />
            {t('contactUs')}
          </span>
        </NavLink>
      </li>

      {isAdminLoggedIn ? (
        <li>
          <NavLink to="/admin/dashboard" className={({ isActive }) => isActive ? 'active' : ''} onClick={() => isMobile && setIsOpen(false)}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-success)', fontWeight: 700 }}>
              <UserCheck size={17} />
              {t('adminDashboard')}
            </span>
          </NavLink>
        </li>
      ) : (
        isMobile && (
          <li>
            <Link to="/admin/login" onClick={() => setIsOpen(false)}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-secondary)', fontSize: '14px' }}>
                <UserCheck size={16} />
                एडमिन लॉगिन
              </span>
            </Link>
          </li>
        )
      )}
    </>
  );

  return (
    <>
      <header className={`navbar-wrapper glass ${isAdminPage ? 'admin-navbar' : ''}`}>
        {/* Top Bar for Clock */}
        <div className="top-bar">
          <div className="container">
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Clock size={14} style={{ color: 'var(--color-primary)' }} />
                {formatTime(time)}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span>|</span>
                <span>{formatDate(time)}</span>
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {isAdminLoggedIn ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', color: 'var(--color-success)' }}>
                    <UserCheck size={14} />
                    एडमिन
                  </span>
                  <button 
                    onClick={handleLogout}
                    style={{ 
                      background: 'transparent', 
                      border: 'none', 
                      color: 'var(--color-primary)', 
                      cursor: 'pointer', 
                      fontSize: '13px', 
                      fontWeight: 600 
                    }}
                  >
                    लॉगआउट
                  </button>
                </div>
              ) : (
                <Link to="/admin/login" className="desktop-only-link" style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px' }}>
                  एडमिन लॉगिन
                </Link>
              )}

              {/* Desktop Notification Bell */}
              <div className="desktop-notif-btn">
                <NotificationBell />
              </div>

              {/* Theme Toggle */}
              <button className="lang-toggle" onClick={toggleTheme} title={theme === 'light' ? 'डार्क मोड' : 'लाइट मोड'}>
                {theme === 'light' ? <Moon size={14} /> : <Sun size={14} />}
                {theme === 'light' ? 'डार्क' : 'लाइट'}
              </button>
            </div>
          </div>
        </div>

        {/* Main Navigation Bar */}
        <nav className="nav-main">
          <div className="container">
            <Link to="/" className="brand" onClick={() => setIsOpen(false)}>
              <img 
                src="/logo.png" 
                alt={t('brandName')} 
                className="brand-logo"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
              <span className="brand-text">
                {t('brandName')}
              </span>
              <span className="live-badge">Live</span>
            </Link>

            {/* Desktop Navigation Links */}
            <ul className="nav-links desktop-nav">
              {renderNavLinks(false)}
            </ul>

            {/* Mobile Controls: Bell + Hamburger side-by-side */}
            <div className="mobile-header-actions">
              {/* Direct Quick Bell for mobile header */}
              <div className="mobile-notif-btn">
                <NotificationBell />
              </div>

              {/* Mobile Menu Hamburger Button */}
              <button 
                className="menu-toggle-btn" 
                onClick={() => setIsOpen(true)}
                aria-label="Open mobile menu"
                style={{
                  background: 'rgba(239, 68, 68, 0.12)',
                  border: '1.5px solid rgba(239, 68, 68, 0.35)',
                  borderRadius: '10px',
                  color: 'var(--color-text-primary)',
                  padding: '7px 9px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <Menu size={22} color="var(--color-primary)" />
              </button>
            </div>
          </div>
        </nav>

        {/* Slidable क्षेत्र / Subdivision Quick-Access Bar */}
        <div className="trending-tags-bar">
          <div className="trending-tags-container">
            <span className="trending-label" style={{ display: 'flex', alignItems: 'center', gap: '5px', whiteSpace: 'nowrap' }}>
              <MapPin size={13} style={{ color: 'var(--color-primary)' }} />
              क्षेत्र:
            </span>
            {/* "सभी" pill */}
            <span
              className="trending-tag"
              style={{ cursor: 'pointer', whiteSpace: 'nowrap' }}
              onClick={() => navigate('/city/All')}
            >
              📍 सभी क्षेत्र
            </span>
            {/* Dynamic subdivisions from API */}
            {subdivisions.map((sub) => (
              <span
                key={sub}
                className="trending-tag"
                style={{ cursor: 'pointer', whiteSpace: 'nowrap' }}
                onClick={() => navigate(`/city/${sub}`)}
              >
                {sub}
              </span>
            ))}
          </div>
        </div>
      </header>

      {/* Slidable Mobile Drawer Backdrop */}
      {isOpen && (
        <div 
          className="mobile-drawer-backdrop" 
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Slidable Mobile Navigation Drawer (App-like smooth slide from right) */}
      <aside className={`mobile-slide-drawer ${isOpen ? 'drawer-open' : ''}`}>
        {/* Drawer Header */}
        <div className="drawer-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img 
              src="/logo.png" 
              alt="Logo" 
              style={{ height: '38px', width: 'auto', borderRadius: '6px' }}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: '#ef4444', lineHeight: 1.2 }}>
                सिटी समाचार डिजिटल
              </div>
              <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                ताज़ा हिंदी समाचार पोर्टल
              </div>
            </div>
          </div>

          <button 
            className="drawer-close-btn"
            onClick={() => setIsOpen(false)}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Drawer Scrollable Content */}
        <div className="drawer-body">
          {/* Dedicated Push Notification Box inside Menu */}
          <div className="drawer-notif-box">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <div className="drawer-notif-icon-circle">
                <BellRing size={20} color="#fff" />
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--color-text-primary)' }}>
                  ताज़ा समाचार सूचनाएं
                </div>
                <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>
                  ब्रेकिंग न्यूज़ सीधे फोन पर पाएं
                </div>
              </div>
            </div>
            
            <div style={{ marginTop: '10px' }}>
              <NotificationBell fullWidth={true} />
            </div>
          </div>

          {/* Navigation Links */}
          <div className="drawer-nav-section">
            <div className="drawer-section-title">
              नेविगेशन मेन्यू
            </div>
            <ul className="drawer-links-list">
              {renderNavLinks(true)}
            </ul>
          </div>

          {/* Quick Slidable Regions / Subdivisions */}
          <div className="drawer-regions-section">
            <div className="drawer-section-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <MapPin size={13} color="var(--color-primary)" />
              संत कबीर नगर क्षेत्र (Locations)
            </div>
            <div className="drawer-regions-pills">
              <span
                className="drawer-region-pill"
                onClick={() => { navigate('/city/All'); setIsOpen(false); }}
              >
                📍 सभी क्षेत्र
              </span>
              {subdivisions.map((sub) => (
                <span
                  key={sub}
                  className="drawer-region-pill"
                  onClick={() => { navigate(`/city/${sub}`); setIsOpen(false); }}
                >
                  {sub}
                </span>
              ))}
            </div>
          </div>

          {/* Drawer Footer: Theme & Copyright */}
          <div className="drawer-footer">
            <button 
              className="lang-toggle" 
              onClick={toggleTheme} 
              style={{ width: '100%', justifyContent: 'center', padding: '10px', borderRadius: '12px', fontSize: '14px', fontWeight: 600 }}
            >
              {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
              {theme === 'light' ? 'डार्क थीम (Dark Mode)' : 'लाइट थीम (Light Mode)'}
            </button>
            <div style={{ textAlign: 'center', fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '14px' }}>
              © {new Date().getFullYear()} सिटी समाचार डिजिटल. सर्वाधिकार सुरक्षित.
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
