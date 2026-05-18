// Letterboxd sayfasında gizli olan veya aşağılarda bulunan IMDb bağlantısını buluyoruz.
// Genellikle "http://www.imdb.com/title/ttXXXXXXX/maindetails" şeklinde olur.
const imdbLinkElement = document.querySelector('a[href*="imdb.com/title/"]');

if (imdbLinkElement) {
  // Orijinal href değerini alıyoruz (IMDb ID'sini içerir)
  const imdbUrl = imdbLinkElement.href;
  
  const injectImdbIcon = () => {
    // Letterboxd film başlığını bul. Genellikle 'headline-1' sınıfına sahip bir h1 elementidir.
    const titleElement = document.querySelector('h1.headline-1') || document.querySelector('h1');
    
    // Eğer başlık bulunduysa ve ikonumuzu henüz eklemediysek
    if (titleElement && !document.getElementById('imdb-letterboxd-icon')) {
      const link = document.createElement('a');
      link.id = 'imdb-letterboxd-icon';
      link.href = imdbUrl;
      chrome.storage.sync.get({ imdbNewTab: true }, function(items) {
        link.target = items.imdbNewTab ? '_blank' : '_self';
      });
      link.title = 'IMDb\'de Aç';
      
      // Kullanıcının sağladığı icon dosyasını kullanıyoruz
      const img = document.createElement('img');
      img.src = chrome.runtime.getURL('icons8-imdb-48.png');
      img.alt = 'IMDb';
      link.appendChild(img);
      
      // Butonu başlığın tam yanına ekle
      titleElement.appendChild(link);
    }
  };

  // Sayfa yüklendiğinde çalıştır
  injectImdbIcon();
  
  // Olası dinamik yüklemelere karşı observer
  const observer = new MutationObserver(() => {
    if (!document.getElementById('imdb-letterboxd-icon')) {
      injectImdbIcon();
    }
  });
  
  observer.observe(document.body, { childList: true, subtree: true });
}
