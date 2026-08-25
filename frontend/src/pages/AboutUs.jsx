import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import {
  ShieldCheck,
  Zap,
  Users,
  Award,
  Target,
  Compass,
  CheckCircle2,
  ChevronDown,
  HelpCircle,
  Newspaper,
  Radio,
  Globe2,
  Lock,
  Sparkles,
  PhoneCall
} from 'lucide-react';

// 3D News Reporter Mic ID Badge Component
const MicId = ({ side = 'left' }) => (
  <div className={`mic-id-badge mic-id-${side}`}>
    {/* Mic Foam Head */}
    <div className="mic-head-foam">
      <div className="mic-head-mesh" />
      <div className="mic-head-ring" />
    </div>

    {/* Connector Ring */}
    <div className="mic-connector" />

    {/* Mic Flag Cube Box */}
    <div className="mic-flag-box">
      <div className="mic-flag-header">
        <span className="mic-live-dot" />
        LIVE NEWS
      </div>

      <div className="mic-logo-holder">
        <img
          src="/logo.png"
          alt="City Samachar Digital"
          onError={(e) => { e.target.style.display = 'none'; }}
        />
      </div>

      <div className="mic-flag-footer" />
    </div>

    {/* Mic Handle */}
    <div className="mic-handle">
      <div className="mic-handle-ring" />
    </div>
  </div>
);

