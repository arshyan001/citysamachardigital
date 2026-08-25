import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { Clock, ChevronDown, Newspaper, Mail, UserCheck, MapPin, Sun, Moon, Menu, X, Info, ShieldCheck } from 'lucide-react';

export default function Navbar() {
  const { t } = useLanguage();
  const [time, setTime] = useState(new Date());
  const [isOpen, setIsOpen] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('news_theme') || 'dark');
  const [headerHeight, setHeaderHeight] = useState(110);
  const headerRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith('/admin');

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

  // Measure header height for dynamic mobile menu positioning
  useEffect(() => {
    const measure = () => {
      if (headerRef.current) {
        setHeaderHeight(headerRef.current.getBoundingClientRect().height);
      }
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

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

  const formatWeekday = (date) => {
    return date.toLocaleDateString('hi-IN', { weekday: 'long' });
  };

  const formatDateShort = (date) => {
    return date.toLocaleDateString('hi-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  // Check if admin is logged in
  const isAdminLoggedIn = !!sessionStorage.getItem('admin_token');

  const handleLogout = () => {
    sessionStorage.removeItem('admin_token');
    navigate('/admin/login');
  };

  const renderNavLinks = (isMobile) => (
    <>
      <li>
        <NavLink to="/" className={({ isActive }) => isActive ? 'active' : ''} onClick={() => isMobile && setIsOpen(false)}>
          {t('home')}
        </NavLink>
      </li>

      {/* Dropdown for Sant Kabir Nagar locations */}
      <li className="dropdown-menu">
        <button className="dropdown-trigger">
          <MapPin size={16} style={{ color: 'var(--color-primary)' }} />
          {t('district')}
          <ChevronDown size={14} />
        </button>
        <div className="dropdown-content">
          <Link to="/city/All" onClick={() => isMobile && setIsOpen(false)}>{t('allLocations')}</Link>
          <Link to="/city/Khalilabad" onClick={() => isMobile && setIsOpen(false)}>{t('khalilabad')}</Link>
          <Link to="/city/Mehdawal" onClick={() => isMobile && setIsOpen(false)}>{t('mehdawal')}</Link>
          <Link to="/city/Dhanghata" onClick={() => isMobile && setIsOpen(false)}>{t('dhanghata')}</Link>
        </div>
      </li>

      <li>
        <NavLink to="/about" className={({ isActive }) => isActive ? 'active' : ''} onClick={() => isMobile && setIsOpen(false)}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Info size={16} />
            {t('aboutUs')}
          </span>
        </NavLink>
      </li>

      <li>
        <NavLink to="/privacy-policy" className={({ isActive }) => isActive ? 'active' : ''} onClick={() => isMobile && setIsOpen(false)}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <ShieldCheck size={16} />
            {t('privacyPolicy')}
          </span>
        </NavLink>
      </li>

      <li>
        <NavLink to="/contact" className={({ isActive }) => isActive ? 'active' : ''} onClick={() => isMobile && setIsOpen(false)}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Mail size={16} />
            {t('contactUs')}
          </span>
        </NavLink>
      </li>

      <li>
        <NavLink 
          to="/epaper" 
          className={({ isActive }) => isActive ? 'active' : ''} 
          onClick={() => isMobile && setIsOpen(false)}
          style={{ 
            background: 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)', 
            color: '#000', 
            padding: '5px 14px', 
            borderRadius: '16px', 
            fontWeight: '700', 
            fontSize: '13px',
            boxShadow: '0 2px 6px rgba(251, 191, 36, 0.25)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            width: 'auto'
          }}
        >
          <Newspaper size={14} />
          {t('epaper')}
        </NavLink>
      </li>

      <li>
        <NavLink 
          to="/newspaper" 
          className={({ isActive }) => isActive ? 'active' : ''} 
          onClick={() => isMobile && setIsOpen(false)}
          style={{ 
            background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)', 
            color: '#fff', 
            padding: '5px 14px', 
            borderRadius: '16px', 
            fontWeight: '700', 
            fontSize: '13px',
            boxShadow: '0 2px 6px rgba(239, 68, 68, 0.25)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            width: 'auto'
          }}
        >
          <span style={{ fontSize: '13px' }}>📰</span>
          अखबार
        </NavLink>
      </li>

      {isAdminLoggedIn && (
        <li>
          <NavLink to="/admin/dashboard" className={({ isActive }) => isActive ? 'active' : ''} onClick={() => isMobile && setIsOpen(false)}>
            {t('adminDashboard')}
          </NavLink>
        </li>
      )}
    </>
  );

  return (
    <>
    <header ref={headerRef} className={`navbar-wrapper glass ${isAdminPage ? 'admin-navbar' : ''}`}>
      {/* Top Bar for Clock */}
      <div className="top-bar">
        <div className="container top-bar-container">
          <div className="top-bar-left">
            <span className="top-bar-time">
              <Clock size={13} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
              <span>{formatTime(time)}</span>
            </span>
            <span className="top-bar-divider">|</span>
            <span className="top-bar-date">
              <span className="top-bar-day">{formatWeekday(time)}, </span>
              <span>{formatDateShort(time)}</span>
            </span>
          </div>

          <div className="top-bar-right">
            {isAdminLoggedIn ? (
              <div className="top-bar-admin">
                <span className="admin-status">
                  <UserCheck size={13} />
                  एडमिन
                </span>
                <button onClick={handleLogout} className="logout-btn">
                  लॉगआउट
                </button>
              </div>
            ) : (
              <Link to="/admin/login" className="admin-link">
                <span className="admin-link-text">एडमिन लॉगिन</span>
                <span className="admin-link-short">एडमिन</span>
              </Link>
            )}
            <button className="lang-toggle" onClick={toggleTheme} title={theme === 'light' ? 'डार्क मोड' : 'लाइट मोड'}>
              {theme === 'light' ? <Moon size={13} /> : <Sun size={13} />}
              <span className="theme-toggle-text">{theme === 'light' ? 'डार्क' : 'लाइट'}</span>
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

          {/* Hamburger Menu Toggle Button */}
          <button 
            className="menu-toggle-btn" 
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle navigation"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Trending Topics Bar */}
      <div className="trending-tags-bar">
        <div className="container trending-tags-container">
          <span className="trending-label">
            ट्रेंडिंग:
          </span>
          <span className="trending-tag" onClick={() => navigate('/')}>#SantKabirNagar</span>
          <span className="trending-tag" onClick={() => navigate('/')}>#HeatwaveAlert</span>
          <span className="trending-tag" onClick={() => navigate('/')}>#UPBoardResults</span>
          <span className="trending-tag" onClick={() => navigate('/')}>#BhojpuriFilmShoot</span>
          <span className="trending-tag" onClick={() => navigate('/city/Khalilabad')}>#KhalilabadLibrary</span>
        </div>
      </div>
    </header>

    {/* Mobile Navigation Links */}
    <ul
      className={`nav-links mobile-nav ${isOpen ? 'mobile-open' : ''}`}
      style={{ top: `${headerHeight}px` }}
    >
      {renderNavLinks(true)}
    </ul>

    {/* Mobile backdrop — click outside to close menu */}
    {isOpen && (
      <div
        onClick={() => setIsOpen(false)}
        style={{
          position: 'fixed',
          inset: 0,
          top: `${headerHeight}px`,
          zIndex: 199,
          background: 'rgba(0,0,0,0.5)',
        }}
      />
    )}
    </>
  );
}
