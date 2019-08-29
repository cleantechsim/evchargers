import { Component, ViewChild, AfterViewInit } from '@angular/core';
import {
  ChargersByCountryAndYearGraphComponent,
  PresentationToText
} from './chargers-by-country-and-year-graph/chargers-by-country-and-year-graph.component';
import { CountrySelectionComponent } from './country-selection/country-selection.component';
import { ServerCountries } from './base-by-country-and-year-graph.component';
import { CapacityByCountryAndYearGraphComponent } from './capacity-by-country-and-year-graph/capacity-by-country-and-year-graph.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit {

  @ViewChild('chargersByCountryAndYearGraph', null)
  private chargersByCountryAndYearGraphComponent: ChargersByCountryAndYearGraphComponent;

  @ViewChild('capacityByCountryAndYearGraph', null)
  private capacityByCountryAndYearGraphComponent: CapacityByCountryAndYearGraphComponent;

  constructor() {

  }

  ngAfterViewInit(): void {
    this.chargersByCountryAndYearGraphComponent.init(this.defaultMinimumChargers);
    this.capacityByCountryAndYearGraphComponent.init(this.defaultMinimumChargers);
  }

  get defaultMinimumChargers(): number {
    return 500;
  }

  get presentations(): PresentationToText[] {
    return this.chargersByCountryAndYearGraphComponent.presentations;
  }

  get chargersHeader() {
    return 'Showing ' + this.chargersByCountryAndYearGraphComponent.curPresentationToText.header;
  }

  get capacityHeader() {
    return 'Showing average power of chargers added each year';
  }

  onMinimumChargersUpdate(value: string): void {
    const integer: number = parseInt(value, 10);

    // Update graph data by triggering refresh
    this.chargersByCountryAndYearGraphComponent.updateMinimumChargers(integer);
    this.capacityByCountryAndYearGraphComponent.updateMinimumChargers(integer);
  }

  onChargersByCountryAndYearPresentationChange(value: string): void {
    this.chargersByCountryAndYearGraphComponent.onChargersByCountryAndYearPresentationChange(value);
  }
}
