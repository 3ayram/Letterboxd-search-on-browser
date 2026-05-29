const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, '_locales');
const locales = ['en', 'tr', 'de', 'es', 'fr', 'it'];

const translations = {
  welcomeTitle: {
    en: "Welcome to Letterboxd Search & Click!",
    tr: "Letterboxd Search & Click'e Hoş Geldiniz!",
    de: "Willkommen bei Letterboxd Search & Click!",
    es: "¡Bienvenido a Letterboxd Search & Click!",
    fr: "Bienvenue sur Letterboxd Search & Click !",
    it: "Benvenuto in Letterboxd Search & Click!"
  },
  welcomeSubtitle: {
    en: "Access the world of cinema with one click.",
    tr: "Sinema dünyasına tek tıkla ulaşın.",
    de: "Greifen Sie mit einem Klick auf die Welt des Kinos zu.",
    es: "Accede al mundo del cine con un clic.",
    fr: "Accédez au monde du cinéma en un clic.",
    it: "Accedi al mondo del cinema con un clic."
  },
  pinTitle: {
    en: "Why Pin the Extension?",
    tr: "Neden Sabitlemelisiniz? (Pin)",
    de: "Warum die Erweiterung anheften?",
    es: "¿Por qué fijar la extensión?",
    fr: "Pourquoi épingler l'extension ?",
    it: "Perché fissare l'estensione?"
  },
  pinAdvantage1: {
    en: "🚀 1-Click Search: Quickly search movies from any tab.",
    tr: "🚀 Tek Tıkla Arama: Her sekmeden hızlıca film arama imkanı.",
    de: "🚀 1-Klick-Suche: Suchen Sie schnell Filme von jedem Tab aus.",
    es: "🚀 Búsqueda en 1 clic: Busca películas rápidamente desde cualquier pestaña.",
    fr: "🚀 Recherche en 1 clic : Recherchez rapidement des films depuis n'importe quel onglet.",
    it: "🚀 Ricerca in 1 clic: Cerca rapidamente film da qualsiasi scheda."
  },
  pinAdvantage2: {
    en: "🍿 Auto-Redirect: Jump directly to Letterboxd from content pages on Netflix, Prime, Max, IMDb, etc.",
    tr: "🍿 Otomatik Yönlendirme: Netflix, Prime, Max, IMDb gibi platformlarda film sayfasındayken tek tıkla doğrudan Letterboxd'a gitme.",
    de: "🍿 Automatische Weiterleitung: Springen Sie direkt von Inhaltsseiten auf Netflix, Prime usw. zu Letterboxd.",
    es: "🍿 Redirección automática: Salta directamente a Letterboxd desde páginas de contenido en Netflix, Prime, etc.",
    fr: "🍿 Redirection automatique : Accédez directement à Letterboxd depuis les pages de contenu sur Netflix, Prime, etc.",
    it: "🍿 Reindirizzamento automatico: Passa direttamente a Letterboxd dalle pagine di contenuto su Netflix, Prime, ecc."
  },
  pinAdvantage3: {
    en: "▶️ Smart Badge: See a badge indicator when a movie is detected on a supported platform.",
    tr: "▶️ Akıllı Rozet: Desteklenen bir platformda film açıkken ikon üzerinde beliren uyarı rozeti ile anında durum tespiti.",
    de: "▶️ Intelligentes Abzeichen: Sehen Sie eine Anzeige, wenn ein Film auf einer unterstützten Plattform erkannt wird.",
    es: "▶️ Insignia inteligente: Ve un indicador cuando se detecta una película en una plataforma compatible.",
    fr: "▶️ Badge intelligent : Affichez un indicateur lorsqu'un film est détecté sur une plateforme prise en charge.",
    it: "▶️ Badge intelligente: Visualizza un indicatore quando un film viene rilevato su una piattaforma supportata."
  },
  pinInstructionTitle: {
    en: "How to Pin",
    tr: "Nasıl Sabitlenir?",
    de: "Wie man anheftet",
    es: "Cómo fijar",
    fr: "Comment épingler",
    it: "Come fissare"
  },
  pinInstructionChrome: {
    en: "Click the <b>Puzzle (Extensions)</b> icon on the toolbar and click the <b>Pin</b> icon next to Letterboxd Search.",
    tr: "Araç çubuğundaki <b>Yapboz (Eklentiler)</b> ikonuna tıklayın ve Letterboxd Search'ün yanındaki <b>İğne (Pin)</b> simgesine basın.",
    de: "Klicken Sie auf das <b>Puzzle (Erweiterungen)</b>-Symbol und dann auf das <b>Anheften</b>-Symbol neben Letterboxd Search.",
    es: "Haz clic en el ícono de <b>Rompecabezas (Extensiones)</b> y luego en el ícono de <b>Fijar</b> junto a Letterboxd Search.",
    fr: "Cliquez sur l'icône <b>Puzzle (Extensions)</b>, puis cliquez sur l'icône <b>Épingler</b> à côté de Letterboxd Search.",
    it: "Fai clic sull'icona del <b>Puzzle (Estensioni)</b> e fai clic sull'icona <b>Fissa</b> accanto a Letterboxd Search."
  },
  pinInstructionFirefox: {
    en: "Click the <b>Extensions (Puzzle)</b> icon on the toolbar, right-click Letterboxd Search and select <b>'Pin to Toolbar'</b>.",
    tr: "Araç çubuğundaki <b>Eklentiler (Yapboz)</b> ikonuna tıklayın, Letterboxd Search'e sağ tıklayıp <b>'Araç Çubuğuna Sabitle'</b> seçeneğini seçin.",
    de: "Klicken Sie auf das <b>Erweiterungen</b>-Symbol, klicken Sie mit der rechten Maustaste auf Letterboxd Search und wählen Sie <b>'An die Symbolleiste anheften'</b>.",
    es: "Haz clic en el ícono de <b>Extensiones</b>, haz clic derecho en Letterboxd Search y selecciona <b>'Fijar a la barra de herramientas'</b>.",
    fr: "Cliquez sur l'icône <b>Extensions</b>, faites un clic droit sur Letterboxd Search et sélectionnez <b>'Épingler à la barre d'outils'</b>.",
    it: "Fai clic sull'icona <b>Estensioni</b>, fai clic con il pulsante destro del mouse su Letterboxd Search e seleziona <b>'Fissa alla barra degli strumenti'</b>."
  },
  pinClose: {
    en: "Close & Start Exploring",
    tr: "Kapat ve Keşfetmeye Başla",
    de: "Schließen & Entdecken",
    es: "Cerrar y empezar a explorar",
    fr: "Fermer et commencer l'exploration",
    it: "Chiudi e inizia a esplorare"
  }
};

locales.forEach(lang => {
  const filePath = path.join(localesDir, lang, 'messages.json');
  if (fs.existsSync(filePath)) {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    // Add keys
    Object.keys(translations).forEach(key => {
      data[key] = {
        message: translations[key][lang] || translations[key]['en']
      };
    });
    
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    console.log(`Updated ${lang} messages.json`);
  }
});
