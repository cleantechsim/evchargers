import React, { SyntheticEvent, PureComponent } from 'react';
import { AutoComplete } from 'primereact/autocomplete';
import { Button } from 'primereact/button';

import { AreaCountsMap, AreaMatch } from './AreaCountsMap';

import 'primereact/resources/themes/nova-light/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import { SearchSuggestion } from './SearchSuggestion';
import { Location } from '../location';
import { SearchResult } from '../searchresult';
import { SearchService } from '../searchservice';

export class SearchTextProps {

    searchService: SearchService;
    onSearch: (text: string) => void;
    onGotoLocation: (location: Location) => void;
}

type SearchTextValue = string | SearchSuggestion;

class SearchTextState {

    searchValue: SearchTextValue;
    suggestions: SearchSuggestion[];
}

class AreaMaps {

    countries           : AreaCountsMap;
    stateOrProvinces    : AreaCountsMap;
    towns               : AreaCountsMap;
    streets             : AreaCountsMap;
};


export class SearchText extends PureComponent<SearchTextProps, SearchTextState> {

    private onSearchTextChanged : (text: string) => void;
    private onSearchClicked : () => void;

    constructor(props: SearchTextProps) {
        super(props);
        
        this.onSearchTextChanged = this._onSearchTextChanged.bind(this);
        this.onSearchClicked = this._onSearchClicked.bind(this);
        
        this.state = {
            searchValue : "",
            suggestions : [ ],
        };
    }
    
    private _onSearchTextChanged(text: string) : void {

        this.props.searchService.searchForPlaces(text, (response: any) => {

            const suggestions = this.makeSearchSuggestions(response.results, text);

            this.setState({...this.state, suggestions: suggestions });
        });

        this.setState(state => ({
            searchValue : text
        }));
    }

    private _onSearchClicked() {

        const value = this.state.searchValue;

        if (typeof value === 'string') {
            this.props.onSearch(value);
        }
        else {
            this.props.onGotoLocation({ latitude : value.latitude, longitude : value.longitude });
        }
    }

    private makeSearchSuggestions(results: SearchResult[], searchText: string) {

        let searchSuggestions: SearchSuggestion[] = [];

        const sorted: AreaMaps = this.sortAreasByField(results, searchText);

        this.addAreaMatchIfFound(searchSuggestions, sorted.countries);
        this.addAreaMatchIfFound(searchSuggestions, sorted.stateOrProvinces);
        this.addAreaMatchIfFound(searchSuggestions, sorted.towns);
        this.addAreaMatchIfFound(searchSuggestions, sorted.streets);

        // Now add the results themselves, by title
        for (var i = 0; i < results.length; ++ i) {

            const result = results[i];
            
            const suggestion: SearchSuggestion = new SearchSuggestion(
                result.title,
                result.latitude,
                result.longitude);

            searchSuggestions.push(suggestion);
        }

        return searchSuggestions;
    }

    // Add a match for an area if enough suggestions for the same area
    // eg a number of matches for the same country
    private addAreaMatchIfFound(searchSuggestions: SearchSuggestion[], areaMap: AreaCountsMap) {
        
        const sortedMatches: AreaMatch[] = areaMap.sortAndReturnMatches();

        if (sortedMatches.length > 0) {

            const firstMatch: AreaMatch = sortedMatches[0];
            
            // More than 3 matches for the same item?
            if (firstMatch.items.length > 3) {

                const midPoint = this.findGeoMidpoint(firstMatch.items);

                const suggestion: SearchSuggestion = new SearchSuggestion(
                            areaMap.makeSearchSuggestionTitle(firstMatch.area),
                            midPoint.latitude,
                            midPoint.longitude);
                
                // 3 in same area, likely a search match
                searchSuggestions.push(suggestion);
            }
        }
    }

    private findGeoMidpoint(items: SearchSuggestion[]): Location {

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

    
    private sortAreasByField(results: SearchResult[], searchText: string) : AreaMaps{

        if (!searchText) {
            throw "No search text";
        }

        const all: AreaMaps = {
            countries           : new AreaCountsMap('Country'),
            stateOrProvinces    : new AreaCountsMap('State or province'),
            towns               : new AreaCountsMap('Town'),
            streets             : new AreaCountsMap('Street')
        };

        for (var i = 0; i < results.length; ++ i) {

            const result: SearchResult = results[i];
            
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
                        onKeyUp={ (e: any) => { if (e.key == 'Enter') { e.target.blur(); this._onSearchClicked() } }}
                        onChange={ (e: any) => this.setState({searchValue: e.value}) }
                        onSelect={ (e: any) => this._onSearchClicked() }
                        completeMethod={(e: any) => this._onSearchTextChanged(e.query)}
                        />
                </div>

                <Button
                    id="search-button"
                    label="Search"
                    onClick={ this._onSearchClicked }/>

            </div>);
    }
}
