const https = require('https');

// @desc    Translate text between English and Hindi
// @route   POST /api/translate
// @access  Private/Admin
const translateText = async (req, res) => {
  try {
    const { text, targetLang } = req.body;
    
    if (!text || !targetLang) {
      return res.status(400).json({ message: 'Please provide both text and targetLang' });
    }

    if (targetLang !== 'en' && targetLang !== 'hi') {
      return res.status(400).json({ message: 'Unsupported target language. Use "en" or "hi".' });
    }

    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
    
    https.get(url, (apiRes) => {
      let data = '';
      
      apiRes.on('data', (chunk) => {
        data += chunk;
      });
      
      apiRes.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          
          if (parsed && parsed[0]) {
            // Join all segments for multi-line support
            const translated = parsed[0]
              .map(item => item[0])
              .filter(Boolean)
              .join('');
              
            return res.json({ translatedText: translated });
          } else {
            return res.status(520).json({ message: 'Unexpected structure from Google translation service' });
          }
        } catch (err) {
          return res.status(500).json({ message: 'Error parsing translation data: ' + err.message });
        }
      });
    }).on('error', (err) => {
      return res.status(500).json({ message: 'Translation API connection error: ' + err.message });
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  translateText,
};
