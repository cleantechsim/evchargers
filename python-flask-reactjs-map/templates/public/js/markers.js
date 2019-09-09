
function updateMarkers(map, allMarkers, markers, markerWidthInPixels, debug) {

    if (!map) {
        throw "No map"
    }

    if (debug || true) {
        console.log('## map zoom level ' + map.getZoom());
        console.log('## map bounds ' + JSON.stringify(map.getBounds()));
        console.log('## pixel world bounds ' + JSON.stringify(map.getPixelWorldBounds()));
        console.log('## size ' + JSON.stringify(map.getSize()));
    }

    // Update current markers based on a map of latitude/Longitude/count as string

    var updatedMarkers = {};

    for (var i = 0; i < markers.length; ++i) {

        var marker = markers[i];
        var key = '' + marker.latitude + '_' + marker.longitude + '_' + marker.count;

        if (updatedMarkers[key]) {
            throw "Multiple updates at " + key
        }

        if (allMarkers[key]) {
            // Already exists with same count so no need to update
            updatedMarkers[key] = allMarkers[key];
        }
        else {
            // New marker, must add

            if (debug) {
                console.log('## process marker ' + JSON.stringify(marker));
                console.log('## map ' + map);
            }

            // var added = L.marker([marker.latitude, marker.longitude]).addTo(map)

            var placement = findBoundingBox(map, marker.latitude, marker.longitude, markerWidthInPixels)

            var markerData = _createSVGMarker(placement, marker.count);

            markerData.added = markerData.overlay.addTo(map);

            if (debug) {
                console.log('## added marker ' + markerData.added + ' at ' + JSON.stringify(markerData.placement));
            }

            // Add to map maintained on clientside so can dynamically remove later
            // if no longer present in result from server
            updatedMarkers[key] = markerData;
        }
    }

    var existingMarkerKeys = Object.keys(allMarkers);

    existingMarkerKeys.forEach(existingKey => {

        if (updatedMarkers[existingKey]) {
            // Still in map
        }
        else {
            // Not in map, remove
            allMarkers[existingKey].added.remove();
        }
    })

    return updatedMarkers;
}

function _createSVGMarker(placement, count) {

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

function updateMarkerSizeOnZoom(map, allMarkers, markerWidthInPixels) {

    for (key of Object.keys(allMarkers)) {
        parts = key.split('_');

        latitude = parseFloat(parts[0]);
        longitude = parseFloat(parts[1]);

        var updatedPlacement = findBoundingBox(map, latitude, longitude, markerWidthInPixels);

        var value = allMarkers[key];

        value.added.setBounds(updatedPlacement);
    }
}

function removeAllMarkers(map, allMarkers) {

    for (marker of Object.values(allMarkers)) {
        marker.added.remove();
    }
}