
import { ChartJSData, ChartJSDataset } from './chart.model';

export interface UpdateMinimumChargers {
    updateMinimumChargers(value: number): void;
}

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

export class CountryWithChargers extends Country {
    constructor(code: string, name: string, private chargers: number) {
        super(code, name);
    }

    numberOfChargers(): number {
        return this.chargers;
    }
}

export class CountryWithValue extends CountryWithChargers {

    constructor(code: string, name: string, chargers: number, private val: number) {
        super(code, name, chargers);
    }

    get value() {
        return this.val;
    }
}

export class CountryChartJSData extends ChartJSData {

    constructor(labels: string[], datasets: ChartJSDataset[], private dc: Country[], private ac: CountryWithValue[]) {
        super(labels, datasets);
    }

    get displayedCountries(): Country[] {
        return this.dc;
    }

    get allCountries(): CountryWithValue[] {
        return this.ac;
    }
}

export class CommonByCountryAndYearParams {

    constructor(
        private c: string[],
        private minNumChargers: number,
        private maxC: number, // Max to return unless list of countries is specified
    ) {

    }

    public get countriesToReturn(): string[] {
        return this.c;
    }

    public get minNumberOfChargers(): number {
        return this.minNumChargers;
    }

    public get maxCountriesToReturn(): number {
        return this.maxC;
    }
}
