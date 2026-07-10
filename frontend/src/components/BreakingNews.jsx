import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { AlertCircle } from 'lucide-react';

export default function BreakingNews() {
  const { t } = useLanguage();
  const [breakingNews, setBreakingNews] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith('/admin');

  useEffect(() => {
    const fetchBreakingNews = async () => {
      try {
        const res = await fetch('/api/news?isBreaking=true&limit=8');
        if (res.ok) {
          const data = await res.json();
          setBreakingNews(data);
        }
      } catch (error) {
        console.error('Error fetching breaking news:', error);
      }
    };
    fetchBreakingNews();
    
    // Refresh breaking news every 2 minutes
    const interval = setInterval(fetchBreakingNews, 120000);
    return () => clearInterval(interval);
  }, []);

  if (breakingNews.length === 0) return null;

  return (
    <div className={`breaking-ticker-wrapper ${isAdminPage ? 'admin-ticker' : ''}`}>
      <div className="ticker-title">
        <AlertCircle size={16} />
        {t('breakingNews')}
      </div>
      <div className="ticker-body">
        <div className="ticker-track">
          {breakingNews.map((news) => (
            <span
              key={news._id}
              className="ticker-item"
              onClick={() => navigate(`/news/${news._id}`)}
            >
              • {news.titleHi}
            </span>
          ))}
          {/* Duplicate track to make it infinite scrolling seamlessly */}
          {breakingNews.map((news) => (
            <span
              key={`${news._id}-dup`}
              className="ticker-item"
              onClick={() => navigate(`/news/${news._id}`)}
            >
              • {news.titleHi}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
