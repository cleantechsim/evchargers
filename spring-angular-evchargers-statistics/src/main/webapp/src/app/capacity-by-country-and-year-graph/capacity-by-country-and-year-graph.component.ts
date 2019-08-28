import { Component, AfterViewInit, ViewChild } from '@angular/core';

import { CapacityByCountryAndYearService, CapacityByCountryAndYearParams } from '../capacity-by-country-and-year.service';
import { BaseByCountryAndYearGraphComponent } from '../base-by-country-and-year-graph.component';
import { DynamicGraphComponent } from '../dynamic-graph/dynamic-graph.component';
import { CountryChartJSData } from '../common.model';

@Component({
  selector: 'app-capacity-by-country-and-year-graph',
  templateUrl: './capacity-by-country-and-year-graph.component.html',
  styleUrls: ['./capacity-by-country-and-year-graph.component.css']
})
export class CapacityByCountryAndYearGraphComponent extends BaseByCountryAndYearGraphComponent implements AfterViewInit {

  @ViewChild('capacityByCountryAndYear', null)
  private capacityByCountryAndYear: DynamicGraphComponent<CapacityByCountryAndYearParams, CountryChartJSData>;

  constructor(private capacityByCountryAndYearService: CapacityByCountryAndYearService) {
    super();
  }

  ngAfterViewInit(): void {

    const params: CapacityByCountryAndYearParams = new CapacityByCountryAndYearParams(
      null,
      BaseByCountryAndYearGraphComponent.MAX_COUNTRIES);

    this.capacityByCountryAndYear.init(params, this.capacityByCountryAndYearService)
      .subscribe(result => {
        this.updateCountriesAndEmitChanged(result.displayedCountries, result.allCountries);
      });
  }

  protected updateGraph(countries: string[], ): void {
    const params: CapacityByCountryAndYearParams = new CapacityByCountryAndYearParams(
      countries,
      BaseByCountryAndYearGraphComponent.MAX_COUNTRIES);

    this.capacityByCountryAndYear.update(params, this.capacityByCountryAndYearService)
      .subscribe(result => this.updateCountriesAndEmitChanged(result.displayedCountries, result.allCountries));
  }
}
