import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';

import { ChartJSData } from './chart-data';
import { ChargersByCountryAndYearService, ChargersByCountryAndYearParams } from './chargers-by-country-and-year.service';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class DynamicGraphService<PARAMS>  {

  private chargersByContryAndYearService: ChargersByCountryAndYearService;

  constructor(http: HttpClient) {
    this.chargersByContryAndYearService = new ChargersByCountryAndYearService(http);
  }

  public getGraphData(graphId: string, params: PARAMS): Observable<ChartJSData> {

    let result: Observable<ChartJSData>;

    switch (graphId) {
      case 'chargersByCountryAndYear':
        result = this.chargersByContryAndYearService.getGraphData((params as any) as ChargersByCountryAndYearParams);
        break;


      default:
        throw new Error('Unknown graphId ' + graphId);
    }

    return result;
  }
}

