
import React, { PureComponent } from 'react';

import { SearchView } from './SearchView';
import { Map } from  './Map';

export class Page extends PureComponent {
    
    constructor(props) {
        super(props);
        
        this._onMapCreated = this._onMapCreated.bind(this);
        this._onMapMoveEnd = this._onMapMoveEnd.bind(this);
        this._searchForPlaces = this._searchForPlaces.bind(this);

        this.state = {
            markerWidthInPixels  : 50,
            searchService : new SearchService()
        };
    }

    render() {

        return  <div>
                    <SearchView
                        searchService={this.state.searchService}
                        onSearch={this._searchForPlaces}/>
                    
                    <Map
                        onCreated={this._onMapCreated}
                        onMoveend={this._onMapMoveEnd}
                        debug={this.props.debug} />
                </div>;
                
    }

    _onMapCreated(map) {
        
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

    _onMapMoveEnd() {
        this._query('moveend')
    }

    _query(event) {
    
        this._queryMap(this.state.map, this.state.queryCaller, this.state.markers, event);
    }

    _queryMap(
        map,
        queryCaller,
        markersObj,
        event) {

        const zoom = map.getZoom();
        const bounds = map.getBounds();
    
        const markerWidthKMs = map.computeMaxDiameterMarker(this.state.markerWidthInPixels,
                                                            this.props.debug);
        if (this.props.debug) {
            console.log('## marker width in kms ' + markerWidthKMs);
        }
    
        queryCaller.callQuery(
    
            onupdate => queryClustersAndPoints(
                'didMount',
                zoom,
                bounds,
                markerWidthKMs,
                onupdate),
    
            markers => {
                markersObj.updateMarkers(markers, this.state.markerWidthInPixels);
            });
    }

    _searchForPlaces(text) {

        this.state.searchService.searchForOnePlace(text, location => {
            
            if (location) {
                this.state.map.gotoLocation(location);
            }
        });
    }
}
