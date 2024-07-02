// Create a map object
let map = L.map('map').setView([20.0, 5.0], 2);

// Add a base layer
let streetMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

let topoMap = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
  attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (CC-BY-SA)'
});

// Function to determine marker size based on magnitude
function markerSize(magnitude) {
  return magnitude * 3;
}

// Function to determine marker color based on depth
function markerColor(depth) {
  return depth > 90 ? '#ff3333' :
         depth > 70 ? '#ff6633' :
         depth > 50 ? '#ff9933' :
         depth > 30 ? '#ffcc33' :
         depth > 10 ? '#ffff33' :
                      '#ccff33';
}

// Layer groups for earthquakes and tectonic plates
let earthquakes = L.layerGroup();
let tectonicPlates = L.layerGroup();

// Fetch earthquake data and plot on map
d3.json('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson').then(data => {
  data.features.forEach(feature => {
    let coords = feature.geometry.coordinates;
    let depth = coords[2];
    let magnitude = feature.properties.mag;

    L.circleMarker([coords[1], coords[0]], {
      radius: markerSize(magnitude),
      fillColor: markerColor(depth),
      color: '#000',
      weight: 1,
      opacity: 1,
      fillOpacity: 0.8
    }).bindPopup(`<h3>${feature.properties.place}</h3><hr><p>Magnitude: ${magnitude}</p><p>Depth: ${depth}</p>`).addTo(earthquakes);
  });
});

// Fetch tectonic plates data and plot on map
d3.json('https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json').then(data => {
  L.geoJSON(data, {
    style: {
      color: 'orange',
      weight: 2
    }
  }).addTo(tectonicPlates);
});

// Add layers to map
earthquakes.addTo(map);
tectonicPlates.addTo(map);

// Base maps
let baseMaps = {
  "Street Map": streetMap,
  "Topographic Map": topoMap
};

// Overlay maps
let overlayMaps = {
  "Earthquakes": earthquakes,
  "Tectonic Plates": tectonicPlates
};

// Layer control
L.control.layers(baseMaps, overlayMaps).addTo(map);

// Add legend to map
let legend = L.control({position: 'bottomright'});
legend.onAdd = function () {
  let div = L.DomUtil.create('div', 'info legend');
  let depths = [-10, 10, 30, 50, 70, 90];
  let labels = [];

  // Add a title to the legend
  div.innerHTML += '<strong>Depth (km)</strong><br>';

  // Add a white background to the legend
  div.style.backgroundColor = 'white';
  div.style.padding = '10px';
  div.style.borderRadius = '5px';

  // Loop through depth intervals and generate a label with a colored square for each interval
  for (let i = 0; i < depths.length; i++) {
    div.innerHTML +=
      '<i style="background:' + markerColor(depths[i] + 1) + '; width: 18px; height: 18px; display: inline-block; margin-right: 5px;"></i> ' +
      (depths[i] + (depths[i + 1] ? '&ndash;' + depths[i + 1] + ' km' : '+ km')) + '<br>';
  }

  return div;
};
legend.addTo(map);
