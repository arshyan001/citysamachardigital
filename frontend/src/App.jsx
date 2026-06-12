import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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

export default function App() {
  return (
    <LanguageProvider>
      <Router>
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
            </Routes>
          </main>

          {/* Site Footer */}
          <Footer />
        </div>
      </Router>
    </LanguageProvider>
  );
}
