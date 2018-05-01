import loadGoogleMapsApi from 'load-google-maps-api';
import './sass/main.sass';
import { IndexController, RestaurantInfoController } from './js/controller';

{
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
    loadGoogleMapsApi({key: 'AIzaSyDfc7m94RiPm0y0mQlj5XySOM2q-nbW6N0', language: 'en'}).then(window.initMap);
  });
  route('/restaurant.html', () => {
    new RestaurantInfoController();
    loadGoogleMapsApi({key: 'AIzaSyDfc7m94RiPm0y0mQlj5XySOM2q-nbW6N0', language: 'en'}).then(window.initMap);
  });
}
