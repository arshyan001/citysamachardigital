const https = require('https');

const fetchUrl = (url) => {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5'
      }
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
};

// @desc    Get live cricket matches list from Cricbuzz
// @route   GET /api/cricket/live
// @access  Public
const getLiveScores = async (req, res) => {
  try {
    const html = await fetchUrl('https://www.cricbuzz.com/cricket-match/live-scores');
    const blocks = html.split('href="/live-cricket-scores/');
    const matches = [];
    
    for (let i = 1; i < blocks.length; i++) {
      const block = blocks[i];
      const linkBlock = block.split('</a>')[0];
      
      const slugMatch = linkBlock.match(/^([^/"]+)\/([^"]+)"/);
      if (!slugMatch) continue;
      
      const matchId = slugMatch[1];
      const matchSlug = slugMatch[2];
      
      // Match teams and scores
      const teamScoreRegex = />([A-Za-z0-9&'\s]+)<\/span><\/div><span class="[^"]*">\s*([0-9\-\/\s\(\)\.d]+)\s*<\/span>/g;
      const teams = [];
      let tsMatch;
      while ((tsMatch = teamScoreRegex.exec(linkBlock))) {
        teams.push({
          name: tsMatch[1].trim(),
          score: tsMatch[2].trim()
        });
      }
      
      // Match status (trailing, leading, won, etc.)
      const statusRegex = /class="text-cb(?:Live|Complete|Preview)[^>]*>([^<]+)<\/span>/;
      const statusMatch = linkBlock.match(statusRegex);
      const status = statusMatch ? statusMatch[1].trim() : '';
      
      // Match info (format, location, match number)
      const descRegex = /class="text-xs text-cbTxtSec dark:text-cbTxtSec w-4\/5[^>]*>([^<]+)<\/span>/;
      const descMatch = linkBlock.match(descRegex);
      const desc = descMatch ? descMatch[1].trim() : '';

      if (teams.length === 0 && !status) continue;
      if (matches.some(m => m.id === matchId)) continue;
      
      matches.push({
        id: matchId,
        slug: matchSlug,
        teams,
        status,
        desc
      });
    }
    
    res.json(matches);
  } catch (error) {
    console.error('Cricket score scrape error:', error);
    res.status(500).json({ message: 'Error retrieving live scores: ' + error.message });
  }
};

module.exports = {
  getLiveScores,
};
