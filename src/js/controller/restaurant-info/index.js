import DBHelper from '../../utils/dbhelper';
import ResponsiveImage from '../../gw/gw-responsive-image';
import Breadcrumb from '../../view/breadcrumb';
import BreadcrumbLink from '../../view/breadcrumb/breadcrumb-link';
import TimeoutTracker from '../../gw/gw-timeout-tracker';
import Toast from '../../view/toast';
import ToastController from '../toast';
import ToastAction from '../../view/toast/toast_action';
import CounterView from '../../gw/gw-counter-view';
import RestaurantsManager from '../../model/restaurants-manager';
import ReviewForm from '../../view/review-form';
import '../../../sass/info.sass';

export const urlForReviewsByRestaurantId = (restaurantId = -1) => {
  return (`http://localhost:1337/reviews/?restaurant_id=${ restaurantId }`);
};
export const urlForPostingRestaurantReview = review => {
  return (`http://localhost:1337/reviews/`);
};

const SW_SYNC_SUBMIT_REVIEW_TAG = 'background-sync-submit-review-tag';

/* global google */
class RestaurantInfoController {
  constructor() {
    this._timeoutTracker = new TimeoutTracker();
    this.toastsView = new Toast('');
    this._lostConnectionToast = new Toast('');
    this.restaurant;
    this.reviews = [];
    this.map;

    this.fillRestaurantHTML = this.fillRestaurantHTML.bind(this);
    this.fillRestaurantHoursHTML = this.fillRestaurantHoursHTML.bind(this);
    this.fillReviewsHTML = this.fillReviewsHTML.bind(this);
    this.fillBreadcrumb = this.fillBreadcrumb.bind(this);
    this.createReviewHTML = this.createReviewHTML.bind(this);

    // SW & Cache
    this.registerServiceWorker();

    this._toastController = new ToastController();
    document.body.append(this._toastController.el);

    this.setupMap();

    ['online', 'offline'].map(type => window.addEventListener(type, this.notifyNetworkStatus));
  }

  setupMap() {
    const updateView = restaurant => {
      this.restaurant = restaurant;
      requestAnimationFrame(() => {
        this.fillBreadcrumb();
        if (typeof google !== 'undefined') {
          DBHelper.mapMarkerForRestaurant(this.restaurant, this.map);
        }
      });
    };
    /**
     * Initialize Google map, called from HTML.
     */
    window.initMap = () => {
      requestAnimationFrame(() => {
        this.fetchRestaurant()
        .then(restaurant => {
          if (!restaurant) {
            return Promise.reject(`No restaurant found.`);
          }
          this.map = new google.maps.Map(document.getElementById('map'), {
            zoom: 16,
            center: restaurant.latlng,
            scrollwheel: false,
          });
          updateView(restaurant);
        })
        .catch((error) => { console.error(error); });
      });
    };
    if (typeof google === 'undefined') {
      this.fetchRestaurant()
        .then(updateView.bind(this))
        .catch(error => console.log(`Error: ${ error.message }`));
      return;
    }
  }

  /**
   * Get current reviews
   */
  fetchReviews() {
    if (this.reviews.length > 0) { // reviews already fetched!
      return Promise.resolve(this.reviews);
    }
    const id = this.getParameterByName('id');
    const url = urlForReviewsByRestaurantId(id);
    const query = parseInt(id);
    return (navigator.onLine) ? fetch(url)
      .then(result => result.json())
      .then(reviews => {
        RestaurantsManager.cacheReviews(reviews)
        this.reviews = reviews;
        return Promise.resolve(reviews);
      }) : RestaurantsManager.fetchReviewsFromCache(query).then(reviews => {
        this.reviews = reviews;
        return Promise.resolve(reviews);
      });
  }

