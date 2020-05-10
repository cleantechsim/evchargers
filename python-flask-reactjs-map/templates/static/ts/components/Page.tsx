
import React, { PureComponent } from 'react';

import { SearchView } from './SearchView';
import { Map } from  './Map';
import { EVChargerMap } from '../evchargermap';
import { RESTQueryCaller, PerformQuery, OnResponse } from '../restquerycaller';
import { SearchService } from '../searchservice';
import { Location } from '../location';

import { queryClustersAndPoints } from '../rest';
import { Markers, MarkerPos } from '../markers';

export class PageProps {
    debug: boolean;
}

class PageState {

    searchService: SearchService;
    markerWidthInPixels: number;
    map: EVChargerMap;
    queryCaller: any;
    markers: any;
}

export class Page extends PureComponent<PageProps, PageState> {
    
    constructor(props: PageProps) {
        super(props);
        
        this._onMapCreated = this._onMapCreated.bind(this);
        this._onMapMoveEnd = this._onMapMoveEnd.bind(this);
        this._searchForPlaces = this._searchForPlaces.bind(this);
        this._gotoLocation = this._gotoLocation.bind(this);

        this.state = {
            markerWidthInPixels  : 50,
            searchService : new SearchService(),
            map: null,
            queryCaller: null,
            markers: null
        };
    }

    render() {

        return  <div>
                    <SearchView
                        searchService={this.state.searchService}
                        onSearch={this._searchForPlaces}
                        onGotoLocation={this._gotoLocation}/>
                    
                    <Map
                        onCreated={this._onMapCreated}
                        onMoveend={this._onMapMoveEnd}
                        debug={this.props.debug} />
                </div>;
                
    }

    private _onMapCreated(map: EVChargerMap) {
        
        const queryCaller = new RESTQueryCaller();
        const markers = map.createMarkers(this.props.debug);

        this.setState(state => ({
            markerWidthInPixels  : state.markerWidthInPixels,
            searchService: state.searchService,

            queryCaller: queryCaller,
            markers: markers,
            map: map
        }));

        this._queryMap(map, queryCaller, markers, 'created');
    }

    private _onMapMoveEnd() {
        this._query('moveend')
    }

    private _query(event: string) {
    
        this._queryMap(this.state.map, this.state.queryCaller, this.state.markers, event);
    }

    private _queryMap(
        map: EVChargerMap,
        queryCaller: RESTQueryCaller,
        markersObj: Markers,
        event: string) {

        const zoom = map.getZoom();
        const bounds = map.getBounds();
    
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
            onupdate);
    
        queryCaller.callQuery(
            performQuery,
            (markers: MarkerPos[]) => {
                markersObj.updateMarkers(markers, this.state.markerWidthInPixels);
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
}
