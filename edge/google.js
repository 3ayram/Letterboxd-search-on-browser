chrome.storage.sync.get({ googleIntegration: true, googleNewTab: true }, function(items) {
  if (!items.googleIntegration) return;

  const injectLetterboxdIcons = () => {
    // Google arama sonuçlarındaki tüm linkleri bul
    const links = document.querySelectorAll('a[href*="imdb.com/title/tt"]');
    
    links.forEach(link => {
      // Eğer bu linke daha önce ikon eklediysek atla
      if (link.dataset.lbIconAdded) return;
      link.dataset.lbIconAdded = 'true';

      // Sadece ana sonuç linklerine veya belirgin IMDb linklerine ekle
      // (Bazen resimler veya küçük site bağlantıları da aynı href'e sahip olur, 
      //  görsel karmaşayı önlemek için sadece içi text olan veya h3 içerenleri filtreleyebiliriz,
      //  ama genel kullanım için hepsinin yanına eklemek de uygundur. Biz başlık (h3) barındıranları önceliklendirelim)
      const isMainResult = link.querySelector('h3') !== null;
      
      // Veya linkin doğrudan içine değil, linkin hemen sonrasına ekleyelim.
      try {
        // Href'den IMDb ID'sini çıkar (tt ile başlayan 7 veya 8 rakam)
        const match = link.href.match(/title\/(tt\d+)/);
        if (match && match[1]) {
          const imdbId = match[1];
          
          // Çeviri, önbellek gibi ikincil linkleri atla
          if (link.href.includes('translate.') || link.href.includes('webcache.')) return;

          // Masaüstü için h3, mobil için div[role="heading"] veya h2/h4 arıyoruz
          let targetNode = link.querySelector('h3, h2, h4, div[role="heading"]');
          
          if (!targetNode) {
            // Firefox Mobile gibi ortamlarda başlık sıradan bir div içinde olabilir
            // İçinde doğrudan metin barındıran (başlık olmaya en uygun) ilk div'i buluyoruz
            const textNodes = Array.from(link.querySelectorAll('div, span')).filter(el => {
              return Array.from(el.childNodes).some(n => n.nodeType === Node.TEXT_NODE && n.textContent.trim().length > 2);
            });
            
            if (textNodes.length > 0) {
              targetNode = textNodes[0]; 
            } else {
              targetNode = link; // Bulunamazsa doğrudan a etiketine ekle
            }
          }
          
          if (!targetNode) return;
          
          // HTML'de <a> içinde <a> kullanmak geçersizdir ve Firefox Mobilde sorun yaratır.
          // Bu yüzden span kullanıp tıklama olayını JavaScript ile yönetiyoruz.
          const lbLink = document.createElement('span');
          lbLink.title = chrome.i18n.getMessage("openInLetterboxd") || "Letterboxd'da Aç";
          lbLink.style.display = 'inline-block';
          lbLink.style.marginLeft = '10px';
          lbLink.style.verticalAlign = 'middle';
          lbLink.style.cursor = 'pointer';
          lbLink.style.lineHeight = '1';
          lbLink.style.position = 'relative';
          lbLink.style.zIndex = '9999';

          // Google'ın tıklama takibine ve dıştaki linkin tetiklenmesine engel ol
          lbLink.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const url = `https://letterboxd.com/imdb/${imdbId}`;
            if (items.googleNewTab) {
              chrome.runtime.sendMessage({ action: 'openTab', url: url });
            } else {
              window.location.href = url;
            }
          });

          const img = document.createElement('img');
          // Daha keskin bir görüntü için 32px ikon kullanıp küçültüyoruz
          img.src = chrome.runtime.getURL('icon32.png');
          img.style.width = '20px';
          img.style.height = '20px';
          img.style.borderRadius = '4px';
          img.style.verticalAlign = 'middle';
          img.style.boxShadow = '0 1px 3px rgba(0,0,0,0.3)';
          img.style.transition = 'transform 0.2s ease';
          
          lbLink.onmouseenter = () => img.style.transform = 'scale(1.1)';
          lbLink.onmouseleave = () => img.style.transform = 'scale(1)';
          
          lbLink.appendChild(img);
          targetNode.appendChild(lbLink);
        }
      } catch(e) {
        // Hata durumunda sayfanın işleyişini bozma
      }
    });
  };

  // Sayfa ilk yüklendiğinde çalıştır
  injectLetterboxdIcons();
  
  // Google arama sonuçları aşağı kaydırdıkça (infinite scroll) veya sekme geçişlerinde dinamik olarak yüklenir.
  const observer = new MutationObserver((mutations) => {
    let shouldInject = false;
    for (let mutation of mutations) {
      if (mutation.addedNodes.length > 0) {
        shouldInject = true;
        break;
      }
    }
    if (shouldInject) {
      injectLetterboxdIcons();
    }
  });
  
  // Sadece body içindeki element eklemelerini dinle
  observer.observe(document.body, { childList: true, subtree: true });
});
