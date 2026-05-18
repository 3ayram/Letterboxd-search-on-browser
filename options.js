function localizeHtmlPage() {
  document.getElementById('optTitle').innerText = chrome.i18n.getMessage("optTitle") || "Settings";
  document.getElementById('optHeading').innerText = chrome.i18n.getMessage("optHeading") || "Extension Settings";
  document.getElementById('optImdbLabel').innerText = chrome.i18n.getMessage("optImdbLabel") || "IMDb Button Behavior";
  document.getElementById('optImdbDesc').textContent = chrome.i18n.getMessage("optImdbDesc") || "Open IMDb page in a new tab.";
  document.getElementById('optLbLabel').innerText = chrome.i18n.getMessage("optLbLabel") || "Letterboxd Button Behavior";
  document.getElementById('optLbDesc').textContent = chrome.i18n.getMessage("optLbDesc") || "Open Letterboxd page in a new tab.";
  document.getElementById('optCtxLabel').innerText = chrome.i18n.getMessage("optCtxLabel") || "Context Menu Behavior";
  document.getElementById('optCtxDesc').textContent = chrome.i18n.getMessage("optCtxDesc") || "Open searches silently in the background.";
  document.getElementById('optGoogleLabel').innerText = chrome.i18n.getMessage("optGoogleLabel") || "Google Search Integration";
  document.getElementById('optGoogleDesc').textContent = chrome.i18n.getMessage("optGoogleDesc") || "Show Letterboxd icon next to IMDb links on Google.";
  document.getElementById('saveBtn').innerText = chrome.i18n.getMessage("optSaveBtn") || "Save Settings";
}

// Varsayılan ayarları geri yükle
function restoreOptions() {
  localizeHtmlPage();
  chrome.storage.sync.get({
    imdbNewTab: true,
    lbNewTab: true,
    contextMenuBgTab: false,
    googleIntegration: true
  }, function(items) {
    document.getElementById('imdbNewTab').checked = items.imdbNewTab;
    document.getElementById('lbNewTab').checked = items.lbNewTab;
    document.getElementById('contextMenuBgTab').checked = items.contextMenuBgTab;
    document.getElementById('googleIntegration').checked = items.googleIntegration;
  });
}

// Ayarları kaydet
function saveOptions() {
  const imdbNewTab = document.getElementById('imdbNewTab').checked;
  const lbNewTab = document.getElementById('lbNewTab').checked;
  const contextMenuBgTab = document.getElementById('contextMenuBgTab').checked;
  const googleIntegration = document.getElementById('googleIntegration').checked;

  chrome.storage.sync.set({
    imdbNewTab: imdbNewTab,
    lbNewTab: lbNewTab,
    contextMenuBgTab: contextMenuBgTab,
    googleIntegration: googleIntegration
  }, function() {
    const status = document.getElementById('status');
    status.textContent = chrome.i18n.getMessage("optSaved") || 'Settings saved!';
    setTimeout(function() {
      status.textContent = '';
    }, 2000);
  });
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('saveBtn').addEventListener('click', saveOptions);
