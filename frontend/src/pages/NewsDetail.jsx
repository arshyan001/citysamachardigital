import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { Calendar, Eye, MapPin, ArrowLeft, Video, Newspaper, ThumbsUp, Share2 } from 'lucide-react';
import LazyImage from '../components/LazyImage';

export default function NewsDetail() {
  const { id } = useParams();
  const { language, t } = useLanguage();
  const navigate = useNavigate();

  const [news, setNews] = useState(null);
  const [relatedNews, setRelatedNews] = useState([]);
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [fontSize, setFontSize] = useState(18);
  const [copied, setCopied] = useState(false);
  const [comments, setComments] = useState([]);
  const [newCommentName, setNewCommentName] = useState('');
  const [newCommentText, setNewCommentText] = useState('');
  const [likes, setLikes] = useState(0);
  const [shares, setShares] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);

  useEffect(() => {
    const fetchAds = async () => {
      try {
        const res = await fetch('/api/ads?isActive=true');
        if (res.ok) {
          const data = await res.json();
          setAds(data);
        }
      } catch (err) {
        console.error('Error fetching ads:', err);
      }
    };
    fetchAds();
  }, []);

  const renderAd = (slot) => {
    const slotAds = ads.filter(ad => ad.slot === slot);
    if (slotAds.length === 0) return null;
    const ad = slotAds[Math.floor(Math.random() * slotAds.length)];
    const AdContent = () => (
      ad.mediaType === 'video' ? (
        <video 
          src={ad.mediaUrl} 
          style={{ width: '100%', height: 'auto', display: 'block', borderRadius: 'var(--border-radius-sm)' }} 
          autoPlay 
          muted 
          loop 
          playsInline 
        />
      ) : (
        <img 
          src={ad.mediaUrl} 
          alt={ad.title} 
          style={{ width: '100%', height: 'auto', display: 'block', borderRadius: 'var(--border-radius-sm)' }} 
        />
      )
    );

    // Apply ad sizing rules dynamically
    let sizeStyle = {};
    const adSize = ad.size || 'original';

    if (slot === 'top') {
      if (adSize === 'large') {
        sizeStyle = { maxWidth: '900px', margin: '0 auto 30px auto' };
      } else if (adSize === 'medium') {
        sizeStyle = { maxWidth: '600px', margin: '0 auto 30px auto' };
      } else if (adSize === 'small') {
        sizeStyle = { maxWidth: '400px', margin: '0 auto 30px auto' };
      } else {
        sizeStyle = { width: '100%', margin: '0 0 30px 0' };
      }
    } else { // sidebar slot
      if (adSize === 'large') {
        sizeStyle = { width: '100%', margin: '0 auto 20px auto' };
      } else if (adSize === 'medium') {
        sizeStyle = { maxWidth: '80%', margin: '0 auto 20px auto' };
      } else if (adSize === 'small') {
        sizeStyle = { maxWidth: '60%', margin: '0 auto 20px auto' };
      } else {
        sizeStyle = { width: '100%', margin: '0 0 20px 0' };
      }
    }

    return (
      <div 
        className="ad-container" 
        style={{ 
          ...sizeStyle,
          borderRadius: 'var(--border-radius-sm)', 
          overflow: 'hidden', 
          border: '1px solid var(--border-color)', 
          cursor: ad.linkUrl ? 'pointer' : 'default',
          position: 'relative'
        }}
        onClick={() => ad.linkUrl && window.open(ad.linkUrl, '_blank')}
      >
        <span style={{ position: 'absolute', top: '5px', right: '5px', background: 'rgba(0,0,0,0.6)', color: 'rgba(255,255,255,0.7)', fontSize: '9px', padding: '2px 5px', borderRadius: '3px', zIndex: 1, fontWeight: 'bold' }}>
          AD
        </span>
        <AdContent />
      </div>
    );
  };

  const increaseFont = () => {
    if (fontSize < 28) setFontSize(prev => prev + 2);
  };
  
  const decreaseFont = () => {
    if (fontSize > 14) setFontSize(prev => prev - 2);
  };

  const handleLike = async () => {
    if (hasLiked) return;
    try {
      const res = await fetch(`/api/news/${id}/like`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setLikes(data.likes);
        setHasLiked(true);
      }
    } catch (err) {
      console.error('Error liking article:', err);
    }
  };

  const shareUrl = `${window.location.protocol}//${window.location.host}/news/${id}`;

  const handleShareClick = async (platformUrl) => {
    window.open(platformUrl, '_blank');
    try {
      const res = await fetch(`/api/news/${id}/share`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setShares(data.shares);
      }
    } catch (err) {
      console.error('Error recording share:', err);
    }
  };

  const handleCopyLink = async () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    try {
      const res = await fetch(`/api/news/${id}/share`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setShares(data.shares);
      }
    } catch (err) {
      console.error('Error recording share from link copy:', err);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newCommentName.trim() || !newCommentText.trim()) return;
    
    try {
      const res = await fetch(`/api/news/${id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: newCommentName,
          text: newCommentText
        })
      });
      if (res.ok) {
        const updatedComments = await res.json();
        setComments(updatedComments);
        setNewCommentName('');
        setNewCommentText('');
      } else {
        console.error('Failed to submit comment');
      }
    } catch (err) {
      console.error('Error submitting comment:', err);
    }
  };

  useEffect(() => {
    const fetchNewsDetail = async () => {
      try {
        setLoading(true);
        // Fetch specific article
        const res = await fetch(`/api/news/${id}`);
        if (res.ok) {
          const data = await res.json();
          setNews(data);
          setComments(data.comments || []);
          setLikes(data.likes || 0);
          setShares(data.shares || 0);

          // Fetch related articles (excluding current)
          const relRes = await fetch('/api/news?limit=6');
          if (relRes.ok) {
            const relData = await relRes.json();
            setRelatedNews(relData.filter(item => item._id !== id));
          }
        } else {
          // Redirect to home if article not found
          navigate('/');
        }
      } catch (err) {
        console.error('Error fetching article detail:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNewsDetail();
  }, [id, navigate]);

  useEffect(() => {
    if (news) {
      document.title = `${language === 'en' ? news.titleEn : news.titleHi} | City Samachar Digital`;
      // Update description tag in document head
      let descMeta = document.querySelector('meta[name="description"]');
      if (!descMeta) {
        descMeta = document.createElement('meta');
        descMeta.name = 'description';
        document.head.appendChild(descMeta);
      }
      descMeta.content = language === 'en' ? news.summaryEn : news.summaryHi;
    }
  }, [news, language]);

  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '100px 0', fontSize: '18px', color: 'var(--color-text-secondary)' }}>
        {t('loading')}
      </div>
    );
  }

  if (!news) return null;

  const title = language === 'en' ? news.titleEn : news.titleHi;
  const content = language === 'en' ? news.contentEn : news.contentHi;
  const categoryName = news.categories && news.categories.length > 0 
    ? (language === 'en' ? news.categories[0].nameEn : news.categories[0].nameHi) 
    : '';

  const subName = news.subdivision && news.subdivision !== 'None'
    ? (language === 'en' ? news.subdivision : t(news.subdivision.toLowerCase()))
    : '';

  // Get Youtube ID
  const getYoutubeEmbedUrl = (url) => {
    if (!url) return '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : '';
  };

  const formattedDate = new Date(news.createdAt).toLocaleDateString(
    language === 'en' ? 'en-US' : 'hi-IN',
    { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
  );

  return (
    <div className="container" style={{ marginTop: '30px' }}>
      {/* Back button */}
      <button 
        onClick={() => navigate(-1)}
        style={{ 
          background: 'transparent', 
          border: 'none', 
          color: 'var(--color-text-secondary)', 
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontWeight: 600,
          marginBottom: '20px',
          fontSize: '15px'
        }}
        className="back-btn"
      >
        <ArrowLeft size={16} />
        {language === 'en' ? 'Go Back' : 'पीछे जाएं'}
      </button>

      <div className="detail-layout">
        
        {/* Main Article Side */}
        <div>
          <article>
            <div className="article-header">
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {categoryName && (
                  <span className="card-tag">{categoryName}</span>
                )}
                {subName && (
                  <span className="card-tag" style={{ background: 'var(--color-secondary)' }}>
                    <MapPin size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                    {subName}
                  </span>
                )}
              </div>
              <h1 className="article-title">{title}</h1>
              <div className="article-meta-info" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Calendar size={14} />
                    {formattedDate}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Eye size={14} />
                    {news.views || 0} {t('views')}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: hasLiked ? 'default' : 'pointer', color: hasLiked ? '#ef4444' : 'inherit', transition: 'color 0.2s' }} onClick={handleLike}>
                    <ThumbsUp size={14} style={{ fill: hasLiked ? '#ef4444' : 'none' }} />
                    {likes} {language === 'en' ? 'Likes' : 'पसंद'}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Share2 size={14} />
                    {shares} {language === 'en' ? 'Shares' : 'शेयर'}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                    {language === 'en' ? 'Text Size:' : 'अक्षर आकार:'}
                  </span>
                  <button className="resizer-btn" onClick={decreaseFont}>A-</button>
                  <span style={{ fontSize: '14px', fontWeight: 'bold' }}>{fontSize}px</span>
                  <button className="resizer-btn" onClick={increaseFont}>A+</button>
                </div>
              </div>
            </div>

            {/* Images display */}
            {news.images && news.images.length > 0 && (
              <div className="article-main-image">
                <LazyImage src={news.images[0]} alt={title} />
              </div>
            )}

            {/* Main content body */}
            <div className="article-content" style={{ fontSize: `${fontSize}px` }}>
              {content.split('\n\n').map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>

            {/* Social Share Bar */}
            <div style={{ marginTop: '30px', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', padding: '15px 0' }}>
              <span style={{ fontSize: '14px', fontWeight: '800', color: 'var(--color-text-primary)', textTransform: 'uppercase', display: 'block', marginBottom: '10px' }}>
                {language === 'en' ? 'Share this article:' : 'इस ख़बर को शेयर करें:'}
              </span>
              <div className="share-bar">
                <button className="share-btn fb" onClick={() => handleShareClick(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`)}>
                  Facebook
                </button>
                <button className="share-btn tw" onClick={() => handleShareClick(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(shareUrl)}`)}>
                  Twitter / X
                </button>
                <button className="share-btn wa" onClick={() => handleShareClick(`https://api.whatsapp.com/send?text=${encodeURIComponent(title + ' ' + shareUrl)}`)}>
                  WhatsApp
                </button>
                <button className="share-btn link" onClick={handleCopyLink}>
                  {copied ? (language === 'en' ? 'Copied!' : 'कॉपी हो गया!') : (language === 'en' ? 'Copy Link' : 'लिंक कॉपी करें')}
                </button>
              </div>
            </div>

            {/* Video embed if present */}
            {news.videoUrl && (
              <div style={{ marginTop: '40px' }}>
                <h3 style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Video size={20} style={{ color: 'var(--color-primary)' }} />
                  {language === 'en' ? 'Report Bulletin / Video' : 'समाचार रिपोर्ट / वीडियो'}
                </h3>
                <div className="video-container">
                  <iframe
                    src={getYoutubeEmbedUrl(news.videoUrl)}
                    title={title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              </div>
            )}

            {/* Comments Section */}
            <div className="comments-section">
              <h3 style={{ fontSize: '18px', borderBottom: '2px solid var(--color-primary)', paddingBottom: '6px', marginBottom: '20px', textTransform: 'uppercase' }}>
                {language === 'en' ? 'Comments' : 'पाठकों की टिप्पणियाँ'} ({comments.length})
              </h3>
              
              {/* Comment Form */}
              <form onSubmit={handleCommentSubmit} className="glass" style={{ padding: '20px', borderRadius: 'var(--border-radius-sm)', marginBottom: '30px' }}>
                <h4 style={{ fontSize: '14px', marginBottom: '15px' }}>
                  {language === 'en' ? 'Leave a Comment' : 'अपनी टिप्पणी लिखें'}
                </h4>
                <div className="form-group">
                  <label>{language === 'en' ? 'Your Name' : 'आपका नाम'}</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    required 
                    value={newCommentName}
                    onChange={(e) => setNewCommentName(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>{language === 'en' ? 'Your Comment' : 'आपकी टिप्पणी'}</label>
                  <textarea 
                    rows="4" 
                    className="form-control" 
                    required 
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                  ></textarea>
                </div>
                <button type="submit" className="btn" style={{ width: 'auto', padding: '10px 24px' }}>
                  {language === 'en' ? 'Submit Comment' : 'टिप्पणी भेजें'}
                </button>
              </form>

              {/* Comments List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {comments.map((comment, index) => (
                  <div key={index} className="comment-item">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="comment-author">{comment.name}</span>
                      <span className="comment-date">{comment.date}</span>
                    </div>
                    <p className="comment-text">{comment.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </article>
        </div>

        {/* Sidebar Related News */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          
          {/* Sidebar Ad Banner */}
          {renderAd('sidebar')}

          <div className="sidebar-panel">
            <h3 className="sidebar-title">
              <Newspaper size={18} style={{ color: 'var(--color-primary)' }} />
              {t('relatedNews')}
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {relatedNews.slice(0, 4).map((rel) => (
                <div key={rel._id} style={{ display: 'flex', gap: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '15px' }}>
                  <div style={{ width: '80px', height: '60px', borderRadius: '4px', overflow: 'hidden', flexShrink: 0, background: '#000' }}>
                    <img 
                      src={rel.images && rel.images.length > 0 ? rel.images[0] : 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=150&q=80'} 
                      alt={language === 'en' ? rel.titleEn : rel.titleHi}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: 600, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.3 }}>
                      <Link to={`/news/${rel._id}`} style={{ color: '#fff' }}>
                        {language === 'en' ? rel.titleEn : rel.titleHi}
                      </Link>
                    </h4>
                    <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', display: 'block', marginTop: '4px' }}>
                      {new Date(rel.createdAt).toLocaleDateString(language === 'en' ? 'en-US' : 'hi-IN')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>

      </div>
    </div>
  );
}
