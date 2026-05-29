// dormant content script that only responds when popup asks or when state changes.
// This has absolutely ZERO DOM injection and ZERO click event listeners.

let currentMubiState = false;
let lastMubiTitle = "";
let lastMubiId = "";

const cleanTitle = (rawTitle) => {
  if (!rawTitle) return "";
  
  // 1. Remove Unicode directional formatting characters and isolates
  let cleaned = rawTitle.replace(/[\u200E\u200F\u202A-\u202E\u2066-\u2069]/g, "");
  
  // 2. Strip common brand suffixes for MUBI, Prime, Max, Netflix
  const suffixes = [
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

const extractMubiId = (url) => {
  if (!url) return "";
  const match = url.match(/(?:films|showing|watch|play)\/([^?#/]+)/);
  return match ? match[1] : "";
};

const checkAndSendMubiState = () => {
  const url = window.location.href;
  const isMubiMovie = url.includes("/films/") || url.includes("/showing/") || url.includes("/watch/") || url.includes("/play");
  
  if (!isMubiMovie) {
    if (currentMubiState) {
      currentMubiState = false;
      lastMubiTitle = "";
      lastMubiId = "";
      chrome.runtime.sendMessage({
        action: "setMubiBadge",
        text: ""
      });
    }
    return;
  }

  const currentId = extractMubiId(url);
  let title = "";

  // Attempt to parse title from DOM elements if available
  const h1 = document.querySelector('h1, .film-show-title, .watch-metadata__title');
  if (h1) {
    title = h1.innerText || h1.textContent || "";
  }

  // Fallback to document.title
  if (!title && document.title && document.title.toLowerCase() !== "mubi") {
    title = document.title;
  }

  title = cleanTitle(title);

  // Re-use last detected title if we are on the same ID
  if (currentId) {
    if (title) {
      lastMubiId = currentId;
      lastMubiTitle = title;
    } else if (currentId === lastMubiId && lastMubiTitle) {
      title = lastMubiTitle;
    } else {
      lastMubiId = "";
      lastMubiTitle = "";
    }
  }

  const movieActive = !!title;

  if (movieActive !== currentMubiState || (movieActive && title !== lastMubiTitle)) {
    currentMubiState = movieActive;
    lastMubiTitle = title;
    
    chrome.runtime.sendMessage({
      action: "setMubiBadge",
      text: movieActive ? "\u25b6" : ""
    });
  }
};

// Check initially
checkAndSendMubiState();

// Setup mutation observer to check silently when DOM/title changes
const observer = new MutationObserver(() => {
  checkAndSendMubiState();
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
  attributes: true
});

// Also check state on pop-up query
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "checkMubiMovie") {
    checkAndSendMubiState();
    sendResponse({ movieActive: currentMubiState, title: lastMubiTitle });
  }
  return true;
});
