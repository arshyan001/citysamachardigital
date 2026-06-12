import React, { createContext, useState, useContext, useEffect } from 'react';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('news_lang') || 'hi'; // Default to Hindi (hi) as requested
  });

  const toggleLanguage = () => {
    setLanguage((prevLang) => {
      const nextLang = prevLang === 'en' ? 'hi' : 'en';
      localStorage.setItem('news_lang', nextLang);
      return nextLang;
    });
  };

  // Static dictionary for structural layout translations
  const translations = {
    hi: {
      brandName: 'सिटी समाचार डिजिटल',
      tagline: 'आपका अपना न्यूज़ पोर्टल',
      home: 'मुख्य पृष्ठ',
      district: 'संत कबीर नगर',
      allLocations: 'सभी क्षेत्र',
      subdivision: 'उपखंड',
      khalilabad: 'खलीलाबाद',
      mehdawal: 'मेहदावल',
      dhanghata: 'धनघटा',
      contactUs: 'संपर्क करें',
      adminPanel: 'एडमिन पैनल',
      breakingNews: 'ब्रेकिंग न्यूज़',
      latestNews: 'नवीनतम समाचार',
      videoNews: 'वीडियो समाचार',
      photoGallery: 'फ़ोटो गैलरी',
      epaper: 'ई-पेपर',
      liveTv: 'लाइव टीवी',
      views: 'देखा गया',
      readMore: 'आगे पढ़ें',
      categories: 'श्रेणियाँ',
      relatedNews: 'संबधित समाचार',
      noNews: 'कोई समाचार नहीं मिला।',
      loading: 'लोड हो रहा है...',
      searchPlaceholder: 'समाचार खोजें...',
      contactTitle: 'हमसे संपर्क करें',
      nameLabel: 'आपका नाम',
      emailLabel: 'ईमेल पता',
      phoneLabel: 'फ़ोन नंबर',
      messageLabel: 'आपका संदेश',
      submitBtn: 'संदेश भेजें',
      submittingBtn: 'भेजा जा रहा है...',
      successMsg: 'आपका संदेश सफलतापूर्वक भेजा गया!',
      errorMsg: 'संदेश भेजने में त्रुटि हुई। कृपया पुन: प्रयास करें।',
      adminDashboard: 'एडमिन डैशबोर्ड',
      logout: 'लॉगआउट',
      addNews: 'समाचार जोड़ें',
      editNews: 'समाचार संपादित करें',
      titleEn: 'शीर्षक (English)',
      titleHi: 'शीर्षक (हिंदी)',
      contentEn: 'सामग्री (English)',
      contentHi: 'सामग्री (हिंदी)',
      categoriesLabel: 'श्रेणियाँ (एक या अधिक चुनें)',
      locationLabel: 'क्षेत्र',
      videoUrlLabel: 'यूट्यूब वीडियो लिंक (वैकल्पिक)',
      imagesLabel: 'फ़ोटो अपलोड करें (वैकल्पिक)',
      breakingLabel: 'क्या यह ब्रेकिंग न्यूज़ है?',
      saveBtn: 'सुरक्षित करें',
      actions: 'कार्रवाई',
      messages: 'प्राप्त संदेश',
      delete: 'हटाएं',
      edit: 'संपादन',
    },
    en: {
      brandName: 'City Samachar Digital',
      tagline: 'Your Trusted News Portal',
      home: 'Home',
      district: 'Sant Kabir Nagar',
      allLocations: 'All Locations',
      subdivision: 'Subdivision',
      khalilabad: 'Khalilabad',
      mehdawal: 'Mehdawal',
      dhanghata: 'Dhanghata',
      contactUs: 'Contact Us',
      adminPanel: 'Admin Panel',
      breakingNews: 'Breaking News',
      latestNews: 'Latest News',
      videoNews: 'Video Bulletins',
      photoGallery: 'Photo Gallery',
      epaper: 'E-Paper',
      liveTv: 'Live TV',
      views: 'views',
      readMore: 'Read More',
      categories: 'Categories',
      relatedNews: 'Related News',
      noNews: 'No news articles found.',
      loading: 'Loading...',
      searchPlaceholder: 'Search news...',
      contactTitle: 'Contact Us',
      nameLabel: 'Your Name',
      emailLabel: 'Email Address',
      phoneLabel: 'Phone Number',
      messageLabel: 'Your Message',
      submitBtn: 'Send Message',
      submittingBtn: 'Sending...',
      successMsg: 'Your message has been sent successfully!',
      errorMsg: 'Error sending message. Please try again.',
      adminDashboard: 'Admin Dashboard',
      logout: 'Logout',
      addNews: 'Add News Article',
      editNews: 'Edit News Article',
      titleEn: 'Title (English)',
      titleHi: 'Title (Hindi)',
      contentEn: 'Content (English)',
      contentHi: 'Content (Hindi)',
      categoriesLabel: 'Categories (Select one or more)',
      locationLabel: 'Location',
      videoUrlLabel: 'YouTube Video Link (Optional)',
      imagesLabel: 'Upload Photo (Optional)',
      breakingLabel: 'Set as Breaking News?',
      saveBtn: 'Save Article',
      actions: 'Actions',
      messages: 'User Messages',
      delete: 'Delete',
      edit: 'Edit',
    }
  };

  const t = (key) => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
