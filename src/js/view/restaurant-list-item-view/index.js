import ResponsiveImage from '../../gw/gw-responsive-image';
import FileInfo from '../../gw/gw-fileinfo';
import FavoriteButton from '../favorite-button';

class RestaurantListItemView {
    constructor(restaurant) {
        const el = document.createElement('li');
        const imgSrc = imageUrlForRestaurant(restaurant);
        const { name, neighborhood, address, is_favorite = "false" } = restaurant;
        const responsiveImage = new ResponsiveImage(imgSrc, name);
        responsiveImage.className = 'restaurant-img';
        el.append(responsiveImage.el);

        const fb = new FavoriteButton(null, `Make ${ name } favorite`, (newState) => { /*window.console.debug(`is: ${ newState }`);*/ });
        const favoriteButtonEl = fb.el;
        fb.isOn = (is_favorite + '' == 'true' || is_favorite == true) ? true : false;
        fb.render();
        el.append(favoriteButtonEl);
        const favoriteToggleHandler = e => {
            e.preventDefault();
            const url = urlForFavoriteToggleRestaurant(restaurant);
            fetch(url, {
                method: 'PUT',
            }).then(() => {
                fb.render();
            }).catch(console.debug);

        };
        fb.el.addEventListener('click', favoriteToggleHandler);

        const nameEl = document.createElement('h3');
        nameEl.innerHTML = name;
        nameEl.title = name
        el.append(nameEl);

        const neighborhoodEl = document.createElement('p');
        neighborhoodEl.innerHTML = neighborhood;
        el.append(neighborhoodEl);

        const addressEl = document.createElement('p');
        addressEl.innerHTML = address;
        el.append(addressEl);

        const moreEl = document.createElement('a');
        moreEl.innerHTML = 'View Details';
        moreEl.setAttribute('role', 'button');
        moreEl.setAttribute('aria-label', `View details for ${ name }`);
        moreEl.href = urlForRestaurant(restaurant);
        el.append(moreEl);

        this.el = el;
    }
};

export const urlForRestaurant = restaurant => {
    return (`./restaurant.html?id=${ restaurant.id }`);
};

export const urlForFavoriteToggleRestaurant = restaurant => {
    return (`http://localhost:1337/restaurants/${ restaurant.id }/?is_favorite=${(!(restaurant.is_favorite == 'true') ? 'true' : 'false')}`);
};

export const urlForReviewsByRestaurantId = (restaurantId = -1) => {
    return (`http://localhost:1337/reviews/?restaurant_id=${ restaurantId }`);
};

export const urlForPostingRestaurantReview = review => {
    return (`http://localhost:1337/reviews/`);
};

export const imageUrlForRestaurant = restaurant => {
    const info = new FileInfo(restaurant.photograph);
    const url = `/img/${info.name}-medium.${info.extension}`;
    return url;
};

export default RestaurantListItemView;
