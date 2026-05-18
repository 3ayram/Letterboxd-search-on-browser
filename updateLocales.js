const fs = require('fs');
const path = require('path');

const translations = {
  tr: {
    optTitle: "Letterboxd Arama Ayarları",
    optHeading: "Eklenti Ayarları",
    optImdbLabel: "IMDb Butonu Davranışı",
    optImdbDesc: "Letterboxd üzerindeki IMDb ikonuna tıkladığınızda IMDb sayfasını her zaman yeni sekmede açar.",
    optLbLabel: "Letterboxd Butonu Davranışı",
    optLbDesc: "IMDb üzerindeki Letterboxd ikonuna tıkladığınızda Letterboxd sayfasını her zaman yeni sekmede açar.",
    optCtxLabel: "Sağ Tık (Arka Plan) Davranışı",
    optCtxDesc: "Seçtiğiniz metni sağ tık ile arattığınızda, arama sayfasını arka planda (sessizce) açar.",
    optGoogleLabel: "Google Arama Entegrasyonu",
    optGoogleDesc: "Google arama sonuçlarında görünen IMDb linklerinin yanına Letterboxd ikonu ekler.",
    optSaveBtn: "Ayarları Kaydet",
    optSaved: "Ayarlar kaydedildi!"
  },
  en: {
    optTitle: "Letterboxd Search Settings",
    optHeading: "Extension Settings",
    optImdbLabel: "IMDb Button Behavior",
    optImdbDesc: "Open the IMDb page in a new tab when you click the IMDb icon on Letterboxd.",
    optLbLabel: "Letterboxd Button Behavior",
    optLbDesc: "Open the Letterboxd page in a new tab when you click the Letterboxd icon on IMDb.",
    optCtxLabel: "Context Menu Behavior",
    optCtxDesc: "Open context menu searches silently in the background.",
    optGoogleLabel: "Google Search Integration",
    optGoogleDesc: "Add a Letterboxd icon next to IMDb links in Google search results.",
    optSaveBtn: "Save Settings",
    optSaved: "Settings saved!"
  },
  de: {
    optTitle: "Letterboxd Suche Einstellungen",
    optHeading: "Erweiterungseinstellungen",
    optImdbLabel: "IMDb-Schaltfläche Verhalten",
    optImdbDesc: "IMDb-Seite in einem neuen Tab öffnen, wenn Sie auf Letterboxd auf das IMDb-Symbol klicken.",
    optLbLabel: "Letterboxd-Schaltfläche Verhalten",
    optLbDesc: "Letterboxd-Seite in einem neuen Tab öffnen, wenn Sie auf IMDb auf das Letterboxd-Symbol klicken.",
    optCtxLabel: "Kontextmenü Verhalten",
    optCtxDesc: "Kontextmenü-Suchen stumm im Hintergrund öffnen.",
    optGoogleLabel: "Google-Suche Integration",
    optGoogleDesc: "Fügt ein Letterboxd-Symbol neben IMDb-Links in den Google-Suchergebnissen hinzu.",
    optSaveBtn: "Einstellungen speichern",
    optSaved: "Einstellungen gespeichert!"
  },
  es: {
    optTitle: "Configuración de Búsqueda de Letterboxd",
    optHeading: "Configuración de la Extensión",
    optImdbLabel: "Comportamiento del Botón de IMDb",
    optImdbDesc: "Abre la página de IMDb en una nueva pestaña al hacer clic en el ícono de IMDb en Letterboxd.",
    optLbLabel: "Comportamiento del Botón de Letterboxd",
    optLbDesc: "Abre la página de Letterboxd en una nueva pestaña al hacer clic en el ícono de Letterboxd en IMDb.",
    optCtxLabel: "Comportamiento del Menú Contextual",
    optCtxDesc: "Abre las búsquedas del menú contextual silenciosamente en segundo plano.",
    optGoogleLabel: "Integración con Búsqueda de Google",
    optGoogleDesc: "Añade un ícono de Letterboxd junto a los enlaces de IMDb en los resultados de Google.",
    optSaveBtn: "Guardar configuración",
    optSaved: "¡Configuración guardada!"
  },
  fr: {
    optTitle: "Paramètres de Recherche Letterboxd",
    optHeading: "Paramètres de l'extension",
    optImdbLabel: "Comportement du bouton IMDb",
    optImdbDesc: "Ouvrir la page IMDb dans un nouvel onglet lorsque vous cliquez sur l'icône IMDb sur Letterboxd.",
    optLbLabel: "Comportement du bouton Letterboxd",
    optLbDesc: "Ouvrir la page Letterboxd dans un nouvel onglet lorsque vous cliquez sur l'icône Letterboxd sur IMDb.",
    optCtxLabel: "Comportement du menu contextuel",
    optCtxDesc: "Ouvrir les recherches du menu contextuel silencieusement en arrière-plan.",
    optGoogleLabel: "Intégration de la recherche Google",
    optGoogleDesc: "Ajoute une icône Letterboxd à côté des liens IMDb dans les résultats de Google.",
    optSaveBtn: "Enregistrer les paramètres",
    optSaved: "Paramètres enregistrés !"
  },
  it: {
    optTitle: "Impostazioni di Ricerca Letterboxd",
    optHeading: "Impostazioni Estensione",
    optImdbLabel: "Comportamento pulsante IMDb",
    optImdbDesc: "Apri la pagina di IMDb in una nuova scheda quando clicchi sull'icona IMDb su Letterboxd.",
    optLbLabel: "Comportamento pulsante Letterboxd",
    optLbDesc: "Apri la pagina di Letterboxd in una nuova scheda quando clicchi sull'icona Letterboxd su IMDb.",
    optCtxLabel: "Comportamento menu contestuale",
    optCtxDesc: "Apri le ricerche del menu contestuale silenziosamente in background.",
    optGoogleLabel: "Integrazione con Ricerca Google",
    optGoogleDesc: "Aggiunge un'icona Letterboxd accanto ai link IMDb nei risultati di ricerca di Google.",
    optSaveBtn: "Salva Impostazioni",
    optSaved: "Impostazioni salvate!"
  }
};

const localesDir = path.join(__dirname, '_locales');

for (const lang of Object.keys(translations)) {
  const filePath = path.join(localesDir, lang, 'messages.json');
  if (fs.existsSync(filePath)) {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    for (const [key, value] of Object.entries(translations[lang])) {
      data[key] = { message: value };
    }
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  }
}
