import 'intersection-observer';
import { IndexController, RestaurantInfoController } from './js/controller';
import './sass/main.sass';
import './sass/layouts.sass';
import loadGoogleMapsApi from 'load-google-maps-api';
{
  const mapsAPIKey = 'AIzaSyDfc7m94RiPm0y0mQlj5XySOM2q-nbW6N0'; // TODO: Change this to your API key

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
