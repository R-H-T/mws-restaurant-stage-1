import RestaurantListView from '../../src/js/view/restaurant-list-view';

/* global describe, beforeEach, it, expect, spyOn */
const restaurant1 = { "id": 1, "name": "Mission Chinese Food", "neighborhood": "Manhattan", "photograph": "1.jpg", "address": "171 E Broadway, New York, NY 10002", "latlng": {   "lat": 40.713829,   "lng": -73.989667 }, "cuisine_type": "Asian", "operating_hours": {   "Monday": "5:30 pm - 11:00 pm",   "Tuesday": "5:30 pm - 12:00 am",   "Wednesday": "5:30 pm - 12:00 am",   "Thursday": "5:30 pm - 12:00 am",   "Friday": "5:30 pm - 12:00 am",   "Saturday": "12:00 pm - 4:00 pm, 5:30 pm - 12:00 am",   "Sunday": "12:00 pm - 4:00 pm, 5:30 pm - 11:00 pm" }, "reviews": [{     "name": "Steve",     "date": "October 26, 2016",     "rating": 4,     "comments": "Mission Chinese Food has grown up from its scrappy Orchard Street days into a big, two story restaurant equipped with a pizza oven, a prime rib cart, and a much broader menu. Yes, it still has all the hits — the kung pao pastrami, the thrice cooked bacon —but chef/proprietor Danny Bowien and executive chef Angela Dimayuga have also added a raw bar, two generous family-style set menus, and showstoppers like duck baked in clay. And you can still get a lot of food without breaking the bank."   },   {     "name": "Morgan",     "date": "October 26, 2016",     "rating": 4,     "comments": "This place is a blast. Must orders: GREEN TEA NOODS, sounds gross (to me at least) but these were incredible!, Kung pao pastrami (but you already knew that), beef tartare was a fun appetizer that we decided to try, the spicy ma po tofu SUPER spicy but delicous, egg rolls and scallion pancake i could have passed on... I wish we would have gone with a larger group, so much more I would have liked to try!"   },   {     "name": "Jason",     "date": "October 26, 2016",     "rating": 3,     "comments": "I was VERY excited to come here after seeing and hearing so many good things about this place. Having read much, I knew going into it that it was not going to be authentic Chinese. The place was edgy, had a punk rock throwback attitude, and generally delivered the desired atmosphere. Things went downhill from there though. The food was okay at best and the best qualities were easily overshadowed by what I believe to be poor decisions by the kitchen staff." }] };
describe('Restaurant List View', () => {
  let sut;

  beforeEach(() => {
    const container = document.createElement('div');
    const el = document.createElement('ul');
    container.appendChild(el);
    sut = new RestaurantListView({ el });
  });

  it('should exist', () => {
    const el = document.createElement('ul');
    sut = new RestaurantListView({ el });
    expect(sut).toBeTruthy();
  });

  it('should populate rows when restaurants are set', () => {
    const el = document.createElement('ul');
    sut = new RestaurantListView({ el });
    const spy = spyOn(sut, 'populateRows');
    expect(sut.listItemCount).toBe(0);
    sut.restaurants = [restaurant1];
    expect(spy).toBeCalled();
    expect(sut.dataSource.itemsCount).toBe(1);
  });
});