
import axios from 'axios';

import { SearchResult } from './searchresult';

declare function getPathNamePrefix() : void;

class SearchForPlacesResponse {

    results: SearchResult[];
    
}

export class SearchService {

    public searchForOnePlace(searchText: string, onresult: (data: any) => void) {

        if (!searchText) {
            throw "Search text not defined";
        }

        this.searchForPlaces(searchText, (response: SearchForPlacesResponse) => {

            var place = response.results.length > 0
                ? response.results[0]
                : null;

            onresult(place);
        }); 
    }

    public searchForPlaces(place: string, onresult: (response : SearchForPlacesResponse) => void) {

        axios.get(getPathNamePrefix() + '/rest/search?place=' + encodeURIComponent(place)

        ).then(function (response) {
            onresult(response.data);
        })
    }

}
