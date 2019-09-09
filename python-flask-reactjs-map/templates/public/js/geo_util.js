
function computeMaxDiameterMarker(map, markerWidthInPixels, debug) {

    var mapGeoBounds = map.getBounds();
    var mapPixelBounds = map.getSize();

    var centerLatitude = mapGeoBounds.getCenter().lat;
    var centerLongitude = mapGeoBounds.getCenter().lng;

    // Find distance at middle of map
    var geoWidthMeters = map.distance(
        L.latLng(
            centerLatitude,
            mapGeoBounds.getWest()
        ),
        L.latLng(
            centerLatitude,
            mapGeoBounds.getEast())
    );

    var halfWorldWidthMeters = map.distance(
        L.latLng(0, 0),
        L.latLng(0, 180));


    if (debug) {
        _printMapDebug(map, mapGeoBounds, centerLatitude, centerLongitude, geoWidthMeters, halfWorldWidthMeters);
    }

    var pixelWorldBounds = map.getPixelWorldBounds();
    var pixelWorldWidth = pixelWorldBounds.max.x - pixelWorldBounds.min.x;
    var displayWidthInPixels = map.getSize().x;

    if (debug) {
        console.log('## display width ' + displayWidthInPixels + ', pixel width ' + pixelWorldWidth);
    }

    var mapWidthMeters = _getMapWidthMeters(displayWidthInPixels, pixelWorldWidth, geoWidthMeters, halfWorldWidthMeters)

    if (debug) {
        console.log('## map width in meters ' + mapWidthMeters);
    }

    var markerDiameterKMs;

    if (mapWidthMeters != null) {
        if (markerWidthInPixels > displayWidthInPixels) {
            // No space for markers, just disable
            markerDiameterKMs = null;
        }
        else {

            var markerRatio = markerWidthInPixels / displayWidthInPixels;

            var markerWidthMeters = markerRatio * mapWidthMeters;

            markerDiameterKMs = markerWidthMeters / 1000;

        }
    }
    else {
        markerDiameterKMs = null;
    }

    if (debug) {
        console.log('## Marker in km ' + markerDiameterKMs);
    }

    return markerDiameterKMs;
}

function _getMapWidthMeters(displayWidthInPixels, pixelWorldWidth, geoWidthMeters, halfWorldWidthMeters) {
    if (displayWidthInPixels > pixelWorldWidth) {
        mapWidthMeters = 2 * halfWorldWidthMeters;
    }
    else if (displayWidthInPixels > pixelWorldWidth / 2) {
        // When computing map width in km we have to take heed of map.distance()
        // returning the shortest path around the globe, not across the map as it is displayed
        if (geoWidthMeters < halfWorldWidthMeters) {
            // Displaying more than half of world but map width less than half
            // which means distance was measured "on the other side of the globe"
            // Adjust by subtracting from circumference

            mapWidthMeters = (halfWorldWidthMeters * 2) - geoWidthMeters;
        }
        else {
            // Return map width meters. This code path probably never runs
            mapWidthMeters = geoWidthMeters;
        }
    }
    else {
        // Showing less than half, just returns mapWidthMeters
        mapWidthMeters = geoWidthMeters;
    }

    return mapWidthMeters;
}

function _printMapDebug(map, mapGeoBounds, centerLatitude, centerLongitude, geoWidthMeters, halfWorldWidthMeters) {

    console.log('## world width ' + (halfWorldWidthMeters * 2 / 1000));
    console.log('## center latitude ' + centerLatitude);
    console.log('## width in meters ' + geoWidthMeters + ', km ' + (geoWidthMeters / 1000))

    var geoHeightMeters = map.distance(
        L.latLng(
            mapGeoBounds.getNorth(),
            centerLongitude
        ),
        L.latLng(
            mapGeoBounds.getSouth(),
            centerLongitude)
    );

    console.log('## heigh in meters ' + geoHeightMeters + ', km ' + (geoHeightMeters / 1000))
}

function normalizeLongitude(longitude) {
    var result;

    if (longitude > 180) {
        result = 180
    }
    else if (longitude < -180) {
        result = -180;
    }
    else {
        result = longitude;
    }

    return result;
}

function findBoundingBox(map, latitude, longitude, markerWidthInPixels) {

    var latLng = L.latLng(latitude, longitude);

    var mapPoint = map.project(latLng, map.getZoom());

    var radiusPixels = markerWidthInPixels / 2;

    var swPoint = L.point(mapPoint.x - radiusPixels, mapPoint.y - radiusPixels);
    var nePoint = L.point(mapPoint.x + radiusPixels, mapPoint.y + radiusPixels);

    return L.latLngBounds(
        map.unproject(swPoint, map.getZoom()),
        map.unproject(nePoint, map.getZoom())
    );
}
