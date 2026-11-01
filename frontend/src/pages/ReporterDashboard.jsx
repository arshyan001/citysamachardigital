import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { Plus, CheckCircle, Clock, XCircle, FileText, Upload, Image, Video, LogOut, ArrowLeft, RefreshCw, Send, AlertCircle, Eye, ThumbsUp, Calendar } from 'lucide-react';
import Swal from 'sweetalert2';

const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.onmouseenter = Swal.stopTimer;
    toast.onmouseleave = Swal.resumeTimer;
  }
});

export default function ReporterDashboard() {
  const { language, t } = useLanguage();
  const navigate = useNavigate();

  // Route security check
  const token = sessionStorage.getItem('admin_token');
  const userRole = sessionStorage.getItem('user_role');
  const userName = sessionStorage.getItem('user_name') || 'संवाददाता';
  const userPhoto = sessionStorage.getItem('user_photo') || '';
  const userDesignation = sessionStorage.getItem('user_designation') || 'संवाददाता';

  useEffect(() => {
    if (!token) {
      navigate('/admin/login');
    } else if (userRole === 'admin') {
      navigate('/admin/dashboard');
    }
  }, [token, userRole, navigate]);

  // Tab State
  const [activeTab, setActiveTab] = useState('create'); // 'create' | 'myNews'

  // News Form States
  const [titleHi, setTitleHi] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [contentHi, setContentHi] = useState('');
  const [contentEn, setContentEn] = useState('');
  const [category, setCategory] = useState('');
  const [district, setDistrict] = useState('Sant Kabir Nagar');
  const [subdivision, setSubdivision] = useState('None');
  const [isBreaking, setIsBreaking] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Data States
  const [categories, setCategories] = useState([]);
  const [myNewsList, setMyNewsList] = useState([]);
  const [loadingMyNews, setLoadingMyNews] = useState(false);

  // Fetch Categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/news/categories');
        if (res.ok) {
          const data = await res.json();
          setCategories(data);
          if (data.length > 0) setCategory(data[0]._id);
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    fetchCategories();
  }, []);

  // Fetch My News
  const fetchMyNews = async () => {
    setLoadingMyNews(true);
    try {
      const res = await fetch('/api/news/my-news', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setMyNewsList(data);
      }
    } catch (err) {
      console.error('Error fetching my news:', err);
    } finally {
      setLoadingMyNews(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'myNews') {
      fetchMyNews();
    }
  }, [activeTab]);

  // Handle Multi-Image Selection
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 5) {
      Toast.fire({ icon: 'warning', title: 'अधिकतम 5 तस्वीरें ही चुनी जा सकती हैं।' });
      return;
    }
    setImageFiles(files);
    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  // Submit News for Approval
  const handleSubmitNews = async (e) => {
    e.preventDefault();
    if (!titleHi.trim() || !contentHi.trim()) {
      Toast.fire({ icon: 'warning', title: 'कृपया समाचार का शीर्षक और विवरण भरें।' });
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('titleHi', titleHi);
      formData.append('titleEn', titleEn || titleHi);
      formData.append('contentHi', contentHi);
      formData.append('contentEn', contentEn || contentHi);
      formData.append('categories', JSON.stringify([category]));
      formData.append('district', district);
      formData.append('subdivision', subdivision);
      formData.append('isBreaking', isBreaking);
      formData.append('videoUrl', videoUrl);

      imageFiles.forEach(file => {
        formData.append('images', file);
      });

      const res = await fetch('/api/news', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      let data = {};
      try {
        data = await res.json();
      } catch (parseErr) {
        console.warn('Failed to parse response as JSON:', parseErr);
      }

      if (res.ok) {
        Swal.fire({
          icon: 'success',
          title: 'समाचार समीक्षा के लिए भेजा गया!',
          text: 'आपकी खबर सफलतापूर्वक एडमिन को भेज दी गई है। एडमिन द्वारा समीक्षा और स्वीकृति (Approval) के बाद यह वेबसाइट पर लाइव हो जाएगी।',
          confirmButtonColor: 'var(--color-primary)'
        });

        // Reset form
        setTitleHi('');
        setTitleEn('');
        setContentHi('');
        setContentEn('');
        setVideoUrl('');
        setIsBreaking(false);
        setImageFiles([]);
        setImagePreviews([]);
        const fileInput = document.getElementById('reporterImageInput');
        if (fileInput) fileInput.value = '';

        // Switch to My News tab
        setActiveTab('myNews');
      } else {
        Toast.fire({ icon: 'error', title: data.message || 'समाचार भेजने में समस्या हुई।' });
      }
    } catch (err) {
      console.error('Error submitting news:', err);
      Toast.fire({ icon: 'error', title: 'सर्वर से कनेक्शन विफल रहा।' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.clear();
    window.dispatchEvent(new Event('storage'));
    navigate('/admin/login');
  };

  return (
    <div className="container" style={{ padding: '24px 12px 60px 12px', minHeight: '80vh' }}>
      
      {/* Top Profile Card / Header */}
      <div style={{
        background: 'var(--bg-card, #141b2d)',
        border: '1px solid var(--border-color)',
        borderRadius: '16px',
        padding: '20px',
        marginBottom: '24px',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {userPhoto ? (
            <img 
              src={userPhoto} 
              alt={userName} 
              style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--color-primary)' }}
            />
          ) : (
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--color-primary), #b91c1c)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '22px',
              fontWeight: 800
            }}>
              {userName.charAt(0)}
            </div>
          )}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 800, margin: 0, color: 'var(--color-text-primary)' }}>
                {userName}
              </h2>
              <span style={{
                background: 'rgba(34, 197, 94, 0.15)',
                color: '#22c55e',
                border: '1px solid rgba(34, 197, 94, 0.4)',
                padding: '2px 8px',
                borderRadius: '12px',
                fontSize: '11px',
                fontWeight: 700
              }}>
                {userDesignation}
              </span>
            </div>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--color-text-secondary)' }}>
              सिटी समाचार डिजिटल संवाददाता पैनल
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="btn btn-secondary"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 16px',
            fontSize: '13px',
            borderRadius: '10px'
          }}
        >
          <LogOut size={15} />
          लॉगआउट
        </button>
      </div>

      {/* Navigation Tabs */}
      <div style={{
        display: 'flex',
        gap: '10px',
        marginBottom: '24px',
        borderBottom: '1px solid var(--border-color)',
        paddingBottom: '12px',
        overflowX: 'auto'
      }}>
        <button
          onClick={() => setActiveTab('create')}
          style={{
            background: activeTab === 'create' ? 'var(--color-primary)' : 'transparent',
            color: activeTab === 'create' ? '#ffffff' : 'var(--color-text-secondary)',
            border: activeTab === 'create' ? 'none' : '1px solid var(--border-color)',
            padding: '10px 20px',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s',
            whiteSpace: 'nowrap'
          }}
        >
          <Plus size={16} />
          नई खबर लिखें
        </button>

        <button
          onClick={() => setActiveTab('myNews')}
          style={{
            background: activeTab === 'myNews' ? 'var(--color-primary)' : 'transparent',
            color: activeTab === 'myNews' ? '#ffffff' : 'var(--color-text-secondary)',
            border: activeTab === 'myNews' ? 'none' : '1px solid var(--border-color)',
            padding: '10px 20px',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s',
            whiteSpace: 'nowrap'
          }}
        >
          <FileText size={16} />
          मेरी खबरें ({myNewsList.length})
        </button>
      </div>

      {/* TAB 1: CREATE NEWS FORM */}
      {activeTab === 'create' && (
        <div style={{
          background: 'var(--bg-card, #141b2d)',
          border: '1px solid var(--border-color)',
          borderRadius: '18px',
          padding: '24px',
          boxShadow: 'var(--shadow-sm)'
        }}>
          
          <div style={{
            background: 'linear-gradient(135deg, rgba(239,68,68,0.1) 0%, rgba(59,130,246,0.06) 100%)',
            border: '1px dashed rgba(239,68,68,0.4)',
            borderRadius: '12px',
            padding: '12px 16px',
            marginBottom: '22px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '13px',
            color: 'var(--color-text-secondary)'
          }}>
            <AlertCircle size={20} color="var(--color-primary)" style={{ flexShrink: 0 }} />
            <span>
              <strong>महत्वपूर्ण निर्देश:</strong> आपके द्वारा भेजी गई खबर पहले <strong>मुख्य संपादक (एडमिन)</strong> के पास समीक्षा (Review) के लिए जाएगी। एडमिन द्वारा स्वीकृत होने पर खबर आपके नाम और फोटो के साथ वेबसाइट पर लाइव प्रकाशित होगी।
            </span>
          </div>

          <form onSubmit={handleSubmitNews}>
            
            {/* Title (Hindi) */}
            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 700, marginBottom: '6px', color: 'var(--color-text-primary)' }}>
                समाचार का शीर्षक (Hindi Headline) *
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="उदा: संतकबीरनगर में विकास कार्यों को लेकर हुई समीक्षा बैठक..."
                value={titleHi}
                onChange={(e) => setTitleHi(e.target.value)}
                required
                style={{ fontSize: '15px', fontWeight: 600 }}
              />
            </div>

            {/* Title (English - Optional) */}
            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: 'var(--color-text-secondary)' }}>
                शीर्षक अंग्रेज़ी में (English Headline - Optional)
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="Review meeting held regarding development works in Sant Kabir Nagar..."
                value={titleEn}
                onChange={(e) => setTitleEn(e.target.value)}
              />
            </div>

            {/* Categories & Area Select Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '18px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: 'var(--color-text-primary)' }}>
                  कैटेगरी (Category) *
                </label>
                <select
                  className="form-control"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                >
                  {categories.map(cat => (
                    <option key={cat._id} value={cat._id}>{cat.nameHi || cat.nameEn}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: 'var(--color-text-primary)' }}>
                  तहसील / क्षेत्र (Subdivision)
                </label>
                <select
                  className="form-control"
                  value={subdivision}
                  onChange={(e) => setSubdivision(e.target.value)}
                >
                  <option value="None">सामान्य (None)</option>
                  <option value="Khalilabad">खलीलाबाद (Khalilabad)</option>
                  <option value="Mehdawal">मेंहदावल (Mehdawal)</option>
                  <option value="Dhanghata">धनघटा (Dhanghata)</option>
                  <option value="Basti">बस्ती (Basti)</option>
                  <option value="Kushinagar">कुशीनगर (Kushinagar)</option>
                  <option value="Gorakhpur">गोरखपुर (Gorakhpur)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: 'var(--color-text-primary)' }}>
                  ज़िला (District)
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                />
              </div>
            </div>

            {/* Content (Hindi) */}
            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 700, marginBottom: '6px', color: 'var(--color-text-primary)' }}>
                मुख्य समाचार विवरण (Detailed News in Hindi) *
              </label>
              <textarea
                className="form-control"
                rows="7"
                placeholder="यहाँ खबर का पूरा विवरण लिखें..."
                value={contentHi}
                onChange={(e) => setContentHi(e.target.value)}
                required
                style={{ fontSize: '14px', lineHeight: 1.6 }}
              />
            </div>

            {/* Images Upload */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 700, marginBottom: '6px', color: 'var(--color-text-primary)' }}>
                खबर की तस्वीरें (Images - अधिकतम 5)
              </label>
              <input
                id="reporterImageInput"
                type="file"
                accept="image/*"
                multiple
                className="form-control"
                onChange={handleImageChange}
              />
              {imagePreviews.length > 0 && (
                <div style={{ display: 'flex', gap: '10px', marginTop: '12px', flexWrap: 'wrap' }}>
                  {imagePreviews.map((src, i) => (
                    <div key={i} style={{ position: 'relative', width: '80px', height: '80px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                      <img src={src} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Video URL & Breaking News */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: 'var(--color-text-secondary)' }}>
                  यूट्यूब वीडियो लिंक (YouTube Link - Optional)
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingTop: '24px' }}>
                <input
                  type="checkbox"
                  id="isBreakingCheck"
                  checked={isBreaking}
                  onChange={(e) => setIsBreaking(e.target.checked)}
                  style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--color-primary)' }}
                />
                <label htmlFor="isBreakingCheck" style={{ fontSize: '14px', fontWeight: 700, color: '#ef4444', cursor: 'pointer' }}>
                  🔴 ब्रेकिंग न्यूज़ (Breaking Alert)
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn"
              disabled={isSubmitting}
              style={{
                padding: '14px 28px',
                fontSize: '15px',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
                boxShadow: '0 4px 14px rgba(239,68,68,0.35)',
                cursor: isSubmitting ? 'wait' : 'pointer'
              }}
            >
              {isSubmitting ? (
                <>
                  <span style={{ width: '16px', height: '16px', border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.6s linear infinite' }} />
                  भेजा जा रहा है...
                </>
              ) : (
                <>
                  <Send size={18} />
                  📤 समीक्षा के लिए एडमिन को भेजें
                </>
              )}
            </button>

          </form>
        </div>
      )}

      {/* TAB 2: MY NEWS LIST */}
      {activeTab === 'myNews' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: 'var(--color-text-primary)' }}>
              मेरे द्वारा भेजी गई खबरें ({myNewsList.length})
            </h3>
            <button
              onClick={fetchMyNews}
              className="btn btn-secondary"
              style={{ padding: '8px 14px', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <RefreshCw size={14} />
              रिफ्रेश करें
            </button>
          </div>

          {loadingMyNews ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--color-text-secondary)' }}>
              खबरें लोड हो रही हैं...
            </div>
          ) : myNewsList.length === 0 ? (
            <div style={{
              background: 'var(--bg-card, #141b2d)',
              border: '1px solid var(--border-color)',
              borderRadius: '16px',
              padding: '40px 20px',
              textAlign: 'center',
              color: 'var(--color-text-secondary)'
            }}>
              <FileText size={40} style={{ opacity: 0.4, marginBottom: '12px' }} />
              <p style={{ margin: 0, fontSize: '15px', fontWeight: 600 }}>आपने अभी तक कोई खबर नहीं भेजी है।</p>
              <button
                onClick={() => setActiveTab('create')}
                className="btn"
                style={{ marginTop: '16px', padding: '8px 18px', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <Plus size={14} />
                पहली खबर लिखें
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {myNewsList.map((item) => {
                const isApproved = item.status === 'approved';
                const isPending = item.status === 'pending';
                const isRejected = item.status === 'rejected';

                return (
                  <div
                    key={item._id || item.id}
                    style={{
                      background: 'var(--bg-card, #141b2d)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '14px',
                      padding: '16px 20px',
                      display: 'flex',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '14px',
                      boxShadow: 'var(--shadow-sm)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: '1 1 300px' }}>
                      {item.images && item.images.length > 0 && (
                        <img
                          src={item.images[0]}
                          alt=""
                          style={{ width: '70px', height: '60px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }}
                        />
                      )}
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                          {/* Status Badge */}
                          {isApproved && (
                            <span style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.4)', padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <CheckCircle size={12} />
                              लाइव (स्वीकृत)
                            </span>
                          )}
                          {isPending && (
                            <span style={{ background: 'rgba(234,179,8,0.15)', color: '#eab308', border: '1px solid rgba(234,179,8,0.4)', padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <Clock size={12} />
                              समीक्षाधीन (Pending)
                            </span>
                          )}
                          {isRejected && (
                            <span style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.4)', padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <XCircle size={12} />
                              अस्वीकृत (Rejected)
                            </span>
                          )}

                          <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <Calendar size={12} />
                            {new Date(item.createdAt).toLocaleDateString('hi-IN')}
                          </span>
                        </div>

                        <h4 style={{ margin: '0 0 6px 0', fontSize: '15px', fontWeight: 700, color: 'var(--color-text-primary)', lineHeight: 1.4 }}>
                          {item.titleHi || item.titleEn}
                        </h4>

                        {isRejected && item.rejectionReason && (
                          <div style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px' }}>
                            कारण: {item.rejectionReason}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* View Button */}
                    <div>
                      {isApproved && (
                        <a
                          href={`/news/${item._id || item.id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-secondary"
                          style={{
                            padding: '6px 14px',
                            fontSize: '12px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            textDecoration: 'none'
                          }}
                        >
                          <Eye size={14} />
                          खबर देखें
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
