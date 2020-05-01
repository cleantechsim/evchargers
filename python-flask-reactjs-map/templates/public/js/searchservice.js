
function SearchService() {

}

SearchService.prototype.searchForOnePlace = function(searchText, onresult) {

    if (!searchText) {
        throw "Search text not defined";
    }

    this.searchForPlaces(searchText, response => {

        var place = response.results.length > 0
            ? response.results[0]
            : null;

        onresult(place);
    }); 
}
    

SearchService.prototype.searchForPlaces = function(place, onresult) {

    axios.get(getPathNamePrefix() + '/rest/search?place=' + encodeURIComponent(place)

    ).then(function (response) {
        onresult(response.data);
    })
}
