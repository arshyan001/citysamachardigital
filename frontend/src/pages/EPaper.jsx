import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { ArrowLeft, ZoomIn, ZoomOut, Download, Calendar, Printer, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function EPaper() {
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  
  const [zoom, setZoom] = useState(100);
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [activePage, setActivePage] = useState(1);
  const [downloading, setDownloading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadedEPaper, setUploadedEPaper] = useState(null);

  useEffect(() => {
    const fetchEPaperByDate = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/epaper/date/${selectedDate}`);
        if (res.ok) {
          const data = await res.json();
          setUploadedEPaper(data);
        } else {
          setUploadedEPaper(null);
        }
      } catch (err) {
        console.error('Error fetching epaper by date:', err);
        setUploadedEPaper(null);
      } finally {
        setLoading(false);
      }
    };

    fetchEPaperByDate();
  }, [selectedDate]);

  const handleZoomIn = () => {
    if (zoom < 150) setZoom(prev => prev + 10);
  };

  const handleZoomOut = () => {
    if (zoom > 70) setZoom(prev => prev - 10);
  };

  const handleDownload = () => {
    if (uploadedEPaper) {
      window.open(uploadedEPaper.pdfUrl, '_blank');
      return;
    }
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      alert(language === 'en' ? 'Mock PDF download complete!' : 'मॉक पीडीएफ डाउनलोड पूर्ण हुआ!');
    }, 2000);
  };

  const formattedDate = new Date(selectedDate).toLocaleDateString(
    language === 'en' ? 'en-US' : 'hi-IN',
    { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
  );

  return (
    <div className="container" style={{ marginTop: '30px' }}>
      
      {/* EPaper Toolbar Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', marginBottom: '25px' }} className="glass p-3 rounded-lg">
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
            fontSize: '15px'
          }}
        >
          <ArrowLeft size={16} />
          {language === 'en' ? 'Back to Portal' : 'पोर्टल पर लौटें'}
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--color-text-primary)' }}>
          <Calendar size={18} style={{ color: 'var(--color-primary)' }} />
          <input 
            type="date" 
            className="form-control" 
            style={{ width: '150px', height: '36px', padding: '0 8px', fontSize: '13px' }}
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>

        {/* EPaper Controls (Only show when using mock layout) */}
        {!uploadedEPaper && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button className="lang-toggle" onClick={handleZoomOut} disabled={zoom <= 70} style={{ padding: '8px' }}>
              <ZoomOut size={16} />
            </button>
            <span style={{ fontSize: '13px', fontWeight: 'bold', width: '50px', textAlign: 'center', color: 'var(--color-text-primary)' }}>{zoom}%</span>
            <button className="lang-toggle" onClick={handleZoomIn} disabled={zoom >= 150} style={{ padding: '8px' }}>
              <ZoomIn size={16} />
            </button>
            
            <button className="lang-toggle" onClick={() => window.print()} style={{ padding: '8px' }} title={language === 'en' ? 'Print Page' : 'प्रिंट करें'}>
              <Printer size={16} />
            </button>
            
            <button 
              onClick={handleDownload} 
              className="btn" 
              style={{ width: 'auto', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', height: '36px' }}
              disabled={downloading}
            >
              {downloading ? <RefreshCw size={14} className="animate-spin" /> : <Download size={14} />}
              {language === 'en' ? 'Download PDF' : 'पीडीएफ डाउनलोड'}
            </button>
          </div>
        )}
      </div>

      {/* Pages Selector Bar (Only show when using mock layout) */}
      {!uploadedEPaper && !loading && (
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '25px' }}>
          {[1, 2, 3, 4].map(pageNum => (
            <button 
              key={pageNum}
              onClick={() => setActivePage(pageNum)}
              className={`lang-toggle ${activePage === pageNum ? 'active' : ''}`}
              style={{
                background: activePage === pageNum ? 'var(--color-primary)' : 'transparent',
                borderColor: activePage === pageNum ? 'var(--color-primary)' : 'var(--border-color)',
                color: '#fff',
                padding: '6px 16px'
              }}
            >
              {language === 'en' ? `Page ${pageNum}` : `पृष्ठ ${pageNum}`}
            </button>
          ))}
        </div>
      )}

      {/* E-Paper Content View Area */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
          <RefreshCw size={48} className="animate-spin" style={{ color: 'var(--color-primary)' }} />
        </div>
      ) : uploadedEPaper ? (
        /* PDF Viewer Layout */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', margin: '20px 0' }}>
          
          {/* Status info banner */}
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', borderLeft: '4px solid var(--color-primary)', padding: '12px 20px', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--color-text-primary)', fontSize: '14px', fontWeight: 600 }}>
              {language === 'en' 
                ? `📄 PDF Edition found for this date: ${uploadedEPaper.titleEn}` 
                : `📄 इस तिथि के लिए पीडीएफ संस्करण उपलब्ध है: ${uploadedEPaper.titleHi}`}
            </span>
          </div>

          {/* Main Display: Cover card & controls */}
          <div className="contact-card" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px' }}>
            {/* Left Column: Thumbnail Cover */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              {uploadedEPaper.thumbnailUrl ? (
                <img 
                  src={uploadedEPaper.thumbnailUrl} 
                  alt="E-Paper Cover" 
                  style={{ width: '100%', maxWidth: '280px', maxHeight: '400px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border-color)', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}
                />
              ) : (
                <div style={{ width: '100%', maxWidth: '280px', height: '360px', background: 'rgba(255,255,255,0.03)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', border: '1px dashed var(--border-color)' }}>
                  <Printer size={64} style={{ color: 'var(--color-text-secondary)', marginBottom: '15px' }} />
                  <span style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>
                    {language === 'en' ? 'No Cover Preview Available' : 'कवर पूर्वावलोकन उपलब्ध नहीं है'}
                  </span>
                </div>
              )}
            </div>

            {/* Right Column: PDF Viewer info & Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '20px', color: 'var(--color-text-primary)' }}>
              <div>
                <span style={{ background: 'var(--color-primary)', color: 'white', padding: '4px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>
                  {language === 'en' ? 'PDF Edition' : 'पीडीएफ संस्करण'}
                </span>
                <h2 style={{ fontSize: '26px', color: '#fff', marginTop: '12px', fontWeight: 'bold', lineHeight: '1.3' }}>
                  {language === 'en' ? uploadedEPaper.titleEn : uploadedEPaper.titleHi}
                </h2>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px', marginTop: '8px' }}>
                  {language === 'en' 
                    ? `Published on ${uploadedEPaper.date}` 
                    : `प्रकाशन तिथि: ${uploadedEPaper.date}`}
                </p>
              </div>

              <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', marginTop: '10px' }}>
                <a 
                  href={uploadedEPaper.pdfUrl} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="btn" 
                  style={{ width: 'auto', display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', textDecoration: 'none' }}
                >
                  <Download size={16} />
                  {language === 'en' ? 'Download PDF' : 'पीडीएफ डाउनलोड करें'}
                </a>
                
                <a 
                  href={uploadedEPaper.pdfUrl} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="btn btn-secondary" 
                  style={{ width: 'auto', display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', textDecoration: 'none' }}
                >
                  <ZoomIn size={16} />
                  {language === 'en' ? 'View Fullscreen' : 'फुलस्क्रीन देखें'}
                </a>
              </div>

              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px', marginTop: '10px' }}>
                <h4 style={{ fontSize: '13px', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
                  {language === 'en' ? 'Trouble viewing?': 'देखने में समस्या हो रही है?'}
                </h4>
                <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                  {language === 'en' 
                    ? 'Use the download button to save the PDF directly to your device and view it offline.' 
                    : 'पीडीएफ को सीधे अपने डिवाइस पर सहेजने और ऑफ़लाइन देखने के लिए डाउनलोड बटन का उपयोग करें।'}
                </p>
              </div>
            </div>
          </div>

          {/* Embedded PDF iframe section */}
          <div style={{ width: '100%', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)', boxShadow: '0 10px 40px rgba(0,0,0,0.2)' }}>
            <div style={{ background: 'var(--bg-card)', padding: '10px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#fff', fontSize: '14px', fontWeight: 600 }}>
                {language === 'en' ? 'Interactive PDF Reader' : 'इंटरएक्टिव पीडीएफ रीडर'}
              </span>
              <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                {language === 'en' ? 'PDF Mode' : 'पीडीएफ मोड'}
              </span>
            </div>
            <iframe 
              src={uploadedEPaper.pdfUrl} 
              title="EPaper PDF Viewer" 
              width="100%" 
              height="800px" 
              style={{ border: 'none', background: '#fff' }}
            />
          </div>

        </div>
      ) : (
        /* Fallback: Interactive CSS layout news-sheet (current mock layout) */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Status info banner */}
          <div style={{ background: 'rgba(251, 191, 36, 0.08)', borderLeft: '4px solid #fbbf24', padding: '12px 20px', borderRadius: '4px' }}>
            <span style={{ color: 'var(--color-text-primary)', fontSize: '13px' }}>
              {language === 'en' 
                ? 'ℹ️ Showing digital web edition for this date (No uploaded PDF).' 
                : 'ℹ️ इस तिथि के लिए डिजिटल वेब संस्करण दिखाया जा रहा है (कोई पीडीएफ अपलोड नहीं है)।'}
            </span>
          </div>

          <div style={{ overflowX: 'auto', width: '100%', padding: '20px 0', display: 'flex', justifyContent: 'center' }}>
            <div 
              className="epaper-page-view" 
              style={{ 
                transform: `scale(${zoom / 100})`, 
                transformOrigin: 'top center',
                marginBottom: `${(zoom - 100) * 5}px`, // Adjust margin to offset scaling whitespace
                color: '#1e293b',
                background: '#fcfbf7', // Warm newsprint color
                border: '20px solid #ffffff',
                boxShadow: '0 20px 50px rgba(0,0,0,0.15)',
                fontFamily: 'serif',
                maxWidth: '850px',
                width: '100%',
                padding: '30px',
                borderRadius: '4px',
                lineHeight: '1.4'
              }}
            >
              {/* Newspaper Masthead */}
              <div style={{ borderBottom: '6px double #1e293b', borderTop: '2px solid #1e293b', padding: '15px 0', textAlign: 'center', marginBottom: '15px' }}>
                <h1 style={{ fontSize: '56px', fontWeight: '900', letterSpacing: '-1.5px', fontFamily: 'serif', margin: 0, textTransform: 'uppercase', color: '#1e293b', lineHeight: 1 }}>
                  {language === 'en' ? 'City Samachar Digital' : 'सिटी समाचार डिजिटल'}
                </h1>
                <p style={{ margin: '5px 0 0 0', fontStyle: 'italic', fontSize: '15px', color: '#475569' }}>
                  {language === 'en' ? 'Sant Kabir Nagar\'s Premier Daily Newspaper' : 'संत कबीर नगर का अपना दैनिक समाचार पत्र'}
                </p>
              </div>

              {/* Newspaper Metabar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #1e293b', paddingBottom: '6px', fontSize: '13px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '25px', color: '#1e293b' }}>
                <span>{language === 'en' ? 'Vol. X No. 156' : 'वर्ष १० अंक १५६'}</span>
                <span>{formattedDate}</span>
                <span>{language === 'en' ? 'Digital Edition' : 'डिजिटल संस्करण'} | {language === 'en' ? 'Price: Free' : 'मूल्य: निःशुल्क'}</span>
              </div>

              {/* Epaper Page Content (depends on activePage) */}
              {activePage === 1 ? (
                /* Page 1: Main Headlines */
                <div>
                  {/* Main Lead Headline block */}
                  <div style={{ textAlign: 'center', marginBottom: '25px' }}>
                    <h2 style={{ fontSize: '32px', fontWeight: '800', margin: '0 0 10px 0', color: '#0f172a', textTransform: 'uppercase', lineHeight: 1.2 }}>
                      {language === 'en' 
                        ? 'State-of-the-Art Digital Library and Public Park to be Built in Khalilabad' 
                        : 'खलीलाबाद में विकास का नया अध्याय: अत्याधुनिक डिजिटल पुस्तकालय और पब्लिक पार्क का काम शुरू'}
                    </h2>
                    <h4 style={{ fontSize: '16px', fontWeight: 'italic', margin: 0, color: '#334155' }}>
                      {language === 'en' 
                        ? '150 Seating capacity, high-speed Wi-Fi, open gymnasium and solar lights approved' 
                        : '150 छात्रों की क्षमता, सोलर लाइट, ओपन जिम और डिजिटल लाइब्रेरी को मिली नगर पालिका की मंजूरी'}
                    </h4>
                  </div>

                  {/* Newspaper columns */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '25px', borderBottom: '1px solid #cbd5e1', paddingBottom: '20px', marginBottom: '20px' }}>
                    <div style={{ columnCount: 2, columnGap: '15px', textAlign: 'justify', fontSize: '13px' }}>
                      <span style={{ fontSize: '36px', float: 'left', lineHeight: '30px', fontWeight: 'bold', paddingRight: '8px', paddingTop: '4px', color: 'var(--color-primary)' }}>ख</span>
                      {language === 'en' ? (
                        <>
                          Residents of Khalilabad will soon have access to a state-of-the-art public park equipped with an open gymnasium and a modern digital library. The development project, approved by the local municipal corporation, aims to provide better recreational and educational spaces for children and youth. The park will feature walking tracks, green areas with native trees, children's play zones, and solar-powered lighting.
                          The adjoining digital library will house over 50 computer systems, high-speed Wi-Fi, and access to academic journals and e-books. A seating capacity of 150 readers will be set up to assist students preparing for competitive exams. Work is expected to begin next month and is scheduled to be completed within six months, using a dedicated budget allocation.
                        </>
                      ) : (
                        <>
                          खलीलाबाद के निवासियों को जल्द ही एक अत्याधुनिक सार्वजनिक पार्क मिलेगा, जिसमें एक ओपन जिम और एक आधुनिक डिजिटल लाइब्रेरी होगी। स्थानीय नगर पालिका द्वारा स्वीकृत इस विकास परियोजना का उद्देश्य बच्चों और युवाओं को बेहतर मनोरंजन और शैक्षिक स्थान प्रदान करना है। पार्क में वॉकिंग ट्रैक, स्थानीय पेड़ों वाले हरे-भरे क्षेत्र, बच्चों के खेलने के क्षेत्र और सौर ऊर्जा से चलने वाली लाइटें होंगी।
                          पुस्तकालय में 50 से अधिक कंप्यूटर सिस्टम, हाई-स्पीड वाई-फाई और शैक्षणिक पत्रिकाओं व ई-पुस्तकों तक पहुंच होगी। प्रतियोगी परीक्षाओं की तैयारी कर रहे छात्रों की सहायता के लिए 150 पाठकों की बैठने की क्षमता स्थापित की जाएगी। अगले महीने काम शुरू होने की उम्मीद है और बजट आवंटन का उपयोग करते हुए इसे छह महीने के भीतर पूरा करने का कार्यक्रम है।
                        </>
                      )}
                    </div>
                    
                    {/* Large lead image mock */}
                    <div>
                      <img 
                        src="https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80" 
                        alt="Digital Library Mock" 
                        style={{ width: '100%', height: '180px', objectFit: 'cover', border: '1px solid #94a3b8', padding: '4px', background: '#fff', marginBottom: '8px' }}
                      />
                      <p style={{ margin: 0, fontStyle: 'italic', fontSize: '11px', textAlign: 'center', color: '#64748b' }}>
                        {language === 'en' ? 'Artist impression of the upcoming digital library building.' : 'बनने वाली डिजिटल लाइब्रेरी इमारत का काल्पनिक चित्र।'}
                      </p>
                    </div>
                  </div>

                  {/* Two Column Footer Block */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    {/* Story 2 */}
                    <div style={{ borderRight: '1px solid #cbd5e1', paddingRight: '20px' }}>
                      <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 8px 0', color: '#1e293b' }}>
                        {language === 'en' ? 'Mehdawal Academy Wins Cricket Cup' : 'मेहदावल स्पोर्ट्स अकादमी ने जीता जिला क्रिकेट कप'}
                      </h3>
                      <div style={{ columnCount: 2, columnGap: '12px', textAlign: 'justify', fontSize: '11px' }}>
                        {language === 'en' ? (
                          <>
                            In a thrilling finish, the Mehdawal Sports Academy defeated the Basti District Academy by 3 wickets to lift the District Championship Cup. Chasing a target of 168 runs, Mehdawal was struggling at 92/5, but a match-winning partnership of 64 runs for the 6th wicket anchored the team to victory. The star batsman was awarded Player of the Match for scoring 58 runs off 42 balls, which included four sixes. The captain credited their rigorous practice.
                          </>
                        ) : (
                          <>
                            एक रोमांचक मुकाबले में, मेहदावल स्पोर्ट्स एकेडमी ने बस्ती जिला एकेडमी को 3 विकेट से हराकर जिला चैंपियनशिप कप जीता। 168 रनों के लक्ष्य का पीछा करते हुए मेहदावल की टीम 92/5 पर संघर्ष कर रही थी, लेकिन छठे विकेट के लिए 64 रनों की मैच जिताऊ साझेदारी ने टीम को जीत दिलाई। स्टार बल्लेबाज को 42 गेंदों में 58 रन बनाने के लिए 'प्लेयर ऑफ द मैच' चुना गया, जिससे चार छक्के शामिल थे।
                          </>
                        )}
                      </div>
                    </div>

                    {/* Story 3 */}
                    <div>
                      <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 8px 0', color: '#1e293b' }}>
                        {language === 'en' ? 'Bhojpuri Film Shooting Starts in Dhanghata' : 'धनघटा में शुरू हुई भोजपुरी फिल्म की शूटिंग'}
                      </h3>
                      <div style={{ columnCount: 2, columnGap: '12px', textAlign: 'justify', fontSize: '11px' }}>
                        {language === 'en' ? (
                          <>
                            The rural landscapes of Dhanghata subdivision in Sant Kabir Nagar have become the shooting location for a highly anticipated Bhojpuri movie. The film, starring famous regional superstars, held its first day of shooting near the bank of the Ghaghara River. Thousands of local residents from neighboring villages gathered at the spot to catch a glimpse of the lead actor and actress.
                          </>
                        ) : (
                          <>
                            संत कबीर नगर के धनघटा उपखंड के ग्रामीण इलाके एक बहुप्रतीक्षित भोजपुरी फिल्म की शूटिंग का केंद्र बन गए हैं। क्षेत्रीय सुपरस्टार्स अभिनीत इस फिल्म की शूटिंग के पहले दिन का काम घाघरा नदी के तट के पास शुरू हुआ। जैसे ही शूटिंग की खबर फैली, आसपास के गांवों के हजारों स्थानीय निवासी मौके पर एकत्र हो गए। कलाकारों की एक झलक पाने के लिए प्रशंसकों में उत्साह था।
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Page 2, 3, 4: Inner Sections */
                <div style={{ textAlign: 'center', padding: '100px 0', color: '#475569' }}>
                  <h2 style={{ fontSize: '24px', fontStyle: 'italic', margin: '0 0 10px 0' }}>
                    {language === 'en' ? `Page ${activePage} Content Preview` : `पृष्ठ ${activePage} सामग्री पूर्वावलोकन`}
                  </h2>
                  <p style={{ fontSize: '14px', maxWidth: '400px', margin: '0 auto' }}>
                    {language === 'en' 
                      ? `Full digital layout and ads for Page ${activePage} are loading. Check back shortly for updates.` 
                      : `पृष्ठ ${activePage} का पूर्ण डिजिटल लेआउट और विज्ञापन लोड हो रहे हैं। कृपया कुछ समय बाद पुनः प्रयास करें।`}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
