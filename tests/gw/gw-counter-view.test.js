import CounterView from '../../src/js/gw/gw-counter-view';

/* global describe, beforeEach, it, expect */

describe('Counter View', () => {
  let sut;

  beforeEach(() => {
    sut = new CounterView({ ms: 300 });
  });

  it('should exist', () => {
    sut = new CounterView();
    expect(sut).toBeTruthy();
  });

  it('should all be null on empty init', () => {
    sut = new CounterView();
    expect(sut.values.ms).toBeNull();
    expect(sut.values.sec).toBeNull();
    expect(sut.values.min).toBeNull();
    expect(sut.values.hour).toBeNull();
    expect(sut.values.day).toBeNull();
    expect(sut.values.year).toBeNull();
  });

  it('should return seconds view', () => {
    expect(sut.secondsView().outerHTML).toBe('<span class=\"counter-view seconds\"></span>');
  });

  it('should return full view', () => {
    expect(sut.fullView().outerHTML).toBe('<span class=\"counter-view\"></span>');
  });

  it('should have milliseconds', () => {
    expect(sut.values.ms).not.toBeNull();
    sut.values.ms = null;
    expect(sut.values.ms).toBeNull();
  });

  it('should have seconds', () => {
    sut = new CounterView({ sec: 10 });
    expect(sut.values.sec).not.toBeNull();
    sut.values.sec = null;
    expect(sut.values.sec).toBeNull();
  });

  it('should have minutes', () => {
    sut = new CounterView({ min: 10 });
    expect(sut.values.min).not.toBeNull();
    sut.values.min = null;
    expect(sut.values.min).toBeNull();
  });

  it('should have hours', () => {
    sut = new CounterView({ hour: 10 });
    expect(sut.values.hour).not.toBeNull();
    sut.values.hour = null;
    expect(sut.values.hour).toBeNull();
  });

  it('should have days', () => {
    sut = new CounterView({ day: 10 });
    expect(sut.values.hour).not.toBeNull();
    sut.values.hour = null;
    expect(sut.values.hour).toBeNull();
  });

  it('should have years', () => {
    sut = new CounterView({ year: 10 });
    expect(sut.values.year).not.toBeNull();
    sut.values.year = null;
    expect(sut.values.year).toBeNull();
  });

  it('should calc time from now', () => {
    const ms = 10;
    sut = new CounterView({ ms });
    const expectedTime = Date.now() + ms;
    expect(sut.calcTimeFromNow()).toBe(expectedTime);
  });
});