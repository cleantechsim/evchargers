
import L, { Map } from 'leaflet';
import { Markers } from './markers';
import { Location } from './location';

import { computeMaxDiameterMarker } from './geo_util';

import { createSVGClusterIcon } from './clustermarker';

export class EVChargerMap {

    private leafletMap: Map;

    constructor(leafletMapElementId: string, onmoveend: () => void) {
    
        this.leafletMap = L.map(leafletMapElementId).setView([51.505, -0.09], 2.2);

        this.leafletMap.addEventListener('moveend', event => onmoveend());

        L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
            attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
            maxZoom: 18,
            id: 'mapbox.streets',
            accessToken: 'pk.eyJ1IjoiY2xlYW50ZWNoc2ltIiwiYSI6ImNqemgzbXFncDBxb2EzbW5yNGthbmw2eWIifQ.zVEa05l5txqao_on4IwX9A'
        }).addTo(this.leafletMap);
    }

    public createMarkers(debug: boolean) {
        
        return new Markers(this.leafletMap, createSVGClusterIcon, debug);
    }

    public gotoLocation(location: Location) {

        if (location.latitude && location.longitude) {
            this.leafletMap.flyTo(L.latLng(location.latitude, location.longitude), 10);
        }
    }

    public getZoom() {
        return this.leafletMap.getZoom();
    }

    public getBounds() {
        return this.leafletMap.getBounds();
    }

    public computeMaxDiameterMarker(markerWidthInPixels: number, debug: boolean) {
        return computeMaxDiameterMarker(this.leafletMap, markerWidthInPixels, debug); 
    }
}