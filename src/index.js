import 'intersection-observer';
import { IndexController, RestaurantInfoController } from './js/controller';
import './sass/layouts.sass';
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
  });
  
  route('/restaurant.html', () => {
    new RestaurantInfoController();
  });
}
