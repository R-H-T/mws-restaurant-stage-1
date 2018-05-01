//
// Configuration
//
const APP_ID = 'restaurant_reviews';
const DB_VERSION = 1;
export const IMAGE_CACHE_NAME = `${APP_ID}-content-imgs`;

// DB
const dbc = {
  version: DB_VERSION,
  name: APP_ID,
  objectStoreKeys: {
    restaurants: 'restaurants'
  },
  objectStoreKeysSinceVersion: {
    restaurants: 1
  },
  objectKeys: {},
  objectStoreKeysIndexes: {},
  objectStoreDefaultOptions: {},
};
// Configure each object store's key (optional).
dbc.objectKeys[dbc.objectStoreKeys.restaurants] = {
  id: 'id',
};
// Configure each object store's indexes (optional).
dbc.objectStoreKeysIndexes[dbc.objectStoreKeys.restaurants] = [
  {
    name: 'by-name',
    keyPath: 'name',
    sinceVersion: 1,
  },
];

export default dbc;
