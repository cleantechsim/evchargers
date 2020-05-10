
import axios from 'axios';

import {normalizeLongitude} from './geo_util';

import { LatLngBounds } from 'leaflet';

export function queryClustersAndPoints(
    eventType: string,
    zoom: number,
    bounds: LatLngBounds,
    markerWidthKMs: number,
    onupdate: (data: any) => void) {

    const debug: boolean = false;

    if (debug) {
        console.log('## marker width in kms ' + markerWidthKMs);
    }

    _queryPoints(zoom, bounds, markerWidthKMs, onupdate, debug);
}

declare function getPathNamePrefix() : void;

function _queryPoints(
    zoom: number,
    bounds: LatLngBounds,
    markerWidthKMs: number,
    onupdate: (data: any) => void,
    debug: boolean) {

    let swLongitude: number = normalizeLongitude(bounds.getSouthWest().lng);
    let neLongitude: number = normalizeLongitude(bounds.getNorthEast().lng);

    axios.get(getPathNamePrefix() + '/rest/map'
        + '?zoom=' + zoom
        + '&swLatitude=' + bounds.getSouthWest().lat
        + '&swLongitude=' + swLongitude
        + '&neLatitude=' + bounds.getNorthEast().lat
        + '&neLongitude=' + neLongitude
        + '&markerDiameterKM=' + markerWidthKMs

    ).then(function (response: any) {
        if (onupdate) {
            onupdate(response.data);
        }
    });
}

