
function EVChargerMap(leafletMapElementId, onmoveend) {
    
    this.leafletMap = L.map(leafletMapElementId).setView([51.505, -0.09], 2.2);

    this.leafletMap.addEventListener('moveend', event => onmoveend());

    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox.streets',
        accessToken: 'pk.eyJ1IjoiY2xlYW50ZWNoc2ltIiwiYSI6ImNqemgzbXFncDBxb2EzbW5yNGthbmw2eWIifQ.zVEa05l5txqao_on4IwX9A'
    }).addTo(this.leafletMap);
}

EVChargerMap.prototype.createMarkers = function(debug) {
    
    return new Markers(this.leafletMap, createSVGClusterIcon, debug);
}

EVChargerMap.prototype.gotoLocation = function(location) {

    if (location.latitude && location.longitude) {
        this.leafletMap.flyTo(L.latLng(location.latitude, location.longitude), 10);
    }
}

EVChargerMap.prototype.getZoom = function() {
    return this.leafletMap.getZoom();
}

EVChargerMap.prototype.getBounds = function() {
    return this.leafletMap.getBounds();
}

EVChargerMap.prototype.computeMaxDiameterMarker = function(markerWidthInPixels, debug) {
    return computeMaxDiameterMarker(this.leafletMap, markerWidthInPixels, debug); 
}
