import FileInfo from '../../src/js/gw/gw-fileinfo';

/* global describe, beforeEach, it, expect */

describe('File Info', () => {
  let sut;

  beforeEach(() => {
    sut = FileInfo('img/1-medium.jpg');
  });

  it('should exist', () => {
    sut = FileInfo('img/1-medium.jpg');
    expect(sut).toBeTruthy();
  });

  it('should return path', () => {
    expect(sut.path).toBe('img/');
  });

  it('should return empty path', () => {
    sut = FileInfo('1-medium.jpg');
    expect(sut.path).toBe('');
  });

  it('should return name', () => {
    expect(sut.name).toBe('1-medium');
  });

  it('should return file extension', () => {
    expect(sut.extension).toBe('jpg');
  });
});