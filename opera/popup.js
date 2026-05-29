document.addEventListener('DOMContentLoaded', function() {
  const cleanTitle = (rawTitle) => {
    if (!rawTitle) return "";
    let cleaned = rawTitle.trim();
    
    // Remove parentheses at the end of the title recursively (e.g. "(1981-2026)", "(I)")
    while (/\s*\([^)]*\)\s*$/.test(cleaned)) {
      cleaned = cleaned.replace(/\s*\([^)]*\)\s*$/, "").trim();
    }
    
    if (cleaned.toLowerCase().startsWith("watch ")) {
      cleaned = cleaned.substring(6).trim();
    }
    cleaned = cleaned.replace(/[\u200E\u200F\u202A-\u202E\u2066-\u2069]/g, "");
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

  const searchInput = document.getElementById('searchInput');
  const searchBtn   = document.getElementById('searchBtn');
  const settingsBtn = document.getElementById('settingsBtn');
  const historyToggleText = document.getElementById('historyToggleText');
  const mainView    = document.getElementById('mainView');
  const settingsView = document.getElementById('settingsView');
  const backBtn     = document.getElementById('backBtn');
  const fullSettingsLink = document.getElementById('fullSettingsLink');
  const toggleAutoRedirect = document.getElementById('toggleAutoRedirect');

  // i18n
  document.getElementById('popupTitle').innerText    = chrome.i18n.getMessage('popupTitle')       || 'Letterboxd Arama';
  searchInput.placeholder                            = chrome.i18n.getMessage('popupPlaceholder') || 'Film adÄ± yazÄ±n...';
  searchBtn.innerText                                = chrome.i18n.getMessage('popupSearchBtn')   || 'Ara';
  document.getElementById('settingsTitle').innerText    = chrome.i18n.getMessage('optHeading')          || 'Ayarlar';
  document.getElementById('labelImdbRating').innerText  = chrome.i18n.getMessage('popupImdbRatingLabel') || 'IMDb Rating (Letterboxd)';
  document.getElementById('labelGoogle').innerText      = chrome.i18n.getMessage('popupGoogleLabel')     || 'Google Integration';
  document.getElementById('labelImdbIcon').innerText    = chrome.i18n.getMessage('popupImdbIconLabel')   || 'Letterboxd Icon on IMDb';
  document.getElementById('labelAutoRedirect').innerText = chrome.i18n.getMessage('labelAutoRedirect') || 'Direkt Yönlendir (Streaming/IMDb)';
  fullSettingsLink.innerText                            = (chrome.i18n.getMessage('popupAllSettings') || 'All Settings') + ' \u2192';

  // Ayarlar toggle'larÄ±nÄ± yÃ¼kle
  const toggleImdbRating = document.getElementById('toggleImdbRating');
  const toggleGoogle     = document.getElementById('toggleGoogle');
  const toggleImdbIcon   = document.getElementById('toggleImdbIcon');

  chrome.storage.sync.get(
    { imdbRatingOnLetterboxd: true, googleIntegration: true, showIconOnImdb: true, autoRedirectStreaming: false },
    function(items) {
      toggleImdbRating.checked = items.imdbRatingOnLetterboxd;
      toggleGoogle.checked     = items.googleIntegration;
      toggleImdbIcon.checked   = items.showIconOnImdb;
      toggleAutoRedirect.checked = items.autoRedirectStreaming;
    }
  );

  // Toggle deÄŸiÅŸince kaydet
  toggleImdbRating.addEventListener('change', function() {
    chrome.storage.sync.set({ imdbRatingOnLetterboxd: this.checked });
  });
  toggleGoogle.addEventListener('change', function() {
    chrome.storage.sync.set({ googleIntegration: this.checked });
  });
  toggleImdbIcon.addEventListener('change', function() {
    chrome.storage.sync.set({ showIconOnImdb: this.checked });
  });
  toggleAutoRedirect.addEventListener('change', function() {
    chrome.storage.sync.set({ autoRedirectStreaming: this.checked });
  });

  // Ayarlar paneli aÃ§/kapat
  settingsBtn.addEventListener('click', function() {
    mainView.style.display    = 'none';
    settingsView.style.display = 'block';
    searchInput.blur();
  });

  backBtn.addEventListener('click', function() {
    settingsView.style.display = 'none';
    mainView.style.display    = 'block';
    searchInput.focus();
  });

  // TÃ¼m ayarlar sayfasÄ±nÄ± yeni sekmede aÃ§
  fullSettingsLink.addEventListener('click', function() {
    if (chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else {
      window.open(chrome.runtime.getURL('options.html'));
    }
    window.close();
  });

    document.getElementById('recentTitle').innerText = chrome.i18n.getMessage('recentSearches') || 'Son Aramalar';
  document.getElementById('clearHistoryBtn').innerText = chrome.i18n.getMessage('clearHistory') || 'Temizle';
  if(historyToggleText) historyToggleText.innerText = chrome.i18n.getMessage('recentSearches') || 'Geçmiş';

  const recentContainer = document.getElementById('recentSearchesContainer');
  const recentList = document.getElementById('recentList');
  const clearHistoryBtn = document.getElementById('clearHistoryBtn');

  function renderHistory() {
    chrome.storage.sync.get({ saveHistory: true }, function(syncItems) {
      if (!syncItems.saveHistory) {
        recentContainer.style.display = 'none';
        return;
      }
      
      chrome.storage.local.get({ recentSearches: [] }, function(localItems) {
        const searches = localItems.recentSearches;
        if (searches.length > 0) {
          // recentContainer.style.display = 'block'; // Do not auto show
          recentList.innerHTML = '';
          searches.forEach(term => {
            const tag = document.createElement('div');
            tag.className = 'history-tag';
            tag.title = term;
            tag.textContent = term;
            tag.addEventListener('click', () => {
              searchInput.value = term;
              performSearch();
            });
            recentList.appendChild(tag);
          });
        } else {
          recentContainer.style.display = 'none';
        }
      });
    });
  }

  renderHistory();
  
  historyToggleText.addEventListener('click', function() {
    if (recentContainer.style.display === 'none' || recentContainer.style.display === '') {
      recentContainer.style.display = 'block';
    } else {
      recentContainer.style.display = 'none';
    }
  });

  clearHistoryBtn.addEventListener('click', function() {
    chrome.storage.local.set({ recentSearches: [] }, function() {
      renderHistory();
  
  historyToggleText.addEventListener('click', function() {
    if (recentContainer.style.display === 'none' || recentContainer.style.display === '') {
      recentContainer.style.display = 'block';
    } else {
      recentContainer.style.display = 'none';
    }
  });
    });
  });

  // Export saveSearch logic for use inside performSearch
  function saveSearchHistory(query) {
    chrome.storage.sync.get({ saveHistory: true }, function(syncItems) {
      if (syncItems.saveHistory) {
        chrome.storage.local.get({ recentSearches: [] }, function(localItems) {
          let searches = localItems.recentSearches;
          // Remove if exists
          searches = searches.filter(t => t.toLowerCase() !== query.toLowerCase());
          // Add to front
          searches.unshift(query);
          // Keep only last 10
          if (searches.length > 10) searches = searches.slice(0, 10);
          
          chrome.storage.local.set({ recentSearches: searches });
        });
      }
    });
  }

  // --- Arama ---
  function performSearch() {
    const query = searchInput.value.trim().replace(/\s+/g, ' ');
    if (query) {
      saveSearchHistory(query);
      const url = 'https://letterboxd.com/search/' + encodeURI(query).replace(/%5B/g, '[').replace(/%5D/g, ']');
      chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        if (tabs && tabs.length > 0) {
          chrome.tabs.create({ url: url, index: tabs[0].index + 1 });
        } else {
          chrome.tabs.create({ url: url });
        }
        window.close();
      });
    }
  }

  searchBtn.addEventListener('click', performSearch);
  searchInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') performSearch();
  });

  function showPopupUI() {
    document.body.style.opacity = '1';
  }

  const performAutoRedirectOr = (detectedTitle, searchUrl, fallbackShowAlertFunc) => {
    chrome.storage.sync.get({ autoRedirectStreaming: false, netflixNewTab: true }, function(items) {
      if (items.autoRedirectStreaming) {
        saveSearchHistory(detectedTitle);
        if (items.netflixNewTab) {
          chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            if (tabs && tabs[0]) {
              chrome.tabs.create({ url: searchUrl, index: tabs[0].index + 1 });
            } else {
              chrome.tabs.create({ url: searchUrl });
            }
            window.close();
          });
        } else {
          chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            if (tabs && tabs[0]) {
              chrome.tabs.update(tabs[0].id, { url: searchUrl });
            }
            window.close();
          });
        }
      } else {
        fallbackShowAlertFunc();
        showPopupUI();
      }
    });
  };

  // --- Netflix Yönlendirme Algılama (İçeriğe dokunmadan, güvenli başlık analizi) ---
  const netflixAlertContainer = document.getElementById('netflixAlertContainer');
  const netflixMovieTitle = document.getElementById('netflixMovieTitle');
  const netflixRedirectBtn = document.getElementById('netflixRedirectBtn');
  const netflixAlertHeading = document.getElementById('netflixAlertHeading');
  const netflixRedirectBtnText = document.getElementById('netflixRedirectBtnText');
  const normalSearchContainer = document.getElementById('normalSearchContainer');
  const headerContainer = document.getElementById('headerContainer');

  if (netflixAlertContainer) {
    // Yerelleştirme (Localization)
    if (netflixAlertHeading) {
      netflixAlertHeading.textContent = chrome.i18n.getMessage("netflixAlertHeading") || "Netflix'te Açık Film";
    }
    if (netflixRedirectBtnText) {
      netflixRedirectBtnText.textContent = chrome.i18n.getMessage("netflixRedirectBtnText") || "Letterboxd'a Yönlendir";
    }

    const maxAlertHeading = document.getElementById('maxAlertHeading');
    const maxRedirectBtnText = document.getElementById('maxRedirectBtnText');
    if (maxAlertHeading) {
      maxAlertHeading.textContent = chrome.i18n.getMessage("maxAlertHeading") || "HBO Max'te Açık Film";
    }
    if (maxRedirectBtnText) {
      maxRedirectBtnText.textContent = chrome.i18n.getMessage("maxRedirectBtnText") || "Letterboxd'a Yönlendir";
    }

    const primeAlertHeading = document.getElementById('primeAlertHeading');
    const primeRedirectBtnText = document.getElementById('primeRedirectBtnText');
    if (primeAlertHeading) {
      primeAlertHeading.textContent = chrome.i18n.getMessage("primeAlertHeading") || "Prime Video'da Açık Film";
    }
    if (primeRedirectBtnText) {
      primeRedirectBtnText.textContent = chrome.i18n.getMessage("primeRedirectBtnText") || "Letterboxd'a Yönlendir";
    }

    const mubiAlertHeading = document.getElementById('mubiAlertHeading');
    const mubiRedirectBtnText = document.getElementById('mubiRedirectBtnText');
    if (mubiAlertHeading) {
      mubiAlertHeading.textContent = chrome.i18n.getMessage("mubiAlertHeading") || "MUBI'de Açık Film";
    }
    if (mubiRedirectBtnText) {
      mubiRedirectBtnText.textContent = chrome.i18n.getMessage("mubiRedirectBtnText") || "Letterboxd'a Yönlendir";
    }

    const disneyAlertHeading = document.getElementById('disneyAlertHeading');
    const disneyRedirectBtnText = document.getElementById('disneyRedirectBtnText');
    if (disneyAlertHeading) {
      disneyAlertHeading.textContent = chrome.i18n.getMessage("disneyAlertHeading") || "Disney+'te Açık Film";
    }
    if (disneyRedirectBtnText) {
      disneyRedirectBtnText.textContent = chrome.i18n.getMessage("disneyRedirectBtnText") || "Letterboxd'a Yönlendir";
    }

    const appleAlertHeading = document.getElementById('appleAlertHeading');
    const appleRedirectBtnText = document.getElementById('appleRedirectBtnText');
    if (appleAlertHeading) {
      appleAlertHeading.textContent = chrome.i18n.getMessage("appleAlertHeading") || "Apple TV+'ta Açık Film";
    }
    if (appleRedirectBtnText) {
      appleRedirectBtnText.textContent = chrome.i18n.getMessage("appleRedirectBtnText") || "Letterboxd'a Yönlendir";
    }

    const imdbAlertHeading = document.getElementById('imdbAlertHeading');
    const imdbRedirectBtnText = document.getElementById('imdbRedirectBtnText');
    if (imdbAlertHeading) {
      imdbAlertHeading.textContent = chrome.i18n.getMessage("imdbAlertHeading") || "IMDb'de Açık Film";
    }
    if (imdbRedirectBtnText) {
      imdbRedirectBtnText.textContent = chrome.i18n.getMessage("imdbRedirectBtnText") || "Letterboxd'a Yönlendir";
    }

    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      if (tabs && tabs[0]) {
        const tab = tabs[0];
        if (tab.url && tab.url.includes("netflix.com")) {
          if (tab.url.includes("/genre/83")) {
            showPopupUI();
            return;
          }
          // Netflix içeriğine dokunmadan, filmlerin açık olduğunu güvenli URL kriterleriyle denetle:
          // 1. /title/ (Detay sayfası)
          // 2. /watch/ (İzleme sayfası)
          // 3. jbv= (Browse/Genre sayfalarında modal açık olduğunu gösteren parametre)
          const isMovieActive = 
            tab.url.includes("/title/") || 
            tab.url.includes("/watch/") || 
            tab.url.includes("jbv=");
          
          if (!isMovieActive) {
            showPopupUI();
            return; // Dizi, kategori veya ana sayfa gezintilerinde işlem yapma
          }

          // Helper to handle the detected title and display the alert
          const handleDetectedTitle = (detectedTitle) => {
            detectedTitle = cleanTitle(detectedTitle);
            if (detectedTitle) {
              const searchUrl = 'https://letterboxd.com/search/films/' + encodeURIComponent(detectedTitle);
              performAutoRedirectOr(detectedTitle, searchUrl, () => {
                netflixMovieTitle.textContent = detectedTitle;
                netflixMovieTitle.title = detectedTitle;
                netflixAlertContainer.style.display = 'block';
                if (headerContainer) {
                  headerContainer.style.display = 'none';
                }
                if (normalSearchContainer) {
                  normalSearchContainer.style.display = 'none';
                }

                netflixRedirectBtn.onclick = function(e) {
                  e.preventDefault();
                  saveSearchHistory(detectedTitle);
                  chrome.storage.sync.get({ netflixNewTab: true }, function(items) {
                    if (items.netflixNewTab) {
                      chrome.tabs.create({ url: searchUrl, index: tab.index + 1 });
                    } else {
                      chrome.tabs.update(tab.id, { url: searchUrl });
                    }
                    window.close();
                  });
                };
              });
            } else {
              showPopupUI();
            }
          };

          // 1. Önce uykuda/arka planda çalışan içerik betiğine sorup DOM'dan modal bilgisini okumaya çalışır (aktif sekme izniyle)
          chrome.tabs.sendMessage(tab.id, { action: "checkNetflixModal" }, function(response) {
            if (chrome.runtime.lastError || !response || !response.modalOpen || !response.title) {
              // 2. Eğer içerik betiği henüz yüklenmemişse veya yanıt alınamazsa, yedek plan olarak sekme başlığını çözümler
              let detectedTitle = "";
              let docTitle = tab.title || "";
              
              if (docTitle) {
                const lowerTitle = docTitle.toLowerCase().trim();
                const isGenericNetflix = 
                  lowerTitle === "netflix" || 
                  lowerTitle.startsWith("netflix -") || 
                  lowerTitle.startsWith("netflix –") || 
                  lowerTitle.includes("browse") || 
                  lowerTitle.includes("ana sayfa") || 
                  lowerTitle.includes("home");
                
                if (!isGenericNetflix) {
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
                  detectedTitle = docTitle.trim();
                }
              }
              handleDetectedTitle(detectedTitle);
            } else {
              handleDetectedTitle(response.title);
            }
          });
        } else if (tab.url && (tab.url.includes("hbomax.com") || tab.url.includes("max.com"))) {
          const isHboMovie = 
            tab.url.includes("/movie/") || 
            tab.url.includes("/movies/") || 
            tab.url.includes("/video/watch/");
          if (!isHboMovie) {
            showPopupUI();
            return;
          }

          const handleHboTitle = (detectedTitle) => {
            detectedTitle = cleanTitle(detectedTitle);
            if (detectedTitle) {
              const searchUrl = 'https://letterboxd.com/search/films/' + encodeURIComponent(detectedTitle);
              performAutoRedirectOr(detectedTitle, searchUrl, () => {
                const maxMovieTitle = document.getElementById('maxMovieTitle');
                const maxAlertContainer = document.getElementById('maxAlertContainer');
                const maxRedirectBtn = document.getElementById('maxRedirectBtn');
                
                if (maxMovieTitle && maxAlertContainer && maxRedirectBtn) {
                  maxMovieTitle.textContent = detectedTitle;
                  maxMovieTitle.title = detectedTitle;
                  maxAlertContainer.style.display = 'block';
                  if (headerContainer) {
                    headerContainer.style.display = 'none';
                  }
                  if (normalSearchContainer) {
                    normalSearchContainer.style.display = 'none';
                  }

                  maxRedirectBtn.onclick = function(e) {
                    e.preventDefault();
                    saveSearchHistory(detectedTitle);
                    chrome.storage.sync.get({ netflixNewTab: true }, function(items) {
                      if (items.netflixNewTab) {
                        chrome.tabs.create({ url: searchUrl, index: tab.index + 1 });
                      } else {
                        chrome.tabs.update(tab.id, { url: searchUrl });
                      }
                      window.close();
                    });
                  };
                }
              });
            } else {
              showPopupUI();
            }
          };

          chrome.tabs.sendMessage(tab.id, { action: "checkHboMaxMovie" }, function(response) {
            if (chrome.runtime.lastError || !response || !response.movieActive || !response.title) {
              let detectedTitle = "";
              let docTitle = tab.title || "";
              if (docTitle) {
                const lowerTitle = docTitle.toLowerCase().trim();
                if (lowerTitle !== "max" && lowerTitle !== "hbo max") {
                  const separators = [" |", " -", " –"];
                  for (const separator of separators) {
                    const idx = docTitle.indexOf(separator);
                    if (idx !== -1) {
                      docTitle = docTitle.substring(0, idx);
                      break;
                    }
                  }
                  detectedTitle = docTitle.trim();
                }
              }
              handleHboTitle(detectedTitle);
            } else {
              handleHboTitle(response.title);
            }
          });
        } else if (tab.url && tab.url.includes("primevideo.com")) {
          const isPrimeMovie = 
            tab.url.includes("/detail/") || 
            tab.url.includes("/watch/") || 
            tab.url.includes("/gp/video/detail/");
          if (!isPrimeMovie) {
            showPopupUI();
            return;
          }

          const handlePrimeTitle = (detectedTitle) => {
            detectedTitle = cleanTitle(detectedTitle);
            if (detectedTitle) {
              const searchUrl = 'https://letterboxd.com/search/films/' + encodeURIComponent(detectedTitle);
              performAutoRedirectOr(detectedTitle, searchUrl, () => {
                const primeMovieTitle = document.getElementById('primeMovieTitle');
                const primeAlertContainer = document.getElementById('primeAlertContainer');
                const primeRedirectBtn = document.getElementById('primeRedirectBtn');
                
                if (primeMovieTitle && primeAlertContainer && primeRedirectBtn) {
                  primeMovieTitle.textContent = detectedTitle;
                  primeMovieTitle.title = detectedTitle;
                  primeAlertContainer.style.display = 'block';
                  if (headerContainer) {
                    headerContainer.style.display = 'none';
                  }
                  if (normalSearchContainer) {
                    normalSearchContainer.style.display = 'none';
                  }

                  primeRedirectBtn.onclick = function(e) {
                    e.preventDefault();
                    saveSearchHistory(detectedTitle);
                    chrome.storage.sync.get({ netflixNewTab: true }, function(items) {
                      if (items.netflixNewTab) {
                        chrome.tabs.create({ url: searchUrl, index: tab.index + 1 });
                      } else {
                        chrome.tabs.update(tab.id, { url: searchUrl });
                      }
                      window.close();
                    });
                  };
                }
              });
            } else {
              showPopupUI();
            }
          };

          chrome.tabs.sendMessage(tab.id, { action: "checkPrimeVideoMovie" }, function(response) {
            if (chrome.runtime.lastError || !response || !response.movieActive || !response.title) {
              let detectedTitle = "";
              let docTitle = tab.title || "";
              if (docTitle) {
                const lowerTitle = docTitle.toLowerCase().trim();
                if (lowerTitle !== "prime video") {
                  const separators = [" |", " -", " –", ": "];
                  for (const separator of separators) {
                    const idx = docTitle.indexOf(separator);
                    if (idx !== -1) {
                      docTitle = docTitle.substring(0, idx);
                      break;
                    }
                  }
                  detectedTitle = docTitle.trim();
                }
              }
              handlePrimeTitle(detectedTitle);
            } else {
              handlePrimeTitle(response.title);
            }
          });
        } else if (tab.url && tab.url.includes("mubi.com")) {
          const isMubiMovie = 
            tab.url.includes("/films/") || 
            tab.url.includes("/showing/") || 
            tab.url.includes("/watch/") || 
            tab.url.includes("/play");
          if (!isMubiMovie) {
            showPopupUI();
            return;
          }

          const handleMubiTitle = (detectedTitle) => {
            detectedTitle = cleanTitle(detectedTitle);
            if (detectedTitle) {
              const searchUrl = 'https://letterboxd.com/search/films/' + encodeURIComponent(detectedTitle);
              performAutoRedirectOr(detectedTitle, searchUrl, () => {
                const mubiMovieTitle = document.getElementById('mubiMovieTitle');
                const mubiAlertContainer = document.getElementById('mubiAlertContainer');
                const mubiRedirectBtn = document.getElementById('mubiRedirectBtn');
                
                if (mubiMovieTitle && mubiAlertContainer && mubiRedirectBtn) {
                  mubiMovieTitle.textContent = detectedTitle;
                  mubiMovieTitle.title = detectedTitle;
                  mubiAlertContainer.style.display = 'block';
                  if (headerContainer) {
                    headerContainer.style.display = 'none';
                  }
                  if (normalSearchContainer) {
                    normalSearchContainer.style.display = 'none';
                  }

                  mubiRedirectBtn.onclick = function(e) {
                    e.preventDefault();
                    saveSearchHistory(detectedTitle);
                    const searchUrl = 'https://letterboxd.com/search/films/' + encodeURIComponent(detectedTitle);
                    chrome.storage.sync.get({ netflixNewTab: true }, function(items) {
                      if (items.netflixNewTab) {
                        chrome.tabs.create({ url: searchUrl, index: tab.index + 1 });
                      } else {
                        chrome.tabs.update(tab.id, { url: searchUrl });
                      }
                      window.close();
                    });
                  };
                }
              });
            } else {
              showPopupUI();
            }
          };

          chrome.tabs.sendMessage(tab.id, { action: "checkMubiMovie" }, function(response) {
            if (chrome.runtime.lastError || !response || !response.movieActive || !response.title) {
              let detectedTitle = "";
              let docTitle = tab.title || "";
              if (docTitle) {
                const lowerTitle = docTitle.toLowerCase().trim();
                if (lowerTitle !== "mubi") {
                  const separators = [" |", " -", " –"];
                  for (const separator of separators) {
                    const idx = docTitle.indexOf(separator);
                    if (idx !== -1) {
                      docTitle = docTitle.substring(0, idx);
                      break;
                    }
                  }
                  detectedTitle = docTitle.trim();
                }
              }
              handleMubiTitle(detectedTitle);
            } else {
              handleMubiTitle(response.title);
            }
          });
        } else if (tab.url && tab.url.includes("disneyplus.com")) {
          const isDisneyMovie = 
            tab.url.includes("/movies/") || 
            tab.url.includes("/video/") || 
            tab.url.includes("/play/") || 
            tab.url.includes("/browse/entity-") || 
            tab.url.includes("/entity-");
          if (!isDisneyMovie) {
            showPopupUI();
            return;
          }

          const handleDisneyTitle = (detectedTitle) => {
            detectedTitle = cleanTitle(detectedTitle);
            if (detectedTitle) {
              const searchUrl = 'https://letterboxd.com/search/films/' + encodeURIComponent(detectedTitle);
              performAutoRedirectOr(detectedTitle, searchUrl, () => {
                const disneyMovieTitle = document.getElementById('disneyMovieTitle');
                const disneyAlertContainer = document.getElementById('disneyAlertContainer');
                const disneyRedirectBtn = document.getElementById('disneyRedirectBtn');
                
                if (disneyMovieTitle && disneyAlertContainer && disneyRedirectBtn) {
                  disneyMovieTitle.textContent = detectedTitle;
                  disneyMovieTitle.title = detectedTitle;
                  disneyAlertContainer.style.display = 'block';
                  if (headerContainer) {
                    headerContainer.style.display = 'none';
                  }
                  if (normalSearchContainer) {
                    normalSearchContainer.style.display = 'none';
                  }

                  disneyRedirectBtn.onclick = function(e) {
                    e.preventDefault();
                    saveSearchHistory(detectedTitle);
                    const searchUrl = 'https://letterboxd.com/search/films/' + encodeURIComponent(detectedTitle);
                    chrome.storage.sync.get({ netflixNewTab: true }, function(items) {
                      if (items.netflixNewTab) {
                        chrome.tabs.create({ url: searchUrl, index: tab.index + 1 });
                      } else {
                        chrome.tabs.update(tab.id, { url: searchUrl });
                      }
                      window.close();
                    });
                  };
                }
              });
            } else {
              showPopupUI();
            }
          };

          chrome.tabs.sendMessage(tab.id, { action: "checkDisneyMovie" }, function(response) {
            if (chrome.runtime.lastError || !response || !response.movieActive || !response.title) {
              let detectedTitle = "";
              let docTitle = tab.title || "";
              if (docTitle) {
                const lowerTitle = docTitle.toLowerCase().trim();
                if (lowerTitle !== "disney+" && lowerTitle !== "disneyplus") {
                  const separators = [" |", " -", " –"];
                  for (const separator of separators) {
                    const idx = docTitle.indexOf(separator);
                    if (idx !== -1) {
                      docTitle = docTitle.substring(0, idx);
                      break;
                    }
                  }
                  detectedTitle = docTitle.trim();
                }
              }
              handleDisneyTitle(detectedTitle);
            } else {
              handleDisneyTitle(response.title);
            }
          });
        } else if (tab.url && tab.url.includes("tv.apple.com")) {
          const isAppleMovie = 
            tab.url.includes("/movie/") || 
            tab.url.includes("/play/") || 
            tab.url.includes("/player/") || 
            tab.url.includes("/video/") || 
            tab.url.includes("/watch/");
          if (!isAppleMovie) {
            showPopupUI();
            return;
          }

          const handleAppleTitle = (detectedTitle) => {
            detectedTitle = cleanTitle(detectedTitle);
            if (detectedTitle) {
              const searchUrl = 'https://letterboxd.com/search/films/' + encodeURIComponent(detectedTitle);
              performAutoRedirectOr(detectedTitle, searchUrl, () => {
                const appleMovieTitle = document.getElementById('appleMovieTitle');
                const appleAlertContainer = document.getElementById('appleAlertContainer');
                const appleRedirectBtn = document.getElementById('appleRedirectBtn');
                
                if (appleMovieTitle && appleAlertContainer && appleRedirectBtn) {
                  appleMovieTitle.textContent = detectedTitle;
                  appleMovieTitle.title = detectedTitle;
                  appleAlertContainer.style.display = 'block';
                  if (headerContainer) {
                    headerContainer.style.display = 'none';
                  }
                  if (normalSearchContainer) {
                    normalSearchContainer.style.display = 'none';
                  }

                  appleRedirectBtn.onclick = function(e) {
                    e.preventDefault();
                    saveSearchHistory(detectedTitle);
                    chrome.storage.sync.get({ netflixNewTab: true }, function(items) {
                      if (items.netflixNewTab) {
                        chrome.tabs.create({ url: searchUrl, index: tab.index + 1 });
                      } else {
                        chrome.tabs.update(tab.id, { url: searchUrl });
                      }
                      window.close();
                    });
                  };
                }
              });
            } else {
              showPopupUI();
            }
          };

          chrome.tabs.sendMessage(tab.id, { action: "checkAppleMovie" }, function(response) {
            if (chrome.runtime.lastError || !response || !response.movieActive || !response.title) {
              let detectedTitle = "";
              let docTitle = tab.title || "";
              if (docTitle) {
                const lowerTitle = docTitle.toLowerCase().trim();
                if (lowerTitle !== "apple tv" && !lowerTitle.startsWith("apple tv")) {
                  const separators = [" |", " -", " –"];
                  for (const separator of separators) {
                    const idx = docTitle.indexOf(separator);
                    if (idx !== -1) {
                      docTitle = docTitle.substring(0, idx);
                      break;
                    }
                  }
                  detectedTitle = docTitle.trim();
                }
              }
              handleAppleTitle(detectedTitle);
            } else {
              handleAppleTitle(response.title);
            }
          });
        } else if (tab.url && tab.url.includes("imdb.com")) {
          const isImdbActive = tab.url.includes("/title/tt") || tab.url.includes("/name/nm");
          if (!isImdbActive) {
            showPopupUI();
            return;
          }

          const handleImdbTitle = (detectedTitle, imdbId) => {
            detectedTitle = cleanTitle(detectedTitle);
            if (detectedTitle && imdbId) {
              const isPerson = imdbId.startsWith("nm");
              let searchUrl = 'https://letterboxd.com/imdb/' + imdbId;
              if (isPerson) {
                const charMap = {
                  'ş': 's', 'ç': 'c', 'ğ': 'g', 'ü': 'u', 'ö': 'o', 'ı': 'i',
                  'ñ': 'n', 'é': 'e', 'è': 'e', 'á': 'a', 'à': 'a', 'í': 'i', 'ó': 'o', 'ú': 'u',
                  'ä': 'a', 'ë': 'e', 'ï': 'i', 'ö': 'o', 'ü': 'u'
                };
                let slug = detectedTitle.toLowerCase().trim();
                let mapped = "";
                for (let i = 0; i < slug.length; i++) {
                  const char = slug[i];
                  mapped += charMap[char] || char;
                }
                mapped = mapped.replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
                searchUrl = 'https://letterboxd.com/actor/' + mapped + '/';
              }

              performAutoRedirectOr(detectedTitle, searchUrl, () => {
                const imdbMovieTitle = document.getElementById('imdbMovieTitle');
                const imdbAlertContainer = document.getElementById('imdbAlertContainer');
                const imdbRedirectBtn = document.getElementById('imdbRedirectBtn');
                const imdbAlertHeading = document.getElementById('imdbAlertHeading');
                
                if (imdbMovieTitle && imdbAlertContainer && imdbRedirectBtn) {
                  if (imdbAlertHeading) {
                    if (isPerson) {
                      imdbAlertHeading.textContent = chrome.i18n.getMessage("imdbAlertHeadingPerson") || "IMDb'de Açık Sanatçı";
                    } else {
                      imdbAlertHeading.textContent = chrome.i18n.getMessage("imdbAlertHeading") || "IMDb'de Açık Film";
                    }
                  }
                  
                  imdbMovieTitle.textContent = detectedTitle;
                  imdbMovieTitle.title = detectedTitle;
                  imdbAlertContainer.style.display = 'block';
                  if (headerContainer) {
                    headerContainer.style.display = 'none';
                  }
                  if (normalSearchContainer) {
                    normalSearchContainer.style.display = 'none';
                  }

                  imdbRedirectBtn.onclick = function(e) {
                    e.preventDefault();
                    saveSearchHistory(detectedTitle);
                    chrome.storage.sync.get({ netflixNewTab: true }, function(items) {
                      if (items.netflixNewTab) {
                        chrome.tabs.create({ url: searchUrl, index: tab.index + 1 });
                      } else {
                        chrome.tabs.update(tab.id, { url: searchUrl });
                      }
                      window.close();
                    });
                  };
                }
              });
            } else {
              showPopupUI();
            }
          };

          chrome.tabs.sendMessage(tab.id, { action: "checkImdbMovie" }, function(response) {
            if (chrome.runtime.lastError || !response || !response.movieActive || !response.imdbId) {
              let detectedTitle = "";
              let docTitle = tab.title || "";
              if (docTitle) {
                const separators = [" |", " -", " –", " ("];
                for (const separator of separators) {
                  const idx = docTitle.indexOf(separator);
                  if (idx !== -1) {
                    docTitle = docTitle.substring(0, idx);
                    break;
                  }
                }
                detectedTitle = docTitle.trim();
              }
              const matchTitleId = tab.url.match(/\/title\/(tt\d+)/);
              const matchNameId = tab.url.match(/\/name\/(nm\d+)/);
              const imdbId = matchTitleId ? matchTitleId[1] : (matchNameId ? matchNameId[1] : "");
              handleImdbTitle(detectedTitle, imdbId);
            } else {
              handleImdbTitle(response.title, response.imdbId);
            }
          });
        } else {
          showPopupUI();
        }
      } else {
        showPopupUI();
      }
    });
  } else {
    showPopupUI();
  }
});



