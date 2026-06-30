import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { Clock, Globe, ChevronDown, Newspaper, Mail, UserCheck, MapPin, Sun, Moon, Menu, X } from 'lucide-react';

export default function Navbar() {
  const { language, toggleLanguage, t } = useLanguage();
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
    return date.toLocaleTimeString(language === 'en' ? 'en-US' : 'hi-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString(language === 'en' ? 'en-US' : 'hi-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
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
          <span style={{ fontSize: '14px' }}>📰</span>
          {language === 'en' ? 'Newspaper' : 'अखबार'}
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
      {/* Top Bar for Clock and Language toggler */}
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
                  Admin
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
                  Logout
                </button>
              </div>
            ) : (
              <Link to="/admin/login" style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px' }}>
                Admin Login
              </Link>
            )}
            <button className="lang-toggle" onClick={toggleTheme} title={theme === 'light' ? 'Dark Mode' : 'Light Mode'}>
              {theme === 'light' ? <Moon size={14} /> : <Sun size={14} />}
              {theme === 'light' ? (language === 'en' ? 'Dark' : 'डार्क') : (language === 'en' ? 'Light' : 'लाइट')}
            </button>
            <button className="lang-toggle" onClick={toggleLanguage}>
              <Globe size={14} />
              {language === 'en' ? 'हिन्दी' : 'English'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <nav className="nav-main">
        <div className="container">
          <Link to="/" className="brand" style={{ display: 'flex', alignItems: 'center', gap: '12px' }} onClick={() => setIsOpen(false)}>
            <img 
              src="/logo.png" 
              alt={t('brandName')} 
              style={{ height: '64px', objectFit: 'contain', borderRadius: '4px' }} 
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <span style={{ fontSize: '22px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '-0.5px' }}>
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
            {language === 'en' ? 'Trending:' : 'ट्रेंडिंग:'}
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
