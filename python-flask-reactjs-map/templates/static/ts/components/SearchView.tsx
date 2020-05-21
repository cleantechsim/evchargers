

import React, { PureComponent } from 'react';
import { SearchText } from './SearchText';
import { SearchFacets } from './SearchFacets'
import { SearchService } from '../searchservice';
import { Location } from '../location';
import { Bounds } from '../bounds';
import { NamedOperator } from '../facetinfo';
import { Range } from '../range';

export class SearchViewProps {
    
    searchService: SearchService;
    allVisibleOperators: NamedOperator[];
    kwMinMax: Range;
    onSearch: (text: string) => void;
    onGotoLocation: (location: Location) => void;
    onGotoBounds: (bounds: Bounds) => void;
    onOperatorSelected: (operators: NamedOperator[]) => void;
    onKwRangeSelected: (kwRange: Range) => void;
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
            <SearchFacets
                allVisibleOperators={this.props.allVisibleOperators}
                kwMinMax={this.props.kwMinMax}
                onOperatorSelected={this.props.onOperatorSelected}
                onKwRangeSelected={this.props.onKwRangeSelected}/>
            </div>);
    }
}
