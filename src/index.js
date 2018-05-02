import loadGoogleMapsApi from 'load-google-maps-api';
import './sass/main.sass';
import { IndexController, RestaurantInfoController } from './js/controller';

{
  const mapsAPIKey = 'YOUR_GOOGLE_MAPS_API_KEY_HERE'; // TODO: Change this to your API key

  const route = (pathname, callback) => {
    if (pathname.constructor === Array) {
      for (var pn of pathname) {    
        if (route(pn, callback)) return true;
      }
    }
    const result = (self.location.pathname === pathname);
    if (result) {
      callback();
    }
    return result;
  };

  route(['/', '/index.html'], () => {
    new IndexController();
    loadGoogleMapsApi({key: mapsAPIKey, language: 'en'}).then(window.initMap);
  });
  route('/restaurant.html', () => {
    new RestaurantInfoController();
    loadGoogleMapsApi({key: mapsAPIKey, language: 'en'}).then(window.initMap);
  });
}
