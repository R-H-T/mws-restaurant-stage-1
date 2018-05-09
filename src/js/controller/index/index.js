import { IMAGE_CACHE_NAME } from '../../model/restaurants-manager/config';
import DBHelper from '../../utils/dbhelper';
import RestaurantListView from '../../view/restaurant-list-view';
import Toast from '../../view/toast';
import ToastAction from '../../view/toast/toast_action';
import ToastController from '../toast';
import TimeoutTracker from '../../gw/gw-timeout-tracker';
import CounterView from '../../gw/gw-counter-view';
import SelectView from '../../view/select-view';
import RestaurantsManager from '../../model/restaurants-manager';
import sleep from '../../utils/sleep';

/**
  * Update page and map for current restaurants.
  */
class IndexController {
  constructor() {
    this.map;
    this.markers = [];
    this.toastsView = new Toast('');
    this._lostConnectionToast = new Toast('');
    this._timeoutTracker = new TimeoutTracker();

    // Bind
    this.updateRestaurants = this.updateRestaurants.bind(this);
    this.updateRestaurantViews = this.addMarkersToMap.bind(this);
    this.openSocket = this.openSocket.bind(this);
    this.fillCuisinesHTML = this.fillCuisinesHTML.bind(this);
    this.fillNeighborhoodsHTML = this.fillNeighborhoodsHTML.bind(this);
    this.resetRestaurants = this.resetMarkers.bind(this);
    this.addMarkersToMap = this.addMarkersToMap.bind(this);
    
    // SW
    this.registerServiceWorker();
    
    // TODO: Add clean image cache with appropriate time interval
    // this.cleanImageCache();
    // setInterval(() => {
    //   this.cleanImageCache();
    // }, 1000 * 60 * 5); // Clean every five minutes.

    this._toastController = new ToastController();
    document.body.append(this._toastController.el);
    
    const callback = () => {
      requestAnimationFrame(() => {
        this.resetMarkers();
        this.fillNeighborhoodsHTML(this._restaurantsManager.neighborhoods);
        this.fillCuisinesHTML(this._restaurantsManager.cuisines);
        this.restaurantListView.populateRows();
        this.openSocket();
      });
    };
    this._restaurantsManager = new RestaurantsManager(null, callback);
    this.restaurantListView = new RestaurantListView({ dataSource: this._restaurantsManager });

    this.setupMap();
  }

  get restaurants() { return this.restaurantListView.restaurants || []; }
  set restaurants(newValue) { this.restaurantListView.restaurants = newValue || []; }
  get neighborhoods() { this._restaurantsManager.neighborhoods || []; }
  get cuisines() { this._restaurantsManager.cuisines || []; }

  /**
   * Set neighborhoods HTML.
   */
  fillNeighborhoodsHTML(neighborhoods = this.neighborhoods) {
    const select = document.getElementById('neighborhoods-select');
    if (select === null) return;
    if (!(select.children.length <= 1)) return;
    select.onchange = () => { this.updateRestaurants() };
    new SelectView(select, 'Neighborhoods', neighborhoods);
  }

  /**
   * Set cuisines HTML.
   */
  fillCuisinesHTML(cuisines = this.cuisines) {
    const select = document.getElementById('cuisines-select');
    if (select === null) return;
    if (!(select.children.length <= 1)) return;
    select.onchange = () => { this.updateRestaurants() };
    new SelectView(select, 'Cuisines', cuisines);
  }

  setupMap() {
    /**
     * Initialize Google map, called from HTML.
     */
    window.initMap = googleMaps => {
      sleep(100)
      .then(() =>
        requestAnimationFrame(() => {
          if (typeof google === 'undefined') {
            this.updateRestaurants();
            return;
          }
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
        })
      );
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

    this._restaurantsManager.fetchRestaurantsByNeighborhoodAndByCuisine(cuisine, neighborhood);
    
    const updateViews = () => requestAnimationFrame(() => {
      this.resetMarkers();
      this.addMarkersToMap();
      this.fillNeighborhoodsHTML(this._restaurantsManager.neighborhoods);
      this.fillCuisinesHTML(this._restaurantsManager.cuisines);
      this.restaurantListView.populateRows();
    });

    this._restaurantsManager.updateLists(true, neighborhood, cuisine)
    .then(updateViews)
    .catch(() => {
      this._restaurantsManager.updateLists(false, neighborhood, cuisine)
      .then(updateViews)
      .catch(error => { console.log('Error on second attempt:', error); });
    });
  }

  /**
   * Reset map markers.
   */
  resetMarkers() {
    if (typeof google === 'undefined') return;
    this.markers = this.markers || [];
    // Remove all map markers
    this.markers.forEach(marker => { marker.setMap(null); });
    this.markers = [];
  }

  /**
   * Add markers for current restaurants to the map.
   */
  addMarkersToMap(restaurants = this.restaurants) {
    restaurants.forEach(restaurant => {
      /* global google */
      if (typeof google === 'undefined') return;
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
    const isSSL = (window.location.protocol === 'https:');
    const protocol = `ws${ (isSSL) ? 's' : '' }:`;
    const socketUrl = new URL('/updates', `${ protocol }//localhost:${ (isSSL) ? 8443 : 8181 }`);
    socketUrl.protocol = protocol;

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

export default IndexController;
