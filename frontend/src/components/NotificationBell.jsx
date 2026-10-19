import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Bell, BellOff, BellRing, X, CheckCircle, AlertTriangle, ShieldAlert, ArrowRight, RefreshCw } from 'lucide-react';

// Convert base64 URL-safe string to Uint8Array for VAPID key
function urlBase64ToUint8Array(base64String) {
  if (!base64String) {
    throw new Error('VAPID public key is missing or invalid');
  }
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function NotificationBell({ fullWidth = false }) {
  const [permission, setPermission] = useState(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'default';
  });
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [showDeniedHelp, setShowDeniedHelp] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastType, setToastType] = useState('success'); // 'success' | 'error' | 'warning'
  const [loading, setLoading] = useState(false);

  // Environment feature detection
  const hasNotification = typeof window !== 'undefined' && 'Notification' in window;
  const hasServiceWorker = typeof navigator !== 'undefined' && 'serviceWorker' in navigator;
  const isIOS = typeof navigator !== 'undefined' && (/iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));
  const isStandalone = typeof window !== 'undefined' && (Boolean(window.navigator.standalone) || window.matchMedia('(display-mode: standalone)').matches);
  const isInApp = typeof navigator !== 'undefined' && /FBAN|FBAV|Instagram|WhatsApp|Line/i.test(navigator.userAgent);

  const checkExistingSubscription = async () => {
    if (!hasServiceWorker) return;
    try {
      if (hasNotification) {
        setPermission(Notification.permission);
      }
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg && reg.pushManager) {
        const sub = await reg.pushManager.getSubscription();
        setIsSubscribed(Boolean(sub));
      }
    } catch (err) {
      console.warn('[Notif] Check subscription warning:', err.message);
    }
  };

  useEffect(() => {
    checkExistingSubscription();

    // Listen for sync events between multiple bell buttons (desktop + mobile)
    const handleSync = (e) => {
      if (typeof e.detail?.isSubscribed === 'boolean') {
        setIsSubscribed(e.detail.isSubscribed);
      }
      if (e.detail?.permission) {
        setPermission(e.detail.permission);
      }
    };
    window.addEventListener('city_push_sync', handleSync);

    // Auto popup on page load:
    // Only open ONE instance across multiple mounted bells, and only if not dismissed in this session
    const currentPerm = hasNotification ? Notification.permission : 'default';
    const isDismissed = typeof sessionStorage !== 'undefined' && sessionStorage.getItem('city_notif_prompt_dismissed');

    if (!fullWidth && currentPerm === 'default' && !isDismissed && !window.__city_notif_auto_prompt_registered) {
      window.__city_notif_auto_prompt_registered = true;
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 900);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('city_push_sync', handleSync);
      };
    }

    return () => window.removeEventListener('city_push_sync', handleSync);
  }, [fullWidth]);

  const broadcastSync = (subscribed, perm) => {
    window.dispatchEvent(
      new CustomEvent('city_push_sync', {
        detail: { isSubscribed: subscribed, permission: perm }
      })
    );
  };

  const showToastMsg = (msg, type = 'success') => {
    setToastMsg(msg);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 5000);
  };

  const closePrompt = () => {
    setShowPrompt(false);
    try {
      sessionStorage.setItem('city_notif_prompt_dismissed', '1');
    } catch (e) {
      // ignore
    }
  };

  const subscribe = async () => {
    // 1. In-app browser detection (WhatsApp, Instagram, etc.)
    if (isInApp && !hasServiceWorker) {
      showToastMsg('🌐 सूचना चालू करने के लिए इस पेज को Chrome ब्राउज़र में खोलें।', 'warning');
      setShowPrompt(false);
      return;
    }

    // 2. iOS Safari detection (requires Add to Home Screen PWA for web push)
    if (isIOS && !isStandalone && !hasNotification) {
      showToastMsg('📲 iPhone पर: Safari में शेयर (⎋) दबाकर "Add to Home Screen" करें।', 'warning');
      setShowPrompt(false);
      return;
    }

    // 3. General support check
    if (!hasNotification || !hasServiceWorker) {
      showToastMsg('❌ आपका ब्राउज़र सूचनाएं सपोर्ट नहीं करता। कृपया Chrome में खोलें।', 'error');
      setShowPrompt(false);
      return;
    }

    setLoading(true);
    try {
      // Step 1: Request Notification Permission explicitly
      const currentPerm = await Notification.requestPermission();
      setPermission(currentPerm);

      if (currentPerm === 'denied') {
        broadcastSync(false, 'denied');
        setShowPrompt(false);
        setShowDeniedHelp(true);
        setLoading(false);
        return;
      }

      if (currentPerm !== 'granted') {
        showToastMsg('सूचना की अनुमति नहीं मिली।', 'warning');
        setShowPrompt(false);
        setLoading(false);
        return;
      }

      // Step 2: Get VAPID public key (with automatic static fallback)
      const FALLBACK_VAPID_KEY = 'BIOAbOKBTKDQcLNRtJI1TVKFiKB94TlzPSxtCQ5yEllgTLmn_A0chY3uof15ZrHMFYx3EVIQpdvgnBWg90Izg_U';
      let publicKey = FALLBACK_VAPID_KEY;

      try {
        const keyRes = await fetch('/api/push/vapid-public-key');
        if (keyRes.ok) {
          const contentType = keyRes.headers.get('content-type') || '';
          if (contentType.includes('application/json')) {
            const data = await keyRes.json();
            if (data?.publicKey) {
              publicKey = data.publicKey;
            }
          }
        }
      } catch (keyErr) {
        console.warn('[Notif] Key endpoint fetch failed, using fallback:', keyErr.message);
      }

      // Step 3: Register / ensure service worker is active
      let reg = await navigator.serviceWorker.getRegistration();
      if (!reg || !reg.active) {
        reg = await navigator.serviceWorker.register('/sw.js');
      }

      // Wait until active with 3s timeout
      if (reg.installing || reg.waiting) {
        await new Promise((resolve) => {
          const worker = reg.installing || reg.waiting;
          if (!worker) return resolve();
          worker.addEventListener('statechange', () => {
            if (worker.state === 'activated') resolve();
          });
          setTimeout(resolve, 3000);
        });
      }

      // Step 4: Subscribe to PushManager
      let sub;
      try {
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey),
        });
      } catch (pushSubErr) {
        console.error('[Notif] pushManager.subscribe failed:', pushSubErr);
        const isBrave = (navigator.brave && typeof navigator.brave.isBrave === 'function') || 
                        navigator.userAgent.includes('Brave');
        if (isBrave || pushSubErr.message?.includes('push service error') || pushSubErr.message?.includes('Registration failed')) {
          throw new Error('BRAVE_PUSH_DISABLED');
        }
        throw pushSubErr;
      }

      // Step 5: Send subscription to backend
      const subRes = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sub.toJSON()),
      });

      if (!subRes.ok) {
        console.warn(`[Notif] Backend subscription status: ${subRes.status}`);
      }

      setIsSubscribed(true);
      broadcastSync(true, 'granted');
      setShowPrompt(false);
      setShowDeniedHelp(false);
      showToastMsg('✅ ताज़ा खबरों की सूचनाएं चालू हो गई!', 'success');
    } catch (err) {
      console.error('[Notif] Subscribe error:', err);
      if (err.message === 'BRAVE_PUSH_DISABLED') {
        showToastMsg('🦁 Brave ब्राउज़र में Push Messaging बंद है। सेटिंग्स में जाकर "Use Google services for push messaging" चालू करें।', 'error');
      } else if (Notification.permission === 'denied') {
        setPermission('denied');
        broadcastSync(false, 'denied');
        setShowDeniedHelp(true);
      } else {
        showToastMsg(`सूचना चालू करने में समस्या हुई (${err.message || 'Error'})`, 'error');
      }
      setShowPrompt(false);
    } finally {
      setLoading(false);
    }
  };

  const unsubscribe = async () => {
    setLoading(true);
    try {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg && reg.pushManager) {
        const sub = await reg.pushManager.getSubscription();
        if (sub) {
          try {
            await fetch('/api/push/unsubscribe', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ endpoint: sub.endpoint }),
            });
          } catch (e) {
            console.warn('[Notif] Unsubscribe backend call warning:', e);
          }
          await sub.unsubscribe();
        }
      }
      setIsSubscribed(false);
      broadcastSync(false, permission);
      showToastMsg('🔕 सूचनाएं बंद कर दी गई हैं।', 'warning');
    } catch (err) {
      console.error('[Notif] Unsubscribe error:', err);
      showToastMsg('सूचना बंद करने में समस्या हुई।', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleBellClick = () => {
    if (permission === 'denied') {
      setShowDeniedHelp(true);
      return;
    }
    if (isSubscribed) {
      unsubscribe();
    } else {
      subscribe();
    }
  };

  // Render Portal Modals directly into document.body so that transforms/display:none on parents NEVER hide them
  const renderModals = () => {
    if (typeof document === 'undefined') return null;

    return createPortal(
      <>
        {/* 1. Auto Permission Prompt Modal */}
        {showPrompt && (
          <div className="city-notif-portal-root">
            {/* Dark Backdrop Overlay */}
            <div
              onClick={closePrompt}
              style={{
                position: 'fixed',
                inset: 0,
                zIndex: 999998,
                background: 'rgba(0, 0, 0, 0.72)',
                backdropFilter: 'blur(6px)',
                WebkitBackdropFilter: 'blur(6px)',
                animation: 'fadeInOverlay 0.25s ease',
              }}
            />

            {/* Centered Modal Card */}
            <div
              role="dialog"
              aria-modal="true"
              style={{
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 999999,
                width: '380px',
                maxWidth: 'calc(100vw - 28px)',
                background: '#ffffff',
                borderRadius: '24px',
                padding: '28px 22px 22px 22px',
                boxShadow: '0 25px 60px rgba(0, 0, 0, 0.55)',
                animation: 'popIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                boxSizing: 'border-box',
                textAlign: 'center',
              }}
            >
              {/* Close Button */}
              <button
                onClick={closePrompt}
                aria-label="Close"
                style={{
                  position: 'absolute',
                  top: '14px',
                  right: '14px',
                  background: '#f3f4f6',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#4b5563',
                  padding: '6px',
                  borderRadius: '50%',
                  width: '34px',
                  height: '34px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#e5e7eb'}
                onMouseLeave={e => e.currentTarget.style.background = '#f3f4f6'}
              >
                <X size={18} />
              </button>

              {/* Bell Icon Circle */}
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
                <div style={{
                  width: '74px',
                  height: '74px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 24px rgba(239,68,68,0.45)',
                  animation: 'bellRing 1.8s ease-in-out infinite',
                }}>
                  <BellRing size={36} color="#fff" />
                </div>
              </div>

              {/* Text */}
              <div style={{ marginBottom: '22px' }}>
                <h3 style={{ margin: '0 0 6px 0', fontSize: '20px', fontWeight: 800, color: '#111827', fontFamily: 'var(--font-display, inherit)' }}>
                  ताज़ा खबरें तुरंत पाएं!
                </h3>
                <div style={{ margin: '0 0 10px 0', fontSize: '13px', fontWeight: 700, color: '#dc2626' }}>
                  सिटी समाचार डिजिटल • संतकबीरनगर
                </div>
                <p style={{ margin: '0', fontSize: '14px', color: '#4b5563', lineHeight: '1.5' }}>
                  🔔 ब्रेकिंग न्यूज़, ख़ास रिपोर्ट और शहर की हर बड़ी घटना का नोटिफिकेशन सीधे अपने फोन पर पाएं।
                </p>
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
                <button
                  onClick={subscribe}
                  disabled={loading}
                  style={{
                    width: '100%',
                    background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '14px',
                    padding: '14px',
                    fontSize: '15px',
                    fontWeight: 700,
                    cursor: loading ? 'wait' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 16px rgba(239,68,68,0.4)',
                    transition: 'transform 0.1s, opacity 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '0.92'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                >
                  {loading ? (
                    <span style={{ width: '18px', height: '18px', border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.6s linear infinite' }} />
                  ) : (
                    <>
                      <BellRing size={18} />
                      हाँ, सूचनाएं चालू करें
                    </>
                  )}
                </button>
                <button
                  onClick={closePrompt}
                  style={{
                    width: '100%',
                    background: '#f9fafb',
                    color: '#6b7280',
                    border: '1.5px solid #e5e7eb',
                    borderRadius: '14px',
                    padding: '12px',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f3f4f6'}
                  onMouseLeave={e => e.currentTarget.style.background = '#f9fafb'}
                >
                  बाद में (Later)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 2. Denied Help Modal (How to unblock on mobile / Chrome) */}
        {showDeniedHelp && (
          <div className="city-notif-portal-root">
            <div
              onClick={() => setShowDeniedHelp(false)}
              style={{
                position: 'fixed',
                inset: 0,
                zIndex: 999998,
                background: 'rgba(0, 0, 0, 0.75)',
                backdropFilter: 'blur(6px)',
                WebkitBackdropFilter: 'blur(6px)',
              }}
            />

            <div
              role="dialog"
              aria-modal="true"
              style={{
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 999999,
                width: '390px',
                maxWidth: 'calc(100vw - 28px)',
                background: '#ffffff',
                borderRadius: '24px',
                padding: '26px 20px 22px 20px',
                boxShadow: '0 25px 60px rgba(0, 0, 0, 0.6)',
                animation: 'popIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                boxSizing: 'border-box',
              }}
            >
              <button
                onClick={() => setShowDeniedHelp(false)}
                style={{
                  position: 'absolute',
                  top: '14px',
                  right: '14px',
                  background: '#f3f4f6',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#4b5563',
                  padding: '6px',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <X size={16} />
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  background: 'rgba(239, 68, 68, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <ShieldAlert size={24} color="#ef4444" />
                </div>
                <div>
                  <h4 style={{ margin: '0', fontSize: '17px', fontWeight: 800, color: '#111827' }}>
                    सूचनाएं ब्लॉक हैं (Blocked)
                  </h4>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#6b7280' }}>
                    ब्राउज़र सेटिंग्स में चालू करने का तरीका
                  </p>
                </div>
              </div>

              <div style={{
                background: '#f9fafb',
                border: '1px solid #e5e7eb',
                borderRadius: '16px',
                padding: '14px 16px',
                marginBottom: '18px',
                fontSize: '13px',
                color: '#374151',
                lineHeight: '1.6'
              }}>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                  <span style={{ background: '#ef4444', color: '#fff', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, flexShrink: 0 }}>1</span>
                  <span>ऊपर Chrome के URL बार में <b>🔒 (ताला)</b> या <b>⚙️ (आइकॉन)</b> पर टैप करें।</span>
                </div>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                  <span style={{ background: '#ef4444', color: '#fff', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, flexShrink: 0 }}>2</span>
                  <span><b>Permissions (अनुमतियाँ)</b> में जाकर <b>Notifications</b> चुनें।</span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <span style={{ background: '#ef4444', color: '#fff', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, flexShrink: 0 }}>3</span>
                  <span>उसे <b>Allow (अनुमति दें / चालू)</b> करें।</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => window.location.reload()}
                  style={{
                    flex: 1,
                    background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '12px',
                    fontSize: '14px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                  }}
                >
                  <RefreshCw size={15} />
                  मैंने Allow कर दिया (रीफ्रेश करें)
                </button>
                <button
                  onClick={() => setShowDeniedHelp(false)}
                  style={{
                    background: '#f3f4f6',
                    color: '#4b5563',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '12px 16px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  बंद करें
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 3. Toast Notifications */}
        {showToast && (
          <div
            style={{
              position: 'fixed',
              bottom: '24px',
              right: '24px',
              left: '24px',
              margin: '0 auto',
              width: 'max-content',
              maxWidth: 'calc(100vw - 48px)',
              zIndex: 1000010,
              background: toastType === 'success'
                ? 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)'
                : toastType === 'warning'
                ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                : 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
              color: '#fff',
              padding: '12px 20px',
              borderRadius: '16px',
              fontSize: '13px',
              fontWeight: 600,
              boxShadow: '0 10px 30px rgba(0,0,0,0.35)',
              animation: 'slideInUp 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              boxSizing: 'border-box',
            }}
          >
            {toastType === 'success' ? (
              <CheckCircle size={18} style={{ flexShrink: 0 }} />
            ) : (
              <AlertTriangle size={18} style={{ flexShrink: 0 }} />
            )}
            <span>{toastMsg}</span>
          </div>
        )}
      </>,
      document.body
    );
  };

  return (
    <>
      {/* Bell Action Button */}
      <button
        onClick={handleBellClick}
        disabled={loading}
        title={
          permission === 'denied'
            ? 'सूचनाएं ब्लॉक हैं (टैप कर चालू करने का तरीका देखें)'
            : isSubscribed
            ? 'सूचनाएं चालू हैं (टैप कर बंद करें)'
            : 'ताज़ा खबरों की सूचनाएं चालू करें'
        }
        className={`notification-bell-btn ${isSubscribed ? 'subscribed' : ''} ${fullWidth ? 'full-width' : ''}`}
        style={fullWidth ? {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          width: '100%',
          background: isSubscribed
            ? 'linear-gradient(135deg, rgba(34,197,94,0.15) 0%, rgba(21,128,61,0.18) 100%)'
            : permission === 'denied'
            ? 'linear-gradient(135deg, rgba(239,68,68,0.12) 0%, rgba(185,28,28,0.15) 100%)'
            : 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
          border: isSubscribed 
            ? '1.5px solid rgba(34,197,94,0.5)' 
            : permission === 'denied'
            ? '1.5px solid rgba(239,68,68,0.4)'
            : 'none',
          borderRadius: '12px',
          padding: '11px 16px',
          cursor: loading ? 'wait' : 'pointer',
          color: isSubscribed ? '#16a34a' : permission === 'denied' ? '#ef4444' : '#fff',
          fontSize: '13px',
          fontWeight: 700,
          boxShadow: isSubscribed || permission === 'denied' ? 'none' : '0 4px 14px rgba(239,68,68,0.35)',
          transition: 'all 0.2s ease',
          opacity: loading ? 0.7 : 1,
        } : {
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          background: isSubscribed
            ? 'linear-gradient(135deg, rgba(34,197,94,0.15) 0%, rgba(21,128,61,0.15) 100%)'
            : permission === 'denied'
            ? 'rgba(239,68,68,0.1)'
            : 'transparent',
          border: isSubscribed
            ? '1.5px solid rgba(34,197,94,0.6)'
            : permission === 'denied'
            ? '1.5px solid rgba(239,68,68,0.5)'
            : '1.5px solid var(--border-color)',
          borderRadius: '20px',
          padding: '6px 12px',
          cursor: loading ? 'wait' : 'pointer',
          color: isSubscribed 
            ? '#16a34a' 
            : permission === 'denied' 
            ? '#ef4444' 
            : 'var(--color-primary)',
          fontSize: '12px',
          fontWeight: 700,
          transition: 'all 0.2s ease',
          opacity: loading ? 0.7 : 1,
          whiteSpace: 'nowrap',
          position: 'relative',
        }}
      >
        {loading ? (
          <span style={{ width: '13px', height: '13px', border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.6s linear infinite' }} />
        ) : permission === 'denied' ? (
          <BellOff size={fullWidth ? 16 : 15} color="#ef4444" />
        ) : isSubscribed ? (
          <BellRing size={fullWidth ? 16 : 15} color="#16a34a" style={{ animation: 'bellRing 1s ease-in-out' }} />
        ) : (
          <Bell size={fullWidth ? 16 : 15} />
        )}
        <span>
          {fullWidth ? (
            isSubscribed 
              ? '✅ सूचना चालू है (टैप कर बंद करें)' 
              : permission === 'denied' 
              ? '⚠️ सूचना ब्लॉक है (चालू करें)' 
              : '🔔 सूचना चालू करें'
          ) : (
            isSubscribed 
              ? 'सूचना चालू' 
              : permission === 'denied' 
              ? 'सूचना ब्लॉक' 
              : 'सूचना चालू करें'
          )}
        </span>

        {/* Pulsing alert dot for not subscribed */}
        {!isSubscribed && permission !== 'denied' && !fullWidth && (
          <span style={{
            position: 'absolute',
            top: '-2px',
            right: '-2px',
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: '#ef4444',
            boxShadow: '0 0 6px #ef4444',
            animation: 'pulse 1.5s infinite'
          }} />
        )}
      </button>

      {/* Render All Modals via React Portal */}
      {renderModals()}

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
