

import React, { PureComponent } from 'react';
import { SearchText } from './SearchText';

export class SearchView extends PureComponent {

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
