
import React, { PureComponent } from 'react';

import { SearchView } from './SearchView';
import { Map as ChargerMap } from  './Map';
import { EVChargerMap } from '../evchargermap';
import { RESTQueryCaller, PerformQuery, OnResponse } from '../restquerycaller';
import { SearchService } from '../searchservice';
import { Location } from '../location';

import { queryClustersAndPoints } from '../rest';
import { Markers } from '../markers';
import { ClustersResult, Operator, ConnectionType } from '../dtos/clusterssresult';
import { Bounds } from '../bounds';
import { NamedOperator, NamedConnectionType } from '../facetinfo';
import { ReferenceData } from '../dtos/referencedata';
import { getReferenceData } from '../rest';
import { Range } from '../range';

export class PageProps {
    debug: boolean;
}

class PageState {

    searchService: SearchService;
    markerWidthInPixels: number;
    map: EVChargerMap;
    queryCaller: any;
    markers: any;
    allVisibleOperators: NamedOperator[];
    allVisibleConnectionTypes: NamedConnectionType[];
    selectedOperators: NamedOperator[];
    selectedConnectionTypes: NamedConnectionType[];
    kwRange: Range;
    kwMinMax: Range;
    referenceData: ReferenceData;
}

export class Page extends PureComponent<PageProps, PageState> {

    private static MAX_KW = 1000;
    
    constructor(props: PageProps) {
        super(props);

        this._onMapCreated = this._onMapCreated.bind(this);
        this._onMapMoveEnd = this._onMapMoveEnd.bind(this);
        this._searchForPlaces = this._searchForPlaces.bind(this);
        this._gotoLocation = this._gotoLocation.bind(this);
        this._gotoBounds = this._gotoBounds.bind(this);

        this._updateOnOperatorSelected = this._updateOnOperatorSelected.bind(this);
        this._processQueryResponse = this._processQueryResponse.bind(this);
        this._updateOnKwRangeSelected = this._updateOnKwRangeSelected.bind(this);
        this._updateOnConnectionTypeSelected = this._updateOnConnectionTypeSelected.bind(this);

        const kwMinMax = {
            min: 0,
            max: Page.MAX_KW
        };
        
        this.state = {
            markerWidthInPixels  : 50,
            searchService : new SearchService(),
            map: null,
            queryCaller: null,
            markers: null,
            allVisibleOperators: [],
            allVisibleConnectionTypes: [],
            selectedOperators: null,
            selectedConnectionTypes: null,
            kwRange: kwMinMax,
            kwMinMax: kwMinMax,
            referenceData: null
        };
    }

    render() {

        return <div>
                    <SearchView
                        searchService={this.state.searchService}
                        allVisibleOperators={this.state.allVisibleOperators}
                        allVisibleConnectionTypes={this.state.allVisibleConnectionTypes}
                        kwMinMax={this.state.kwMinMax}
                        onSearch={this._searchForPlaces}
                        onGotoLocation={this._gotoLocation}
                        onGotoBounds={this._gotoBounds}
                        onOperatorSelected={this._updateOnOperatorSelected}
                        onConnectionTypeSelected={this._updateOnConnectionTypeSelected}
                        onKwRangeSelected={this._updateOnKwRangeSelected}/>
                    
                    <ChargerMap
                        onCreated={this._onMapCreated}
                        onMoveend={this._onMapMoveEnd}
                        debug={this.props.debug} />
                </div>;
                
    }

    private _onMapCreated(map: EVChargerMap) {
        
        const queryCaller = new RESTQueryCaller();
        const markers = map.createMarkers(this.props.debug);

        this.setState(state => ({
            ...state,
            markerWidthInPixels  : state.markerWidthInPixels,
            searchService: state.searchService,

            queryCaller: queryCaller,
            markers: markers,
            map: map
        }));

        this._queryMap(map, queryCaller, markers, this.state.selectedOperators, this.state.selectedConnectionTypes, this.state.kwRange, 'created');
    }

    private _onMapMoveEnd() {
        this._query('moveend')
    }

    private _query(event: string) {

        this._queryMap(
            this.state.map,
            this.state.queryCaller,
            this.state.markers,
            this.state.selectedOperators,
            this.state.selectedConnectionTypes,
            this.state.kwRange,
            event);
    }

    private _queryOperators(event: string, operators: NamedOperator[]) {
    
        this._queryMap(
            this.state.map,
            this.state.queryCaller,
            this.state.markers,
            operators,
            this.state.selectedConnectionTypes,
            this.state.kwRange,
            event);
    }

    private _queryConnectionTypes(event: string, connectionTypes: NamedConnectionType[]) {
    
        this._queryMap(
            this.state.map,
            this.state.queryCaller,
            this.state.markers,
            this.state.selectedOperators,
            connectionTypes,
            this.state.kwRange,
            event);
    }

    private _queryKwRange(event: string, kwRange: Range) {
    
        this._queryMap(
            this.state.map,
            this.state.queryCaller,
            this.state.markers,
            this.state.selectedOperators,
            this.state.selectedConnectionTypes,
            kwRange,
            event);
    }

