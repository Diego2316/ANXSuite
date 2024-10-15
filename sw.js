const CACHE_NAME = 'v1_cache_anilox_manager',
      urlsToCache = [
        // './login.html',
        // './js/login.js',
        // './css/login.css',
        // './registro.html',
        // './css/registro.css',
        // './js/registro.js',        
        // './css/style.css',        
        // './controllers/autenticacion.js',
        // './anilox-detail.html',
        // './ayuda.html',
        // './export-data.html',
        // './index.html',
        // './listado.html',
        // './print-report.html',
        // './upload-file.html',
        // './css/anilox-detail.css',
        // './css/ayuda.css',
        // './css/export-data.css',
        // './css/index.css',
        // './css/listado.css',
        // './css/print-report.css',        
        // './css/upload-file.css',
        // './js/anilox-detail.js',
        // './js/ayuda.js',
        // './js/common.js',
        // './js/export-data.js',
        // './js/index.js',
        // './js/listado.js',
        // './js/print-report.js',
        // './js/upload-file.js',        
        // 'https://fonts.googleapis.com/css2?family=Rajdhani:wght@300;400;500;600;700&display=swap',
        // 'https://fonts.googleapis.com/icon?family=Material+Icons+Sharp',
        // './assets/favicon.ico',
        // './assets/anders_logo.png',
        // './assets/anilox-placeholder.jpg',
        // './assets/logo-placeholder.svg',
        // './assets/navbar-background.jpg',
        // './assets/icons/./manifest-icon-192.maskable.png',
        // './assets/icons/./manifest-icon-512.maskable.png',
        // './assets/logo.png',
        // './utils/anillox-analysis.js',
        // './utils/anillox-history.js',
        // './utils/anillox-list.js',
        // './utils/client-info.js',
      ];

self.addEventListener('install', e=>{
  e.waitUntil(
    caches.open(CACHE_NAME)
    .then(cache =>{
      return cache.addAll(urlsToCache)
      .then(() => self.skipWaiting())
    })
    .catch(err => console.warn(err))
  );
});

self.addEventListener('activate', e=>{
  const cacheWhitelist = [CACHE_NAME];
  e.waitUntil(
    caches.keys()
    .then(cacheNames => {
      cacheNames.map(cacheName => {
        if(cacheWhitelist.indexOf(cacheName) === -1){
          return caches.delete(cacheName);
        }
      })
    })
    .then(() => self.clients.claim())
    .catch(err => console.warn(err))
  );
});

self.addEventListener('fetch', e=>{
  e.respondWith(
    caches.match(e.request)
    .then(res => {
      if(res){
        return res;
      }
      return fetch(e.request);
    })
    .catch(err => console.warn(err))
  );
});