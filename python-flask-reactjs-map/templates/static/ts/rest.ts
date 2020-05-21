
import axios from 'axios';

import {normalizeLongitude} from './geo_util';

import { LatLngBounds } from 'leaflet';

import { ReferenceData } from './dtos/referencedata';
import { NamedOperator } from './facetinfo';
import { Operator } from './dtos/clusterssresult';
import { Bounds } from './bounds';

export function queryClustersAndPoints(
    eventType: string,
    zoom: number,
    bounds: Bounds,
    markerWidthKMs: number,
    operators: Operator[],
    onupdate: (data: any) => void) {

    const debug: boolean = false;

    if (debug) {
        console.log('## marker width in kms ' + markerWidthKMs);
    }

    _queryPoints(zoom, bounds, markerWidthKMs, operators, onupdate, debug);
}

export function getReferenceData(onresponse: (referenceData: ReferenceData) => void) {

    axios.get(getPathNamePrefix() + '/rest/reference_data'

    ).then(function (response: any) {
        
        if (onresponse) {
            onresponse(response.data);
        }
    });
}

declare function getPathNamePrefix() : void;

function _queryPoints(
    zoom: number,
    bounds: Bounds,
    markerWidthKMs: number,
    operators: Operator[],
    onupdate: (data: any) => void,
    debug: boolean) {

    let swLongitude: number = normalizeLongitude(bounds.southWest.longitude);
    let neLongitude: number = normalizeLongitude(bounds.northEast.longitude);

    let queryParams = '?zoom=' + zoom
                + '&swLatitude=' + bounds.southWest.latitude
                + '&swLongitude=' + swLongitude
                + '&neLatitude=' + bounds.northEast.latitude
                + '&neLongitude=' + neLongitude
                + '&markerDiameterKM=' + markerWidthKMs;

    if (operators && operators.length > 0) {
        queryParams += '&operators=';
        
        for (let i = 0; i < operators.length; ++ i) {

            if (i > 0) {
                queryParams += ',';
            }

            queryParams += operators[i].id;
        }
    }

    axios.get(getPathNamePrefix() + '/rest/map' + queryParams)
    
    .then(function (response: any) {
        if (onupdate) {
            onupdate(response.data);
        }
    });
}

