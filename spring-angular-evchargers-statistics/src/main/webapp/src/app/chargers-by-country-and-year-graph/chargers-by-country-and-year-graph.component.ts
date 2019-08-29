import { Component, AfterViewInit, ViewChild } from '@angular/core';
import {
  ChargersByCountryAndYearPresentation,
  ChargersByCountryAndYearParams,
  ChargersByCountryAndYearService
} from '../chargers-by-country-and-year.service';
import { DynamicGraphComponent } from '../dynamic-graph/dynamic-graph.component';
import { CountryChartJSData, UpdateMinimumChargers } from '../common.model';
import { BaseByCountryAndYearGraphComponent } from '../base-by-country-and-year-graph.component';

import { Arrays } from '../arrays.util';

export class PresentationToText {

  constructor(
    private pres: ChargersByCountryAndYearPresentation,
    private v: string,
    private t: string,
    private h: string) {
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

  get header(): string {
    return this.h;
  }
}

@Component({
  selector: 'app-chargers-by-country-and-year-graph',
  templateUrl: './chargers-by-country-and-year-graph.component.html',
  styleUrls: ['./chargers-by-country-and-year-graph.component.css']
})
export class ChargersByCountryAndYearGraphComponent extends BaseByCountryAndYearGraphComponent implements UpdateMinimumChargers {

  private static DEFAULT_PRESENTATION: ChargersByCountryAndYearPresentation
    = ChargersByCountryAndYearPresentation.PER_THOUSAND_KM_OF_ROAD;

  private static PRESENTATIONS: PresentationToText[] = [
    new PresentationToText(
      ChargersByCountryAndYearPresentation.PER_THOUSAND_KM_OF_ROAD,
      'per_thousand_km_of_road',
      'Per 1000 km of road',
      'chargers per 1000 km of road'),

    new PresentationToText(
      ChargersByCountryAndYearPresentation.PER_THOUSAND_INHABITANTS,
      'per_thousand_inhabitants',
      'Per 1000 inhabitants',
      'chargers per 1000 inhabitants'),

    new PresentationToText(
      ChargersByCountryAndYearPresentation.TOTAL_NUMBER_OF_CHARGERS,
      'total',
      'Total number of chargers',
      'total number of chargers')
  ];

  @ViewChild('chargersByCountryAndYear', null)
  private chargersByCountryAndYear: DynamicGraphComponent<ChargersByCountryAndYearParams, CountryChartJSData>;

  private curPresentation: ChargersByCountryAndYearPresentation;
  private curMinimumNumberOfChargers: number;

  private static getPresentationToText(presentation: ChargersByCountryAndYearPresentation): PresentationToText {
    return ChargersByCountryAndYearGraphComponent.PRESENTATIONS.find(text => text.presentation === presentation);
  }

  constructor(private chargersByCountryAndYearService: ChargersByCountryAndYearService) {
    super();

    this.curPresentation = this.defaultPresentation.presentation;
  }

  private updatePresentation(value: ChargersByCountryAndYearPresentation) {
    this.curPresentation = value;
  }

  get defaultPresentation(): PresentationToText {
    return ChargersByCountryAndYearGraphComponent.PRESENTATIONS.find(text => {
      return text.presentation === ChargersByCountryAndYearGraphComponent.DEFAULT_PRESENTATION;
    });
  }

  get curPresentationToText(): PresentationToText {
    return ChargersByCountryAndYearGraphComponent.getPresentationToText(this.curPresentation);
  }

  init(minimumNumberOfChargers: number): void {

    this.curMinimumNumberOfChargers = minimumNumberOfChargers;

    this.updatePresentation(ChargersByCountryAndYearGraphComponent.DEFAULT_PRESENTATION);

    const params: ChargersByCountryAndYearParams = new ChargersByCountryAndYearParams(
      this.curPresentation,
      null,
      minimumNumberOfChargers,
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
    this.updateGraphForPresentation(countries, this.curMinimumNumberOfChargers, this.curPresentation);
  }

  private updateGraphForPresentation(
    countries: string[],
    minimumNumberOfChargers: number,
    presentation: ChargersByCountryAndYearPresentation): void {

    const params: ChargersByCountryAndYearParams = new ChargersByCountryAndYearParams(
      presentation,
      countries,
      minimumNumberOfChargers,
      BaseByCountryAndYearGraphComponent.MAX_COUNTRIES,
      null,
      null);

    this.chargersByCountryAndYear.update(params, this.chargersByCountryAndYearService)
      .subscribe(result => this.updateCountriesAndEmitChanged(result.displayedCountries, result.allCountries));
  }

  updateMinimumChargers(value: number): void {
    this.curMinimumNumberOfChargers = value;

    this.updateGraphForPresentation(this.selectedCountries, value, this.curPresentation);
  }

  onChargersByCountryAndYearPresentationChange(value: string): void {

    const presentationText: PresentationToText
      = ChargersByCountryAndYearGraphComponent.PRESENTATIONS.find(text => text.value === value);

    if (presentationText == null) {
      throw new Error('No presentation for ' + value);
    }

    const presentation: ChargersByCountryAndYearPresentation = presentationText.presentation;

    this.updatePresentation(presentation);
    this.updateGraphForPresentation(this.selectedCountries, this.curMinimumNumberOfChargers, presentation);
  }
}
