const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, '../db.json');

const getDb = () => {
  if (!fs.existsSync(dbPath)) {
    // Initialize empty DB with seeded admin and categories
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(process.env.ADMIN_PASSWORD || 'admin123', salt);

    const initialDb = {
      users: [
        {
          _id: 'admin_user_id_1',
          username: process.env.ADMIN_USERNAME || 'admin',
          password: hashedPassword,
          createdAt: new Date().toISOString()
        }
      ],
      categories: [
        { _id: 'cat_1', nameEn: 'Politics', nameHi: 'राजनीति', createdAt: new Date().toISOString() },
        { _id: 'cat_2', nameEn: 'National', nameHi: 'राष्ट्रीय', createdAt: new Date().toISOString() },
        { _id: 'cat_3', nameEn: 'Local News', nameHi: 'स्थानीय समाचार', createdAt: new Date().toISOString() },
        { _id: 'cat_4', nameEn: 'Sports', nameHi: 'खेल', createdAt: new Date().toISOString() },
        { _id: 'cat_5', nameEn: 'Entertainment', nameHi: 'मनोरंजन', createdAt: new Date().toISOString() },
        { _id: 'cat_6', nameEn: 'Crime', nameHi: 'अपराध', createdAt: new Date().toISOString() }
      ],
      news: [],
      contacts: [],
      epapers: [],
      advertisements: [],
      stats: { totalWebsiteViews: 0 },
      polls: [
        {
          _id: 'poll_default_1',
          questionEn: 'Will the new digital library under construction in Khalilabad be highly beneficial for students?',
          questionHi: 'क्या खलीलाबाद में बन रही नई डिजिटल लाइब्रेरी छात्रों के लिए बहुत मददगार होगी?',
          option1En: 'Yes, absolutely',
          option1Hi: 'हाँ, बिल्कुल',
          option2En: 'No, not helpful',
          option2Hi: 'नहीं, उपयोगी नहीं है',
          option3En: "Can't say",
          option3Hi: 'कह नहीं सकते',
          votesOption1: 72,
          votesOption2: 18,
          votesOption3: 10,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ],
      editorInfo: {
        _id: 'editor_default',
        nameEn: 'Admin Editor',
        nameHi: 'एडमिन संपादक',
        roleEn: 'Editor-in-Chief',
        roleHi: 'मुख्य संपादक',
        descriptionEn: 'Passionate journalist dedicated to delivering accurate and timely news to the local community.',
        descriptionHi: 'स्थानीय समुदाय तक सटीक और समय पर समाचार पहुंचाने के लिए समर्पित पत्रकार।',
        photoUrl: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    };
    fs.writeFileSync(dbPath, JSON.stringify(initialDb, null, 2));
    return initialDb;
  }

  try {
    const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    let changed = false;
    if (!db.epapers) {
      db.epapers = [];
      changed = true;
    }
    if (!db.advertisements) {
      db.advertisements = [];
      changed = true;
    }
    if (!db.polls) {
      db.polls = [
        {
          _id: 'poll_default_1',
          questionEn: 'Will the new digital library under construction in Khalilabad be highly beneficial for students?',
          questionHi: 'क्या खलीलाबाद में बन रही नई डिजिटल लाइब्रेरी छात्रों के लिए बहुत मददगार होगी?',
          option1En: 'Yes, absolutely',
          option1Hi: 'हाँ, बिल्कुल',
          option2En: 'No, not helpful',
          option2Hi: 'नहीं, उपयोगी नहीं है',
          option3En: "Can't say",
          option3Hi: 'कह नहीं सकते',
          votesOption1: 72,
          votesOption2: 18,
          votesOption3: 10,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
      changed = true;
    }
    if (!db.stats) {
      db.stats = { totalWebsiteViews: 0 };
      changed = true;
    }
    if (!db.editorInfo) {
      db.editorInfo = {
        _id: 'editor_default',
        nameEn: 'Admin Editor',
        nameHi: 'एडमिन संपादक',
        roleEn: 'Editor-in-Chief',
        roleHi: 'मुख्य संपादक',
        descriptionEn: 'Passionate journalist dedicated to delivering accurate and timely news to the local community.',
        descriptionHi: 'स्थानीय समुदाय तक सटीक और समय पर समाचार पहुंचाने के लिए समर्पित पत्रकार।',
        photoUrl: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      changed = true;
    }
    if (changed) {
      fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
    }
    return db;
  } catch (err) {
    console.error('Error reading db.json, returning empty object', err);
    return { users: [], categories: [], news: [], contacts: [], epapers: [], advertisements: [] };
  }
};

const saveDb = (data) => {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
};

const jsonDb = {
  // Auth Operations
  getUser: (username) => {
    const db = getDb();
    return db.users.find(u => u.username === username);
  },

  getUserById: (id) => {
    const db = getDb();
    const user = db.users.find(u => u._id === id);
    if (user) {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    }
    return null;
  },

  updateUser: (id, { username, password }) => {
    const db = getDb();
    const index = db.users.findIndex(u => u._id === id);
    if (index !== -1) {
      if (username) db.users[index].username = username;
      if (password) {
        const salt = bcrypt.genSaltSync(10);
        db.users[index].password = bcrypt.hashSync(password, salt);
      }
      db.users[index].updatedAt = new Date().toISOString();
      saveDb(db);
      const { password: _, ...userWithoutPassword } = db.users[index];
      return userWithoutPassword;
    }
    return null;
  },

  // News Operations
  getNews: (filters) => {
    const db = getDb();
    let list = [...db.news];

    // Populate categories full details
    list = list.map(item => ({
      ...item,
      categories: item.categories.map(catId => db.categories.find(c => c._id === catId)).filter(Boolean)
    }));

    if (filters.category) {
      list = list.filter(n => n.categories.some(c => c._id === filters.category));
    }

    if (filters.subdivision && filters.subdivision !== 'All' && filters.subdivision !== 'None') {
      list = list.filter(n => n.subdivision === filters.subdivision);
    }

    if (filters.isBreaking === 'true') {
      list = list.filter(n => n.isBreaking === true);
    }

    if (filters.search) {
      const searchRegex = new RegExp(filters.search, 'i');
      list = list.filter(n =>
        searchRegex.test(n.titleEn) ||
        searchRegex.test(n.titleHi) ||
        searchRegex.test(n.contentEn) ||
        searchRegex.test(n.contentHi) ||
        searchRegex.test(n.summaryEn) ||
        searchRegex.test(n.summaryHi)
      );
    }

    // Sort by createdAt desc
    list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    if (filters.limit) {
      list = list.slice(0, parseInt(filters.limit));
    }

    return list;
  },

  getNewsById: (id) => {
    const db = getDb();
    const index = db.news.findIndex(n => n._id === id);
    if (index !== -1) {
      // Increment views
      db.news[index].views = (db.news[index].views || 0) + 1;
      saveDb(db);

      const article = db.news[index];
      return {
        ...article,
        categories: article.categories.map(catId => db.categories.find(c => c._id === catId)).filter(Boolean),
        comments: article.comments || []
      };
    }
    return null;
  },

  createNews: (newsData) => {
    const db = getDb();
    const newArticle = {
      _id: 'news_' + Date.now() + Math.random().toString(36).substr(2, 5),
      ...newsData,
      views: 0,
      likes: 0,
      shares: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    db.news.push(newArticle);
    saveDb(db);
    return newArticle;
  },

  updateNews: (id, newsData) => {
    const db = getDb();
    const index = db.news.findIndex(n => n._id === id);
    if (index !== -1) {
      const updatedArticle = {
        ...db.news[index],
        ...newsData,
        updatedAt: new Date().toISOString()
      };
      db.news[index] = updatedArticle;
      saveDb(db);
      return updatedArticle;
    }
    return null;
  },

  deleteNews: (id) => {
    const db = getDb();
    const originalLength = db.news.length;
    db.news = db.news.filter(n => n._id !== id);
    saveDb(db);
    return db.news.length !== originalLength;
  },

  // Categories Operations
  getCategories: () => {
    const db = getDb();
    return db.categories;
  },

  createCategory: (nameEn, nameHi) => {
    const db = getDb();
    const exists = db.categories.some(c => c.nameEn.toLowerCase() === nameEn.toLowerCase() || c.nameHi === nameHi);
    if (exists) {
      return null;
    }
    const newCat = {
      _id: 'cat_' + Date.now(),
      nameEn,
      nameHi,
      createdAt: new Date().toISOString()
    };
    db.categories.push(newCat);
    saveDb(db);
    return newCat;
  },

  deleteCategory: (id) => {
    const db = getDb();
    db.categories = db.categories.filter(c => c._id !== id);
    // Clean up categories inside news
    db.news = db.news.map(n => ({
      ...n,
      categories: n.categories.filter(catId => catId !== id)
    }));
    saveDb(db);
    return true;
  },

  // Contact Operations
  submitContactForm: (contactData) => {
    const db = getDb();
    const newMessage = {
      _id: 'msg_' + Date.now(),
      ...contactData,
      isRead: false,
      createdAt: new Date().toISOString()
    };
    db.contacts.push(newMessage);
    saveDb(db);
    return newMessage;
  },

  getContactMessages: () => {
    const db = getDb();
    // Sort by date desc
    return [...db.contacts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  markMessageAsRead: (id) => {
    const db = getDb();
    const index = db.contacts.findIndex(c => c._id === id);
    if (index !== -1) {
      db.contacts[index].isRead = true;
      saveDb(db);
      return db.contacts[index];
    }
    return null;
  },

  deleteContactMessage: (id) => {
    const db = getDb();
    const originalLength = db.contacts.length;
    db.contacts = db.contacts.filter(c => c._id !== id);
    saveDb(db);
    return db.contacts.length !== originalLength;
  },

  // E-Paper Operations
  getEPapers: () => {
    const db = getDb();
    return [...db.epapers].sort((a, b) => new Date(b.date) - new Date(a.date));
  },

  getEPaperByDate: (date) => {
    const db = getDb();
    return db.epapers.find(e => e.date === date) || null;
  },

  createEPaper: (epaperData) => {
    const db = getDb();
    // Check if an epaper with this date already exists
    const existingIndex = db.epapers.findIndex(e => e.date === epaperData.date);
    if (existingIndex !== -1) {
      // Delete old files from disk
      const oldEPaper = db.epapers[existingIndex];
      try {
        if (oldEPaper.pdfUrl && oldEPaper.pdfUrl.startsWith('/uploads/')) {
          const absolutePdfPath = path.join(__dirname, '..', oldEPaper.pdfUrl);
          if (fs.existsSync(absolutePdfPath)) {
            fs.unlinkSync(absolutePdfPath);
          }
        }
        if (oldEPaper.thumbnailUrl && oldEPaper.thumbnailUrl.startsWith('/uploads/')) {
          const absoluteThumbPath = path.join(__dirname, '..', oldEPaper.thumbnailUrl);
          if (fs.existsSync(absoluteThumbPath)) {
            fs.unlinkSync(absoluteThumbPath);
          }
        }
      } catch (err) {
        console.error('Error deleting old files during overwrite:', err);
      }
      db.epapers.splice(existingIndex, 1);
    }

    const newEPaper = {
      _id: 'epaper_' + Date.now() + Math.random().toString(36).substr(2, 5),
      ...epaperData,
      createdAt: new Date().toISOString()
    };
    db.epapers.push(newEPaper);
    saveDb(db);
    return newEPaper;
  },

  deleteEPaper: (id) => {
    const db = getDb();
    const epaper = db.epapers.find(e => e._id === id);
    if (!epaper) return false;

    // Delete files from disk
    try {
      if (epaper.pdfUrl && epaper.pdfUrl.startsWith('/uploads/')) {
        const absolutePdfPath = path.join(__dirname, '..', epaper.pdfUrl);
        if (fs.existsSync(absolutePdfPath)) {
          fs.unlinkSync(absolutePdfPath);
        }
      }
      if (epaper.thumbnailUrl && epaper.thumbnailUrl.startsWith('/uploads/')) {
        const absoluteThumbPath = path.join(__dirname, '..', epaper.thumbnailUrl);
        if (fs.existsSync(absoluteThumbPath)) {
          fs.unlinkSync(absoluteThumbPath);
        }
      }
    } catch (err) {
      console.error('Error deleting files:', err);
    }

    db.epapers = db.epapers.filter(e => e._id !== id);
    saveDb(db);
    return true;
  },

  // Internal Seeding Assist
  seedNews: (newsList) => {
    const db = getDb();
    db.news = newsList.map((n, i) => ({
      _id: `news_seeded_${i}`,
      ...n,
      views: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));
    saveDb(db);
    return true;
  },

  // Poll Operations
  getPoll: () => {
    const db = getDb();
    if (!db.polls || db.polls.length === 0) {
      return null;
    }
    return db.polls[0];
  },

  updatePoll: (pollData) => {
    const db = getDb();
    if (!db.polls) db.polls = [];

    const currentPoll = db.polls[0] || { _id: 'poll_' + Date.now() };

    const updatedPoll = {
      ...currentPoll,
      ...pollData,
      updatedAt: new Date().toISOString()
    };

    db.polls[0] = updatedPoll;
    saveDb(db);
    return updatedPoll;
  },

  votePoll: (optionIndex) => {
    const db = getDb();
    if (!db.polls || db.polls.length === 0) return null;

    const poll = db.polls[0];
    if (optionIndex === 1) {
      poll.votesOption1 = (poll.votesOption1 || 0) + 1;
    } else if (optionIndex === 2) {
      poll.votesOption2 = (poll.votesOption2 || 0) + 1;
    } else if (optionIndex === 3) {
      poll.votesOption3 = (poll.votesOption3 || 0) + 1;
    }

    db.polls[0] = poll;
    saveDb(db);
    return poll;
  },

  addComment: (newsId, commentData) => {
    const db = getDb();
    const index = db.news.findIndex(n => n._id === newsId);
    if (index !== -1) {
      if (!db.news[index].comments) {
        db.news[index].comments = [];
      }
      const newComment = {
        _id: 'comment_' + Date.now() + Math.random().toString(36).substr(2, 5),
        name: commentData.name,
        text: commentData.text,
        date: commentData.date || new Date().toLocaleDateString()
      };
      db.news[index].comments.push(newComment);
      saveDb(db);
      return db.news[index].comments;
    }
    return null;
  },

  deleteComment: (newsId, commentId) => {
    const db = getDb();
    const index = db.news.findIndex(n => n._id === newsId);
    if (index !== -1 && db.news[index].comments) {
      const originalLength = db.news[index].comments.length;
      db.news[index].comments = db.news[index].comments.filter(c => {
        const id = c._id || (c.name + '_' + c.date);
        return id !== commentId;
      });
      saveDb(db);
      return db.news[index].comments.length !== originalLength;
    }
    return false;
  },

  // Advertisement Operations
  getAds: (filters) => {
    const db = getDb();
    let list = db.advertisements || [];
    if (filters && filters.isActive === 'true') {
      list = list.filter(ad => ad.isActive === true);
    }
    if (filters && filters.slot) {
      list = list.filter(ad => ad.slot === filters.slot);
    }
    list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return list;
  },

  getAdById: (id) => {
    const db = getDb();
    return (db.advertisements || []).find(ad => ad._id === id) || null;
  },

  createAd: (adData) => {
    const db = getDb();
    if (!db.advertisements) db.advertisements = [];
    const newAd = {
      _id: 'ad_' + Date.now() + Math.random().toString(36).substr(2, 5),
      ...adData,
      isActive: adData.isActive !== undefined ? adData.isActive : true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    db.advertisements.push(newAd);
    saveDb(db);
    return newAd;
  },

  updateAd: (id, adData) => {
    const db = getDb();
    if (!db.advertisements) db.advertisements = [];
    const index = db.advertisements.findIndex(ad => ad._id === id);
    if (index !== -1) {
      const updatedAd = {
        ...db.advertisements[index],
        ...adData,
        updatedAt: new Date().toISOString()
      };
      db.advertisements[index] = updatedAd;
      saveDb(db);
      return updatedAd;
    }
    return null;
  },

  deleteAd: (id) => {
    const db = getDb();
    if (!db.advertisements) db.advertisements = [];
    const adIndex = db.advertisements.findIndex(ad => ad._id === id);
    if (adIndex === -1) return false;

    const ad = db.advertisements[adIndex];
    try {
      if (ad.mediaUrl && ad.mediaUrl.startsWith('/uploads/')) {
        const absolutePath = path.join(__dirname, '..', ad.mediaUrl);
        if (fs.existsSync(absolutePath)) {
          fs.unlinkSync(absolutePath);
        }
      }
    } catch (err) {
      console.error('Error deleting ad media file:', err);
    }

    db.advertisements.splice(adIndex, 1);
    saveDb(db);
    return true;
  },

  // Analytics Operations
  incrementWebsiteHit: () => {
    const db = getDb();
    if (!db.stats) {
      db.stats = { totalWebsiteViews: 0 };
    }
    db.stats.totalWebsiteViews = (db.stats.totalWebsiteViews || 0) + 1;
    saveDb(db);
    return db.stats.totalWebsiteViews;
  },

  getWebsiteViews: () => {
    const db = getDb();
    return db.stats ? (db.stats.totalWebsiteViews || 0) : 0;
  },

  likeNews: (id) => {
    const db = getDb();
    const index = db.news.findIndex(n => n._id === id);
    if (index !== -1) {
      db.news[index].likes = (db.news[index].likes || 0) + 1;
      saveDb(db);
      return db.news[index];
    }
    return null;
  },

  shareNews: (id) => {
    const db = getDb();
    const index = db.news.findIndex(n => n._id === id);
    if (index !== -1) {
      db.news[index].shares = (db.news[index].shares || 0) + 1;
      saveDb(db);
      return db.news[index];
    }
    return null;
  },

  getEditorInfo: () => {
    const db = getDb();
    if (!db.editorInfo) {
      db.editorInfo = {
        _id: 'editor_default',
        nameEn: 'Admin Editor',
        nameHi: 'एडमिन संपादक',
        roleEn: 'Editor-in-Chief',
        roleHi: 'मुख्य संपादक',
        descriptionEn: 'Passionate journalist dedicated to delivering accurate and timely news to the local community.',
        descriptionHi: 'स्थानीय समुदाय तक सटीक और समय पर समाचार पहुंचाने के लिए समर्पित पत्रकार।',
        photoUrl: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      saveDb(db);
    }
    return db.editorInfo;
  },

  updateEditorInfo: (editorData) => {
    const db = getDb();
    if (!db.editorInfo) {
      db.editorInfo = {};
    }
    db.editorInfo = {
      ...db.editorInfo,
      ...editorData,
      updatedAt: new Date().toISOString()
    };
    saveDb(db);
    return db.editorInfo;
  }
};

module.exports = jsonDb;
