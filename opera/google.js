chrome.storage.sync.get({ googleIntegration: true, lbNewTab: true }, function(items) {
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
          
          const lbLink = document.createElement('a');
          lbLink.href = `https://letterboxd.com/imdb/${imdbId}`;
          lbLink.target = items.lbNewTab ? '_blank' : '_self';
          lbLink.title = "Letterboxd'da Aç";
          lbLink.style.display = 'inline-block';
          lbLink.style.marginLeft = '8px';
          lbLink.style.verticalAlign = 'middle';
          // Google'ın tıklama takibine takılmamak için link eventlerinin dışarı sızmasını engelliyoruz
          lbLink.addEventListener('click', (e) => e.stopPropagation());

          const img = document.createElement('img');
          // icon16 veya icon32 kullanabiliriz, google sonuçları için 16px oldukça şık durur.
          img.src = chrome.runtime.getURL('icon16.png');
          img.style.width = '16px';
          img.style.height = '16px';
          img.style.borderRadius = '2px';
          img.style.verticalAlign = 'middle';
          
          lbLink.appendChild(img);

          // Eğer link bir h3 (ana başlık) içeriyorsa, ikonu h3'ün içine, metnin yanına ekle
          const h3 = link.querySelector('h3');
          if (h3) {
            h3.appendChild(lbLink);
          } else {
            // Aksi takdirde linkin sonuna ekle
            link.parentNode.insertBefore(lbLink, link.nextSibling);
          }
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
