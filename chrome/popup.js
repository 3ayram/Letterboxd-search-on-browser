document.addEventListener('DOMContentLoaded', function() {
  const searchInput = document.getElementById('searchInput');
  const searchBtn = document.getElementById('searchBtn');

  // Dil Desteği (Localization) Uygulama
  document.getElementById('popupTitle').innerText = chrome.i18n.getMessage("popupTitle") || "Letterboxd Arama";
  searchInput.placeholder = chrome.i18n.getMessage("popupPlaceholder") || "Film adı yazın...";
  searchBtn.innerText = chrome.i18n.getMessage("popupSearchBtn") || "Ara";

  function performSearch() {
    // Metin temizleme
    const query = searchInput.value.trim().replace(/\s+/g, ' ');
    if (query) {
      const url = "https://letterboxd.com/search/" + encodeURI(query).replace(/%5B/g, "[").replace(/%5D/g, "]");
      
      // Get the active tab to open the new tab right next to it
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        if (tabs && tabs.length > 0) {
          chrome.tabs.create({ url: url, index: tabs[0].index + 1 });
        } else {
          chrome.tabs.create({ url: url });
        }
      });
    }
  }

  searchBtn.addEventListener('click', performSearch);

  searchInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      performSearch();
    }
  });

  // Ayarlar ikonuna tıklanınca ayarlar sayfasını aç
  document.getElementById('settingsBtn').addEventListener('click', function() {
    if (chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else {
      window.open(chrome.runtime.getURL('options.html'));
    }
  });
});
