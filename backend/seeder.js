require('dotenv').config();
const mongoose = require('mongoose');
const News = require('./models/News');
const Category = require('./models/Category');

const sampleNews = [
  {
    titleEn: 'Heat Wave Warning Issued for Sant Kabir Nagar District',
    titleHi: 'संत कबीर नगर जिले के लिए लू (हीट वेव) की चेतावनी जारी',
    contentEn: `The District Magistrate of Sant Kabir Nagar has issued a severe heat wave advisory for all residents. With temperatures expected to soar above 44 degrees Celsius over the next few days, citizens are advised to take necessary precautions.\n\nHealth officials have urged people to stay hydrated, avoid stepping outdoors between 12:00 PM and 4:00 PM, and keep check on the elderly and children. Water distribution stations are being set up near prominent public areas including Khalilabad Railway Station and municipal markets to offer relief to commuters.\n\nAll government primary schools have also adjusted their timings, scheduling classes in the morning from 7:00 AM to 11:30 AM. Local hospitals have established dedicated heat stroke wards with necessary medicines and cooling facilities. The administration has requested NGOs and local leaders to spread awareness in the rural pockets of Mehdawal and Dhanghata subdivisions.`,
    contentHi: `संत कबीर नगर के जिलाधिकारी ने सभी निवासियों के लिए गंभीर लू (हीट वेव) की सलाह जारी की है। अगले कुछ दिनों में तापमान 44 डिग्री सेल्सियस से ऊपर जाने की आशंका को देखते हुए नागरिकों को आवश्यक सावधानी बरतने की सलाह दी गई है।\n\nस्वास्थ्य अधिकारियों ने लोगों से पर्याप्त मात्रा में पानी पीने, दोपहर 12:00 बजे से शाम 4:00 बजे के बीच घर से बाहर निकलने से बचने और बुजुर्गों व बच्चों का विशेष ध्यान रखने का आग्रह किया है। यात्रियों को राहत देने के लिए खलीलाबाद रेलवे स्टेशन और नगर पालिका बाजारों सहित प्रमुख सार्वजनिक क्षेत्रों के पास जल वितरण केंद्र स्थापित किए जा रहे हैं।\n\nसभी सरकारी प्राथमिक स्कूलों के समय में भी बदलाव किया गया है, जिसके तहत कक्षाएं सुबह 7:00 बजे से 11:30 बजे तक संचालित होंगी। स्थानीय अस्पतालों में आवश्यक दवाओं और शीतलन सुविधाओं से लैस समर्पित हीट स्ट्रोक वार्ड बनाए गए हैं। प्रशासन ने स्वयंसेवी संस्थाओं और स्थानीय नेताओं से मेहदावल और धनघटा उपखंडों के ग्रामीण इलाकों में जागरूकता फैलाने का अनुरोध किया है।`,
    summaryEn: 'The district administration advises residents to stay indoors and drink plenty of water as temperatures cross 44 degrees.',
    summaryHi: 'तापमान 44 डिग्री के पार जाने पर जिला प्रशासन ने निवासियों को घरों में रहने और पर्याप्त पानी पीने की सलाह दी।',
    images: ['https://images.unsplash.com/photo-1504370805625-d32c54b16100?auto=format&fit=crop&w=800&q=80'],
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // Dummy video
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
    district: 'Sant Kabir Nagar',
    subdivision: 'Khalilabad',
    isBreaking: false
  },
  {
    titleEn: 'Major Flood Protection Bund Inspected along Ghaghra River in Dhanghata',
    titleHi: 'धनघटा में घाघरा नदी के किनारे प्रमुख बाढ़ सुरक्षा तटबंध का निरीक्षण',
    contentEn: `To prevent seasonal flooding in low-lying villages, administrative officials conducted a thorough safety audit of the Ghaghra River embankments in the Dhanghata subdivision. The inspection comes ahead of the monsoon season to identify weak spots and carry out necessary reinforcement repairs.\n\nLarge geotextile bags filled with sand, boulder pitching, and bamboo piling are being used at vulnerable river curves. The junior engineers have been placed on 24x7 alert to monitor water level fluctuations and coordinate with local disaster response teams.\n\nMore than 15 villages that are historically prone to flooding will benefit from these timely containment efforts. Relief camps have been designated, and essential food grains and emergency medicines are being stocked at nearby storage depots. Local residents have praised the proactive steps taken by the flood control department.`,
    contentHi: `निचले गांवों में मौसमी बाढ़ को रोकने के लिए, प्रशासनिक अधिकारियों ने धनघटा उपखंड में घाघरा नदी के तटबंधों का विस्तृत सुरक्षा ऑडिट किया। मॉनसून के मौसम से पहले कमजोर स्थानों की पहचान करने और आवश्यक सुदृढीकरण मरम्मत कार्य करने के लिए यह निरीक्षण किया गया है।\n\nनदी के संवेदनशील घुमावों पर रेत से भरे बड़े भू-टेक्सटाइल बैग, बोल्डर पिचिंग और बांस के खंभे का उपयोग किया जा रहा है। जल स्तर के उतार-चढ़ाव की निगरानी करने और स्थानीय आपदा प्रतिक्रिया टीमों के साथ समन्वय करने के लिए कनिष्ठ अभियंताओं को 24 घंटे अलर्ट पर रखा गया है।\n\nबाढ़ की चपेट में आने वाले 15 से अधिक गांवों को इन समय पर किए जा रहे प्रयासों से लाभ मिलेगा। राहत शिविरों को चिन्हित कर लिया गया है, और पास के डिपो में आवश्यक खाद्यान्न और आपातकालीन दवाएं जमा की जा रही हैं। स्थानीय निवासियों ने बाढ़ नियंत्रण विभाग द्वारा उठाए गए सक्रिय कदमों की सराहना की है।`,
    summaryEn: 'Embankment audit and reinforcement operations begin along Ghaghra river ahead of monsoon to protect 15 villages.',
    summaryHi: 'मॉनसून से पहले 15 गांवों की सुरक्षा के लिए घाघरा नदी के किनारे तटबंध ऑडिट और सुदृढीकरण अभियान शुरू।',
    images: ['https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80'],
    videoUrl: '',
    district: 'Sant Kabir Nagar',
    subdivision: 'Dhanghata',
    isBreaking: false
  },
  {
    titleEn: 'Mehdawal Local Sports Academy Wins Inter-District Cricket Cup',
    titleHi: 'मेहदावल स्थानीय खेल अकादमी ने जीता अंतर-जिला क्रिकेट कप',
    contentEn: `In a thrilling finish, the Mehdawal Sports Club defeated the Basti District Academy by 3 wickets to lift the Inter-District Championship Cup. The finals, played at the sports ground, attracted a huge crowd of enthusiastic local supporters.\n\nChasing a target of 168 runs, Mehdawal was struggling at 92/5, but a match-winning partnership of 64 runs for the 6th wicket anchored the team to victory. The star batsman was awarded Player of the Match for scoring 58 runs off 42 balls, which included four sixes. The captain credited their rigorous practice sessions at the Mehdawal facility for this achievement.\n\nThe sports ministry has announced a cash prize of Rs 50,000 for the winning team and promised upgrades to the local practice pitches and training equipment to encourage rural youth.`,
    contentHi: `एक रोमांचक मुकाबले में, मेहदावल स्पोर्ट्स क्लब ने बस्ती जिला अकादमी को 3 विकेट से हराकर अंतर-जिला चैंपियनशिप कप जीता। खेल मैदान पर खेले गए फाइनल मैच में उत्साही स्थानीय समर्थकों की भारी भीड़ उमड़ी।\n\n168 रनों के लक्ष्य का पीछा करते हुए मेहदावल की टीम 92/5 पर संघर्ष कर रही थी, लेकिन छठे विकेट के लिए 64 रनों की मैच जिताऊ साझेदारी ने टीम को जीत दिलाई। स्टार बल्लेबाज को 42 गेंदों में 58 रन बनाने के लिए 'प्लेयर ऑफ द मैच' चुना गया, जिसमें चार छक्के शामिल थे। कप्तान ने इस सफलता का श्रेय मेहदावल केंद्र में उनके कठिन अभ्यास सत्रों को दिया।\n\nखेल मंत्रालय ने विजेता टीम के लिए 50,000 रुपये के नकद पुरस्कार की घोषणा की है और ग्रामीण युवाओं को प्रोत्साहित करने के लिए स्थानीय अभ्यास पिचों और प्रशिक्षण उपकरणों को अपग्रेड करने का वादा किया है।`,
    summaryEn: 'Mehdawal beats Basti by 3 wickets in a dramatic final chase to secure the sports championship trophy.',
    summaryHi: 'मेहदावल ने एक रोमांचक फाइनल मुकाबले में बस्ती को 3 विकेट से हराकर खेल चैंपियनशिप ट्रॉफी पर कब्जा किया।',
    images: ['https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=800&q=80'],
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    district: 'Sant Kabir Nagar',
    subdivision: 'Mehdawal',
    isBreaking: true
  }
];

