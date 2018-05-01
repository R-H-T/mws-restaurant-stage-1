import DataSource from '../../model/datasource';
import RestaurantListItemView from '../restaurant-list-item-view';

class RestaurantListView {
  constructor(values={ el: null, items: [], filters: [], sort: null }) {
    const { el, items, filters, sort } = values;
    this.el = el;
    this.dataSource = new DataSource(items, filters, sort);
    this.setup();
  }
  
  get restaurants() { return this.dataSource.items; }
  set restaurants(newValue) { this.dataSource.items = newValue; this.removeAllRows(); this.populateRows(); }
  set filters(newValue) { this.dataSource.filters = newValue; }
  get sort() { return this.dataSource.sort; }
  set sort(newValue) { this.dataSource.sort = newValue; }
  get listItemCount() { return this.dataSource.itemsCount; }
  
  setup() {
    this.el = this.el || document.getElementById('restaurants-list');
    this.populateRows();
  }
  
  clearRestaurants() {
    this.dataSource.clearItems();
    this.removeAllRows();
  }

  addRestaurants(restaurants) {
    this.restaurants = restaurants;
  }

  populateRows() {
    this.el.setAttribute('data-count', `${ (this.dataSource.itemsCount || 0) }`);
    this.restaurants.forEach(restaurant => {
      this.el.appendChild(new RestaurantListItemView(restaurant).el);
    });
    if (this.dataSource.itemsCount <= 0) {
      this.el.style.position = 'relative';
      this.noItemsView();
    }
  }
  
  noItemsView() {
    const el = document.createElement('div');
    el.style = `
      width: 90%;
      position: absolute;
      background: #eee;
      padding: 20px 0;
      margin-left: auto;
      margin-right: auto;
      border-radius: 10px;
      left: 0;
      top: 30px;
      right: 0;
      border: 1px solid #ddd;`;
    const p = document.createElement('p');
    p.style = `
      text-align: center;
      font-family: Roboto-light;
      vertical-align: middle;
      color: #666;
    `;
    p.innerHTML = '<span style="padding-right: 8px" aria-hidden> ⃝</span> No restaurants available';
    el.append(p);
    this.el.append(el);
    return el;
  }

  removeAllRows() {
    this.el = this.el || document.getElementById('restaurants-list');
    this.el.innerHTML = '';
  }
}

export default RestaurantListView;
