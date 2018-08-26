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
const SW_SYNC_SUBMIT_REVIEW_TAG = 'background-sync-submit-review-tag';

/* global Promise */

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CURRENT_CACHES.main).then(cache => {
      return cache.addAll([
        'index.html',
        'manifest.json',
        'restaurant.html',
        'main.js',
        'css/main.css',
        'https://fonts.googleapis.com/css?family=Roboto:300,400,500,700',
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
      /* event.respondWith(fetch('/img/1-medium_x3.jpg')); */ //
      event.respondWith(serveImage(event.request));
      return;
    }
    if (requestUrl.pathname.startsWith('/restaurant.html')) {
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
  return serveContent(request, regex, CURRENT_CACHES.images);
}

function serveContent(request, regex = null, cacheName) {
  const { url } = request;
  const storageUrl = (regex) ? url.replace(regex, '') : url ;
  return caches.open(cacheName)
    .then(cache => cache.match(storageUrl).then(response => {
      if (response) return response;
      return fetch(request).then(networkResponse => {
        cache.put(storageUrl, networkResponse.clone());
        return networkResponse;
      });
    })
  );
}

function submitReviewWithBackgroundSync(itemId) {
  console.log('submitting in background');
  return new Promise((resolve, reject) => {
      const DB_NAME = 'restaurant_reviews';
      const openDb = () => new Promise((resolve, reject) => {

        const request = indexedDB.open(DB_NAME, 1);

        request.addEventListener('error', () => {
          return reject('Failed to open the Outbox DB');
        });

        request.addEventListener('success', () => {
          const db = request.result;
          return resolve(db);
        });
      });

      return openDb().then(db => new Promise((resolve, reject) => {
        const dbKey = 'reviews_pending';
        const store = db.transaction([dbKey], 'readwrite').objectStore(dbKey);
        const reviewsPending = store.getAll(parseInt(itemId));
        reviewsPending.onsuccess = event => {
          const { target: { result } } = event;
          // console.log('reviewsPending.result', result);
          if (result.length > 0) {
            const promises = [];
            for (const review of result) {
              const { restaurant_id, email, name, rating, comments, createdAt } = review;
              const url = `http://localhost:1337/reviews/?restaurant_id=${ restaurant_id }`;
              const body = JSON.stringify({ restaurant_id, name, email, comments, rating, createdAt });
              promises.push(fetch(url, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json; charset=utf-8',
                  'Accept': 'application/json',
                },
                body,
                })
              .then(response => {
                if (response.status == 201 || response.status == 200) {
                  return new Promise(() => {
                    const dbKey = 'reviews_pending';
                    const store = db.transaction([dbKey], 'readwrite').objectStore(dbKey);
                    const req = store.delete(review.id);
                    req.onsuccess = () => {
                      console.debug('Remove submitted pending review.');
                      return Promise.resolve();
                    }
                    req.onerror = event => {
                      console.debug('Failed to remove submitted pending review.');
                      return Promise.reject(event);
                    }
                  });
                }
              })
              .catch(error => {
                  console.log('Error in request', error.message);
                return Promise.resolve(); // Keep going.
              }));
            }
            return Promise.all(promises);
          } else {
            return Promise.resolve()
          }
        };
        reviewsPending.onerror = () => {
          return Promise.reject('failed to fetch from store');
        }
      }));
    });
}

self.addEventListener('sync', event => {
  const { tag } = event;
  if (tag.startsWith(SW_SYNC_SUBMIT_REVIEW_TAG)) event.waitUntil(submitReviewWithBackgroundSync(tag.substr((SW_SYNC_SUBMIT_REVIEW_TAG.length), (tag.length - SW_SYNC_SUBMIT_REVIEW_TAG.length + 1))));
});

self.addEventListener('message', event => {
  if (event.data.action === WS_SKIP_WAITING_ACTION) self.skipWaiting();
});