const seedNews = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/news_channel');
    console.log('Connected to MongoDB for seeding sample news...');

    // Clear existing news to avoid duplicate mock data
    await News.deleteMany({});
    console.log('Cleared old news articles.');

    // Fetch existing categories (seeded by server startup)
    const dbCategories = await Category.find({});
    if (dbCategories.length === 0) {
      console.log('No categories found. Please run the backend server first to seed categories, or create them.');
      process.exit(0);
    }

    // Assign categories randomly to sample articles
    const seededNewsList = sampleNews.map((article, index) => {
      // Politics, Local, Sports, National mapping
      let articleCats = [];
      if (index === 0) {
        // Local News (index 2) & National (index 1)
        articleCats.push(dbCategories.find(c => c.nameEn === 'Local News')?._id || dbCategories[0]._id);
      } else if (index === 1) {
        articleCats.push(dbCategories.find(c => c.nameEn === 'Local News')?._id || dbCategories[0]._id);
      } else if (index === 2) {
        articleCats.push(dbCategories.find(c => c.nameEn === 'Local News')?._id || dbCategories[0]._id);
        articleCats.push(dbCategories.find(c => c.nameEn === 'Politics')?._id || dbCategories[0]._id);
      } else if (index === 3) {
        articleCats.push(dbCategories.find(c => c.nameEn === 'Sports')?._id || dbCategories[0]._id);
      }
      
      return {
        ...article,
        categories: articleCats
      };
    });

    await News.insertMany(seededNewsList);
    console.log('Successfully seeded sample news articles with categories!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
};

seedNews();
