(function() {
  // history.pushState'i izleyerek URL değişikliklerini yakala
  let lastUrl = location.href;

  function onUrlChange() {
    if (location.href === lastUrl) return;
    lastUrl = location.href;
    // Yeni URL film sayfasıysa çalıştır
    if (location.pathname.startsWith('/film/')) {
      // DOM'un yüklenmesi için kısa bir bekleme
      setTimeout(tryRun, 500);
    }
  }

  // pushState ve replaceState'i yakala
  const _push = history.pushState;
  history.pushState = function() {
    _push.apply(this, arguments);
    onUrlChange();
  };
  window.addEventListener('popstate', onUrlChange);

  function tryRun() {
    chrome.storage.sync.get({ imdbRatingOnLetterboxd: true }, function(prefs) {
      if (!prefs.imdbRatingOnLetterboxd) return;
      // Önceki enjeksiyonu temizle
      const existing = document.querySelector('.lb-imdb-wrapper');
      if (existing) existing.remove();
      const existingBadge = document.querySelector('.lb-ext-badge');
      if (existingBadge) existingBadge.remove();
      init();
    });
  }

  // İlk yüklemede de çalıştır
  if (location.pathname.startsWith('/film/')) {
    tryRun();
  }

  function init() {
    const imdbLink = document.querySelector('a[data-track-action="IMDb"]');
    if (!imdbLink) return;

    const match = imdbLink.href.match(/title\/(tt\d+)/);
    if (!match || !match[1]) return;
    const imdbId = match[1];

    let ratingFetched = false;
    let imdbRating = null;
    let imdbVotes = null;
    let imdbRatingInjected = false;

    chrome.runtime.sendMessage({ action: 'fetchImdbRating', imdbId: imdbId }, function(response) {
      ratingFetched = true;
      if (response && response.success && response.rating) {
        imdbRating = response.rating;
        imdbVotes = response.votes || null;
        injectRatingWhenReady();
      }
    });

    const observer = new MutationObserver(injectRatingWhenReady);
    observer.observe(document.body, { childList: true, subtree: true });

    function generateHistogramData(rating, totalVotesStr) {
      const mean = parseFloat(rating);
      const std = 1.8;
      const rawValues = [];
      let sumRaw = 0;
      for (let i = 1; i <= 10; i++) {
        const g = Math.exp(-0.5 * Math.pow((i - mean) / std, 2));
        rawValues.push(g);
        sumRaw += g;
      }
      const maxV = Math.max(...rawValues);
      const heights = rawValues.map(v => v / maxV);
      
      let totalVotes = 0;
      if (totalVotesStr) {
        totalVotes = parseInt(totalVotesStr.replace(/,/g, ''), 10) || 0;
      }
      
      const votes = rawValues.map(v => Math.round((v / sumRaw) * totalVotes));
      const percents = rawValues.map(v => Math.round((v / sumRaw) * 100));
      
      return { heights, votes, percents };
    }

    function injectRatingWhenReady() {
      if (imdbRatingInjected || !ratingFetched || !imdbRating) return;

      const ratingSection = document.querySelector('.rating-histogram');
      if (!ratingSection) return;

      const avgRatingEl = ratingSection.querySelector('a.averagerating');
      if (!avgRatingEl) return;

      imdbRatingInjected = true;
      observer.disconnect();

      // Letterboxd bölümüne LETTERBOXD etiketi ekle
      const parent = ratingSection.closest('section, .section, [class*="sidebar"], [class*="col"], div') || ratingSection.parentNode;
      const heading = parent.querySelector('h2, h3, h4, [class*="heading"], [class*="title"]') ||
                      Array.from(parent.querySelectorAll('*')).find(el =>
                        el.textContent.trim() === 'RATINGS' && el !== ratingSection
                      );

      if (heading && !heading.querySelector('.lb-ext-badge')) {
        const lbBadge = document.createElement('span');
        lbBadge.className = 'lb-ext-badge lb-ext-lb';
        lbBadge.textContent = 'LETTERBOXD';
        heading.insertBefore(lbBadge, heading.firstChild);
      }

      // IMDb bölümünü klonla
      const clonedSection = ratingSection.cloneNode(true);
      clonedSection.classList.add('lb-imdb-section');

      // IMDb logosu için header div - tıklanabilir
      const imdbHeader = document.createElement('div');
      imdbHeader.className = 'lb-imdb-header';
      const imdbTitle = chrome.i18n.getMessage("openInImdb") || "IMDb'de Aç";
      const link = document.createElement('a');
      link.className = 'lb-imdb-logo-link';
      link.href = 'https://www.imdb.com/title/' + imdbId + '/';
      link.title = imdbTitle;

      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('class', 'lb-imdb-logo');
      svg.setAttribute('viewBox', '0 0 62 28');
      svg.setAttribute('width', '50');
      svg.setAttribute('height', '22');

      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('width', '62');
      rect.setAttribute('height', '28');
      rect.setAttribute('rx', '4');
      rect.setAttribute('fill', '#F5C518');

      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', '31');
      text.setAttribute('y', '20');
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('font-family', 'Arial Black, Arial');
      text.setAttribute('font-weight', '900');
      text.setAttribute('font-size', '17');
      text.setAttribute('fill', '#000');
      text.setAttribute('letter-spacing', '-0.5');
      text.textContent = 'IMDb';

      svg.appendChild(rect);
      svg.appendChild(text);
      link.appendChild(svg);
      imdbHeader.appendChild(link);

      // Tıklanınca mevcut sekmenin sağında yeni sekme aç
      imdbHeader.querySelector('.lb-imdb-logo-link').addEventListener('click', function(e) {
        e.preventDefault();
        chrome.runtime.sendMessage({
          action: 'openTab',
          url: 'https://www.imdb.com/title/' + imdbId + '/'
        });
      });

      // Histogram barlarını IMDb dağılımına göre güncelle
      const columns = clonedSection.querySelectorAll('tr.column');
      if (columns.length > 0) {
        const histData = generateHistogramData(imdbRating, imdbVotes);
        let tooltipPattern = chrome.i18n.getMessage("histogramTooltip") || "%1 stars: %2 ratings (%3%)";
        
        columns.forEach((col, i) => {
          if (i < histData.heights.length) {
            col.style.setProperty('--value', histData.heights[i].toFixed(6));
            
            const barLink = col.querySelector('a.barcolumn');
            if (barLink) {
              barLink.removeAttribute('href');
              
              const starNum = i + 1;
              const formattedVotes = histData.votes[i].toLocaleString();
              const percent = histData.percents[i];
              
              const tooltipStr = tooltipPattern
                .replace('%1', starNum)
                .replace('%2', formattedVotes)
                .replace('%3', percent);
              
              barLink.setAttribute('data-original-title', tooltipStr);
              barLink.setAttribute('title', tooltipStr);
              barLink.style.cursor = 'default';
            }
          }
        });
      }

      // Ortalama puan güncelle
      const ratingLink = clonedSection.querySelector('a.averagerating');
      if (ratingLink) {
        const textNode = [...ratingLink.childNodes].find(n => n.nodeType === 3);
        if (textNode) textNode.textContent = ' ' + imdbRating + ' ';
        else ratingLink.textContent = imdbRating;

        ratingLink.href = 'https://www.imdb.com/title/' + imdbId + '/ratings/';
        ratingLink.target = '_blank';

        if (imdbVotes) {
          const votesLabel = chrome.i18n.getMessage('imdbVotesLabel') || 'votes on IMDb';
          ratingLink.setAttribute('data-original-title', imdbVotes + ' ' + votesLabel);
          ratingLink.setAttribute('title', imdbVotes + ' ' + votesLabel);
          ratingLink.classList.add('lb-imdb-votes');
        }
      }

      // Fan sayısını kaldır
      const fansLink = clonedSection.querySelector('.all-link');
      if (fansLink) fansLink.remove();

      // Wrapper oluştur ve ekle
      const wrapper = document.createElement('div');
      wrapper.className = 'lb-imdb-wrapper';
      wrapper.appendChild(imdbHeader);
      wrapper.appendChild(clonedSection);

      ratingSection.parentNode.insertBefore(wrapper, ratingSection.nextSibling);
    } // end injectRatingWhenReady

  } // end init
})();
