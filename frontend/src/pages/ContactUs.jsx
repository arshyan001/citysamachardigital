import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Mail, Phone, MapPin, Send, AlertTriangle } from 'lucide-react';

export default function ContactUs() {
  const { language, t } = useLanguage();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState(null); // 'success' | 'error'

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setStatus(null);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setStatus('success');
        setFormData({
          name: '',
          email: '',
          phone: '',
          message: '',
        });
      } else {
        setStatus('error');
      }
    } catch (error) {
      console.error('Submit contact message error:', error);
      setStatus('error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container" style={{ marginTop: '40px' }}>

      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h2 style={{ fontSize: '32px', color: '#fff' }}>{t('contactTitle')}</h2>
        <p style={{ color: 'var(--color-text-secondary)', marginTop: '8px', fontSize: '16px' }}>
          {language === 'en'
            ? 'Have a hot scoop or a news tip? Send us a message and our reporting team will reach out.'
            : 'क्या आपके पास कोई विशेष ख़बर या न्यूज़ टिप है? हमें संदेश भेजें और हमारी रिपोर्टिंग टीम आपसे संपर्क करेगी।'}
        </p>
      </div>

      <div className="contact-grid">

        {/* Contact Form */}
        <div className="contact-card">
          {status === 'success' && (
            <div className="alert alert-success">
              {t('successMsg')}
            </div>
          )}

          {status === 'error' && (
            <div className="alert alert-error" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={18} />
              {t('errorMsg')}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">{t('nameLabel')}</label>
              <input
                type="text"
                id="name"
                name="name"
                className="form-control"
                required
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">{t('emailLabel')}</label>
              <input
                type="email"
                id="email"
                name="email"
                className="form-control"
                required
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">{t('phoneLabel')}</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                className="form-control"
                required
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="message">{t('messageLabel')}</label>
              <textarea
                id="message"
                name="message"
                rows="5"
                className="form-control"
                required
                value={formData.message}
                onChange={handleChange}
              ></textarea>
            </div>

            <button type="submit" className="btn" disabled={submitting} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <Send size={16} />
              {submitting ? t('submittingBtn') : t('submitBtn')}
            </button>
          </form>
        </div>

        {/* Contact Information */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>

          <div className="contact-card" style={{ height: '100%' }}>
            <h3 style={{ color: '#fff', fontSize: '20px', marginBottom: '20px', borderBottom: '2px solid var(--color-primary)', paddingBottom: '8px' }}>
              {language === 'en' ? 'Our Head Office' : 'हमारा मुख्य कार्यालय'}
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', fontSize: '15px' }}>
              <div style={{ display: 'flex', gap: '15px' }}>
                <MapPin size={24} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
                <div>
                  <h4 style={{ color: '#fff', fontWeight: 600 }}>{language === 'en' ? 'Address' : 'पता'}</h4>
                  <p style={{ color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                    Khalilabad Bypass Road, Khalilabad, Sant Kabir Nagar, Uttar Pradesh - 272175
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '15px' }}>
                <Phone size={24} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
                <div>
                  <h4 style={{ color: '#fff', fontWeight: 600 }}>{language === 'en' ? 'Phone' : 'फ़ोन'}</h4>
                  <p style={{ color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                    Editorial Desk: +91 7007936247<br />
                    Broadcast Operations: +91 9984745005
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '15px' }}>
                <Mail size={24} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
                <div>
                  <h4 style={{ color: '#fff', fontWeight: 600 }}>{language === 'en' ? 'Email' : 'ईमेल'}</h4>
                  <p style={{ color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                    General Info: arshyan001@gmail.com<br />
                    Submit Press Releases: arshyan0021@gmail.com
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
