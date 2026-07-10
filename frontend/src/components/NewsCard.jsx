import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { Calendar, Eye, MapPin } from 'lucide-react';
import LazyImage from './LazyImage';

export default function NewsCard({ news, forcedCategoryName }) {
  const { t } = useLanguage();

  const title = news.titleHi;
  const summary = news.summaryHi;
  
  // Get category name (use forcedCategoryName if provided, else fall back to first category)
  const categoryName = forcedCategoryName 
    ? forcedCategoryName 
    : (news.categories && news.categories.length > 0 
        ? news.categories[0].nameHi 
        : '');

  // Get subdivision badge if exists and is not 'None'
  const subName = news.subdivision && news.subdivision !== 'None'
    ? t(news.subdivision.toLowerCase())
    : '';

  const formattedDate = new Date(news.createdAt).toLocaleDateString(
    'hi-IN',
    { month: 'short', day: 'numeric', year: 'numeric' }
  );

  // Default news mockup thumbnail if no images
  const imageUrl = news.images && news.images.length > 0 
    ? news.images[0] 
    : 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=600&q=80';

  return (
    <article className="news-card">
      <div className="news-card-image">
        <LazyImage src={imageUrl} alt={title} />
        {categoryName && (
          <span className="category-badge">{categoryName}</span>
        )}
        {subName && (
          <span 
            className="category-badge" 
            style={{ 
              left: 'auto', 
              right: '12px', 
              background: 'rgba(239, 68, 68, 0.9)', 
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <MapPin size={10} />
            {subName}
          </span>
        )}
      </div>

      <div className="news-card-content">
        <h3>
          <Link to={`/news/${news._id}`}>{title}</Link>
        </h3>
        <p>{summary}</p>
        
        <div className="card-meta">
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Calendar size={12} />
            {formattedDate}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Eye size={12} />
            {news.views || 0} {t('views')}
          </span>
        </div>
      </div>
    </article>
  );
}
