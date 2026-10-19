const webpush = require('web-push');
const PushSubscription = require('../models/PushSubscription');
const jsonDb = require('../config/jsonDb');

// Default fallback VAPID keys (in case env variables are missing on host)
const DEFAULT_VAPID_PUBLIC_KEY = 'BIOAbOKBTKDQcLNRtJI1TVKFiKB94TlzPSxtCQ5yEllgTLmn_A0chY3uof15ZrHMFYx3EVIQpdvgnBWg90Izg_U';
const DEFAULT_VAPID_PRIVATE_KEY = 'yfXFp6kLuICaNKzilulUQiI6R_XNishHAeh8xmRI8wY';
const DEFAULT_VAPID_EMAIL = 'mailto:admin@citysamachardigital.com';

const publicKey = process.env.VAPID_PUBLIC_KEY || DEFAULT_VAPID_PUBLIC_KEY;
const privateKey = process.env.VAPID_PRIVATE_KEY || DEFAULT_VAPID_PRIVATE_KEY;
const email = process.env.VAPID_EMAIL || DEFAULT_VAPID_EMAIL;

try {
  webpush.setVapidDetails(email, publicKey, privateKey);
  console.log('✅ WebPush VAPID configured successfully');
} catch (err) {
  console.error('❌ Failed to configure WebPush VAPID:', err.message);
}

const getPublicKey = () => publicKey;

// Save or update subscription
const subscribeUser = async (subscription, userAgent = '') => {
  if (!subscription || !subscription.endpoint || !subscription.keys) {
    throw new Error('Invalid subscription payload: endpoint and keys required');
  }

  if (global.useJsonDb) {
    jsonDb.savePushSubscription({
      endpoint: subscription.endpoint,
      expirationTime: subscription.expirationTime || null,
      keys: subscription.keys,
      userAgent: userAgent || ''
    });
    return { success: true };
  }

  try {
    await PushSubscription.findOneAndUpdate(
      { endpoint: subscription.endpoint },
      {
        endpoint: subscription.endpoint,
        expirationTime: subscription.expirationTime || null,
        keys: subscription.keys,
        userAgent: userAgent || ''
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    return { success: true };
  } catch (err) {
    // Fallback to jsonDb if Mongo fails
    console.warn('[Push] Mongo save failed, saving to jsonDb:', err.message);
    jsonDb.savePushSubscription(subscription);
    return { success: true };
  }
};

// Remove subscription
const unsubscribeUser = async (endpoint) => {
  if (!endpoint) return false;

  if (global.useJsonDb) {
    return jsonDb.removePushSubscription(endpoint);
  }

  try {
    const res = await PushSubscription.deleteOne({ endpoint });
    jsonDb.removePushSubscription(endpoint);
    return res.deletedCount > 0;
  } catch (err) {
    console.warn('[Push] Mongo delete failed, deleting from jsonDb:', err.message);
    return jsonDb.removePushSubscription(endpoint);
  }
};

// Get subscriber count
const getSubscriberCount = async () => {
  if (global.useJsonDb) {
    return jsonDb.countPushSubscriptions();
  }

  try {
    return await PushSubscription.countDocuments();
  } catch (err) {
    return jsonDb.countPushSubscriptions();
  }
};

// Send notification to all subscribers
const sendNotificationToAll = async ({ title, body, url, icon, badge, tag }) => {
  let subscriptions = [];

  if (global.useJsonDb) {
    subscriptions = jsonDb.getPushSubscriptions();
  } else {
    try {
      subscriptions = await PushSubscription.find({}).lean();
    } catch (err) {
      console.warn('[Push] Mongo fetch failed, reading from jsonDb:', err.message);
      subscriptions = jsonDb.getPushSubscriptions();
    }
  }

  if (!subscriptions || subscriptions.length === 0) {
    console.log('[Push] No active subscribers found.');
    return { sent: 0, failed: 0, total: 0 };
  }

  const payload = JSON.stringify({
    title: title || 'सिटी समाचार डिजिटल',
    body: body || 'नई खबर आई है!',
    url: url || '/',
    icon: icon || '/logo.png',
    badge: badge || '/logo.png',
    tag: tag || 'city-samachar-news'
  });

  let sentCount = 0;
  const expiredEndpoints = [];

  const promises = subscriptions.map(async (sub) => {
    try {
      const pushSub = {
        endpoint: sub.endpoint,
        keys: sub.keys
      };
      await webpush.sendNotification(pushSub, payload);
      sentCount++;
    } catch (err) {
      const status = err.statusCode;
      // 404 or 410 means subscription is permanently expired/unregistered
      if (status === 410 || status === 404) {
        expiredEndpoints.push(sub.endpoint);
      } else {
        console.error(`[Push] Delivery error (${status}):`, err.message);
      }
    }
  });

  await Promise.all(promises);

  // Clean up expired subscriptions
  if (expiredEndpoints.length > 0) {
    console.log(`[Push] Cleaning up ${expiredEndpoints.length} expired subscriptions`);
    if (!global.useJsonDb) {
      try {
        await PushSubscription.deleteMany({ endpoint: { $in: expiredEndpoints } });
      } catch (e) {
        console.error('[Push] Error deleting expired from Mongo:', e.message);
      }
    }
    jsonDb.removePushSubscriptionsBatch(expiredEndpoints);
  }

  console.log(`[Push] Sent to ${sentCount}/${subscriptions.length} subscribers.`);
  return {
    sent: sentCount,
    failed: expiredEndpoints.length,
    total: subscriptions.length
  };
};

module.exports = {
  getPublicKey,
  subscribeUser,
  unsubscribeUser,
  getSubscriberCount,
  sendNotificationToAll
};
