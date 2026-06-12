const News = require('../models/News');
const Category = require('../models/Category');
const jsonDb = require('../config/jsonDb');

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
    const { category, subdivision, isBreaking, search, limit } = req.query;
    let query = {};

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
        isBreaking,
        images
      } = req.body;

      let finalImages = [];
      if (req.files && req.files.length > 0) {
        finalImages = req.files.map(file => `/uploads/${file.filename}`);
      } else if (images) {
        finalImages = Array.isArray(images) ? images : [images];
      }

      let parsedCategories = [];
      if (categories) {
        try {
          parsedCategories = typeof categories === 'string' ? JSON.parse(categories) : categories;
        } catch (err) {
          parsedCategories = [categories];
        }
      }

      const createdNews = jsonDb.createNews({
        titleEn,
        titleHi,
        contentEn,
        contentHi,
        summaryEn: summaryEn || (contentEn ? contentEn.substring(0, 150) + '...' : ''),
        summaryHi: summaryHi || (contentHi ? contentHi.substring(0, 150) + '...' : ''),
        images: finalImages,
        videoUrl,
        categories: parsedCategories,
        district: district || 'Sant Kabir Nagar',
        subdivision: subdivision || 'None',
        isBreaking: isBreaking === 'true' || isBreaking === true,
      });
      return res.status(201).json(createdNews);
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
      isBreaking,
      images
    } = req.body;

    let finalImages = [];
    if (req.files && req.files.length > 0) {
      finalImages = req.files.map(file => `/uploads/${file.filename}`);
    } else if (images) {
      finalImages = Array.isArray(images) ? images : [images];
    }

    let parsedCategories = [];
    if (categories) {
      try {
        parsedCategories = typeof categories === 'string' ? JSON.parse(categories) : categories;
      } catch (err) {
        parsedCategories = [categories];
      }
    }

    const news = new News({
      titleEn,
      titleHi,
      contentEn,
      contentHi,
      summaryEn: summaryEn || (contentEn ? contentEn.substring(0, 150) + '...' : ''),
      summaryHi: summaryHi || (contentHi ? contentHi.substring(0, 150) + '...' : ''),
      images: finalImages,
      videoUrl,
      categories: parsedCategories,
      district: district || 'Sant Kabir Nagar',
      subdivision: subdivision || 'None',
      isBreaking: isBreaking === 'true' || isBreaking === true,
    });

    const createdNews = await news.save();
    res.status(201).json(createdNews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update news article
// @route   PUT /api/news/:id
// @access  Private/Admin
const updateNews = async (req, res) => {
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
        isBreaking,
        images
      } = req.body;

      let finalImages = undefined;
      if (req.files && req.files.length > 0) {
        finalImages = req.files.map(file => `/uploads/${file.filename}`);
      } else if (images) {
        finalImages = Array.isArray(images) ? images : [images];
      }

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
      if (finalImages) updatePayload.images = finalImages;

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
      isBreaking,
      images
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

      if (req.files && req.files.length > 0) {
        const uploadedImages = req.files.map(file => `/uploads/${file.filename}`);
        news.images = uploadedImages;
      } else if (images) {
        news.images = Array.isArray(images) ? images : [images];
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
    const news = await News.findById(req.params.id);

    if (news) {
      await News.deleteOne({ _id: req.params.id });
      res.json({ message: 'News article removed' });
    } else {
      res.status(404).json({ message: 'News article not found' });
    }
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
};
