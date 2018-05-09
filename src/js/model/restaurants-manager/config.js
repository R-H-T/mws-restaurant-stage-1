//
// Configuration
//
const APP_ID = 'restaurant_reviews';
const DB_VERSION = 1;
export const IMAGE_CACHE_NAME = `${APP_ID}-content-imgs`;

export const createUrl = (id = null, neighborhood = null, cuisine = null) => {
  const isSSL = (window.location.protocol === 'https:');
  const protocol = `http${(isSSL) ? 's' : ''}:`;
  const url = new URL(`${ protocol }//localhost`);
  url.port = (isSSL) ? 8443 : 8181;
  url.pathname = '/restaurants';
  if (id && !cuisine && !neighborhood) { url.pathname += `/${id}` }
  if (cuisine && neighborhood) { url.pathname += `/neighborhood/${neighborhood}/cuisine/${cuisine}` }
  if (!cuisine && neighborhood) { url.pathname += `/neighborhood/${neighborhood}` }
  if (cuisine && !neighborhood) { url.pathname += `/cuisine/${cuisine}` }
  return url.toString();
};

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
  {
    name: 'by-neighborhood',
    keyPath: 'neighborhood',
    sinceVersion: 1,
  },
  {
    name: 'by-cuisine',
    keyPath: 'cuisine_type',
    sinceVersion: 1,
  },
];

export default dbc;
