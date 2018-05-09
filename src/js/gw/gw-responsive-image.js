import FileInfo from './gw-fileinfo';
/**
 * A Responsive Image
 *
 * @class ResponsiveImage
 */
class ResponsiveImage {
  constructor(src = '', alt = '', id = '', className = '', imageElement = null) {
    let imageSource =  src;
    this.imageAlt = alt;
    this.imageId = id;
    this.imageClassName = className;
    this.intersectionObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const target = entry.target;
          target.classList.add('active');
          const elements = [...target.querySelectorAll('source'), target.querySelector('img')];
          const copyAttribute = (el) => {
            if (el.dataset.src) el.src = el.dataset.src;
            if (el.dataset.srcset) el.srcset = el.dataset.srcset;
          };
          elements.forEach(copyAttribute);
          this.intersectionObserver.unobserve(target);
        }
      });
    });

    if (imageElement !== null) {
      imageSource = imageElement.src || imageSource;
      this.imageAlt = imageElement.getAttribute('alt') || this.imageAlt;
      this.imageId = imageElement.id || this.imageId;
      this.imageClassName = imageElement.className || this.imageClassName || '';
    }

    const { name, extension, path } = new FileInfo(imageSource);
    let baseName = name;

    const getIndex = (query) => name.indexOf(query);

    const indices = [
      getIndex('-small'),
      getIndex('-medium'),
      getIndex('-large'),
    ];

    const sliceIfNeeded = (index) => {
      if (index !== -1) {
        baseName = name.slice(0, index);
        return true;
      }
      return false;
    };

    for (const index of indices) {
      if (sliceIfNeeded(index)) break;
    }
    
    this.el = this.responsivePicture(baseName, extension, path);

    if (imageElement) {
      // Replace the previous element
      imageElement.parentNode.replaceChild(this.el, imageElement);
    }
  }

  /**
   * Generates a `picture`-tag for the already created respoinsive images.
   * Your responsive images should be named like the following example
   * `filename-small.jpg`,
   * `filename-medium.jpg`,
   * `filename-large.jpg`,
   * `filename-small_x2.jpg`,
   * `filename-medium_x2.jpg`,
   * `filename-large_x2.jpg`,
   * `filename-small_x3.jpg`,
   * `filename-medium_x3.jpg`,
   * `filename-large_x3.jpg`
   * @param {*} imageName
   * @param {*} altText
   * @param {*} fileExtension
   * @param {*} path
   */
responsivePicture(imageName, fileExtension = 'jpg', path = 'img/') {
    const base = `${path}${imageName}`;
    const smallImage = `${base}-small`;
    const mediumImage = `${base}-medium`;
    const largeImage = `${base}-large`;
    const image1to3x = (fileName) => `${fileName}.${fileExtension}, ${fileName}_x2.${fileExtension} 2x, ${fileName}_x3.${fileExtension} 3x`;
    const defaultImageFile = `${mediumImage}.${fileExtension}`;
    const createPicture = () => {
      const source = (srcSet, mediaQuery) => {
        const el = document.createElement('source');
        el.setAttribute('data-srcset', srcSet);
        el.media = mediaQuery;
        return el;
      };
      const img = (src, alt, id, className) => {
        const el = document.createElement('img');
        el.setAttribute('data-src', src);
        el.alt = alt;
        el.id = id;
        el.className = className;
        el.classList.add('responsive-img');
        return el;
      };
      const smallSource = source(image1to3x(smallImage), '(max-width: 640px)');
      const mediumSource = source(image1to3x(mediumImage), '(min-width: 641px)');
      const largeSource = source(image1to3x(largeImage), '(min-width: 801px)');
      const defaultImage = img(defaultImageFile, this.imageAlt, this.imageId, this.imageClassName);
      defaultImage.setAttribute('data-src', defaultImageFile);
      defaultImage.src = '';
      this.imageEl = defaultImage;
      const el = document.createElement('picture');
      el.appendChild(smallSource);
      el.appendChild(mediumSource);
      el.appendChild(largeSource);
      el.appendChild(defaultImage);
      
      // Add for observation (lazy loading);
      this.intersectionObserver.observe(el);

      return el;
    };
    return createPicture();
  }
}

ResponsiveImage.QueryableClassName = '.responsive-image';

export default ResponsiveImage;
