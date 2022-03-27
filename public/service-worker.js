const CACHE_NAME = 'my-site-cache-v1';
const DATA_CACHE_NAME = 'data-cache-v1';

const FILES_TO_CACHE = [
  
  './index.html',
  // './favicon.ico',
  './manifest.json',
  './css/styles.css',
  './js/idb.js',
  './js/index.js',
  './icons/imagecompressor/icon-72x72-min.png',
  './icons/imagecompressor/icon-96X96-min.png',
  './icons/imagecompressor/icon-128X128-min.png',
  './icons/imagecompressor/icon-144X144-min.png',
  './icons/imagecompressor/icon-152X152-min.png',
  './icons/imagecompressor/icon-192X192-min.png',
  './icons/imagecompressor/icon-384X384-min.png',
  './icons/imagecompressor/icon-512X512-min.png',
]
 

// Install the service worker
self.addEventListener('install', function(evt) {
  evt.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Your files were pre-cached successfully!');
      return cache.addAll(FILES_TO_CACHE);
    })
  );

  // self.skipWaiting();
});

// Activate the service worker and remove old data from the cache
self.addEventListener('activate', function(evt) {
  evt.waitUntil(
    caches.keys().then(keyList => {
      return Promise.all(
        keyList.map(key => {
          if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
            console.log('Removing old cache data', key);
            return caches.delete(key);
          }
        })
      );
    })
  );

  self.clients.claim();
});

// Intercept fetch requests
self.addEventListener('fetch', function(evt) {
  if (evt.request.url.includes('/api/')) {
    evt.respondWith(
      caches
        .open(DATA_CACHE_NAME)
        .then(cache => {
          return fetch(evt.request)
            .then(response => {
              // If the response was good, clone it and store it in the cache.
              if (response.status === 200) {
                cache.put(evt.request.url, response.clone());
              }

              return response;
            })
            .catch(err => {
              // Network request failed, try to get it from the cache.
              return cache.match(evt.request);
            });
        })
        .catch(err => console.log(err))
    );

    return;
  }

  evt.respondWith(
    fetch(evt.request).catch(function() {
      return caches.match(evt.request).then(function(response) {
        if (response) {
          return response;
        } else if (evt.request.headers.get('accept').includes('text/html')) {
          // return the cached home page for all requests for html pages
          return caches.match('/');
        }
      });
    })
  );
});
