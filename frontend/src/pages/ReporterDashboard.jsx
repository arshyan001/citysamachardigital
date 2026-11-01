import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { Plus, CheckCircle, Clock, XCircle, FileText, Upload, Image, Video, LogOut, RefreshCw, Send, AlertCircle, Eye, Calendar, Lock } from 'lucide-react';
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

// Hindi display names for districts
const DISTRICT_LABELS = {
  'Sant Kabir Nagar': 'संतकबीरनगर',
  'Kushinagar': 'कुशीनगर',
  'Basti': 'बस्ती',
  'Gorakhpur': 'गोरखपुर',
  'Siddharthnagar': 'सिद्धार्थनगर',
  'Maharajganj': 'महराजगंज',
  'Deoria': 'देवरिया',
  'Lucknow': 'लखनऊ',
  'Other': 'अन्य'
};

// District-specific sub-areas / tehsils
const DISTRICT_SUBDIVISIONS = {
  'Sant Kabir Nagar': [
    { value: 'None', label: 'सामान्य / पूरा जिला' },
    { value: 'Khalilabad', label: 'खलीलाबाद' },
    { value: 'Mehdawal', label: 'मेंहदावल' },
    { value: 'Dhanghata', label: 'धनघटा' }
  ],
  'Kushinagar': [
    { value: 'None', label: 'सामान्य / पूरा जिला' },
    { value: 'Padrauna', label: 'पडरौना' },
    { value: 'Hata', label: 'हाटा' },
    { value: 'Tamkuhi Raj', label: 'तमकुही राज' },
    { value: 'Kasya', label: 'कसया' },
    { value: 'Khadda', label: 'खड्डा' },
    { value: 'Fazilnagar', label: 'फाजिलनगर' }
  ],
  'Basti': [
    { value: 'None', label: 'सामान्य / पूरा जिला' },
    { value: 'Basti Sadar', label: 'बस्ती सदर' },
    { value: 'Harraiya', label: 'हर्रैया' },
    { value: 'Rudhauli', label: 'रुधौली' },
    { value: 'Bhanpur', label: 'भानपुर' }
  ],
  'Gorakhpur': [
    { value: 'None', label: 'सामान्य / पूरा जिला' },
    { value: 'Gorakhpur Sadar', label: 'गोरखपुर सदर' },
    { value: 'Chauri Chaura', label: 'चौरी चौरा' },
    { value: 'Sahjanwa', label: 'सहजनवा' },
    { value: 'Khajani', label: 'खजनी' },
    { value: 'Campierganj', label: 'कैंपियरगंज' },
    { value: 'Bansgaon', label: 'बांसगांव' },
    { value: 'Gola', label: 'गोला' }
  ],
  'Siddharthnagar': [
    { value: 'None', label: 'सामान्य / पूरा जिला' },
    { value: 'Naugarh', label: 'नौगढ़' },
    { value: 'Bansi', label: 'बांसी' },
    { value: 'Itwa', label: 'इटवा' },
    { value: 'Shohratgarh', label: 'शोहरतगढ़' },
    { value: 'Domariyaganj', label: 'डुमरियागंज' }
  ],
  'Maharajganj': [
    { value: 'None', label: 'सामान्य / पूरा जिला' },
    { value: 'Maharajganj Sadar', label: 'महराजगंज सदर' },
    { value: 'Nautanwa', label: 'नौतनवा' },
    { value: 'Nichlaul', label: 'निचलौल' },
    { value: 'Pharenda', label: 'फरेंदा' }
  ],
  'Deoria': [
    { value: 'None', label: 'सामान्य / पूरा जिला' },
    { value: 'Deoria Sadar', label: 'देवरिया सदर' },
    { value: 'Salempur', label: 'सलेमपुर' },
    { value: 'Barhaj', label: 'बरहज' },
    { value: 'Bhatpar Rani', label: 'भाटपार रानी' },
    { value: 'Rudrapur', label: 'रुद्रपुर' }
  ],
  'Lucknow': [
    { value: 'None', label: 'सामान्य / पूरा जिला' },
    { value: 'Lucknow Sadar', label: 'लखनऊ सदर' },
    { value: 'Bakshi Ka Talab', label: 'बख्शी का तालाब' },
    { value: 'Malihabad', label: 'मलिहाबाद' },
    { value: 'Mohanlalganj', label: 'मोहनलालगंज' },
    { value: 'Sarojini Nagar', label: 'सरोजिनी नगर' }
  ]
};

