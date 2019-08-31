function queryClustersAndPoints(map, eventType, allMarkers, onupdate) {

    const debug = false;

    if (!map) {
        throw "No map"
    }

    var zoom = map.getZoom();
    var bounds = map.getBounds();

    swLongitude = normalizeLongitude(bounds._southWest.lng);
    neLongitude = normalizeLongitude(bounds._northEast.lng);

    var markerWidthKMs = computeMaxDiameterMarker(map, 25, debug);

    if (debug) {
        console.log('## marker width in kms ' + markerWidthKMs);
    }

    axios.get('/rest/map'
        + '?zoom=' + zoom
        + '&swLatitude=' + bounds._southWest.lat
        + '&swLongitude=' + swLongitude
        + '&neLatitude=' + bounds._northEast.lat
        + '&neLongitude=' + neLongitude
        + '&markerDiameterKM=' + markerWidthKMs

    ).then(function (response) {
        updatedMarkers = updateMarkers(map, allMarkers, response.data, debug);

        if (onupdate) {
            onupdate(updatedMarkers);
        }
    })
}

