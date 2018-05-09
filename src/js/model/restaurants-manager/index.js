import idb from 'idb';
import dbc, { createUrl } from './config';
import DataSource, { ascendingSort } from '../datasource/';

const openDatabase = () => {
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

const getRestaurantsDbIndex = (db, byName = true) => {
  const dbKey = dbc.objectStoreKeys.restaurants;
  const indexKey = 'by-name';
  const kstx = db.transaction(dbKey).objectStore(dbKey);
  return (byName) ? kstx.index(indexKey) : kstx;
};

const extractNeighborhoods = (restaurants = null) => {
  if (!restaurants) return [];
  const sort = ascendingSort;
  // Get all neighborhoods from all restaurants
  const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood);
  // Remove duplicates from neighborhoods
  const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i);
  return uniqueNeighborhoods.sort(sort);
};

const extractCuisines = (restaurants = null) => {
  if (!restaurants) return [];
  const sort = ascendingSort;
  // Get all cuisines from all restaurants
  const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type);
  // Remove duplicates from cuisines
  const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i);
  return uniqueCuisines.sort(sort);
};

class RestaurantsManager extends DataSource {
  constructor(items = [], callback = (() => {}), sort = ((a, b) => (a.name > b.name))) {
    super(items, null, sort);
    this.neighborhoods = [];
    this.cuisines = [];
    this._dbPromise = openDatabase();
    this.updateLists(false).then(restaurants => {
      if (restaurants.length <= 0) {
        this.updateLists()
        .then(() => { callback(); })
        .catch(error => { console.error(error); });
      } else {
        callback();
      }
    })
    .catch(error => {
      console.error(error);
      this.updateLists(false).then(() => { callback(); })
      .catch(() => { callback(); });
    });
  }

  set restaurants(newValue) { super.items = newValue; }
  get restaurants() { return super.items; }
  
  updateLists(online = true, neighborhood = null, cuisine = null) {
    if (neighborhood && cuisine) {
      return this.fetchRestaurantsByNeighborhoodAndByCuisine(neighborhood, cuisine, online)
      .then(restaurants => {
        this.restaurants = restaurants;
        this.neighborhoods = extractNeighborhoods(restaurants);
        this.cuisines = extractCuisines(restaurants);
        return restaurants;
      });
    } else {
      return this.fetchRestaurants(online)
      .then(restaurants => {
        this.restaurants = restaurants;
        this.neighborhoods = extractNeighborhoods(restaurants);
        this.cuisines = extractCuisines(restaurants);
        return restaurants;
      });
    }
  }

  fetchRestaurants(online = true) {
    if (online) {
      return fetch(createUrl())
      .then(response => {
        if (response.status === 200) return response.json();
        return Promise.reject(`Request failed. Returned status of ${ response.status }`);
      })
      .then(data => {
        const restaurants = data.restaurants;
        RestaurantsManager.cacheRestaurants(restaurants);
        return restaurants;
      });
    } else {
      return this._dbPromise.then(db => {
        if (!db) return [];
        const index = getRestaurantsDbIndex(db);
        return index.getAll();
      });
    }
  }

  fetchRestaurantsByNeighborhoodAndByCuisine(neighborhood, cuisine, online = true) {
    return this.fetchRestaurants(online).then(restaurants => {
        let results = restaurants;
        if (cuisine != 'all') { // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != 'all') { // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        return Promise.resolve(results);
    });
  }

  static fetchRestaurantById(id = null, online = true) {
    if (!id) return Promise.reject('Invalid id.');
    const getRestaurant = db => {
      if (!db) return Promise.reject('Missing db.');
      const index = getRestaurantsDbIndex(db, false);
      return index.get(Number.parseInt(id))
        .then(restaurant => Promise.resolve(restaurant));
    };
    if (online) {
      return fetch(createUrl(id))
      .then(response => {
        if (response.status !== 200) return Promise.reject(`Request failed. Returned status of ${ response.status }`);
        return response.json();
      })
      .then(restaurant => {
        if (restaurant) {
          RestaurantsManager.cacheRestaurant(restaurant);
        }
        return Promise.resolve(restaurant);
      })
      .catch(() => {
        const dbPromise = openDatabase();
        return dbPromise.then(getRestaurant);
      });
    } else {
      const dbPromise = openDatabase();
      return dbPromise.then(getRestaurant)
      .then(restaurant => {
        if (!restaurant) {
          return RestaurantsManager.fetchRestaurantById(id, true)
        } else {
          return Promise.resolve(restaurant);
        }
      });
    }
  }

  static cacheRestaurant(restaurant) {
    RestaurantsManager.cacheRestaurants([restaurant]);
  }
  
  static cacheRestaurants(restaurants) {
    openDatabase()
    .then(db => {
      if (!db) return;
      var tx = db.transaction(dbc.objectStoreKeys.restaurants, 'readwrite');
      var store = tx.objectStore(dbc.objectStoreKeys.restaurants);
      restaurants.forEach(restaurant => store.put(restaurant));
    })
  }
}

export default RestaurantsManager;
