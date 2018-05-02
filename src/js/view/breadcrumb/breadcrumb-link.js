/**
 * Breadcrumb Link
 * 
 * @class BreadcrumbLink
 */
class BreadcrumbLink {
  constructor(el, label = null, href = null) {
    this.el = el || document.createElement('li');
    this.linkEl = document.createElement('a');
    this.el.append(this.linkEl);
    this.label = label;
    this.href = href;
    this.render();
  }
  set label(newValue) { this._label = newValue || 'Unnamed link'; }
  get label() { return this._label; }
  set href(newValue) { this._href = newValue; }
  get href() { return this._href; }
  set isActive(newValue) { this._isActive = newValue || false; this.render(); }
  get isActive() { return this._isActive || false; }
  render() {
    (this.href && !(this.isActive)) ? (this.linkEl.href = this.href) : '';
    this.linkEl.innerText = this.label;
    const ariaCurrent = 'aria-current';
    (this.isActive) ? this.linkEl.setAttribute(ariaCurrent, 'page') : (this.linkEl.getAttribute(ariaCurrent) || null) ? this.linkEl.removeAttribute(ariaCurrent) : '';
  }
}

export default BreadcrumbLink;
