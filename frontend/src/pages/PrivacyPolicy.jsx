import React, { useState } from 'react';
import SEO from '../components/SEO';
import { 
  ShieldCheck, 
  Lock, 
  Eye, 
  FileText, 
  Printer, 
  Search, 
  AlertCircle, 
  ChevronRight, 
  Mail, 
  Phone, 
  MapPin, 
  UserCheck, 
  Database, 
  Cookie, 
  BellRing,
  Scale,
  FileCheck,
  Sparkles,
  ShieldAlert,
  Radio,
  Share2
} from 'lucide-react';

export default function PrivacyPolicy() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [copiedLink, setCopiedLink] = useState(false);

  const lastUpdated = "25 अगस्त 2026";

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const categories = [
    { id: 'all', label: 'सभी नीतियाँ' },
    { id: 'security', label: 'सुरक्षा व स्रोत' },
    { id: 'data', label: 'डेटा संग्रह' },
    { id: 'ads', label: 'कुकीज़ व विज्ञापन' },
    { id: 'grievance', label: 'शिकायत निवारण' }
  ];

  const sections = [
    {
      id: "intro",
      category: "security",
      icon: ShieldCheck,
      title: "1. प्रस्तावना एवं वैधानिक दायरा (Scope & Legal Compliance)",
      subtitle: "IT Act 2000, DPDP Act 2023 एवं प्रेस काउंसिल आचार संहिता के तहत",
      content: `सिटी समाचार डिजिटल ('हम', 'हमारा' या 'न्यूज़ पोर्टल') उत्तर प्रदेश और संपूर्ण भारत में अपने पाठकों, उपयोगकर्ताओं और नागरिक पत्रकारों की गोपनीयता तथा व्यक्तिगत डेटा का सर्वोच्च सम्मान करता है। 

यह गोपनीयता नीति भारतीय सूचना प्रौद्योगिकी अधिनियम (IT Act, 2000), डिजिटल व्यक्तिगत डेटा संरक्षण अधिनियम (DPDP Act, 2023) तथा भारतीय प्रेस परिषद (PCI) के पत्रकारिता मानकों के पूर्ण अनुपालन में तैयार की गई है। 

यह नीति स्पष्ट करती है कि जब आप हमारी वेबसाइट, मोबाइल व्यू, ई-पेपर, लाइव स्ट्रीमिंग या व्हाट्सएप न्यूज़ अलर्ट का उपयोग करते हैं, तो आपकी जानकारी को किस प्रकार एकत्र, संसाधित, सुरक्षित और प्रबंधित किया जाता है।`
    },
    {
      id: "source-protection",
      category: "security",
      icon: Radio,
      title: "2. समाचार स्रोत एवं व्हिसलब्लोअर गोपनीयता (News Source & Whistleblower Protection)",
      subtitle: "गुप्त संवाददाताओं और न्यूज़ टिप भेजने वालों के लिए विशेष सुरक्षा गारंटी",
      highlight: true,
      content: `पत्रकारिता के उच्च नैतिक सिद्धांतों के अंतर्गत, सिटी समाचार डिजिटल अपने स्रोतों (Sources), व्हिसलब्लोअर्स (Whistleblowers) और गुप्त सूचना देने वाले पाठकों की पहचान की पूर्ण गोपनीयता की गारंटी देता है:

• गुप्त पहचान संरक्षण: जब आप हमें भ्रष्टाचार, अपराध या जनहित से जुड़ी गुप्त न्यूज़ टिप, फ़ोटो या वीडियो भेजते हैं, तो आपकी व्यक्तिगत पहचान (नाम, नंबर, IP पता) को सर्वोच्च स्तर की एन्क्रिप्शन सुरक्षा में रखा जाता है।
• प्रेस स्वतंत्रता अधिकार: जब तक कि भारत के किसी सक्षम न्यायालय द्वारा कानूनी आदेश न दिया जाए, हम किसी भी स्थिति में अपने समाचार स्रोतों की पहचान उजागर नहीं करते।
• अनाम रिपोर्टिंग (Anonymous Reporting): आप बिना अपनी पहचान बताए भी पोर्टल पर जनहित से जुड़े मुद्दों की जानकारी भेज सकते हैं।`
    },
    {
      id: "data-collection",
      category: "data",
      icon: Database,
      title: "3. जानकारी जो हम एकत्र करते हैं (Information We Collect)",
      subtitle: "पाठकों द्वारा प्रदान की गई तथा स्वचालित तकनीकी जानकारी",
      content: `हम पाठकों को बेहतर समाचार अनुभव प्रदान करने के लिए केवल आवश्यक जानकारी एकत्र करते हैं:

1. ऐच्छिक व्यक्तिगत जानकारी (Provided Personal Data):
   • संपर्क फ़ॉर्म, कमेंट्स या न्यूज़ टिप भेजते समय आपका नाम, ईमेल पता और मोबाइल नंबर।
   • डिजिटल ई-पेपर सदस्यता या व्हाट्सएप न्यूज़ सर्विस के लिए प्रदान की गई जानकारी।

2. स्वचालित तकनीकी डेटा (Automated Telemetry Data):
   • आपके डिवाइस का IP एड्रेस, ब्राउज़र प्रकार, ऑपरेटिंग सिस्टम और भाषा।
   • विज़िट किए गए पृष्ठ (Pages Viewed), पढ़ने का समय तथा क्षेत्रीय समाचार फ़िल्टर हेतु अनुमानित भौगोलिक स्थान।`
    },
    {
      id: "cookies-ads",
      category: "ads",
      icon: Cookie,
      title: "4. कुकीज़, गूगल एडेंस एवं विज्ञापन नीति (Cookies & Google AdSense Policy)",
      subtitle: "विज्ञापन नेटवर्क, कुकीज़ और वेब ट्रैकिंग की स्पष्ट जानकारी",
      content: `हम अपने न्यूज़ पोर्टल के निःशुल्क संचालन और विज्ञापनों के प्रदर्शन के लिए मानकीकृत तकनीकों का उपयोग करते हैं:

• कुकीज़ (Cookies): कुकीज़ आपके ब्राउज़र में सहेजी गई छोटी डेटा फ़ाइलें हैं जो आपकी भाषा और प्राथमिकताओं को याद रखती हैं। आप अपने ब्राउज़र सेटिंग्स में जाकर कुकीज़ को किसी भी समय अक्षम (Disable) कर सकते हैं।
• Google AdSense एवं तृतीय-पक्ष विज्ञापन: हम पोर्टल पर विज्ञापन प्रदर्शित करने के लिए Google AdSense का उपयोग करते हैं। Google पाठकों की पूर्व विज़िट के आधार पर रुचि-आधारित (Interest-based) विज्ञापन दिखाने के लिए DART कुकीज़ का उपयोग कर सकता है।
• पाठक Google Ad Settings (www.google.com/settings/ads) पर जाकर रुचि-आधारित विज्ञापनों को ऑप्ट-आउट कर सकते हैं।`
    },
    {
      id: "user-comments",
      category: "data",
      icon: FileCheck,
      title: "5. यूजर कमेंट्स एवं जन-सामग्री नीति (User Generated Content & Comment Rules)",
      subtitle: "टिप्पणियों, विचारों एवं जनहित सामग्री के लिए नियम",
      content: `सिटी समाचार डिजिटल पाठकों को विचारों की अभिव्यक्ति की स्वतंत्रता का मंच प्रदान करता है, परंतु डिजिटल मीडिया आचार संहिता के तहत निम्न नियमों का पालन अनिवार्य है:

• घृणास्पद भाषा (Hate Speech), सांप्रदायिक हिंसा भड़काने वाले कमेंट्स, किसी व्यक्ति या संस्था पर आपत्तिजनक टिप्पणी सख्त वर्जित है।
• भ्रामक (Fake News) या बिना प्रमाण की अफवाहों पर आधारित टिप्पणियों को तुरंत हटा दिया जाएगा।
• कमेंट अनुभाग में प्रस्तुत विचार व्यक्तिगत पाठकों के होते हैं; न्यूज़ नेटवर्क उनसे सहमत या उत्तरदायी होना अनिवार्य नहीं है।`
    },
    {
      id: "copyright",
      category: "security",
      icon: Scale,
      title: "6. कॉपीराइट एवं निष्पक्ष उपयोग (Copyright & Fair Use Notice)",
      subtitle: "समाचार सामग्री, फ़ोटो, वीडियो एवं ट्रेडमार्क अधिकार",
      content: `• स्वामित्व अधिकार: 'सिटी समाचार डिजिटल' पोर्टफोलियो में प्रकाशित सभी मूल समाचार, टेक्स्ट, ग्राफ़िक्स, ई-पेपर, लोगो और वीडियो कॉपीराइट अधिनियम (Copyright Act, 1957) के तहत संरक्षित हैं।
• निष्पक्ष उपयोग (Fair Dealing): अन्य मीडिया संस्थान या ब्लॉग्स हमारे समाचारों का संदर्भ (Credit / Attribution) देकर तथा हमारी मूल वेबसाइट लिंक शामिल करके उपयोग कर सकते हैं। बिना अनुमति संपूर्ण सामग्री या ई-पेपर का व्यावसायिक पुनर्प्रकाशन दंडनीय अपराध है।`
    },
    {
      id: "security-measures",
      category: "security",
      icon: Lock,
      title: "7. डेटा सुरक्षा एवं एन्क्रिप्शन मानक (Data Security Standards)",
      subtitle: "256-bit SSL एन्क्रिप्शन और सुरक्षित सर्वर अवसंरचना",
      content: `हम आपकी जानकारी की सुरक्षा को सर्वोच्च प्राथमिकता देते हैं:

• 256-Bit SSL एन्क्रिप्शन: पोर्टल पर होने वाला संपूर्ण डेटा संचार SSL सुरक्षा से एन्क्लिप्टेड है।
• अनधिकृत पहुंच पर रोक: हमारे सर्वर फायरवॉल और नियमित सुरक्षा ऑडिट के तहत सुरक्षित हैं।
• व्यावसायिक बिक्री का निषेध: हम अपने पाठकों या ग्राहकों की व्यक्तिगत जानकारी को किसी भी तीसरे पक्ष या मार्केटिंग एजेंसियों को कभी नहीं बेचते हैं।`
    },
    {
      id: "user-rights",
      category: "data",
      icon: UserCheck,
      title: "8. पाठकों एवं उपयोगकर्ताओं के अधिकार (User Privacy Rights)",
      subtitle: "डेटा एक्सेस, संशोधन एवं हटाने का पूर्ण अधिकार",
      content: `डिजिटल व्यक्तिगत डेटा संरक्षण कानून के तहत पाठकों को निम्नलिखित अधिकार प्राप्त हैं:

• राइट टू एक्सेस (Right to Access): आपके द्वारा दी गई जानकारी की प्रति देखने का अधिकार।
• राइट टू इरेज़र / राइट टू बी फॉरगॉटन (Right to be Forgotten): यदि आप चाहते हैं कि आपका कमेंट, खाता या डेटा हटाया जाए, तो आप हमें ईमेल भेजकर तुरंत डेटा डिलीट करवा सकते हैं।
• ऑप्ट-आउट अधिकार (Opt-Out): व्हाट्सएप न्यूज़ अलर्ट या ई-पेपर सदस्यता से किसी भी समय एक क्लिक में अलग होने का अधिकार।`
    },
    {
      id: "children-privacy",
      category: "data",
      icon: AlertCircle,
      title: "9. बच्चों की गोपनीयता एवं बाल सुरक्षा (Minors & Children Privacy)",
      subtitle: "18 वर्ष से कम आयु के नाबालिगों के संरक्षण हेतु नीति",
      content: `हमारा डिजिटल न्यूज़ पोर्टल बाल सुरक्षा नियमों का कड़ाई से पालन करता है:
• हम जानबूझकर 18 वर्ष से कम उम्र के बच्चों से कोई व्यक्तिगत डेटा एकत्र नहीं करते हैं।
• पोक्सो कानून (POCSO Act) और PCI दिशानिर्देशों के तहत नाबालिग पीड़ितों या बच्चों की पहचान बताने वाली कोई भी तस्वीर या नाम पोर्टल पर प्रकाशित नहीं किया जाता।`
    }
  ];

  const filteredSections = sections.filter(sec => {
    const matchesSearch = 
      sec.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      sec.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (sec.subtitle && sec.subtitle.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = activeCategory === 'all' || sec.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="container" style={{ marginTop: '24px', marginBottom: '70px' }}>
      <SEO 
        title="गोपनीयता नीति (Privacy Policy) | सिटी समाचार डिजिटल"
        description="सिटी समाचार डिजिटल की आधिकारिक गोपनीयता नीति। जानें कि हम पाठकों के डेटा, कुकीज़, समाचार स्रोतों और सुरक्षा का किस प्रकार सम्मान व कानूनी संरक्षण करते हैं।"
        keywords={['Privacy Policy City Samachar Digital', 'गोपनीयता नीति', 'डेटा सुरक्षा', 'सिटी समाचार नियम', 'IT Act 2000 DPDP 2023']}
      />

      {/* Hero Header Banner */}
      <div 
        style={{
          background: 'linear-gradient(135deg, rgba(239,68,68,0.15) 0%, rgba(30,41,59,0.95) 50%, rgba(15,23,42,0.98) 100%)',
          borderRadius: 'var(--border-radius-lg)',
          padding: '42px 28px',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          boxShadow: 'var(--shadow-lg)',
          marginBottom: '32px',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ maxWidth: '850px', margin: '0 auto', textAlign: 'center' }}>
          {/* Badge */}
          <div 
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(239, 68, 68, 0.2)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              color: '#ef4444',
              padding: '6px 18px',
              borderRadius: '30px',
              fontSize: '13px',
              fontWeight: '700',
              marginBottom: '16px'
            }}
          >
            <ShieldCheck size={16} />
            PCI & IT Act 2000 / DPDP Act 2023 अनुपालन नीति
          </div>

          <h1 style={{ fontSize: 'clamp(28px, 4vw, 42px)', color: 'var(--color-text-primary)', fontWeight: '900', lineHeight: '1.2' }}>
            गोपनीयता नीति (Privacy Policy)
          </h1>

          <p style={{ color: 'var(--color-text-secondary)', marginTop: '12px', fontSize: 'clamp(15px, 1.8vw, 17px)', lineHeight: '1.7' }}>
            सिटी समाचार डिजिटल पाठकों के अधिकारों, व्यक्तिगत डेटा सुरक्षा, समाचार स्रोतों की गोपनीयता तथा निष्पक्ष डिजिटल पत्रकारिता के प्रति पूर्णतः पारदर्शी व संकल्पित है।
          </p>

          {/* Quick Meta Badges */}
          <div 
            style={{ 
              display: 'flex', 
              gap: '12px', 
              alignItems: 'center', 
              marginTop: '24px',
              flexWrap: 'wrap',
              justifyContent: 'center'
            }}
          >
            <span 
              style={{ 
                background: 'rgba(255, 255, 255, 0.08)', 
                border: '1px solid var(--border-color)', 
                padding: '6px 14px', 
                borderRadius: '20px',
                fontSize: '13px',
                color: 'var(--color-text-secondary)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Sparkles size={14} style={{ color: '#ef4444' }} />
              अंतिम अद्यतन: <strong style={{ color: 'var(--color-text-primary)' }}>{lastUpdated}</strong>
            </span>

            <button 
              onClick={handlePrint} 
              className="btn"
              style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '6px', 
                padding: '8px 20px', 
                borderRadius: '20px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              <Printer size={15} />
              प्रिंट / PDF प्रति डाउनलोड
            </button>

            <button 
              onClick={handleShare} 
              style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '6px', 
                padding: '8px 20px', 
                borderRadius: '20px',
                fontSize: '13px',
                fontWeight: '600',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid var(--border-color)',
                color: 'var(--color-text-primary)',
                cursor: 'pointer'
              }}
            >
              <Share2 size={15} />
              {copiedLink ? 'लिंक कॉपी हो गया!' : 'शेयर करें'}
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Controls Bar: Search & Category Chips */}
      <div style={{ marginBottom: '32px' }}>
        <div 
          style={{ 
            maxWidth: '650px', 
            margin: '0 auto 20px auto', 
            position: 'relative' 
          }}
        >
          <Search 
            size={18} 
            style={{ 
              position: 'absolute', 
              left: '16px', 
              top: '50%', 
              transform: 'translateY(-50%)', 
              color: 'var(--color-primary)' 
            }} 
          />
          <input 
            type="text"
            placeholder="गोपनीयता नीति में खोजें (उदा. कुकीज़, स्रोत गोपनीयता, डेटा, शिकायत अधिकारी)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-control"
            style={{
              paddingLeft: '44px',
              borderRadius: '30px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              fontSize: '14px',
              boxShadow: 'var(--shadow-sm)'
            }}
          />
        </div>

        {/* Category Chips */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              style={{
                padding: '8px 18px',
                borderRadius: '25px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                border: activeCategory === cat.id ? '1px solid #ef4444' : '1px solid var(--border-color)',
                background: activeCategory === cat.id ? 'rgba(239, 68, 68, 0.2)' : 'var(--bg-card)',
                color: activeCategory === cat.id ? '#ef4444' : 'var(--color-text-secondary)',
                transition: 'all 0.2s ease'
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content Layout */}
      <div 
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr)',
          gap: '24px',
          maxWidth: '920px',
          margin: '0 auto'
        }}
      >
        {filteredSections.length === 0 ? (
          <div 
            style={{ 
              textAlign: 'center', 
              padding: '48px 20px', 
              background: 'var(--bg-card)', 
              borderRadius: 'var(--border-radius-md)',
              border: '1px solid var(--border-color)' 
            }}
          >
            <ShieldAlert size={40} style={{ color: 'var(--color-primary)', marginBottom: '12px' }} />
            <h3 style={{ fontSize: '18px', color: 'var(--color-text-primary)', marginBottom: '6px' }}>कोई नीति परिणाम नहीं मिला</h3>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>
              आपके द्वारा खोजे गए शब्द से मेल खाती कोई नीति प्रस्तुत नहीं हुई। कृपया अन्य शब्द का प्रयास करें।
            </p>
          </div>
        ) : (
          filteredSections.map((sec) => {
            const IconComp = sec.icon;
            return (
              <div 
                key={sec.id}
                id={sec.id}
                style={{
                  background: sec.highlight 
                    ? 'linear-gradient(135deg, rgba(239,68,68,0.08) 0%, var(--bg-card) 100%)' 
                    : 'var(--bg-card)',
                  borderRadius: 'var(--border-radius-lg)',
                  padding: '30px 26px',
                  border: sec.highlight ? '1.5px solid rgba(239, 68, 68, 0.4)' : '1px solid var(--border-color)',
                  boxShadow: 'var(--shadow-sm)',
                  transition: 'var(--transition-smooth)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '16px' }}>
                  <div 
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '12px',
                      background: 'rgba(239, 68, 68, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--color-primary)',
                      flexShrink: 0
                    }}
                  >
                    <IconComp size={22} />
                  </div>

                  <div>
                    <h2 style={{ fontSize: '20px', color: 'var(--color-text-primary)', fontWeight: '800', lineHeight: '1.3' }}>
                      {sec.title}
                    </h2>
                    {sec.subtitle && (
                      <p style={{ fontSize: '13px', color: 'var(--color-primary)', fontWeight: '600', marginTop: '4px' }}>
                        {sec.subtitle}
                      </p>
                    )}
                  </div>
                </div>

                <div 
                  style={{ 
                    color: 'var(--color-text-secondary)', 
                    fontSize: '14.5px', 
                    lineHeight: '1.8',
                    whiteSpace: 'pre-line',
                    paddingLeft: '62px'
                  }}
                >
                  {sec.content}
                </div>
              </div>
            );
          })
        )}

        {/* Legal Grievance & Nodal Contact Card (Complying with Digital Media Code 2021) */}
        <div 
          style={{
            background: 'linear-gradient(135deg, rgba(20,27,45,0.95) 0%, rgba(15,23,42,0.98) 100%)',
            borderRadius: 'var(--border-radius-lg)',
            padding: '36px 30px',
            border: '2px solid var(--color-primary)',
            boxShadow: 'var(--shadow-lg)',
            marginTop: '10px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
            <div 
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: '#ef4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff'
              }}
            >
              <UserCheck size={26} />
            </div>
            <div>
              <h3 style={{ fontSize: '22px', color: 'var(--color-text-primary)', fontWeight: '800' }}>
                10. वैधानिक शिकायत निवारण अधिकारी (Statutory Grievance Officer)
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                Information Technology Rules 2021 नियम 3(2) के तहत शिकायत संपर्क
              </p>
            </div>
          </div>

          <p style={{ color: 'var(--color-text-secondary)', fontSize: '14.5px', lineHeight: '1.7', marginBottom: '24px' }}>
            यदि आपके पास गोपनीयता नीति, डेटा सुरक्षा, सर्वाधिकार या न्यूज़ पोर्टल पर प्रकाशित किसी भी सामग्री से संबंधित कोई वैधानिक शिकायत है, तो आप हमारे नामित शिकायत निवारण अधिकारी से सीधे संपर्क कर सकते हैं:
          </p>

          <div 
            style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
              gap: '20px',
              background: 'rgba(255, 255, 255, 0.04)',
              padding: '24px',
              borderRadius: 'var(--border-radius-md)',
              border: '1px solid var(--border-color)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <UserCheck size={20} style={{ color: 'var(--color-primary)', marginTop: '2px' }} />
              <div>
                <span style={{ color: 'var(--color-text-secondary)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>अधिकारी नाम व पद</span>
                <p style={{ color: 'var(--color-text-primary)', fontWeight: 700, fontSize: '15px', marginTop: '2px' }}>सदरे आलम खान / अरशयन खान</p>
                <span style={{ fontSize: '12px', color: 'var(--color-primary)' }}>संस्थापक व मुख्य संपादक / तकनीकी प्रमुख</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <Mail size={20} style={{ color: 'var(--color-primary)', marginTop: '2px' }} />
              <div>
                <span style={{ color: 'var(--color-text-secondary)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>गोपनीयता व कानूनी ईमेल</span>
                <p style={{ color: 'var(--color-text-primary)', fontWeight: 700, fontSize: '15px', marginTop: '2px' }}>arshyan0021@gmail.com</p>
                <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>24 से 48 घंटे में समाधान</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <Phone size={20} style={{ color: 'var(--color-primary)', marginTop: '2px' }} />
              <div>
                <span style={{ color: 'var(--color-text-secondary)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>हेल्पलाइन / व्हाट्सएप</span>
                <p style={{ color: 'var(--color-text-primary)', fontWeight: 700, fontSize: '15px', marginTop: '2px' }}>+91 7007936247</p>
                <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>सोम - शनि (10 AM - 6 PM)</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <MapPin size={20} style={{ color: 'var(--color-primary)', marginTop: '2px' }} />
              <div>
                <span style={{ color: 'var(--color-text-secondary)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>मुख्यालय पता</span>
                <p style={{ color: 'var(--color-text-primary)', fontWeight: 700, fontSize: '14px', marginTop: '2px' }}>सिटी समाचार डिजिटल मुख्यालय, उत्तर प्रदेश - 272175</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
