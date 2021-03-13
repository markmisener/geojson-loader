function onChange(event) {
  var reader = new FileReader();
  reader.onload = onReaderLoad;
  reader.readAsText(event.target.files[0]);
}

function attemptJSONParse(str){
    try {
        return JSON.parse(str);
    } catch (e) {
        return false;
    }
}

function clearLayers(layers) {
  layers.forEach(layer => {
    if (map.getLayer(layer)) {
      map.removeLayer(layer);
    }
  });
}

function onReaderLoad(event) {
  clearLayers(['data-line', 'data-polygons', 'data-points'])
  var geojsonObj = attemptJSONParse(event.target.result);
  if (geojsonObj === false) {
    alert("File is not valid JSON.")
    return false
  }
  var lines = [];
  var polygons = [];
  var points = [];

  // separate features for styling
  geojsonObj.features.forEach(feature => {
    if (["LineString", "MultiLineString"].includes(feature.geometry.type)) {
      lines.push(feature);
    };
    if (["Polygon", "MultiPolygon"].includes(feature.geometry.type)) {
      polygons.push(feature);
    };
    if (["Point", "MultiPoint"].includes(feature.geometry.type)) {
      points.push(feature);
    };
  });

  // alert if no valid objects were found
  if (lines.length + polygons.length + points.length < 1) {
    alert("Sorry, no valid geojson features were found.");
    return false
  };

  // add lines
  map.getSource('data-lines').setData({
    type: 'FeatureCollection',
    features: lines
  });
  map.addLayer({
    id: 'data-line',
    source: 'data-lines',
    type: 'line',
    paint: {
      'line-width': 2,
      'line-color': 'black',
    }
  });

  // add polygons
  map.getSource('data-polygons').setData({
    type: 'FeatureCollection',
    features: polygons
  });
  map.addLayer({
    id: 'data-polygons',
    source: 'data-polygons',
    type: 'fill',
    paint: {
      'fill-color': 'red',
      'fill-opacity': 0.3,
      'fill-outline-color': 'black'
    }
  });

  // add points
  map.getSource('data-points').setData({
    type: 'FeatureCollection',
    features: points
  });
  map.addLayer({
    id: 'data-points',
    source: 'data-points',
    type: 'circle',
    paint: {
      'circle-radius': 6,
      'circle-color': '#B42222'
    }
  });

  const bounds = turf.bbox(geojsonObj);
  map.fitBounds([[bounds[0], bounds[1]], [bounds[2], bounds[3]]], {padding: 20});
}

document.getElementById('file').addEventListener('change', onChange);
