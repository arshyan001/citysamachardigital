const News = require('../models/News');
const Category = require('../models/Category');
const jsonDb = require('../config/jsonDb');
const { uploadToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');
const pushService = require('../services/pushService');

// Helper: send push notification to all subscribers via pushService
const sendPushToAll = async (title, body, url) => {
  try {
    await pushService.sendNotificationToAll({
      title,
      body,
      url,
      icon: '/logo.png',
      badge: '/logo.png',
      tag: 'news-' + Date.now()
    });
  } catch (err) {
    console.error('[Push News] Error broadcasting notification:', err.message);
  }
};

// @desc    Get all news articles with optional filters
// @route   GET /api/news
// @access  Public
const getNews = async (req, res) => {
  if (global.useJsonDb) {
    try {
      const newsList = jsonDb.getNews(req.query);
      return res.json(newsList);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  try {
    const { category, subdivision, isBreaking, search, limit, status, author } = req.query;
    let query = {};

    // Filter by status:
    // If specific status requested (e.g. pending, approved, all)
    if (status && status !== 'all') {
      query.status = status;
    } else if (!status) {
      // Public website only sees approved or legacy news (where status is null/undefined)
      query.$or = [
        { status: 'approved' },
        { status: { $exists: false } },
        { status: null }
      ];
    }

    // Filter by author
    if (author) {
      query.author = author;
    }

    // Filter by category
    if (category) {
      query.categories = category;
    }

    // Filter by subdivision
    if (subdivision && subdivision !== 'All' && subdivision !== 'None') {
      query.subdivision = subdivision;
    }

    // Filter by breaking status
    if (isBreaking === 'true') {
      query.isBreaking = true;
    }

    // Filter by search query
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { titleEn: searchRegex },
        { titleHi: searchRegex },
        { contentEn: searchRegex },
        { contentHi: searchRegex },
        { summaryEn: searchRegex },
        { summaryHi: searchRegex }
      ];
    }

    let queryExec = News.find(query)
      .populate('categories')
      .sort({ createdAt: -1 });

    if (limit) {
      queryExec = queryExec.limit(parseInt(limit));
    }

    const newsList = await queryExec;
    res.json(newsList);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single news article & increment view count
// @route   GET /api/news/:id
// @access  Public
const getNewsById = async (req, res) => {
  if (global.useJsonDb) {
    try {
      const news = jsonDb.getNewsById(req.params.id);
      if (news) {
        return res.json(news);
      } else {
        return res.status(404).json({ message: 'News article not found' });
      }
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  try {
    const news = await News.findById(req.params.id).populate('categories');
    
    if (news) {
      // Increment views
      news.views = (news.views || 0) + 1;
      await news.save();
      
      res.json(news);
    } else {
      res.status(404).json({ message: 'News article not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new news article
// @route   POST /api/news
// @access  Private/Admin
const createNews = async (req, res) => {
  let finalImages = [];
  try {
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const uploadResult = await uploadToCloudinary(file, 'news_images');
        finalImages.push(uploadResult.secure_url);
      }
    } else if (req.body.images) {
      const images = req.body.images;
      finalImages = Array.isArray(images) ? images : [images];
    }
  } catch (err) {
    return res.status(500).json({ message: 'Image upload failed: ' + err.message });
  }

  const isReporter = req.user && req.user.role === 'reporter';
  const newsStatus = isReporter ? 'pending' : 'approved';
  const authorId = req.user ? req.user._id : null;
  const authorName = req.user 
    ? (req.user.name || (isReporter ? req.user.username : 'सदरे आलम खान')) 
    : 'सदरे आलम खान';
  const authorPhoto = req.user ? (req.user.photoUrl || '') : '';
  const authorRole = req.user 
    ? (req.user.designation || (isReporter ? 'संवाददाता' : 'मुख्य संपादक')) 
    : 'मुख्य संपादक';
  // Enforce reporter's assigned district strictly
  const assignedDistrict = isReporter && req.user.district ? req.user.district : null;

  if (global.useJsonDb) {
    try {
      const {
        titleEn,
        titleHi,
        contentEn,
        contentHi,
        summaryEn,
        summaryHi,
        videoUrl,
        categories,
        district,
        subdivision,
        isBreaking
      } = req.body;

      let parsedCategories = [];
      if (categories) {
        try {
          parsedCategories = typeof categories === 'string' ? JSON.parse(categories) : categories;
        } catch (err) {
          parsedCategories = [categories];
        }
      }

      const createdNews = jsonDb.createNews({
        titleEn: titleEn || titleHi,
        titleHi,
        contentEn: contentEn || contentHi,
        contentHi,
        summaryEn: summaryEn || (contentEn ? contentEn.substring(0, 150) + '...' : (contentHi ? contentHi.substring(0, 150) + '...' : '')),
        summaryHi: summaryHi || (contentHi ? contentHi.substring(0, 150) + '...' : ''),
        images: finalImages,
        videoUrl,
        categories: parsedCategories,
        district: assignedDistrict || district || 'Sant Kabir Nagar',
        subdivision: subdivision || 'None',
        isBreaking: isBreaking === 'true' || isBreaking === true,
        author: authorId,
        authorName,
        authorPhoto,
        authorRole,
        status: newsStatus,
        rejectionReason: '',
      });

      // Send push notification to all subscribers ONLY if approved
      if (newsStatus === 'approved') {
        sendPushToAll(
          '🔴 ' + (titleHi || titleEn || 'नई खबर'),
          summaryHi || summaryEn || 'सिटी समाचार डिजिटल पर नई खबर पढ़ें।',
          `/news/${createdNews._id || createdNews.id}`
        );
      }

      return res.status(201).json({
        ...createdNews,
        message: isReporter 
          ? 'समाचार समीक्षा (Approval) के लिए भेज दिया गया है। एडमिन द्वारा स्वीकृत होने पर यह प्रकाशित होगा।' 
          : 'समाचार सफलतापूर्वक प्रकाशित कर दिया गया है।'
      });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  try {
    const {
      titleEn,
      titleHi,
      contentEn,
      contentHi,
      summaryEn,
      summaryHi,
      videoUrl,
      categories,
      district,
      subdivision,
      isBreaking
    } = req.body;

    let parsedCategories = [];
    if (categories) {
      try {
        parsedCategories = typeof categories === 'string' ? JSON.parse(categories) : categories;
      } catch (err) {
        parsedCategories = [categories];
      }
    }

    const news = new News({
      titleEn: titleEn || titleHi,
      titleHi,
      contentEn: contentEn || contentHi,
      contentHi,
      summaryEn: summaryEn || (contentEn ? contentEn.substring(0, 150) + '...' : (contentHi ? contentHi.substring(0, 150) + '...' : '')),
      summaryHi: summaryHi || (contentHi ? contentHi.substring(0, 150) + '...' : ''),
      images: finalImages,
      videoUrl,
      categories: parsedCategories,
      district: assignedDistrict || district || 'Sant Kabir Nagar',
      subdivision: subdivision || 'None',
      isBreaking: isBreaking === 'true' || isBreaking === true,
      author: authorId,
      authorName,
      authorPhoto,
      authorRole,
      status: newsStatus,
      rejectionReason: '',
    });

    const createdNews = await news.save();

    // Send push notification to all subscribers ONLY if approved
    if (newsStatus === 'approved') {
      sendPushToAll(
        '🔴 ' + (titleHi || titleEn || 'नई खबर'),
        summaryHi || summaryEn || 'सिटी समाचार डिजिटल पर नई खबर पढ़ें।',
        `/news/${createdNews._id}`
      );
    }

    res.status(201).json({
      ...(createdNews.toObject ? createdNews.toObject() : createdNews),
      message: isReporter 
        ? 'समाचार समीक्षा (Approval) के लिए भेज दिया गया है। एडमिन द्वारा स्वीकृत होने पर यह प्रकाशित होगा।' 
        : 'समाचार सफलतापूर्वक प्रकाशित कर दिया गया है।'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update news article
// @route   PUT /api/news/:id
// @access  Private/Admin
const updateNews = async (req, res) => {
  console.log('📝 updateNews request received!');
  console.log('Parameters:', req.params);
  console.log('Body:', req.body);
  console.log('Files:', req.files ? req.files.map(f => ({ originalname: f.originalname, mimetype: f.mimetype, size: f.size })) : 'No files');

  let existingImages = [];
  let isFound = false;

  if (global.useJsonDb) {
    const article = jsonDb.getNewsById(req.params.id);
    if (article) {
      existingImages = article.images || [];
      isFound = true;
    }
  } else {
    try {
      const article = await News.findById(req.params.id);
      if (article) {
        existingImages = article.images || [];
        isFound = true;
      }
    } catch (err) {}
  }

  if (!isFound) {
    return res.status(404).json({ message: 'News article not found' });
  }

  let finalImages = undefined;
  if (req.files && req.files.length > 0) {
    try {
      // Delete old images from Cloudinary
      for (const imgUrl of existingImages) {
        await deleteFromCloudinary(imgUrl);
      }
      // Upload new images to Cloudinary
      finalImages = [];
      for (const file of req.files) {
        const uploadResult = await uploadToCloudinary(file, 'news_images');
        finalImages.push(uploadResult.secure_url);
      }
    } catch (err) {
      return res.status(500).json({ message: 'Image upload/delete failed: ' + err.message });
    }
  } else if (req.body.images) {
    const images = req.body.images;
    finalImages = Array.isArray(images) ? images : [images];
  }

  if (global.useJsonDb) {
    try {
      const {
        titleEn,
        titleHi,
        contentEn,
        contentHi,
        summaryEn,
        summaryHi,
        videoUrl,
        categories,
        district,
        subdivision,
        isBreaking
      } = req.body;

      let parsedCategories = undefined;
      if (categories) {
        try {
          parsedCategories = typeof categories === 'string' ? JSON.parse(categories) : categories;
        } catch (err) {
          parsedCategories = [categories];
        }
      }

      const updatePayload = {
        titleEn,
        titleHi,
        contentEn,
        contentHi,
        summaryEn,
        summaryHi,
        videoUrl,
        district,
        subdivision,
        isBreaking: isBreaking !== undefined ? (isBreaking === 'true' || isBreaking === true) : undefined,
      };

      if (parsedCategories) updatePayload.categories = parsedCategories;
      if (finalImages !== undefined) updatePayload.images = finalImages;

      const updatedNews = jsonDb.updateNews(req.params.id, updatePayload);
      if (updatedNews) {
        return res.json(updatedNews);
      } else {
        return res.status(404).json({ message: 'News article not found' });
      }
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  try {
    const {
      titleEn,
      titleHi,
      contentEn,
      contentHi,
      summaryEn,
      summaryHi,
      videoUrl,
      categories,
      district,
      subdivision,
      isBreaking
    } = req.body;

    const news = await News.findById(req.params.id);

    if (news) {
      news.titleEn = titleEn || news.titleEn;
      news.titleHi = titleHi || news.titleHi;
      news.contentEn = contentEn || news.contentEn;
      news.contentHi = contentHi || news.contentHi;
      news.summaryEn = summaryEn || news.summaryEn;
      news.summaryHi = summaryHi || news.summaryHi;
      news.videoUrl = videoUrl !== undefined ? videoUrl : news.videoUrl;
      news.district = district || news.district;
      news.subdivision = subdivision || news.subdivision;
      news.isBreaking = isBreaking !== undefined ? (isBreaking === 'true' || isBreaking === true) : news.isBreaking;

      if (categories) {
        try {
          news.categories = typeof categories === 'string' ? JSON.parse(categories) : categories;
        } catch (err) {
          news.categories = [categories];
        }
      }

      if (finalImages !== undefined) {
        news.images = finalImages;
      }

      const updatedNews = await news.save();
      res.json(updatedNews);
    } else {
      res.status(404).json({ message: 'News article not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete news article
// @route   DELETE /api/news/:id
// @access  Private/Admin
const deleteNews = async (req, res) => {
  let existingImages = [];
  let isFound = false;

  if (global.useJsonDb) {
    const article = jsonDb.getNewsById(req.params.id);
    if (article) {
      existingImages = article.images || [];
      isFound = true;
    }
  } else {
    try {
      const article = await News.findById(req.params.id);
      if (article) {
        existingImages = article.images || [];
        isFound = true;
      }
    } catch (err) {}
  }

  if (!isFound) {
    return res.status(404).json({ message: 'News article not found' });
  }

  // Delete images from Cloudinary
  try {
    for (const imgUrl of existingImages) {
      await deleteFromCloudinary(imgUrl);
    }
  } catch (err) {
    console.error('Error deleting news images from Cloudinary:', err);
  }

  if (global.useJsonDb) {
    try {
      const success = jsonDb.deleteNews(req.params.id);
      if (success) {
        return res.json({ message: 'News article removed' });
      } else {
        return res.status(404).json({ message: 'News article not found' });
      }
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  try {
    await News.deleteOne({ _id: req.params.id });
    res.json({ message: 'News article removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all categories
// @route   GET /api/news/categories
// @access  Public
const getCategories = async (req, res) => {
  if (global.useJsonDb) {
    try {
      const categories = jsonDb.getCategories();
      return res.json(categories);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  try {
    const categories = await Category.find({}).sort({ nameEn: 1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create category
// @route   POST /api/news/categories
// @access  Private/Admin
const createCategory = async (req, res) => {
  if (global.useJsonDb) {
    try {
      const { nameEn, nameHi } = req.body;
      if (!nameEn || !nameHi) {
        return res.status(400).json({ message: 'Please provide both English and Hindi names' });
      }
      const createdCategory = jsonDb.createCategory(nameEn, nameHi);
      if (createdCategory) {
        return res.status(201).json(createdCategory);
      } else {
        return res.status(400).json({ message: 'Category already exists' });
      }
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  try {
    const { nameEn, nameHi } = req.body;

    if (!nameEn || !nameHi) {
      return res.status(400).json({ message: 'Please provide both English and Hindi names' });
    }

    const categoryExists = await Category.findOne({ $or: [{ nameEn }, { nameHi }] });

    if (categoryExists) {
      return res.status(400).json({ message: 'Category already exists' });
    }

    const category = new Category({
      nameEn,
      nameHi,
    });

    const createdCategory = await category.save();
    res.status(201).json(createdCategory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete category
// @route   DELETE /api/news/categories/:id
// @access  Private/Admin
const deleteCategory = async (req, res) => {
  if (global.useJsonDb) {
    try {
      const success = jsonDb.deleteCategory(req.params.id);
      if (success) {
        return res.json({ message: 'Category removed' });
      } else {
        return res.status(404).json({ message: 'Category not found' });
      }
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  try {
    const category = await Category.findById(req.params.id);

    if (category) {
      await Category.deleteOne({ _id: req.params.id });
      await News.updateMany(
        { categories: req.params.id },
        { $pull: { categories: req.params.id } }
      );
      res.json({ message: 'Category removed' });
    } else {
      res.status(404).json({ message: 'Category not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add comment to news article
// @route   POST /api/news/:id/comments
// @access  Public
const addComment = async (req, res) => {
  const { name, text } = req.body;
  if (!name || !text) {
    return res.status(400).json({ message: 'Name and text are required' });
  }

  if (global.useJsonDb) {
    try {
      const comments = jsonDb.addComment(req.params.id, { name, text });
      if (comments) {
        return res.status(201).json(comments);
      } else {
        return res.status(404).json({ message: 'News article not found' });
      }
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  try {
    const news = await News.findById(req.params.id);
    if (news) {
      const newComment = {
        name,
        text,
        date: new Date().toLocaleDateString()
      };
      if (!news.comments) {
        news.comments = [];
      }
      news.comments.push(newComment);
      await news.save();
      res.status(201).json(news.comments);
    } else {
      res.status(404).json({ message: 'News article not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all comments across all news articles
// @route   GET /api/news/comments/all
// @access  Private/Admin
const getAllComments = async (req, res) => {
  if (global.useJsonDb) {
    try {
      const newsList = jsonDb.getNews({});
      let allComments = [];
      newsList.forEach(news => {
        if (news.comments && news.comments.length > 0) {
          news.comments.forEach(comment => {
            allComments.push({
              commentId: comment._id || (comment.name + '_' + comment.date),
              name: comment.name,
              text: comment.text,
              date: comment.date,
              newsId: news._id,
              newsTitleEn: news.titleEn,
              newsTitleHi: news.titleHi
            });
          });
        }
      });
      return res.json(allComments);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  try {
    const newsList = await News.find({}, 'titleEn titleHi comments');
    let allComments = [];
    newsList.forEach(news => {
      if (news.comments && news.comments.length > 0) {
        news.comments.forEach(comment => {
          allComments.push({
            commentId: comment._id,
            name: comment.name,
            text: comment.text,
            date: comment.date,
            newsId: news._id,
            newsTitleEn: news.titleEn,
            newsTitleHi: news.titleHi
          });
        });
      }
    });
    res.json(allComments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete comment from news article
// @route   DELETE /api/news/:id/comments/:commentId
// @access  Private/Admin
const deleteComment = async (req, res) => {
  const { id, commentId } = req.params;

  if (global.useJsonDb) {
    try {
      const success = jsonDb.deleteComment(id, commentId);
      if (success) {
        return res.json({ message: 'Comment removed successfully' });
      } else {
        return res.status(404).json({ message: 'Comment or news article not found' });
      }
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  try {
    const news = await News.findById(id);
    if (news) {
      const commentIndex = news.comments.findIndex(c => c._id.toString() === commentId);
      if (commentIndex !== -1) {
        news.comments.splice(commentIndex, 1);
        await news.save();
        res.json({ message: 'Comment removed successfully' });
      } else {
        res.status(404).json({ message: 'Comment not found' });
      }
    } else {
      res.status(404).json({ message: 'News article not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Like news article
// @route   POST /api/news/:id/like
// @access  Public
const likeNews = async (req, res) => {
  if (global.useJsonDb) {
    try {
      const news = jsonDb.likeNews(req.params.id);
      if (news) {
        return res.json({ likes: news.likes });
      } else {
        return res.status(404).json({ message: 'News article not found' });
      }
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  try {
    const news = await News.findById(req.params.id);
    if (news) {
      news.likes = (news.likes || 0) + 1;
      await news.save();
      res.json({ likes: news.likes });
    } else {
      res.status(404).json({ message: 'News article not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Share news article
// @route   POST /api/news/:id/share
// @access  Public
const shareNews = async (req, res) => {
  if (global.useJsonDb) {
    try {
      const news = jsonDb.shareNews(req.params.id);
      if (news) {
        return res.json({ shares: news.shares });
      } else {
        return res.status(404).json({ message: 'News article not found' });
      }
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  try {
    const news = await News.findById(req.params.id);
    if (news) {
      news.shares = (news.shares || 0) + 1;
      await news.save();
      res.json({ shares: news.shares });
    } else {
      res.status(404).json({ message: 'News article not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all pending news articles for review
// @route   GET /api/news/pending
// @access  Private/Admin
const getPendingNews = async (req, res) => {
  if (global.useJsonDb) {
    try {
      const list = jsonDb.getNews({ status: 'pending' });
      return res.json(list);
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }

  try {
    const pendingList = await News.find({ status: 'pending' })
      .populate('categories')
      .populate('author', 'name username photoUrl designation phone')
      .sort({ createdAt: -1 });
    res.json(pendingList);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Approve or reject a news article
// @route   PUT /api/news/:id/status
// @access  Private/Admin
const updateNewsStatus = async (req, res) => {
  const { status, rejectionReason } = req.body;
  if (!['approved', 'rejected', 'pending'].includes(status)) {
    return res.status(400).json({ message: 'अमान्य स्टेटस (Invalid status)' });
  }

  if (global.useJsonDb) {
    try {
      const updated = jsonDb.updateNews(req.params.id, {
        status,
        rejectionReason: status === 'rejected' ? (rejectionReason || 'अस्वीकृत') : ''
      });
      if (updated && status === 'approved') {
        sendPushToAll(
          '🔴 ' + (updated.titleHi || updated.titleEn || 'नई खबर'),
          updated.summaryHi || updated.summaryEn || 'सिटी समाचार डिजिटल पर नई खबर पढ़ें।',
          `/news/${updated._id || updated.id}`
        );
      }
      return res.json(updated);
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }

  try {
    const news = await News.findById(req.params.id);
    if (!news) {
      return res.status(404).json({ message: 'News article not found' });
    }

    news.status = status;
    if (status === 'rejected') {
      news.rejectionReason = rejectionReason || 'अस्वीकृत';
    } else if (status === 'approved') {
      news.rejectionReason = '';
    }

    const savedNews = await news.save();

    if (status === 'approved') {
      sendPushToAll(
        '🔴 ' + (savedNews.titleHi || savedNews.titleEn || 'नई खबर'),
        savedNews.summaryHi || savedNews.summaryEn || 'सिटी समाचार डिजिटल पर नई खबर पढ़ें।',
        `/news/${savedNews._id}`
      );
    }

    res.json(savedNews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get articles submitted by currently logged in user
// @route   GET /api/news/my-news
// @access  Private
const getMyNews = async (req, res) => {
  if (global.useJsonDb) {
    try {
      const list = jsonDb.getNews({ author: req.user._id, status: 'all' });
      return res.json(list);
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }

  try {
    const list = await News.find({ author: req.user._id })
      .populate('categories')
      .sort({ createdAt: -1 });
    res.json(list);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getNews,
  getNewsById,
  createNews,
  updateNews,
  deleteNews,
  getCategories,
  createCategory,
  deleteCategory,
  addComment,
  getAllComments,
  deleteComment,
  likeNews,
  shareNews,
  getPendingNews,
  updateNewsStatus,
  getMyNews,
};
