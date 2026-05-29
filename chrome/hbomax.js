// dormant content script that only responds when popup asks or when state changes.
// This has absolutely ZERO DOM injection and ZERO click event listeners.

let currentHboState = false;
let lastHboTitle = "";
let lastHboId = "";

const cleanTitle = (rawTitle) => {
  if (!rawTitle) return "";
  
  // 1. Remove Unicode directional formatting characters and isolates
  // U+2066 to U+2069, U+200E, U+200F, U+202A to U+202E
  let cleaned = rawTitle.replace(/[\u200E\u200F\u202A-\u202E\u2066-\u2069]/g, "");
  
  // 2. Strip common brand suffixes for Max/HBO Max and Netflix
  // Match " • HBO Max", " • Max", " | HBO Max", " | Max", " - HBO Max", " - Max"
  const suffixes = [
    /\s*[•|–-]\s*HBO\s*Max\s*$/i,
    /\s*[•|–-]\s*Max\s*$/i,
    /\s*[•|–-]\s*Netflix\s*$/i
  ];
  
  for (const suffixPattern of suffixes) {
    cleaned = cleaned.replace(suffixPattern, "");
  }
  
  return cleaned.trim();
};

const extractHboId = (url) => {
  if (!url) return "";
  // play.hbomax.com/movie/urn:hbo:movie:GX9... or play.hbomax.com/video/watch/ID
  const match = url.match(/(?:movie|video\/watch)\/([^?#/]+)/);
  return match ? match[1] : "";
};

const checkAndSendHboState = () => {
  const url = window.location.href;
  const isHboMovie = 
    url.includes("/movie/") || 
    url.includes("/movies/") || 
    url.includes("/video/watch/");
  
  if (!isHboMovie) {
    if (currentHboState) {
      currentHboState = false;
      lastHboTitle = "";
      lastHboId = "";
      chrome.runtime.sendMessage({
        action: "setMaxBadge",
        text: ""
      });
    }
    return;
  }

  const currentId = extractHboId(url);
  let title = "";

  // Attempt to parse title from DOM elements if available
  const h1 = document.querySelector('h1, [data-testid="player-metadata-title"], .player-metadata-title');
  if (h1) {
    title = h1.innerText || h1.textContent || "";
  }

  // Fallback to document.title
  if (!title && document.title && document.title.toLowerCase() !== "max" && document.title.toLowerCase() !== "hbo max") {
    let docTitle = document.title;
    const separators = [" |", " -", " –"];
    for (const separator of separators) {
      const idx = docTitle.indexOf(separator);
      if (idx !== -1) {
        docTitle = docTitle.substring(0, idx);
        break;
      }
    }
    title = docTitle;
  }

  title = cleanTitle(title);

  // Re-use last detected title if we are on the same ID
  if (currentId) {
    if (title) {
      lastHboId = currentId;
      lastHboTitle = title;
    } else if (currentId === lastHboId && lastHboTitle) {
      title = lastHboTitle;
    } else {
      lastHboId = "";
      lastHboTitle = "";
    }
  }

  const movieActive = !!title;

  if (movieActive !== currentHboState || (movieActive && title !== lastHboTitle)) {
    currentHboState = movieActive;
    lastHboTitle = title;
    
    chrome.runtime.sendMessage({
      action: "setMaxBadge",
      text: movieActive ? "\u25b6" : ""
    });
  }
};

// Check initially
checkAndSendHboState();

// Setup mutation observer to check silently when DOM/title changes
const observer = new MutationObserver(() => {
  checkAndSendHboState();
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
  attributes: true
});

// Also check state on pop-up query
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "checkHboMaxMovie") {
    checkAndSendHboState();
    sendResponse({ movieActive: currentHboState, title: lastHboTitle });
  }
  return true;
});
