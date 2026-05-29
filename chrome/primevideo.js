// dormant content script that only responds when popup asks or when state changes.
// This has absolutely ZERO DOM injection and ZERO click event listeners.

let currentPrimeState = false;
let lastPrimeTitle = "";
let lastPrimeId = "";

const cleanTitle = (rawTitle) => {
  if (!rawTitle) return "";
  
  // 1. Remove Unicode directional formatting characters and isolates
  let cleaned = rawTitle.replace(/[\u200E\u200F\u202A-\u202E\u2066-\u2069]/g, "");
  
  // 2. Strip common brand suffixes for Prime Video, Max, Netflix
  const suffixes = [
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

const extractPrimeId = (url) => {
  if (!url) return "";
  const match = url.match(/(?:detail|watch|gp\/video\/detail)\/([^?#/]+)/);
  return match ? match[1] : "";
};

const checkAndSendPrimeState = () => {
  const url = window.location.href;
  const isPrimeVideo = url.includes("/detail/") || url.includes("/watch/") || url.includes("/gp/video/detail/");
  
  if (!isPrimeVideo) {
    if (currentPrimeState) {
      currentPrimeState = false;
      lastPrimeTitle = "";
      lastPrimeId = "";
      chrome.runtime.sendMessage({
        action: "setPrimeBadge",
        text: ""
      });
    }
    return;
  }

  const currentId = extractPrimeId(url);
  let title = "";

  // Attempt to parse title from DOM elements if available
  const h1 = document.querySelector('h1, [data-automation-id="title"], .pv-play-metadata__title');
  if (h1) {
    title = h1.innerText || h1.textContent || "";
  }

  // Fallback to document.title
  if (!title && document.title && document.title.toLowerCase() !== "prime video") {
    title = document.title;
  }

  title = cleanTitle(title);

  // Re-use last detected title if we are on the same ID
  if (currentId) {
    if (title) {
      lastPrimeId = currentId;
      lastPrimeTitle = title;
    } else if (currentId === lastPrimeId && lastPrimeTitle) {
      title = lastPrimeTitle;
    } else {
      lastPrimeId = "";
      lastPrimeTitle = "";
    }
  }

  const movieActive = !!title;

  if (movieActive !== currentPrimeState || (movieActive && title !== lastPrimeTitle)) {
    currentPrimeState = movieActive;
    lastPrimeTitle = title;
    
    chrome.runtime.sendMessage({
      action: "setPrimeBadge",
      text: movieActive ? "\u25b6" : ""
    });
  }
};

// Check initially
checkAndSendPrimeState();

// Setup mutation observer to check silently when DOM/title changes
const observer = new MutationObserver(() => {
  checkAndSendPrimeState();
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
  attributes: true
});

// Also check state on pop-up query
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "checkPrimeVideoMovie") {
    checkAndSendPrimeState();
    sendResponse({ movieActive: currentPrimeState, title: lastPrimeTitle });
  }
  return true;
});
