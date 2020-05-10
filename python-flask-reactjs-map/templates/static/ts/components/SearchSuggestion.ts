import { Bounds } from "../bounds";
import { Location } from "../location";

export class SearchSuggestion {

    public title: string;
    public location: Location;
    public bounds: Bounds;

    constructor(title: string, location: Location, bounds: Bounds) {
        this.title = title;
        this.location = location;
        this.bounds = bounds;
    }
}
