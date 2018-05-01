import idb from 'idb';
import dbc from './config';
import { IMAGE_CACHE_NAME } from './config';
import DBHelper from '../../utils/dbhelper';
import RestaurantListView from '../../view/restaurant-list-view';
import Toast from '../../view/toast';
import ToastAction from '../../view/toast/toast_action';
import ToastController from '../toast';
import TimeoutTracker from '../../gw/gw-timeout-tracker';
import CounterView from '../../gw/gw-counter-view';
import SelectView from '../../view/select-view';

/**
  * Update page and map for current restaurants.
  */
class IndexController {
  constructor() {
    this._timeoutTracker = new TimeoutTracker();
    this.cuisines;
    this.map;
    this.markers = [];
    this.restaurantListView = new RestaurantListView();
    this.toastsView = new Toast('');
    this._lostConnectionToast = new Toast('');

    // Bind
    this.updateRestaurants = this.updateRestaurants.bind(this);
    window.updateRestaurants = this.updateRestaurants;
    this.openSocket = this.openSocket.bind(this);
    
    // SW & Cache
    this.dbPromise = openDatabase();
    this.registerServiceWorker();
    
    // TODO: Add clean image cache with appropriate time interval
    // this.cleanImageCache();
    // setInterval(() => {
    //   this.cleanImageCache();
    // }, 1000 * 60 * 5); // Clean every five minutes.

    this._toastController = new ToastController();
    document.body.append(this._toastController.el);

    this.showCachedRestaurants().then(() => {
      this.openSocket();
    })
    .catch(error => {
      console.log('error', error);
    });

    this.fetchNeighborhoods();
    this.fetchCuisines();
    this.setupMap();
  }

  get restaurants() { return this.restaurantListView.restaurants || []; }
  set restaurants(newValue) { this.restaurantListView.restaurants = newValue || []; }
  
  clearRestaurants() { this.restaurantListView.clearRestaurants(); }

  showCachedRestaurants() {
    return this.dbPromise.then(db => {
      const isShowingRestaurants = (this.restaurantListView.listItemCount > 0);
      if (!db || isShowingRestaurants) return Promise.resolve();
      const restaurantsOSKey = dbc.objectStoreKeys.restaurants;
      const restaurantsObjectStoreKeyIndexes = dbc.objectStoreKeysIndexes[restaurantsOSKey];
      const primaryKeyIndexName = restaurantsObjectStoreKeyIndexes[0].name;
      const index = db.transaction(restaurantsOSKey).objectStore(restaurantsOSKey).index(primaryKeyIndexName);
      index.getAll().then(restaurants => {
        if (restaurants.length > 0) {
          this.restaurantListView.addRestaurants(restaurants.reverse());
        }
      });
    });
  }

  /**
   * Fetch all neighborhoods and set their HTML.
   */
  fetchNeighborhoods() {
    DBHelper.fetchNeighborhoods((error, neighborhoods) => {
      if (error) { // Got an error
        console.error('Error', error);
        return;
      }
      this.neighborhoods = neighborhoods;
      this.fillNeighborhoodsHTML();
    });
  }

  /**
   * Set neighborhoods HTML.
   */
  fillNeighborhoodsHTML(neighborhoods = this.neighborhoods) {
    const select = document.getElementById('neighborhoods-select');
    if (select === null) return;
    new SelectView(select, 'Neighborhoods', neighborhoods);
  }

  /**
   * Fetch all cuisines and set their HTML.
   */
  fetchCuisines() {
    DBHelper.fetchCuisines((error, cuisines) => {
      if (error) { // Got an error!
        console.error('Error', error);
        return;
      }
      this.cuisines = cuisines;
      this.fillCuisinesHTML();
    });
  }

  /**
   * Set cuisines HTML.
   */
  fillCuisinesHTML(cuisines = this.cuisines) {
    const select = document.getElementById('cuisines-select');
    if (select === null) return;
    new SelectView(select, 'Cuisines', cuisines);
  }

  setupMap() {
    /**
     * Initialize Google map, called from HTML.
     */
    window.initMap = googleMaps => {
      window.googleMaps = googleMaps;
      let loc = {
        lat: 40.722216,
        lng: -73.987501
      };
      this.map = new googleMaps.Map(document.getElementById('map'), {
        zoom: 12,
        center: loc,
        scrollwheel: false
      });
      this.updateRestaurants();
    };
  }

