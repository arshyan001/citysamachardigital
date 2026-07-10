import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import NewsCard from '../components/NewsCard';
import { MapPin, Info } from 'lucide-react';

export default function CityNews() {
  const { subdivision } = useParams();
  const { t } = useLanguage();

  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCityNews = async () => {
      try {
        setLoading(true);
        let url = '/api/news';
        if (subdivision && subdivision !== 'All') {
          url += `?subdivision=${subdivision}`;
        }
        
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          setNews(data);
        }
      } catch (err) {
        console.error('Error fetching subdivision news:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCityNews();
  }, [subdivision]);

  // Dynamic titles - Hindi only
  const getPageTitle = () => {
    if (!subdivision || subdivision === 'All') {
      return 'संत कबीर नगर - ज़िला समाचार';
    }
    
    const subTranslation = t(subdivision.toLowerCase());
    return `स्थानीय समाचार - ${subTranslation}`;
  };

  const getPageDesc = () => {
    if (!subdivision || subdivision === 'All') {
      return 'संत कबीर नगर जिले से संकलित सभी स्थानीय रिपोर्ट और सुर्खियां।';
    }
    const subTranslation = t(subdivision.toLowerCase());
    return `सीधे ${subTranslation} उपखंड क्षेत्र से ग्राउंड रिपोर्ट, वीडियो बुलेटिन और कहानियां।`;
  };

  return (
    <div className="container" style={{ marginTop: '30px' }}>
      
      {/* City Header Panel */}
      <div 
        className="glass" 
        style={{ 
          padding: '30px', 
          borderRadius: 'var(--border-radius-md)', 
          marginBottom: '40px',
          borderLeft: '5px solid var(--color-primary)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px'
        }}
      >
        <div>
          <h2 style={{ fontSize: '28px', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MapPin size={24} style={{ color: 'var(--color-primary)' }} />
            {getPageTitle()}
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', marginTop: '8px', fontSize: '15px' }}>
            {getPageDesc()}
          </p>
        </div>
        
        <span 
          className="live-badge" 
          style={{ 
            background: 'var(--color-secondary)',
            fontSize: '11px',
            padding: '5px 12px',
            borderRadius: '4px'
          }}
        >
          {news.length} समाचार
        </span>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '100px 0', fontSize: '18px', color: 'var(--color-text-secondary)' }}>
          {t('loading')}
        </div>
      ) : (
        <>
          {news.length === 0 ? (
            <div className="glass" style={{ textAlign: 'center', padding: '60px 20px', borderRadius: 'var(--border-radius-md)', color: 'var(--color-text-secondary)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
              <Info size={40} style={{ color: 'var(--color-secondary)' }} />
              <div>
                <h3 style={{ color: '#fff', marginBottom: '8px' }}>कोई समाचार नहीं मिला</h3>
                <p>हमने अभी तक इस उपखंड के लिए कोई समाचार प्रकाशित नहीं किया है। कृपया जल्द ही दोबारा जांचें!</p>
              </div>
            </div>
          ) : (
            <div className="news-list-layout">
              {news.map((n) => {
                const formattedDate = new Date(n.createdAt).toLocaleDateString(
                  'hi-IN',
                  { month: 'short', day: 'numeric', year: 'numeric' }
                );
                const imageUrl = n.images && n.images.length > 0 
                  ? n.images[0] 
                  : 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=600&q=80';
                
                return (
                  <div 
                    key={n._id} 
                    className="news-list-item"
                    onClick={() => navigate(`/news/${n._id}`)}
                  >
                    <div className="news-list-item-image">
                      <LazyImage src={imageUrl} alt={n.titleHi} />
                    </div>
                    <div className="news-list-item-content">
                      <h4>{n.titleHi}</h4>
                      <p className="news-list-item-summary">{n.summaryHi}</p>
                      <div className="news-list-item-meta">
                        <span>{formattedDate}</span>
                        <span>•</span>
                        <span>{n.views || 0} {t('views')}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
