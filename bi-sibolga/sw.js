const cacheName = 'offline-mode';
const filesToCache = [
  "./",
  "./android-chrome-192x192.png",
  "./android-chrome-384x384.png",
  "./apple-touch-icon.png",
  "./browserconfig.xml",
  "./favicon-16x16.png",
  "./favicon-32x32.png",
  "./favicon.ico",
  "./index.html",
  "./mstile-150x150.png",
  "./safari-pinned-tab.svg",
  "./site.webmanifest",
  "./assets/",
  "./assets/background.png",
  "./assets/logo-bi-putih.png",
  "./assets/logo-bi.png",
  "./assets/logo-cbp-rupiah-putih.png",
  "./assets/logo-cbp-rupiah.png",
  "./assets/logo-g20-indonesia-putih.png",
  "./assets/logo-g20-indonesia.png",
  "./assets/logo-gnpip-putih.png",
  "./assets/logo-gnpip.png",
  "./assets/logo-qris-15-juta-pengguna-putih.png",
  "./assets/logo-qris-15-juta-pengguna.png",
  "./assets/logo-temu-responden-tahun-2022.png",
  "./assets/audio/",
  "./assets/audio/drum-roll.mp3",
  "./assets/audio/small-crowd.mp3",
  "./assets/audio/winner.mp3",
  "./assets/css/",
  "./assets/css/font-open-sans.css",
  "./assets/css/hc-canvas-luckwheel.css",
  "./assets/css/style.css",
  "./assets/css/dist/",
  "./assets/css/dist/animate.min.css",
  "./assets/css/dist/bootstrap.min.css",
  "./assets/css/typo/",
  "./assets/css/typo/typo.css",
  "./assets/js/",
  "./assets/js/confetti.js",
  "./assets/js/hc-canvas-luckwheel.js",
  "./assets/js/script.js",
  "./assets/js/dist/",
  "./assets/js/dist/bootstrap.bundle.min.js",
  "./assets/js/dist/sweetalert2@11.js",
  "./assets/js/dist/xlsx.full.min.js",
  "./assets/font-open-sans/",
  "./assets/font-open-sans/open-sans-v34-latin-300.woff",
  "./assets/font-open-sans/open-sans-v34-latin-300.woff2",
  "./assets/font-open-sans/open-sans-v34-latin-300italic.woff",
  "./assets/font-open-sans/open-sans-v34-latin-300italic.woff2",
  "./assets/font-open-sans/open-sans-v34-latin-500.woff",
  "./assets/font-open-sans/open-sans-v34-latin-500.woff2",
  "./assets/font-open-sans/open-sans-v34-latin-500italic.woff",
  "./assets/font-open-sans/open-sans-v34-latin-500italic.woff2",
  "./assets/font-open-sans/open-sans-v34-latin-600.woff",
  "./assets/font-open-sans/open-sans-v34-latin-600.woff2",
  "./assets/font-open-sans/open-sans-v34-latin-600italic.woff",
  "./assets/font-open-sans/open-sans-v34-latin-600italic.woff2",
  "./assets/font-open-sans/open-sans-v34-latin-700.woff",
  "./assets/font-open-sans/open-sans-v34-latin-700.woff2",
  "./assets/font-open-sans/open-sans-v34-latin-700italic.woff",
  "./assets/font-open-sans/open-sans-v34-latin-700italic.woff2",
  "./assets/font-open-sans/open-sans-v34-latin-800.woff",
  "./assets/font-open-sans/open-sans-v34-latin-800.woff2",
  "./assets/font-open-sans/open-sans-v34-latin-800italic.woff",
  "./assets/font-open-sans/open-sans-v34-latin-800italic.woff2",
  "./assets/font-open-sans/open-sans-v34-latin-italic.woff2",
  "./assets/font-open-sans/open-sans-v34-latin-regular.woff",
  "./assets/font-open-sans/open-sans-v34-latin-regular.woff2",
]

// Cache all the files to make a PWA
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(cacheName).then(cache => {
      // Our application only has two files here index.html and site.webmanifest
      // but you can add more such as style.css as your app grows
      return cache.addAll(filesToCache);
    })
  );
});

// Our service worker will intercept all fetch requests
// and check if we have cached the file
// if so it will serve the cached file
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.open(cacheName)
      .then(cache => cache.match(event.request, { ignoreSearch: true }))
      .then(response => {
        return response || fetch(event.request);
      })
  );
});