export default function AboutUs() {
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      question: "सिटी समाचार डिजिटल क्या है?",
      answer: "सिटी समाचार डिजिटल संपूर्ण उत्तर प्रदेश के सभी 75 जिलों का सबसे अग्रणी और विश्वसनीय डिजिटल न्यूज़ नेटवर्क है। हम राज्य के हर कोने से 24/7 ताज़ा और निष्पक्ष समाचार प्रदान करते हैं।"
    },
    {
      question: "क्या सिटी समाचार डिजिटल पर प्रकाशित समाचार प्रमाणित होते हैं?",
      answer: "जी हाँ, हमारी समर्पित ग्राउंड रिपोर्टिंग टीम और संपादकीय मंडल प्रत्येक समाचार की सत्यता की कड़ी जाँच और तथ्यों के सत्यापन (Fact-Checking) के बाद ही इसे प्रकाशित करते हैं।"
    },
    {
      question: "हम न्यूज़ टिप या स्थानीय ख़बर कैसे भेज सकते हैं?",
      answer: "आप हमारे संपर्क पृष्ठ पर दिए गए व्हाट्सएप नंबर (+91 7007936247) या ईमेल (arshyan001@gmail.com) पर अपनी ख़बर, फ़ोटो या वीडियो भेज सकते हैं।"
    },
    {
      question: "क्या सिटी समाचार डिजिटल पर विज्ञापन की सुविधा उपलब्ध है?",
      answer: "हाँ, हम स्थानीय व्यवसाय, सरकारी व निजी संस्थानों और ब्रांड्स के लिए डिजिटल विज्ञापन, बैनर तथा प्रायोजित कवरेज की सुविधा प्रदान करते हैं।"
    }
  ];

  const stats = [
    { label: "मासिक सक्रिय पाठक", value: "5,00,000+", icon: Users, color: "#ef4444" },
    { label: "24/7 ताज़ा समाचार कवरेज", value: "100%", icon: Radio, color: "#3b82f6" },
    { label: "75+ जिलों में नेटवर्क", value: "500+", icon: Globe2, color: "#10b981" },
    { label: "जनता का अटूट विश्वास", value: "10+ वर्ष", icon: Award, color: "#f59e0b" },
  ];

  const coreValues = [
    {
      icon: ShieldCheck,
      title: "सत्यता एवं निष्पक्षता",
      desc: "हम बिना किसी दबाव या पक्षपात के केवल प्रमाणिक और निष्पक्ष सत्य को पाठकों के सामने लाते हैं।",
      badgeColor: "rgba(239, 68, 68, 0.15)",
      iconColor: "#ef4444"
    },
    {
      icon: Zap,
      title: "त्वरित एवं सटीक रिपोर्टिंग",
      desc: "डिजिटल युग में सबसे पहले और सबसे सटीक ख़बर पहुँचाना हमारी प्राथमिक जिम्मेदारी है।",
      badgeColor: "rgba(59, 130, 246, 0.15)",
      iconColor: "#3b82f6"
    },
    {
      icon: Users,
      title: "जन सरोकार व जनहित",
      desc: "आम जनता की समस्याओं, बुनियादी मुद्दों और विकास कार्यों को प्रमुखता से शासन-प्रशासन तक पहुँचाना।",
      badgeColor: "rgba(16, 185, 129, 0.15)",
      iconColor: "#10b981"
    },
    {
      icon: Lock,
      title: "पत्रकारिता आचार संहिता",
      desc: "भारतीय प्रेस परिषद (PCI) के उच्च पत्रकारिता मानदंडों का कड़ाई से पालन करना।",
      badgeColor: "rgba(245, 158, 11, 0.15)",
      iconColor: "#f59e0b"
    }
  ];

  const teamMembers = [
    {
      name: "सदरे आलम खान (SADRE ALAM KHAN)",
      role: "संस्थापक एवं मुख्य संपादक (Founder & Editor-in-Chief)",
      desc: "डिजिटल मीडिया और पत्रकारिता क्षेत्र में 10 से अधिक वर्षों का अनुभव। स्थानीय सरोकारों के डिजिटल सशक्तिकरण के पक्षधर।",
      avatar: "SK",
      badge: "संपादकीय प्रमुख"
    },
    {
      name: "संपादकीय मण्डल",
      role: "वरिष्ठ समाचार डेस्क (Senior Editorial Board)",
      desc: "उत्तर प्रदेश के सभी 75 जिलों से अनुभवी संवाददाताओं और संपादकों का समर्पित नेटवर्क।",
      avatar: "ED",
      badge: "डेस्क टीम"
    },
    {
      name: "अरशयन खान (ARSHYAN KHAN)",
      role: "डिजिटल ऑपरेशन्स (Technical & Digital Ops)",
      desc: "ई-पेपर जनरेशन, लाइव स्ट्रीमिंग, वेब पोर्टल्स और मोबाइल डिलीवरी को 24/7 सुचारू रखने वाली तकनीकी टीम।",
      avatar: "TECH",
      badge: "तकनीकी"
    }
  ];

  return (
    <div className="container" style={{ marginTop: '30px', marginBottom: '60px' }}>
      <SEO
        title="हमारे बारे में (About Us)"
        description="जानें सिटी समाचार डिजिटल के बारे में - पूरे उत्तर प्रदेश और इसके सभी 75 जिलों का सबसे विश्वसनीय डिजिटल न्यूज़ पोर्टल। निष्पक्षता, सत्यता और तेज़ रिपोर्टिंग का नाम।"
        keywords={['About City Samachar Digital', 'हमारे बारे में', 'उत्तर प्रदेश समाचार पोर्टल', 'UP All Districts News', 'यूपी न्यूज़ नेटवर्क', 'निष्पक्ष पत्रकारिता']}
      />

      {/* Hero Header Section */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(239,68,68,0.12) 0%, rgba(59,130,246,0.08) 50%, rgba(20,27,45,0.95) 100%)',
          borderRadius: 'var(--border-radius-lg)',
          padding: '40px 24px',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-lg)',
          position: 'relative',
          overflow: 'hidden',
          marginBottom: '40px'
        }}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '24px',
          flexWrap: 'wrap'
        }}>
          {/* Left Mic ID */}
          <div className="mic-id-container" style={{ flexShrink: 0, margin: '10px auto' }}>
            <MicId side="left" />
          </div>

          {/* Center Text Content */}
          <div style={{ flex: '1 1 450px', textAlign: 'center' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#ef4444',
                padding: '6px 16px',
                borderRadius: '30px',
                fontSize: '14px',
                fontWeight: '600',
                marginBottom: '16px'
              }}
            >
              <Sparkles size={16} />
              विश्वसनीय डिजिटल पत्रकारिता
            </div>

            <h1
              style={{
                fontSize: 'clamp(28px, 4vw, 44px)',
                color: 'var(--color-text-primary)',
                fontWeight: '800',
                letterSpacing: '-0.02em',
                marginBottom: '16px',
                lineHeight: '1.2'
              }}
            >
              सिटी समाचार डिजिटल
            </h1>

            <p
              style={{
                fontSize: 'clamp(15px, 1.8vw, 17px)',
                color: 'var(--color-text-secondary)',
                maxWidth: '750px',
                margin: '0 auto 28px auto',
                lineHeight: '1.7'
              }}
            >
              सिटी समाचार डिजिटल उत्तर प्रदेश की खबरों को जन-जन तक पहुँचाने वाला एक विश्वसनीय डिजिटल न्यूज़ प्लेटफॉर्म है। हमारा उद्देश्य प्रदेश के हर जिले, शहर, कस्बे और गांव से जुड़ी महत्वपूर्ण खबरों को तेज़, सटीक और निष्पक्ष तरीके से आप तक पहुँचाना है।
              <br /><br />
              हम राजनीति, प्रशासन, अपराध, शिक्षा, स्वास्थ्य, रोजगार, विकास, सामाजिक सरोकार, खेल, मनोरंजन और जनहित से जुड़े मुद्दों को प्रमुखता से उठाते हैं। हमारी कोशिश है कि आम जनता की आवाज़ को एक मजबूत मंच मिले और जमीनी हकीकत बिना किसी पक्षपात के सामने आए।
              <br /><br />
              <strong>सिटी समाचार डिजिटल — आपकी खबर, आपकी आवाज़, उत्तर प्रदेश के साथ।</strong>
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <Link
                to="/contact"
                className="btn"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 28px',
                  borderRadius: '30px',
                  fontSize: '15px',
                  fontWeight: '600'
                }}
              >
                <PhoneCall size={18} />
                हमसे संपर्क करें
              </Link>
              <Link
                to="/epaper"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 28px',
                  borderRadius: '30px',
                  fontSize: '15px',
                  fontWeight: '600',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--color-text-primary)'
                }}
              >
                <Newspaper size={18} />
                डिजिटल ई-पेपर पढ़ें
              </Link>
            </div>
          </div>

          {/* Right Mic ID */}
          <div className="mic-id-container" style={{ flexShrink: 0, margin: '10px auto' }}>
            <MicId side="right" />
          </div>
        </div>
      </div>

      {/* Impact Statistics Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '20px',
          marginBottom: '50px'
        }}
      >
        {stats.map((item, index) => {
          const IconComp = item.icon;
          return (
            <div
              key={index}
              style={{
                background: 'var(--bg-card)',
                borderRadius: 'var(--border-radius-md)',
                padding: '24px 20px',
                border: '1px solid var(--border-color)',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                transition: 'var(--transition-smooth)'
              }}
            >
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '12px',
                  background: `${item.color}15`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: item.color,
                  flexShrink: 0
                }}
              >
                <IconComp size={26} />
              </div>
              <div>
                <h3 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--color-text-primary)' }}>
                  {item.value}
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                  {item.label}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mission & Vision Section */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '30px',
          marginBottom: '50px'
        }}
      >
        {/* Mission Card */}
        <div
          style={{
            background: 'var(--bg-card)',
            borderRadius: 'var(--border-radius-lg)',
            padding: '36px 28px',
            border: '1px solid var(--border-color)',
            position: 'relative'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '10px',
                background: 'rgba(239, 68, 68, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-primary)'
              }}
            >
              <Target size={24} />
            </div>
            <h2 style={{ fontSize: '22px', color: 'var(--color-text-primary)' }}>हमारा मिशन (Our Mission)</h2>
          </div>
          <p style={{ color: 'var(--color-text-secondary)', lineHeight: '1.8', fontSize: '15px' }}>
            सिटी समाचार डिजिटल का मुख्य उद्देश्य संपूर्ण उत्तर प्रदेश के प्रत्येक जिले और तहसील स्तर की आवाज़ को एक निष्पक्ष और सशक्त मंच प्रदान करना है। हम बिना किसी सनसनीखेज से समाचार को उसके मूल स्वरूप में प्रस्तुत करते हैं ताकि आम नागरिक सटीक जानकारी प्राप्त कर सकें।
          </p>
          <ul style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {["उत्तर प्रदेश के सभी 75 जिलों के मुद्दों का निडरता से प्रकटीकरण", "जिला, तहसील व ग्राम पंचायत स्तर की ज़मीनी रिपोर्टिंग", "सकारात्मक एवं विकास केंद्रित डिजिटल मीडिया"].map((pt, i) => (
              <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: 'var(--color-text-primary)' }}>
                <CheckCircle2 size={16} style={{ color: 'var(--color-success)', flexShrink: 0 }} />
                {pt}
              </li>
            ))}
          </ul>
        </div>

        {/* Vision Card */}
        <div
          style={{
            background: 'var(--bg-card)',
            borderRadius: 'var(--border-radius-lg)',
            padding: '36px 28px',
            border: '1px solid var(--border-color)',
            position: 'relative'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '10px',
                background: 'rgba(59, 130, 246, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-secondary)'
              }}
            >
              <Compass size={24} />
            </div>
            <h2 style={{ fontSize: '22px', color: 'var(--color-text-primary)' }}>हमारा विज़न (Our Vision)</h2>
          </div>
          <p style={{ color: 'var(--color-text-secondary)', lineHeight: '1.8', fontSize: '15px' }}>
            संपूर्ण उत्तर प्रदेश के सबसे बड़े और अग्रणी डिजिटल न्यूज़ नेटवर्क के रूप में उभरना, जहाँ अत्याधुनिक तकनीक (लाइव टीवी, डिजिटल ई-पेपर, त्वरित अलर्ट) और उच्च संपादकीय मूल्यों का अनूठा मेल हो।
          </p>
          <ul style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {["डिजिटल पत्रकारिता में नवीन नवाचार", "पाठकों के साथ प्रत्यक्ष एवं पारदर्शी संवाद", "फैक्ट-चेकिंग एवं भ्रामक ख़बरों पर पूर्ण रोकथाम"].map((pt, i) => (
              <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: 'var(--color-text-primary)' }}>
                <CheckCircle2 size={16} style={{ color: 'var(--color-secondary)', flexShrink: 0 }} />
                {pt}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Core Principles / Values Grid */}
      <div style={{ marginBottom: '50px' }}>
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <h2 style={{ fontSize: '28px', color: 'var(--color-text-primary)', marginBottom: '8px' }}>
            हमारे मुख्य सिद्धांत (Core Principles)
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '15px' }}>
            जिन स्तंभों पर 'सिटी समाचार डिजिटल' की नींव टिकी हुई है
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '24px'
          }}
        >
          {coreValues.map((val, idx) => {
            const ValIcon = val.icon;
            return (
              <div
                key={idx}
                style={{
                  background: 'var(--bg-card)',
                  borderRadius: 'var(--border-radius-md)',
                  padding: '28px 24px',
                  border: '1px solid var(--border-color)',
                  transition: 'var(--transition-smooth)',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    background: val.badgeColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: val.iconColor,
                    marginBottom: '18px'
                  }}
                >
                  <ValIcon size={24} />
                </div>
                <h3 style={{ fontSize: '18px', color: 'var(--color-text-primary)', marginBottom: '10px', fontWeight: '700' }}>
                  {val.title}
                </h3>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px', lineHeight: '1.6' }}>
                  {val.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Leadership & Editorial Team Showcase */}
      <div style={{ marginBottom: '50px' }}>
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <h2 style={{ fontSize: '28px', color: 'var(--color-text-primary)', marginBottom: '8px' }}>
            संपादकीय नेतृत्व एवं टीम
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '15px' }}>
            अनुभवी पत्रकारों एवं मीडिया विशेषज्ञों की हमारी समर्पित टीम
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px'
          }}
        >
          {teamMembers.map((member, i) => (
            <div
              key={i}
              style={{
                background: 'var(--bg-card)',
                borderRadius: 'var(--border-radius-md)',
                padding: '30px 24px',
                border: '1px solid var(--border-color)',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}
            >
              <div
                style={{
                  width: '72px',
                  height: '72px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontSize: '22px',
                  fontWeight: '800',
                  marginBottom: '16px',
                  boxShadow: '0 4px 14px rgba(239, 68, 68, 0.3)'
                }}
              >
                {member.avatar}
              </div>

              <span
                style={{
                  background: 'rgba(239, 68, 68, 0.12)',
                  color: 'var(--color-primary)',
                  fontSize: '12px',
                  fontWeight: '700',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  marginBottom: '10px'
                }}
              >
                {member.badge}
              </span>

              <h3 style={{ fontSize: '18px', color: 'var(--color-text-primary)', fontWeight: '700', marginBottom: '4px' }}>
                {member.name}
              </h3>

              <p style={{ fontSize: '13px', color: 'var(--color-primary)', fontWeight: '600', marginBottom: '12px' }}>
                {member.role}
              </p>

              <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: '1.6' }}>
                {member.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Journalist Code of Ethics Pledge Box */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(20,27,45,0.9) 0%, rgba(11,15,25,0.95) 100%)',
          borderRadius: 'var(--border-radius-lg)',
          padding: '36px 30px',
          border: '1px dashed var(--color-primary)',
          boxShadow: 'var(--shadow-md)',
          marginBottom: '50px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <ShieldCheck size={28} style={{ color: 'var(--color-primary)' }} />
          <h3 style={{ fontSize: '20px', color: 'var(--color-text-primary)' }}>
            पत्रकारिता आचार संहिता एवं प्रतिबद्धता (Editorial Pledge)
          </h3>
        </div>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px', lineHeight: '1.8' }}>
          'सिटी समाचार डिजिटल' समाचारों के संपादन एवं प्रकाशन में सत्यनिष्ठा, तटस्थता और मानवीय गरिमा का पूर्ण आदर करता है। किसी भी विवादित स्थिति में दोनों पक्षों का पक्ष प्रस्तुत करना और ग़लती होने पर त्वरित सुधार प्रकाशित करना हमारी नीति का अभिन्न अंग है।
        </p>
      </div>

      {/* FAQ Accordion Section */}
      <div style={{ marginBottom: '40px' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h2 style={{ fontSize: '26px', color: 'var(--color-text-primary)', marginBottom: '8px' }}>
            अक्सर पूछे जाने वाले प्रश्न (FAQs)
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>
            पाठकों के मन में उठने वाले आम सवालों के उत्तर
          </p>
        </div>

        <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {faqs.map((faq, index) => (
            <div
              key={index}
              style={{
                background: 'var(--bg-card)',
                borderRadius: 'var(--border-radius-md)',
                border: '1px solid var(--border-color)',
                overflow: 'hidden',
                transition: 'var(--transition-smooth)'
              }}
            >
              <button
                onClick={() => toggleFaq(index)}
                style={{
                  width: '100%',
                  padding: '18px 20px',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--color-text-primary)',
                  fontSize: '16px',
                  fontWeight: '600',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <HelpCircle size={18} style={{ color: 'var(--color-primary)' }} />
                  {faq.question}
                </span>
                <ChevronDown
                  size={18}
                  style={{
                    transform: openFaq === index ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.3s ease'
                  }}
                />
              </button>

              {openFaq === index && (
                <div
                  style={{
                    padding: '0 20px 20px 48px',
                    color: 'var(--color-text-secondary)',
                    fontSize: '14px',
                    lineHeight: '1.7',
                    borderTop: '1px solid var(--border-color)'
                  }}
                >
                  <p style={{ paddingTop: '14px' }}>{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
