
import axios from 'axios';

import {normalizeLongitude} from './geo_util';

import { ReferenceData } from './dtos/referencedata';
import { Operator, ConnectionType } from './dtos/clusterssresult';
import { Bounds } from './bounds';
import { Range } from './range';

export function queryClustersAndPoints(
    eventType: string,
    zoom: number,
    bounds: Bounds,
    markerWidthKMs: number,
    operators: Operator[],
    connectionTypes: ConnectionType[],
    kwRange: Range,
    onupdate: (data: any) => void) {

    const debug: boolean = false;

    if (debug) {
        console.log('## marker width in kms ' + markerWidthKMs);
    }

    _queryPoints(zoom, bounds, markerWidthKMs, operators, connectionTypes, kwRange, onupdate, debug);
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
    connectionTypes: ConnectionType[],
    kwRange: Range,
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

    queryParams = _addParamValues(queryParams, 'operators', operators, op => op.id);
    
    if (kwRange) {
        queryParams += '&minKw=' + kwRange.min;
        queryParams += '&maxKw=' + kwRange.max;
    }

    queryParams = _addParamValues(queryParams, 'connectionTypes', connectionTypes, ct => ct.id);

    axios.get(getPathNamePrefix() + '/rest/map' + queryParams)
    
    .then(function (response: any) {
        if (onupdate) {
            onupdate(response.data);
        }
    });
}

function _addParamValues<T, V>(queryParams: string, paramName: string, elements: T[], getValue: (element: T) => V) {

    if (elements && elements.length > 0) {
        queryParams += '&' + paramName + '=';
        
        for (let i = 0; i < elements.length; ++ i) {

            if (i > 0) {
                queryParams += ',';
            }

            queryParams += getValue(elements[i]);
        }
    }

    return queryParams;
}

