
var _requestSequenceNo = 0;

function queryClustersAndPoints(map, eventType, allMarkers, onupdate) {

    const debug = false;

    if (!map) {
        throw "No map"
    }

    var zoom = map.getZoom();
    var bounds = map.getBounds();


    var markerWidthInPixels = 30;

    var markerWidthKMs = computeMaxDiameterMarker(map, markerWidthInPixels, debug);

    if (debug) {
        console.log('## marker width in kms ' + markerWidthKMs);
    }

    _queryPoints(map, zoom, bounds, markerWidthKMs, markerWidthInPixels, ++_requestSequenceNo, onupdate, allMarkers, debug);
}

function _queryPoints(map, zoom, bounds, markerWidthKMs, markerWidthInPixels, sequenceNo, onupdate, allMarkers, debug) {

    swLongitude = normalizeLongitude(bounds._southWest.lng);
    neLongitude = normalizeLongitude(bounds._northEast.lng);

    axios.get('/rest/map'
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
    })
}

