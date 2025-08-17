// Service Worker básico: cache-first para archivos estáticos
const CACHE = 'choco-cache-v3';
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', (e)=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (e)=>{
  e.waitUntil(caches.keys().then(keys=>Promise.all(keys.map(k=> k!==CACHE && caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener('fetch', (e)=>{
  const url = new URL(e.request.url);
  // cache estáticos del mismo origen
  if(url.origin === location.origin){
    e.respondWith(
      caches.match(e.request).then(res=> res || fetch(e.request).then(resp=>{
        // Actualiza caché “en caliente”
        if(e.request.method === 'GET'){
          const copy = resp.clone();
          caches.open(CACHE).then(c=>c.put(e.request, copy));
        }
        return resp;
      }).catch(()=> caches.match('./index.html')))
    );
  }
});
