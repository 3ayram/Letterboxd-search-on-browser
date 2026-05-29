const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const targetVersion = "1.5.8";
const browsers = ["chrome", "edge", "opera"];

console.log(`Starting release build for version ${targetVersion}...`);

// 1. Recursive copy helper
function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Helper to copy a file safely
function copyFile(src, dest) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
}

// 2. Update manifests to targetVersion
const manifests = [
  path.join(__dirname, 'manifest.json'),
  ...browsers.map(b => path.join(__dirname, b, 'manifest.json'))
];

manifests.forEach(manifestPath => {
  if (fs.existsSync(manifestPath)) {
    console.log(`Updating version to ${targetVersion} in: ${manifestPath}`);
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    manifest.version = targetVersion;
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');
  } else {
    console.warn(`Manifest not found: ${manifestPath}`);
  }
});

// 3. Sync common files to browser subdirectories
browsers.forEach(browser => {
  console.log(`Syncing updated assets to: ${browser}/`);
  
  // Copy locales
  copyDir(path.join(__dirname, '_locales'), path.join(__dirname, browser, '_locales'));
  
  // Copy common files
  const commonFiles = [
    'popup.html',
    'popup.js',
    'netflix.js',
    'hbomax.js',
    'primevideo.js',
    'mubi.js',
    'disneyplus.js',
    'apple.js',
    'letterboxd.js',
    'letterboxd.css',
    'imdb.js',
    'imdb.css',
    'google.js',
    'eventPage.js',
    'options.html',
    'options.js',
    'updateLocales.js',
    'welcome.html',
    'welcome.css',
    'welcome.js'
  ];

  commonFiles.forEach(file => {
    const src = path.join(__dirname, file);
    const dest = path.join(__dirname, browser, file);
    if (fs.existsSync(src)) {
      copyFile(src, dest);
    }
  });
});

// 4. Build distribution zip packages
const surumDir = path.join(__dirname, 'surum');
if (!fs.existsSync(surumDir)) {
  fs.mkdirSync(surumDir);
}

console.log("Packaging extension archives using standard tar utility...");

try {
  // A. Firefox / Root package
  const rootFiles = [
    'manifest.json',
    '_locales',
    'popup.html',
    'popup.js',
    'options.html',
    'options.js',
    'netflix.js',
    'hbomax.js',
    'primevideo.js',
    'mubi.js',
    'disneyplus.js',
    'apple.js',
    'letterboxd.js',
    'letterboxd.css',
    'imdb.js',
    'imdb.css',
    'google.js',
    'eventPage.js',
    'icon16.png',
    'icon32.png',
    'icon48.png',
    'icon64.png',
    'icon96.png',
    'icon128.png',
    'letterboxd.png',
    'LICENSE',
    'PRIVACY.md',
    'README.md',
    'TERMS.md',
    'updateLocales.js',
    'reviewpng.png',
    's.png',
    'welcome.html',
    'welcome.css',
    'welcome.js'
  ].join(' ');

  const rootZipPath = path.join(surumDir, `letterboxd_search_click-${targetVersion}.zip`);
  if (fs.existsSync(rootZipPath)) {
    fs.unlinkSync(rootZipPath);
  }
  console.log(`Creating root package: ${rootZipPath}`);
  execSync(`tar -c --format=zip -f "${rootZipPath}" ${rootFiles}`);

  // B. Browser specific packages (chrome, edge, opera)
  browsers.forEach(browser => {
    const fullBrowserZipPath = path.join(surumDir, `letterboxd_search_click-${browser}-${targetVersion}.zip`);
    if (fs.existsSync(fullBrowserZipPath)) {
      fs.unlinkSync(fullBrowserZipPath);
    }
    const browserZipPath = `..\\surum\\letterboxd_search_click-${browser}-${targetVersion}.zip`;
    console.log(`Creating ${browser} package: ${browser}\\${browserZipPath}`);
    execSync(`powershell -Command "cd ${browser}; tar -c --format=zip -f '${browserZipPath}' *"`);
  });

  console.log("Release build completed successfully!");
} catch (error) {
  console.error("Packaging failed:", error.message);
  process.exit(1);
}
