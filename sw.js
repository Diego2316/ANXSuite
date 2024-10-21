const CACHE_NAME = 'v1_cache_anx_suite',
      urlsToCache = [
        './controllers/autenticacion.js',
        // './anilox-detail.html',
        // './ayuda.html',
        // './index.html',
        // './listado.html',
        // './login.html',
        // './print-report.html',
        // './rcvpass.html',
        // './registro_licencia.html',
        // './registro.html',
        // './req-quotes.html',
        // './super_anilox-detail.html',
        // './super_index.html',
        // './super_listado.html',
        // './super_print-report.html',
        // './super_req-quotes.html',
        // './upload-file.html',
        './js/anilox-detail.js',
        './js/ayuda.js',
        './js/common.js',
        './js/index.js',
        './js/listado.js',
        './js/login.js',
        './js/print-report.js',
        './js/recvpass.js',
        './js/registro_licencia.js',
        './js/registro.js',
        './js/req-quotes.js',
        './js/upload-file.js',
        './super_js/super_anilox-detail.js',
        './super_js/super_common.js',
        './super_js/super_index.js',
        './super_js/super_listado.js',
        './super_js/super_print-report.js',
        './super_js/super_req-quotes.js',
        './css/anilox-detail.css',
        './css/ayuda.css',
        './css/index.css',
        './css/listado.css',
        './css/login.css',
        './css/print-report.css',
        './css/rcvpass.css',
        './css/registro_licencia.css',
        './css/registro.css',
        './css/req-quotes.css',
        './css/style.css',
        './css/upload-file.css',
        './super_css/super_anilox-detail.css',
        './super_css/super_index.css',
        './super_css/super_listado.css',
        './super_css/super_print-report.css',
        './super_css/super_req-quotes.css',
        './super_css/super_style.css',
        './assets/Anders Perú-logo.png',
        './assets/anders_logo_padding6.png',
        './assets/anders_logo.png',
        './assets/anders.jpg',
        './assets/anilox-placeholder.jpg',
        './assets/anilox1_2.jpeg',
        './assets/anilox1_3.jpeg',
        './assets/anilox2.jpg',
        './assets/anilox3_2.jpg',
        './assets/anilox4.jpg',
        './assets/anilox5.webp',
        './assets/favicon.ico',
        './assets/logo-placeholder.svg',
        './assets/logo.png',
        './assets/LogoANXSuite_blanco.png',
        './assets/LogoANXSuite.png',
        './assets/icons/manifest-icon-192.maskable.png',
        './assets/icons/manifest-icon-512.maskable.png',
        'https://fonts.googleapis.com/css2?family=Rajdhani:wght@300;400;500;600;700&display=swap',
        'https://fonts.googleapis.com/icon?family=Material+Icons+Sharp'
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