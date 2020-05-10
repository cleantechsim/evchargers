
export class SearchSuggestion {

    public title: string;
    public latitude: number;
    public longitude: number;
    
    constructor(title: string, latitude: number, longitude: number) {
        this.title = title;
        this.latitude = latitude;
        this.longitude = longitude;
    }
}
