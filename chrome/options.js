function localizeHtmlPage() {
  document.getElementById('optTitle').innerText = chrome.i18n.getMessage("optTitle") || "Settings";
  document.getElementById('optHeading').innerText = chrome.i18n.getMessage("optHeading") || "Extension Settings";
  document.getElementById('optLbLabel').innerText = chrome.i18n.getMessage("optLbLabel") || "Letterboxd Button Behavior";
  document.getElementById('optLbDesc').textContent = chrome.i18n.getMessage("optLbDesc") || "Open Letterboxd page in a new tab.";
  document.getElementById('optCtxLabel').innerText = chrome.i18n.getMessage("optCtxLabel") || "Context Menu Behavior";
  document.getElementById('optCtxDesc').textContent = chrome.i18n.getMessage("optCtxDesc") || "Open searches silently in the background.";
  document.getElementById('optHistoryLabel').innerText = chrome.i18n.getMessage("saveHistoryLabel") || "Save Search History";
  document.getElementById('optHistoryDesc').textContent = chrome.i18n.getMessage("optHistoryDesc") || "Your search history is saved locally on this browser and never sent to any servers.";
  document.getElementById('optGoogleLabel').innerText = chrome.i18n.getMessage("optGoogleLabel") || "Google Search Integration";
  document.getElementById('optGoogleDesc').textContent = chrome.i18n.getMessage("optGoogleDesc") || "Show Letterboxd icon next to IMDb links on Google.";
  document.getElementById('optShowIconImdbLabel').innerText = chrome.i18n.getMessage("optShowIconImdbLabel") || "IMDb SayfasÄ±nda Letterboxd Ä°konunu GÃ¶ster";
  document.getElementById('optGoogleNewTabLabel').innerText = chrome.i18n.getMessage("optGoogleNewTabLabel") || "Google'da Letterboxd Butonu DavranÄ±ÅŸÄ±";
  document.getElementById('optGoogleNewTabDesc').textContent = chrome.i18n.getMessage("optGoogleNewTabDesc") || "Google'daki Letterboxd ikonuna tÄ±kladÄ±ÄŸÄ±nÄ±zda sayfayÄ± her zaman yeni sekmede aÃ§ar.";
  document.getElementById('optAutoRedirectLabel').innerText = chrome.i18n.getMessage("optAutoRedirectLabel") || "Auto-Redirect (Streaming & IMDb)";
  document.getElementById('optAutoRedirectDesc').textContent = chrome.i18n.getMessage("optAutoRedirectDesc") || "Automatically redirect to Letterboxd instead of showing the popup on streaming/IMDb pages.";
  document.getElementById('saveBtn').innerText = chrome.i18n.getMessage("optSaveBtn") || "Save Settings";

  const uiLang = chrome.i18n.getUILanguage() || 'en-US';
  const addonLink = document.getElementById('addonLink');
  if (addonLink) {
    if (navigator.userAgent.includes("Firefox")) {
      addonLink.href = 'https://addons.mozilla.org/' + uiLang + '/firefox/addon/letterboxd-integration/';
    } else {
      addonLink.style.display = 'none'; // Şimdilik sadece Firefox için gösteriyoruz
    }
    addonLink.title = chrome.i18n.getMessage("optRateExtension") || "Rate on Firefox Add-ons";
  }
}

// VarsayÄ±lan ayarlarÄ± geri yÃ¼kle
function restoreOptions() {
  localizeHtmlPage();
  chrome.storage.sync.get({
    showIconOnImdb: true,
    lbNewTab: true,
    googleNewTab: true,
    contextMenuBgTab: false,
    googleIntegration: true,
    saveHistory: true,
    autoRedirectStreaming: false
  }, function(items) {
    document.getElementById('showIconOnImdb').checked = items.showIconOnImdb;
    document.getElementById('lbNewTab').checked = items.lbNewTab;
    document.getElementById('googleNewTab').checked = items.googleNewTab;
    document.getElementById('contextMenuBgTab').checked = items.contextMenuBgTab;
    document.getElementById('googleIntegration').checked = items.googleIntegration;
    document.getElementById('saveHistory').checked = items.saveHistory;
    document.getElementById('autoRedirectStreaming').checked = items.autoRedirectStreaming;

    // ArayÃ¼z gÃ¶rÃ¼nÃ¼rlÃ¼ÄŸÃ¼nÃ¼ gÃ¼ncelle
    document.getElementById('showIconOnImdb').dispatchEvent(new Event('change'));
    document.getElementById('googleIntegration').dispatchEvent(new Event('change'));
  });
}

// AyarlarÄ± kaydet
function saveOptions() {
  const showIconOnImdb = document.getElementById('showIconOnImdb').checked;
  const lbNewTab = document.getElementById('lbNewTab').checked;
  const googleNewTab = document.getElementById('googleNewTab').checked;
  const contextMenuBgTab = document.getElementById('contextMenuBgTab').checked;
  const googleIntegration = document.getElementById('googleIntegration').checked;
  const saveHistory = document.getElementById('saveHistory').checked;
  const autoRedirectStreaming = document.getElementById('autoRedirectStreaming').checked;

  chrome.storage.sync.set({
    showIconOnImdb: showIconOnImdb,
    lbNewTab: lbNewTab,
    googleNewTab: googleNewTab,
    contextMenuBgTab: contextMenuBgTab,
    googleIntegration: googleIntegration,
    saveHistory: saveHistory,
    autoRedirectStreaming: autoRedirectStreaming
  }, function() {
    const status = document.getElementById('status');
    status.textContent = chrome.i18n.getMessage("optSaved") || 'Settings saved!';
    status.classList.add('show');
    setTimeout(function() {
      status.classList.remove('show');
      setTimeout(function(){ status.textContent = ''; }, 300);
    }, 2000);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  restoreOptions();

  const toggleVisibility = (checkboxId, groupId) => {
    const checkbox = document.getElementById(checkboxId);
    const group = document.getElementById(groupId);
    checkbox.addEventListener('change', () => {
      group.style.display = checkbox.checked ? 'block' : 'none';
    });
  };

  toggleVisibility('showIconOnImdb', 'lbNewTabGroup');
  toggleVisibility('googleIntegration', 'googleNewTabGroup');
});

document.getElementById('saveBtn').addEventListener('click', saveOptions);





