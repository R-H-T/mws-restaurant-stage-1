import 'intersection-observer';
import ResponsiveImage from '../../src/js/gw/gw-responsive-image';
/* global describe, beforeEach, it, expect */

describe('Responsive Image', () => {
  let sut;

  beforeEach(() => {
    const imageView = new Image();
    imageView.src = 'img/1-medium.jpg';
    const parent = document.createElement('div');
    parent.appendChild(imageView);
    sut = new ResponsiveImage('img/1-medium.jpg', 'An image', null,  null, imageView);
  });

  it('should exist', () => {
    sut = new ResponsiveImage('img/1-medium.jpg');
    expect(sut).toBeTruthy();
  });
});