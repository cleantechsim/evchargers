
import L, { Layer } from 'leaflet';
import { findBoundingBox } from './geo_util';
import { MarkerPos } from './dtos/clusterssresult'

class MarkerState {

    placement: MarkerPos;

    count: number;
    
    added: Layer;
}

export class Markers {

    private map: L.Map;

    private createMarker: (
            map: L.Map,
            latitude: number,
            longitude: number,
            count: number,
            markerWidthInPixels: number
        ) => Layer;

    private debug: boolean;

    private allMarkers: Map<string, MarkerState>;

    constructor (
        map: L.Map,
        createMarker: (
            map: L.Map,
            latitude: number,
            longitude: number,
            count: number,
            markerWidthInPixels: number
        ) => Layer,
        debug: boolean) {

        if (!map) {
            throw "No map"
        }

        this.map = map;
        this.createMarker = createMarker;
        this.debug = debug;
        this.allMarkers = new Map();
    }

    public updateMarkers(markers: MarkerPos [], markerWidthInPixels: number) {

        if (this.debug) {
            console.log('## map zoom level ' + this.map.getZoom());
            console.log('## map bounds ' + JSON.stringify(this.map.getBounds()));
            console.log('## pixel world bounds ' + JSON.stringify(this.map.getPixelWorldBounds()));
            console.log('## size ' + JSON.stringify(this.map.getSize()));
        }

        // Update current markers based on a map of latitude/Longitude/count as string

        let updatedMarkers: Map<string, MarkerState> = new Map();

        for (var i = 0; i < markers.length; ++i) {

            var marker = markers[i];
            const key: string = '' + marker.latitude + '_' + marker.longitude + '_' + marker.count;

            if (updatedMarkers.has(key)) {
                throw "Multiple updates at " + key
            }

            if (this.allMarkers.has(key)) {
                // Already exists with same count so no need to update
                updatedMarkers.set(key, this.allMarkers.get(key));
            }
            else {
                // New marker, must add
                if (this.debug) {
                    console.log('## process marker ' + JSON.stringify(marker));
                    console.log('## map ' + this.map);
                }

                let layer: Layer = this.createMarker(
                    this.map,
                    marker.latitude, marker.longitude, marker.count,
                    markerWidthInPixels);

                layer.addTo(this.map);

                const markerData: MarkerState = {
                    placement : marker,
                    count : marker.count,
                    added : layer
                };

                if (this.debug) {
                    console.log('## added marker ' + markerData.added + ' at ' + JSON.stringify(markerData.placement));
                }

                // Add to map maintained on clientside so can dynamically remove later
                // if no longer present in result from server
                updatedMarkers.set(key, markerData);
            }
        }

        const existingMarkerKeys: Iterable<string> = this.allMarkers.keys();

        for (let existingKey of existingMarkerKeys) {

            if (updatedMarkers.has(existingKey)) {
                // Still in map
            }
            else {
                // Not in map, remove through animation

                let layer: Layer = this.allMarkers.get(existingKey).added;

                let anyLayer: any = layer;
                var element: HTMLElement = anyLayer.getElement();
                
                element.addEventListener('transitionend', (event: TransitionEvent) => {
                    layer.remove();
                });
                
                element.classList.add("marker-remove-transition");
            }
        }
        
        this.allMarkers = updatedMarkers;
    }

    private createSVGMarker(placement: L.LatLngBounds, count: number) {

        let svg: any = document.createElementNS("http://www.w3.org/2000/svg", "svg");

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

    public updateMarkerSizeOnZoom(markerWidthInPixels: number) {

        for (let key of this.allMarkers.keys()) {
            let parts: string[] = key.split('_');

            const latitude: number = parseFloat(parts[0]);
            const longitude: number = parseFloat(parts[1]);

            const updatedPlacement: L.LatLngBounds = findBoundingBox(this.map, latitude, longitude, markerWidthInPixels);

            let value: MarkerState = this.allMarkers.get(key);

            let anyAdded: any = value.added;
            anyAdded.setBounds(updatedPlacement);
        }
    }

    public removeAllMarkers = function(map: L.Map) {

        for (let marker of this.allMarkers.entries()) {
            marker.added.remove();
        }

        this.allMarkers.clear();
    }
}
