import React, { PureComponent } from 'react';
import { AutoComplete } from 'primereact/autocomplete';
import { Button } from 'primereact/button';

import { AreaCountsMap } from './AreaCountsMap';

import 'primereact/resources/themes/nova-light/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

export class SearchText extends PureComponent {

    constructor(props) {
        super(props);
        
        this._onSearchTextChanged = this._onSearchTextChanged.bind(this);
        this._onSearchClicked = this._onSearchClicked.bind(this);
        
        this.state = {
            searchValue : "",
            suggestions : [ ],
        };
    }
    
    _onSearchTextChanged(text) {

        this.props.searchService.searchForPlaces(text, response => {

            const suggestions = this._makeSearchSuggestions(response.results, text);

            this.setState({ suggestions: suggestions });
        })

        this.setState(state => ({
            searchValue : text
        }));
    }

    _onSearchClicked() {

        const value = this.state.searchValue;

        if (typeof value === 'string') {
            this.props.onSearch(value);
        }
        else {
            this.props.onGotoLocation({ latitude : value.latitude, longitude : value.longitude });
        }
    }

    _makeSearchSuggestions(results, searchText) {

        var searchSuggestions = [];

        const sorted = this._sortAreasByField(results, searchText);

        this._addAreaMatchIfFound(searchSuggestions, sorted.countries);
        this._addAreaMatchIfFound(searchSuggestions, sorted.stateOrProvinces);
        this._addAreaMatchIfFound(searchSuggestions, sorted.towns);
        this._addAreaMatchIfFound(searchSuggestions, sorted.streets);

        // Now add the results themselves, by title
        for (var i = 0; i < results.length; ++ i) {

            const result = results[i];
            
            searchSuggestions.push({
                title: result.title,
                latitude: result.latitude,
                longitude: result.longitude
            });
        }

        return searchSuggestions;
    }

    // Add a match for an area if enough suggestions for the same area
    // eg a number of matches for the same country
    _addAreaMatchIfFound(searchSuggestions, areaMap) {
        
        const sortedMatches = areaMap.sortAndReturnMatches();

        if (sortedMatches.length > 0) {

            const firstMatch = sortedMatches[0];
            
            // More than 3 matches for the same item?
            if (firstMatch.items.length > 3) {

                const midPoint = this._findGeoMidpoint(firstMatch.items);

                // 3 in same area, likely a search match
                searchSuggestions.push({
                    
                    title : areaMap.makeSearchSuggestionTitle(firstMatch.area),

                    latitude : midPoint.latitude,
                    longitude : midPoint.longitude
                });
            }
        }
    }

    _findGeoMidpoint(items) {

        var latitude = 0;
        var longitude = 0;

        for (var i = 0; i < items.length; ++ i) {

            const item = items[i];

            latitude += item.latitude;
            longitude += item.longitude;
        }

        latitude /= items.length;
        longitude /= items.length;

        return {
            latitude : latitude,
            longitude : longitude
        };
    }

    

    _sortAreasByField(results, searchText) {

        if (!searchText) {
            throw "No search text";
        }

        var all = {
            countries           : new AreaCountsMap('Country'),
            stateOrProvinces    : new AreaCountsMap('State or province'),
            towns               : new AreaCountsMap('Town'),
            streets             : new AreaCountsMap('Street')
        };

        for (var i = 0; i < results.length; ++ i) {

            const result = results[i];
            
            if (result.country) {
                all.countries.addCount(result.country, searchText, result);
            }

            if (result.stateOrProvince) {
                all.stateOrProvinces.addCount(result.stateOrProvince, searchText, result);
            }

            if (result.town) {
               all.towns.addCount(result.town, searchText, result);
            }

            if (result.addressLine1) {
                all.streets.addCount(result.addressLine1, searchText, result);
            }
        }

        return all;
    }


    render() {

        return (            
            <div>
                <div id="search-input-view">
                    <AutoComplete
                        id="search-input"
                        value={this.state.searchValue}
                        placeholder="Country, town or street"
                        field="title"
                        suggestions={this.state.suggestions}
                        onKeyUp={ e => { if (e.key == 'Enter') { e.target.blur(); this._onSearchClicked() } }}
                        onChange={e => this.setState({searchValue: e.value}) }
                        onSelect={ e => this._onSearchClicked() }
                        completeMethod={e => this._onSearchTextChanged(e.query)}
                        />
                </div>

                <Button
                    id="search-button"
                    label="Search"
                    onClick={ this._onSearchClicked }/>

            </div>);
    }
}
