const express = require('express');
const router = express.Router();
const pushService = require('../services/pushService');
const { protect } = require('../middleware/authMiddleware');

// GET /api/push/vapid-public-key — return public key to frontend
router.get('/vapid-public-key', (req, res) => {
  const key = pushService.getPublicKey();
  res.json({ publicKey: key });
});

// POST /api/push/subscribe — save a new push subscription
router.post('/subscribe', async (req, res) => {
  const subscription = req.body;
  if (!subscription || !subscription.endpoint || !subscription.keys) {
    return res.status(400).json({ error: 'Invalid subscription: endpoint and keys are required' });
  }

  try {
    await pushService.subscribeUser(subscription, req.headers['user-agent']);
    const count = await pushService.getSubscriberCount();
    console.log(`[Push Route] Subscribed successfully. Total subscribers: ${count}`);
    res.status(201).json({ message: 'Subscribed successfully', count });
  } catch (err) {
    console.error('[Push Route] Subscribe error:', err.message);
    res.status(500).json({ error: 'Failed to save subscription: ' + err.message });
  }
});

// POST /api/push/unsubscribe — remove a subscription
router.post('/unsubscribe', async (req, res) => {
  const { endpoint } = req.body;
  if (!endpoint) return res.status(400).json({ error: 'Endpoint required' });

  try {
    await pushService.unsubscribeUser(endpoint);
    res.json({ message: 'Unsubscribed successfully' });
  } catch (err) {
    console.error('[Push Route] Unsubscribe error:', err.message);
    res.status(500).json({ error: 'Failed to unsubscribe' });
  }
});

// POST /api/push/send — send notification to all subscribers
router.post('/send', async (req, res) => {
  const { title, body, url, icon, badge, tag } = req.body;

  try {
    const result = await pushService.sendNotificationToAll({
      title: title || 'सिटी समाचार डिजिटल',
      body: body || 'नई खबर आई है!',
      url: url || '/',
      icon: icon || '/logo.png',
      badge: badge || '/logo.png',
      tag: tag || 'city-samachar-news'
    });
    res.json(result);
  } catch (err) {
    console.error('[Push Route] Send error:', err.message);
    res.status(500).json({ error: 'Failed to send notification: ' + err.message });
  }
});

// POST /api/push/test — send test notification (Admin only or public test)
router.post('/test', async (req, res) => {
  const { title, body } = req.body;
  try {
    const result = await pushService.sendNotificationToAll({
      title: title || '🔔 टेस्ट नोटिफिकेशन - सिटी समाचार',
      body: body || 'यह एक परीक्षण सूचना है। आपकी नोटिफिकेशन सेवा सक्रिय है!',
      url: '/',
      icon: '/logo.png',
      tag: 'test-notification-' + Date.now()
    });
    res.json({ message: 'Test notification triggered', ...result });
  } catch (err) {
    console.error('[Push Route] Test notification error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/push/count — get subscriber count (for admin)
router.get('/count', async (req, res) => {
  try {
    const count = await pushService.getSubscriberCount();
    res.json({ count });
  } catch (err) {
    res.status(500).json({ count: 0, error: err.message });
  }
});

module.exports = router;