  /**
   * Get current restaurant
   */
  fetchRestaurant() {
    if (this.restaurant) { // restaurant already fetched!
      return Promise.resolve(this.restaurant);
    }
    const id = this.getParameterByName('id');
    if (!id) { // no id found in URL
      const error = 'No restaurant id in URL';
      this.restaurant = {};
      return Promise.reject(error);
    } else {
      const updateViews = restaurant => {
        requestAnimationFrame(() => {
          this.restaurant = restaurant || null;
          this.fillRestaurantHTML();
        });
        return Promise.resolve(restaurant);
      };
      return RestaurantsManager.fetchRestaurantById(id, true)
      .then(updateViews)
      .catch(error => {
        console.error('Fetch by id error', error);
        return RestaurantsManager.fetchRestaurantById(id, false)
          .then(updateViews)
          .catch(error => {
            console.error('Fetch by id error #2', error);
          });
      });
    }
  }

  /**
   * Create restaurant HTML and add it to the webpage
   */
  fillRestaurantHTML(restaurant = this.restaurant) {
    const nameEl = document.getElementById('restaurant-name');
    const { name, address, cuisine_type, operating_hours } = restaurant;
    nameEl.innerHTML = name;

    const addressEl = document.getElementById('restaurant-address');
    addressEl.innerHTML = address;

    let imageEl = document.getElementById('restaurant-img');
    const imgSrc = DBHelper.imageUrlForRestaurant(restaurant);
    (new ResponsiveImage(imgSrc, name, null, null, imageEl));

    const cuisineEl = document.getElementById('restaurant-cuisine');
    cuisineEl.innerHTML = cuisine_type;

    // fill operating hours
    if (operating_hours) {
      this.fillRestaurantHoursHTML();
    }
    // fill reviews
    this.fetchReviews().then(this.fillReviewsHTML);
  }

  /**
   * Create restaurant operating hours HTML table and add it to the webpage.
   */
  fillRestaurantHoursHTML(operatingHours = this.restaurant.operating_hours) {
    const hours = document.getElementById('restaurant-hours');
    for (let key in operatingHours) {
      const row = document.createElement('tr');

      const day = document.createElement('td');
      day.innerHTML = key;
      row.appendChild(day);

      const time = document.createElement('td');
      time.innerHTML = operatingHours[key];
      row.appendChild(time);

      hours.appendChild(row);
    }
  }

