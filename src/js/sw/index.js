'use strict';
//
//  The Service Worker
//

const APP_ID = 'restaurant_reviews';
const MAIN_CACHE_VERSION = 1;
const MAIN_CACHE_BASE_NAME = `${ APP_ID }-static`;
const MAIN_CACHE_NAME = `${ MAIN_CACHE_BASE_NAME }-v${ MAIN_CACHE_VERSION }`;
const IMAGE_CACHE_NAME = `${ APP_ID }-content-imgs`;
const CURRENT_CACHES = {
  main: MAIN_CACHE_NAME,
  images: IMAGE_CACHE_NAME,
};
const WS_SKIP_WAITING_ACTION = 'skipWaiting';

/* global Promise */

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CURRENT_CACHES.main).then(cache => {
      return cache.addAll([
        'index.html',
        'restaurant.html',
        'main.js',
        'css/main.css',
        'https://fonts.gstatic.com/s/roboto/v15/2UX7WLTfW3W8TclTUvlFyQ.woff',
        'https://fonts.gstatic.com/s/roboto/v15/d-6IYplOFocCacKzxwXSOD8E0i7KZn-EPnyo3HZu7kw.woff',
      ]);
    })
  );
});

self.addEventListener('activate', event =>
  event.waitUntil(
    caches.keys().then(cacheNames =>
      Promise.all(cacheNames.filter(cacheName =>
        cacheName.startsWith(MAIN_CACHE_BASE_NAME)
        && !Object.values(CURRENT_CACHES).includes(cacheName)
      ).map(cacheName =>
          caches.delete(cacheName)
        )
      )
    )
  )
);

self.addEventListener('fetch', event => {
  const requestUrl = new URL(event.request.url);
  if (requestUrl.origin === location.origin) {
    if (requestUrl.pathname === '/') {
      event.respondWith(caches.match('index.html'));
      return;
    }
    if (requestUrl.pathname.startsWith('/img/')) {
      /* event.respondWith(fetch('/img/1-medium_x3.jpg')); */
      event.respondWith(serveImage(event.request));
      return;
    }
    if (requestUrl.pathname === '/restaurant.html') {
      event.respondWith(caches.match('restaurant.html'));
      return;
    }
  }
  event.respondWith(
    caches.match(event.request).then(response =>
      (response || fetch(event.request))
  ));
});

function serveImage(request) {
  const regex = /-((small|medium|large)|(small|medium|large)(_x\d))\.(jpg|jpeg|png)$/u
  const storageUrl = request.url.replace(regex, '');
  return caches.open(CURRENT_CACHES.images)
    .then(cache => cache.match(storageUrl).then(response => {
      if (response) return response;
      return fetch(request).then(networkResponse => {
        cache.put(storageUrl, networkResponse.clone());
        return networkResponse;
      });
    })
  );
}

self.addEventListener('message', event => {
  if (event.data.action === WS_SKIP_WAITING_ACTION) self.skipWaiting();
});
