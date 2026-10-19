import React, { useState, useEffect, useRef } from 'react';
import { Bell, BellOff, BellRing, X, CheckCircle, AlertTriangle } from 'lucide-react';

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
  const [permission, setPermission] = useState('default'); // 'default' | 'granted' | 'denied'
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastType, setToastType] = useState('success'); // 'success' | 'error' | 'warning'
  const [loading, setLoading] = useState(false);
  const promptShownRef = useRef(false);

  // Check support
  const isSupported =
    typeof window !== 'undefined' &&
    'Notification' in window &&
    'serviceWorker' in navigator &&
    'PushManager' in window;

  const checkExistingSubscription = async () => {
    if (!isSupported) return;
    try {
      setPermission(Notification.permission);
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg) {
        const sub = await reg.pushManager.getSubscription();
        setIsSubscribed(!!sub);
      }
    } catch (err) {
      console.warn('[Notif] Check subscription warning:', err.message);
    }
  };

  useEffect(() => {
    if (!isSupported) return;

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

    // Show prompt automatically when website opens if not yet subscribed or decided
    if (Notification.permission === 'default' && !promptShownRef.current) {
      const timer = setTimeout(() => {
        setShowPrompt(true);
        promptShownRef.current = true;
      }, 1200);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('city_push_sync', handleSync);
      };
    }

    return () => window.removeEventListener('city_push_sync', handleSync);
  }, [isSupported]);

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
    setTimeout(() => setShowToast(false), 4500);
  };

  const subscribe = async () => {
    if (!isSupported) {
      showToastMsg('❌ आपका ब्राउज़र सूचनाएं सपोर्ट नहीं करता।', 'error');
      return;
    }

    setLoading(true);
    try {
      // Step 1: Request Notification Permission explicitly
      const currentPerm = await Notification.requestPermission();
      setPermission(currentPerm);

      if (currentPerm === 'denied') {
        broadcastSync(false, 'denied');
        showToastMsg('❌ सूचनाएं ब्राउज़र में ब्लॉक हैं। ब्राउज़र सेटिंग से अनुमति दें।', 'error');
        setShowPrompt(false);
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
        // Check for Brave browser push limitation
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
      showToastMsg('✅ ताज़ा खबरों की सूचनाएं चालू हो गई!', 'success');
    } catch (err) {
      console.error('[Notif] Subscribe error:', err);
      if (err.message === 'BRAVE_PUSH_DISABLED') {
        showToastMsg('🦁 Brave ब्राउज़र में Push Messaging बंद है। सेटिंग्स में जाकर "Use Google services for push messaging" चालू करें।', 'error');
      } else if (Notification.permission === 'denied') {
        setPermission('denied');
        broadcastSync(false, 'denied');
        showToastMsg('❌ सूचनाएं ब्लॉक हैं। ब्राउज़र सेटिंग्स में जाकर Allow करें।', 'error');
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
      if (reg) {
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
      broadcastSync(false, Notification.permission);
      showToastMsg('🔕 सूचनाएं बंद कर दी गई हैं।', 'warning');
    } catch (err) {
      console.error('[Notif] Unsubscribe error:', err);
      showToastMsg('सूचना बंद करने में समस्या हुई।', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleBellClick = () => {
    if (!isSupported) {
      showToastMsg('❌ आपका ब्राउज़र या डिवाइस सूचनाएं सपोर्ट नहीं करता।', 'error');
      return;
    }
    if (permission === 'denied') {
      showToastMsg('❌ सूचनाएं ब्लॉक हैं। ब्राउज़र सेटिंग में जाकर Allow करें।', 'error');
      return;
    }
    if (isSubscribed) {
      unsubscribe();
    } else {
      subscribe();
    }
  };

  if (!isSupported) {
    return null;
  }

  return (
    <>
      {/* Bell Button */}
      <button
        onClick={handleBellClick}
        disabled={loading}
        title={
          permission === 'denied'
            ? 'ब्राउज़र में सूचना ब्लॉक है (सेटिंग्स से अनुमति दें)'
            : isSubscribed
            ? 'सूचनाएं बंद करें'
            : 'ताज़ा खबरों की सूचनाएं चालू करें'
        }
        style={fullWidth ? {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          width: '100%',
          background: isSubscribed
            ? 'linear-gradient(135deg, rgba(34,197,94,0.15) 0%, rgba(21,128,61,0.18) 100%)'
            : 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
          border: isSubscribed ? '1.5px solid rgba(34,197,94,0.5)' : 'none',
          borderRadius: '12px',
          padding: '11px 16px',
          cursor: loading ? 'wait' : 'pointer',
          color: isSubscribed ? '#16a34a' : '#fff',
          fontSize: '13px',
          fontWeight: 700,
          boxShadow: isSubscribed ? 'none' : '0 4px 14px rgba(239,68,68,0.35)',
          transition: 'all 0.2s ease',
          opacity: loading ? 0.7 : 1,
        } : {
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          background: isSubscribed
            ? 'linear-gradient(135deg, rgba(239,68,68,0.18) 0%, rgba(185,28,28,0.18) 100%)'
            : 'transparent',
          border: isSubscribed
            ? '1.5px solid rgba(239,68,68,0.6)'
            : '1px solid var(--border-color)',
          borderRadius: '20px',
          padding: '5px 11px',
          cursor: loading ? 'wait' : 'pointer',
          color: isSubscribed ? 'var(--color-primary)' : 'var(--color-text-secondary)',
          fontSize: '12px',
          fontWeight: 700,
          transition: 'all 0.2s ease',
          opacity: loading ? 0.7 : 1,
          whiteSpace: 'nowrap',
        }}
        onMouseEnter={(e) => {
          if (!fullWidth) {
            e.currentTarget.style.borderColor = 'var(--color-primary)';
            e.currentTarget.style.color = 'var(--color-primary)';
          }
        }}
        onMouseLeave={(e) => {
          if (!fullWidth) {
            if (!isSubscribed) {
              e.currentTarget.style.borderColor = 'var(--border-color)';
              e.currentTarget.style.color = 'var(--color-text-secondary)';
            } else {
              e.currentTarget.style.borderColor = 'rgba(239,68,68,0.6)';
              e.currentTarget.style.color = 'var(--color-primary)';
            }
          }
        }}
      >
        {loading ? (
          <span style={{ width: '13px', height: '13px', border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.6s linear infinite' }} />
        ) : permission === 'denied' ? (
          <BellOff size={fullWidth ? 16 : 14} color={fullWidth ? 'currentColor' : '#ef4444'} />
        ) : isSubscribed ? (
          <BellRing size={fullWidth ? 16 : 14} color={fullWidth ? '#16a34a' : '#ef4444'} style={{ animation: 'bellRing 1s ease-in-out' }} />
        ) : (
          <Bell size={fullWidth ? 16 : 14} />
        )}
        <span>
          {fullWidth ? (
            isSubscribed ? '✅ सूचना चालू है (टैप कर बंद करें)' : permission === 'denied' ? '❌ सूचनाएं ब्लॉक हैं (Allow करें)' : '🔔 सूचना चालू करें'
          ) : (
            isSubscribed ? 'सूचना चालू' : permission === 'denied' ? 'ब्लॉक' : 'सूचना'
          )}
        </span>
      </button>

      {/* Auto Permission Prompt Modal */}
      {showPrompt && (
        <>
          {/* Dark Backdrop Overlay */}
          <div
            onClick={() => setShowPrompt(false)}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 100001,
              background: 'rgba(0, 0, 0, 0.7)',
              backdropFilter: 'blur(5px)',
              WebkitBackdropFilter: 'blur(5px)',
              animation: 'fadeInOverlay 0.25s ease',
            }}
          />

          {/* Centered Modal Card */}
          <div
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 100002,
              width: '360px',
              maxWidth: 'calc(100vw - 32px)',
              background: '#ffffff',
              borderRadius: '24px',
              padding: '30px 24px 22px 24px',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.45)',
              animation: 'popIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
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
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#e5e7eb'}
              onMouseLeave={e => e.currentTarget.style.background = '#f3f4f6'}
            >
              <X size={16} color="#374151" />
            </button>

            {/* Bell Icon Circle */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '18px' }}>
              <div style={{
                width: '74px',
                height: '74px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 24px rgba(239,68,68,0.4)',
                animation: 'bellRing 1.8s ease-in-out infinite',
              }}>
                <BellRing size={34} color="#fff" />
              </div>
            </div>

            {/* Text */}
            <div style={{ textAlign: 'center', marginBottom: '22px' }}>
              <h4 style={{ margin: '0 0 6px 0', fontSize: '20px', fontWeight: 800, color: '#111827' }}>
                ताज़ा खबरें तुरंत पाएं!
              </h4>
              <p style={{ margin: '0 0 8px 0', fontSize: '13px', fontWeight: 700, color: '#dc2626' }}>
                सिटी समाचार डिजिटल
              </p>
              <p style={{ margin: '0', fontSize: '14px', color: '#4b5563', lineHeight: '1.5' }}>
                🔔 ब्रेकिंग न्यूज़ और संतकबीरनगर की हर बड़ी खबर का तुरंत नोटिफिकेशन अपने फोन पर पाएं।
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
                  cursor: 'pointer',
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
                ) : '🔔 हाँ, सूचना चालू करें'}
              </button>
              <button
                onClick={() => setShowPrompt(false)}
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
            bottom: '24px',
            right: '24px',
            zIndex: 100000,
            background: toastType === 'success'
              ? 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)'
              : toastType === 'warning'
              ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
              : 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
            color: '#fff',
            padding: '12px 18px',
            borderRadius: '14px',
            fontSize: '14px',
            fontWeight: 600,
            boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
            animation: 'slideInUp 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            maxWidth: '340px',
          }}
        >
          {toastType === 'success' ? (
            <CheckCircle size={18} />
          ) : (
            <AlertTriangle size={18} />
          )}
          <span>{toastMsg}</span>
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
