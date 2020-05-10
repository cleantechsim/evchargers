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
import { Bounds } from '../bounds';

export class SearchTextProps {

    searchService: SearchService;
    onSearch: (text: string) => void;
    onGotoLocation: (location: Location) => void;
    onGotoBounds: (bounds: Bounds) => void;
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
    private onSearchSuggestionSelected : (suggestion: SearchSuggestion) => void;

    constructor(props: SearchTextProps) {
        super(props);
        
        this.onSearchTextChanged = this._onSearchTextChanged.bind(this);
        this.onSearchClicked = this._onSearchClicked.bind(this);
        this.onSearchSuggestionSelected = this._onSearchSuggestionSelected.bind(this);
        
        this.state = {
            searchValue : "",
            suggestions : [ ],
        };
    }
    
    private _onSearchTextChanged(text: string) : void {

        this.props.searchService.searchForPlaces(text, (response: any) => {

            const suggestions = this.makeSearchSuggestions(response.results, text);

            this.setState(state => ({...state, suggestions: suggestions }));
        });

        this.setState(state => ({
            ...state,
            searchValue : text
        }));
    }

    private _onSearchClicked() {

        const value: SearchTextValue = this.state.searchValue;

        if (typeof value === 'string') {
            this.props.onSearch(value);
        }
    }

    private _onSearchSuggestionSelected(suggestion: SearchSuggestion) {

        if (suggestion.location) {
            this.props.onGotoLocation(suggestion.location);
        }
        else if (suggestion.bounds) {
            this.props.onGotoBounds(suggestion.bounds);
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
                {
                    latitude: result.latitude,
                    longitude: result.longitude
                },
                null);

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

                let suggestion: SearchSuggestion;

                const title: string = areaMap.makeSearchSuggestionTitle(firstMatch.area);

                if (areaMap.areaType.toLowerCase() === 'street') {

                    const midPoint: Location = this.findGeoMidpoint(firstMatch.items);

                    suggestion = new SearchSuggestion(title, midPoint, null);
                }
                else {
                    // country, state or town
                    const bounds: Bounds = this.findBounds(firstMatch.items);

                    suggestion = new SearchSuggestion(title, null, bounds);
                }
                
                // 3 in same area, likely a search match
                if (suggestion) {
                    searchSuggestions.push(suggestion);
                }
            }
        }
    }

    private findGeoMidpoint(items: SearchSuggestion[]): Location {

        var latitude = 0;
        var longitude = 0;

        for (var i = 0; i < items.length; ++ i) {

            const item = items[i];

            latitude += item.location.latitude;
            longitude += item.location.longitude;
        }

        latitude /= items.length;
        longitude /= items.length;

        return {
            latitude : latitude,
            longitude : longitude
        };
    }

    private findBounds(items: SearchSuggestion[]) : Bounds {

        let southWest: Location = {
            latitude: 90,
            longitude: 180
        };

        let northEast: Location = {
            latitude: -90,
            longitude: -180
        };

        for (var i = 0; i < items.length; ++ i) {

            const item = items[i];

            const latitude: number = item.location.latitude;
            const longitude: number= item.location.longitude;

            if (latitude < southWest.latitude) {
                southWest.latitude = latitude;
            }
            
            if (latitude > northEast.latitude) {
                northEast.latitude = latitude;
            }

            if (longitude < southWest.longitude) {
                southWest.longitude = longitude;
            }
            
            if (longitude > northEast.longitude) {
                northEast.longitude = longitude;
            }
        }

        return {
            southWest : southWest,
            northEast : northEast
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

            const suggestion: SearchSuggestion = this.toSuggestion(result);
            
            if (result.country) {
                all.countries.addCount(result.country, searchText, suggestion);
            }

            if (result.stateOrProvince) {
                all.stateOrProvinces.addCount(result.stateOrProvince, searchText, suggestion);
            }

            if (result.town) {
               all.towns.addCount(result.town, searchText, suggestion);
            }

            if (result.addressLine1) {
                all.streets.addCount(result.addressLine1, searchText, suggestion);
            }
        }

        return all;
    }

    private toSuggestion(result: SearchResult) : SearchSuggestion {

        return new SearchSuggestion(
            result.title,
            {
                latitude: result.latitude,
                longitude: result.longitude
            },
            null);

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
                        onKeyUp={ (e: any) => { if (e.key == 'Enter') { e.target.blur(); this.onSearchClicked() } }}
                        onChange={ (e: any) => this.setState(state => ({...state, searchValue: e.value})) }
                        onSelect={ (e: any) => this.onSearchSuggestionSelected(e.value)}
                        completeMethod={(e: any) => this.onSearchTextChanged(e.query)}
                        />
                </div>

                <Button
                    id="search-button"
                    label="Search"
                    onClick={ this.onSearchClicked }/>

            </div>);
    }
}
