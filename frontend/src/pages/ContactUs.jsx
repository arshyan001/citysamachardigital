import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Send, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  MessageSquare, 
  Share2, 
  HelpCircle,
  ChevronDown,
  Building2,
  Newspaper,
  Megaphone,
  Radio
} from 'lucide-react';
import SEO from '../components/SEO';

export default function ContactUs() {
  const { t } = useLanguage();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'न्यूज़ टिप / सूचना',
    message: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState(null); // 'success' | 'error'
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

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
          subject: 'न्यूज़ टिप / सूचना',
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

  const contactFaqs = [
    {
      q: "न्यूज़ टिप या वीडियो कैसे भेजें?",
      a: "आप सीधे हमारे व्हाट्सएप नंबर (+91 7007936247) पर वीडियो या फ़ोटो भेज सकते हैं या इस फॉर्म में 'न्यूज़ टिप' विषय चुनकर विवरण साझा कर सकते हैं।"
    },
    {
      q: "विज्ञापन और प्रायोजित समाचार दरें कहाँ से प्राप्त करें?",
      a: "व्यावसायिक विज्ञापन, ई-पेपर बैनर या प्रायोजित कवरेज के लिए हमारे विज्ञापन डेस्क (arshyan0021@gmail.com या फ़ोन: +91 9984745005) पर संपर्क करें।"
    },
    {
      q: "क्या मेरी पहचान गुप्त रखी जाएगी?",
      a: "जी हाँ, संवेदनशील ख़बरों और भ्रष्टाचार से जुड़े खुलासों में सूत्र (Source) की पहचान पूर्णतः गोपनीय रखी जाती है।"
    }
  ];

  return (
    <div className="container" style={{ marginTop: '30px', marginBottom: '60px' }}>
      <SEO
        title="संपर्क करें (Contact Us)"
        description="सिटी समाचार डिजिटल की संपादकीय एवं रिपोर्टिंग टीम से संपर्क करें। अपनी न्यूज़ टिप्स, विज्ञापन पूछताछ या शिकायतें भेजें।"
        keywords={['संपर्क करें', 'Contact City Samachar Digital', 'न्यूज़ टिप', 'संत कबीर नगर रिपोर्टर', 'खलीलाबाद समाचार डेस्क']}
      />

      {/* Hero Header Section */}
      <div 
        style={{
          background: 'linear-gradient(135deg, rgba(239,68,68,0.1) 0%, rgba(20,27,45,0.95) 100%)',
          borderRadius: 'var(--border-radius-lg)',
          padding: '40px 28px',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-lg)',
          textAlign: 'center',
          marginBottom: '40px',
          position: 'relative'
        }}
      >
        <div 
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            color: 'var(--color-success)',
            padding: '4px 14px',
            borderRadius: '20px',
            fontSize: '13px',
            fontWeight: '600',
            marginBottom: '14px'
          }}
        >
          <span 
            style={{ 
              width: '8px', 
              height: '8px', 
              borderRadius: '50%', 
              background: 'var(--color-success)',
              boxShadow: '0 0 8px var(--color-success)'
            }} 
          />
          न्यूज़ रूम एक्टिव - 24x7
        </div>

        <h1 style={{ fontSize: 'clamp(28px, 4vw, 38px)', color: 'var(--color-text-primary)', fontWeight: '800' }}>
          {t('contactTitle')}
        </h1>

        <p style={{ color: 'var(--color-text-secondary)', marginTop: '8px', fontSize: '16px', maxWidth: '720px', margin: '8px auto 0 auto' }}>
          क्या आपके पास कोई विशेष ख़बर, स्थानीय समस्या या न्यूज़ टिप है? हमारी संपादकीय टीम 24 घंटे आपकी सेवा में तत्पर है।
        </p>

        <div 
          style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: '24px', 
            marginTop: '20px',
            fontSize: '14px',
            color: 'var(--color-text-secondary)',
            flexWrap: 'wrap'
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Clock size={16} style={{ color: 'var(--color-primary)' }} />
            औसत प्रतिक्रिया समय: 2-4 घंटे
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Radio size={16} style={{ color: 'var(--color-primary)' }} />
            हेल्पलाइन: +91 7007936247
          </span>
        </div>
      </div>

      {/* Main Grid: Form + Info Cards */}
      <div className="contact-grid">

        {/* Interactive Contact Form */}
        <div className="contact-card" style={{ padding: '32px' }}>
          <h2 style={{ fontSize: '22px', color: 'var(--color-text-primary)', marginBottom: '6px', fontWeight: '700' }}>
            हमें संदेश भेजें (Send Message)
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px', marginBottom: '24px' }}>
            नीचे दिए गए फ़ॉर्म को भरें और हमारी टीम आपसे शीघ्र संपर्क करेगी।
          </p>

          {status === 'success' && (
            <div className="alert alert-success" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <CheckCircle2 size={20} />
              <div>
                <strong>धन्यवाद!</strong> आपका संदेश सफलता पूर्वक भेज दिया गया है।
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="alert alert-error" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <AlertTriangle size={20} />
              <div>
                {t('errorMsg')}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div className="form-group">
                <label htmlFor="name">{t('nameLabel')} *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="form-control"
                  required
                  placeholder="अपना नाम दर्ज करें"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">{t('emailLabel')} *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="form-control"
                  required
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div className="form-group">
                <label htmlFor="phone">{t('phoneLabel')} *</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  className="form-control"
                  required
                  placeholder="+91 XXXXX XXXXX"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="subject">विषय (Subject)</label>
                <select
                  id="subject"
                  name="subject"
                  className="form-control"
                  value={formData.subject}
                  onChange={handleChange}
                >
                  <option value="न्यूज़ टिप / सूचना">न्यूज़ टिप / सूचना</option>
                  <option value="विज्ञापन / बिजनेस">विज्ञापन एवं बिजनेस पूछताछ</option>
                  <option value="ई-पेपर / तकनीक">ई-पेपर व तकनीकी सहायता</option>
                  <option value="सामान्य पूछताछ">सामान्य पूछताछ</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="message">{t('messageLabel')} *</label>
              <textarea
                id="message"
                name="message"
                rows="5"
                className="form-control"
                required
                placeholder="अपनी ख़बर, समस्या या संदेश का विस्तृत विवरण यहाँ लिखें..."
                value={formData.message}
                onChange={handleChange}
              ></textarea>
            </div>

            <button 
              type="submit" 
              className="btn" 
              disabled={submitting} 
              style={{ 
                width: '100%',
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: '8px',
                padding: '14px',
                borderRadius: 'var(--border-radius-md)',
                fontSize: '16px',
                fontWeight: '700'
              }}
            >
              <Send size={18} />
              {submitting ? t('submittingBtn') : t('submitBtn')}
            </button>
          </form>
        </div>

        {/* Contact Information & Channels */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

          {/* Main Office Card */}
          <div className="contact-card" style={{ padding: '24px' }}>
            <h3 style={{ color: '#fff', fontSize: '18px', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Building2 size={20} style={{ color: 'var(--color-primary)' }} />
              मुख्य सम्पादकीय कार्यालय
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', fontSize: '14px' }}>
              <div style={{ display: 'flex', gap: '14px' }}>
                <MapPin size={22} style={{ color: 'var(--color-primary)', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <h4 style={{ color: '#fff', fontWeight: 600 }}>कार्यालय का पता</h4>
                  <p style={{ color: 'var(--color-text-secondary)', marginTop: '4px', lineHeight: '1.5' }}>
                    खलीलाबाद बायपास रोड, खलीलाबाद, संत कबीर नगर, उत्तर प्रदेश - 272175
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '14px' }}>
                <Phone size={22} style={{ color: 'var(--color-primary)', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <h4 style={{ color: '#fff', fontWeight: 600 }}>न्यूज़ डेस्क व हेल्पलाइन</h4>
                  <p style={{ color: 'var(--color-text-secondary)', marginTop: '4px', lineHeight: '1.6' }}>
                    संपादकीय डेस्क: <strong>+91 7007936247</strong><br />
                    व्हाट्सएप न्यूज़ लाइन: <strong>+91 9984745005</strong>
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '14px' }}>
                <Mail size={22} style={{ color: 'var(--color-primary)', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <h4 style={{ color: '#fff', fontWeight: 600 }}>ईमेल संपर्क</h4>
                  <p style={{ color: 'var(--color-text-secondary)', marginTop: '4px', lineHeight: '1.6' }}>
                    संपादकीय: <strong>arshyan001@gmail.com</strong><br />
                    प्रेस विज्ञप्ति व विज्ञापन: <strong>arshyan0021@gmail.com</strong>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Advertising & Business Inquiry Box */}
          <div 
            style={{
              background: 'linear-gradient(135deg, rgba(59,130,246,0.12) 0%, rgba(20,27,45,0.95) 100%)',
              borderRadius: 'var(--border-radius-md)',
              padding: '22px',
              border: '1px solid rgba(59, 130, 246, 0.25)'
            }}
          >
            <h4 style={{ color: '#fff', fontSize: '16px', fontWeight: '700', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Megaphone size={18} style={{ color: 'var(--color-secondary)' }} />
              डिजिटल विज्ञापन एवं ब्रांड प्रमोशन
            </h4>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '13px', lineHeight: '1.6' }}>
              हमारे पोर्टल और ई-पेपर पर बैनर विज्ञापन, प्रायोजित पोस्ट या लाइव वीडियो कवरेज के लिए हमारे मीडिया सेल्स प्रतिनिधि से बात करें।
            </p>
          </div>

        </div>
      </div>

      {/* Google Maps Location Preview Frame */}
      <div style={{ marginTop: '40px', marginBottom: '40px' }}>
        <h2 style={{ fontSize: '20px', color: 'var(--color-text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <MapPin size={20} style={{ color: 'var(--color-primary)' }} />
          गूगल मैप्स लोकेशन (खलीलाबाद कार्यालय)
        </h2>

        <div 
          style={{ 
            borderRadius: 'var(--border-radius-lg)', 
            overflow: 'hidden', 
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-md)',
            height: '350px'
          }}
        >
          <iframe 
            title="City Samachar Digital Location" 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14240.230759089012!2d83.0631!3d26.7797!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x399120612c2a059b%3A0x67307044036e5227!2sKhalilabad%2C%20Uttar%20Pradesh%20272175!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin" 
            width="100%" 
            height="100%" 
            style={{ border: 0 }} 
            allowFullScreen="" 
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      </div>

      {/* Quick FAQs */}
      <div style={{ marginTop: '40px' }}>
        <h2 style={{ fontSize: '22px', color: 'var(--color-text-primary)', marginBottom: '18px', textAlign: 'center' }}>
          संपर्क से जुड़े त्वरित उत्तर
        </h2>

        <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {contactFaqs.map((item, idx) => (
            <div 
              key={idx}
              style={{
                background: 'var(--bg-card)',
                borderRadius: 'var(--border-radius-md)',
                border: '1px solid var(--border-color)',
                overflow: 'hidden'
              }}
            >
              <button 
                onClick={() => toggleFaq(idx)}
                style={{
                  width: '100%',
                  padding: '16px 20px',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--color-text-primary)',
                  fontSize: '15px',
                  fontWeight: '600',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <HelpCircle size={16} style={{ color: 'var(--color-primary)' }} />
                  {item.q}
                </span>
                <ChevronDown 
                  size={16} 
                  style={{ 
                    transform: openFaq === idx ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.3s ease' 
                  }} 
                />
              </button>

              {openFaq === idx && (
                <div 
                  style={{
                    padding: '0 20px 18px 46px',
                    color: 'var(--color-text-secondary)',
                    fontSize: '14px',
                    lineHeight: '1.6',
                    borderTop: '1px solid var(--border-color)'
                  }}
                >
                  <p style={{ paddingTop: '12px' }}>{item.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
