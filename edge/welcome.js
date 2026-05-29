function setSafeHTML(element, htmlString) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, 'text/html');
  element.replaceChildren(...doc.body.childNodes);
}

document.addEventListener('DOMContentLoaded', () => {
  // Apply i18n translations
  const elements = document.querySelectorAll('[data-i18n]');
  elements.forEach(el => {
    const message = chrome.i18n.getMessage(el.getAttribute('data-i18n'));
    if (message) {
      if (el.tagName === 'TITLE') {
        el.textContent = message;
      } else {
        setSafeHTML(el, message);
      }
    }
  });

  // Detect browser for specific instructions
  const isFirefox = navigator.userAgent.toLowerCase().includes('firefox');
  const instructionContainer = document.getElementById('pinInstruction');
  
  if (isFirefox) {
    const firefoxMsg = chrome.i18n.getMessage("pinInstructionFirefox");
    if (firefoxMsg) {
      setSafeHTML(instructionContainer, firefoxMsg);
    } else {
      setSafeHTML(instructionContainer, "Click the <b>Extensions (Puzzle)</b> icon on the toolbar, right-click Letterboxd Search and select <b>'Pin to Toolbar'</b>.");
    }
  } else {
    const chromeMsg = chrome.i18n.getMessage("pinInstructionChrome");
    if (chromeMsg) {
      setSafeHTML(instructionContainer, chromeMsg);
    } else {
      setSafeHTML(instructionContainer, "Click the <b>Puzzle (Extensions)</b> icon on the toolbar and click the <b>Pin</b> icon next to Letterboxd Search.");
    }
  }

  // Close button functionality
  document.getElementById('closeBtn').addEventListener('click', () => {
    window.close();
  });
});
