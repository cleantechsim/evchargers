
function createSVGClusterOverlay(map, latitude, longitude, count, markerWidthInPixels) {

    var placement = findBoundingBox(map, latitude, longitude, markerWidthInPixels);

    var svg = _createSVGClusterElement(count);

    var overlay = L.svgOverlay(svg, placement)

    return overlay;
}

function createSVGClusterIcon(map, latitude, longitude, count, markerWidthInPixels) {

    var div = _createSVGClusterDiv(count);

    div.style.width = markerWidthInPixels;

    var divIcon = L.divIcon({ html : div, className : 'svg-cluster-icon' });

    return L.marker([ latitude, longitude ], { icon : divIcon })
}

function _createSVGClusterDiv(count) {

    var svg = _createSVGClusterElement(count);
    
    var div = document.createElement('div');
    
    div.append(svg);

    return div;
}

function _createSVGClusterElement(count) {

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

    return svg;
}
