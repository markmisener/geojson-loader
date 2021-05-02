mapboxgl.accessToken = 'pk.eyJ1IjoibW1pc2VuZXIiLCJhIjoiY2tpbnNodXAyMTYzaDJ5cnh2MzhhZTdrOSJ9.2kqiWW_ezo14wsaONE-MjQ';

var map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v11',
  center: [-10, 30],
  zoom: 1.3
});

const defaultGeoJSONSource = {
  type: 'geojson',
  data: {
    type: 'FeatureCollection',
    features: []
  }
};

map.on('load', () => {
  map.addSource('data-lines', defaultGeoJSONSource);
  map.addSource('data-polygons', defaultGeoJSONSource);
  map.addSource('data-points', defaultGeoJSONSource);
});
