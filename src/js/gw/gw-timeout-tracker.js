import DataSource from './../model/datasource/';

/**
 * Timeout Tracker
 * 
 * Keeps track of timeouts.
 * 
 * @class TimeoutTracker
 */
class TimeoutTracker {
  constructor(timeouts = []) {
    this.dataSource = new DataSource(timeouts);

    this.getTimeout = this.getTimeout.bind(this);
    this.createTimeout = this.createTimeout.bind(this);
    this.clearTimeout = this.clearTimeout.bind(this);
    this.cleanExpiredTimeouts = this.cleanExpiredTimeouts.bind(this);

    // Cleanup work
    const intervalMs = 1000 * 60 * 2; // 2 minutes
    setInterval(() => {
      this.cleanExpiredTimeouts();
    }, intervalMs);
  }

  get timeouts() { return this.dataSource.items; }

  createTimeout(callback, ms, completion = null) {
    const timeout = new Timeout(callback, ms);
    this.dataSource.addItem(timeout);
    timeout.start(completion);
    return timeout.tid;
  }

  getTimeout(tid) {
    return (this.dataSource.getItemWithFilter(item => (item.tid === tid)) || null);
  }

  clearTimeout(timeout = new TypeError('Timeout argument was empty.')) {
    let currentTimeout = null;
    if (Object.is(timeout.constructor, Timeout)) {
      currentTimeout = timeout;
    }
    if (Object.is(timeout.constructor, Number)) {
      currentTimeout = this.getTimeout(timeout);
    }
    if (currentTimeout) {
      currentTimeout.stop();
      this.dataSource.removeItem(currentTimeout);
    }
  }

  cleanExpiredTimeouts() {
    this.dataSource.getItemListWithFilter(timeout =>
      (timeout.remainingTime === 0)).forEach(timeout => {
      this.clearTimeout(timeout.tid);
    });
  }
}

export class Timeout {
  constructor(callback, ms) {
    this.tid = -1;
    this.callback = callback;
    this.startTime = Date.now();
    this.ms = ms;

    this.callback = this.callback.bind(this);
  }
  
  get remainingTime() {
    const time = (Date.now() - this.startTime);
    return (time > 0) ? time : 0;
  }

  start(completion = null) {
    this.tid = setTimeout(() => {
      this.callback();
      if (completion) completion();
    }, this.ms);
  }

  stop() {
    clearTimeout(this.tid);
  }
}

export default TimeoutTracker;