  /**
   * Update page and map for current restaurants.
   */
  updateRestaurants() {
    const cSelect = document.getElementById('cuisines-select');
    const nSelect = document.getElementById('neighborhoods-select');
    
    const cIndex = cSelect.selectedIndex;
    const nIndex = nSelect.selectedIndex;

    const cuisine = cSelect[cIndex].value;
    const neighborhood = nSelect[nIndex].value;

    DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, (error, restaurants) => {
      if (error) { // Got an error!
        console.error('Error', error);
        return;
      }
      this.cacheRestaurants(restaurants);
      this.resetRestaurants(restaurants);
      this.updateRestaurantViews();
    });
  }

  cacheRestaurants(restaurants) {
    // TODO: Cache restaurants with idb.
  }

  /**
   * Clear current restaurants, their HTML and remove their map markers.
   */
  resetRestaurants(restaurants) {
    this.markers = this.markers || [];
    // Remove all restaurants
    this.clearRestaurants();

    // Remove all map markers
    this.markers.forEach(marker => marker.setMap(null));
    this.markers = [];
    this.restaurants = restaurants;
  }

  /**
   * Create all restaurants HTML and add them to the webpage.
   */
  updateRestaurantViews (restaurants = this.restaurants) {
    this.restaurants = restaurants;
    this.addMarkersToMap();
  }

  /**
   * Add markers for current restaurants to the map.
   */
  addMarkersToMap(restaurants = this.restaurants) {
    restaurants.forEach(restaurant => {
      /* global google */
      // Add marker to the map
      const marker = DBHelper.mapMarkerForRestaurant(restaurant, this.map);
      google.maps.event.addListener(marker, 'click', () => {
          self.location.href = marker.url;
      });
      this.markers.push(marker);
    });
  }

  registerServiceWorker() {
    const sw = navigator.serviceWorker;
    
    if (!sw) return;

    sw.register('/sw.js', { scope: '/' }).then(reg => {
      if (!navigator.serviceWorker.controller) return;
      
      console.log('worker loaded.');

      if (reg.waiting) {
        console.log('updated worker waiting...');
        this.updateReady(reg.waiting);
        return;
      }

      if (reg.installing) {
        this.trackInstalling(reg.installing);
        return;
      }

      reg.addEventListener('updateFound', () => {
        this.trackInstalling(reg.installing);
      });
    })
    .catch(error => {
      console.log('Failed to load: ', error);
      return;
    });

    sw.addEventListener('controllerchange', () => {
      window.location.reload();
    });
  }

  trackInstalling(worker) {
    worker.addEventListener('statechange', () => {
      if (worker.state === 'installed') {
        this.updateReady(worker);
      }
    });
  }

  updateReady(worker) {
    console.log('SW: Update ready');
    let toast = {};
    const refreshAction = () => {
      const action = 'skipWaiting';
      worker.postMessage({ action });
      this._toastController.removeToast(toast);
    };
    const dismissAction = () => {
      this._toastController.removeToast(toast);
    };
    toast = new Toast(
      "New version available",
      0,
      [
        new ToastAction('Dismiss', dismissAction),
        new ToastAction('Refresh', refreshAction, true),
      ]
    );
    this._toastController.addToast(toast);
    toast.show();
  }

  cleanImageCache() {
    return this.dbPromise.then(db => {
      if (!db) return;
      let imagesNeeded = [];
      // TODO: Update clean cache criteria.
      const tx = db.transaction(dbc.objectStoreKeys.restaurants);
      return tx.objectStore(dbc.objectStoreKeys.restaurants)
      .getAll().then(restaurants => {
        restaurants.forEach(restaurant => {
          const photo = restaurant.photograph;
          if (photo) {
            imagesNeeded.push(photo);
          }
        });
        return caches.open(IMAGE_CACHE_NAME);
      }).then(cache => cache.keys().then(requests => {
          requests.forEach(request => {
            const url = new URL(request.url);
            if (!imagesNeeded.includes(url.pathname)) {
              cache.delete(request);
            }
          });
        })
      );
    });
  }

  openSocket() {
    const socketUrl = new URL('/updates', 'http://localhost:8181');
    socketUrl.protocol = 'ws';

    const ws = new WebSocket(socketUrl.href);

    ws.addEventListener('open', () => {
      console.log('[Socket Open]');
      if (this._lostConnectionToast) {
        this._toastController.removeToast(this._lostConnectionToast);
        this._lostConnectionToast = null;
      }
    });

    ws.addEventListener('message', event => {
      console.log('[Socket Message]', event.data);
      requestAnimationFrame(() => {
        this.onSocketMessage(event.data);
      });
    });

    ws.addEventListener('close', () => {
      console.log('[Socket Close]');
      requestAnimationFrame(() => {
        const timeoutMs = (1000 * 10); // Try to reconnect in 10 seconds
        const tid = this._timeoutTracker.createTimeout(this.openSocket, timeoutMs);
        const retryAction = () => {
          this._timeoutTracker.clearTimeout(tid);
          this._lostConnectionToast.hide();
          this.openSocket();
        };
        const toastActions = [new ToastAction('Retry now', retryAction, true)];
        const countdownView = function() {
          const label = 'Will try to reconnect in ';
          const view = new CounterView({ ms: timeoutMs }).secondsView(label);
          return view;
        }();
        if (!this._lostConnectionToast) {  
          this._lostConnectionToast = new Toast('Unable to connect', null, toastActions);
          this._lostConnectionToast.el.append(countdownView);
          this._toastController.addToast(this._lostConnectionToast);
        } else {
          this._lostConnectionToast.actions = toastActions;
          const counterView = this._lostConnectionToast.el.querySelector('.counter-view');
          if (counterView) counterView.parentNode.replaceChild(countdownView, counterView);
        }
        this._lostConnectionToast.show();
        this._toastController.render();
      });
    });
  }
}

function openDatabase () {
  if (!navigator.serviceWorker) return Promise.resolve();
  // Init all keys and configure any options as needed.
  Object.keys(dbc.objectStoreKeys).map(key => {
    dbc.objectStoreDefaultOptions[key] = {};
  });
  const restaurantsOSKey = dbc.objectStoreKeys.restaurants;
  dbc.objectStoreDefaultOptions[restaurantsOSKey].keyPath = dbc.objectKeys.restaurants.id;
  return idb.open(dbc.name, dbc.version, db => {
    const keyPath = 'id';
    const store = db.createObjectStore(restaurantsOSKey, { keyPath });
    const restaurantsObjectStoreKeyIndexes = dbc.objectStoreKeysIndexes[restaurantsOSKey];
    for (const { name, keyPath } of restaurantsObjectStoreKeyIndexes) {
      store.createIndex(name, keyPath);
    }
  });
};

export default IndexController;
