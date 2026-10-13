import React, { useState, useEffect, useRef } from 'react';
import { Bell, BellOff, BellRing, X, CheckCircle } from 'lucide-react';

// Convert base64 URL-safe string to Uint8Array for VAPID key
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function NotificationBell() {
  const [permission, setPermission] = useState('default'); // 'default' | 'granted' | 'denied'
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastType, setToastType] = useState('success'); // 'success' | 'error'
  const [loading, setLoading] = useState(false);
  const promptShownRef = useRef(false);

  // Check current permission and subscription status on mount
  useEffect(() => {
    if (!('Notification' in window) || !('serviceWorker' in navigator) || !('PushManager' in window)) {
      return; // Browser doesn't support
    }
    setPermission(Notification.permission);
    checkExistingSubscription();

    // Show permission prompt automatically once per session if not yet decided
    const promptDismissed = sessionStorage.getItem('notif_prompt_shown');
    if (!promptDismissed && Notification.permission === 'default') {
      setTimeout(() => {
        if (!promptShownRef.current) {
          setShowPrompt(true);
          promptShownRef.current = true;
          sessionStorage.setItem('notif_prompt_shown', '1');
        }
      }, 3000); // Show after 3 seconds
    }
  }, []);

  const checkExistingSubscription = async () => {
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      setIsSubscribed(!!sub);
    } catch (err) {
      console.error('[Notif] Error checking subscription:', err);
    }
  };

  const registerServiceWorker = async () => {
    if (!('serviceWorker' in navigator)) {
      throw new Error('Service Worker not supported');
    }
    const reg = await navigator.serviceWorker.register('/sw.js');
    await navigator.serviceWorker.ready;
    return reg;
  };

  const subscribe = async () => {
    setLoading(true);
    try {
      // Get VAPID public key from backend
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const keyRes = await fetch(`${API_BASE}/api/push/vapid-public-key`);
      const { publicKey } = await keyRes.json();

      // Register service worker
      const reg = await registerServiceWorker();

      // Subscribe to push
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });

      // Send subscription to backend
      await fetch(`${API_BASE}/api/push/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sub.toJSON()),
      });

      setIsSubscribed(true);
      setPermission('granted');
      setShowPrompt(false);
      showToastMsg('✅ सूचनाएं चालू हो गई!', 'success');
    } catch (err) {
      console.error('[Notif] Subscribe error:', err);
      if (Notification.permission === 'denied') {
        setPermission('denied');
        showToastMsg('❌ सूचनाएं ब्राउज़र में ब्लॉक हैं। सेटिंग से अनुमति दें।', 'error');
      } else {
        showToastMsg('सूचना चालू करने में समस्या हुई।', 'error');
      }
      setShowPrompt(false);
    } finally {
      setLoading(false);
    }
  };

  const unsubscribe = async () => {
    setLoading(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        await fetch(`${API_BASE}/api/push/unsubscribe`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        });
        await sub.unsubscribe();
      }
      setIsSubscribed(false);
      showToastMsg('🔕 सूचनाएं बंद हो गई।', 'success');
    } catch (err) {
      console.error('[Notif] Unsubscribe error:', err);
      showToastMsg('सूचना बंद करने में समस्या हुई।', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToastMsg = (msg, type = 'success') => {
    setToastMsg(msg);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 4000);
  };

  const handleBellClick = () => {
    if (!('Notification' in window)) {
      showToastMsg('❌ आपका ब्राउज़र सूचनाएं सपोर्ट नहीं करता।', 'error');
      return;
    }
    if (isSubscribed) {
      unsubscribe();
    } else {
      subscribe();
    }
  };

  // Don't render if browser doesn't support
  if (!('Notification' in window) || !('serviceWorker' in navigator)) {
    return null;
  }

  return (
    <>
      {/* Bell Button */}
      <button
        onClick={handleBellClick}
        disabled={loading || permission === 'denied'}
        title={
          permission === 'denied'
            ? 'ब्राउज़र में सूचना ब्लॉक है'
            : isSubscribed
            ? 'सूचनाएं बंद करें'
            : 'सूचनाएं चालू करें'
        }
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          background: isSubscribed
            ? 'linear-gradient(135deg, rgba(239,68,68,0.15) 0%, rgba(185,28,28,0.15) 100%)'
            : 'transparent',
          border: isSubscribed
            ? '1px solid rgba(239,68,68,0.4)'
            : '1px solid var(--border-color)',
          borderRadius: '20px',
          padding: '5px 10px',
          cursor: permission === 'denied' ? 'not-allowed' : 'pointer',
          color: isSubscribed ? 'var(--color-primary)' : 'var(--color-text-secondary)',
          fontSize: '12px',
          fontWeight: 600,
          transition: 'all 0.2s ease',
          opacity: loading ? 0.7 : 1,
          whiteSpace: 'nowrap',
        }}
        onMouseEnter={(e) => {
          if (permission !== 'denied') {
            e.currentTarget.style.borderColor = 'var(--color-primary)';
            e.currentTarget.style.color = 'var(--color-primary)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isSubscribed) {
            e.currentTarget.style.borderColor = 'var(--border-color)';
            e.currentTarget.style.color = 'var(--color-text-secondary)';
          } else {
            e.currentTarget.style.borderColor = 'rgba(239,68,68,0.4)';
            e.currentTarget.style.color = 'var(--color-primary)';
          }
        }}
      >
        {loading ? (
          <span style={{ width: '14px', height: '14px', border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.6s linear infinite' }} />
        ) : permission === 'denied' ? (
          <BellOff size={14} />
        ) : isSubscribed ? (
          <BellRing size={14} style={{ animation: 'bellRing 1s ease-in-out' }} />
        ) : (
          <Bell size={14} />
        )}
        {isSubscribed ? 'सूचना ON' : permission === 'denied' ? 'ब्लॉक' : 'सूचना'}
      </button>

      {/* Auto Permission Prompt Modal — Centered with overlay */}
      {showPrompt && (
        <>
          {/* Dark Backdrop Overlay */}
          <div
            onClick={() => setShowPrompt(false)}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 99998,
              background: 'rgba(0, 0, 0, 0.65)',
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)',
              animation: 'fadeInOverlay 0.3s ease',
            }}
          />

          {/* Centered White Modal Card */}
          <div
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 99999,
              width: '360px',
              maxWidth: 'calc(100vw - 32px)',
              background: '#ffffff',
              borderRadius: '20px',
              padding: '32px 28px 24px 28px',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.35), 0 4px 16px rgba(0,0,0,0.15)',
              animation: 'popIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
          >
            {/* Close Button */}
            <button
              onClick={() => setShowPrompt(false)}
              style={{
                position: 'absolute',
                top: '14px',
                right: '14px',
                background: '#f3f4f6',
                border: 'none',
                cursor: 'pointer',
                color: '#6b7280',
                padding: '6px',
                borderRadius: '50%',
                width: '30px',
                height: '30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#e5e7eb'}
              onMouseLeave={e => e.currentTarget.style.background = '#f3f4f6'}
            >
              <X size={15} color="#374151" />
            </button>

            {/* Bell Icon Circle */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
              <div style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 24px rgba(220,38,38,0.35)',
                animation: 'bellRing 1.5s ease-in-out infinite',
              }}>
                <BellRing size={32} color="#fff" />
              </div>
            </div>

            {/* Text */}
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '20px', fontWeight: 800, color: '#111827' }}>
                ताज़ा खबरें पाएं!
              </h4>
              <p style={{ margin: '0 0 6px 0', fontSize: '13px', fontWeight: 600, color: '#dc2626', letterSpacing: '0.3px' }}>
                सिटी समाचार डिजिटल
              </p>
              <p style={{ margin: '12px 0 0 0', fontSize: '14px', color: '#4b5563', lineHeight: '1.6' }}>
                🔔 नई खबर आने पर तुरंत सूचना पाएं।<br />ब्रेकिंग न्यूज़ से हमेशा अपडेट रहें।
              </p>
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
              <button
                onClick={subscribe}
                disabled={loading}
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '14px',
                  fontSize: '15px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px rgba(220,38,38,0.4)',
                  transition: 'opacity 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                {loading ? (
                  <span style={{ width: '18px', height: '18px', border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.6s linear infinite' }} />
                ) : '🔔 हाँ, सूचना चालू करें'}
              </button>
              <button
                onClick={() => setShowPrompt(false)}
                style={{
                  width: '100%',
                  background: '#f9fafb',
                  color: '#6b7280',
                  border: '1.5px solid #e5e7eb',
                  borderRadius: '12px',
                  padding: '12px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#f3f4f6'}
                onMouseLeave={e => e.currentTarget.style.background = '#f9fafb'}
              >
                अभी नहीं
              </button>
            </div>
          </div>
        </>
      )}

      {/* Toast Notification */}
      {showToast && (
        <div
          style={{
            position: 'fixed',
            bottom: showPrompt ? '180px' : '20px',
            right: '20px',
            zIndex: 100000,
            background: toastType === 'success'
              ? 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)'
              : 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
            color: '#fff',
            padding: '12px 18px',
            borderRadius: '12px',
            fontSize: '13px',
            fontWeight: 600,
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            animation: 'slideInUp 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            maxWidth: '320px',
          }}
        >
          <CheckCircle size={16} />
          {toastMsg}
        </div>
      )}

      {/* Inline Keyframe Styles */}
      <style>{`
        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInOverlay {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes popIn {
          from { opacity: 0; transform: translate(-50%, -50%) scale(0.85); }
          to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
        @keyframes bellRing {
          0%, 100% { transform: rotate(0deg); }
          15% { transform: rotate(-18deg); }
          30% { transform: rotate(18deg); }
          45% { transform: rotate(-12deg); }
          60% { transform: rotate(12deg); }
          75% { transform: rotate(-6deg); }
          90% { transform: rotate(6deg); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}
