import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { Plus, Edit, Trash2, Mail, FolderPlus, Newspaper, CheckCircle, XCircle, FileText, ChevronRight, Languages, BarChart2, MessageSquare, ChevronDown, LogOut, Settings, Image, Globe, Share2, ThumbsUp, Eye } from 'lucide-react';
import Swal from 'sweetalert2';

export default function AdminDashboard() {
  const { language, t } = useLanguage();
  const navigate = useNavigate();

  // Route security check
  const token = sessionStorage.getItem('admin_token');
  useEffect(() => {
    if (!token) {
      navigate('/admin/login');
    }
  }, [token, navigate]);

  // States
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'analytics';
  const setActiveTab = (tabName) => {
    setSearchParams({ tab: tabName });
  };
  const [analyticsData, setAnalyticsData] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [newsList, setNewsList] = useState([]);
  const [categories, setCategories] = useState([]);
  const [messages, setMessages] = useState([]);
  const [commentsList, setCommentsList] = useState([]);
  const [isEditMenuOpen, setIsEditMenuOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Ads States
  const [adsList, setAdsList] = useState([]);
  const [adTitle, setAdTitle] = useState('');
  const [adLinkUrl, setAdLinkUrl] = useState('');
  const [adSlot, setAdSlot] = useState('sidebar'); // 'top' | 'sidebar'
  const [adSize, setAdSize] = useState('original'); // 'small' | 'medium' | 'large' | 'original'
  const [adFile, setAdFile] = useState(null);
  const [adIsActive, setAdIsActive] = useState(true);
  const [editingAdId, setEditingAdId] = useState(null);
  const [adPreviewUrl, setAdPreviewUrl] = useState('');

  // E-Paper States
  const [epapersList, setEpapersList] = useState([]);
  const [epaperDate, setEpaperDate] = useState(new Date().toISOString().split('T')[0]);
  const [epaperTitleEn, setEpaperTitleEn] = useState('');
  const [epaperTitleHi, setEpaperTitleHi] = useState('');
  const [epaperPdfFile, setEpaperPdfFile] = useState(null);
  const [epaperThumbFile, setEpaperThumbFile] = useState(null);

  // Settings Form States
  const [settingsUsername, setSettingsUsername] = useState('');
  const [settingsPassword, setSettingsPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Editor-in-Chief States
  const [editorNameEn, setEditorNameEn] = useState('');
  const [editorNameHi, setEditorNameHi] = useState('');
  const [editorRoleEn, setEditorRoleEn] = useState('Editor-in-Chief');
  const [editorRoleHi, setEditorRoleHi] = useState('मुख्य संपादक');
  const [editorDescEn, setEditorDescEn] = useState('');
  const [editorDescHi, setEditorDescHi] = useState('');
  const [editorPhotoFile, setEditorPhotoFile] = useState(null);
  const [editorPhotoPreview, setEditorPhotoPreview] = useState('');
  const [editorMobile, setEditorMobile] = useState('');
  const [editorFacebook, setEditorFacebook] = useState('');
  const [editorInstagram, setEditorInstagram] = useState('');
  const [editorYoutube, setEditorYoutube] = useState('');


  // Form States - News
  const [titleEn, setTitleEn] = useState('');
  const [titleHi, setTitleHi] = useState('');
  const [contentEn, setContentEn] = useState('');
  const [contentHi, setContentHi] = useState('');
  const [summaryEn, setSummaryEn] = useState('');
  const [summaryHi, setSummaryHi] = useState('');
  const [selectedCats, setSelectedCats] = useState([]);
  const [subdivision, setSubdivision] = useState('None');
  const [videoUrl, setVideoUrl] = useState('');
  const [imageFiles, setImageFiles] = useState([]);
  const [imageUrlStr, setImageUrlStr] = useState('');
  const [existingImages, setExistingImages] = useState([]);
  const [isBreaking, setIsBreaking] = useState(false);
  const [isNewsSaving, setIsNewsSaving] = useState(false);

  // Translation States & Function
  const [isAutoTranslate, setIsAutoTranslate] = useState(true);
  const [translatingFields, setTranslatingFields] = useState({});

  const handleTranslateText = async (text, targetLang, setter, fieldKey, force = false) => {
    if (!text || text.trim() === '') return;
    if (!force && !isAutoTranslate) return;

    setTranslatingFields(prev => ({ ...prev, [fieldKey]: true }));
    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ text, targetLang })
      });
      if (res.ok) {
        const data = await res.json();
        setter(data.translatedText);
      }
    } catch (err) {
      console.error('Translation error:', err);
    } finally {
      setTranslatingFields(prev => ({ ...prev, [fieldKey]: false }));
    }
  };

  // Form States - Poll
  const [pollId, setPollId] = useState('');
  const [pollQuestionEn, setPollQuestionEn] = useState('');
  const [pollQuestionHi, setPollQuestionHi] = useState('');
  const [pollOption1En, setPollOption1En] = useState('');
  const [pollOption1Hi, setPollOption1Hi] = useState('');
  const [pollOption2En, setPollOption2En] = useState('');
  const [pollOption2Hi, setPollOption2Hi] = useState('');
  const [pollOption3En, setPollOption3En] = useState('');
  const [pollOption3Hi, setPollOption3Hi] = useState('');
  const [votesOption1, setVotesOption1] = useState(0);
  const [votesOption2, setVotesOption2] = useState(0);
  const [votesOption3, setVotesOption3] = useState(0);
  const [resetPollVotes, setResetPollVotes] = useState(false);

  // Form States - Category
  const [newCatEn, setNewCatEn] = useState('');
  const [newCatHi, setNewCatHi] = useState('');

  // Status Alerts
  const [alert, setAlert] = useState(null); // { type: 'success'|'error', text: '' }

  // Fetch functions
  const fetchNews = async () => {
    try {
      const res = await fetch('/api/news');
      if (res.ok) {
        const data = await res.json();
        setNewsList(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/news/categories');
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMessages = async () => {
    try {
      const res = await fetch('/api/contact', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchEPapers = async () => {
    try {
      const res = await fetch('/api/epaper');
      if (res.ok) {
        const data = await res.json();
        setEpapersList(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchComments = async () => {
    try {
      const res = await fetch('/api/news/comments/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCommentsList(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteComment = async (newsId, commentId) => {
    Swal.fire({
      title: language === 'en' ? 'Are you sure?' : 'क्या आप आश्वस्त हैं?',
      text: language === 'en' ? 'Do you want to delete this comment?' : 'क्या आप इस टिप्पणी को हटाना चाहते हैं?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: language === 'en' ? 'Yes, delete it!' : 'हाँ, इसे हटाएँ!',
      cancelButtonText: language === 'en' ? 'Cancel' : 'रद्द करें'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await fetch(`/api/news/${newsId}/comments/${commentId}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
          });

          if (res.ok) {
            triggerAlert('success', language === 'en' ? 'Comment deleted successfully' : 'टिप्पणी सफलतापूर्वक हटा दी गई');
            fetchComments();
          } else {
            triggerAlert('error', language === 'en' ? 'Failed to delete comment' : 'टिप्पणी हटाने में विफल');
          }
        } catch (err) {
          console.error(err);
          triggerAlert('error', 'Network error');
        }
      }
    });
  };

  const fetchPoll = async () => {
    try {
      const res = await fetch('/api/poll');
      if (res.ok) {
        const data = await res.json();
        setPollId(data._id);
        setPollQuestionEn(data.questionEn || '');
        setPollQuestionHi(data.questionHi || '');
        setPollOption1En(data.option1En || '');
        setPollOption1Hi(data.option1Hi || '');
        setPollOption2En(data.option2En || '');
        setPollOption2Hi(data.option2Hi || '');
        setPollOption3En(data.option3En || '');
        setPollOption3Hi(data.option3Hi || '');
        setVotesOption1(data.votesOption1 || 0);
        setVotesOption2(data.votesOption2 || 0);
        setVotesOption3(data.votesOption3 || 0);
      }
    } catch (err) {
      console.error('Error fetching poll:', err);
    }
  };

  const handlePollSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/poll', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          questionEn: pollQuestionEn,
          questionHi: pollQuestionHi,
          option1En: pollOption1En,
          option1Hi: pollOption1Hi,
          option2En: pollOption2En,
          option2Hi: pollOption2Hi,
          option3En: pollOption3En,
          option3Hi: pollOption3Hi,
          resetVotes: resetPollVotes
        })
      });

      if (res.ok) {
        triggerAlert('success', 'Opinion Poll updated successfully!');
        setResetPollVotes(false);
        fetchPoll();
      } else {
        const data = await res.json();
        triggerAlert('error', data.message || 'Failed to update poll');
      }
    } catch (err) {
      console.error(err);
      triggerAlert('error', 'Network communication error');
    }
  };

  const fetchEditorInfo = async () => {
    try {
      const res = await fetch('/api/editor');
      if (res.ok) {
        const data = await res.json();
        setEditorNameEn(data.nameEn || '');
        setEditorNameHi(data.nameHi || '');
        setEditorRoleEn(data.roleEn || 'Editor-in-Chief');
        setEditorRoleHi(data.roleHi || 'मुख्य संपादक');
        setEditorDescEn(data.descriptionEn || '');
        setEditorDescHi(data.descriptionHi || '');
        setEditorPhotoPreview(data.photoUrl || '');
        setEditorMobile(data.mobile || '');
        setEditorFacebook(data.facebook || '');
        setEditorInstagram(data.instagram || '');
        setEditorYoutube(data.youtube || '');
      }
    } catch (err) {
      console.error('Error fetching editor info:', err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchNews();
      fetchCategories();
      fetchMessages();
      fetchEPapers();
      fetchPoll();
      fetchComments();
      fetchAds();
      fetchEditorInfo();
    }
  }, [token]);

  useEffect(() => {
    if (token && activeTab === 'comments') {
      fetchComments();
    }
    if (token && activeTab === 'ads') {
      fetchAds();
    }
    if (token && activeTab === 'settings') {
      fetchEditorInfo();
    }
  }, [activeTab, token]);

  const handleLogout = () => {
    sessionStorage.removeItem('admin_token');
    sessionStorage.removeItem('admin_username');
    navigate('/admin/login');
  };

  // Display flash alerts
  const triggerAlert = (type, text) => {
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

    Toast.fire({
      icon: type === 'error' ? 'error' : 'success',
      title: text
    });
  };

  // Toggle Category Checkbox
  const handleCatChange = (catId) => {
    setSelectedCats((prev) =>
      prev.includes(catId) ? prev.filter(id => id !== catId) : [...prev, catId]
    );
  };

  // Reset Form fields
  const resetForm = () => {
    setEditingId(null);
    setTitleEn('');
    setTitleHi('');
    setContentEn('');
    setContentHi('');
    setSummaryEn('');
    setSummaryHi('');
    setSelectedCats([]);
    setSubdivision('None');
    setVideoUrl('');
    setImageFiles([]);
    setImageUrlStr('');
    setExistingImages([]);
    setIsBreaking(false);
  };

  // Submit News form (Create or Update)
  const handleNewsSubmit = async (e) => {
    e.preventDefault();

    if (selectedCats.length === 0) {
      triggerAlert('error', 'Select at least one category');
      return;
    }

    setIsNewsSaving(true);
    const formData = new FormData();
    formData.append('titleEn', titleEn);
    formData.append('titleHi', titleHi);
    formData.append('contentEn', contentEn);
    formData.append('contentHi', contentHi);
    formData.append('summaryEn', summaryEn);
    formData.append('summaryHi', summaryHi);
    formData.append('subdivision', subdivision);
    formData.append('videoUrl', videoUrl);
    formData.append('isBreaking', isBreaking);
    formData.append('categories', JSON.stringify(selectedCats));

    if (imageFiles && imageFiles.length > 0) {
      for (let i = 0; i < imageFiles.length; i++) {
        formData.append('images', imageFiles[i]);
      }
    } else if (imageUrlStr) {
      // Split by comma and trim each URL to handle multiple comma-separated URLs
      const urls = imageUrlStr.split(',').map(url => url.trim()).filter(Boolean);
      urls.forEach(url => {
        formData.append('images', url);
      });
    } else if (existingImages && existingImages.length > 0) {
      existingImages.forEach(url => {
        formData.append('images', url);
      });
    }

    try {
      let url = '/api/news';
      let method = 'POST';

      if (editingId) {
        url = `/api/news/${editingId}`;
        method = 'PUT';
      }

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      if (res.ok) {
        triggerAlert('success', editingId ? 'Article updated successfully!' : 'Article created successfully!');
        resetForm();
        fetchNews();
        setActiveTab('list');
      } else {
        const errorData = await res.json();
        triggerAlert('error', errorData.message || 'Operation failed');
      }
    } catch (err) {
      console.error(err);
      triggerAlert('error', 'Network communication error');
    } finally {
      setIsNewsSaving(false);
    }
  };

  // Load news details into edit form
  const handleEditClick = (article) => {
    setEditingId(article._id);
    setTitleEn(article.titleEn || '');
    setTitleHi(article.titleHi || '');
    setContentEn(article.contentEn || '');
    setContentHi(article.contentHi || '');
    setSummaryEn(article.summaryEn || '');
    setSummaryHi(article.summaryHi || '');
    setSelectedCats(article.categories.map(c => c._id || c));
    setSubdivision(article.subdivision || 'None');
    setVideoUrl(article.videoUrl || '');
    setIsBreaking(article.isBreaking || false);

    const artImages = article.images || [];
    setExistingImages(artImages);
    if (artImages.length > 0) {
      setImageUrlStr(artImages.join(', '));
    } else {
      setImageUrlStr('');
    }

    setActiveTab('form');
  };

  // Delete News article
  const handleDeleteNews = async (id) => {
    Swal.fire({
      title: language === 'en' ? 'Are you sure?' : 'क्या आप आश्वस्त हैं?',
      text: language === 'en' ? 'Do you want to delete this article?' : 'क्या आप इस समाचार को हटाना चाहते हैं?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: language === 'en' ? 'Yes, delete it!' : 'हाँ, इसे हटाएँ!',
      cancelButtonText: language === 'en' ? 'Cancel' : 'रद्द करें'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await fetch(`/api/news/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
          });

          if (res.ok) {
            triggerAlert('success', 'Article deleted');
            fetchNews();
          } else {
            triggerAlert('error', 'Failed to delete');
          }
        } catch (err) {
          console.error(err);
          triggerAlert('error', 'Network error');
        }
      }
    });
  };

  // Share News article
  const handleShareNews = async (article) => {
    const shareUrl = `${window.location.protocol}//${window.location.host}/news/${article._id}`;
    const title = language === 'en' ? article.titleEn : article.titleHi;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          url: shareUrl
        });
      } catch (err) {
        console.log('Share failed/cancelled', err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        triggerAlert('success', language === 'en' ? 'Link copied to clipboard!' : 'लिंक क्लिपबोर्ड पर कॉपी हो गया!');
      } catch (err) {
        console.error('Failed to copy', err);
        triggerAlert('error', language === 'en' ? 'Failed to copy link' : 'लिंक कॉपी करने में विफल');
      }
    }
  };

  // Create Category
  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCatEn || !newCatHi) {
      triggerAlert('error', 'Fill in both language names for the category');
      return;
    }

    try {
      const res = await fetch('/api/news/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ nameEn: newCatEn, nameHi: newCatHi })
      });

      if (res.ok) {
        triggerAlert('success', 'Category added');
        setNewCatEn('');
        setNewCatHi('');
        fetchCategories();
      } else {
        const data = await res.json();
        triggerAlert('error', data.message || 'Failed to add category');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Delete Category
  const handleDeleteCategory = async (id) => {
    Swal.fire({
      title: language === 'en' ? 'Are you sure?' : 'क्या आप आश्वस्त हैं?',
      text: language === 'en' ? 'Delete category? All associated articles will lose this category reference.' : 'श्रेणी हटाएँ? सभी संबंधित समाचारों से यह श्रेणी हट जाएगी।',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: language === 'en' ? 'Yes, delete it!' : 'हाँ, इसे हटाएँ!',
      cancelButtonText: language === 'en' ? 'Cancel' : 'रद्द करें'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await fetch(`/api/news/categories/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
          });

          if (res.ok) {
            triggerAlert('success', 'Category deleted');
            fetchCategories();
            fetchNews();
          } else {
            triggerAlert('error', 'Failed to delete category');
          }
        } catch (err) {
          console.error(err);
        }
      }
    });
  };

  // Mark contact form read
  const handleMarkMessageRead = async (id) => {
    try {
      const res = await fetch(`/api/contact/${id}/read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        fetchMessages();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Delete Message
  const handleDeleteMessage = async (id) => {
    Swal.fire({
      title: language === 'en' ? 'Are you sure?' : 'क्या आप आश्वस्त हैं?',
      text: language === 'en' ? 'Delete this user message?' : 'क्या आप इस उपयोगकर्ता संदेश को हटाना चाहते हैं?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: language === 'en' ? 'Yes, delete it!' : 'हाँ, इसे हटाएँ!',
      cancelButtonText: language === 'en' ? 'Cancel' : 'रद्द करें'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await fetch(`/api/contact/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
          });

          if (res.ok) {
            triggerAlert('success', 'Message deleted');
            fetchMessages();
          }
        } catch (err) {
          console.error(err);
        }
      }
    });
  };

  // Submit E-Paper upload
  const handleEPaperSubmit = async (e) => {
    e.preventDefault();

    if (!epaperDate || !epaperTitleEn || !epaperTitleHi) {
      triggerAlert('error', 'Date and Titles are required');
      return;
    }

    if (!epaperPdfFile) {
      triggerAlert('error', 'PDF file is required');
      return;
    }

    const formData = new FormData();
    formData.append('date', epaperDate);
    formData.append('titleEn', epaperTitleEn);
    formData.append('titleHi', epaperTitleHi);
    formData.append('pdf', epaperPdfFile);
    if (epaperThumbFile) {
      formData.append('thumbnail', epaperThumbFile);
    }

    try {
      const res = await fetch('/api/epaper', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      if (res.ok) {
        triggerAlert('success', 'E-Paper uploaded successfully!');
        setEpaperTitleEn('');
        setEpaperTitleHi('');
        setEpaperPdfFile(null);
        setEpaperThumbFile(null);

        const pdfInput = document.getElementById('epaperPdfInput');
        const thumbInput = document.getElementById('epaperThumbInput');
        if (pdfInput) pdfInput.value = '';
        if (thumbInput) thumbInput.value = '';

        fetchEPapers();
      } else {
        const errorData = await res.json();
        triggerAlert('error', errorData.message || 'Upload failed');
      }
    } catch (err) {
      console.error(err);
      triggerAlert('error', 'Network communication error');
    }
  };

  // Delete E-Paper
  const handleDeleteEPaper = async (id) => {
    Swal.fire({
      title: language === 'en' ? 'Are you sure?' : 'क्या आप आश्वस्त हैं?',
      text: language === 'en' ? 'Are you sure you want to delete this E-Paper edition?' : 'क्या आप वाकई इस ई-पेपर संस्करण को हटाना चाहते हैं?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: language === 'en' ? 'Yes, delete it!' : 'हाँ, इसे हटाएँ!',
      cancelButtonText: language === 'en' ? 'Cancel' : 'रद्द करें'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await fetch(`/api/epaper/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
          });

          if (res.ok) {
            triggerAlert('success', 'E-Paper deleted successfully!');
            fetchEPapers();
          } else {
            triggerAlert('error', 'Failed to delete');
          }
        } catch (err) {
          console.error(err);
          triggerAlert('error', 'Network error');
        }
      }
    });
  };

  // Advertisement Functions
  const fetchAds = async () => {
    try {
      const res = await fetch('/api/ads');
      if (res.ok) {
        const data = await res.json();
        setAdsList(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAdSubmit = async (e) => {
    e.preventDefault();

    if (!adTitle) {
      triggerAlert('error', 'Title is required');
      return;
    }

    if (!editingAdId && !adFile) {
      triggerAlert('error', 'Please upload a photo or video file');
      return;
    }

    const formData = new FormData();
    formData.append('title', adTitle);
    formData.append('linkUrl', adLinkUrl);
    formData.append('slot', adSlot);
    formData.append('size', adSize);
    formData.append('isActive', adIsActive);
    if (adFile) {
      formData.append('mediaFile', adFile);
    }

    try {
      let url = '/api/ads';
      let method = 'POST';

      if (editingAdId) {
        url = `/api/ads/${editingAdId}`;
        method = 'PUT';
      }

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      if (res.ok) {
        triggerAlert('success', editingAdId ? 'Ad updated successfully!' : 'Ad created successfully!');
        resetAdForm();
        fetchAds();
        setActiveTab('ads');
      } else {
        const data = await res.json();
        triggerAlert('error', data.message || 'Operation failed');
      }
    } catch (err) {
      console.error(err);
      triggerAlert('error', 'Network error');
    }
  };

  const resetAdForm = () => {
    setEditingAdId(null);
    setAdTitle('');
    setAdLinkUrl('');
    setAdSlot('sidebar');
    setAdSize('original');
    setAdFile(null);
    setAdIsActive(true);
    setAdPreviewUrl('');
    const fileInput = document.getElementById('adFileInput');
    if (fileInput) fileInput.value = '';
  };

  const handleEditAd = (ad) => {
    setEditingAdId(ad._id);
    setAdTitle(ad.title);
    setAdLinkUrl(ad.linkUrl || '');
    setAdSlot(ad.slot || 'sidebar');
    setAdSize(ad.size || 'original');
    setAdIsActive(ad.isActive);
    setAdPreviewUrl(ad.mediaUrl);
    setAdFile(null);
    setActiveTab('adForm');
  };

  const handleDeleteAd = async (id) => {
    Swal.fire({
      title: language === 'en' ? 'Are you sure?' : 'क्या आप आश्वस्त हैं?',
      text: language === 'en' ? 'Are you sure you want to delete this advertisement?' : 'क्या आप वाकई इस विज्ञापन को हटाना चाहते हैं?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: language === 'en' ? 'Yes, delete it!' : 'हाँ, इसे हटाएँ!',
      cancelButtonText: language === 'en' ? 'Cancel' : 'रद्द करें'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await fetch(`/api/ads/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
          });

          if (res.ok) {
            triggerAlert('success', 'Advertisement deleted');
            fetchAds();
          } else {
            triggerAlert('error', 'Failed to delete');
          }
        } catch (err) {
          console.error(err);
          triggerAlert('error', 'Network error');
        }
      }
    });
  };

  const handleToggleAdStatus = async (ad) => {
    try {
      const res = await fetch(`/api/ads/${ad._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ isActive: !ad.isActive })
      });
      if (res.ok) {
        triggerAlert('success', 'Ad status toggled');
        fetchAds();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateCredentials = async (e) => {
    e.preventDefault();
    if (!settingsUsername) {
      triggerAlert('error', language === 'en' ? 'Username is required' : 'उपयोगकर्ता नाम आवश्यक है');
      return;
    }
    if (!settingsPassword || settingsPassword.length < 8) {
      triggerAlert('error', language === 'en' ? 'Password must be at least 8 characters' : 'पासवर्ड कम से कम 8 वर्णों का होना चाहिए');
      return;
    }
    if (settingsPassword !== confirmPassword) {
      triggerAlert('error', language === 'en' ? 'Passwords do not match' : 'पासवर्ड मेल नहीं खाते');
      return;
    }
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ username: settingsUsername, password: settingsPassword })
      });
      if (res.ok) {
        triggerAlert('success', language === 'en' ? 'Credentials updated' : 'प्रमाणपत्र अपडेट हो गये');
        sessionStorage.setItem('admin_username', settingsUsername);
      } else {
        const data = await res.json();
        triggerAlert('error', data.message || (language === 'en' ? 'Update failed' : 'अपडेट विफल'));
      }
    } catch (err) {
      console.error(err);
      triggerAlert('error', language === 'en' ? 'Network error' : 'नेटवर्क त्रुटि');
    }
  };

  const handleEditorSubmit = async (e) => {
    e.preventDefault();
    if (!editorNameEn || !editorNameHi) {
      triggerAlert('error', 'Editor name is required in both English and Hindi');
      return;
    }

    const formData = new FormData();
    formData.append('nameEn', editorNameEn);
    formData.append('nameHi', editorNameHi);
    formData.append('roleEn', editorRoleEn);
    formData.append('roleHi', editorRoleHi);
    formData.append('descriptionEn', editorDescEn);
    formData.append('descriptionHi', editorDescHi);
    formData.append('mobile', editorMobile);
    formData.append('facebook', editorFacebook);
    formData.append('instagram', editorInstagram);
    formData.append('youtube', editorYoutube);
    if (editorPhotoFile) {
      formData.append('photoFile', editorPhotoFile);
    }

    try {
      const res = await fetch('/api/editor', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      if (res.ok) {
        triggerAlert('success', language === 'en' ? 'Editor profile updated successfully' : 'संपादक प्रोफ़ाइल सफलतापूर्वक अपडेट हो गई');
        const data = await res.json();
        setEditorPhotoPreview(data.photoUrl || '');
        setEditorPhotoFile(null);
        const fileInput = document.getElementById('editorPhotoInput');
        if (fileInput) fileInput.value = '';
      } else {
        const data = await res.json();
        triggerAlert('error', data.message || 'Failed to update editor info');
      }
    } catch (err) {
      console.error(err);
      triggerAlert('error', 'Network error');
    }
  };

  const fetchAnalytics = async () => {
    try {
      setAnalyticsLoading(true);
      const res = await fetch('/api/analytics/dashboard', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setAnalyticsData(data);
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  useEffect(() => {
    let intervalId;
    if (activeTab === 'analytics' && token) {
      // Initial load
      fetchAnalytics();

      // Poll silently every 5 seconds for real-time updates
      intervalId = setInterval(() => {
        const fetchAnalyticsSilent = async () => {
          try {
            const res = await fetch('/api/analytics/dashboard', {
              headers: {
                Authorization: `Bearer ${token}`
              }
            });
            if (res.ok) {
              const data = await res.json();
              setAnalyticsData(data);
            }
          } catch (err) {
            console.error('Error polling dashboard stats:', err);
          }
        };
        fetchAnalyticsSilent();
      }, 5000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [activeTab, token]);

  return (
    <div className="container" style={{ marginTop: '30px' }}>

      {/* Dashboard title header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h2 style={{ fontSize: '28px', color: 'var(--color-text-primary)' }}>{t('adminDashboard')}</h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px', marginTop: '4px' }}>
            Welcome back, {sessionStorage.getItem('admin_username') || 'Admin'}. Manage news feeds, tags and contacts below.
          </p>
        </div>

        {activeTab === 'list' && (
          <button
            className="btn"
            style={{ width: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}
            onClick={() => { resetForm(); setActiveTab('form'); }}
          >
            <Plus size={16} />
            {language === 'en' ? 'New Article' : 'नया समाचार'}
          </button>
        )}
      </div>



      {/* Dashboard Tabs Bar */}
      <div className="admin-tabs" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', flexWrap: 'wrap', gap: '15px' }}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            className={`admin-tab ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => { setActiveTab('analytics'); setIsEditMenuOpen(false); }}
          >
            <BarChart2 size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
            {language === 'en' ? 'Overview' : 'अवलोकन'}
          </button>

          <button
            className={`admin-tab ${activeTab === 'list' ? 'active' : ''}`}
            onClick={() => { setActiveTab('list'); setIsEditMenuOpen(false); }}
          >
            <Newspaper size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
            {language === 'en' ? 'News Feed' : 'समाचार सूची'}
          </button>
          {/* Settings Tab */}
          <button
            className={`admin-tab ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => { setActiveTab('settings'); setIsEditMenuOpen(false); }}
          >
            <Settings size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
            {language === 'en' ? 'Settings' : 'सेटिंग्स'}
          </button>

          <button
            className={`admin-tab ${activeTab === 'comments' ? 'active' : ''}`}
            onClick={() => { setActiveTab('comments'); setIsEditMenuOpen(false); }}
          >
            <MessageSquare size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
            {language === 'en' ? 'Comments' : 'टिप्पणी प्रबंधन'}
          </button>

          <button
            className={`admin-tab ${activeTab === 'messages' ? 'active' : ''}`}
            onClick={() => { setActiveTab('messages'); setIsEditMenuOpen(false); }}
          >
            <Mail size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
            {t('messages')}
            {messages.filter(m => !m.isRead).length > 0 && (
              <span style={{ background: 'var(--color-primary)', color: 'white', fontSize: '10px', padding: '2px 6px', borderRadius: '10px', marginLeft: '6px' }}>
                {messages.filter(m => !m.isRead).length}
              </span>
            )}
          </button>

          {/* Desktop-only individual tabs */}
          <div className="admin-desktop-tabs">
            <button
              className={`admin-tab ${activeTab === 'form' ? 'active' : ''}`}
              onClick={() => { if (!editingId) resetForm(); setActiveTab('form'); }}
            >
              <FileText size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
              {editingId ? t('editNews') : t('addNews')}
            </button>

            <button
              className={`admin-tab ${activeTab === 'categories' ? 'active' : ''}`}
              onClick={() => { setActiveTab('categories'); }}
            >
              <FolderPlus size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
              {language === 'en' ? 'Categories' : 'श्रेणियाँ'}
            </button>

            <button
              className={`admin-tab ${activeTab === 'epaper' ? 'active' : ''}`}
              onClick={() => { setActiveTab('epaper'); }}
            >
              <Newspaper size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
              {language === 'en' ? 'Manage E-Paper' : 'ई-पेपर प्रबंधन'}
            </button>

            <button
              className={`admin-tab ${activeTab === 'poll' ? 'active' : ''}`}
              onClick={() => { setActiveTab('poll'); }}
            >
              <BarChart2 size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
              {language === 'en' ? 'Opinion Poll' : 'ओपिनियन पोल'}
            </button>

            <button
              className={`admin-tab ${['ads', 'adForm'].includes(activeTab) ? 'active' : ''}`}
              onClick={() => { setActiveTab('ads'); }}
            >
              <Image size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
              {language === 'en' ? 'Manage Ads' : 'विज्ञापन प्रबंधन'}
            </button>

            {/* Auto Newspaper Generator */}
            <button
              className="admin-tab"
              onClick={() => navigate('/newspaper')}
              style={{ background: 'linear-gradient(135deg, rgba(239,68,68,0.15), rgba(59,130,246,0.10))', borderColor: 'rgba(239,68,68,0.4)' }}
              title={language === 'en' ? 'Auto generate today\'s newspaper as PDF' : 'आज का अखबार PDF में बनाएं'}
            >
              <span style={{ marginRight: '5px' }}>📰</span>
              {language === 'en' ? 'Auto Newspaper' : 'ऑटो अखबार'}
            </button>
          </div>

          {/* Mobile-only grouped dropdown */}
          <div className="admin-mobile-dropdown">
            <div className="dropdown-menu" style={{ position: 'relative' }}>
              <button
                className={`admin-tab ${['form', 'categories', 'epaper', 'poll', 'ads', 'adForm'].includes(activeTab) ? 'active' : ''}`}
                onClick={() => setIsEditMenuOpen(!isEditMenuOpen)}
                style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <Edit size={16} style={{ marginRight: '2px', verticalAlign: 'middle' }} />
                {language === 'en' ? 'Manage / Edits' : 'संपादन एवं प्रबंधन'}
                <ChevronDown size={14} />
              </button>

              {isEditMenuOpen && (
                <div className="admin-dropdown-content">
                  <button
                    style={{ background: 'transparent', border: 'none', color: activeTab === 'form' ? 'var(--color-primary)' : 'var(--color-text-primary)', padding: '10px 15px', textAlign: 'left', cursor: 'pointer', fontWeight: 600, fontSize: '14px', width: '100%', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '8px' }}
                    onClick={() => { if (!editingId) resetForm(); setActiveTab('form'); setIsEditMenuOpen(false); }}
                  >
                    <FileText size={14} />
                    {editingId ? t('editNews') : t('addNews')}
                  </button>
                  <button
                    style={{ background: 'transparent', border: 'none', color: activeTab === 'categories' ? 'var(--color-primary)' : 'var(--color-text-primary)', padding: '10px 15px', textAlign: 'left', cursor: 'pointer', fontWeight: 600, fontSize: '14px', width: '100%', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '8px' }}
                    onClick={() => { setActiveTab('categories'); setIsEditMenuOpen(false); }}
                  >
                    <FolderPlus size={14} />
                    {language === 'en' ? 'Categories' : 'श्रेणियाँ'}
                  </button>
                  <button
                    style={{ background: 'transparent', border: 'none', color: activeTab === 'epaper' ? 'var(--color-primary)' : 'var(--color-text-primary)', padding: '10px 15px', textAlign: 'left', cursor: 'pointer', fontWeight: 600, fontSize: '14px', width: '100%', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '8px' }}
                    onClick={() => { setActiveTab('epaper'); setIsEditMenuOpen(false); }}
                  >
                    <Newspaper size={14} />
                    {language === 'en' ? 'Manage E-Paper' : 'ई-पेपर प्रबंधन'}
                  </button>
                  <button
                    style={{ background: 'transparent', border: 'none', color: activeTab === 'poll' ? 'var(--color-primary)' : 'var(--color-text-primary)', padding: '10px 15px', textAlign: 'left', cursor: 'pointer', fontWeight: 600, fontSize: '14px', width: '100%', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '8px' }}
                    onClick={() => { setActiveTab('poll'); setIsEditMenuOpen(false); }}
                  >
                    <BarChart2 size={14} />
                    {language === 'en' ? 'Opinion Poll' : 'ओपिनियन पोल'}
                  </button>
                  <button
                    style={{ background: 'transparent', border: 'none', color: ['ads', 'adForm'].includes(activeTab) ? 'var(--color-primary)' : 'var(--color-text-primary)', padding: '10px 15px', textAlign: 'left', cursor: 'pointer', fontWeight: 600, fontSize: '14px', width: '100%', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '8px' }}
                    onClick={() => { setActiveTab('ads'); setIsEditMenuOpen(false); }}
                  >
                    <Image size={14} />
                    {language === 'en' ? 'Manage Ads' : 'विज्ञापन प्रबंधन'}
                  </button>
                  <button
                    style={{ background: 'linear-gradient(135deg, rgba(239,68,68,0.12), rgba(59,130,246,0.08))', border: 'none', color: 'var(--color-primary)', padding: '10px 15px', textAlign: 'left', cursor: 'pointer', fontWeight: 700, fontSize: '14px', width: '100%', display: 'flex', alignItems: 'center', gap: '8px' }}
                    onClick={() => { navigate('/newspaper'); setIsEditMenuOpen(false); }}
                  >
                    <span>📰</span>
                    {language === 'en' ? 'Auto Newspaper PDF' : 'ऑटो अखबार PDF'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Dedicated Logout Button */}
        <button
          className="btn btn-danger"
          onClick={handleLogout}
          style={{ width: 'auto', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', height: '32px', borderRadius: 'var(--border-radius-sm)' }}
        >
          <LogOut size={14} />
          {language === 'en' ? 'Logout' : 'लॉगआउट'}
        </button>
      </div>

      <div className="admin-layout">

        {/* TAB 1: NEWS FEED LIST */}
        {activeTab === 'list' && (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>{language === 'en' ? 'Headline (Hindi/English)' : 'शीर्षक'}</th>
                  <th>{language === 'en' ? 'Location' : 'क्षेत्र'}</th>
                  <th>{language === 'en' ? 'Views' : 'दृश्य'}</th>
                  <th>{language === 'en' ? 'Date' : 'तारीख'}</th>
                  <th>{t('actions')}</th>
                </tr>
              </thead>
              <tbody>
                {newsList.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                      No news uploaded yet. Click 'New Article' to publish!
                    </td>
                  </tr>
                ) : (
                  newsList.map((article) => (
                    <tr key={article._id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          {article.images && article.images.length > 0 ? (
                            <img 
                              src={article.images[0]} 
                              alt="" 
                              style={{ 
                                width: '50px', 
                                height: '38px', 
                                objectFit: 'cover', 
                                borderRadius: '4px',
                                border: '1px solid var(--border-color)',
                                flexShrink: 0
                              }} 
                            />
                          ) : (
                            <div 
                              style={{ 
                                width: '50px', 
                                height: '38px', 
                                backgroundColor: 'var(--fb-hover-bg)', 
                                borderRadius: '4px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'var(--color-text-secondary)',
                                border: '1px solid var(--border-color)',
                                flexShrink: 0
                              }}
                            >
                              <Image size={14} />
                            </div>
                          )}
                          <div>
                            <div 
                              style={{ 
                                fontWeight: 600, 
                                color: 'var(--color-text-primary)',
                                maxWidth: '320px',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                              }} 
                              title={article.titleHi}
                            >
                              {article.titleHi}
                            </div>
                            <div 
                              style={{ 
                                fontSize: '12px', 
                                color: 'var(--color-text-secondary)', 
                                marginTop: '4px',
                                maxWidth: '320px',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                              }} 
                              title={article.titleEn}
                            >
                              {article.titleEn}
                            </div>
                            {article.isBreaking && (
                              <span className="live-badge" style={{ fontSize: '8px', padding: '1px 4px', display: 'inline-block', marginTop: '4px' }}>
                                {t('breakingNews')}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span style={{ fontSize: '13px', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '4px' }}>
                          {article.subdivision === 'None' ? 'District wide' : article.subdivision}
                        </span>
                      </td>
                      <td>{article.views || 0}</td>
                      <td style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                        {new Date(article.createdAt).toLocaleDateString()}
                      </td>
                      <td>
                        <div className="action-btns">
                          <Link
                            to={`/news/${article._id}`}
                            className="btn btn-sm btn-secondary"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'var(--color-secondary)', color: '#fff', textDecoration: 'none', border: 'none' }}
                          >
                            <Eye size={12} />
                            {language === 'en' ? 'View' : 'देखें'}
                          </Link>
                          <button
                            className="btn btn-sm btn-secondary"
                            style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                            onClick={() => handleEditClick(article)}
                          >
                            <Edit size={12} />
                            {t('edit')}
                          </button>
                          <button
                            className="btn btn-sm btn-secondary"
                            style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                            onClick={() => handleShareNews(article)}
                          >
                            <Share2 size={12} />
                            {language === 'en' ? 'Share' : 'शेयर'}
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                            onClick={() => handleDeleteNews(article._id)}
                          >
                            <Trash2 size={12} />
                            {t('delete')}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 2: CREATE / EDIT NEWS FORM */}
        {activeTab === 'form' && (
          <div className="contact-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', flexWrap: 'wrap', gap: '10px' }}>
              <h3 style={{ color: 'var(--color-text-primary)', margin: 0, fontSize: '18px' }}>
                {editingId ? t('editNews') : t('addNews')}
              </h3>

              <label className="checkbox-label" style={{ fontSize: '13px', color: 'var(--color-text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <input
                  type="checkbox"
                  checked={isAutoTranslate}
                  onChange={(e) => setIsAutoTranslate(e.target.checked)}
                  style={{ transform: 'scale(1.1)' }}
                />
                {language === 'en' ? 'Enable Auto-Translate on focus out' : 'बाहर क्लिक करने पर स्वतः अनुवाद सक्षम करें'}
              </label>
            </div>

            <form onSubmit={handleNewsSubmit}>
              <div className="grid grid-cols-2">
                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <label style={{ margin: 0 }}>{t('titleHi')} *</label>
                    {titleEn && (
                      <button
                        type="button"
                        style={{ padding: '2px 8px', fontSize: '11px', borderRadius: '4px', height: '22px', display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(255,255,255,0.05)', color: 'var(--color-text-secondary)', border: '1px solid var(--border-color)', cursor: 'pointer' }}
                        onClick={() => handleTranslateText(titleEn, 'hi', setTitleHi, 'titleHi', true)}
                        disabled={translatingFields['titleHi']}
                      >
                        <Languages size={11} className={translatingFields['titleHi'] ? 'animate-spin' : ''} />
                        {translatingFields['titleHi'] ? (language === 'en' ? 'Translating...' : 'अनुवाद हो रहा है...') : (language === 'en' ? 'Translate from English' : 'अंग्रेजी से अनुवाद करें')}
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    className="form-control"
                    required
                    value={titleHi}
                    onChange={(e) => setTitleHi(e.target.value)}
                    onBlur={() => {
                      if (isAutoTranslate && (!titleEn || titleEn.trim() === '')) {
                        handleTranslateText(titleHi, 'en', setTitleEn, 'titleEn');
                      }
                    }}
                  />
                </div>
                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <label style={{ margin: 0 }}>{t('titleEn')} *</label>
                    {titleHi && (
                      <button
                        type="button"
                        style={{ padding: '2px 8px', fontSize: '11px', borderRadius: '4px', height: '22px', display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(255,255,255,0.05)', color: 'var(--color-text-secondary)', border: '1px solid var(--border-color)', cursor: 'pointer' }}
                        onClick={() => handleTranslateText(titleHi, 'en', setTitleEn, 'titleEn', true)}
                        disabled={translatingFields['titleEn']}
                      >
                        <Languages size={11} className={translatingFields['titleEn'] ? 'animate-spin' : ''} />
                        {translatingFields['titleEn'] ? (language === 'en' ? 'Translating...' : 'अनुवाद हो रहा है...') : (language === 'en' ? 'Translate from Hindi' : 'हिंदी से अनुवाद करें')}
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    className="form-control"
                    required
                    value={titleEn}
                    onChange={(e) => setTitleEn(e.target.value)}
                    onBlur={() => {
                      if (isAutoTranslate && (!titleHi || titleHi.trim() === '')) {
                        handleTranslateText(titleEn, 'hi', setTitleHi, 'titleHi');
                      }
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2">
                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <label style={{ margin: 0 }}>{t('contentHi')} (Support 1000-2000 words) *</label>
                    {contentEn && (
                      <button
                        type="button"
                        style={{ padding: '2px 8px', fontSize: '11px', borderRadius: '4px', height: '22px', display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(255,255,255,0.05)', color: 'var(--color-text-secondary)', border: '1px solid var(--border-color)', cursor: 'pointer' }}
                        onClick={() => handleTranslateText(contentEn, 'hi', setContentHi, 'contentHi', true)}
                        disabled={translatingFields['contentHi']}
                      >
                        <Languages size={11} className={translatingFields['contentHi'] ? 'animate-spin' : ''} />
                        {translatingFields['contentHi'] ? (language === 'en' ? 'Translating...' : 'अनुवाद हो रहा है...') : (language === 'en' ? 'Translate from English' : 'अंग्रेजी से अनुवाद करें')}
                      </button>
                    )}
                  </div>
                  <textarea
                    rows="12"
                    className="form-control"
                    required
                    placeholder="लिखें पूरी खबर यहाँ..."
                    value={contentHi}
                    onChange={(e) => setContentHi(e.target.value)}
                    onBlur={() => {
                      if (isAutoTranslate && (!contentEn || contentEn.trim() === '')) {
                        handleTranslateText(contentHi, 'en', setContentEn, 'contentEn');
                      }
                    }}
                  ></textarea>
                </div>
                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <label style={{ margin: 0 }}>{t('contentEn')} (Support 1000-2000 words) *</label>
                    {contentHi && (
                      <button
                        type="button"
                        style={{ padding: '2px 8px', fontSize: '11px', borderRadius: '4px', height: '22px', display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(255,255,255,0.05)', color: 'var(--color-text-secondary)', border: '1px solid var(--border-color)', cursor: 'pointer' }}
                        onClick={() => handleTranslateText(contentHi, 'en', setContentEn, 'contentEn', true)}
                        disabled={translatingFields['contentEn']}
                      >
                        <Languages size={11} className={translatingFields['contentEn'] ? 'animate-spin' : ''} />
                        {translatingFields['contentEn'] ? (language === 'en' ? 'Translating...' : 'अनुवाद हो रहा है...') : (language === 'en' ? 'Translate from Hindi' : 'हिंदी से अनुवाद करें')}
                      </button>
                    )}
                  </div>
                  <textarea
                    rows="12"
                    className="form-control"
                    required
                    placeholder="Type news story description here..."
                    value={contentEn}
                    onChange={(e) => setContentEn(e.target.value)}
                    onBlur={() => {
                      if (isAutoTranslate && (!contentHi || contentHi.trim() === '')) {
                        handleTranslateText(contentEn, 'hi', setContentHi, 'contentHi');
                      }
                    }}
                  ></textarea>
                </div>
              </div>

              <div className="grid grid-cols-2">
                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <label style={{ margin: 0 }}>{language === 'en' ? 'Short Summary (Hindi)' : 'संक्षिप्त सारांश (हिंदी)'}</label>
                    {summaryEn && (
                      <button
                        type="button"
                        style={{ padding: '2px 8px', fontSize: '11px', borderRadius: '4px', height: '22px', display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(255,255,255,0.05)', color: 'var(--color-text-secondary)', border: '1px solid var(--border-color)', cursor: 'pointer' }}
                        onClick={() => handleTranslateText(summaryEn, 'hi', setSummaryHi, 'summaryHi', true)}
                        disabled={translatingFields['summaryHi']}
                      >
                        <Languages size={11} className={translatingFields['summaryHi'] ? 'animate-spin' : ''} />
                        {translatingFields['summaryHi'] ? (language === 'en' ? 'Translating...' : 'अनुवाद हो रहा है...') : (language === 'en' ? 'Translate from English' : 'अंग्रेजी से अनुवाद करें')}
                      </button>
                    )}
                  </div>
                  <textarea
                    rows="3"
                    className="form-control"
                    placeholder="यदि खाली छोड़ दिया गया, तो समाचार विवरण से स्वचालित रूप से उत्पन्न होगा।"
                    value={summaryHi}
                    onChange={(e) => setSummaryHi(e.target.value)}
                    onBlur={() => {
                      if (isAutoTranslate && (!summaryEn || summaryEn.trim() === '')) {
                        handleTranslateText(summaryHi, 'en', setSummaryEn, 'summaryEn');
                      }
                    }}
                  ></textarea>
                </div>
                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <label style={{ margin: 0 }}>{language === 'en' ? 'Short Summary (English)' : 'संक्षिप्त सारांश (English)'}</label>
                    {summaryHi && (
                      <button
                        type="button"
                        style={{ padding: '2px 8px', fontSize: '11px', borderRadius: '4px', height: '22px', display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(255,255,255,0.05)', color: 'var(--color-text-secondary)', border: '1px solid var(--border-color)', cursor: 'pointer' }}
                        onClick={() => handleTranslateText(summaryHi, 'en', setSummaryEn, 'summaryEn', true)}
                        disabled={translatingFields['summaryEn']}
                      >
                        <Languages size={11} className={translatingFields['summaryEn'] ? 'animate-spin' : ''} />
                        {translatingFields['summaryEn'] ? (language === 'en' ? 'Translating...' : 'अनुवाद हो रहा है...') : (language === 'en' ? 'Translate from Hindi' : 'हिंदी से अनुवाद करें')}
                      </button>
                    )}
                  </div>
                  <textarea
                    rows="3"
                    className="form-control"
                    placeholder="If empty, summary will be auto-extracted from article content."
                    value={summaryEn}
                    onChange={(e) => setSummaryEn(e.target.value)}
                    onBlur={() => {
                      if (isAutoTranslate && (!summaryHi || summaryHi.trim() === '')) {
                        handleTranslateText(summaryEn, 'hi', setSummaryHi, 'summaryHi');
                      }
                    }}
                  ></textarea>
                </div>
              </div>

              <div className="grid grid-cols-2">
                {/* Location select dropdown */}
                <div className="form-group">
                  <label>{t('locationLabel')}</label>
                  <select
                    className="form-control"
                    value={subdivision}
                    onChange={(e) => setSubdivision(e.target.value)}
                  >
                    <option value="None">{language === 'en' ? 'General / District Wide' : 'सामान्य / संपूर्ण जिला'}</option>
                    <option value="Khalilabad">{t('khalilabad')}</option>
                    <option value="Mehdawal">{t('mehdawal')}</option>
                    <option value="Dhanghata">{t('dhanghata')}</option>
                  </select>
                </div>

                {/* Video URL */}
                <div className="form-group">
                  <label>{t('videoUrlLabel')}</label>
                  <input
                    type="url"
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="form-control"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                  />
                </div>
              </div>

              {/* Categories check grid */}
              <div className="form-group">
                <label>{t('categoriesLabel')} *</label>
                <div className="checkbox-grid">
                  {categories.map((cat) => (
                    <label key={cat._id} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={selectedCats.includes(cat._id)}
                        onChange={() => handleCatChange(cat._id)}
                      />
                      {language === 'en' ? cat.nameEn : cat.nameHi}
                    </label>
                  ))}
                </div>
              </div>

              {/* Photo Upload and options */}
              <div className="grid grid-cols-2">
                <div className="form-group">
                  <label>{t('imagesLabel')}</label>
                  <input
                    type="file"
                    multiple
                    accept="image/*,.heic,.heif"
                    className="form-control"
                    onChange={(e) => setImageFiles(e.target.files)}
                  />
                  
                  {/* Preview of newly selected files */}
                  {imageFiles && imageFiles.length > 0 && (
                    <div style={{ marginTop: '10px' }}>
                      <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '5px', color: 'var(--color-text-secondary)' }}>
                        {language === 'en' ? 'New Images Selected:' : 'चयनित नई तस्वीरें:'}
                      </div>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {Array.from(imageFiles).map((file, idx) => (
                          <div key={idx} style={{ position: 'relative', width: '60px', height: '60px', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                            <img 
                              src={URL.createObjectURL(file)} 
                              alt="preview" 
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                            />
                          </div>
                        ))}
                      </div>
                      {editingId && (
                        <div style={{ fontSize: '11px', color: 'var(--color-live)', marginTop: '5px', fontWeight: '600' }}>
                          ⚠️ {language === 'en' ? 'Note: Uploading new files will replace all existing images.' : 'नोट: नई फ़ाइलें अपलोड करने से सभी पुरानी तस्वीरें बदल जाएंगी।'}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Preview of existing images when editing */}
                  {editingId && existingImages && existingImages.length > 0 && (
                    <div style={{ marginTop: '10px', marginBottom: '10px' }}>
                      <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '5px', color: 'var(--color-text-secondary)' }}>
                        {language === 'en' ? 'Existing Images:' : 'मौजूदा तस्वीरें:'}
                      </div>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {existingImages.map((url, idx) => (
                          <div key={idx} style={{ position: 'relative', width: '60px', height: '60px', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                            <img 
                              src={url} 
                              alt="existing" 
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const updated = existingImages.filter((_, i) => i !== idx);
                                setExistingImages(updated);
                                setImageUrlStr(updated.join(', '));
                              }}
                              style={{
                                position: 'absolute',
                                top: '2px',
                                right: '2px',
                                background: 'rgba(239, 68, 68, 0.9)',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '50%',
                                width: '16px',
                                height: '16px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '10px',
                                cursor: 'pointer',
                                lineHeight: 1
                              }}
                              title={language === 'en' ? 'Remove Image' : 'छवि हटाएं'}
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '10px' }}>
                    Or insert external Image URLs (comma-separated for multiple):
                  </div>
                  <input
                    type="text"
                    placeholder="https://images.unsplash.com/..."
                    className="form-control"
                    style={{ marginTop: '5px', fontSize: '13px' }}
                    value={imageUrlStr}
                    onChange={(e) => {
                      setImageUrlStr(e.target.value);
                      // Update existingImages preview state based on input
                      const urls = e.target.value.split(',').map(u => u.trim()).filter(Boolean);
                      setExistingImages(urls);
                    }}
                  />
                </div>

                <div className="form-group" style={{ display: 'flex', alignItems: 'center', paddingLeft: '20px' }}>
                  <label className="checkbox-label" style={{ fontSize: '16px', fontWeight: 600 }}>
                    <input
                      type="checkbox"
                      style={{ transform: 'scale(1.3)', marginRight: '8px' }}
                      checked={isBreaking}
                      onChange={(e) => setIsBreaking(e.target.checked)}
                    />
                    {t('breakingLabel')}
                  </label>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '15px', marginTop: '20px' }}>
                <button 
                  type="submit" 
                  className="btn" 
                  style={{ width: 'auto' }}
                  disabled={isNewsSaving}
                >
                  {isNewsSaving ? 'Saving....' : t('saveBtn')}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ width: 'auto' }}
                  onClick={() => { resetForm(); setActiveTab('list'); }}
                >
                  {language === 'en' ? 'Cancel' : 'रद्द करें'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 3: MANAGE CATEGORIES */}
        {activeTab === 'categories' && (
          <div className="grid grid-cols-2">

            {/* Create Category Panel */}
            <div className="contact-card">
              <h3 style={{ color: 'var(--color-text-primary)', marginBottom: '20px', fontSize: '18px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                {language === 'en' ? 'Add New Category' : 'नई श्रेणी जोड़ें'}
              </h3>
              <form onSubmit={handleCreateCategory}>
                <div className="form-group">
                  <label>Category Name (English) *</label>
                  <input
                    type="text"
                    placeholder="e.g. Health"
                    className="form-control"
                    value={newCatEn}
                    onChange={(e) => setNewCatEn(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>श्रेणी नाम (हिंदी) *</label>
                  <input
                    type="text"
                    placeholder="उदा. स्वास्थ्य"
                    className="form-control"
                    value={newCatHi}
                    onChange={(e) => setNewCatHi(e.target.value)}
                  />
                </div>
                <button type="submit" className="btn" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <Plus size={16} />
                  {language === 'en' ? 'Add Category' : 'श्रेणी जोड़ें'}
                </button>
              </form>
            </div>

            {/* List Categories Panel */}
            <div className="contact-card">
              <h3 style={{ color: 'var(--color-text-primary)', marginBottom: '20px', fontSize: '18px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                {language === 'en' ? 'Current Categories' : 'सक्रिय श्रेणियां'}
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxH: '400px', overflowY: 'auto' }}>
                {categories.map((cat) => (
                  <div
                    key={cat._id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      background: 'rgba(11, 15, 25, 0.4)',
                      padding: '10px 15px',
                      borderRadius: 'var(--border-radius-sm)',
                      border: '1px solid var(--border-color)'
                    }}
                  >
                    <div>
                      <span style={{ color: 'var(--color-text-primary)', fontWeight: 600 }}>{cat.nameHi}</span>
                      <span style={{ color: 'var(--color-text-secondary)', fontSize: '13px', marginLeft: '10px' }}>
                        ({cat.nameEn})
                      </span>
                    </div>
                    <button
                      className="btn btn-sm btn-danger"
                      style={{ padding: '4px 8px' }}
                      onClick={() => handleDeleteCategory(cat._id)}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* TAB 0: ANALYTICS OVERVIEW */}
        {activeTab === 'analytics' && (
          <div style={{ width: '100%' }}>
            {analyticsLoading || !analyticsData ? (
              <div style={{ textAlign: 'center', padding: '50px 0', color: 'var(--color-text-secondary)' }}>
                {t('loading') || 'Loading analytics...'}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>

                {/* KPI Cards Grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '20px',
                  width: '100%'
                }}>
                  {/* Website Views */}
                  <div className="glass" style={{ padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '15px', background: 'rgba(11, 15, 25, 0.4)' }}>
                    <div style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', padding: '12px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Globe size={24} />
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
                        {language === 'en' ? 'Website Views' : 'वेबसाइट व्यू'}
                      </div>
                      <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--color-text-primary)', marginTop: '4px' }}>
                        {analyticsData?.totalWebsiteViews?.toLocaleString() || 0}
                      </div>
                    </div>
                  </div>

                  {/* Total Articles */}
                  <div className="glass" style={{ padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '15px', background: 'rgba(11, 15, 25, 0.4)' }}>
                    <div style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#a855f7', padding: '12px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Newspaper size={24} />
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
                        {language === 'en' ? 'Total Articles' : 'कुल समाचार'}
                      </div>
                      <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--color-text-primary)', marginTop: '4px' }}>
                        {analyticsData?.totalArticles || 0}
                      </div>
                    </div>
                  </div>

                  {/* News Reads */}
                  <div className="glass" style={{ padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '15px', background: 'rgba(11, 15, 25, 0.4)' }}>
                    <div style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', padding: '12px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Eye size={24} />
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
                        {language === 'en' ? 'Article Views' : 'समाचार रीड्स'}
                      </div>
                      <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--color-text-primary)', marginTop: '4px' }}>
                        {analyticsData?.totalArticleViews?.toLocaleString() || 0}
                      </div>
                    </div>
                  </div>

                  {/* Total Likes */}
                  <div className="glass" style={{ padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '15px', background: 'rgba(11, 15, 25, 0.4)' }}>
                    <div style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', padding: '12px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <ThumbsUp size={24} />
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
                        {language === 'en' ? 'Total Likes' : 'कुल पसंद'}
                      </div>
                      <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--color-text-primary)', marginTop: '4px' }}>
                        {analyticsData?.totalLikes?.toLocaleString() || 0}
                      </div>
                    </div>
                  </div>

                  {/* Total Shares */}
                  <div className="glass" style={{ padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '15px', background: 'rgba(11, 15, 25, 0.4)' }}>
                    <div style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', padding: '12px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Share2 size={24} />
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
                        {language === 'en' ? 'Total Shares' : 'कुल शेयर'}
                      </div>
                      <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--color-text-primary)', marginTop: '4px' }}>
                        {analyticsData?.totalShares?.toLocaleString() || 0}
                      </div>
                    </div>
                  </div>

                  {/* Comments Count */}
                  <div className="glass" style={{ padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '15px', background: 'rgba(11, 15, 25, 0.4)' }}>
                    <div style={{ background: 'rgba(20, 184, 166, 0.15)', color: '#20b8a6', padding: '12px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <MessageSquare size={24} />
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
                        {language === 'en' ? 'Comments' : 'कुल टिप्पणियाँ'}
                      </div>
                      <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--color-text-primary)', marginTop: '4px' }}>
                        {analyticsData?.totalComments?.toLocaleString() || 0}
                      </div>
                    </div>
                  </div>
                </div>

                {/* SVG Area Chart */}
                <div className="glass" style={{
                  padding: '20px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-color)',
                  background: 'rgba(11, 15, 25, 0.4)',
                  width: '100%'
                }}>
                  <h3 style={{ color: 'var(--color-text-primary)', fontSize: '16px', fontWeight: 600, marginBottom: '20px' }}>
                    {language === 'en' ? 'Views Trend & Activity (Last 7 Days)' : 'व्यूज ट्रेंड और गतिविधि (अंतिम 7 दिन)'}
                  </h3>
                  {(() => {
                    const timeline = analyticsData?.viewsTimeline || [];
                    const maxVal = Math.max(...timeline.map(t => t.views || 0), 10);

                    // Generate SVG points
                    const points = timeline.map((t, i) => {
                      const x = (i / 6) * 440 + 40;
                      const y = 160 - ((t.views || 0) / maxVal) * 110;
                      return { x, y, label: t.date, val: t.views || 0 };
                    });

                    const pathD = points.length > 0
                      ? `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ')
                      : '';
                    const areaD = points.length > 0
                      ? `${pathD} L ${points[points.length - 1].x} 160 L ${points[0].x} 160 Z`
                      : '';

                    return (
                      <div style={{ position: 'relative', width: '100%', overflowX: 'auto' }}>
                        <div style={{ minWidth: '480px' }}>
                          <svg viewBox="0 0 500 200" width="100%" style={{ height: 'auto', overflow: 'visible' }}>
                            <defs>
                              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.4" />
                                <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0.0" />
                              </linearGradient>
                            </defs>

                            {/* Grid Lines */}
                            <line x1="40" y1="50" x2="480" y2="50" stroke="rgba(255, 255, 255, 0.05)" strokeDasharray="3" />
                            <line x1="40" y1="105" x2="480" y2="105" stroke="rgba(255, 255, 255, 0.05)" strokeDasharray="3" />
                            <line x1="40" y1="160" x2="480" y2="160" stroke="rgba(255, 255, 255, 0.15)" />

                            {/* Y-Axis labels */}
                            <text x="30" y="55" fill="var(--color-text-secondary)" fontSize="9" textAnchor="end">{Math.round(maxVal).toLocaleString()}</text>
                            <text x="30" y="110" fill="var(--color-text-secondary)" fontSize="9" textAnchor="end">{Math.round(maxVal / 2).toLocaleString()}</text>
                            <text x="30" y="165" fill="var(--color-text-secondary)" fontSize="9" textAnchor="end">0</text>

                            {/* Area Path */}
                            {areaD && <path d={areaD} fill="url(#chartGradient)" />}

                            {/* Line Path */}
                            {pathD && <path d={pathD} fill="none" stroke="var(--color-primary)" strokeWidth="3" strokeLinecap="round" />}

                            {/* Points Circles */}
                            {points.map((p, idx) => (
                              <g key={idx}>
                                <circle cx={p.x} cy={p.y} r="4" fill="var(--color-primary)" stroke="#fff" strokeWidth="1.5" style={{ cursor: 'pointer' }} />
                                <text x={p.x} y={p.y - 10} fill="#fff" fontSize="8" fontWeight="bold" textAnchor="middle">{p.val}</text>
                                {/* X Axis Labels */}
                                <text x={p.x} y="180" fill="var(--color-text-secondary)" fontSize="8" textAnchor="middle">{p.label}</text>
                              </g>
                            ))}
                          </svg>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Popular articles and distributions breakdown */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: '25px',
                  alignItems: 'start',
                  width: '100%'
                }}>
                  {/* Left Column: Popular News */}
                  <div className="glass" style={{
                    padding: '20px',
                    borderRadius: '12px',
                    border: '1px solid var(--border-color)',
                    background: 'rgba(11, 15, 25, 0.4)',
                    overflow: 'hidden'
                  }}>
                    <h3 style={{ color: 'var(--color-text-primary)', fontSize: '16px', fontWeight: 600, marginBottom: '20px' }}>
                      {language === 'en' ? 'Popular News Articles' : 'लोकप्रिय समाचार लेख'}
                    </h3>
                    <div style={{ overflowX: 'auto' }}>
                      <table className="table" style={{ width: '100%', borderCollapse: 'collapse', minWidth: '350px' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                            <th style={{ textAlign: 'left', padding: '10px 5px', fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                              {language === 'en' ? 'Title' : 'शीर्षक'}
                            </th>
                            <th style={{ textAlign: 'center', padding: '10px 5px', fontSize: '12px', color: 'var(--color-text-secondary)', width: '60px' }}>
                              {language === 'en' ? 'Views' : 'दृश्य'}
                            </th>
                            <th style={{ textAlign: 'center', padding: '10px 5px', fontSize: '12px', color: 'var(--color-text-secondary)', width: '60px' }}>
                              {language === 'en' ? 'Likes' : 'पसंद'}
                            </th>
                            <th style={{ textAlign: 'center', padding: '10px 5px', fontSize: '12px', color: 'var(--color-text-secondary)', width: '60px' }}>
                              {language === 'en' ? 'Shares' : 'शेयर'}
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {(analyticsData?.popularArticles || []).map((art) => (
                            <tr key={art._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                              <td style={{ padding: '10px 5px', fontSize: '13px', color: 'var(--color-text-primary)', maxWidth: '180px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                <Link to={`/news/${art._id}`} style={{ color: 'var(--color-text-primary)', textDecoration: 'none' }} target="_blank">
                                  {language === 'en' ? art.titleEn : art.titleHi}
                                </Link>
                              </td>
                              <td style={{ padding: '10px 5px', fontSize: '13px', color: 'var(--color-text-primary)', textAlign: 'center' }}>
                                {art.views || 0}
                              </td>
                              <td style={{ padding: '10px 5px', fontSize: '13px', color: 'var(--color-text-primary)', textAlign: 'center' }}>
                                {art.likes || 0}
                              </td>
                              <td style={{ padding: '10px 5px', fontSize: '13px', color: 'var(--color-text-primary)', textAlign: 'center' }}>
                                {art.shares || 0}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Right Column: Category & Subdivision Distribution */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>

                    {/* Categories distribution */}
                    <div className="glass" style={{
                      padding: '20px',
                      borderRadius: '12px',
                      border: '1px solid var(--border-color)',
                      background: 'rgba(11, 15, 25, 0.4)'
                    }}>
                      <h3 style={{ color: 'var(--color-text-primary)', fontSize: '16px', fontWeight: 600, marginBottom: '20px' }}>
                        {language === 'en' ? 'Categories Breakdown' : 'श्रेणियाँ विश्लेषण'}
                      </h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {(analyticsData?.categoryStats || []).map((cat, i) => {
                          const pct = (analyticsData?.totalArticles || 0) > 0
                            ? (cat.count / analyticsData.totalArticles) * 100
                            : 0;
                          return (
                            <div key={i}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '5px' }}>
                                <span style={{ color: 'var(--color-text-primary)', fontWeight: 500 }}>{language === 'en' ? cat.name : (t(cat.name.toLowerCase()) || cat.name)}</span>
                                <span>{cat.count} {language === 'en' ? 'articles' : 'समाचार'} ({Math.round(pct)}%)</span>
                              </div>
                              <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                                <div style={{
                                  width: `${pct}%`,
                                  height: '100%',
                                  background: 'linear-gradient(90deg, var(--color-primary) 0%, var(--color-secondary) 100%)',
                                  borderRadius: '3px'
                                }}></div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Subdivision breakdown */}
                    <div className="glass" style={{
                      padding: '20px',
                      borderRadius: '12px',
                      border: '1px solid var(--border-color)',
                      background: 'rgba(11, 15, 25, 0.4)'
                    }}>
                      <h3 style={{ color: 'var(--color-text-primary)', fontSize: '16px', fontWeight: 600, marginBottom: '20px' }}>
                        {language === 'en' ? 'Subdivisions Stats' : 'ब्लॉक / तहसील आंकड़े'}
                      </h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {(analyticsData?.subdivisionStats || []).map((sub, i) => {
                          const pct = (analyticsData?.totalArticles || 0) > 0
                            ? (sub.count / analyticsData.totalArticles) * 100
                            : 0;
                          return (
                            <div key={i}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '5px' }}>
                                <span style={{ color: 'var(--color-text-primary)', fontWeight: 500 }}>
                                  {sub.name === 'None'
                                    ? (language === 'en' ? 'General/District' : 'सामान्य / जिला स्तर')
                                    : (language === 'en' ? sub.name : t(sub.name.toLowerCase()))}
                                </span>
                                <span>{sub.count} {language === 'en' ? 'articles' : 'समाचार'}</span>
                              </div>
                              <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                                <div style={{
                                  width: `${pct}%`,
                                  height: '100%',
                                  background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)',
                                  borderRadius: '3px'
                                }}></div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                  </div>
                </div>

              </div>
            )}
          </div>
        )}

        {/* TAB 4: CONTACT MESSAGES */}
        {activeTab === 'settings' && (
          <div className="grid grid-cols-2" style={{ gap: '20px', alignItems: 'start' }}>
            <div className="contact-card">
              <h3 style={{ color: 'var(--color-text-primary)', marginBottom: '20px', fontSize: '18px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>{language === 'en' ? 'Admin Settings' : 'एडमिन सेटिंग्स'}</h3>
              <form onSubmit={handleUpdateCredentials}>
                <div className="form-group">
                  <label>{language === 'en' ? 'Username' : 'उपयोगकर्ता नाम'}</label>
                  <input type="text" className="form-control" required value={settingsUsername} onChange={e => setSettingsUsername(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>{language === 'en' ? 'New Password' : 'नया पासवर्ड'}</label>
                  <input type="password" className="form-control" required value={settingsPassword} onChange={e => setSettingsPassword(e.target.value)} minLength={8} />
                </div>
                <div className="form-group">
                  <label>{language === 'en' ? 'Confirm Password' : 'पासवर्ड पुष्टि'}</label>
                  <input type="password" className="form-control" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
                </div>
                <button type="submit" className="btn" style={{ width: 'auto' }}>{language === 'en' ? 'Update Credentials' : 'प्रमाणपत्र अपडेट करें'}</button>
              </form>
            </div>

            <div className="contact-card">
              <h3 style={{ color: 'var(--color-text-primary)', marginBottom: '20px', fontSize: '18px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                {language === 'en' ? 'Editor-in-Chief Profile' : 'मुख्य संपादक प्रोफ़ाइल'}
              </h3>
              <form onSubmit={handleEditorSubmit}>
                {/* Editor Name English & Hindi */}
                <div className="grid grid-cols-2" style={{ gap: '15px' }}>
                  <div className="form-group">
                    <label>{language === 'en' ? 'Name (Hindi) *' : 'नाम (हिंदी) *'}</label>
                    <input
                      id="editorNameHi"
                      type="text"
                      className="form-control"
                      required
                      value={editorNameHi}
                      onChange={(e) => setEditorNameHi(e.target.value)}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>{language === 'en' ? 'Name (English) *' : 'नाम (English) *'}</label>
                    <input
                      id="editorNameEn"
                      type="text"
                      className="form-control"
                      required
                      value={editorNameEn}
                      onChange={(e) => setEditorNameEn(e.target.value)}
                    />
                  </div>
                </div>

                {/* Editor Role English & Hindi */}
                <div className="grid grid-cols-2" style={{ gap: '15px' }}>
                  <div className="form-group">
                    <label>{language === 'en' ? 'Role (Hindi)' : 'पद (हिंदी)'}</label>
                    <input
                      id="editorRoleHi"
                      type="text"
                      className="form-control"
                      value={editorRoleHi}
                      onChange={(e) => setEditorRoleHi(e.target.value)}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>{language === 'en' ? 'Role (English)' : 'पद (English)'}</label>
                    <input
                      id="editorRoleEn"
                      type="text"
                      className="form-control"
                      value={editorRoleEn}
                      onChange={(e) => setEditorRoleEn(e.target.value)}
                    />
                  </div>
                </div>

                {/* Editor Description English & Hindi */}
                <div className="grid grid-cols-2" style={{ gap: '15px' }}>
                  <div className="form-group">
                    <label>{language === 'en' ? 'About (Hindi)' : 'के बारे में (हिंदी)'}</label>
                    <textarea
                      id="editorDescHi"
                      rows="3"
                      className="form-control"
                      value={editorDescHi}
                      onChange={(e) => setEditorDescHi(e.target.value)}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>{language === 'en' ? 'About (English)' : 'के बारे में (English)'}</label>
                    <textarea
                      id="editorDescEn"
                      rows="3"
                      className="form-control"
                      value={editorDescEn}
                      onChange={(e) => setEditorDescEn(e.target.value)}
                    />
                  </div>
                </div>

                {/* Mobile No & Social Link Fields */}
                <div className="grid grid-cols-2" style={{ gap: '15px' }}>
                  <div className="form-group">
                    <label>{language === 'en' ? 'Mobile Number' : 'मोबाइल नंबर'}</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="+91 1234567890"
                      value={editorMobile}
                      onChange={(e) => setEditorMobile(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>{language === 'en' ? 'Facebook Profile Link' : 'फेसबुक प्रोफाइल लिंक'}</label>
                    <input
                      type="url"
                      className="form-control"
                      placeholder="https://facebook.com/..."
                      value={editorFacebook}
                      onChange={(e) => setEditorFacebook(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2" style={{ gap: '15px' }}>
                  <div className="form-group">
                    <label>{language === 'en' ? 'Instagram Profile Link' : 'इंस्टाग्राम प्रोफाइल लिंक'}</label>
                    <input
                      type="url"
                      className="form-control"
                      placeholder="https://instagram.com/..."
                      value={editorInstagram}
                      onChange={(e) => setEditorInstagram(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>{language === 'en' ? 'YouTube Channel Link' : 'यूट्यूब चैनल लिंक'}</label>
                    <input
                      type="url"
                      className="form-control"
                      placeholder="https://youtube.com/..."
                      value={editorYoutube}
                      onChange={(e) => setEditorYoutube(e.target.value)}
                    />
                  </div>
                </div>

                {/* Editor Photo Upload */}
                <div className="form-group">
                  <label>{language === 'en' ? 'Upload Profile Photo' : 'प्रोफ़ाइल फ़ोटो अपलोड करें'}</label>
                  <input
                    id="editorPhotoInput"
                    type="file"
                    className="form-control"
                    accept="image/*,.heic,.heif"
                    onChange={(e) => setEditorPhotoFile(e.target.files[0])}
                  />

                  {/* Photo Preview */}
                  {(editorPhotoPreview || editorPhotoFile) && (
                    <div style={{ marginTop: '15px' }}>
                      <label style={{ fontSize: '13px', display: 'block', marginBottom: '6px' }}>{language === 'en' ? 'Photo Preview:' : 'फ़ोटो पूर्वावलोकन:'}</label>
                      <div style={{ width: '80px', height: '80px', border: '2px solid var(--color-primary)', borderRadius: '50%', overflow: 'hidden', background: '#000' }}>
                        {editorPhotoFile ? (
                          <img
                            src={URL.createObjectURL(editorPhotoFile)}
                            alt="Preview"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        ) : (
                          editorPhotoPreview && (
                            <img
                              src={editorPhotoPreview}
                              alt="Current Editor"
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          )
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <button id="editorSubmitBtn" type="submit" className="btn" style={{ width: 'auto', marginTop: '10px' }}>
                  {language === 'en' ? 'Save Profile' : 'प्रोफ़ाइल सहेजें'}
                </button>
              </form>
            </div>
          </div>
        )}
        {activeTab === 'messages' && (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>{language === 'en' ? 'Sender Details' : 'प्रेषक विवरण'}</th>
                  <th>{language === 'en' ? 'Message' : 'संदेश'}</th>
                  <th>{language === 'en' ? 'Status' : 'स्थिति'}</th>
                  <th>{t('actions')}</th>
                </tr>
              </thead>
              <tbody>
                {messages.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                      No messages from users yet.
                    </td>
                  </tr>
                ) : (
                  messages.map((msg) => (
                    <tr key={msg._id} style={{ opacity: msg.isRead ? 0.75 : 1 }}>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{msg.name}</div>
                        <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                          Email: {msg.email}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                          Phone: {msg.phone}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--color-primary)', marginTop: '4px' }}>
                          {new Date(msg.createdAt).toLocaleString()}
                        </div>
                      </td>
                      <td>
                        <div style={{ whiteSpace: 'pre-wrap', fontSize: '14px', maxWidth: '350px' }}>
                          {msg.message}
                        </div>
                      </td>
                      <td>
                        {msg.isRead ? (
                          <span style={{ color: 'var(--color-success)', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <CheckCircle size={12} /> Read
                          </span>
                        ) : (
                          <button
                            className="btn btn-sm btn-secondary"
                            onClick={() => handleMarkMessageRead(msg._id)}
                          >
                            Mark Read
                          </button>
                        )}
                      </td>
                      <td>
                        <button
                          className="btn btn-sm btn-danger"
                          style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                          onClick={() => handleDeleteMessage(msg._id)}
                        >
                          <Trash2 size={12} />
                          {t('delete')}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 5: MANAGE E-PAPER */}
        {activeTab === 'epaper' && (
          <div className="grid grid-cols-2">

            {/* Upload form */}
            <div className="contact-card">
              <h3 style={{ color: 'var(--color-text-primary)', marginBottom: '20px', fontSize: '18px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                {language === 'en' ? 'Upload E-Paper Edition' : 'ई-पेपर संस्करण अपलोड करें'}
              </h3>
              <form onSubmit={handleEPaperSubmit}>
                <div className="form-group">
                  <label>{language === 'en' ? 'Edition Date *' : 'संस्करण तिथि *'}</label>
                  <input
                    type="date"
                    required
                    className="form-control"
                    value={epaperDate}
                    onChange={(e) => setEpaperDate(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>{language === 'en' ? 'Title (Hindi) *' : 'शीर्षक (हिंदी) *'}</label>
                  <input
                    type="text"
                    required
                    placeholder="उदा. सिटी समाचार दैनिक - 6 जून 2026"
                    className="form-control"
                    value={epaperTitleHi}
                    onChange={(e) => setEpaperTitleHi(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>{language === 'en' ? 'Title (English) *' : 'शीर्षक (English) *'}</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. City Samachar Daily - 6th June 2026"
                    className="form-control"
                    value={epaperTitleEn}
                    onChange={(e) => setEpaperTitleEn(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>{language === 'en' ? 'Select E-Paper PDF * (PDF files only)' : 'ई-पेपर पीडीएफ चुनें * (केवल पीडीएफ फाइल)'}</label>
                  <input
                    id="epaperPdfInput"
                    type="file"
                    required
                    accept="application/pdf"
                    className="form-control"
                    onChange={(e) => setEpaperPdfFile(e.target.files[0])}
                  />
                </div>

                <div className="form-group">
                  <label>{language === 'en' ? 'Front Page Thumbnail Cover (Image only)' : 'फ्रंट पेज थंबनेल कवर (केवल छवि)'}</label>
                  <input
                    id="epaperThumbInput"
                    type="file"
                    accept="image/*,.heic,.heif"
                    className="form-control"
                    onChange={(e) => setEpaperThumbFile(e.target.files[0])}
                  />
                </div>

                <button type="submit" className="btn" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <Plus size={16} />
                  {language === 'en' ? 'Upload Edition' : 'संस्करण अपलोड करें'}
                </button>
              </form>
            </div>

            {/* List of uploaded E-Papers */}
            <div className="contact-card">
              <h3 style={{ color: 'var(--color-text-primary)', marginBottom: '20px', fontSize: '18px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                {language === 'en' ? 'Uploaded E-Papers' : 'अपलोड किए गए ई-पेपर'}
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '550px', overflowY: 'auto' }}>
                {epapersList.length === 0 ? (
                  <div style={{ color: 'var(--color-text-secondary)', textAlign: 'center', padding: '20px' }}>
                    {language === 'en' ? 'No PDF editions uploaded yet.' : 'अभी तक कोई पीडीएफ संस्करण अपलोड नहीं किया गया है।'}
                  </div>
                ) : (
                  epapersList.map((ep) => (
                    <div
                      key={ep._id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        background: 'rgba(11, 15, 25, 0.4)',
                        padding: '12px 15px',
                        borderRadius: 'var(--border-radius-sm)',
                        border: '1px solid var(--border-color)'
                      }}
                    >
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        {ep.thumbnailUrl ? (
                          <img
                            src={ep.thumbnailUrl}
                            alt="Cover"
                            style={{ width: '40px', height: '52px', objectFit: 'cover', borderRadius: '2px', border: '1px solid var(--border-color)' }}
                          />
                        ) : (
                          <div style={{ width: '40px', height: '52px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '2px' }}>
                            <FileText size={16} style={{ color: 'var(--color-text-secondary)' }} />
                          </div>
                        )}
                        <div>
                          <div style={{ color: 'var(--color-text-primary)', fontWeight: 600, fontSize: '14px' }}>
                            {language === 'en' ? ep.titleEn : ep.titleHi}
                          </div>
                          <div style={{ color: 'var(--color-primary)', fontSize: '12px', fontWeight: 'bold', marginTop: '2px' }}>
                            {ep.date}
                          </div>
                          <div style={{ marginTop: '4px' }}>
                            <a
                              href={ep.pdfUrl}
                              target="_blank"
                              rel="noreferrer"
                              style={{ color: 'var(--color-text-secondary)', fontSize: '11px', textDecoration: 'underline' }}
                            >
                              Download PDF
                            </a>
                          </div>
                        </div>
                      </div>

                      <button
                        className="btn btn-sm btn-danger"
                        style={{ padding: '6px 10px' }}
                        onClick={() => handleDeleteEPaper(ep._id)}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        )}

        {/* TAB 6: OPINION POLL EDITOR */}
        {activeTab === 'poll' && (
          <div className="grid grid-cols-2">

            {/* Edit Poll Form */}
            <div className="contact-card">
              <h3 style={{ color: 'var(--color-text-primary)', marginBottom: '20px', fontSize: '18px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                {language === 'en' ? 'Edit Opinion Poll' : 'ओपिनियन पोल संपादित करें'}
              </h3>

              <form onSubmit={handlePollSubmit}>

                {/* Question Hindi */}
                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <label style={{ margin: 0 }}>{language === 'en' ? 'Question (Hindi) *' : 'प्रश्न (हिंदी) *'}</label>
                    {pollQuestionEn && (
                      <button
                        type="button"
                        style={{ padding: '2px 8px', fontSize: '11px', borderRadius: '4px', height: '22px', display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(255,255,255,0.05)', color: 'var(--color-text-secondary)', border: '1px solid var(--border-color)', cursor: 'pointer' }}
                        onClick={() => handleTranslateText(pollQuestionEn, 'hi', setPollQuestionHi, 'pollQuestionHi', true)}
                        disabled={translatingFields['pollQuestionHi']}
                      >
                        <Languages size={11} className={translatingFields['pollQuestionHi'] ? 'animate-spin' : ''} />
                        {language === 'en' ? 'Translate' : 'अनुवाद करें'}
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    className="form-control"
                    required
                    value={pollQuestionHi}
                    onChange={(e) => setPollQuestionHi(e.target.value)}
                  />
                </div>

                {/* Question English */}
                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <label style={{ margin: 0 }}>{language === 'en' ? 'Question (English) *' : 'प्रश्न (English) *'}</label>
                    {pollQuestionHi && (
                      <button
                        type="button"
                        style={{ padding: '2px 8px', fontSize: '11px', borderRadius: '4px', height: '22px', display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(255,255,255,0.05)', color: 'var(--color-text-secondary)', border: '1px solid var(--border-color)', cursor: 'pointer' }}
                        onClick={() => handleTranslateText(pollQuestionHi, 'en', setPollQuestionEn, 'pollQuestionEn', true)}
                        disabled={translatingFields['pollQuestionEn']}
                      >
                        <Languages size={11} className={translatingFields['pollQuestionEn'] ? 'animate-spin' : ''} />
                        {language === 'en' ? 'Translate' : 'अनुवाद करें'}
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    className="form-control"
                    required
                    value={pollQuestionEn}
                    onChange={(e) => setPollQuestionEn(e.target.value)}
                  />
                </div>

                {/* Option 1 */}
                <div className="grid grid-cols-2">
                  <div className="form-group">
                    <label>{language === 'en' ? 'Option 1 (Hindi) *' : 'विकल्प 1 (हिंदी) *'}</label>
                    <input type="text" className="form-control" required value={pollOption1Hi} onChange={(e) => setPollOption1Hi(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>{language === 'en' ? 'Option 1 (English) *' : 'विकल्प 1 (English) *'}</label>
                    <input type="text" className="form-control" required value={pollOption1En} onChange={(e) => setPollOption1En(e.target.value)} />
                  </div>
                </div>

                {/* Option 2 */}
                <div className="grid grid-cols-2">
                  <div className="form-group">
                    <label>{language === 'en' ? 'Option 2 (Hindi) *' : 'विकल्प 2 (हिंदी) *'}</label>
                    <input type="text" className="form-control" required value={pollOption2Hi} onChange={(e) => setPollOption2Hi(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>{language === 'en' ? 'Option 2 (English) *' : 'विकल्प 2 (English) *'}</label>
                    <input type="text" className="form-control" required value={pollOption2En} onChange={(e) => setPollOption2En(e.target.value)} />
                  </div>
                </div>

                {/* Option 3 */}
                <div className="grid grid-cols-2">
                  <div className="form-group">
                    <label>{language === 'en' ? 'Option 3 (Hindi - Optional)' : 'विकल्प 3 (हिंदी - वैकल्पिक)'}</label>
                    <input type="text" className="form-control" value={pollOption3Hi} onChange={(e) => setPollOption3Hi(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>{language === 'en' ? 'Option 3 (English - Optional)' : 'विकल्प 3 (English - वैकल्पिक)'}</label>
                    <input type="text" className="form-control" value={pollOption3En} onChange={(e) => setPollOption3En(e.target.value)} />
                  </div>
                </div>

                {/* Reset Votes Checkbox */}
                <div className="form-group" style={{ marginTop: '10px' }}>
                  <label className="checkbox-label" style={{ fontWeight: 600, color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <input
                      type="checkbox"
                      checked={resetPollVotes}
                      onChange={(e) => setResetPollVotes(e.target.checked)}
                      style={{ transform: 'scale(1.2)' }}
                    />
                    {language === 'en' ? 'Reset vote counts to zero for this poll' : 'इस पोल के लिए वोट की संख्या शून्य (Reset) करें'}
                  </label>
                </div>

                <button type="submit" className="btn" style={{ width: 'auto', display: 'flex', gap: '8px', alignItems: 'center', marginTop: '15px' }}>
                  {t('saveBtn')}
                </button>
              </form>
            </div>

            {/* Poll Statistics Card */}
            <div className="contact-card">
              <h3 style={{ color: 'var(--color-text-primary)', marginBottom: '20px', fontSize: '18px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                {language === 'en' ? 'Current Results' : 'वर्तमान परिणाम'}
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 'bold', color: 'var(--color-text-primary)', marginBottom: '10px' }}>
                    {language === 'en' ? pollQuestionEn : pollQuestionHi}
                  </div>
                  <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                    Total Votes Cast: {votesOption1 + votesOption2 + votesOption3}
                  </span>
                </div>

                {/* Stat Bars */}
                {(() => {
                  const total = votesOption1 + votesOption2 + votesOption3 || 1;
                  const pct1 = Math.round((votesOption1 / total) * 100);
                  const pct2 = Math.round((votesOption2 / total) * 100);
                  const pct3 = Math.round((votesOption3 / total) * 100);

                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>

                      {/* Option 1 Bar */}
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                          <span style={{ color: 'var(--color-text-primary)' }}>{language === 'en' ? pollOption1En : pollOption1Hi}</span>
                          <span style={{ fontWeight: 'bold' }}>{votesOption1} ({pct1}%)</span>
                        </div>
                        <div className="poll-bar-bg" style={{ height: '10px' }}>
                          <div className="poll-bar-fill" style={{ width: `${pct1}%` }}></div>
                        </div>
                      </div>

                      {/* Option 2 Bar */}
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                          <span style={{ color: 'var(--color-text-primary)' }}>{language === 'en' ? pollOption2En : pollOption2Hi}</span>
                          <span style={{ fontWeight: 'bold' }}>{votesOption2} ({pct2}%)</span>
                        </div>
                        <div className="poll-bar-bg" style={{ height: '10px' }}>
                          <div className="poll-bar-fill" style={{ width: `${pct2}%`, background: '#64748b' }}></div>
                        </div>
                      </div>

                      {/* Option 3 Bar if set */}
                      {(pollOption3En || pollOption3Hi) && (
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                            <span style={{ color: 'var(--color-text-primary)' }}>{language === 'en' ? pollOption3En : pollOption3Hi}</span>
                            <span style={{ fontWeight: 'bold' }}>{votesOption3} ({pct3}%)</span>
                          </div>
                          <div className="poll-bar-bg" style={{ height: '10px' }}>
                            <div className="poll-bar-fill" style={{ width: `${pct3}%`, background: '#475569' }}></div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>

          </div>
        )}

        {/* TAB 7: MANAGE COMMENTS */}
        {activeTab === 'comments' && (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>{language === 'en' ? 'Commenter' : 'टिप्पणीकर्ता'}</th>
                  <th>{language === 'en' ? 'Comment' : 'टिप्पणी'}</th>
                  <th>{language === 'en' ? 'Post Title' : 'पोस्ट का शीर्षक'}</th>
                  <th>{language === 'en' ? 'Date' : 'तारीख'}</th>
                  <th>{t('actions')}</th>
                </tr>
              </thead>
              <tbody>
                {commentsList.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                      {language === 'en' ? 'No comments found.' : 'कोई टिप्पणी नहीं मिली।'}
                    </td>
                  </tr>
                ) : (
                  commentsList.map((comment) => (
                    <tr key={comment.commentId}>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{comment.name}</div>
                      </td>
                      <td>
                        <div style={{ whiteSpace: 'pre-wrap', fontSize: '14px', maxWidth: '350px' }}>
                          {comment.text}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>
                          <a
                            href={`/news/${comment.newsId}`}
                            target="_blank"
                            rel="noreferrer"
                            style={{ color: 'var(--color-primary)', textDecoration: 'underline' }}
                          >
                            {language === 'en' ? comment.newsTitleEn : comment.newsTitleHi}
                          </a>
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                          {language === 'en' ? comment.newsTitleHi : comment.newsTitleEn}
                        </div>
                      </td>
                      <td style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                        {comment.date}
                      </td>
                      <td>
                        <button
                          className="btn btn-sm btn-danger"
                          style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                          onClick={() => handleDeleteComment(comment.newsId, comment.commentId)}
                        >
                          <Trash2 size={12} />
                          {t('delete')}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
        {/* TAB: ADVERTISEMENTS LIST */}
        {activeTab === 'ads' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ color: 'var(--color-text-primary)', margin: 0, fontSize: '18px' }}>
                {language === 'en' ? 'Manage Advertisements' : 'विज्ञापन सूची एवं प्रबंधन'}
              </h3>
              <button
                className="btn"
                style={{ width: 'auto', display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px' }}
                onClick={() => { resetAdForm(); setActiveTab('adForm'); }}
              >
                <Plus size={16} />
                {language === 'en' ? 'Add Advertisement' : 'नया विज्ञापन'}
              </button>
            </div>

            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>{language === 'en' ? 'Title' : 'शीर्षक'}</th>
                    <th>{language === 'en' ? 'Preview' : 'पूर्वावलोकन'}</th>
                    <th>{language === 'en' ? 'Slot' : 'स्थान'}</th>
                    <th>{language === 'en' ? 'Size' : 'आकार'}</th>
                    <th>{language === 'en' ? 'Target Link' : 'लिंक'}</th>
                    <th>{language === 'en' ? 'Status' : 'स्थिति'}</th>
                    <th>{t('actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {adsList.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                        No advertisements uploaded yet.
                      </td>
                    </tr>
                  ) : (
                    adsList.map((ad) => (
                      <tr key={ad._id}>
                        <td 
                          style={{ 
                            fontWeight: 600, 
                            color: 'var(--color-text-primary)',
                            maxWidth: '180px',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                          title={ad.title}
                        >
                          {ad.title}
                        </td>
                        <td>
                          {ad.mediaType === 'video' ? (
                            <video
                              src={ad.mediaUrl}
                              style={{ width: '80px', maxHeight: '50px', borderRadius: '4px', objectFit: 'cover' }}
                              muted
                              playsInline
                            />
                          ) : (
                            <img
                              src={ad.mediaUrl}
                              alt={ad.title}
                              style={{ width: '80px', maxHeight: '50px', borderRadius: '4px', objectFit: 'cover' }}
                            />
                          )}
                        </td>
                        <td>
                          <span style={{ fontSize: '12px', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '4px' }}>
                            {ad.slot === 'top' ? (language === 'en' ? 'Top Banner' : 'शीर्ष बैनर') : (language === 'en' ? 'Sidebar' : 'साइडबार')}
                          </span>
                        </td>
                        <td>
                          <span style={{ fontSize: '12px', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '4px', textTransform: 'capitalize' }}>
                            {ad.size === 'original' ? (language === 'en' ? 'Original' : 'मूल') :
                              ad.size === 'large' ? (language === 'en' ? 'Large' : 'बड़ा') :
                                ad.size === 'medium' ? (language === 'en' ? 'Medium' : 'मध्यम') :
                                  ad.size === 'small' ? (language === 'en' ? 'Small' : 'छोटा') : (language === 'en' ? 'Original' : 'मूल')}
                          </span>
                        </td>
                        <td 
                          style={{ 
                            fontSize: '13px', 
                            color: 'var(--color-text-secondary)',
                            maxWidth: '180px',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                          title={ad.linkUrl}
                        >
                          {ad.linkUrl ? (
                            <a href={ad.linkUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--color-secondary)', textDecoration: 'underline' }}>
                              {ad.linkUrl}
                            </a>
                          ) : '-'}
                        </td>
                        <td>
                          <button
                            onClick={() => handleToggleAdStatus(ad)}
                            style={{
                              background: ad.isActive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                              color: ad.isActive ? '#10b981' : '#ef4444',
                              border: ad.isActive ? '1px solid #10b981' : '1px solid #ef4444',
                              padding: '2px 10px',
                              borderRadius: '20px',
                              fontSize: '11px',
                              cursor: 'pointer',
                              fontWeight: 600
                            }}
                          >
                            {ad.isActive ? (language === 'en' ? 'Active' : 'सक्रिय') : (language === 'en' ? 'Inactive' : 'निष्क्रिय')}
                          </button>
                        </td>
                        <td>
                          <div className="action-btns">
                            <button
                              className="btn btn-sm btn-secondary"
                              style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                              onClick={() => handleEditAd(ad)}
                            >
                              <Edit size={12} />
                              {t('edit')}
                            </button>
                            <button
                              className="btn btn-sm btn-danger"
                              style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                              onClick={() => handleDeleteAd(ad._id)}
                            >
                              <Trash2 size={12} />
                              {t('delete')}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB: CREATE / EDIT AD FORM */}
        {activeTab === 'adForm' && (
          <div className="contact-card">
            <h3 style={{ color: 'var(--color-text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginBottom: '20px', fontSize: '18px' }}>
              {editingAdId ? (language === 'en' ? 'Edit Advertisement' : 'विज्ञापन संपादित करें') : (language === 'en' ? 'New Advertisement' : 'नया विज्ञापन जोड़ें')}
            </h3>

            <form onSubmit={handleAdSubmit}>
              <div className="form-group">
                <label>{language === 'en' ? 'Ad Title / Campaign Name *' : 'विज्ञापन शीर्षक / अभियान का नाम *'}</label>
                <input
                  type="text"
                  className="form-control"
                  value={adTitle}
                  onChange={(e) => setAdTitle(e.target.value)}
                  placeholder={language === 'en' ? 'Enter ad title' : 'विज्ञापन का शीर्षक दर्ज करें'}
                  required
                />
              </div>

              <div className="form-group">
                <label>{language === 'en' ? 'Target Redirect Link URL' : 'रीडायरेक्ट लिंक URL (वैकल्पिक)'}</label>
                <input
                  type="url"
                  className="form-control"
                  value={adLinkUrl}
                  onChange={(e) => setAdLinkUrl(e.target.value)}
                  placeholder="https://example.com"
                />
              </div>

              <div className="grid grid-cols-3">
                <div className="form-group">
                  <label>{language === 'en' ? 'Placement Slot *' : 'विज्ञापन का स्थान *'}</label>
                  <select
                    className="form-control"
                    value={adSlot}
                    onChange={(e) => setAdSlot(e.target.value)}
                    style={{ background: '#0b0f1999', color: 'var(--color-text-primary)' }}
                  >
                    <option value="sidebar">{language === 'en' ? 'Sidebar Banner (Vertical)' : 'साइडबार बैनर'}</option>
                    <option value="top">{language === 'en' ? 'Top Banner (Horizontal)' : 'शीर्ष बैनर (होमपेज)'}</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>{language === 'en' ? 'Ad Size *' : 'विज्ञापन का आकार *'}</label>
                  <select
                    className="form-control"
                    value={adSize}
                    onChange={(e) => setAdSize(e.target.value)}
                    style={{ background: '#0b0f1999', color: 'var(--color-text-primary)' }}
                  >
                    <option value="original">{language === 'en' ? 'Original (Full)' : 'मूल (पूरा आकार)'}</option>
                    <option value="large">{language === 'en' ? 'Large' : 'बड़ा'}</option>
                    <option value="medium">{language === 'en' ? 'Medium' : 'मध्यम'}</option>
                    <option value="small">{language === 'en' ? 'Small' : 'छोटा'}</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>{language === 'en' ? 'Status *' : 'स्थिति *'}</label>
                  <select
                    className="form-control"
                    value={adIsActive ? 'true' : 'false'}
                    onChange={(e) => setAdIsActive(e.target.value === 'true')}
                    style={{ background: '#0b0f1999', color: 'var(--color-text-primary)' }}
                  >
                    <option value="true">{language === 'en' ? 'Active' : 'सक्रिय'}</option>
                    <option value="false">{language === 'en' ? 'Inactive' : 'निष्क्रिय'}</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>{language === 'en' ? 'Upload Media (Photo or Video) *' : 'मीडिया फ़ाइल अपलोड करें (फ़ोटो या वीडियो) *'}</label>
                <input
                  id="adFileInput"
                  type="file"
                  className="form-control"
                  accept="image/*,video/*,.heic,.heif"
                  onChange={(e) => setAdFile(e.target.files[0])}
                  required={!editingAdId}
                />
                <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '6px' }}>
                  {language === 'en' ? 'Supported formats: JPG, PNG, WEBP, GIF, MP4, WEBM, MOV (Max size: 15MB)' : 'समर्थित प्रारूप: JPG, PNG, WEBP, GIF, MP4, WEBM, MOV (अधिकतम आकार: 15MB)'}
                </p>

                {/* Preview existing or selected file */}
                {(adPreviewUrl || adFile) && (
                  <div style={{ marginTop: '15px' }}>
                    <label style={{ fontSize: '13px' }}>{language === 'en' ? 'Selected / Current Media Preview:' : 'वर्तमान मीडिया पूर्वावलोकन:'}</label>
                    <div style={{ marginTop: '8px', maxWidth: '300px', border: '1px solid var(--border-color)', borderRadius: '6px', overflow: 'hidden', background: '#000' }}>
                      {adFile ? (
                        adFile.type.startsWith('video/') ? (
                          <video
                            src={URL.createObjectURL(adFile)}
                            style={{ width: '100%', height: 'auto', display: 'block' }}
                            controls
                          />
                        ) : (
                          <img
                            src={URL.createObjectURL(adFile)}
                            alt="Preview"
                            style={{ width: '100%', height: 'auto', display: 'block' }}
                          />
                        )
                      ) : (
                        adPreviewUrl && (
                          adPreviewUrl.endsWith('.mp4') || adPreviewUrl.endsWith('.webm') || adPreviewUrl.endsWith('.mov') || adPreviewUrl.endsWith('.ogg') || adPreviewUrl.includes('video') ? (
                            <video
                              src={adPreviewUrl}
                              style={{ width: '100%', height: 'auto', display: 'block' }}
                              controls
                            />
                          ) : (
                            <img
                              src={adPreviewUrl}
                              alt="Current ad"
                              style={{ width: '100%', height: 'auto', display: 'block' }}
                            />
                          )
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '15px', marginTop: '30px' }}>
                <button
                  type="submit"
                  className="btn"
                  style={{ flex: 1 }}
                >
                  {editingAdId ? (language === 'en' ? 'Update Advertisement' : 'अपडेट करें') : (language === 'en' ? 'Publish Advertisement' : 'प्रकाशित करें')}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                  onClick={() => { resetAdForm(); setActiveTab('ads'); }}
                >
                  {language === 'en' ? 'Cancel' : 'रद्द करें'}
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}