  /**
   * Create all reviews HTML and add them to the webpage.
   */
  fillReviewsHTML(reviews = this.reviews) {
    const container = document.getElementById('reviews-container');
    const title = document.createElement('h3');
    title.innerHTML = 'Reviews';
    container.appendChild(title);

    if (!reviews || !reviews.length) {
      const noReviews = document.createElement('p');
      noReviews.innerHTML = `${ (!navigator.onLine) ? `Couldn\'t fetch reviews. Reason: You appear to be offline. ${ ('SyncManager' in window) ? 'But don\'t worry, you can still post and it will get sent once you\'re online again.' : '' }` : '' }`;
      container.appendChild(noReviews);
      this.reviewForm = new ReviewForm({ onSubmitHandler: this.onSubmitReview.bind(this) });
      container.appendChild(document.createElement('hr'));
      container.appendChild(this.reviewForm.el);
      return;
    }
    const ul = document.getElementById('reviews-list');
    reviews.forEach(review => {
      ul.appendChild(this.createReviewHTML(review));
    });
    container.appendChild(ul);
    this.reviewForm = new ReviewForm({ onSubmitHandler: this.onSubmitReview.bind(this) });
    container.appendChild(document.createElement('hr'));
    container.appendChild(this.reviewForm.el);
  }

  /**
   * Create review HTML and add it to the webpage.
   */
  createReviewHTML(review) {
    const { name, createdAt, rating, comments } = review;
    const li = document.createElement('li');
    const nameEl = document.createElement('p');
    nameEl.innerHTML = name;
    li.appendChild(nameEl);

    const dateEl = document.createElement('p');
    dateEl.innerHTML = (new Date(createdAt)).toLocaleDateString('ja');
    li.appendChild(dateEl);

    const ratingEl = document.createElement('p');
    ratingEl.innerHTML = `Rating: ${ rating }`;
    ratingEl.setAttribute('data-rating', `${ rating }`);
    li.appendChild(ratingEl);

    const commentsEl = document.createElement('p');
    commentsEl.innerHTML = comments;
    li.appendChild(commentsEl);

    return li;
  }

  /**
   * Add restaurant name to the breadcrumb navigation menu
   */
  fillBreadcrumb(restaurant = this.restaurant) {
    if (document.getElementById('breadcrumb').childElementCount > 0) return;
    const currentLink = new BreadcrumbLink(null, restaurant.name);
    currentLink.isActive = true;
    const links = [
      new BreadcrumbLink(null, 'Home', '/'),
      currentLink
    ];
    new Breadcrumb(document.getElementById('breadcrumb'), links);
  }

  /**
   * Get a parameter by name from page query.
   */
  getParameterByName(name, query) {
    if (!query) query = self.location.search;
    const results = new URLSearchParams(query).get(name) || null;
    if (!results) return null;
    return results;
  }

  putReviewInOutbox(review) { return RestaurantsManager.cacheReviewsPending([review]);

  }

  onSubmitReview(e, data) {
      e.preventDefault();
      const restaurant_id = parseInt(this.getParameterByName('id'));
      data.restaurant_id = restaurant_id;
      const sw = navigator.serviceWorker;
      const fallbackPost = ({ name, email, comments, rating, createdAt }) => {
        console.debug('using fallback handler to submit form');
        const url = urlForPostingRestaurantReview(restaurant_id);
        const review = { restaurant_id, name, email, comments, rating, createdAt };
        return fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Accept': 'application/json',
          },
          body: JSON.stringify(review),
        });
      };
      if ('SyncManager' in window) {
        this.putReviewInOutbox(data).then(() => sw.ready.then(reg => {
            reg.sync.register(`${ SW_SYNC_SUBMIT_REVIEW_TAG }${ data.id }`).then(() => {
                window.console.debug('Sync registered: ', SW_SYNC_SUBMIT_REVIEW_TAG);
            });
        })).catch(error => {
          console.error('Error:', error.message);
          fallbackPost(data).catch(console.error);
        })
        .then(() => { window.history.go() })
      } else {
        fallbackPost(data).then(()=> {
          window.history.go();
        }).catch(console.error);
      }
  }

  notifyNetworkStatus(e) {
    console.debug(`Network status: ${ e.type }`)
  }

  registerServiceWorker() {
    const sw = navigator.serviceWorker;

    if (!sw) return;

    sw.register('/sw.js', { scope: '/' })
    .then(reg => {
      if (!navigator.serviceWorker.controller) return;

      console.debug('worker loaded.');

      if (reg.waiting) {
        console.debug('updated worker waiting...');
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

      return reg;
    })
    .catch(error => {
      console.debug('Failed to load: ', error);
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
    console.debug('SW: Update ready');
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

  openSocket() {
    const isSSL = (window.location.protocol === 'https:');
    const protocol = `ws${ (isSSL) ? 's' : '' }`;
    const socketUrl = new URL('/updates', `${ protocol }://localhost:${ (isSSL) ? 8443 : 8181 }`);
    socketUrl.protocol = protocol;

    const ws = new WebSocket(socketUrl.href);

    ws.addEventListener('open', () => {
      console.debug('[Socket Open]');
      if (this._lostConnectionToast) {
        this._toastController.removeToast(this._lostConnectionToast);
        this._lostConnectionToast = null;
      }
    });

    ws.addEventListener('message', event => {
      console.debug('[Socket Message]', event.data);
      requestAnimationFrame(() => {
        this.onSocketMessage(event.data);
      });
    });

    ws.addEventListener('close', () => {
      console.debug('[Socket Close]');
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

export default RestaurantInfoController;
