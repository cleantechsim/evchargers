import { Component, AfterViewInit, ViewChild } from '@angular/core';

import { CapacityByCountryAndYearService, CapacityByCountryAndYearParams } from '../capacity-by-country-and-year.service';
import { BaseByCountryAndYearGraphComponent } from '../base-by-country-and-year-graph.component';
import { DynamicGraphComponent } from '../dynamic-graph/dynamic-graph.component';
import { CountryChartJSData, UpdateMinimumChargers } from '../common.model';

@Component({
  selector: 'app-capacity-by-country-and-year-graph',
  templateUrl: './capacity-by-country-and-year-graph.component.html',
  styleUrls: ['./capacity-by-country-and-year-graph.component.css']
})
export class CapacityByCountryAndYearGraphComponent extends BaseByCountryAndYearGraphComponent implements UpdateMinimumChargers {

  @ViewChild('capacityByCountryAndYear', null)
  private capacityByCountryAndYear: DynamicGraphComponent<CapacityByCountryAndYearParams, CountryChartJSData>;

  private curMinimumNumberOfChargers: number;

  constructor(private capacityByCountryAndYearService: CapacityByCountryAndYearService) {
    super();
  }

  init(minimumNumberOfChargers: number): void {

    this.curMinimumNumberOfChargers = minimumNumberOfChargers;

    const params: CapacityByCountryAndYearParams = new CapacityByCountryAndYearParams(
      null,
      minimumNumberOfChargers,
      BaseByCountryAndYearGraphComponent.MAX_COUNTRIES);

    this.capacityByCountryAndYear.init(params, this.capacityByCountryAndYearService)
      .subscribe(result => {
        this.updateCountriesAndEmitChanged(result.displayedCountries, result.allCountries);
      });
  }

  updateMinimumChargers(value: number): void {
    this.curMinimumNumberOfChargers = value;

    this.updateGraph(this.selectedCountries);
  }

  protected updateGraph(countries: string[]): void {
    const params: CapacityByCountryAndYearParams = new CapacityByCountryAndYearParams(
      countries,
      this.curMinimumNumberOfChargers,
      BaseByCountryAndYearGraphComponent.MAX_COUNTRIES);

    this.capacityByCountryAndYear.update(params, this.capacityByCountryAndYearService)
      .subscribe(result => this.updateCountriesAndEmitChanged(result.displayedCountries, result.allCountries));
  }
}
