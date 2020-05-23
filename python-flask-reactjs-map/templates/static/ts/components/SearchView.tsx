

import React, { PureComponent } from 'react';
import { SearchText } from './SearchText';
import { SearchFacets } from './SearchFacets'
import { SearchService } from '../searchservice';
import { Location } from '../location';
import { Bounds } from '../bounds';
import { NamedOperator, NamedConnectionType } from '../facetinfo';
import { Range } from '../range';

export class SearchViewProps {
    
    searchService: SearchService;
    allVisibleOperators: NamedOperator[];
    allVisibleConnectionTypes: NamedConnectionType[];
    kwMinMax: Range;
    onSearch: (text: string) => void;
    onGotoLocation: (location: Location) => void;
    onGotoBounds: (bounds: Bounds) => void;
    onOperatorSelected: (operators: NamedOperator[]) => void;
    onConnectionTypeSelected: (connectionTypes: NamedConnectionType[]) => void;
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
                allVisibleConnectionTypes={this.props.allVisibleConnectionTypes}
                kwMinMax={this.props.kwMinMax}
                onOperatorSelected={this.props.onOperatorSelected}
                onConnectionTypeSelected={this.props.onConnectionTypeSelected}
                onKwRangeSelected={this.props.onKwRangeSelected}/>
            </div>);
    }
}
