import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { Calendar, Eye, MapPin, ArrowLeft, Video, Newspaper, ThumbsUp, Share2, MessageSquare } from 'lucide-react';
import LazyImage from '../components/LazyImage';

export default function NewsDetail() {
  const { id } = useParams();
  const { t } = useLanguage();
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
  const [hasLiked, setHasLiked] = useState(() => {
    try {
      return localStorage.getItem(`liked_${id}`) === 'true';
    } catch {
      return false;
    }
  });

  const [commentLikes, setCommentLikes] = useState(() => {
    try {
      const saved = localStorage.getItem(`comment_likes_${id}`);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const toggleCommentLike = (index) => {
    setCommentLikes(prev => {
      const updated = { ...prev, [index]: !prev[index] };
      try {
        localStorage.setItem(`comment_likes_${id}`, JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  const getAvatarColor = (name) => {
    if (!name) return '#9ca3af';
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash) % 360;
    return `hsl(${hue}, 60%, 40%)`;
  };

  const handleReplyClick = (authorName) => {
    setNewCommentText(`@${authorName} `);
    const composerInput = document.querySelector('.fb-composer-text');
    if (composerInput) {
      composerInput.focus();
      composerInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleCommentBtnClick = () => {
    const composerInput = document.querySelector('.fb-composer-text');
    if (composerInput) {
      composerInput.focus();
      composerInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleFbShareBtnClick = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          url: shareUrl
        });
        const res = await fetch(`/api/news/${id}/share`, { method: 'POST' });
        if (res.ok) {
          const data = await res.json();
          setShares(data.shares);
        }
      } catch (err) {
        console.log('Share cancelled/failed', err);
      }
    } else {
      handleCopyLink();
    }
  };

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
          विज्ञापन
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
        try {
          localStorage.setItem(`liked_${id}`, 'true');
        } catch (e) {
          console.error(e);
        }
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
      document.title = `${news.titleHi} | सिटी समाचार डिजिटल`;
      // Update description tag in document head
      let descMeta = document.querySelector('meta[name="description"]');
      if (!descMeta) {
        descMeta = document.createElement('meta');
        descMeta.name = 'description';
        document.head.appendChild(descMeta);
      }
      descMeta.content = news.summaryHi;
    }
  }, [news]);

  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '100px 0', fontSize: '18px', color: 'var(--color-text-secondary)' }}>
        {t('loading')}
      </div>
    );
  }

  if (!news) return null;

  const title = news.titleHi;
  const content = news.contentHi;
  const categoryName = news.categories && news.categories.length > 0 
    ? news.categories[0].nameHi 
    : '';

  const subName = news.subdivision && news.subdivision !== 'None'
    ? t(news.subdivision.toLowerCase())
    : '';

  // Get Youtube ID
  const getYoutubeEmbedUrl = (url) => {
    if (!url) return '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\\&v=)([^#\\&\\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : '';
  };

  const formattedDate = new Date(news.createdAt).toLocaleDateString(
    'hi-IN',
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
        पीछे जाएं
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
                    {likes} पसंद
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Share2 size={14} />
                    {shares} शेयर
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                    अक्षर आकार:
                  </span>
                  <button className="resizer-btn" onClick={decreaseFont}>A-</button>
                  <span style={{ fontSize: '14px', fontWeight: 'bold' }}>{fontSize}px</span>
                  <button className="resizer-btn" onClick={increaseFont}>A+</button>
                </div>
              </div>
            </div>

            {/* Images display in grid */}
            {news.images && news.images.length > 0 && (
              <div className={`article-images-grid grid-count-${news.images.length > 3 ? '4-plus' : news.images.length}`}>
                {news.images.map((imgUrl, imgIndex) => (
                  <div key={imgIndex} className="article-grid-image-wrapper">
                    <LazyImage 
                      src={imgUrl} 
                      alt={`${title} - ${imgIndex + 1}`} 
                      style={{ objectFit: news.images.length === 1 ? 'contain' : 'cover', width: '100%', height: '100%' }}
                    />
                  </div>
                ))}
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
                इस ख़बर को शेयर करें:
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
                  {copied ? 'कॉपी हो गया!' : 'लिंक कॉपी करें'}
                </button>
              </div>
            </div>

            {/* Video embed if present */}
            {news.videoUrl && (
              <div style={{ marginTop: '40px' }}>
                <h3 style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Video size={20} style={{ color: 'var(--color-primary)' }} />
                  समाचार रिपोर्ट / वीडियो
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

            {/* Facebook Style Likes and Comments Widget */}
            <div className="fb-comments-container">
              {/* Stats Bar */}
              <div className="fb-stats-bar">
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    background: '#1877f2',
                    color: '#fff',
                  }}>
                    <ThumbsUp size={10} style={{ fill: '#fff', stroke: 'none' }} />
                  </div>
                  <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)', fontWeight: '600' }}>
                    {likes}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '12px', fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                  <span>{comments.length} टिप्पणियाँ</span>
                  {shares > 0 && <span>•</span>}
                  {shares > 0 && <span>{shares} शेयर</span>}
                </div>
              </div>

              {/* Action Bar */}
              <div className="fb-action-bar">
                <button 
                  className={`fb-action-btn ${hasLiked ? 'active' : ''}`} 
                  onClick={handleLike}
                  style={{ cursor: hasLiked ? 'default' : 'pointer' }}
                >
                  <ThumbsUp size={16} style={{ fill: hasLiked ? '#1877f2' : 'none' }} />
                  <span>पसंद करें</span>
                </button>
                <button className="fb-action-btn" onClick={handleCommentBtnClick}>
                  <MessageSquare size={16} />
                  <span>टिप्पणी करें</span>
                </button>
                <button className="fb-action-btn" onClick={handleFbShareBtnClick}>
                  <Share2 size={16} />
                  <span>
                    {copied ? 'कॉपी हो गया!' : 'शेयर करें'}
                  </span>
                </button>
              </div>

              {/* Comment Composer */}
              <form onSubmit={handleCommentSubmit} className="fb-comment-composer">
                <div className="fb-avatar" style={{ backgroundColor: getAvatarColor(newCommentName || 'Guest') }}>
                  {(newCommentName ? newCommentName.charAt(0) : 'U').toUpperCase()}
                </div>
                <div className="fb-composer-box">
                  <input 
                    type="text" 
                    className="fb-composer-name" 
                    placeholder="आपका नाम..." 
                    value={newCommentName}
                    onChange={(e) => setNewCommentName(e.target.value)}
                    required
                  />
                  <textarea 
                    className="fb-composer-text" 
                    placeholder="अपनी टिप्पणी लिखें..." 
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    rows="2"
                    required
                  />
                  <div className="fb-composer-footer">
                    <button 
                      type="submit" 
                      className={`fb-submit-btn ${(newCommentName.trim() && newCommentText.trim()) ? 'active' : ''}`}
                      disabled={!newCommentName.trim() || !newCommentText.trim()}
                    >
                      प्रकाशित करें
                    </button>
                  </div>
                </div>
              </form>

              {/* Comments List */}
              <div className="fb-comment-list">
                {comments.map((comment, index) => (
                  <div key={index} className="fb-comment-item">
                    <div className="fb-avatar" style={{ backgroundColor: getAvatarColor(comment.name) }}>
                      {(comment.name ? comment.name.charAt(0) : 'U').toUpperCase()}
                    </div>
                    <div className="fb-comment-bubble-wrapper">
                      <div className="fb-comment-bubble">
                        <span className="fb-comment-author">{comment.name}</span>
                        <p className="fb-comment-text">{comment.text}</p>
                      </div>
                      <div className="fb-comment-actions">
                        <button 
                          className={`fb-comment-action-link ${commentLikes[index] ? 'active' : ''}`}
                          onClick={() => toggleCommentLike(index)}
                        >
                          {commentLikes[index] ? 'पसंद किया' : 'पसंद'}
                        </button>
                        <span>•</span>
                        <button className="fb-comment-action-link" onClick={() => handleReplyClick(comment.name)}>
                          जवाब दें
                        </button>
                        <span>•</span>
                        <span className="fb-comment-date">{comment.date}</span>
                      </div>
                    </div>
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
                      alt={rel.titleHi}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: 600, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.3 }}>
                      <Link to={`/news/${rel._id}`} style={{ color: 'var(--color-text-primary)' }}>
                        {rel.titleHi}
                      </Link>
                    </h4>
                    <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', display: 'block', marginTop: '4px' }}>
                      {new Date(rel.createdAt).toLocaleDateString('hi-IN')}
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
