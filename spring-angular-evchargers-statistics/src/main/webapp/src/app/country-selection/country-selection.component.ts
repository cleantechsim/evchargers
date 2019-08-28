
import { Component, Output, EventEmitter } from '@angular/core';

import { Country } from '../common.model';
import { Color } from '../color.util';

export class UICountry extends Country {

  constructor(country: Country, private disp: boolean) {
    super(country.countryCode, country.displayName);
  }

  get displayed(): boolean {
    return this.disp;
  }
}

@Component({
  selector: 'app-country-selection',
  templateUrl: './country-selection.component.html',
  styleUrls: ['./country-selection.component.css']
})
export class CountrySelectionComponent {

  private acountries: UICountry[];
  private selCountries: object;

  @Output() countriesChanged: EventEmitter<string[]> = new EventEmitter();

  constructor() {

  }

  public updateCountries(displayedCountries: Country[], allCountries: Country[]): void {

    this.acountries = [];

    allCountries.forEach(c => {
      const displayed: boolean = displayedCountries.find(dc => dc.countryCode === c.countryCode) != null;

      this.acountries.push(new UICountry(c, displayed));
    });

    this.selCountries = {};
    displayedCountries.forEach(c => this.selCountries[c.countryCode] = null);
  }

  private get selectedCountries(): string[] {
    return this.selCountries ? Object.keys(this.selCountries) : null;
  }

  get allCountries(): UICountry[] {
    return this.acountries;
  }

  get maximumSelection(): number {
    return Color.MAX_COLORS;
  }

  checkboxEnabled(value: string) {
    let enabled: boolean;

    if (Object.keys(this.selCountries).length < this.maximumSelection) {
      enabled = true;
    } else {
      if (this.selCountries.hasOwnProperty(value)) {
        // Already selected
        enabled = true;
      } else {
        enabled = false;
      }
    }

    return enabled;
  }

  onCountrySelectionChange(value: string, selected: boolean): void {

    if (selected) {
      this.selCountries[value] = null;
    } else {
      delete this.selCountries[value];
    }

    console.log('## selected ' + value + '/' + selected + '/' + JSON.stringify(this.selectedCountries));

    this.countriesChanged.emit(this.selectedCountries);
  }
}
