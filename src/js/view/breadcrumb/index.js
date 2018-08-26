import '../../../sass/components/_breadcrumb.sass';
/**
 * The Breadcrumb View
 * 
 * @class Breadcrumb
 */
class Breadcrumb {
  constructor(el, links = []) {
    this.el = el || document.createElement('nav');
    this.links = links;
    this.setup();
  }
  setup() {
    this.el.setAttribute('aria-label', 'Breadcrumb');
    this.breadcrumbList = document.createElement('ul');
    this.el.append(this.breadcrumbList);
    this.links.forEach(link => {
      this.breadcrumbList.append(link.el);
    });
  }
}

export default Breadcrumb;
