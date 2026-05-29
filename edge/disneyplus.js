// dormant content script that only responds when popup asks or when state changes.
// This has absolutely ZERO DOM injection and ZERO click event listeners.

let currentDisneyState = false;
let lastDisneyTitle = "";
let lastDisneyId = "";

const cleanTitle = (rawTitle) => {
  if (!rawTitle) return "";
  
  let cleaned = rawTitle.trim();
  if (cleaned.toLowerCase().startsWith("watch ")) {
    cleaned = cleaned.substring(6).trim();
  }
  
  // 1. Remove Unicode directional formatting characters and isolates
  cleaned = cleaned.replace(/[\u200E\u200F\u202A-\u202E\u2066-\u2069]/g, "");
  
  // 2. Strip common brand suffixes for Disney+, MUBI, Prime, Max, Netflix
  const suffixes = [
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

const extractDisneyId = (url) => {
  if (!url) return "";
  const entityMatch = url.match(/entity-([^?#/]+)/);
  if (entityMatch) return entityMatch[1];
  
  const standardMatch = url.match(/(?:movies|video|play)\/(?:[^/]+\/)?([^?#/]+)/);
  return standardMatch ? standardMatch[1] : "";
};

const checkAndSendDisneyState = () => {
  const url = window.location.href;
  const isDisneyMovie = 
    url.includes("/movies/") || 
    url.includes("/video/") || 
    url.includes("/play/") || 
    url.includes("/browse/entity-") || 
    url.includes("/entity-");
  
  if (!isDisneyMovie) {
    if (currentDisneyState) {
      currentDisneyState = false;
      lastDisneyTitle = "";
      lastDisneyId = "";
      chrome.runtime.sendMessage({
        action: "setDisneyBadge",
        text: ""
      });
    }
    return;
  }

  const currentId = extractDisneyId(url);
  let title = "";

  // Attempt to parse title from DOM elements if available
  const h1 = document.querySelector('h1, .video-title, .title-field, img.title-logo, [data-testid="hero-title"]');
  if (h1) {
    title = h1.innerText || h1.textContent || h1.getAttribute('alt') || "";
  }

  // Fallback to document.title
  if (!title && document.title && document.title.toLowerCase() !== "disney+" && document.title.toLowerCase() !== "disneyplus") {
    title = document.title;
  }

  title = cleanTitle(title);

  // Re-use last detected title if we are on the same ID
  if (currentId) {
    if (title) {
      lastDisneyId = currentId;
      lastDisneyTitle = title;
    } else if (currentId === lastDisneyId && lastDisneyTitle) {
      title = lastDisneyTitle;
    } else {
      lastDisneyId = "";
      lastDisneyTitle = "";
    }
  }

  const movieActive = !!title;

  if (movieActive !== currentDisneyState || (movieActive && title !== lastDisneyTitle)) {
    currentDisneyState = movieActive;
    lastDisneyTitle = title;
    
    chrome.runtime.sendMessage({
      action: "setDisneyBadge",
      text: movieActive ? "\u25b6" : ""
    });
  }
};

// Check initially
checkAndSendDisneyState();

// Setup mutation observer to check silently when DOM/title changes
const observer = new MutationObserver(() => {
  checkAndSendDisneyState();
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
  attributes: true
});

// Also check state on pop-up query
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "checkDisneyMovie") {
    checkAndSendDisneyState();
    sendResponse({ movieActive: currentDisneyState, title: lastDisneyTitle });
  }
  return true;
});
