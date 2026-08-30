import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { Newspaper, Mail, Phone, MapPin, ShieldCheck } from 'lucide-react';

export default function Footer() {
  const { t } = useLanguage();
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
        console.error('Error loading subdivisions in Footer:', err);
      }
    };
    fetchSubdivisions();
  }, []);

  return (
    <footer>
      <div className="container">
        <div className="footer-grid">
          {/* Brand Column */}
          <div className="footer-brand">
            <h3>
              <span>{t('brandName').split(' ')[0]}</span>{' '}
              {t('brandName').split(' ').slice(1).join(' ')}
            </h3>
            <p style={{ margin: '12px 0 20px 0', fontSize: '14px', maxWidth: '300px' }}>
              {t('tagline')}। स्थानीय और राष्ट्रीय समाचार सबसे तेज़।
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={16} style={{ color: 'var(--color-primary)' }} />
                संत कबीर नगर, उत्तर प्रदेश, भारत
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Phone size={16} style={{ color: 'var(--color-primary)' }} />
                +91 7007936247
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Mail size={16} style={{ color: 'var(--color-primary)' }} />
                arshyan0021@gmail.com
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ color: '#fff', marginBottom: '16px', fontSize: '16px', textTransform: 'uppercase' }}>त्वरित लिंक</h4>
            <ul className="footer-links-list">
              <li><Link to="/">{t('home')}</Link></li>
              <li><Link to="/about">{t('aboutUs')}</Link></li>
              <li><Link to="/contact">{t('contactUs')}</Link></li>
              <li>
                <Link to="/privacy-policy" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#ef4444', fontWeight: '600' }}>
                  <ShieldCheck size={14} />
                  {t('privacyPolicy')}
                </Link>
              </li>
              <li><Link to="/epaper">{t('epaper')}</Link></li>
              <li><Link to="/admin/login">{t('adminPanel')}</Link></li>
            </ul>
          </div>

          {/* Subdivisions */}
          <div>
            <h4 style={{ color: '#fff', marginBottom: '16px', fontSize: '16px', textTransform: 'uppercase' }}>{t('subdivision')}</h4>
            <ul className="footer-links-list">
              {subdivisions.map((sub) => (
                <li key={sub}>
                  <Link to={`/city/${sub}`}>
                    {t(sub.toLowerCase()) !== sub.toLowerCase() ? t(sub.toLowerCase()) : sub}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} {t('brandName')}। सर्वाधिकार सुरक्षित।</p>
          <p style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            DESIGNED & DEVELOPED BY ARSHYAN KHAN ❤️
          </p>
        </div>
      </div>
    </footer>
  );
}
