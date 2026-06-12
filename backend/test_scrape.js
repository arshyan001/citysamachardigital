const https = require('https');

const fetchUrl = (url) => {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
};

async function test() {
  try {
    const html = await fetchUrl('https://www.cricbuzz.com/cricket-match/live-scores');
    
    // Split by live match link prefix
    const blocks = html.split('href="/live-cricket-scores/');
    console.log('Total match blocks found:', blocks.length - 1);
    
    const matches = [];
    
    for (let i = 1; i < blocks.length; i++) {
      const block = blocks[i];
      // We only care about the link text block up to the end of the <a> tag
      const linkBlock = block.split('</a>')[0];
      
      // Extract Match ID and title from href slug
      const slugMatch = linkBlock.match(/^([^/"]+)\/([^"]+)"/);
      if (!slugMatch) continue;
      const matchId = slugMatch[1];
      const matchSlug = slugMatch[2];
      
      // Find team names and scores
      // Typically: <div class="... truncate">[TEAM]</span></div><span class="...">[SCORE]</span>
      const teamScoreRegex = />([A-Za-z0-9&'\s]+)<\/span><\/div><span class="[^"]*">\s*([0-9\-\/\s\(\)\.d]+)\s*<\/span>/g;
      
      const teams = [];
      let tsMatch;
      while ((tsMatch = teamScoreRegex.exec(linkBlock))) {
        teams.push({
          name: tsMatch[1].trim(),
          score: tsMatch[2].trim()
        });
      }
      
      // Extract Match status
      // Looks like: dark:text-cbLiveDark">[STATUS]</span> or dark:text-cbCompleteDark">[STATUS]</span>
      const statusRegex = /class="text-cb(?:Live|Complete|Preview)[^>]*>([^<]+)<\/span>/;
      const statusMatch = linkBlock.match(statusRegex);
      const status = statusMatch ? statusMatch[1].trim() : '';
      
      // Extract Match Type / Description (like "One-off Test", "Final", "IPL 2026")
      const descRegex = /class="text-xs text-cbTxtSec dark:text-cbTxtSec w-4\/5[^>]*>([^<]+)<\/span>/;
      const descMatch = linkBlock.match(descRegex);
      const desc = descMatch ? descMatch[1].trim() : '';

      // Skip blocks that don't have valid teams or status
      if (teams.length === 0 && !status) continue;
      
      // Avoid duplicate matches by ID
      if (matches.some(m => m.id === matchId)) continue;
      
      matches.push({
        id: matchId,
        slug: matchSlug,
        teams,
        status,
        desc
      });
    }
    
    console.log('--- Parsed Matches Output ---');
    console.log(JSON.stringify(matches, null, 2));
    
  } catch (err) {
    console.error('Error:', err.message);
  }
}

test();
