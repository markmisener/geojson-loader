function loadFile(event) {
  var reader = new FileReader();
  reader.onload = onReaderLoad;
  reader.readAsText(event.target.files[0]);
}

function attemptJSONParse(str) {
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
  // clear layers, if the already exist
  const layers = ['data-line', 'data-polygons', 'data-points'];
  clearLayers(layers);

  var geojsonObj = attemptJSONParse(event.target.result);
  if (geojsonObj === false) {
    alert("File is not valid JSON.")
    return false
  } else if (!geojsonObj.hasOwnProperty("features")) {
    alert("File must contain a valid GeoJSON FeatureCollection.")
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
  map.fitBounds([
    [bounds[0], bounds[1]],
    [bounds[2], bounds[3]]
  ], {
    padding: 20
  });

  // add popups
  layers.forEach(layer => {
    map.on('mouseenter', layer, function() {
      map.getCanvas().style.cursor = 'pointer';
    });

    map.on('mouseleave', layer, function() {
      map.getCanvas().style.cursor = '';
    });

    map.on('click', layer, function(e) {
      if (Object.keys(e.features[0].properties).length > 0) {
        var htmlStr = '<div><ul>';
        Object.entries(e.features[0].properties).forEach(entry => {
          // add all properties except `other_tags`
          if (entry[0] !== 'other_tags') {
            htmlStr = htmlStr.concat(`<li>${entry[0]}: ${entry[1]}</li>`)
          }
        });
        htmlStr.concat('</ul></div>')

        new mapboxgl.Popup()
          .setLngLat(e.lngLat)
          .setHTML(htmlStr)
          .addTo(map);

      }
    });
  });
}
