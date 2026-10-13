const express = require('express');
const router = express.Router();
const webpush = require('web-push');

// Configure VAPID keys (only when env vars are available)
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    process.env.VAPID_EMAIL || 'mailto:admin@citysamachardigital.com',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

// In-memory subscription store (in production, use DB)
// We store in global so it persists across restarts via server memory
if (!global.pushSubscriptions) {
  global.pushSubscriptions = [];
}

// GET /api/push/vapid-public-key — return public key to frontend
router.get('/vapid-public-key', (req, res) => {
  res.json({ publicKey: process.env.VAPID_PUBLIC_KEY });
});

// POST /api/push/subscribe — save a new push subscription
router.post('/subscribe', (req, res) => {
  const subscription = req.body;
  if (!subscription || !subscription.endpoint) {
    return res.status(400).json({ error: 'Invalid subscription' });
  }

  // Avoid duplicate subscriptions
  const exists = global.pushSubscriptions.some(
    (s) => s.endpoint === subscription.endpoint
  );
  if (!exists) {
    global.pushSubscriptions.push(subscription);
    console.log(`[Push] New subscriber. Total: ${global.pushSubscriptions.length}`);
  }

  res.status(201).json({ message: 'Subscribed successfully' });
});

// POST /api/push/unsubscribe — remove a subscription
router.post('/unsubscribe', (req, res) => {
  const { endpoint } = req.body;
  if (!endpoint) return res.status(400).json({ error: 'Endpoint required' });

  global.pushSubscriptions = global.pushSubscriptions.filter(
    (s) => s.endpoint !== endpoint
  );
  console.log(`[Push] Unsubscribed. Total: ${global.pushSubscriptions.length}`);
  res.json({ message: 'Unsubscribed successfully' });
});

// POST /api/push/send — send notification to all subscribers (called internally)
router.post('/send', async (req, res) => {
  const { title, body, url, icon } = req.body;

  const payload = JSON.stringify({
    title: title || 'सिटी समाचार डिजिटल',
    body: body || 'नई खबर आई है!',
    url: url || '/',
    icon: icon || '/logo.png',
    badge: '/logo.png',
  });

  let successCount = 0;
  let failedEndpoints = [];

  const sendPromises = global.pushSubscriptions.map(async (subscription) => {
    try {
      await webpush.sendNotification(subscription, payload);
      successCount++;
    } catch (err) {
      console.error('[Push] Failed to send:', err.statusCode, subscription.endpoint);
      // Remove expired/invalid subscriptions
      if (err.statusCode === 410 || err.statusCode === 404) {
        failedEndpoints.push(subscription.endpoint);
      }
    }
  });

  await Promise.all(sendPromises);

  // Clean up invalid subscriptions
  if (failedEndpoints.length > 0) {
    global.pushSubscriptions = global.pushSubscriptions.filter(
      (s) => !failedEndpoints.includes(s.endpoint)
    );
  }

  console.log(`[Push] Sent to ${successCount}/${global.pushSubscriptions.length + failedEndpoints.length} subscribers`);
  res.json({ sent: successCount, failed: failedEndpoints.length });
});

// GET /api/push/count — get subscriber count (for admin)
router.get('/count', (req, res) => {
  res.json({ count: global.pushSubscriptions.length });
});

module.exports = router;
