const CACHE_NAME = 'v1_cache_anx_suite',
      urlsToCache = [
        // './controllers/autenticacion.js',
        // './js/anilox-detail.js',
        // './js/ayuda.js',
        // './js/common.js',
        // './js/index.js',
        // './js/listado.js',
        // './js/login.js',
        // './js/print-report.js',
        // './js/recvpass.js',
        // './js/registro_licencia.js',
        // './js/registro.js',
        // './js/req-quotes.js',
        // './js/upload-file.js',
        // './super_js/super_anilox-detail.js',
        // './super_js/super_common.js',
        // './super_js/super_index.js',
        // './super_js/super_listado.js',
        // './super_js/super_print-report.js',
        // './super_js/super_req-quotes.js',
        // './css/anilox-detail.css',
        // './css/ayuda.css',
        // './css/index.css',
        // './css/listado.css',
        // './css/login.css',
        // './css/print-report.css',
        // './css/rcvpass.css',
        // './css/registro_licencia.css',
        // './css/registro.css',
        // './css/req-quotes.css',
        // './css/style.css',
        // './css/upload-file.css',
        // './super_css/super_anilox-detail.css',
        // './super_css/super_index.css',
        // './super_css/super_listado.css',
        // './super_css/super_print-report.css',
        // './super_css/super_req-quotes.css',
        // './super_css/super_style.css',
        // './assets/Anders Perú-logo.webp',
        // './assets/anilox-placeholder.webp',
        // './assets/anilox1_2.webp',
        // './assets/anilox2.webp',
        // './assets/anilox3_2.webp',
        // './assets/anilox4.webp',
        // './assets/anilox5.webp',
        // './assets/favicon.ico',
        // './assets/logo-placeholder.svg',
        // './assets/logo.webp',
        // './assets/LogoANXSuite_blanco.webp',
        // './assets/LogoANXSuite.webp',
        // './assets/icons/manifest-icon-192.maskable.webp',
        // './assets/icons/manifest-icon-512.maskable.webp',
        // 'https://fonts.googleapis.com/css2?family=Rajdhani:wght@300;400;500;600;700&display=swap',
        // 'https://fonts.googleapis.com/icon?family=Material+Icons+Sharp',
        // 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js',
        // 'https://cdn.jsdelivr.net/npm/chartjs-plugin-datalabels@2'
      ];

self.addEventListener('install', e=>{
  e.waitUntil(
    caches
    .open(CACHE_NAME)
    .then(cache => {
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
    caches
    .match(e.request)
    .then(res => {
      if(res){
        return res;
      }
      return fetch(e.request);
    })
    .catch(err => console.warn(err))
  );
});