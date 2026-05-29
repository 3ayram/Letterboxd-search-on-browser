// dormant content script that only responds when popup asks or when state changes.
// This has absolutely ZERO DOM injection and ZERO click event listeners.

let currentAppleState = false;
let lastAppleTitle = "";
let lastAppleId = "";

const cleanTitle = (rawTitle) => {
  if (!rawTitle) return "";
  
  let cleaned = rawTitle.trim();
  if (cleaned.toLowerCase().startsWith("watch ")) {
    cleaned = cleaned.substring(6).trim();
  }
  
  // 1. Remove Unicode directional formatting characters and isolates
  cleaned = cleaned.replace(/[\u200E\u200F\u202A-\u202E\u2066-\u2069]/g, "");
  
  // 2. Strip common brand suffixes
  const suffixes = [
    /\s*[-–|•]\s*Apple\s*TV\s*[+＋]?\s*$/i,
    /\s*[-–|•]\s*AppleTV\s*$/i,
    /\s*[-–|•]\s*Disney\s*[+＋]\s*$/i,
    /\s*[-–|•]\s*DisneyPlus\s*$/i,
    /\s*[-–|•]\s*MUBI\s*$/i,
    /\s*[-–|•]\s*Prime\s*Video\s*$/i,
    /\s*Prime\s*Video\s*:\s*/i,
    /\s*[•|–-]\s*HBO\s*Max\s*$/i,
    /\s*[•|–-]\s*Max\s*$/i,
    /\s*[•|–-]\s*Netflix\s*$/i
  ];
  
  for (const suffixPattern of suffixes) {
    cleaned = cleaned.replace(suffixPattern, "");
  }
  
  return cleaned.trim();
};

const extractAppleId = (url) => {
  if (!url) return "";
  // tv.apple.com/.../movie/slug/umc.cmc.id
  const match = url.match(/(?:movie|play|player|video|show)\/(?:[^/]+\/)*([^?#/]+)/);
  return match ? match[1] : "";
};

const checkAndSendAppleState = () => {
  const url = window.location.href;
  const isAppleMovie = 
    url.includes("/movie/") || 
    url.includes("/play/") || 
    url.includes("/player/") || 
    url.includes("/video/") || 
    url.includes("/watch/");
  
  if (!isAppleMovie) {
    if (currentAppleState) {
      currentAppleState = false;
      lastAppleTitle = "";
      lastAppleId = "";
      chrome.runtime.sendMessage({
        action: "setAppleBadge",
        text: ""
      });
    }
    return;
  }

  const currentId = extractAppleId(url);
  let title = "";

  // Attempt to parse title from DOM elements if available
  const h1 = document.querySelector('h1, .product-header__title, .canvas-title, [data-testid="product-title"]');
  if (h1) {
    title = h1.innerText || h1.textContent || "";
  }

  // Fallback to document.title
  if (!title && document.title && document.title.toLowerCase() !== "apple tv" && !document.title.toLowerCase().startsWith("apple tv")) {
    title = document.title;
  }

  title = cleanTitle(title);

  // Re-use last detected title if we are on the same ID
  if (currentId) {
    if (title) {
      lastAppleId = currentId;
      lastAppleTitle = title;
    } else if (currentId === lastAppleId && lastAppleTitle) {
      title = lastAppleTitle;
    } else {
      lastAppleId = "";
      lastAppleTitle = "";
    }
  }

  const movieActive = !!title;

  if (movieActive !== currentAppleState || (movieActive && title !== lastAppleTitle)) {
    currentAppleState = movieActive;
    lastAppleTitle = title;
    
    chrome.runtime.sendMessage({
      action: "setAppleBadge",
      text: movieActive ? "\u25b6" : ""
    });
  }
};

// Check initially
checkAndSendAppleState();

// Setup mutation observer to check silently when DOM/title changes
const observer = new MutationObserver(() => {
  checkAndSendAppleState();
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
  attributes: true
});

// Also check state on pop-up query
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "checkAppleMovie") {
    checkAndSendAppleState();
    sendResponse({ movieActive: currentAppleState, title: lastAppleTitle });
  }
  return true;
});
