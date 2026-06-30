import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigationType } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import Navbar from './components/Navbar';
import BreakingNews from './components/BreakingNews';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import NewsDetail from './pages/NewsDetail';
import CityNews from './pages/CityNews';
import ContactUs from './pages/ContactUs';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import EPaper from './pages/EPaper';
import NewspaperGenerator from './pages/NewspaperGenerator';

// Custom Scroll Restoration Component for React Router DOM v6
function ScrollRestoration() {
  const location = useLocation();
  const navType = useNavigationType();

  useEffect(() => {
    // 1. If user navigates back/forward (POP), restore scroll position with a self-correcting loop
    if (navType === 'POP') {
      const savedScrollY = sessionStorage.getItem('scroll_' + location.key) || sessionStorage.getItem('scroll_' + location.pathname);
      if (savedScrollY !== null) {
        const targetScrollY = parseInt(savedScrollY, 10);
        let attempts = 0;
        const intervalId = setInterval(() => {
          window.scrollTo(0, targetScrollY);
          // If we successfully reached near target or exceeded 15 attempts (1.5s), stop checking
          if (Math.abs(window.scrollY - targetScrollY) < 15 || attempts > 15) {
            clearInterval(intervalId);
          }
          attempts++;
        }, 100);
        return () => clearInterval(intervalId);
      }
    } else {
      // 2. Otherwise, scroll to top on new page visit (PUSH)
      window.scrollTo(0, 0);
    }
  }, [location, navType]);

  useEffect(() => {
    // Keep saving scroll position as user scrolls
    const saveScroll = () => {
      // Avoid saving scroll if it has been reset on transition
      if (window.scrollY === 0 && navType === 'PUSH') return;
      
      sessionStorage.setItem('scroll_' + location.key, window.scrollY);
      sessionStorage.setItem('scroll_' + location.pathname, window.scrollY);
    };

    window.addEventListener('scroll', saveScroll);
    return () => {
      window.removeEventListener('scroll', saveScroll);
    };
  }, [location, navType]);

  return null;
}

export default function App() {
  return (
    <LanguageProvider>
      <Router>
        <ScrollRestoration />
        <div className="app-wrapper">
          {/* Header & Navbar */}
          <Navbar />
          
          {/* Breaking News Headlines Ticker */}
          <BreakingNews />

          {/* Main Content Body */}
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/news/:id" element={<NewsDetail />} />
              <Route path="/city/:subdivision" element={<CityNews />} />
              <Route path="/contact" element={<ContactUs />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/epaper" element={<EPaper />} />
              <Route path="/newspaper" element={<NewspaperGenerator />} />
            </Routes>
          </main>

          {/* Site Footer */}
          <Footer />
        </div>
      </Router>
    </LanguageProvider>
  );
}
