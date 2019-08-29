import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { DynamicGraphService } from './dynamic-graph.service';
import { CountryChartJSData, CommonByCountryAndYearParams } from './common.model';

import { BaseByCountryAndYearServiceHelper, JSONCountryBase } from './base-by-country-and-year.service-helper';

declare var findDeployUrl: () => string;

@Injectable({
  providedIn: 'root'
})
export class CapacityByCountryAndYearService implements DynamicGraphService<CapacityByCountryAndYearParams, CountryChartJSData> {

  constructor(private http: HttpClient) {

  }

  getGraphData(params: CapacityByCountryAndYearParams): Observable<CountryChartJSData> {
    const result: Subject<CountryChartJSData> = new Subject<CountryChartJSData>();

    this.http.get<any>(findDeployUrl() + '/rest/statistics/capacityByYear').subscribe(data => {

      const chartJS: CountryChartJSData = BaseByCountryAndYearServiceHelper.getChartData<JSONCountryBase>(
        data.countries,
        params,
        [],
        0,
        country => Object.keys(country.valueByYear),
        (country, value) => value
      );

      result.next(chartJS);
    });

    return result;
  }
}

export class CapacityByCountryAndYearParams extends CommonByCountryAndYearParams {

  constructor(
    c: string[],
    maxC: number // Max to return unless list of countries is specified
  ) {
    super(c, maxC);
  }
}
