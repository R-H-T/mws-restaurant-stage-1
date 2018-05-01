
class SelectView {
  constructor(el = null, label = null, items = []) {
    this.el = el || document.getElementById('cuisines-select');
    this.label = label;
    this.items = items;
    this.setup();
  }

  setup() {
    if (this.label) this.el.setAttribute('aria-label', this.label);
    this.render();
  }

  render() {
    this.el.setAttribute('data-count', this.items.length || 0);
    this.items.forEach((item, index) => {
      const option = document.createElement('option');
      option.setAttribute('data-index', index);
      option.innerHTML = item;
      option.value = item;
      this.el.append(option);
    });
  }
}

export default SelectView;
