const mongoose = require('mongoose');
const dns = require('dns');

const connectDB = async () => {
  try {
    console.log('🔗 Connecting to MongoDB Atlas...');
    
    // Set Google DNS as fallback for DNS resolution
    dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
    
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/news_channel', {
      serverSelectionTimeoutMS: 20000,
      socketTimeoutMS: 25000,
      retryWrites: true,
      w: 'majority',
      family: 4, // Force IPv4
    });
    
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error('❌ MongoDB Connection Failed!');
    console.error('Error:', error.message);
    
    if (error.message.includes('querySrv') || error.message.includes('ECONNREFUSED')) {
      console.error('\n💡 Fix: Go to Windows Settings → Network & Internet → Change Adapter Settings');
      console.error('   Set DNS to: 8.8.8.8 or 1.1.1.1, then restart this application\n');
    }
    
    throw error;
  }
};

module.exports = connectDB;
