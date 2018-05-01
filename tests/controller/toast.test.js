import ToastController from '../../src/js/controller/toast';
import MockToast from './mock/toast.model';

/* global describe, beforeEach, it, expect, spyOn */

describe('Toasts', () => {
  let sut;

  beforeEach(() => {
    const mockData = [
      new MockToast(),
      new MockToast(),
    ];
    sut = new ToastController(mockData);
  });

  it('should exist', () => {
    sut = new ToastController();
    expect(sut).toBeTruthy();
  });

  it('should have expected length', () => {
    expect(sut.toasts).toHaveLength(2);
  });

  it('should set toasts', () => {
    sut.toasts = [...sut.toasts, new MockToast()];
    expect(sut.toasts).toHaveLength(3);
  });
  
  it('should return empty array if set toasts is null', () => {
    sut.toasts = null;
    expect(sut.toasts).toEqual([]);
  });

  it('should set toasts', () => {
    sut.toasts = [...sut.toasts, new MockToast()];
    expect(sut.toasts).toHaveLength(3);
  });

  it('should add toast', () => {
    sut.addToast(new MockToast());
    expect(sut.toasts).toHaveLength(3);
  });

  it('should not add toast', () => {
    sut.addToast(null);
    expect(sut.toasts).toHaveLength(2);
  });

  it('should get toast at index', () => {
    const toast = sut.getToastAtIndex(0);
    expect(toast).toBeTruthy();
    expect(toast).toEqual(sut.toasts[0]);
  });

  it('should call render on addToast', () => {
    const spy = spyOn(sut, 'render');
    sut.addToast(new MockToast());
    expect(spy).toBeCalled();
  });

  it('should remove toast', () => {
    const toastToRemove = sut.getToastAtIndex(1);
    const removedToast = sut.removeToast(toastToRemove);
    expect(removedToast).toBeTruthy();
    expect(sut.toasts).toHaveLength(1);
  });

  it('should not remove toast', () => {
    const toastToRemove = sut.getToastAtIndex(-999);
    const removedToast = sut.removeToast(toastToRemove);
    expect(removedToast).toBeNull();
    expect(sut.toasts).toHaveLength(2);
  });

  it('should remove all toasts', () => {
    sut.removeAllToasts();
    expect(sut.toasts).toHaveLength(0);
  });

  it('should make a toast', () => {
    const toastText = 'A toast';
    sut.makeToast(toastText);
    expect(sut.toasts).toHaveLength(3);
    const toast = sut.getToastAtIndex(2);
    expect(toast.text).toEqual(toastText);
  });
});
