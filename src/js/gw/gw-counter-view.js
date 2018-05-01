/**
 * Counter View
 * 
 * @class CounterView
 */
class CounterView {
  constructor(values = {
    ms: null,
    sec: null,
    min: null,
    hour: null,
    day: null,
    year: null
  }) {
    this.values = values;
    this.el = document.createElement('span');
    this.el.className = 'counter-view';
  }
  
  calcTimeFromNow({
    ms,
    sec,
    min,
    hour,
    day,
    year } = this.values) {
    let time = 0;
    const calcSec = sec => 1000 * sec;
    const calcMin = min => calcSec(60 * min);
    const calcHour = hour => calcMin(60 * hour);
    const calcDay = day => calcHour(24 * day);
    if (ms) time += ms;
    if (sec) time += calcSec(sec);
    if (min) time += calcMin(min);
    if (hour) time += calcHour(hour);
    if (day) time += calcDay(day);
    if (year) time += calcDay(365 * year); // TODO: Take special years into account.
    return Date.now() + time;
  }

  fullView() {
    const deadline = this.calcTimeFromNow();
    const iid = setInterval(() => {
      const dist = (deadline - Date.now());
      if (dist <= 0) { clearInterval(iid); this.el.innerHTML = `0y 0d 0h 0m 0s`; return; }
      const daysInAYear = 365; // TODO: Take special years into account.
      const msInSec = (1000 * 60);
      const secInMin = (msInSec * 60);
      const dl = (secInMin * 24);
      const yl = (dl * daysInAYear);
      const calcDist = (value, divValue) => Math.floor(dist % value / divValue);
      const years = Math.floor(dist / yl);
      const days = calcDist(yl, dl);
      const hours = calcDist(dl, secInMin);
      const minutes = calcDist(secInMin, msInSec);
      const seconds = calcDist(msInSec, 1000);
      this.el.innerHTML = `${ years }y ${ days }d ${ hours }h ${ minutes }m ${ seconds }s`;
    }, 1000); // Update every second.
    return this.el;
  }

  secondsView(label = null) {
    this.el.className = 'counter-view seconds';
    const deadline = this.calcTimeFromNow();
    const iid = setInterval(() => {
      const dist = (deadline - Date.now());
      if (dist <= 0) { clearInterval(iid); this.el.innerHTML = '0s'; return; }
        const seconds = Math.floor(dist / 1000);
        this.el.innerHTML = `${ (label) ? `${ label } ` : '' }${ seconds }s`;
    }, 1000);
    return this.el;
  }
}

export default CounterView;
