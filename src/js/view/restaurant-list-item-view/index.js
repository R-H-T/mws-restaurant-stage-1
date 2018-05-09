import ResponsiveImage from '../../gw/gw-responsive-image';
import FileInfo from '../../gw/gw-fileinfo';

class RestaurantListItemView {
    constructor(restaurant) {
        const el = document.createElement('li');
        const imgSrc = imageUrlForRestaurant(restaurant);
        const { name, neighborhood, address } = restaurant;
        const responsiveImage = new ResponsiveImage(imgSrc, name);
        responsiveImage.className = 'restaurant-img';
        el.append(responsiveImage.el);

        const nameEl = document.createElement('h3');
        nameEl.innerHTML = name;
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

export const imageUrlForRestaurant = restaurant => {
    const info = new FileInfo(restaurant.photograph);
    const url = `/img/${info.name}-medium.${info.extension}`;
    return url;
};

export default RestaurantListItemView;
