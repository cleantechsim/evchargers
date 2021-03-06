import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { ChargersByCountryAndYearRoadServiceHelper } from './chargers-by-country-and-year-road.service-helper';
import { ChargersByCountryAndYearInhabitantsServiceHelper } from './chargers-by-country-and-year-inhabitants.service-helper';
import { ChargersByCountryAndYearTotalServiceHelper } from './chargers-by-country-and-year-total.service-helper';
import { DynamicGraphService } from './dynamic-graph.service';
import { CountryChartJSData, CommonByCountryAndYearParams } from './common.model';

export enum ChargersByCountryAndYearPresentation {
  TOTAL_NUMBER_OF_CHARGERS,
  PER_THOUSAND_INHABITANTS,
  PER_THOUSAND_KM_OF_ROAD
}

declare var findDeployUrl: () => string;

@Injectable({
  providedIn: 'root'
})
export class ChargersByCountryAndYearService
  implements DynamicGraphService<ChargersByCountryAndYearParams, CountryChartJSData> {

  constructor(private http: HttpClient) {

  }

  public getGraphData(params: ChargersByCountryAndYearParams): Observable<CountryChartJSData> {

    const result: Subject<CountryChartJSData> = new Subject<CountryChartJSData>();

    this.http.post<any>(findDeployUrl() + '/rest/statistics/chargersByYear', params).subscribe(data => {

      let chartJS: CountryChartJSData;

      switch (params.presentation) {
        case ChargersByCountryAndYearPresentation.PER_THOUSAND_KM_OF_ROAD:
          chartJS = ChargersByCountryAndYearRoadServiceHelper.getPerRoad(params, data);
          break;

        case ChargersByCountryAndYearPresentation.PER_THOUSAND_INHABITANTS:
          chartJS = ChargersByCountryAndYearInhabitantsServiceHelper.getPerInhabitants(params, data);
          break;

        case ChargersByCountryAndYearPresentation.TOTAL_NUMBER_OF_CHARGERS:
          chartJS = ChargersByCountryAndYearTotalServiceHelper.getTotal(params, data);
          break;

        default:
          throw new Error('Unknown presentation ' + params.presentation);
      }

      result.next(chartJS);
    });

    return result;
  }
}

export class ChargersByCountryAndYearParams extends CommonByCountryAndYearParams {

  contructor() {

  }

  constructor(
    private pres: ChargersByCountryAndYearPresentation,
    c: string[],
    minNumChargers: number,
    maxC: number, // Max to return unless list of countries is specified
    private minCP: number,
    private maxCP: number) {

    super(c, minNumChargers, maxC);
  }

  public get presentation(): ChargersByCountryAndYearPresentation {
    return this.pres;
  }

  public get minChargePower(): number {
    return this.minCP;
  }

  public get maxChargePower(): number {
    return this.maxCP;
  }
}
