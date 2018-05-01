import DBHelper from '../../utils/dbhelper';
import ResponsiveImage from '../../gw/gw-responsive-image';

/* global google */
class RestaurantInfoController {
  constructor() {
    this.restaurant;
    this.map;

    this.setupMap();
  }

  setupMap() {
    /**
     * Initialize Google map, called from HTML.
     */
    window.initMap = () => {
      this.fetchRestaurantFromURL((error, restaurant) => {
        if (error) { // Got an error!
          console.error(error);
        } else {
          this.map = new google.maps.Map(document.getElementById('map'), {
            zoom: 16,
            center: restaurant.latlng,
            scrollwheel: false,
          });
          this.fillBreadcrumb();
          DBHelper.mapMarkerForRestaurant(this.restaurant, this.map);
        }
      });
    };
  }

  /**
   * Get current restaurant from page URL.
   */
  fetchRestaurantFromURL(callback) {
    if (this.restaurant) { // restaurant already fetched!
      callback(null, this.restaurant)
      return;
    }
    const id = this.getParameterByName('id');
    if (!id) { // no id found in URL
      const error = 'No restaurant id in URL';
      callback(error, null);
    } else {
      DBHelper.fetchRestaurantById(id, (error, restaurant) => {
        this.restaurant = restaurant;
        if (!restaurant) {
          console.error(error);
          return;
        }
        this.fillRestaurantHTML();
        callback(null, restaurant);
      });
    }
  }

  /**
   * Create restaurant HTML and add it to the webpage
   */
  fillRestaurantHTML(restaurant = this.restaurant) {
    const name = document.getElementById('restaurant-name');
    name.innerHTML = restaurant.name;

    const address = document.getElementById('restaurant-address');
    address.innerHTML = restaurant.address;

    let image = document.getElementById('restaurant-img');
    const imgSrc = DBHelper.imageUrlForRestaurant(restaurant);
    (new ResponsiveImage(imgSrc, restaurant.name, null, null, image));

    const cuisine = document.getElementById('restaurant-cuisine');
    cuisine.innerHTML = restaurant.cuisine_type;

    // fill operating hours
    if (restaurant.operating_hours) {
      this.fillRestaurantHoursHTML();
    }
    // fill reviews
    this.fillReviewsHTML();
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
  fillReviewsHTML(reviews = this.restaurant.reviews) {
    const container = document.getElementById('reviews-container');
    const title = document.createElement('h2');
    title.innerHTML = 'Reviews';
    container.appendChild(title);

    if (!reviews) {
      const noReviews = document.createElement('p');
      noReviews.innerHTML = 'No reviews yet!';
      container.appendChild(noReviews);
      return;
    }
    const ul = document.getElementById('reviews-list');
    reviews.forEach(review => {
      ul.appendChild(this.createReviewHTML(review));
    });
    container.appendChild(ul);
  }

  /**
   * Create review HTML and add it to the webpage.
   */
  createReviewHTML(review) {
    const li = document.createElement('li');
    const name = document.createElement('p');
    name.innerHTML = review.name;
    li.appendChild(name);

    const date = document.createElement('p');
    date.innerHTML = review.date;
    li.appendChild(date);

    const rating = document.createElement('p');
    rating.innerHTML = `Rating: ${review.rating}`;
    rating.setAttribute('data-rating', `${review.rating}`);
    li.appendChild(rating);

    const comments = document.createElement('p');
    comments.innerHTML = review.comments;
    li.appendChild(comments);

    return li;
  }

  /**
   * Add restaurant name to the breadcrumb navigation menu
   */
  fillBreadcrumb(restaurant=this.restaurant) {
    const breadcrumb = document.getElementById('breadcrumb');
    const li = document.createElement('li');
    li.innerHTML = restaurant.name;
    breadcrumb.appendChild(li);
  }

  /**
   * Get a parameter by name from page query.
   */
  getParameterByName(name, query) {
    if (!query)
      query = self.location.search;
    const results = new URLSearchParams(query).get(name) || null;
    if (!results)
      return null;
    return results;
  }
}

export default RestaurantInfoController;
