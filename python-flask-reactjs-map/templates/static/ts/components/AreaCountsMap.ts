import { SearchSuggestion } from "./SearchSuggestion";

export class AreaCountsMap {

    private areaType: string;
    private areaToCountMap : Map<string, SearchSuggestion[]>;

    constructor(areaType: string) {

        this.areaType = areaType;

        this.areaToCountMap = new Map();
    }

    makeSearchSuggestionTitle(key : string) {

        return key + ' (' + this.areaType + ')';
    }

    addCount(key: string, searchText: string, item: SearchSuggestion) {

        if (!key) {
            throw "Key not defined";
        }

        const trimmedToLowerCase = key.toLowerCase().trim();

        if (trimmedToLowerCase.includes(searchText.toLowerCase())) {

            let locations:SearchSuggestion[] = this.areaToCountMap.get(trimmedToLowerCase);

            if (!locations) {
                locations = [];

                this.areaToCountMap.set(trimmedToLowerCase, locations);
            }

            locations.push(item);
        }
    }

    sortAndReturnMatches(): AreaMatch[] {

        let matches: AreaMatch[] = [];

        for (let key of this.areaToCountMap.keys()) {

            const value: AreaMatch = {
                area: key,
                items: this.areaToCountMap.get(key)
            };

            matches.push(value)
        }

        // Sort according to counter in descending order
        matches.sort((value: AreaMatch, other: AreaMatch) => {

            var result;

            if (value.items.length < other.items.length) {
                result = -1;
            }
            else if (value.items.length == other.items.length) {
                result = 0;
            }
            else {
                result = 1;
            }

            return result;
        });

        // Which has the most matches?
        return matches;
    }
}

export class AreaMatch {

    public area: string;
    public items: SearchSuggestion[];
}
