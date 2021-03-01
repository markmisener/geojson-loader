(function() {

  function onChange(event) {
    var reader = new FileReader();
    reader.onload = onReaderLoad;
    reader.readAsText(event.target.files[0]);
  }

  function onReaderLoad(event) {
    var geojsonObj = JSON.parse(event.target.result);
    console.log(geojsonObj.features)
    map.getSource('user-data').setData({
      type: 'FeatureCollection',
      features: geojsonObj.features
    });

    map.addLayer({
      id: 'data',
      source: 'user-data',
      type: 'line',
      paint: {
        'line-width': 2,
        'line-color': 'black',
      }
    });

    const bounds = turf.bbox(geojsonObj);
    map.fitBounds([[bounds[0], bounds[1]], [bounds[2], bounds[3]]], {padding: 20});
  }

  document.getElementById('file').addEventListener('change', onChange);

}());
