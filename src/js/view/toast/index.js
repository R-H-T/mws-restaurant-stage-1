import _ from 'lodash';
import ToastAction from './toast_action';

/**
 *  Toast
 * 
 * @class Toast
 */
class Toast {
  constructor(text = 'no text', duration = 0, actions = []) {
    this._text = text;
    this._duration = duration;
    this._actions = actions;
    this.setup();
  }

  set actions(newValue) { this._actions = newValue || []; this.renderActionsView(); }
  get actions() { return this._actions || []; }
  set text(newValue) { this._text = newValue || ''; this.renderTextView(); }
  get text() { return this._text; }
  set duration(newValue) { this._duration = newValue || 0; }
  get duration() { return this._duration; }

  setup() {
    // Toast View
    this.el = document.createElement('div');
    this.el.className = 'toast';
    this.el.setAttribute('aria-hidden', 'true');
    // Text View
    this.textView = document.createElement('p');
    this.textView.className = 'toast-text';
    this.renderTextView();
    // Actions View
    this.actionsView = document.createElement('div');
    this.actionsView.className = 'actions';
    this.renderActionsView();
    // Add elements to the main view
    const elements = [this.textView, this.actionsView];
    this.appendChildren(this.el, elements);
  }

  renderActionsView() {
    this.actionsView.innerHTML = '';
    for (const el of this.getToastActions()) {
      this.actionsView.appendChild(el);
    }
    this.actionsView.setAttribute('data-count', `${ this.actions.length || 0 }`);
  }

  renderTextView() {
    this.textView.innerText = this.text;
  }

  getToastActions(actions = this.actions) {
    return _.map(actions, ({ title, action, isDefault }) => {
      const toastActions = new ToastAction(title, action, isDefault);
      return toastActions.el;
    });
  }

  appendChildren(el = this.el, elements = []) {
    for (const element of elements) {
      if (element === null) return;
      el.appendChild(element);
    }
  }

  show(text = this.text, duration = 0, actions = this.actions, callback = null) {
    if (this._currentTimeoutId) {
      clearTimeout(this._currentTimeoutId);
      this.hide();
      this._currentTimeoutId = null;
    }
    this.text = text;
    this.duration = duration;
    this.actions = actions;
    this.renderTextView();
    this.renderActionsView();
    this.el.classList.add('show');
    this.el.setAttribute('aria-hidden', 'false');
    if (duration && duration > 0) {
      this._currentTimeoutId = setTimeout(this.hide.bind(this, callback), duration);
    }
  }

  hide(callback = null, callbackTimeout = 500) {
    this._currentTimeoutId = null;
    this.el.classList.remove('show');
    this.el.setAttribute('aria-hidden', '');
    if (callback) setTimeout(callback, callbackTimeout);
  }
}

export default Toast;
