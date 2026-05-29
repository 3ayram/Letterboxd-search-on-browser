const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, '_locales');
const locales = {
  'en': 'Letterboxd Helper',
  'tr': 'Letterboxd Yardımcısı',
  'de': 'Letterboxd Helfer',
  'es': 'Ayudante de Letterboxd',
  'fr': 'Assistant Letterboxd',
  'it': 'Assistente Letterboxd'
};

Object.keys(locales).forEach(lang => {
  const filePath = path.join(localesDir, lang, 'messages.json');
  if (fs.existsSync(filePath)) {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    if (data.extensionName) {
      data.extensionName.message = locales[lang];
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
      console.log(`Updated ${lang} messages.json with ${locales[lang]}`);
    }
  }
});
