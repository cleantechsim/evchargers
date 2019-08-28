import { Component, AfterViewInit, ViewChild } from '@angular/core';
import {
  ChargersByCountryAndYearPresentation,
  ChargersByCountryAndYearParams,
  ChargersByCountryAndYearService
} from '../chargers-by-country-and-year.service';
import { DynamicGraphComponent } from '../dynamic-graph/dynamic-graph.component';
import { CountryChartJSData } from '../common.model';
import { BaseByCountryAndYearGraphComponent } from '../base-by-country-and-year-graph.component';

import { Arrays } from '../arrays.util';

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

@Component({
  selector: 'app-chargers-by-country-and-year-graph',
  templateUrl: './chargers-by-country-and-year-graph.component.html',
  styleUrls: ['./chargers-by-country-and-year-graph.component.css']
})
export class ChargersByCountryAndYearGraphComponent extends BaseByCountryAndYearGraphComponent implements AfterViewInit {

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

    new PresentationToText(
      ChargersByCountryAndYearPresentation.TOTAL_NUMBER_OF_CHARGERS,
      'total',
      'Total number of chargers')
  ];

  @ViewChild('chargersByCountryAndYear', null)
  private chargersByCountryAndYear: DynamicGraphComponent<ChargersByCountryAndYearParams, CountryChartJSData>;

  private curPresentation: ChargersByCountryAndYearPresentation;

  constructor(private chargersByCountryAndYearService: ChargersByCountryAndYearService) {
    super();
  }

  private updatePresentation(value: ChargersByCountryAndYearPresentation) {
    this.curPresentation = value;
  }

  get defaultPresentation(): PresentationToText {
    return ChargersByCountryAndYearGraphComponent.PRESENTATIONS.find(text => {
      return text.presentation === ChargersByCountryAndYearGraphComponent.DEFAULT_PRESENTATION;
    });
  }

  ngAfterViewInit(): void {

    this.updatePresentation(ChargersByCountryAndYearGraphComponent.DEFAULT_PRESENTATION);

    const params: ChargersByCountryAndYearParams = new ChargersByCountryAndYearParams(
      this.curPresentation,
      null,
      BaseByCountryAndYearGraphComponent.MAX_COUNTRIES,
      null,
      null);

    this.chargersByCountryAndYear.init(params, this.chargersByCountryAndYearService)
      .subscribe(result => {
        this.updateCountriesAndEmitChanged(result.displayedCountries, result.allCountries);
      });
  }

  get presentations(): PresentationToText[] {
    return Arrays.copy(ChargersByCountryAndYearGraphComponent.PRESENTATIONS);
  }

  updateGraph(countries: string[]): void {
    this.updateGraphForPresentation(countries, this.curPresentation);
  }

  private updateGraphForPresentation(countries: string[], presentation: ChargersByCountryAndYearPresentation): void {
    const params: ChargersByCountryAndYearParams = new ChargersByCountryAndYearParams(
      presentation,
      countries,
      BaseByCountryAndYearGraphComponent.MAX_COUNTRIES,
      null,
      null);

    this.chargersByCountryAndYear.update(params, this.chargersByCountryAndYearService)
      .subscribe(result => this.updateCountriesAndEmitChanged(result.displayedCountries, result.allCountries));
  }

  onChargersByCountryAndYearPresentationChange(value: string): void {

    const presentationText: PresentationToText
      = ChargersByCountryAndYearGraphComponent.PRESENTATIONS.find(text => text.value === value);

    if (presentationText == null) {
      throw new Error('No presentation for ' + value);
    }

    const presentation: ChargersByCountryAndYearPresentation = presentationText.presentation;

    this.updatePresentation(presentation);
    this.updateGraphForPresentation(this.selectedCountries, presentation);
  }
}
