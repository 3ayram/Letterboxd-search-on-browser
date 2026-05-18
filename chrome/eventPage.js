var menuItem = {
  id: "letterboxd",
  title: chrome.i18n.getMessage("searchOnLetterboxd"),
  contexts: ["selection"],
};

try {
  chrome.contextMenus.create(menuItem);
} catch (e) {}

function fixedEncodeURI(str) {
  return encodeURI(str).replace(/%5B/g, "[").replace(/%5D/g, "]");
}

chrome.contextMenus.onClicked.addListener(function (clickData, tab) {
  if (clickData.menuItemId === "letterboxd" && clickData.selectionText) {
    // Metin temizleme: Baş/son boşlukları sil ve aradaki birden fazla boşluk/satır atlamasını tek boşluğa çevir
    var cleanText = clickData.selectionText.trim().replace(/\s+/g, ' ');
    var wikiUrl = "https://letterboxd.com/search/" + fixedEncodeURI(cleanText);
    
    chrome.storage.sync.get({ contextMenuBgTab: false }, function(items) {
      chrome.tabs.create({ 
        url: wikiUrl, 
        index: tab.index + 1,
        active: !items.contextMenuBgTab
      });
    });
  }
});
