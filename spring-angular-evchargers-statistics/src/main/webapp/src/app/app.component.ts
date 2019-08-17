import { Component, ViewChild } from '@angular/core';
import {
  ChargersByCountryAndYearGraphComponent,
  PresentationToText
} from './chargers-by-country-and-year-graph/chargers-by-country-and-year-graph.component';
import { UICountry } from './base-by-country-and-year-graph.component';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  @ViewChild('chargersByCountryAndYearGraph', null)
  private chargersByCountryAndYearGraphComponent: ChargersByCountryAndYearGraphComponent;

  constructor() {
  }

  get allCountries(): UICountry[] {
    return this.chargersByCountryAndYearGraphComponent.allCountries;
  }

  get presentations(): PresentationToText[] {
    return this.chargersByCountryAndYearGraphComponent.presentations;
  }

  onChargersByCountryAndYearPresentationChange(value: string): void {
    this.chargersByCountryAndYearGraphComponent.onChargersByCountryAndYearPresentationChange(value);
  }

  onChargersByCountryCountriesChange(value: string, selected: boolean): void {
    this.chargersByCountryAndYearGraphComponent.onChargersByCountryCountriesChange(value, selected);
  }
}
