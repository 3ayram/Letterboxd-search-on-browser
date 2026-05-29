// dormant content script that only responds when popup asks or when modal state changes.
// This has absolutely ZERO DOM injection and ZERO click event listeners on Netflix,
// ensuring the Netflix pages remain 100% clickable and unmodified.

let currentModalState = false;
let lastDetectedTitle = "";
let lastDetectedId = "";

const cleanTitle = (rawTitle) => {
  if (!rawTitle) return "";
  
  // 1. Remove Unicode directional formatting characters and isolates
  // U+2066 to U+2069, U+200E, U+200F, U+202A to U+202E
  let cleaned = rawTitle.replace(/[\u200E\u200F\u202A-\u202E\u2066-\u2069]/g, "");
  
  // 2. Strip common brand suffixes for Max/HBO Max and Netflix
  // Match " • HBO Max", " • Max", " | HBO Max", " | Max", " - HBO Max", " - Max", " - Netflix"
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

const extractNetflixId = (url) => {
  if (!url) return "";
  const matchWatchTitle = url.match(/(?:title|watch)\/(\d+)/);
  if (matchWatchTitle) {
    return matchWatchTitle[1];
  }
  const matchJbv = url.match(/[?&]jbv=(\d+)/);
  if (matchJbv) {
    return matchJbv[1];
  }
  return "";
};

const checkAndSendState = () => {
  const url = window.location.href;
  if (url.includes("/genre/83")) {
    if (currentModalState) {
      currentModalState = false;
      lastDetectedTitle = "";
      lastDetectedId = "";
      chrome.runtime.sendMessage({
        action: "setNetflixBadge",
        text: ""
      });
    }
    return;
  }

  const currentId = extractNetflixId(url);

  const containers = document.querySelectorAll(
    '.previewModal--detailsMetadata-left, .previewModal-detailsMetadata-left, .videoMetadata--container, [data-uia="videoMetadata--container"]'
  );
  
  let modalOpen = false;
  let title = "";

  if (containers.length > 0) {
    for (const container of containers) {
      const context = container.closest('.previewModal--container, [data-uia="previewModal"], .jawbone-container, .about-wrapper, .pane-content') || document;
      
      const logoEl = context.querySelector('[data-uia="title-logo"], .title-logo, .previewModal-header-logo, img.previewModal-title, img[alt][src*="logo"]');
      if (logoEl) {
        title = logoEl.getAttribute('alt') || logoEl.innerText || "";
      }
      
      if (!title) {
        const headingEl = context.querySelector('.previewModal--player-title, [data-uia="previewModal--player-title"], h1, h2, .jawbone-title-link, .title-title');
        if (headingEl) {
          title = headingEl.innerText || headingEl.textContent || "";
        }
      }
      
      title = title.trim();
      if (title) {
        modalOpen = true;
        break;
      }
    }
  }

  // Fallback to title if URL indicates title details or watch page
  if (!title && document.title && document.title.toLowerCase() !== "netflix") {
    if (url.includes("/title/") || url.includes("/watch/") || url.includes("jbv=")) {
      let docTitle = document.title;
      if (docTitle.toLowerCase().startsWith("watch ")) {
        docTitle = docTitle.substring(6);
      }
      const idx = docTitle.indexOf('|');
      if (idx !== -1) {
        docTitle = docTitle.substring(0, idx);
      }
      const idxDash = docTitle.indexOf('-');
      if (idxDash !== -1) {
        docTitle = docTitle.substring(0, idxDash);
      }
      title = docTitle;
    }
  }

  title = cleanTitle(title);
  if (title) {
    modalOpen = true;
  }

  // Re-use last detected title if we are on the same movie ID (e.g. transitioned from browse to watch)
  if (currentId) {
    if (title) {
      lastDetectedId = currentId;
      lastDetectedTitle = title;
    } else if (currentId === lastDetectedId && lastDetectedTitle) {
      title = lastDetectedTitle;
      modalOpen = true;
    } else {
      // Different ID and no title found
      lastDetectedId = "";
      lastDetectedTitle = "";
    }
  } else {
    // No movie ID present in URL (e.g. user went back to generic browse page)
    lastDetectedId = "";
    lastDetectedTitle = "";
  }

  // If state changed, send message to background to update toolbar badge
  if (modalOpen !== currentModalState || (modalOpen && title !== lastDetectedTitle)) {
    currentModalState = modalOpen;
    lastDetectedTitle = title;
    
    chrome.runtime.sendMessage({
      action: "setNetflixBadge",
      text: modalOpen ? "\u25b6" : ""
    });
  }
};

// Check modal state initially
checkAndSendState();

// Setup mutation observer to check silently when DOM changes (extremely lightweight, no enjection)
const observer = new MutationObserver(() => {
  checkAndSendState();
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
  attributes: true,
  attributeFilter: ['class', 'data-uia']
});

// Also check state on pop-up query
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "checkNetflixModal") {
    const url = window.location.href;
    if (url.includes("/genre/83")) {
      sendResponse({ modalOpen: false, title: "" });
      return true;
    }
    // Force recheck
    checkAndSendState();
    
    sendResponse({ modalOpen: currentModalState, title: lastDetectedTitle });
  }
  return true;
});
