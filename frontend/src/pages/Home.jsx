import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import NewsCard from '../components/NewsCard';
import WeatherWidget from '../components/WeatherWidget';
import { Search, Play, Image, Video, Thermometer, Sun, Wind, CloudRain, Globe, Newspaper } from 'lucide-react';

export default function Home() {
  const { language, t } = useLanguage();
  const navigate = useNavigate();

  const [news, setNews] = useState([]);
  const [categories, setCategories] = useState([]);
  const [ads, setAds] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Mock weather data for Sant Kabir Nagar
  const weatherMock = {
    temp: '32°C',
    condition: language === 'en' ? 'Sunny' : 'धूपदार',
    humidity: '54%',
    wind: '12 km/h'
  };



  const [selectedZodiac, setSelectedZodiac] = useState('');
  const zodiacList = [
    { key: 'mesh', nameHi: 'मेष', nameEn: 'Aries' },
    { key: 'vrish', nameHi: 'वृष', nameEn: 'Taurus' },
    { key: 'mithun', nameHi: 'मिथुन', nameEn: 'Gemini' },
    { key: 'kark', nameHi: 'कर्क', nameEn: 'Cancer' },
    { key: 'singh', nameHi: 'सिंह', nameEn: 'Leo' },
    { key: 'kanya', nameHi: 'कन्या', nameEn: 'Virgo' },
    { key: 'tula', nameHi: 'तुला', nameEn: 'Libra' },
    { key: 'vrishchik', nameHi: 'वृश्चिक', nameEn: 'Scorpio' },
    { key: 'dhanu', nameHi: 'धनु', nameEn: 'Sagittarius' },
    { key: 'makar', nameHi: 'मकर', nameEn: 'Capricorn' },
    { key: 'kumbh', nameHi: 'कुंभ', nameEn: 'Aquarius' },
    { key: 'meen', nameHi: 'मीन', nameEn: 'Pisces' }
  ];

  const zodiacPredictions = {
    mesh: {
      hi: 'मेष: आज का दिन आपके लिए ऊर्जावान रहेगा। कार्यक्षेत्र में सफलता मिलेगी और नए अवसर प्राप्त होंगे। धन का आगमन हो सकता है।',
      en: 'Aries: Today will be energetic for you. You will get success in your workspace and find new opportunities.'
    },
    vrish: {
      hi: 'वृष: धन लाभ के योग बन रहे हैं। परिवार के साथ सुखद समय व्यतीत होगा। वाणी पर नियंत्रण रखें और क्रोध से बचें।',
      en: 'Taurus: Possibility of financial gains. Pleasant time will be spent with family. Keep control on your words.'
    },
    mithun: {
      hi: 'मिथुन: आज नए प्रोजेक्ट शुरू करने के लिए अच्छा दिन है। स्वास्थ्य का ध्यान रखें और यात्रा करते समय सावधानी बरतें।',
      en: 'Gemini: Good day to start new projects today. Take care of your health and avoid traveling unnecessarily.'
    },
    kark: {
      hi: 'कर्क: मानसिक शांति महसूस होगी। दोस्तों का सहयोग मिलेगा। व्यावसायिक क्षेत्र में प्रगति होगी और आर्थिक तंगी दूर होगी।',
      en: 'Cancer: You will feel mental peace. Support from friends will be there. Progress in business.'
    },
    singh: {
      hi: 'सिंह: आत्मविश्वास में वृद्धि होगी। कोई नया शुभ समाचार मिल सकता है। अटके हुए काम पूरे होंगे। रिश्तेदारों से मदद मिलेगी।',
      en: 'Leo: Confidence will increase. You may receive some new updates. Pending work will be completed.'
    },
    kanya: {
      hi: 'कन्या: आज आपको अपनी मेहनत का फल मिलेगा। सामाजिक कार्यों में रुचि बढ़ेगी। पारिवारिक सुख मिलेगा। नए संबंध बनेंगे।',
      en: 'Virgo: Today you will get the fruits of your hard work. Interest in social work will increase.'
    },
    tula: {
      hi: 'तुला: व्यापार में सुधार होगा। किसी करीबी से शुभ समाचार मिल सकता है। स्वास्थ्य अच्छा रहेगा। पुराने मित्रों से भेंट होगी।',
      en: 'Libra: Business will improve. Good news from a close one is expected. Health will remain good.'
    },
    vrishchik: {
      hi: 'वृश्चिक: थोड़ा संभलकर चलने का दिन है। विवादों से दूर रहें। खर्चों में बढ़ोतरी हो सकती है। मन को शांत रखें।',
      en: 'Scorpio: A day to walk cautiously. Stay away from disputes. Expenses might increase.'
    },
    dhanu: {
      hi: 'धनु: करियर में नए मुकाम हासिल होंगे। धार्मिक यात्रा के योग हैं। संबंध मधुर होंगे। स्वास्थ्य में सुधार होगा।',
      en: 'Sagittarius: New achievements in career. Travel to religious places is likely. Relationships will sweeten.'
    },
    makar: {
      hi: 'मकर: कार्यस्थल पर सराहना मिलेगी। पुराना ऋण चुकाने में सफल होंगे। मित्रों से मुलाकात होगी। उत्साह बना रहेगा।',
      en: 'Capricorn: Appreciation at the workplace. Successful in clearing old debts. Meeting with friends.'
    },
    kumbh: {
      hi: 'कुंभ: रचनात्मक कार्यों में रुचि बढ़ेगी। आर्थिक स्थिति मजबूत होगी। नए मित्र बनेंगे। व्यापारिक यात्राएं सफल होंगी।',
      en: 'Aquarius: Interest in creative works will grow. Financial position will strengthen. New friends will be made.'
    },
    meen: {
      hi: 'मीन: आज आपकी यात्रा सुखद रहेगी। शिक्षा के क्षेत्र में सफलता मिलेगी। परिवार का पूर्ण सहयोग रहेगा।',
      en: 'Pisces: Your travel will be pleasant today. Success in education field. Family support will be there.'
    }
  };

  // Advertisement Helpers
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

  const renderAd = (slot) => {
    const slotAds = ads.filter(ad => ad.slot === slot);
    if (slotAds.length === 0) return null;

    // Rotate ads randomly
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

  // Opinion Poll State & Handlers
  const [poll, setPoll] = useState(null);
  const [hasVotedPoll, setHasVotedPoll] = useState(false);

  const fetchPollData = async () => {
    try {
      const res = await fetch('/api/poll');
      if (res.ok) {
        const data = await res.json();
        setPoll(data);
        const votedPolls = JSON.parse(localStorage.getItem('voted_polls') || '[]');
        if (data && votedPolls.includes(data._id)) {
          setHasVotedPoll(true);
        } else {
          setHasVotedPoll(false);
        }
      }
    } catch (err) {
      console.error('Error fetching poll:', err);
    }
  };

  const handlePollVote = async (optionNum) => {
    if (!poll) return;
    try {
      const res = await fetch('/api/poll/vote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ option: optionNum })
      });
      if (res.ok) {
        const data = await res.json();
        setPoll(data);
        setHasVotedPoll(true);
        const votedPolls = JSON.parse(localStorage.getItem('voted_polls') || '[]');
        votedPolls.push(poll._id);
        localStorage.setItem('voted_polls', JSON.stringify(votedPolls));
      }
    } catch (err) {
      console.error('Error submitting vote:', err);
    }
  };

  useEffect(() => {
    fetchPollData();
    fetchAds();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch categories
        const catRes = await fetch('/api/news/categories');
        if (catRes.ok) {
          const catData = await catRes.json();
          setCategories(catData);
        }

        // Fetch news
        let newsUrl = '/api/news';
        const params = [];
        if (selectedCategory) {
          params.push(`category=${selectedCategory}`);
        }
        if (searchQuery) {
          params.push(`search=${encodeURIComponent(searchQuery)}`);
        }
        if (params.length > 0) {
          newsUrl += `?${params.join('&')}`;
        }

        const newsRes = await fetch(newsUrl);
        if (newsRes.ok) {
          const newsData = await newsRes.json();
          setNews(newsData);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedCategory, searchQuery]);

  // Extract hero news (latest article)
  const heroNews = news[0];
  const regularNews = news.slice(1);

  // Extract news with videos
  const videoNews = news.filter((n) => n.videoUrl);

  // Extract images from all news for a photo gallery
  const galleryImages = news
    .filter((n) => n.images && n.images.length > 0)
    .map((n) => ({
      newsId: n._id,
      title: language === 'en' ? n.titleEn : n.titleHi,
      url: n.images[0],
    }))
    .slice(0, 6);

  // Extract news for shelves (only used in default view)
  const politicsNews = news.filter(n => n.categories && n.categories.some(c => c.nameEn === 'Politics')).slice(0, 3);
  const nationalNews = news.filter(n => n.categories && n.categories.some(c => c.nameEn === 'National')).slice(0, 3);
  const sportsNews = news.filter(n => n.categories && n.categories.some(c => c.nameEn === 'Sports')).slice(0, 3);
  const localNewsShelf = news.filter(n => n.categories && n.categories.some(c => c.nameEn === 'Local News')).slice(0, 3);
  const crimeNews = news.filter(n => n.categories && n.categories.some(c => c.nameEn === 'Crime')).slice(0, 3);

  // Get Youtube ID
  const getYoutubeEmbedUrl = (url) => {
    if (!url) return '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : '';
  };

  const renderCategoryShelf = (shelfNews, titleEn, titleHi) => {
    if (shelfNews.length === 0) return null;
    return (
      <div style={{ marginBottom: '40px' }}>
        <div className="category-shelf-header">
          <h3 className="category-shelf-title">
            {language === 'en' ? titleEn : titleHi}
          </h3>
        </div>
        <div className="grid grid-cols-3" style={{ gap: '20px' }}>
          {shelfNews.map(n => (
            <NewsCard key={n._id} news={n} />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="container" style={{ marginTop: '20px' }}>
      {/* Search and Categories Bar */}
      <div className="glass" style={{ display: 'flex', gap: '15px', padding: '15px', borderRadius: 'var(--border-radius-md)', marginBottom: '30px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        
        {/* Search */}
        <div style={{ position: 'relative', width: '300px', maxWidth: '100%' }}>
          <input
            type="text"
            placeholder={t('searchPlaceholder')}
            className="form-control"
            style={{ paddingLeft: '40px', height: '40px' }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '11px', color: 'var(--color-text-secondary)' }} />
        </div>

        {/* Categories Pills */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px', maxWidth: '100%' }}>
          <button
            className={`lang-toggle ${selectedCategory === '' ? 'active' : ''}`}
            style={{ 
              background: selectedCategory === '' ? 'var(--color-primary)' : 'transparent', 
              borderColor: selectedCategory === '' ? 'var(--color-primary)' : 'var(--border-color)',
              color: '#fff',
              whiteSpace: 'nowrap'
            }}
            onClick={() => setSelectedCategory('')}
          >
            {language === 'en' ? 'All News' : 'सभी ख़बरें'}
          </button>
          
          {categories.map((cat) => (
            <button
              key={cat._id}
              className={`lang-toggle ${selectedCategory === cat._id ? 'active' : ''}`}
              style={{
                background: selectedCategory === cat._id ? 'var(--color-primary)' : 'transparent',
                borderColor: selectedCategory === cat._id ? 'var(--color-primary)' : 'var(--border-color)',
                color: '#fff',
                whiteSpace: 'nowrap'
              }}
              onClick={() => setSelectedCategory(cat._id)}
            >
              {language === 'en' ? cat.nameEn : cat.nameHi}
            </button>
          ))}
        </div>
      </div>

      {/* Top Banner Advertisement Slot */}
      {renderAd('top')}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '100px 0', fontSize: '18px', color: 'var(--color-text-secondary)' }}>
          {t('loading')}
        </div>
      ) : (
        <>
          {news.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '100px 0', fontSize: '18px', color: 'var(--color-text-secondary)' }}>
              {t('noNews')}
            </div>
          ) : (
            <>
              {/* Dynamic Theme news view */}
              {selectedCategory || searchQuery ? (
                /* Filtered/Search View */
                <div style={{ margin: '30px 0' }}>
                  <div className="category-shelf-header">
                    <h3 className="category-shelf-title">
                      {selectedCategory 
                        ? (categories.find(c => c._id === selectedCategory)?.[language === 'en' ? 'nameEn' : 'nameHi'] || t('latestNews')) 
                        : (language === 'en' ? `Search Results for "${searchQuery}"` : `"${searchQuery}" के लिए खोज परिणाम`)}
                    </h3>
                  </div>
                  <div className="grid grid-cols-3" style={{ gap: '20px' }}>
                    {news.map(n => (
                      <NewsCard key={n._id} news={n} />
                    ))}
                  </div>
                </div>
              ) : (
                /* Newspaper Dashboard View (Dainik Jagran Style) */
                <div className="home-layout-grid">
                  
                  {/* Left Column (News Stories & Category Shelves) */}
                  <div>
                    {/* Hero & Badi Khabren (Headline List) side by side */}
                    <div className="hero-headlines-grid">
                      {/* Hero Card */}
                      {heroNews && (
                        <div className="hero-main-card" style={{ cursor: 'pointer', height: '420px' }} onClick={() => navigate(`/news/${heroNews._id}`)}>
                          <img 
                            src={heroNews.images && heroNews.images.length > 0 ? heroNews.images[0] : 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80'} 
                            alt={language === 'en' ? heroNews.titleEn : heroNews.titleHi} 
                          />
                          <div className="card-overlay"></div>
                          <div className="card-content" style={{ padding: '20px' }}>
                            <span className="card-tag">{t('latestNews')}</span>
                            <h2 style={{ fontSize: '22px', textShadow: '0 2px 4px rgba(0,0,0,0.6)' }}>
                              {language === 'en' ? heroNews.titleEn : heroNews.titleHi}
                            </h2>
                            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                              {language === 'en' ? heroNews.summaryEn : heroNews.summaryHi}
                            </p>
                            <div className="card-meta">
                              <span>{new Date(heroNews.createdAt).toLocaleDateString(language === 'en' ? 'en-US' : 'hi-IN')}</span>
                              <span>•</span>
                              <span>{heroNews.views || 0} {t('views')}</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Headlines List */}
                      <div className="glass" style={{ padding: '15px', borderRadius: 'var(--border-radius-md)', display: 'flex', flexDirection: 'column', height: '420px' }}>
                        <h3 style={{ fontSize: '15px', borderBottom: '2px solid var(--color-primary)', paddingBottom: '6px', marginBottom: '12px', textTransform: 'uppercase', color: 'var(--color-text-primary)' }}>
                          {language === 'en' ? 'Top Stories' : 'बड़ी ख़बरें'}
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flexGrow: 1, overflowY: 'auto' }}>
                          {news.slice(1, 5).map((item, idx) => (
                            <div key={item._id} style={{ display: 'flex', gap: '8px', borderBottom: idx === 3 ? 'none' : '1px solid var(--border-color)', paddingBottom: '10px', cursor: 'pointer' }} onClick={() => navigate(`/news/${item._id}`)}>
                              <span style={{ color: 'var(--color-primary)', fontWeight: '800', fontSize: '16px' }}>•</span>
                              <div>
                                <h4 style={{ fontSize: '13px', fontWeight: '600', lineHeight: '1.3', display: '-webkit-box', WebkitLineClamp: '2', WebkitBoxOrient: 'vertical', overflow: 'hidden', color: 'var(--color-text-primary)' }}>
                                  {language === 'en' ? item.titleEn : item.titleHi}
                                </h4>
                                <span style={{ fontSize: '10px', color: 'var(--color-text-secondary)' }}>
                                  {new Date(item.createdAt).toLocaleDateString(language === 'en' ? 'en-US' : 'hi-IN')}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Category Shelves */}
                    {renderCategoryShelf(localNewsShelf, 'Local News', 'स्थानीय समाचार')}
                    {renderCategoryShelf(nationalNews, 'National News', 'राष्ट्रीय समाचार')}
                    {renderCategoryShelf(politicsNews, 'Politics', 'राजनीति समाचार')}
                    {renderCategoryShelf(sportsNews, 'Sports News', 'खेल जगत')}
                    {renderCategoryShelf(crimeNews, 'Crime News', 'अपराध जगत')}
                    {renderCategoryShelf(politicsNews.length === 0 ? regularNews.slice(0, 3) : [], 'More News', 'अन्य ख़बरें')}

                    {/* Video Bulletins inside left block */}
                    {videoNews.length > 0 && (
                      <section className="media-section" style={{ marginTop: '40px' }}>
                        <div className="section-header">
                          <h3 className="section-title-line" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Video size={20} style={{ color: 'var(--color-primary)' }} />
                            {t('videoNews')}
                          </h3>
                        </div>

                        <div className="grid grid-cols-2" style={{ gap: '20px' }}>
                          {videoNews.slice(0, 2).map((vn) => (
                            <div key={vn._id} className="glass" style={{ padding: '12px', borderRadius: 'var(--border-radius-md)' }}>
                              <div className="video-container">
                                <iframe
                                  src={getYoutubeEmbedUrl(vn.videoUrl)}
                                  title={language === 'en' ? vn.titleEn : vn.titleHi}
                                  frameBorder="0"
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                  allowFullScreen
                                ></iframe>
                              </div>
                              <h4 
                                style={{ marginTop: '10px', fontSize: '14px', cursor: 'pointer', color: 'var(--color-text-primary)' }}
                                onClick={() => navigate(`/news/${vn._id}`)}
                              >
                                {language === 'en' ? vn.titleEn : vn.titleHi}
                              </h4>
                            </div>
                          ))}
                        </div>
                      </section>
                    )}
                  </div>

                  {/* Right Column (Widgets Sidebar) */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    
                    {/* Sidebar Ad Slot */}
                    {renderAd('sidebar')}

                    {/* Live Location Weather Widget */}
                    <WeatherWidget />

                    {/* Rashifal (Horoscope) Widget */}
                    <div className="widget-card">
                      <div className="widget-header">
                        <Globe size={16} style={{ color: '#8b5cf6' }} />
                        {language === 'en' ? 'Daily Horoscope' : 'दैनिक राशिफल'}
                      </div>
                      <select 
                        className="horoscope-select" 
                        value={selectedZodiac}
                        onChange={(e) => setSelectedZodiac(e.target.value)}
                      >
                        <option value="">
                          {language === 'en' ? '-- Select Zodiac Sign --' : '-- अपनी राशि चुनें --'}
                        </option>
                        {zodiacList.map(z => (
                          <option key={z.key} value={z.key}>
                            {language === 'en' ? z.nameEn : z.nameHi}
                          </option>
                        ))}
                      </select>
                      {selectedZodiac && (
                        <div className="horoscope-content">
                          {zodiacPredictions[selectedZodiac][language === 'en' ? 'en' : 'hi']}
                        </div>
                      )}
                    </div>

                    {/* Opinion Poll Widget */}
                    {poll && (
                      <div className="widget-card">
                        <div className="widget-header">
                          <Newspaper size={16} style={{ color: 'var(--color-primary)' }} />
                          {language === 'en' ? 'Opinion Poll' : 'ओपिनियन पोल'}
                        </div>
                        <p style={{ fontSize: '13px', fontWeight: '600', marginBottom: '12px', color: 'var(--color-text-primary)' }}>
                          {language === 'en' ? poll.questionEn : poll.questionHi}
                        </p>
                        
                        {!hasVotedPoll ? (
                          <div>
                            <button className="poll-option-btn" onClick={() => handlePollVote(1)}>
                              {language === 'en' ? poll.option1En : poll.option1Hi}
                            </button>
                            <button className="poll-option-btn" onClick={() => handlePollVote(2)}>
                              {language === 'en' ? poll.option2En : poll.option2Hi}
                            </button>
                            {(poll.option3En || poll.option3Hi) && (
                              <button className="poll-option-btn" onClick={() => handlePollVote(3)}>
                                {language === 'en' ? poll.option3En : poll.option3Hi}
                              </button>
                            )}
                          </div>
                        ) : (
                          <div style={{ background: 'rgba(255,255,255,0.01)', padding: '10px', borderRadius: 'var(--border-radius-sm)' }}>
                            {(() => {
                              const totalVotes = (poll.votesOption1 || 0) + (poll.votesOption2 || 0) + ((poll.option3En || poll.option3Hi) ? (poll.votesOption3 || 0) : 0);
                              const pct1 = totalVotes > 0 ? Math.round(((poll.votesOption1 || 0) / totalVotes) * 100) : 0;
                              const pct2 = totalVotes > 0 ? Math.round(((poll.votesOption2 || 0) / totalVotes) * 100) : 0;
                              const pct3 = totalVotes > 0 ? Math.round(((poll.votesOption3 || 0) / totalVotes) * 100) : 0;

                              return (
                                <>
                                  <div className="poll-result-bar">
                                    <div className="poll-result-label">
                                      <span>{language === 'en' ? poll.option1En : poll.option1Hi}</span>
                                      <span>{pct1}%</span>
                                    </div>
                                    <div className="poll-bar-bg">
                                      <div className="poll-bar-fill" style={{ width: `${pct1}%` }}></div>
                                    </div>
                                  </div>
                                  <div className="poll-result-bar">
                                    <div className="poll-result-label">
                                      <span>{language === 'en' ? poll.option2En : poll.option2Hi}</span>
                                      <span>{pct2}%</span>
                                    </div>
                                    <div className="poll-bar-bg">
                                      <div className="poll-bar-fill" style={{ width: `${pct2}%`, background: '#64748b' }}></div>
                                    </div>
                                  </div>
                                  {(poll.option3En || poll.option3Hi) && (
                                    <div className="poll-result-bar">
                                      <div className="poll-result-label">
                                        <span>{language === 'en' ? poll.option3En : poll.option3Hi}</span>
                                        <span>{pct3}%</span>
                                      </div>
                                      <div className="poll-bar-bg">
                                        <div className="poll-bar-fill" style={{ width: `${pct3}%`, background: '#475569' }}></div>
                                      </div>
                                    </div>
                                  )}
                                  <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', display: 'block', textAlign: 'center', marginTop: '8px' }}>
                                    {language === 'en' ? 'Thank you for your vote!' : 'वोट करने के लिए धन्यवाद!'}
                                  </span>
                                </>
                              );
                            })()}
                          </div>
                        )}
                      </div>
                    )}

                    {/* LIVE Broadcast widget */}
                    <div className="sidebar-panel" style={{ background: 'linear-gradient(135deg, #ef4444 0%, #8b0000 100%)', color: '#fff', border: 'none' }}>
                      <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '8px' }}>
                        {language === 'en' ? 'LIVE BROADCAST' : 'सीधा प्रसारण'}
                      </h3>
                      <p style={{ fontSize: '13px', opacity: 0.9, marginBottom: '15px' }}>
                        {language === 'en' 
                          ? 'Watch our daily video bulletin and ground reports live from Khalilabad and subdivision desks.' 
                          : 'खलीलाबाद और उपखंड डेस्क से सीधे हमारी दैनिक वीडियो समाचार बुलेटिन और ग्राउंड रिपोर्ट देखें।'}
                      </p>
                      <button 
                        onClick={() => navigate('/city/All')}
                        style={{ 
                          background: '#fff', 
                          color: '#8b0000', 
                          border: 'none', 
                          padding: '8px 16px', 
                          borderRadius: '4px', 
                          fontWeight: 700, 
                          fontSize: '12px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <Play size={12} fill="#8b0000" />
                        {language === 'en' ? 'Watch Local News' : 'स्थानीय समाचार देखें'}
                      </button>
                    </div>
                  </div>

                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
