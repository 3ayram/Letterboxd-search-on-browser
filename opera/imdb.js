// IMDb URL'sinden ID'yi alıyoruz (Örn: tt1234567)
const match = window.location.pathname.match(/\/title\/(tt\d+)/);

if (match && match[1]) {
  const imdbId = match[1];
  
  const injectIcon = () => {
    // IMDb'nin başlık etiketini bul. Farklı tasarımlara karşı genel h1 seçicisini de yedek olarak tutuyoruz.
    const titleElement = document.querySelector('h1[data-testid="hero__pageTitle"]') || document.querySelector('h1');
    
    // Eğer başlık bulunduysa ve ikonumuzu henüz eklemediysek
    if (titleElement && !document.getElementById('letterboxd-imdb-icon')) {
      const link = document.createElement('a');
      link.id = 'letterboxd-imdb-icon';
      link.href = `https://letterboxd.com/imdb/${imdbId}`;
      chrome.storage.sync.get({ lbNewTab: true }, function(items) {
        link.target = items.lbNewTab ? '_blank' : '_self';
      });
      link.title = 'Letterboxd\'da Aç';
      
      const img = document.createElement('img');
      // İkonun tarayıcı uzantısındaki güvenli yolunu alıyoruz
      img.src = chrome.runtime.getURL('icon32.png'); 
      img.alt = 'Letterboxd';
      
      link.appendChild(img);
      
      // İkonu başlığın tam sonuna (yanına) ekle
      titleElement.appendChild(link);
    }
  };

  // Sayfa ilk yüklendiğinde çalıştır
  injectIcon();
  
  // IMDb bazen sayfa yenilemeden içeriği dinamik yükleyebilir. Bunu yakalamak için Observer kullanıyoruz.
  const observer = new MutationObserver(() => {
    if (!document.getElementById('letterboxd-imdb-icon')) {
      injectIcon();
    }
  });
  
  observer.observe(document.body, { childList: true, subtree: true });
}