export default function ReporterDashboard() {
  const { language } = useLanguage();
  const navigate = useNavigate();

  // Route security check
  const token = sessionStorage.getItem('admin_token');
  const userRole = sessionStorage.getItem('user_role');
  const [userName, setUserName] = useState(sessionStorage.getItem('user_name') || 'संवाददाता');
  const [userPhoto, setUserPhoto] = useState(sessionStorage.getItem('user_photo') || '');
  const [userDesignation, setUserDesignation] = useState(sessionStorage.getItem('user_designation') || 'संवाददाता');
  const [assignedDistrict, setAssignedDistrict] = useState(sessionStorage.getItem('user_district') || 'Sant Kabir Nagar');

  useEffect(() => {
    if (!token) {
      navigate('/admin/login');
    } else if (userRole === 'admin') {
      navigate('/admin/dashboard');
    }
  }, [token, userRole, navigate]);

  // Sync latest reporter profile (district, photo, name) from backend
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/auth/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.district) {
            setAssignedDistrict(data.district);
            sessionStorage.setItem('user_district', data.district);
          }
          if (data.name) {
            setUserName(data.name);
            sessionStorage.setItem('user_name', data.name);
          }
          if (data.photoUrl) {
            setUserPhoto(data.photoUrl);
            sessionStorage.setItem('user_photo', data.photoUrl);
          }
          if (data.designation) {
            setUserDesignation(data.designation);
            sessionStorage.setItem('user_designation', data.designation);
          }
        }
      } catch (err) {
        console.error('Error fetching reporter profile:', err);
      }
    };
    if (token) fetchProfile();
  }, [token]);

  // Tab State
  const [activeTab, setActiveTab] = useState('create'); // 'create' | 'myNews'

  // News Form States (All Hindi-first, no English fields requested from reporter)
  const [titleHi, setTitleHi] = useState('');
  const [contentHi, setContentHi] = useState('');
  const [category, setCategory] = useState('');
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
        setMyNewsList(Array.isArray(data) ? data : []);
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
      Toast.fire({ icon: 'warning', title: 'कृपया समाचार का शीर्षक और पूरा विवरण भरें।' });
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('titleHi', titleHi.trim());
      // Automatically fallback English fields to Hindi so reporter never needs to type English
      formData.append('titleEn', titleHi.trim());
      formData.append('contentHi', contentHi.trim());
      formData.append('contentEn', contentHi.trim());
      formData.append('categories', JSON.stringify([category]));
      // Strictly send assigned district determined by admin
      formData.append('district', assignedDistrict);
      formData.append('subdivision', subdivision);
      formData.append('isBreaking', isBreaking);
      formData.append('videoUrl', videoUrl.trim());

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
          text: `आपकी खबर सफलतापूर्वक मुख्य संपादक (एडमिन) को भेज दी गई है। स्वीकृति के बाद यह ${DISTRICT_LABELS[assignedDistrict] || assignedDistrict} जिले के तहत आपके नाम और फ़ोटो के साथ प्रकाशित हो जाएगी।`,
          confirmButtonColor: 'var(--color-primary)'
        });

        // Reset form
        setTitleHi('');
        setContentHi('');
        setVideoUrl('');
        setSubdivision('None');
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

  // Get subdivisions list for this reporter's assigned district
  const availableSubdivisions = DISTRICT_SUBDIVISIONS[assignedDistrict] || [
    { value: 'None', label: 'सामान्य / पूरा जिला' }
  ];

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

              {/* Locked District Badge in Profile Header */}
              <span style={{
                background: 'rgba(234, 179, 8, 0.15)',
                color: '#eab308',
                border: '1px solid rgba(234, 179, 8, 0.4)',
                padding: '2px 10px',
                borderRadius: '12px',
                fontSize: '11px',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                📍 कार्यक्षेत्र: {DISTRICT_LABELS[assignedDistrict] || assignedDistrict}
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
              <strong>महत्वपूर्ण निर्देश:</strong> आपके द्वारा भेजी गई खबर पहले <strong>मुख्य संपादक (एडमिन)</strong> के पास समीक्षा के लिए जाएगी। एडमिन द्वारा स्वीकृत होने पर खबर आपके नाम और फोटो के साथ वेबसाइट पर लाइव प्रकाशित होगी।
            </span>
          </div>

          <form onSubmit={handleSubmitNews}>
            
            {/* Title (Headline) */}
            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 700, marginBottom: '6px', color: 'var(--color-text-primary)' }}>
                समाचार का शीर्षक (Headline) *
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

            {/* Categories & Area Select Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '18px' }}>
              
              {/* Category */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: 'var(--color-text-primary)' }}>
                  श्रेणी (Category) *
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

              {/* Locked District: Only Admin-Assigned District */}
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: 'var(--color-text-primary)' }}>
                  <Lock size={13} color="#eab308" />
                  निर्धारित ज़िला (कार्यक्षेत्र)
                </label>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(234, 179, 8, 0.35)',
                  borderRadius: '10px',
                  padding: '9px 12px',
                  color: 'var(--color-text-primary)',
                  fontWeight: 700,
                  fontSize: '14px',
                  minHeight: '40px'
                }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    📍 {DISTRICT_LABELS[assignedDistrict] || assignedDistrict}
                  </span>
                  <span style={{
                    fontSize: '11px',
                    color: '#eab308',
                    background: 'rgba(234, 179, 8, 0.15)',
                    border: '1px solid rgba(234, 179, 8, 0.3)',
                    padding: '2px 8px',
                    borderRadius: '6px',
                    fontWeight: 700
                  }}>
                    प्रशासन द्वारा निर्धारित
                  </span>
                </div>
                <small style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '4px', display: 'block' }}>
                  आप केवल अपने निर्धारित जिले ({DISTRICT_LABELS[assignedDistrict] || assignedDistrict}) के लिए ही खबर लगा सकते हैं।
                </small>
              </div>

              {/* Subdivision / Tehsil for Reporter's District */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: 'var(--color-text-primary)' }}>
                  तहसील / क्षेत्र (Subdivision)
                </label>
                <select
                  className="form-control"
                  value={subdivision}
                  onChange={(e) => setSubdivision(e.target.value)}
                >
                  {availableSubdivisions.map(sub => (
                    <option key={sub.value} value={sub.value}>{sub.label}</option>
                  ))}
                </select>
              </div>

            </div>

            {/* Content (Hindi) */}
            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 700, marginBottom: '6px', color: 'var(--color-text-primary)' }}>
                समाचार का पूरा विवरण *
              </label>
              <textarea
                className="form-control"
                rows="8"
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
                खबर की तस्वीरें (फ़ोटो अपलोड करें - अधिकतम 5)
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
                  यूट्यूब वीडियो लिंक (वैकल्पिक / Optional)
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
                  🔴 ब्रेकिंग न्यूज़ (महत्वपूर्ण ताज़ा खबर)
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
                cursor: isSubmitting ? 'wait' : 'pointer',
                borderRadius: '12px'
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
              style={{ padding: '8px 14px', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px', borderRadius: '10px' }}
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
                style={{ marginTop: '16px', padding: '8px 18px', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px', borderRadius: '10px' }}
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
                              समीक्षाधीन
                            </span>
                          )}
                          {isRejected && (
                            <span style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.4)', padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <XCircle size={12} />
                              अस्वीकृत
                            </span>
                          )}

                          {item.district && (
                            <span style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--color-text-secondary)', padding: '2px 8px', borderRadius: '8px', fontSize: '11px' }}>
                              📍 {DISTRICT_LABELS[item.district] || item.district}
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
                            textDecoration: 'none',
                            borderRadius: '8px'
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
