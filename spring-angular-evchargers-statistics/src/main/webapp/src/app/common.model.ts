
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

export class CommonByCountryAndYearParams {

    constructor(
        private c: string[],
        private maxC: number, // Max to return unless list of countries is specified
    ) {

    }

    public get countriesToReturn(): string[] {
        return this.c;
    }

    public get maxCountriesToReturn(): number {
        return this.maxC;
    }
}