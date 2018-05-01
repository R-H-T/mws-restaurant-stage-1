
class MockToast {
  constructor() {
    this.el = document.createElement('div');
  }
  show() {
    return true;
  }
  hide() {
    return true;
  }
}

export default MockToast;
