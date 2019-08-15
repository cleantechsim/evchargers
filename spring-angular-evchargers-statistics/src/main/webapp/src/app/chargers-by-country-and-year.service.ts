import { Injectable } from '@angular/core';
import { ChartJSData, ChartJSDataset } from './chart-data';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChargersByCountryAndYearService {

  constructor(private http: HttpClient) {

  }

  public getGraphData(params: ChargersByCountryAndYearParams): Observable<ChartJSData> {

    const result: Subject<ChartJSData> = new Subject<ChartJSData>();

    this.http.post<object>('/rest/statistics/chargersByYear', params).subscribe(data => {

      const totalByYear: object = this.getTotalByYear(data);
      const years: string[] = Object.keys(totalByYear);

      years.sort();

      const datasetArray: number[] = [];

      for (const year of years) {
        datasetArray.push(totalByYear[year]);
      }

      const dataset: ChartJSDataset = new ChartJSDataset('Total', datasetArray);
      const chartJS: ChartJSData = new ChartJSData(years, [dataset]);

      result.next(chartJS);
    });

    return result;
  }

  private getTotalByYear(data: any): object {

    const totalByYear = {};

    for (const countryCode of Object.keys(data.countries)) {

      const countryYears = data.countries[countryCode];
      const countryDisplayName = countryYears.countryDisplayName;

      for (const year of Object.keys(countryYears.countByYear)) {

        const count: number = countryYears.countByYear[year];

        if (totalByYear[year]) {
          totalByYear[year] += count;
        } else {
          totalByYear[year] = count;
        }
      }
    }

    return totalByYear;
  }
}

export class ChargersByCountryAndYearParams {

  contructor() {

  }

  constructor(private minCP: number, private maxCP: number) {

  }

  public get minChargePower(): number {
    return this.minCP;
  }

  public get maxChargePower(): number {
    return this.maxCP;
  }
}
