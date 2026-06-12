require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

// Import routes
const authRoutes = require('./routes/authRoutes');
const newsRoutes = require('./routes/newsRoutes');
const contactRoutes = require('./routes/contactRoutes');
const epaperRoutes = require('./routes/epaperRoutes');
const translateRoutes = require('./routes/translateRoutes');
const pollRoutes = require('./routes/pollRoutes');
const cricketRoutes = require('./routes/cricketRoutes');
const adRoutes = require('./routes/adRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

const User = require('./models/User');
const Category = require('./models/Category');
const Advertisement = require('./models/Advertisement');

const app = express();

// Middleware
app.use(cors());
app.use((req, res, next) => {
  console.log(`[HTTP] ${req.method} ${req.url}`);
  next();
});
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded images statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/epaper', epaperRoutes);
app.use('/api/translate', translateRoutes);
app.use('/api/poll', pollRoutes);
app.use('/api/cricket', cricketRoutes);
app.use('/api/ads', adRoutes);
app.use('/api/analytics', analyticsRoutes);

// Simple status route
app.get('/', (req, res) => {
  res.send('News Channel API is running...');
});

// Seed admin and categories if needed
const seedData = async () => {
  try {
    const userCount = await User.countDocuments({});
    if (userCount === 0) {
      const adminUsername = process.env.ADMIN_USERNAME || 'admin';
      const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
      const admin = new User({
        username: adminUsername,
        password: adminPassword,
      });
      await admin.save();
      console.log(`[SEED] Admin seeded. Username: ${adminUsername}, Password: ${adminPassword}`);
    }

    const categoryCount = await Category.countDocuments({});
    if (categoryCount === 0) {
      const defaultCategories = [
        { nameEn: 'Politics', nameHi: 'राजनीति' },
        { nameEn: 'National', nameHi: 'राष्ट्रीय' },
        { nameEn: 'Local News', nameHi: 'स्थानीय समाचार' },
        { nameEn: 'Sports', nameHi: 'खेल' },
        { nameEn: 'Entertainment', nameHi: 'मनोरंजन' },
        { nameEn: 'Crime', nameHi: 'अपराध' },
      ];
      await Category.insertMany(defaultCategories);
      console.log('[SEED] Default categories seeded.');
    }


  } catch (error) {
    console.error('Error seeding data:', error);
  }
};

// Global error handler middleware
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  console.error('[SERVER ERROR]', err);
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5000;

global.useJsonDb = false;

// Start DB connection then listen
connectDB()
  .then(async () => {
    await seedData();
    app.listen(PORT, () => {
      console.log(`Server running on MongoDB on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.warn('----------------------------------------------------------------------');
    console.warn(`WARNING: Failed to connect to MongoDB: ${err.message}`);
    console.warn('FALLING BACK TO LOCAL JSON DATABASE MODE (db.json)');
    console.warn('----------------------------------------------------------------------');
    global.useJsonDb = true;

    // Seed sample data in db.json if empty
    const jsonDb = require('./config/jsonDb');
    const news = jsonDb.getNews({});
    if (news.length === 0) {
      const categories = jsonDb.getCategories();
      const sampleNews = [
        {
          titleEn: 'Heat Wave Warning Issued for Sant Kabir Nagar District',
          titleHi: 'संत कबीर नगर जिले के लिए लू (हीट वेव) की चेतावनी जारी',
          contentEn: `The District Magistrate of Sant Kabir Nagar has issued a severe heat wave advisory for all residents. With temperatures expected to soar above 44 degrees Celsius over the next few days, citizens are advised to take necessary precautions.\n\nHealth officials have urged people to stay hydrated, avoid stepping outdoors between 12:00 PM and 4:00 PM, and keep check on the elderly and children. Water distribution stations are being set up near prominent public areas including Khalilabad Railway Station and municipal markets to offer relief to commuters.\n\nAll government primary schools have also adjusted their timings, scheduling classes in the morning from 7:00 AM to 11:30 AM. Local hospitals have established dedicated heat stroke wards with necessary medicines and cooling facilities. The administration has requested NGOs and local leaders to spread awareness in the rural pockets of Mehdawal and Dhanghata subdivisions.`,
          contentHi: `संत कबीर नगर के जिलाधिकारी ने सभी निवासियों के लिए गंभीर लू (हीट वेव) की सलाह जारी की है। अगले कुछ दिनों में तापमान 44 डिग्री सेल्सियस से ऊपर जाने की आशंका को देखते हुए नागरिकों को आवश्यक सावधानी बरतने की सलाह दी गई है।\n\nस्वास्थ्य अधिकारियों ने लोगों से पर्याप्त मात्रा में पानी पीने, दोपहर 12:00 बजे से शाम 4:00 बजे के बीच घर से बाहर निकलने से बचने और बुजुर्गों व बच्चों का विशेष ध्यान रखने का आग्रह किया है। यात्रियों को राहत देने के लिए खलीलाबाद रेलवे स्टेशन और नगर पालिका बाजारों सहित प्रमुख सार्वजनिक क्षेत्रों के पास जल वितरण केंद्र स्थापित किए जा रहे हैं।\n\nसभी सरकारी प्राथमिक स्कूलों के समय में भी बदलाव किया गया है, जिसके तहत कक्षाएं सुबह 7:00 बजे से 11:30 बजे तक संचालित होंगी। स्थानीय अस्पतालों में आवश्यक दवाओं और शीतलन सुविधाओं से लैस समर्पित हीट स्ट्रोक वार्ड बनाए गए हैं। प्रशासन ने स्वयंसेवी संस्थाओं और स्थानीय नेताओं से मेहदावल और धनघटा उपखंडों के ग्रामीण इलाकों में जागरूकता फैलाने का अनुरोध किया है।`,
          summaryEn: 'The district administration advises residents to stay indoors and drink plenty of water as temperatures cross 44 degrees.',
          summaryHi: 'तापमान 44 डिग्री के पार जाने पर जिला प्रशासन ने निवासियों को घरों में रहने और पर्याप्त पानी पीने की सलाह दी।',
          images: ['https://images.unsplash.com/photo-1504370805625-d32c54b16100?auto=format&fit=crop&w=800&q=80'],
          videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          categories: [categories.find(c => c.nameEn === 'Local News')?._id || categories[0]._id],
          district: 'Sant Kabir Nagar',
          subdivision: 'None',
          isBreaking: true
        },
        {
          titleEn: 'New Modern Park and Library to be Built in Khalilabad',
          titleHi: 'खलीलाबाद में बनेगा नया आधुनिक पार्क और पुस्तकालय',
          contentEn: `Residents of Khalilabad will soon have access to a state-of-the-art public park equipped with an open gymnasium and a modern digital library. The development project, approved by the local municipal corporation, aims to provide better recreational and educational spaces for children and youth.\n\nThe park will feature walking tracks, green areas with native trees, children's play zones, and solar-powered lighting. The adjoining digital library will house over 50 computer systems, high-speed Wi-Fi, and access to academic journals and e-books. A seating capacity of 150 readers will be set up to assist students preparing for competitive exams.\n\nWork is expected to begin next month and is scheduled to be completed within six months, using a dedicated budget allocation. Local MLA inspected the site near the bypass road and instructed engineers to ensure top-notch quality standards.`,
          contentHi: `खलीलाबाद के निवासियों को जल्द ही एक अत्याधुनिक सार्वजनिक पार्क मिलेगा, जिसमें एक ओपन जिम और एक आधुनिक डिजिटल लाइब्रेरी होगी। स्थानीय नगर पालिका द्वारा स्वीकृत इस विकास परियोजना का उद्देश्य बच्चों और युवाओं को बेहतर मनोरंजन और शैक्षिक स्थान प्रदान करना है।\n\nपार्क में वॉकिंग ट्रैक, स्थानीय पेड़ों वाले हरे-भरे क्षेत्र, बच्चों के खेलने के क्षेत्र और सौर ऊर्जा से चलने वाली लाइटें होंगी। पुस्तकालय में 50 से अधिक कंप्यूटर सिस्टम, हाई-स्पीड वाई-फाई और शैक्षणिक पत्रिकाओं व ई-पुस्तकों तक पहुंच होगी। प्रतियोगी परीक्षाओं की तैयारी कर रहे छात्रों की सहायता के लिए 150 पाठकों की बैठने की क्षमता स्थापित की जाएगी।\n\nअगले महीने काम शुरू होने की उम्मीद है और बजट आवंटन का उपयोग करते हुए इसे छह महीने के भीतर पूरा करने का कार्यक्रम है। स्थानीय विधायक ने बाईपास रोड के पास साइट का निरीक्षण किया और इंजीनियरों को सर्वोत्तम गुणवत्ता मानकों को सुनिश्चित करने का निर्देश दिया।`,
          summaryEn: 'Local municipality approves a modern park with open gymnasium and high-speed digital library in Khalilabad.',
          summaryHi: 'स्थानीय नगर पालिका ने खलीलाबाद में ओपन जिम और हाई-स्पीड डिजिटल लाइब्रेरी के साथ एक आधुनिक पार्क को मंजूरी दी।',
          images: ['https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80'],
          videoUrl: '',
          categories: [categories.find(c => c.nameEn === 'Local News')?._id || categories[0]._id],
          district: 'Sant Kabir Nagar',
          subdivision: 'Khalilabad',
          isBreaking: false
        },
        {
          titleEn: 'Mehdawal Local Sports Academy Wins Inter-District Cricket Cup',
          titleHi: 'मेहदावल स्थानीय खेल अकादमी ने जीता अंतर-जिला क्रिकेट कप',
          contentEn: `In a thrilling finish, the Mehdawal Sports Club defeated the Basti District Academy by 3 wickets to lift the Inter-District Championship Cup. The finals, played at the sports ground, attracted a huge crowd of enthusiastic local supporters.\n\nChasing a target of 168 runs, Mehdawal was struggling at 92/5, but a match-winning partnership of 64 runs for the 6th wicket anchored the team to victory. The star batsman was awarded Player of the Match for scoring 58 runs off 42 balls, which included four sixes. The captain credited their rigorous practice sessions at the Mehdawal facility for this achievement.\n\nThe sports ministry has announced a cash prize of Rs 50,000 for the winning team and promised upgrades to the local practice pitches and training equipment to encourage rural youth.`,
          contentHi: `एक रोमांचक मुकाबले में, मेहदावल स्पोर्ट्स क्लब ने बस्ती जिला अकादमी को 3 विकेट से हराकर अंतर-जिला चैंपियनशिप कप जीता। खेल मैदान पर खेले गए फाइनल मैच में उत्साही स्थानीय समर्थकों की भारी भीड़ उमड़ी।\n\n168 रनों के लक्ष्य का पीछा करते हुए मेहदावल की टीम 92/5 पर संघर्ष कर रही थी, लेकिन छठे विकेट के लिए 64 रनों की मैच जिताऊ साझेदारी ने टीम को जीत दिलाई। स्टार बल्लेबाज को 42 गेंदों में 58 रन बनाने के लिए 'प्लेयर ऑफ द मैच' चुना गया, जिससे चार छक्के शामिल थे। कप्तान ने इस सफलता का श्रेय मेहदावल केंद्र में उनके कठिन अभ्यास सत्रों को दिया।\n\nखेल मंत्रालय ने विजेता टीम के लिए 50,000 रुपये के नकद पुरस्कार की घोषणा की है और ग्रामीण युवाओं को प्रोत्साहित करने के लिए स्थानीय अभ्यास पिचों और प्रशिक्षण उपकरणों को अपग्रेड करने का वादा किया है।`,
          summaryEn: 'Mehdawal beats Basti by 3 wickets in a dramatic final chase to secure the sports championship trophy.',
          summaryHi: 'मेहदावल ने एक रोमांचक फाइनल मुकाबले में बस्ती को 3 विकेट से हराकर खेल चैंपियनशिप ट्रॉफी पर कब्जा किया।',
          images: ['https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=800&q=80'],
          videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          categories: [categories.find(c => c.nameEn === 'Sports')?._id || categories[0]._id],
          district: 'Sant Kabir Nagar',
          subdivision: 'Mehdawal',
          isBreaking: true
        }
      ];
      jsonDb.seedNews(sampleNews);
      console.log('[SEED-JSON] 3 bilingual sample articles seeded to db.json');
    }

    const ads = jsonDb.getAds({});
    if (ads.length === 0) {
      jsonDb.createAd({
        title: 'City Samachar Premium Digital Subscription',
        linkUrl: 'https://example.com/premium',
        mediaType: 'image',
        mediaUrl: 'https://images.unsplash.com/photo-1546074177-ffedd79d494d?auto=format&fit=crop&w=800&q=80',
        slot: 'sidebar',
        isActive: true
      });
      jsonDb.createAd({
        title: 'Sant Kabir Nagar Industrial Trade Fair 2026',
        linkUrl: 'https://example.com/fair',
        mediaType: 'image',
        mediaUrl: 'https://images.unsplash.com/photo-1561489396-888724a1543d?auto=format&fit=crop&w=1200&q=80',
        slot: 'top',
        isActive: true
      });
      console.log('[SEED-JSON] Default advertisements seeded to db.json');
    }

    app.listen(PORT, () => {
      console.log(`Server running in JSON DATABASE mode on port ${PORT}`);
    });
  });