    private _queryMap(
        map: EVChargerMap,
        queryCaller: RESTQueryCaller,
        markersObj: Markers,
        operators: NamedOperator[],
        connectionTypes: NamedConnectionType[],
        kwRange: Range,
        event: string) {

        const zoom = map.getZoom();
        const bounds: Bounds = map.getBounds();
    
        const markerWidthKMs = map.computeMaxDiameterMarker(this.state.markerWidthInPixels,
                                                            this.props.debug);
        if (this.props.debug) {
            console.log('## marker width in kms ' + markerWidthKMs);
        }

        let performQuery: PerformQuery = (onupdate: OnResponse) => queryClustersAndPoints(
            'didMount',
            zoom,
            bounds,
            markerWidthKMs,
            operators,
            connectionTypes,
            kwRange,
            onupdate);
    
        queryCaller.callQuery(
            performQuery,
            (result: ClustersResult) => {

                markersObj.updateMarkers(result.points, this.state.markerWidthInPixels);

                this._processQueryResponse(result.operators, result.kw_min_max, result.connection_types);
            });
    }

    private _searchForPlaces(text: string) {

        this.state.searchService.searchForOnePlace(text, location => {
            
            if (location) {
                this.state.map.gotoLocation(location);
            }
        });
    }

    private _gotoLocation(location: Location) {
        this.state.map.gotoLocation(location);
    }

    private _gotoBounds(bounds: Bounds) {
        this.state.map.gotoBounds(bounds);
    }

    private _updateOnOperatorSelected(operators: NamedOperator[]) {

        this.setState(state => ({...state, selectedOperators: operators}));

        this._queryOperators('operatorSelected', operators);
    }

    private _updateOnConnectionTypeSelected(connectionTypes: NamedConnectionType[]) {

        this.setState(state => ({...state, selectedConnectionTypes: connectionTypes}));

        this._queryConnectionTypes('connectionTypeSelected', connectionTypes);
    }

    private _processQueryResponse(operatorsMap: Operator[], kwMinMax: Range, connectionTypesMap: ConnectionType[]) {

        if (!this.state.referenceData) {
            this._queryReferenceData(referenceData => {
                
                this._mapAndUpdate(operatorsMap, connectionTypesMap, referenceData);
            });
        }
        else {
            this._mapAndUpdate(operatorsMap, connectionTypesMap, this.state.referenceData);
        }

        if (kwMinMax) {

            if (kwMinMax.max > Page.MAX_KW) {
                kwMinMax.max = Page.MAX_KW;
            }
            
            this.setState(state => ({...state, kwMinMax: kwMinMax}));
        }
    }

    private _mapAndUpdate(operatorsMap: Operator[], connectionTypesMap: ConnectionType[], referenceData: ReferenceData): void {

        this.setState(state => ({
            ...state,
            allVisibleOperators: Page._mapOperators(operatorsMap, referenceData),
            allVisibleConnectionTypes : Page._mapConnectionTypes(connectionTypesMap, referenceData)
        }))
    }

    private _queryReferenceData(onResponse: (referenceData: ReferenceData) => void): void {
        
        getReferenceData((data: ReferenceData) => {

            this.setState(state => ({...state, referenceData: data}))
            
            if (onResponse) {
                onResponse(data);
            }
        });
    }

    private static _mapOperators(operatorsMap: Operator[], referenceData: ReferenceData) : NamedOperator[] {

        return Page._map(
            operatorsMap,
            referenceData,
            op => op.id,
            (rd, idNumber) => Page._findOperatorName(rd, idNumber),
            (op, name) => ({ id : op.id, count: op.count, name: name}))
    }

    private static _findOperatorName(referenceData: ReferenceData, id: number): string {
    
        return Page._findName(referenceData, id, rd => rd.Operators, op => op.ID, op => op.Title);
    }

    private static _mapConnectionTypes(connectionTypesMap: ConnectionType[], referenceData: ReferenceData) : NamedConnectionType[] {

        return Page._map(
            connectionTypesMap,
            referenceData,
            ct => ct.id,
            (rd, idNumber) => Page._findConnectionTypeName(rd, idNumber),
            (ct, name) => ({ id : ct.id, count: ct.count, name: name}))
    }


    private static _map<T, R>(
        map: T[],
        referenceData: ReferenceData,
        getIdNumber: (element: T) => number,
        findName: (referenceData: ReferenceData, idNumber: number) => string,
        create: (element: T, name: string) => R) {

        let result: R[] = [];

        for (let element of map) {
            
            const idNumber: number = getIdNumber(element);

            const name = findName(referenceData, idNumber);

            if (name) {
                const r: R = create(element, name);

                result.push(r);
            }
        }
        
        return result;
    }


    private static _findConnectionTypeName(referenceData: ReferenceData, id: number): string {
    
        return Page._findName(referenceData, id, rd => rd.ConnectionTypes, ct => ct.ID, ct => ct.Title);
    }

    private static _findName<T>(
        referenceData: ReferenceData,
        id: number,
        getElements: (referenceData: ReferenceData) => T[],
        getId: (element: T) => number,
        getName: (element: T) => string)
            
            : string {
        
        let found: string = null;

        for (let element of getElements(referenceData)) {

            if (getId(element) === id) {
                found = getName(element);
                break;
            }
        }

        return found;
    }

    private _updateOnKwRangeSelected(kwRange: Range) {

        this.setState(state => ({...state, kwRange: kwRange}));

        this._queryKwRange('kwRangeSelected', kwRange);
    }
}
