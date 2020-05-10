
export class AreaCountsMap {

    constructor(areaType) {

        this.areaType = areaType;

        this.areaToCountMap = { };
    }

    makeSearchSuggestionTitle(key) {

        return key + ' (' + this.areaType + ')';
    }

    addCount(key, searchText, item) {

        if (!key) {
            throw new "Key not defined";
        }

        const trimmedToLowerCase = key.toLowerCase().trim();

        if (trimmedToLowerCase.includes(searchText.toLowerCase())) {

            var locations = this.areaToCountMap[trimmedToLowerCase];

            if (!locations) {
                locations = [];

                this.areaToCountMap[trimmedToLowerCase] = locations;
            }

            locations.push(item);
        }
    }

    sortAndReturnMatches() {

        var matches = [];

        for (var key in this.areaToCountMap) {

            const value = {
                area: key,
                items: this.areaToCountMap[key]
            };

            matches.push(value)
        }

        // Sort according to counter in descending order
        matches.sort((value, other) => {

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
