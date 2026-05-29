// dormant content script that only responds when popup asks or when state changes.
// This has absolutely ZERO DOM injection and ZERO click event listeners on IMDb.

let lastImdbId = "";
let lastImdbTitle = "";
let currentImdbState = false;

const extractImdbId = (url) => {
  const titleMatch = url.match(/\/title\/(tt\d+)/);
  if (titleMatch) return titleMatch[1];
  const nameMatch = url.match(/\/name\/(nm\d+)/);
  if (nameMatch) return nameMatch[1];
  return "";
};

const checkAndSendImdbState = () => {
  const url = window.location.href;
  const currentId = extractImdbId(url);
  
  if (!currentId) {
    if (currentImdbState) {
      currentImdbState = false;
      lastImdbId = "";
      lastImdbTitle = "";
      chrome.runtime.sendMessage({
        action: "setImdbBadge",
        text: ""
      });
    }
    return;
  }

  let title = "";
  const titleElement = document.querySelector('h1[data-testid="hero__pageTitle"]') || document.querySelector('h1');
  if (titleElement) {
    title = titleElement.innerText || titleElement.textContent || "";
  }

  title = title.trim();

  if (currentId) {
    lastImdbId = currentId;
    lastImdbTitle = title;
  }

  const movieActive = !!currentId;

  if (movieActive !== currentImdbState) {
    currentImdbState = movieActive;
    
    chrome.runtime.sendMessage({
      action: "setImdbBadge",
      text: movieActive ? "\u25b6" : ""
    });
  }
};

// Check initially
checkAndSendImdbState();

const observer = new MutationObserver(() => {
  checkAndSendImdbState();
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});

// Listen to popup messaging
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "checkImdbMovie") {
    checkAndSendImdbState();
    sendResponse({ movieActive: currentImdbState, imdbId: lastImdbId, title: lastImdbTitle });
  }
  return true;
});
