import React, { createContext, useContext } from 'react';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  // Language is permanently set to Hindi - no toggle needed
  const language = 'hi';

  // Static dictionary for structural layout translations (Hindi only)
  const translations = {
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
  };

  const t = (key) => {
    return translations[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
