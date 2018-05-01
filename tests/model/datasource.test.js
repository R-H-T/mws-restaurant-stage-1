import DataSource from "./../../src/js/model/datasource/";

class MockObject {
  constructor(id, name = 'Untitled', price = 0, quantity = 1, date = Date.now()) {
    this.id = id;
    this.name = name;
    this.price = price;
    this.quantity = quantity;
    this.date = date;
  }
  get subTotal() { return (this.price !== 0) ? this.price * this.quantity : 0 }
}

/* global describe, beforeEach, it, expect */

describe('Data Source', () => {
  let sut;

  beforeEach(() => {
    const mockData = [
      new MockObject(0, 'First Object', 25.95, 3),
      new MockObject(1, 'Second Object', 10.55),
    ];
    sut = new DataSource(mockData);
  });

  it('should exist', () => {
    sut = new DataSource();
    expect(sut).toBeTruthy();
  });

  it('should get items', () => {
    expect(sut.items).toBeTruthy();
  });

  it('should have expected length', () => {
    expect(sut._items).toHaveLength(2);
    expect(sut.items).toHaveLength(2);
    expect(sut.itemsCount).toEqual(2);
  });

  it('should add item', () => {
    sut.addItem(new MockObject(2, 'Third Object'));
    expect(sut.itemsCount).toEqual(3);
  });

  it('should add multiple items', () => {
    sut.addItems([
      new MockObject(2, 'Third Object'),
      new MockObject(3, 'Fourth Object'),
      new MockObject(4, 'Fifth Object'),
      new MockObject(5, 'Sixth Object'),
    ]);
    expect(sut.itemsCount).toEqual(6);
  });

  it('should get empty array when items are initialized with null while sort and filter are active', () => {
    sut = new DataSource();
    // sut.sort = (a, b) => (a < b);
    sut.filter = (item) => (item.id < 0);
    expect(sut.items).toEqual([]);
  });

  it('should get item at index', () => {
    const index = 1;
    const item = sut.getItem(index);
    expect(item).toBeTruthy();
    expect(item.id).toEqual(index);
    expect(item.name).toEqual('Second Object');
  });

  it('should get null when exceeding index range', () => {
    const item = sut.getItem(-999);
    expect(item).toBeNull();
  });

  it('should remove item at index', () => {
    const removedItem = sut.removeItemAtIndex(1);
    expect(removedItem).toBeTruthy();
    expect(removedItem.id).toEqual(1);
    expect(sut.itemsCount).toEqual(1);
  });

  it('should return null when trying to remove an item exceeding index range', () => {
    const item = sut.removeItemAtIndex(999);
    expect(item).toBeNull();
  });

  it('should remove item with item', () => {
    const itemToRemove = sut.getItem(1);
    const removedItem = sut.removeItem(itemToRemove);
    expect(removedItem).toBeTruthy();
    expect(removedItem.id).toEqual(1);
    expect(removedItem.name).toEqual('Second Object');
    expect(sut.itemsCount).toEqual(1);
  });

  it('should get empty array if items set with null', () => {
    sut.items = null;
    expect(sut.items).toEqual([]);
  });

  it('should remove all items', () => {
    sut.clearItems();
    expect(sut.itemsCount).toEqual(0);
  });

  it('should filter item', () => {
    const filter = item => item.name.startsWith('Second');
    const item = sut.getItemWithFilter(filter);
    expect(item).toBeTruthy();
    expect(item.name).toEqual('Second Object');
    expect(sut.itemsCount).toEqual(2);
    sut.filter = filter;
    expect(sut.itemsCount).toEqual(1);
  });

  it('should filter multiple items', () => {
    sut.addItems([
      new MockObject(2, 'Vegeterian Burger'),
      new MockObject(3, 'Pizza Burger'),
      new MockObject(4, 'Burger Roll'),
    ]);
    expect(sut.itemsCount).toEqual(5);
    const filter = item => /Burger/.test(item.name);
    const items = sut.getItemListWithFilter(filter);
    expect(items).toBeTruthy();
    expect(items).toHaveLength(3);
    expect(sut.itemsCount).toEqual(5);
  });

  it('should clear filters', () => {
    const filter = item => item.name.startsWith('Second');
    sut.filter = filter;
    expect(sut.itemsCount).toEqual(1);
    sut.clearFilter();
    expect(sut.itemsCount).toEqual(2);
  });

  it('should sort items', () => {
    expect(sut.getItem(0).name).toEqual('First Object');
    const sortById = (rhs, lhs) => (rhs.id < lhs.id);
    sut.sort = sortById;
    expect(sut.getItem(0).name).toEqual('Second Object');
  });

  it('should clear sort', () => {
    const sortById = (rhs, lhs) => (rhs.id < lhs.id);
    sut.sort = sortById;
    expect(sut.getItem(0).name).toEqual('Second Object');
    sut.clearSort();
    expect(sut.sort).toBeNull();
    expect(sut.getItem(0).name).toEqual('First Object');
  });
});
