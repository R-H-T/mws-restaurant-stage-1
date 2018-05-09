import _ from 'lodash';

// Filter Presets
export const lessThanFilter = (value) => (item) => (item < value);
export const lessThanOrEqualToFilter = (value) => (item) => (item <= value);
export const greaterThanFilter = (value) => (item) => (item > value);
export const greaterThanOrEqualToFilter = (value) => (item) => (item >= value);
export const containsKeyValueFilter = (key, value) => (item) => (item[key] === value);
export const regexKeyValueFilter = (key, regex) => (item) => regex.test(item[key]);
export const regexFilter = (regex) => (item) => regex.test(item);

// Sort Presets
export const ascendingSort = (a, b) => (a > b);
export const descendingSort = (a, b) => (a < b);

/**
 * A Basic Multi-purpose Data Source
 * 
 * @class DataSource
 * @author Roberth Hansson-Tornéus (Gawee.Narak at gmail.com – github.com/R-H-T)
 * @since 2017
 * @version 1.0.0
 */
class DataSource {
  constructor(items = [], filter = null, sort = null) {
    this.items = items;
    this.filter = filter;
    this.sort = sort;
  }
  set items(newValue) { this._items = (((this.sort) ? newValue.sort(this.sort) : newValue) || []); }
  get items() {
    const items = (this.sort) ? ([...this._items].sort(this.sort) || []) : (this._items || []);
    return (this.filter && this.filter.length > 0) ? _.filter(items, this._filter) : items;
  }
  set filter(newValue) { this._filter = newValue || null; }
  get filter() { return this._filter; }
  set sort(newValue) { this._sort = newValue || null; }
  get sort() { return this._sort; }
  get itemsCount() { return this.items.length; }

  addItems(items) {
    this.items = [...this.items, ...items];
  }

  addItem(item) {
    this._items.push(item);
  }

  removeItem(itemToRemove) {
    return this.removeItemAtIndex(this._items.indexOf(itemToRemove));
  }

  removeItemAtIndex(index) {
    return (this.isIndexInRange(index)) ? (this._items.splice(index, 1)[0]) : null;
  }

  isIndexInRange(index) {
    return (!(index <= -1) && index <= this.itemsCount);
  }

  getItem(index) {
    return this.items[index] || null;
  }

  getItemWithFilter(filter) {
    return this.getItemListWithFilter(filter)[0];
  }

  getItemListWithFilter(filter) {
    return _.filter(this.items, filter);
  }
  
  clearItems() {
    this.items = null;
  }

  clearFilter() {
    this.filter = null;
  }

  clearSort() {
    this.sort = null;
  }
}

export default DataSource;
