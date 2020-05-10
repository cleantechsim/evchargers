

import React, { PureComponent } from 'react';
import { SearchText } from './SearchText';
import { SearchService } from '../searchservice';
import { Location } from '../location';
import { Bounds } from '../bounds';

export class SearchViewProps {
    
    searchService: SearchService;
    onSearch: (text: string) => void;
    onGotoLocation: (location: Location) => void;
    onGotoBounds: (bounds: Bounds) => void;
}


export class SearchView extends PureComponent<SearchViewProps> {

    render() {

        return (<div id="search-view">
            <SearchText
                searchService={this.props.searchService}
                onSearch={this.props.onSearch}
                onGotoLocation={this.props.onGotoLocation}
                onGotoBounds={this.props.onGotoBounds}
            />
            </div>);
    }
}
