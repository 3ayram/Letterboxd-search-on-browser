# Letterboxd & IMDb Integration

A powerful browser extension that seamlessly bridges your movie discovery experience between IMDb, Google Search, and Letterboxd. Find, search, and navigate to your favorite movies with a single click.

## Features

* **IMDb Ratings on Letterboxd**: Instantly view IMDb ratings and vote counts directly on Letterboxd movie pages via the open-source OMDb API.
* **Google Search Integration**: Automatically injects a Letterboxd icon next to IMDb links in your Google Search results (supports dynamic infinite scroll).
* **IMDb to Letterboxd Bridge**: Adds a sleek Letterboxd button next to the movie title on any IMDb page.
* **Letterboxd to IMDb Bridge**: Adds an IMDb icon next to the movie title on Letterboxd pages for quick cross-referencing.
* **Right-Click Context Menu**: Select any text on the web, right-click, and search it directly on Letterboxd.
* **Recent Searches**: Quickly access your local search history from the extension popup.
* **Customizable Settings**: 
  * Open links in new tabs or the current tab.
  * Run right-click searches silently in the background.
  * Toggle Google Search integration on or off.
* **Multi-Language Support**: Fully translated into English, Turkish, German, Spanish, French, and Italian.

## Privacy First

Your data belongs to you. This extension does not collect, store, transmit, or sell any personal information or browsing history. All settings and your recent search history are saved locally on your browser. For more details, please see our [Privacy Policy](PRIVACY.md) and [Terms of Use](TERMS.md).

## Installation

### Firefox
You can download the official add-on from the [Mozilla Add-ons store](https://addons.mozilla.org/tr/firefox/addon/letterboxd-search-click/) or build it manually from this repository.

### Chrome
You can download the official extension from the Chrome Web Store (link coming soon) or load it unpacked via `chrome://extensions/`.

## Manual Build
1. Clone this repository.
2. For Chrome: Load the `chrome/` or the root directory via "Load unpacked".
3. For Firefox: Load the root directory via `about:debugging` or build using `web-ext build`.

## License & Legal
* Code is released under the [MIT License](LICENSE).
* See [Privacy Policy](PRIVACY.md) and [Terms of Use](TERMS.md).
* Not affiliated with Letterboxd Limited, IMDb.com, Inc., Google LLC, or OMDb API.
