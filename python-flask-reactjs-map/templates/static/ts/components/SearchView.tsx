

import React, { PureComponent } from 'react';
import { SearchText } from './SearchText';
import { SearchService } from '../searchservice';
import { Location } from '../location';

export class SearchViewProps {
    
    searchService: SearchService;
    onSearch: (text: string) => void;
    onGotoLocation: (location: Location) => void;
}


export class SearchView extends PureComponent<SearchViewProps> {

    render() {

        return (<div id="search-view">
            <SearchText
                searchService={this.props.searchService}
                onSearch={this.props.onSearch}
                onGotoLocation={this.props.onGotoLocation}
            />
            </div>);
    }
}
