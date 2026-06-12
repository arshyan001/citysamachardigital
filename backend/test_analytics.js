const mongoose = require('mongoose');
const News = require('./models/News');
const Category = require('./models/Category');
const Stats = require('./models/Stats');
const { trackWebsiteHit, getDashboardStats } = require('./controllers/analyticsController');

const test = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/news_channel';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB.');

    const statsObj = await Stats.findOne({});
    const totalWebsiteViews = statsObj ? statsObj.totalWebsiteViews : 0;
    const totalArticles = await News.countDocuments({});

    console.log('Website views:', totalWebsiteViews);
    console.log('Total articles:', totalArticles);

    // Fetch news to calculate aggregates
    const newsListForStats = await News.find({}, 'views likes shares comments createdAt');
    console.log(`Fetched ${newsListForStats.length} news items.`);

    let totalArticleViews = 0;
    let totalLikes = 0;
    let totalShares = 0;
    let totalComments = 0;

    newsListForStats.forEach(news => {
      totalArticleViews += (news.views || 0);
      totalLikes += (news.likes || 0);
      totalShares += (news.shares || 0);
      totalComments += (news.comments ? news.comments.length : 0);
    });
    console.log('Aggregations calculated:');
    console.log(' Views:', totalArticleViews);
    console.log(' Likes:', totalLikes);
    console.log(' Shares:', totalShares);
    console.log(' Comments:', totalComments);

    // Category distribution
    const categories = await Category.find({});
    console.log('Categories count:', categories.length);
    const categoryStats = await Promise.all(
      categories.map(async (cat) => {
        const count = await News.countDocuments({ categories: cat._id });
        return { name: cat.nameEn, count };
      })
    );
    console.log('Category stats:', categoryStats);

    // Subdivision stats
    const subdivisions = ['None', 'Khalilabad', 'Mehdawal', 'Dhanghata'];
    const subdivisionStats = await Promise.all(
      subdivisions.map(async (name) => {
        const count = await News.countDocuments({ subdivision: name });
        return { name, count };
      })
    );
    console.log('Subdivision stats:', subdivisionStats);

    // Popular Articles
    const popularArticles = await News.find({}, 'titleEn titleHi views likes shares createdAt')
      .sort({ views: -1 })
      .limit(5);
    console.log('Popular articles count:', popularArticles.length);

    // Timeline data (aggregated)
    console.log('Generating timeline data...');
    const viewsTimeline = generateTimelineData(newsListForStats);
    console.log('Timeline data:', viewsTimeline);

    console.log('All stats calculated successfully!');
  } catch (err) {
    console.error('CRASH ERROR IN CONTROLLER:', err);
  } finally {
    await mongoose.connection.close();
  }
};

function generateTimelineData(newsList) {
  const dates = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().split('T')[0]);
  }

  return dates.map(dateStr => {
    const dayArticles = newsList.filter(n => {
      const createdStr = n.createdAt instanceof Date ? n.createdAt.toISOString() : String(n.createdAt || '');
      return createdStr.startsWith(dateStr);
    });
    const articleCount = dayArticles.length;
    const dayViews = dayArticles.reduce((sum, n) => sum + (n.views || 0), 0) + Math.floor(Math.random() * 40) + 15;

    return {
      date: new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      views: dayViews,
      articles: articleCount
    };
  });
}

test();
