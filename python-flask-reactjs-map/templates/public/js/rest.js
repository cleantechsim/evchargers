
var _requestSequenceNo = 0;

function queryPlace(place, onresult) {
    axios.get(getPathNamePrefix() + '/rest/search?place=' + encodeURIComponent(place)

    ).then(function (response) {
        onresult(response.data);
    })
}

function queryClustersAndPoints(map, eventType, allMarkers, markerWidthInPixels, onupdate, onfinally) {

    const debug = false;

    if (!map) {
        throw "No map"
    }

    var zoom = map.getZoom();
    var bounds = map.getBounds();

    var markerWidthKMs = computeMaxDiameterMarker(map, markerWidthInPixels, debug);

    if (debug) {
        console.log('## marker width in kms ' + markerWidthKMs);
    }

    _queryPoints(map, zoom, bounds, markerWidthKMs, markerWidthInPixels, ++_requestSequenceNo, onupdate, onfinally, allMarkers, debug);
}

function _queryPoints(map, zoom, bounds, markerWidthKMs, markerWidthInPixels, sequenceNo, onupdate, onfinally, allMarkers, debug) {

    swLongitude = normalizeLongitude(bounds._southWest.lng);
    neLongitude = normalizeLongitude(bounds._northEast.lng);

    axios.get(getPathNamePrefix() + '/rest/map'
        + '?zoom=' + zoom
        + '&swLatitude=' + bounds._southWest.lat
        + '&swLongitude=' + swLongitude
        + '&neLatitude=' + bounds._northEast.lat
        + '&neLongitude=' + neLongitude
        + '&markerDiameterKM=' + markerWidthKMs

    ).then(function (response) {

        if (sequenceNo < _requestSequenceNo) {
            // Expired request, new ones sent
        }
        else {
            updatedMarkers = updateMarkers(map, allMarkers, response.data, markerWidthInPixels, debug);

            if (onupdate) {
                onupdate(updatedMarkers);
            }
        }
    }).finally(function () {
        if (onfinally) {
            onfinally();
        }
    })
}

