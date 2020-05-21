
import React, { PureComponent } from 'react';

import { SearchView } from './SearchView';
import { Map as ChargerMap } from  './Map';
import { EVChargerMap } from '../evchargermap';
import { RESTQueryCaller, PerformQuery, OnResponse } from '../restquerycaller';
import { SearchService } from '../searchservice';
import { Location } from '../location';

import { queryClustersAndPoints } from '../rest';
import { Markers } from '../markers';
import { ClustersResult, Operator } from '../dtos/clusterssresult';
import { Bounds } from '../bounds';
import { NamedOperator } from '../facetinfo';
import { ReferenceData } from '../dtos/referencedata';
import { getReferenceData } from '../rest';

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
    selectedOperators: NamedOperator[];
    referenceData: ReferenceData;
}

export class Page extends PureComponent<PageProps, PageState> {
    
    constructor(props: PageProps) {
        super(props);

        this._onMapCreated = this._onMapCreated.bind(this);
        this._onMapMoveEnd = this._onMapMoveEnd.bind(this);
        this._searchForPlaces = this._searchForPlaces.bind(this);
        this._gotoLocation = this._gotoLocation.bind(this);
        this._gotoBounds = this._gotoBounds.bind(this);

        this._updateOnOperatorSelected = this._updateOnOperatorSelected.bind(this);
        this._processOperatorsResponse = this._processOperatorsResponse.bind(this);

        this.state = {
            markerWidthInPixels  : 50,
            searchService : new SearchService(),
            map: null,
            queryCaller: null,
            markers: null,
            allVisibleOperators: [],
            selectedOperators: null,
            referenceData: null
        };
    }

    render() {

        return <div>
                    <SearchView
                        searchService={this.state.searchService}
                        allVisibleOperators={this.state.allVisibleOperators}
                        onSearch={this._searchForPlaces}
                        onGotoLocation={this._gotoLocation}
                        onGotoBounds={this._gotoBounds}
                        onOperatorSelected={this._updateOnOperatorSelected}/>
                    
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

        this._queryMap(map, queryCaller, markers, this.state.selectedOperators, 'created');
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
            event);
    }

    private _queryOperators(event: string, operators: NamedOperator[]) {
    
        this._queryMap(
            this.state.map,
            this.state.queryCaller,
            this.state.markers,
            operators,
            event);
    }

    private _queryMap(
        map: EVChargerMap,
        queryCaller: RESTQueryCaller,
        markersObj: Markers,
        operators: NamedOperator[],
        event: string) {

        const zoom = map.getZoom();
        const bounds: Bounds = map.getBounds();
    
        const markerWidthKMs = map.computeMaxDiameterMarker(this.state.markerWidthInPixels,
                                                            this.props.debug);
        if (this.props.debug) {
            console.log('## marker width in kms ' + markerWidthKMs);
        }

        let createdOrMovedEvent: boolean = event === 'created' || event === 'moveend';
        
        let performQuery: PerformQuery = (onupdate: OnResponse) => queryClustersAndPoints(
            'didMount',
            zoom,
            bounds,
            markerWidthKMs,
            operators,
            onupdate);
    
        queryCaller.callQuery(
            performQuery,
            (result: ClustersResult) => {
                markersObj.updateMarkers(result.points, this.state.markerWidthInPixels);

                this._processOperatorsResponse(result.operators, createdOrMovedEvent);
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

    private _processOperatorsResponse(operatorsMap: Operator[], shouldUpdateAllVisible: boolean) {

        if (!this.state.referenceData) {
            this._queryReferenceData(referenceData => {
                
                this._mapAndUpdateOperators(operatorsMap, referenceData, shouldUpdateAllVisible);
            });
        }
        else {
            this._mapAndUpdateOperators(operatorsMap, this.state.referenceData, shouldUpdateAllVisible);
        }        
    }

    private _mapAndUpdateOperators(operatorsMap: Operator[], referenceData: ReferenceData, shouldUpdateAllVisible: boolean): void {

        if (shouldUpdateAllVisible) {
            this.setState(state => ({...state, allVisibleOperators: Page._mapOperators(operatorsMap, referenceData)}))
        }
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

        let operators: NamedOperator[] = [];

        for (let op of operatorsMap) {
            
            let idNumber: number = parseInt(op.id);

            let operatorName = Page._findOperatorName(referenceData, idNumber);

            if (operatorName) {

                operators.push({
                    id: op.id,
                    name: operatorName, //  + ' [' + op.count +']',
                    count: op.count
                });
            }
        }
        
        return operators;
    }

    private static _findOperatorName(referenceData: ReferenceData, id: number): string {
        
        let found: string = null;

        for (let operator of referenceData.Operators) {

            if (operator.ID === id) {
                found = operator.Title;
                break;
            }
        }

        return found;
    }
}
