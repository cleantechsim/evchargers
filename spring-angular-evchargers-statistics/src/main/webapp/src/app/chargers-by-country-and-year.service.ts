import { Injectable } from '@angular/core';
import { ChartJSData, ChartJSDataset } from './chart-data';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { ChargersByCountryAndYearRoadServiceHelper } from './chargers-by-country-and-year-road.service-helper';
import { ChargersByCountryAndYearInhabitantsServiceHelper } from './chargers-by-country-and-year-inhabitants.service-helper';
import { ChargersByCountryAndYearTotalServiceHelper } from './chargers-by-country-and-year-total.service-helper';

export enum ChargersByCountryAndYearPresentation {
  TOTAL_NUMBER_OF_CHARGERS,
  PER_THOUSAND_INHABITANTS,
  PER_THOUSAND_KM_OF_ROAD
}

@Injectable({
  providedIn: 'root'
})
export class ChargersByCountryAndYearService {

  constructor(private http: HttpClient) {

  }

  public getGraphData(params: ChargersByCountryAndYearParams): Observable<ChartJSData> {

    const result: Subject<ChartJSData> = new Subject<ChartJSData>();

    this.http.post<any>('/rest/statistics/chargersByYear', params).subscribe(data => {

      let chartJS: ChartJSData;

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

export class ChargersByCountryAndYearParams {

  contructor() {

  }

  constructor(
    private pres: ChargersByCountryAndYearPresentation,
    private maxC: number,
    private minCP: number,
    private maxCP: number) {
  }

  public get presentation(): ChargersByCountryAndYearPresentation {
    return this.pres;
  }

  public get maxCountriesToReturn(): number {
    return this.maxC;
  }

  public get minChargePower(): number {
    return this.minCP;
  }

  public get maxChargePower(): number {
    return this.maxCP;
  }
}
