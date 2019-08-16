import { Component, ViewChild, AfterViewInit } from '@angular/core';

import {
  ChargersByCountryAndYearParams,
  ChargersByCountryAndYearPresentation,
  ChargersByCountryAndYearService
} from './chargers-by-country-and-year.service';

import { DynamicGraphComponent } from './dynamic-graph/dynamic-graph.component';
import { ChartJSData } from './chart-data';

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
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit {

  private static MAX_COUNTRIES = 10;
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
  private chargersByCountryAndYear: DynamicGraphComponent<ChargersByCountryAndYearParams, ChartJSData>;

  constructor(private chargersByCountryAndYearService: ChargersByCountryAndYearService) {

  }

  ngAfterViewInit(): void {

    const params: ChargersByCountryAndYearParams = new ChargersByCountryAndYearParams(
      AppComponent.DEFAULT_PRESENTATION,
      AppComponent.MAX_COUNTRIES,
      null,
      null);

    this.chargersByCountryAndYear.init(params, this.chargersByCountryAndYearService);
  }

  get presentations(): PresentationToText[] {
    const result: PresentationToText[] = [];

    AppComponent.PRESENTATIONS.forEach(presentation => result.push(presentation));

    return result;
  }

  get defaultPresentation(): PresentationToText {
    return AppComponent.PRESENTATIONS.find(text => text.presentation === AppComponent.DEFAULT_PRESENTATION);
  }

  onChargersByCountryAndYearChange(value: string): void {

    const presentationText: PresentationToText
      = AppComponent.PRESENTATIONS.find(text => text.value === value);


    if (presentationText == null) {
      throw new Error('No presentation for ' + value);
    }

    const params: ChargersByCountryAndYearParams = new ChargersByCountryAndYearParams(
      presentationText.presentation,
      AppComponent.MAX_COUNTRIES,
      null,
      null);

    this.chargersByCountryAndYear.update(params, this.chargersByCountryAndYearService);
  }
}
