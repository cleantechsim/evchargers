
import { ChartJSData, ChartJSDataset } from './chart.model';

export class Country {

    constructor(private code: string, private name: string) {
    }

    get countryCode(): string {
        return this.code;
    }

    get displayName(): string {
        return this.name;
    }
}

export class CountryChartJSData extends ChartJSData {

    constructor(labels: string[], datasets: ChartJSDataset[], private dc: Country[], private ac: Country[]) {
        super(labels, datasets);
    }

    get displayedCountries(): Country[] {
        return this.dc;
    }

    get allCountries(): Country[] {
        return this.ac;
    }
}



