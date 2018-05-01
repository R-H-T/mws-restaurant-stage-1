class ToastAction {
  constructor(title = 'No title', action = ((e)=>{}), isDefault = false) {
    this.title = title;
    this.action = action;
    this.isDefault = isDefault;
    this.setupView();
  }
  setupView() {
    this.el = document.createElement('button');
    this.el.innerText = this.title;
    this.el.addEventListener('click', this.action.bind(this));
    this.el.className = `toast-action${(this.isDefault) ? ' default' : ''}`;
  }
}

export default ToastAction;
