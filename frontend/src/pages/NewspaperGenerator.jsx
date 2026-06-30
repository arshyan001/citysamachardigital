import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLanguage } from '../context/LanguageContext';
import Swal from 'sweetalert2';
import {
  ArrowLeft,
  Download,
  Printer,
  Newspaper,
  RefreshCw,
  Calendar,
  CheckSquare,
  Square,
  Eye,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// ── helpers ──────────────────────────────────────────────────────────────────

/** Strip HTML tags so plain text is shown in the newspaper */
const stripHtml = (html = '') => html.replace(/<[^>]*>/g, '').trim();

/** Truncate text to maxLen characters */
const truncate = (text = '', maxLen = 400) =>
  text.length > maxLen ? text.substring(0, maxLen) + '…' : text;

/** Format a Date object → Hindi/English readable string */
const formatDate = (dateStr, lang) => {
  try {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
};

// ── Volume number (simple deterministic based on date) ─────────────────────
const getVolumeNo = (dateStr) => {
  const d = new Date(dateStr);
  const startYear = 2020;
  const year = d.getFullYear();
  const vol = year - startYear + 1;
  const startOfYear = new Date(year, 0, 1);
  const issue = Math.ceil((d - startOfYear) / (7 * 24 * 60 * 60 * 1000));
  return { vol, issue };
};

// ─────────────────────────────────────────────────────────────────────────────
//  THE NEWSPAPER LAYOUT (rendered inside the PDF area)
// ─────────────────────────────────────────────────────────────────────────────

function NewspaperLayout({ articles, language, selectedDate }) {
  const lang = language;
  const formattedDate = formatDate(selectedDate, lang);
  const { vol, issue } = getVolumeNo(selectedDate);

  const title = (a) => (lang === 'hi' ? a.titleHi || a.titleEn : a.titleEn || a.titleHi);
  const content = (a) =>
    stripHtml(lang === 'hi' ? a.contentHi || a.contentEn : a.contentEn || a.contentHi);
  const summary = (a) =>
    stripHtml(lang === 'hi' ? a.summaryHi || a.summaryEn : a.summaryEn || a.summaryHi);

  const lead = articles[0];
  const secondaries = articles.slice(1, 3);
  const rest = articles.slice(3, 6);

  const backendBase =
    window.location.hostname === 'localhost'
      ? 'http://localhost:5000'
      : window.location.origin;

  const imgSrc = (article) => {
    if (!article?.images?.length) return null;
    const img = article.images[0];
    if (img.startsWith('http')) return img;
    return backendBase + img;
  };

  return (
    <div
      className="newspaper-page"
      id="newspaper-print-area"
      style={{ background: '#fdfcf5', color: '#1a1a1a' }}
    >
      {/* ── MASTHEAD ── */}
      <div className="newspaper-masthead">
        <h1 style={{ fontSize: '44px' }}>
          {lang === 'hi' ? 'सिटी समाचार डिजिटल' : 'City Samachar Digital'}
        </h1>
        <p className="masthead-tagline">
          {lang === 'hi'
            ? 'संत कबीर नगर का अपना दैनिक समाचार पत्र'
            : "Sant Kabir Nagar's Premier Daily Newspaper"}
        </p>
      </div>

      {/* ── METABAR ── */}
      <div className="newspaper-metabar">
        <span>
          {lang === 'hi' ? `वर्ष ${vol}, अंक ${issue}` : `Vol. ${vol}, No. ${issue}`}
        </span>
        <span style={{ fontSize: '12px', letterSpacing: 0 }}>{formattedDate}</span>
        <span>
          {lang === 'hi' ? 'डिजिटल संस्करण | मूल्य: निःशुल्क' : 'Digital Edition | Price: Free'}
        </span>
      </div>

      {/* ── NO ARTICLES FALLBACK ── */}
      {articles.length === 0 && (
        <div className="newspaper-empty">
          <p>
            {lang === 'hi'
              ? 'इस तिथि के लिए कोई समाचार उपलब्ध नहीं है।'
              : 'No news articles available for this date.'}
          </p>
        </div>
      )}

      {/* ── LEAD STORY ── */}
      {lead && (
        <div className="newspaper-lead-story">
          <div style={{ textAlign: 'center', marginBottom: '12px' }}>
            <span className="newspaper-section-label">
              {lang === 'hi' ? 'मुख्य समाचार' : 'Top Story'}
            </span>
          </div>

          <div className="newspaper-lead-headline">{title(lead)}</div>

          {summary(lead) && (
            <div className="newspaper-lead-subheadline">{truncate(summary(lead), 180)}</div>
          )}

          <div className="newspaper-lead-grid">
            {/* Text column */}
            <div>
              <p
                className="newspaper-article-text newspaper-dropcap"
                style={{ columnCount: 2, columnGap: '14px', columnRule: '1px solid #c8c0a8' }}
              >
                {truncate(content(lead), 900)}
              </p>
            </div>

            {/* Image column */}
            <div>
              {imgSrc(lead) ? (
                <>
                  <img
                    src={imgSrc(lead)}
                    alt={title(lead)}
                    className="newspaper-image"
                    style={{ height: '180px', objectFit: 'cover' }}
                    crossOrigin="anonymous"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                  <p className="newspaper-image-caption">
                    {lang === 'hi' ? 'फ़ाइल फ़ोटो' : 'File Photo'}
                  </p>
                </>
              ) : (
                <div
                  style={{
                    height: '180px',
                    background: '#e8e0d0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid #c0b898',
                    color: '#888',
                    fontSize: '12px',
                    fontStyle: 'italic',
                  }}
                >
                  {lang === 'hi' ? 'चित्र उपलब्ध नहीं' : 'No image available'}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── SECONDARY STORIES ── */}
      {secondaries.length > 0 && (
        <>
          <div className="newspaper-hr thick" />
          <div
            className={`newspaper-stories-row ${
              secondaries.length === 1 ? 'two-col' : 'two-col'
            }`}
          >
            {secondaries.map((article, i) => (
              <div
                key={article._id}
                className="newspaper-story-block"
                style={i === secondaries.length - 1 ? { borderRight: 'none', paddingRight: 0 } : {}}
              >
                {imgSrc(article) && (
                  <img
                    src={imgSrc(article)}
                    alt={title(article)}
                    className="newspaper-image"
                    style={{ height: '110px', objectFit: 'cover', marginBottom: '8px' }}
                    crossOrigin="anonymous"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                )}
                <div className="newspaper-story-headline">{title(article)}</div>
                <p className="newspaper-story-text">{truncate(content(article), 350)}</p>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── REST STORIES (bottom row, 3-col if enough) ── */}
      {rest.length > 0 && (
        <>
          <div className="newspaper-hr" style={{ margin: '14px 0' }} />
          <div style={{ textAlign: 'left', marginBottom: '8px' }}>
            <span className="newspaper-section-label">
              {lang === 'hi' ? 'अन्य समाचार' : 'Other News'}
            </span>
          </div>
          <div
            className={`newspaper-stories-row ${
              rest.length >= 3 ? 'three-col' : rest.length === 2 ? 'two-col' : ''
            }`}
          >
            {rest.map((article, i) => (
              <div
                key={article._id}
                className="newspaper-story-block"
                style={i === rest.length - 1 ? { borderRight: 'none', paddingRight: 0 } : {}}
              >
                <div
                  className="newspaper-story-headline"
                  style={{ fontSize: '14px' }}
                >
                  {title(article)}
                </div>
                <p className="newspaper-story-text" style={{ fontSize: '11px' }}>
                  {truncate(content(article), 200)}
                </p>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── FOOTER ── */}
      <div className="newspaper-footer">
        <span>
          {lang === 'hi'
            ? '© 2024-25 सिटी समाचार डिजिटल। सर्वाधिकार सुरक्षित।'
            : '© 2024-25 City Samachar Digital. All rights reserved.'}
        </span>
        <span>citysamachardigital.com</span>
        <span>
          {lang === 'hi' ? 'मुद्रक व प्रकाशक: संपादक मंडल' : 'Printed & Published by: Editorial Board'}
        </span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export default function NewspaperGenerator() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const printRef = useRef(null);

  // ── state ──
  const [selectedDate, setSelectedDate] = useState(
    () => new Date().toISOString().split('T')[0]
  );
  const [paperLang, setPaperLang] = useState(language || 'hi');
  const [allNews, setAllNews] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [showPreview, setShowPreview] = useState(true);

  // ── fetch news for chosen date ──────────────────────────────────────────
  const fetchNews = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/news');
      if (!res.ok) throw new Error('Failed to fetch news');
      const data = await res.json();

      // Filter by date: createdAt matches selectedDate
      const filtered = data.filter((n) => {
        const created = n.createdAt
          ? new Date(n.createdAt).toISOString().split('T')[0]
          : null;
        return created === selectedDate;
      });

      setAllNews(filtered);
      // auto-select all (up to 6)
      setSelectedIds(filtered.slice(0, 6).map((n) => n._id));
    } catch (err) {
      setError(err.message || 'Error loading news');
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  // ── selected articles (preserve order) ────────────────────────────────
  const selectedArticles = allNews.filter((n) => selectedIds.includes(n._id));

  // ── toggle checkbox ────────────────────────────────────────────────────
  const toggleArticle = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : selectedIds.length < 6
        ? [...prev, id]
        : prev // max 6 for layout
    );
  };

  const selectAll = () => setSelectedIds(allNews.slice(0, 6).map((n) => n._id));
  const selectNone = () => setSelectedIds([]);

  // ── PDF Download via jsPDF + html2canvas ─────────────────────────────
  const handleDownloadPDF = async () => {
    if (!printRef.current) return;
    setGenerating(true);
    try {
      const canvas = await html2canvas(printRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#fdfcf5',
        logging: false,
        imageTimeout: 10000,
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.92);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfW = pdf.internal.pageSize.getWidth();
      const pdfH = pdf.internal.pageSize.getHeight();
      const canvasRatio = canvas.height / canvas.width;
      const imgH = pdfW * canvasRatio;

      // If content fits in one page
      if (imgH <= pdfH) {
        pdf.addImage(imgData, 'JPEG', 0, 0, pdfW, imgH);
      } else {
        // Multi-page: slice canvas
        let yOffset = 0;
        const pageHeightPx = (pdfH / pdfW) * canvas.width;

        while (yOffset < canvas.height) {
          const pageCanvas = document.createElement('canvas');
          pageCanvas.width = canvas.width;
          pageCanvas.height = Math.min(pageHeightPx, canvas.height - yOffset);
          const ctx = pageCanvas.getContext('2d');
          ctx.drawImage(canvas, 0, -yOffset);
          const pageData = pageCanvas.toDataURL('image/jpeg', 0.92);
          pdf.addImage(pageData, 'JPEG', 0, 0, pdfW, pdfH);
          yOffset += pageHeightPx;
          if (yOffset < canvas.height) pdf.addPage();
        }
      }

      const dateStr = selectedDate.replace(/-/g, '');
      pdf.save(`CitySamachar_${dateStr}.pdf`);
    } catch (err) {
      console.error('PDF generation error:', err);
      Swal.fire({
        icon: 'error',
        title: paperLang === 'hi' ? 'पीडीएफ बनाने में त्रुटि हुई' : 'Error generating PDF',
        text: paperLang === 'hi'
          ? 'कृपया दोबारा प्रयास करें।'
          : 'Please try again.'
      });
    } finally {
      setGenerating(false);
    }
  };

  // ── Print ─────────────────────────────────────────────────────────────
  const handlePrint = () => window.print();

  // ─────────────────────────────────────────────────────────────────────────
  //  RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="newspaper-generator-wrapper">
      {/* PDF generating overlay */}
      {generating && (
        <div className="newspaper-generating-overlay">
          <RefreshCw size={48} style={{ color: '#ef4444', animation: 'spin 1s linear infinite' }} />
          <p>
            {paperLang === 'hi'
              ? '📰 पीडीएफ तैयार हो रही है… कृपया प्रतीक्षा करें'
              : '📰 Generating PDF… Please wait'}
          </p>
        </div>
      )}

      <div className="container">
        {/* ── TOP TOOLBAR ── */}
        <div className="newspaper-toolbar">
          {/* Back */}
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
              fontSize: '15px',
            }}
          >
            <ArrowLeft size={16} />
            {paperLang === 'hi' ? 'वापस जाएं' : 'Back'}
          </button>

          {/* Title */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              color: 'var(--color-text-primary)',
              fontWeight: 700,
              fontSize: '16px',
            }}
          >
            <Newspaper size={20} style={{ color: 'var(--color-primary)' }} />
            {paperLang === 'hi' ? 'ऑटो समाचार पत्र जनरेटर' : 'Auto Newspaper Generator'}
          </div>

          {/* Controls group */}
          <div className="newspaper-toolbar-group">
            {/* Date picker */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-text-secondary)', fontSize: '13px' }}>
              <Calendar size={14} />
              <input
                type="date"
                className="form-control"
                style={{ width: '148px', height: '34px', padding: '0 8px', fontSize: '13px' }}
                value={selectedDate}
                max={new Date().toISOString().split('T')[0]}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>

            {/* Language toggle */}
            <button
              className="lang-toggle"
              onClick={() => setPaperLang((l) => (l === 'hi' ? 'en' : 'hi'))}
              style={{ fontSize: '12px', padding: '6px 12px' }}
            >
              {paperLang === 'hi' ? '🇮🇳 हिंदी' : '🇬🇧 English'}
            </button>

            {/* Preview toggle */}
            <button
              className="lang-toggle"
              onClick={() => setShowPreview((v) => !v)}
              style={{ fontSize: '12px', padding: '6px 12px' }}
            >
              <Eye size={13} style={{ marginRight: '4px' }} />
              {showPreview
                ? paperLang === 'hi' ? 'प्रिव्यू छुपाएं' : 'Hide Preview'
                : paperLang === 'hi' ? 'प्रिव्यू दिखाएं' : 'Show Preview'}
            </button>

            {/* Print */}
            <button
              className="lang-toggle"
              onClick={handlePrint}
              disabled={selectedArticles.length === 0}
              title={paperLang === 'hi' ? 'प्रिंट करें' : 'Print'}
              style={{ fontSize: '12px', padding: '6px 12px' }}
            >
              <Printer size={14} />
            </button>

            {/* Download PDF */}
            <button
              className="btn"
              onClick={handleDownloadPDF}
              disabled={selectedArticles.length === 0 || generating}
              style={{
                width: 'auto',
                padding: '8px 18px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '13px',
                height: '36px',
              }}
            >
              {generating ? (
                <RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} />
              ) : (
                <Download size={14} />
              )}
              {paperLang === 'hi' ? 'PDF डाउनलोड' : 'Download PDF'}
            </button>
          </div>
        </div>

        {/* ── NEWS SELECTOR ── */}
        <div className="newspaper-news-selector">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '14px',
              paddingBottom: '10px',
              borderBottom: '1px solid var(--border-color)',
            }}
          >
            <h3 style={{ margin: 0 }}>
              <FileText size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
              {paperLang === 'hi'
                ? `${selectedDate} की खबरें (${allNews.length} मिलीं)`
                : `News for ${selectedDate} (${allNews.length} found)`}
            </h3>

            {allNews.length > 0 && (
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={selectAll}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--color-primary)',
                    cursor: 'pointer',
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <CheckSquare size={13} />
                  {paperLang === 'hi' ? 'सभी चुनें' : 'Select All'}
                </button>
                <button
                  onClick={selectNone}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--color-text-secondary)',
                    cursor: 'pointer',
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <Square size={13} />
                  {paperLang === 'hi' ? 'कोई नहीं' : 'Deselect'}
                </button>
              </div>
            )}
          </div>

          {/* Loading state */}
          {loading && (
            <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--color-text-secondary)' }}>
              <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite', color: 'var(--color-primary)' }} />
              <p style={{ marginTop: '10px', fontSize: '13px' }}>
                {paperLang === 'hi' ? 'खबरें लोड हो रही हैं…' : 'Loading news…'}
              </p>
            </div>
          )}

          {/* Error state */}
          {!loading && error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f87171', padding: '14px 0', fontSize: '13px' }}>
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {/* No news found */}
          {!loading && !error && allNews.length === 0 && (
            <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--color-text-secondary)', fontSize: '13px' }}>
              <Newspaper size={32} style={{ opacity: 0.3, marginBottom: '10px' }} />
              <p>
                {paperLang === 'hi'
                  ? 'इस तिथि के लिए कोई खबर नहीं मिली। दूसरी तारीख़ चुनें।'
                  : 'No news found for this date. Try a different date.'}
              </p>
            </div>
          )}

          {/* News list */}
          {!loading && allNews.length > 0 && (
            <div>
              <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginBottom: '10px' }}>
                {paperLang === 'hi'
                  ? `अधिकतम 6 खबरें चुनें। (${selectedIds.length}/6 चुनी हैं)`
                  : `Select up to 6 articles. (${selectedIds.length}/6 selected)`}
              </p>
              {allNews.map((article) => {
                const isSelected = selectedIds.includes(article._id);
                const isDisabled = !isSelected && selectedIds.length >= 6;
                return (
                  <label
                    key={article._id}
                    className="news-select-item"
                    style={{ opacity: isDisabled ? 0.45 : 1, cursor: isDisabled ? 'not-allowed' : 'pointer' }}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      disabled={isDisabled}
                      onChange={() => !isDisabled && toggleArticle(article._id)}
                    />
                    <div className="news-select-item-text">
                      <div>
                        {paperLang === 'hi'
                          ? article.titleHi || article.titleEn
                          : article.titleEn || article.titleHi}
                      </div>
                      <div className="item-date">
                        {article.subdivision && article.subdivision !== 'None'
                          ? `📍 ${article.subdivision} · `
                          : ''}
                        {article.createdAt
                          ? new Date(article.createdAt).toLocaleTimeString('hi-IN', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : ''}
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        {/* ── STATUS BAR ── */}
        {selectedArticles.length > 0 && (
          <div
            style={{
              background: 'rgba(16, 185, 129, 0.08)',
              borderLeft: '3px solid #10b981',
              padding: '10px 16px',
              borderRadius: '4px',
              marginBottom: '20px',
              fontSize: '13px',
              color: 'var(--color-text-primary)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <CheckSquare size={14} style={{ color: '#10b981' }} />
            {paperLang === 'hi'
              ? `✅ ${selectedArticles.length} खबरें चुनी हैं — नीचे अखबार का प्रिव्यू देखें और PDF डाउनलोड करें।`
              : `✅ ${selectedArticles.length} articles selected — Preview the newspaper below and download as PDF.`}
          </div>
        )}

        {/* ── NEWSPAPER PREVIEW ── */}
        {showPreview && (
          <div style={{ overflowX: 'auto', paddingBottom: '30px' }}>
            <div ref={printRef}>
              <NewspaperLayout
                articles={selectedArticles}
                language={paperLang}
                selectedDate={selectedDate}
              />
            </div>
          </div>
        )}

        {/* Download button repeated at bottom for convenience */}
        {selectedArticles.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', marginTop: '24px' }}>
            <button
              className="btn"
              onClick={handleDownloadPDF}
              disabled={generating}
              style={{
                width: 'auto',
                padding: '12px 32px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontSize: '15px',
              }}
            >
              {generating ? (
                <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} />
              ) : (
                <Download size={16} />
              )}
              {paperLang === 'hi' ? '📥 PDF डाउनलोड करें' : '📥 Download PDF'}
            </button>

            <button
              className="lang-toggle"
              onClick={handlePrint}
              style={{ padding: '12px 24px', fontSize: '14px', borderRadius: '8px' }}
            >
              <Printer size={16} style={{ marginRight: '8px' }} />
              {paperLang === 'hi' ? 'प्रिंट करें' : 'Print'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
