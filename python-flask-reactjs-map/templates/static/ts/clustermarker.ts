
import L, { Map, Marker, LatLngBounds, SVGOverlay } from 'leaflet';
import { findBoundingBox } from './geo_util';

function createSVGClusterOverlay(
    map: Map,
    latitude: number,
    longitude: number,
    count: number,
    markerWidthInPixels: number) : SVGOverlay {

    const placement: LatLngBounds = findBoundingBox(map, latitude, longitude, markerWidthInPixels);

    const svg: SVGElement = _createSVGClusterElement(count);

    const overlay: SVGOverlay = L.svgOverlay(svg, placement)

    return overlay;
}

export function createSVGClusterIcon(
    map: Map,
    latitude: number,
    longitude: number,
    count: number,
    markerWidthInPixels: number) : Marker {

    let div: HTMLDivElement = _createSVGClusterDiv(count);

    div.style.width = '' + markerWidthInPixels;

    var divIcon = L.divIcon({ html : div, className : 'svg-cluster-icon' });

    return L.marker([ latitude, longitude ], { icon : divIcon })
}

function _createSVGClusterDiv(count: number) : HTMLDivElement {

    const svg: SVGElement = _createSVGClusterElement(count);
    
    const div: HTMLDivElement = document.createElement('div');
    
    div.append(svg);

    return div;
}

function _createSVGClusterElement(count: number): SVGElement {

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

    return svg;
}
