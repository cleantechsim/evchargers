import { Output, EventEmitter } from '@angular/core';

import { Arrays } from './arrays.util';

import { Country } from './common.model';

export class ServerCountries {

    constructor(private dc: Country[], private ac: Country[]) {

    }

    get displayedCountries(): Country[] {
        return this.dc;
    }

    get allCountries(): Country[] {
        return this.ac;
    }
}

export abstract class BaseByCountryAndYearGraphComponent {

    static MAX_COUNTRIES = 1;

    private selCountries: string[];

    @Output() serverCountriesChanged: EventEmitter<ServerCountries> = new EventEmitter();

    protected abstract updateGraph(countries: string[]): void;

    protected get selectedCountries(): string[] {
        return this.selCountries;
    }

    protected updateCountries(displayedCountries: Country[], allCountries: Country[]): void {

        this.selCountries = [];

        displayedCountries.forEach(c => this.selCountries.push(c.countryCode));

        this.serverCountriesChanged.emit(new ServerCountries(displayedCountries, allCountries));
    }

    public onCountriesSelectionChange(countries: string[]): void {

        this.selCountries = Arrays.copy(countries);

        this.updateGraph(countries);
    }
}
