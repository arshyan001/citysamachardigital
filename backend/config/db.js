const mongoose = require('mongoose');
const dns = require('dns');

// Force Node.js to use Google DNS for all lookups — fixes Windows SRV resolution issue
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

// Build a direct (non-SRV) URI from the +srv URI so Windows DNS issues are bypassed.
// Falls back to the original URI if parsing fails.
const buildDirectUri = (srvUri) => {
  if (!srvUri || !srvUri.startsWith('mongodb+srv://')) return srvUri;

  try {
    // Extract credentials and host from srv URI
    // mongodb+srv://user:pass@cluster0.xft5wsw.mongodb.net/dbname?options
    const withoutScheme = srvUri.replace('mongodb+srv://', '');
    const atIdx = withoutScheme.indexOf('@');
    const credentials = withoutScheme.substring(0, atIdx);          // user:pass
    const rest = withoutScheme.substring(atIdx + 1);                // cluster0.xft5wsw.mongodb.net/db?opts
    const slashIdx = rest.indexOf('/');
    const clusterHost = rest.substring(0, slashIdx);                // cluster0.xft5wsw.mongodb.net
    const dbAndOptions = rest.substring(slashIdx);                  // /dbname?options

    // Known Atlas shard hostnames for this cluster (from DNS SRV lookup)
    const shards = [
      `ac-iztdy4i-shard-00-00.xft5wsw.mongodb.net:27017`,
      `ac-iztdy4i-shard-00-01.xft5wsw.mongodb.net:27017`,
      `ac-iztdy4i-shard-00-02.xft5wsw.mongodb.net:27017`,
    ];

    // Build standard (non-SRV) replica set URI
    const directUri = `mongodb://${credentials}@${shards.join(',')}${dbAndOptions}&ssl=true&authSource=admin&replicaSet=atlas-xft5wsw-shard-0`;
    return directUri;
  } catch (e) {
    console.warn('⚠️  Could not build direct URI, using original:', e.message);
    return srvUri;
  }
};

const connectDB = async () => {
  const srvUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/news_channel';
  
  // Try SRV URI first, then fall back to direct URI
  const urisToTry = srvUri.startsWith('mongodb+srv://')
    ? [srvUri, buildDirectUri(srvUri)]
    : [srvUri];

  let lastError = null;

  for (let i = 0; i < urisToTry.length; i++) {
    const uri = urisToTry[i];
    const label = i === 0 ? 'SRV' : 'Direct';
    try {
      console.log(`🔗 [${label}] Connecting to MongoDB Atlas...`);

      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 15000,
        socketTimeoutMS: 30000,
        connectTimeoutMS: 15000,
        retryWrites: true,
        w: 'majority',
        family: 4, // Force IPv4
      });

      console.log(`✅ MongoDB Connected (${label}): ${conn.connection.host}`);
      console.log(`📊 Database: ${conn.connection.name}`);
      return conn;
    } catch (error) {
      console.error(`❌ [${label}] Connection failed: ${error.message}`);
      lastError = error;

      // If mongoose already has a connection open from a failed attempt, close it
      if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect().catch(() => {});
      }
    }
  }

  // Both attempts failed
  console.error('\n❌ All MongoDB connection attempts failed!');
  console.error('💡 Possible fixes:');
  console.error('   1. Check your internet connection');
  console.error('   2. In Windows: Settings → Network → Change adapter options → IPv4 DNS → set 8.8.8.8');
  console.error('   3. Whitelist your IP in MongoDB Atlas → Network Access\n');
  throw lastError;
};

module.exports = connectDB;
