import { Component, ViewChild } from '@angular/core';
import {
  ChargersByCountryAndYearGraphComponent,
  PresentationToText
} from './chargers-by-country-and-year-graph/chargers-by-country-and-year-graph.component';
import { CountrySelectionComponent } from './country-selection/country-selection.component';
import { ServerCountries } from './base-by-country-and-year-graph.component';

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

  get presentations(): PresentationToText[] {
    return this.chargersByCountryAndYearGraphComponent.presentations;
  }

  get chargersHeader() {
    return 'Showing total number of chargers per year';
  }

  get capacityHeader() {
    return 'Showing average power of chargers added each year';
  }

  onChargersByCountryAndYearPresentationChange(value: string): void {
    this.chargersByCountryAndYearGraphComponent.onChargersByCountryAndYearPresentationChange(value);
  }
}
