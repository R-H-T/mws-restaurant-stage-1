/**
 * File Info
 * @param {*} filePath 
 */
class FileInfo {
  constructor(filePath = null) {
    if (!filePath) return null;
    const fname = filePath
      .replace(/\\/g, '/')
      .replace(/.*\//, '');
    let name = fname.split('.');
    const extension = name.pop();
    name = name.pop();
    const nameIndex = filePath.indexOf(name);
    const path = (nameIndex != -1)
      ? filePath.slice(0, nameIndex)
      : '';
    return { name, extension, path };
  }
}

export default FileInfo;
