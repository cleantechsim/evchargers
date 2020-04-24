
function queryPlace(place, onresult) {
    
    axios.get(getPathNamePrefix() + '/rest/search?place=' + encodeURIComponent(place)

    ).then(function (response) {
        onresult(response.data);
    })
}

function queryClustersAndPoints(eventType, zoom, bounds, markerWidthKMs, onupdate) {

    const debug = false;

    if (!map) {
        throw "No map"
    }

    if (debug) {
        console.log('## marker width in kms ' + markerWidthKMs);
    }

    _queryPoints(zoom, bounds, markerWidthKMs, onupdate, debug);
}

function _queryPoints(zoom, bounds, markerWidthKMs, onupdate, debug) {

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
        if (onupdate) {
            onupdate(response.data);
        }
    });
}

