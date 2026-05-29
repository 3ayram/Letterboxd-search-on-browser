function saveSearchHistory(query) {
  chrome.storage.sync.get({ saveHistory: true }, function(syncItems) {
    if (syncItems.saveHistory) {
      chrome.storage.local.get({ recentSearches: [] }, function(localItems) {
        let searches = localItems.recentSearches;
        searches = searches.filter(t => t.toLowerCase() !== query.toLowerCase());
        searches.unshift(query);
        if (searches.length > 10) searches = searches.slice(0, 10);
        chrome.storage.local.set({ recentSearches: searches });
      });
    }
  });
}
const menuAPI = chrome.menus || chrome.contextMenus;

function createContextMenu() {
  if (menuAPI) {
    menuAPI.create({
      id: "letterboxd",
      title: chrome.i18n.getMessage("searchOnLetterboxd") || "Search on Letterboxd",
      contexts: ["selection"]
    }, function() {
      if (chrome.runtime.lastError) {
        // Ignore duplicate ID error
      }
    });
  }
}

chrome.runtime.onInstalled.addListener(function(details) {
  createContextMenu();
  if (details.reason === 'install') {
    if (actionAPI && actionAPI.getUserUserSettings) {
      actionAPI.getUserUserSettings().then((settings) => {
        if (!settings.isOnToolbar) {
          chrome.tabs.create({ url: chrome.runtime.getURL("welcome.html") });
        }
      }).catch((e) => {
        chrome.tabs.create({ url: chrome.runtime.getURL("welcome.html") });
      });
    } else {
      chrome.tabs.create({ url: chrome.runtime.getURL("welcome.html") });
    }
  }
});
createContextMenu(); // Ensure it runs unconditionally on script load (Firefox/Event Pages)

if (menuAPI) {
  menuAPI.onClicked.addListener(function (clickData, tab) {
    if (clickData.menuItemId === "letterboxd" && clickData.selectionText) {
      var cleanText = clickData.selectionText.trim().replace(/\s+/g, ' ');
      saveSearchHistory(cleanText);
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
}

function fixedEncodeURI(str) {
  return encodeURI(str).replace(/%5B/g, "[").replace(/%5D/g, "]");
}

const actionAPI = chrome.action || chrome.browserAction;

function setBadge(text, tabId, color) {
  if (actionAPI && actionAPI.setBadgeText) {
    actionAPI.setBadgeText({ text: text, tabId: tabId });
    if (text) {
      actionAPI.setBadgeBackgroundColor({ color: color || "#e50914", tabId: tabId }); // Default to Netflix Red
    }
  }
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'fetchImdbRating' && request.imdbId) {
    const omdbUrl = 'https://www.omdbapi.com/?i=' + request.imdbId + '&apikey=trilogy';
    fetch(omdbUrl)
    .then(response => response.json())
    .then(data => {
      if (data && data.imdbRating && data.imdbRating !== 'N/A') {
        sendResponse({ success: true, rating: data.imdbRating, votes: data.imdbVotes || null });
      } else {
        sendResponse({ success: false, error: 'Rating not found in OMDb' });
      }
    })
    .catch(error => {
      sendResponse({ success: false, error: error.toString() });
    });
    return true; // Indicates async response
  } else if (request.action === 'openTab' && request.url) {
    chrome.tabs.create({
      url: request.url,
      index: sender.tab ? sender.tab.index + 1 : undefined
    });
    sendResponse({ success: true });
  } else if (request.action === 'setNetflixBadge' && sender.tab) {
    setBadge(request.text, sender.tab.id, "#e50914");
    sendResponse({ success: true });
  } else if (request.action === 'setMaxBadge' && sender.tab) {
    setBadge(request.text, sender.tab.id, "#002be7"); // Max Brand Blue
    sendResponse({ success: true });
  } else if (request.action === 'setPrimeBadge' && sender.tab) {
    setBadge(request.text, sender.tab.id, "#00A8E1"); // Prime Video Teal
    sendResponse({ success: true });
  } else if (request.action === 'setMubiBadge' && sender.tab) {
    setBadge(request.text, sender.tab.id, "#000000"); // MUBI Black
    sendResponse({ success: true });
  } else if (request.action === 'setDisneyBadge' && sender.tab) {
    setBadge(request.text, sender.tab.id, "#0063e5"); // Disney+ Royal Blue
    sendResponse({ success: true });
  } else if (request.action === 'setAppleBadge' && sender.tab) {
    setBadge(request.text, sender.tab.id, "#1a1a1a"); // Apple TV+ Dark Grey
    sendResponse({ success: true });
  } else if (request.action === 'setImdbBadge' && sender.tab) {
    setBadge(request.text, sender.tab.id, "#f5c518"); // IMDb Gold
    sendResponse({ success: true });
  }
});

