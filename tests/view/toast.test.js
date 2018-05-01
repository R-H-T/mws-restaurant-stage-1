import Toast from '../../src/js/view/toast';

class MockAction {
  constructor(title) {
    this.title = title;
  }
  set title(newValue) { this._title = newValue; }
  get title() { return this._title; }
}

/* global describe, beforeEach, it, expect, spyOn */

describe('Toast', () => {
  let sut;

  beforeEach(() => {
    sut = new Toast('', 0, null);
  });

  it('should exist', () => {
    sut = new Toast();
    expect(sut).toBeTruthy();
  });
  
  it('should show', () => {
    expect(sut.el.className).toEqual('toast');
    sut.show();
    expect(sut.el.className).toEqual('toast show');
  });

  it('should hide', () => {
    sut.show();
    expect(sut.el.className).toEqual('toast show');
    sut.hide();
    expect(sut.el.className).toEqual('toast');
  });

  it('should set actions', () => {
    sut.actions = [new MockAction('Action 1')];
    expect(sut.actions).toHaveLength(1);
  });

  it('should set text', () => {
    const text = 'Random text';
    sut.text = text;
    expect(sut.text).toEqual(text);
  });

  it('should get actions', () => {
      const actions = sut.getToastActions();
      expect(actions).toHaveLength(0);
  });
  
  it('should call render methods', () => {
    const spy1 = spyOn(sut, 'renderActionsView');
    const spy2 = spyOn(sut, 'renderTextView');
    sut.actions = [new MockAction('Action 1')];
    sut.text = 'Hello world!';
    expect(spy1).toBeCalled();
    expect(spy2).toBeCalled();
  });
});
