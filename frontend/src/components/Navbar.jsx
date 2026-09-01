import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { Clock, ChevronDown, Newspaper, Mail, UserCheck, MapPin, Sun, Moon, Menu, X, Info, ShieldCheck } from 'lucide-react';

export default function Navbar() {
  const { t } = useLanguage();
  const [time, setTime] = useState(new Date());
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('news_theme') || 'dark');
  const [headerHeight, setHeaderHeight] = useState(110);
  const headerRef = useRef(null);
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

  // Close mobile menu (and reset dropdown) on route change
  useEffect(() => {
    setIsOpen(false);
    setDropdownOpen(false);
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

  const formatDate = (date) => {
    return date.toLocaleDateString('hi-IN', {
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
      <li className={`dropdown-menu ${isMobile ? 'mobile-dropdown-item' : ''}`}>
        <button
          className="dropdown-trigger"
          onClick={() => isMobile && setDropdownOpen(prev => !prev)}
          style={isMobile ? { width: '100%', justifyContent: 'space-between' } : {}}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <MapPin size={16} style={{ color: 'var(--color-primary)' }} />
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
        {/* Desktop: CSS hover. Mobile: toggle via state */}
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
              <Link to="/admin/login" style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px' }}>
                एडमिन लॉगिन
              </Link>
            )}
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

      {/* क्षेत्र / Subdivision Quick-Access Bar */}
      <div className="trending-tags-bar">
        <div className="container trending-tags-container">
          <span className="trending-label" style={{ display: 'flex', alignItems: 'center', gap: '5px', whiteSpace: 'nowrap' }}>
            <MapPin size={13} style={{ color: 'var(--color-primary)' }} />
            क्षेत्र:
          </span>
          {/* "सभी" pill – always first */}
          <span
            className="trending-tag"
            style={{ cursor: 'pointer' }}
            onClick={() => navigate('/city/All')}
          >
            📍 सभी क्षेत्र
          </span>
          {/* Dynamic subdivisions from API */}
          {subdivisions.map((sub) => (
            <span
              key={sub}
              className="trending-tag"
              style={{ cursor: 'pointer' }}
              onClick={() => navigate(`/city/${sub}`)}
            >
              {sub}
            </span>
          ))}
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
