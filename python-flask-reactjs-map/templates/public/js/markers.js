function Markers(map, createMarker, debug) {

    if (!map) {
        throw "No map"
    }

    this.map = map;
    this.createMarker = createMarker;
    this.debug = debug;
    this.allMarkers = {};
}

Markers.prototype.updateMarkers = function(markers, markerWidthInPixels) {

    if (this.debug) {
        console.log('## map zoom level ' + this.map.getZoom());
        console.log('## map bounds ' + JSON.stringify(this.map.getBounds()));
        console.log('## pixel world bounds ' + JSON.stringify(this.map.getPixelWorldBounds()));
        console.log('## size ' + JSON.stringify(this.map.getSize()));
    }

    // Update current markers based on a map of latitude/Longitude/count as string

    var updatedMarkers = {};

    for (var i = 0; i < markers.length; ++i) {

        var marker = markers[i];
        var key = '' + marker.latitude + '_' + marker.longitude + '_' + marker.count;

        if (updatedMarkers[key]) {
            throw "Multiple updates at " + key
        }

        if (this.allMarkers[key]) {
            // Already exists with same count so no need to update
            updatedMarkers[key] = this.allMarkers[key];
        }
        else {
            // New marker, must add
            if (this.debug) {
                console.log('## process marker ' + JSON.stringify(marker));
                console.log('## map ' + map);
            }

            var layer = this.createMarker(
                this.map,
                marker.latitude, marker.longitude, marker.count,
                markerWidthInPixels);

            layer.addTo(this.map);

            var markerData = {
                placement : marker,
                count : marker.count,
                added : layer
            };

            if (this.debug) {
                console.log('## added marker ' + markerData.added + ' at ' + JSON.stringify(markerData.placement));
            }

            // Add to map maintained on clientside so can dynamically remove later
            // if no longer present in result from server
            updatedMarkers[key] = markerData;
        }
    }

    var existingMarkerKeys = Object.keys(this.allMarkers);

    existingMarkerKeys.forEach(existingKey => {

        if (updatedMarkers[existingKey]) {
            // Still in map
        }
        else {
            // Not in map, remove through animation

            var layer = this.allMarkers[existingKey].added;
            var element = layer.getElement();
            
            element.addEventListener('transitionend', event => {
                layer.remove();
            });
            
            element.classList.add("marker-remove-transition");
        }
    })
    
    this.allMarkers = updatedMarkers;
}

Markers.prototype._createSVGMarker = function(placement, count) {

    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");

    svg.setAttribute('xmlns', "http://www.w3.org/2000/svg");

    svg.setAttribute('viewBox', '0 0 500 500');

    var html = '<g>'
    html += '<circle cx="250" cy="250" r="200" stroke="#00AA50" stroke-width="15" fill="#00C0A0"/>';
    html += '<text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="10em" fill="black">'
    html += count.toString();
    html += '</text>';
    html += '</g>';

    svg.innerHTML = html;

    var result = {
        'svg': svg,
        'placement': placement,
        'overlay': L.svgOverlay(svg, placement)
    };

    return result;
}

Markers.prototype.updateMarkerSizeOnZoom = function(markerWidthInPixels) {

    for (key of Object.keys(this.allMarkers)) {
        parts = key.split('_');

        latitude = parseFloat(parts[0]);
        longitude = parseFloat(parts[1]);

        var updatedPlacement = findBoundingBox(map, latitude, longitude, markerWidthInPixels);

        var value = allMarkers[key];

        value.added.setBounds(updatedPlacement);
    }
}

Markers.prototype.removeAllMarkers = function(map) {

    for (marker of Object.values(this.allMarkers)) {
        marker.added.remove();
    }

    this.allMarkers  =  {};
}
