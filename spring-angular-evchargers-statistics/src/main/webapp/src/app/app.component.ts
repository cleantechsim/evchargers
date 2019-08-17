import { Component, ViewChild, AfterViewInit } from '@angular/core';

import {
  ChargersByCountryAndYearParams,
  ChargersByCountryAndYearPresentation,
  ChargersByCountryAndYearService
} from './chargers-by-country-and-year.service';

import { DynamicGraphComponent } from './dynamic-graph/dynamic-graph.component';
import { Country, CountryChartJSData } from './common.model';
import { Arrays } from './arrays.util';

export class PresentationToText {

  constructor(
    private pres: ChargersByCountryAndYearPresentation,
    private v: string,
    private t: string) {
  }

  get presentation(): ChargersByCountryAndYearPresentation {
    return this.pres;
  }

  get value(): string {
    return this.v;
  }

  get text(): string {
    return this.t;
  }
}

export class UICountry extends Country {

  constructor(country: Country, private disp: boolean) {
    super(country.countryCode, country.displayName);
  }

  get displayed(): boolean {
    return this.disp;
  }
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit {

  private static MAX_COUNTRIES = 1;
  private static DEFAULT_PRESENTATION: ChargersByCountryAndYearPresentation = ChargersByCountryAndYearPresentation.PER_THOUSAND_KM_OF_ROAD;

  private static PRESENTATIONS: PresentationToText[] = [
    new PresentationToText(
      ChargersByCountryAndYearPresentation.PER_THOUSAND_KM_OF_ROAD,
      'per_thousand_km_of_road',
      'Per 1000 km of road'),

    new PresentationToText(
      ChargersByCountryAndYearPresentation.PER_THOUSAND_INHABITANTS,
      'per_thousand_inhabitants',
      'Per 1000 inhabitants'),

    new PresentationToText(ChargersByCountryAndYearPresentation.TOTAL_NUMBER_OF_CHARGERS,
      'total',
      'Total number of chargers')
  ];

  @ViewChild('chargersByCountryAndYear', null)
  private chargersByCountryAndYear: DynamicGraphComponent<ChargersByCountryAndYearParams, CountryChartJSData>;

  private acountries: UICountry[];
  private selCountries: object;
  private curPresentation: ChargersByCountryAndYearPresentation;

  constructor(private chargersByCountryAndYearService: ChargersByCountryAndYearService) {
  }

  private updateCountries(displayedCountries: Country[], allCountries: Country[]): void {

    this.acountries = [];

    allCountries.forEach(c => {
      const displayed: boolean = displayedCountries.find(dc => dc.countryCode === c.countryCode) != null;

      this.acountries.push(new UICountry(c, displayed));
    });

    this.selCountries = {};
    displayedCountries.forEach(c => this.selCountries[c.countryCode] = null);

    this.acountries.sort((c1, c2) => c1.displayName < c2.displayName ? -1 : (c1.displayName > c2.displayName ? 1 : 0));
  }

  private get selectedCountries(): string[] {
    return this.selCountries ? Object.keys(this.selCountries) : null;
  }

  private updatePresentation(value: ChargersByCountryAndYearPresentation) {
    this.curPresentation = value;
  }

  ngAfterViewInit(): void {

    this.updatePresentation(AppComponent.DEFAULT_PRESENTATION);

    const params: ChargersByCountryAndYearParams = new ChargersByCountryAndYearParams(
      this.curPresentation,
      this.selectedCountries,
      AppComponent.MAX_COUNTRIES,
      null,
      null);

    this.chargersByCountryAndYear.init(params, this.chargersByCountryAndYearService)
      .subscribe(result => this.updateCountries(result.displayedCountries, result.allCountries));
  }

  get allCountries(): Country[] {
    return this.acountries;
  }

  get presentations(): PresentationToText[] {
    return Arrays.copy(AppComponent.PRESENTATIONS);
  }

  get defaultPresentation(): PresentationToText {
    return AppComponent.PRESENTATIONS.find(text => text.presentation === AppComponent.DEFAULT_PRESENTATION);
  }

  private updateGraph(presentation: ChargersByCountryAndYearPresentation): void {
    const params: ChargersByCountryAndYearParams = new ChargersByCountryAndYearParams(
      presentation,
      this.selectedCountries,
      AppComponent.MAX_COUNTRIES,
      null,
      null);

    this.chargersByCountryAndYear.update(params, this.chargersByCountryAndYearService)
      .subscribe(result => this.updateCountries(result.displayedCountries, result.allCountries));
  }

  onChargersByCountryAndYearPresentationChange(value: string): void {

    const presentationText: PresentationToText
      = AppComponent.PRESENTATIONS.find(text => text.value === value);

    if (presentationText == null) {
      throw new Error('No presentation for ' + value);
    }

    const presentation: ChargersByCountryAndYearPresentation = presentationText.presentation;

    this.updatePresentation(presentation);
    this.updateGraph(presentation);
  }

  onChargersByCountryCountriesChange(value: string, selected: boolean): void {

    if (selected) {
      this.selCountries[value] = null;
    } else {
      delete this.selCountries[value];
    }

    console.log('## selected ' + value + '/' + selected + '/' + JSON.stringify(this.selectedCountries));
    this.updateGraph(this.curPresentation);
  }
}
