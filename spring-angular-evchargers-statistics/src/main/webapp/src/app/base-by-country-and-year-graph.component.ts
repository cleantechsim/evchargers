
import { Country } from './common.model';

export class UICountry extends Country {

    constructor(country: Country, private disp: boolean) {
        super(country.countryCode, country.displayName);
    }

    get displayed(): boolean {
        return this.disp;
    }
}

export abstract class BaseByCountryAndYearGraphComponent {

    static MAX_COUNTRIES = 1;

    private acountries: UICountry[];
    private selCountries: object;

    protected abstract updateGraph(): void;

    protected updateCountries(displayedCountries: Country[], allCountries: Country[]): void {

        this.acountries = [];

        allCountries.forEach(c => {
            const displayed: boolean = displayedCountries.find(dc => dc.countryCode === c.countryCode) != null;

            this.acountries.push(new UICountry(c, displayed));
        });

        this.selCountries = {};
        displayedCountries.forEach(c => this.selCountries[c.countryCode] = null);

        this.acountries.sort((c1, c2) => c1.displayName < c2.displayName ? -1 : (c1.displayName > c2.displayName ? 1 : 0));
    }

    protected get selectedCountries(): string[] {
        return this.selCountries ? Object.keys(this.selCountries) : null;
    }

    get allCountries(): UICountry[] {
        return this.acountries;
    }

    onChargersByCountryCountriesChange(value: string, selected: boolean): void {

        if (selected) {
            this.selCountries[value] = null;
        } else {
            delete this.selCountries[value];
        }

        console.log('## selected ' + value + '/' + selected + '/' + JSON.stringify(this.selectedCountries));

        this.updateGraph();
    }

}
