const key = 'AIzaSyDfc7m94RiPm0y0mQlj5XySOM2q-nbW6N0'; // TODO: Change this to your API key

class MapView {
  constructor(props = {
    lat: 40.722216,
    lng: -73.987501,
    zoom: 12,
    scrollwheel: false,
    language: 'en',
    disableDefaultUI: true,
  },
  el = null) {
    this.props = props;
    this.el = el || document.getElementById('map') || (() => { const el = document.createElement('div'); el.id = 'map'; return el; })();
    this.map = {};
    this.markers = [];
  }

  setup() {
    const {
      lat,
      lng,
      zoom,
      scrollwheel,
      language,
      disableDefaultUI,
    } = this.props;
    return require('load-google-maps-api')({ key, language })
    .then(googleMaps => {
      if (typeof google === 'undefined') {
        return Promise.resolve(null);
      }
      window.googleMaps = googleMaps;
      const center = {
        lat,
        lng
      };
    return Promise.resolve(
      new googleMaps.Map(
        this.el,
        {
          zoom,
          center,
          scrollwheel,
          disableDefaultUI,
        }
      )
    );
    }).then(map => this.map = map);
  }

  add(marker = null) {
    if (marker) this.markers.push(marker);
  }
  
  resetMarkers() {
    this.markers.forEach(marker => { marker.setMap(null); });
    this.markers = [];
  }
}

export default MapView;
