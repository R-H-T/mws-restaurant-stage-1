import DataSource from '../../model/datasource';
import Toast from '../../view/toast';

/**
 *  Toast Controller
 * 
 * @class ToastController
 */
class ToastController {
  constructor(toasts = []) {
    this.dataSource = new DataSource(toasts);
    this.setup();
  }

  set toasts(newValue) { this.dataSource.items = newValue || []; }
  get toasts() { return this.dataSource.items; };
  
  setup() {
    this.el = document.createElement('div');
    this.el.className = 'toasts-container';
    this.render();
  }

  render() {
    this.el.innerHTML = '';
    for (const { el } of this.toasts) {
        this.el.appendChild(el);
    }
    this.el.setAttribute('data-count', `${ this.dataSource.itemsCount }`);
  }

  addToast(toast) {
    if (!toast) return;
    this.dataSource.addItem(toast);
    this.el.appendChild(toast.el);
    this.render();
  }

  getToastAtIndex(index) {
    return this.dataSource.getItem(index);
  }

  removeAllToasts() {
    this.dataSource.clearItems();
    this.render();
  }
  
  removeToast(toast) {
    const removedToast = this.dataSource.removeItem(toast);
    this.render();
    return removedToast;
  }

  makeToast(text, duration = 0, actions = []) {
    const toast = new Toast(text, duration, actions);
    this.addToast(toast);
    const callback = () => { this.removeToast(toast); };
    toast.show(text, duration, actions, callback);
  }
}

export default ToastController;
