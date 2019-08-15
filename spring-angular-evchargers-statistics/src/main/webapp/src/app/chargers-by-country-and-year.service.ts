import { Injectable } from '@angular/core';
import { ChartJSData, ChartJSDataset } from './chart-data';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';


class YearsAndDataSet {
  constructor(public years: string[], public dataset: ChartJSDataset) {
  }
}

class CountryAndCount {
  constructor(public country: string, public count: number) {
  }
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

      const totalByYear: object = this.getTotalByYear(data);
      const total: YearsAndDataSet = this.getJSDataSetSortedByYear('Total', totalByYear);

      const datasets: ChartJSDataset[] = [];

      datasets.push(total.dataset);

      const jsonCountries: any = data.countries;

      // Individual countries

      // Count the total number of charging stations for all years for all countries

      const countryAndCount: CountryAndCount[] = this.findCountPerCountrySortedDescending(jsonCountries, total.years);

      const numCountries = params && params.maxCountriesToReturn
        ? Math.min(countryAndCount.length, params.maxCountriesToReturn)
        : countryAndCount.length;

      // Now have countries sorted, make datasets for the countries with most chargers

      for (let i = 0; i < numCountries; ++i) {

        const countryDataset: number[] = [];

        const countryCode: string = countryAndCount[i].country;

        // Iterate over each yer from total
        this.forEachYear(jsonCountries, total.years, countryCode, countryDataset,
          (dataset, country, year, value) => {

            const countForYear: number = jsonCountries[country].countByYear[year];

            dataset.push(countForYear ? countForYear : null);
          });

        datasets.push(new ChartJSDataset(jsonCountries[countryCode].countryDisplayName, countryDataset));
      }

      const chartJS: ChartJSData = new ChartJSData(total.years, datasets);

      result.next(chartJS);
    });

    return result;
  }

  private findCountPerCountrySortedDescending(jsonCountries: any, years: string[]): CountryAndCount[] {
    const counterByCountry = {};

    // Iterate over countries and years, adding sum to hash
    this.forEachCountryYear(
      jsonCountries,
      years,
      counterByCountry,
      (c, country) => { c[country] = 0; return c; },
      (c, country, year, value) => c[country] += value);

    // Now have the count for each country, need to sort these
    const countryAndCount: CountryAndCount[] = [];
    const countries: string[] = Object.keys(counterByCountry);

    for (const country of countries) {
      countryAndCount.push(new CountryAndCount(country, counterByCountry[country]));
    }

    const ascendingComparator: (c1: CountryAndCount, c2: CountryAndCount) => number
      = (c1, c2) => c1.count < c2.count ? -1 : (c1.count > c2.count ? 1 : 0);

    countryAndCount.sort((c1, c2) => - ascendingComparator(c1, c2));

    return countryAndCount;
  }

  // Iterate over countries and years in JSON input
  private forEachCountryYear<ALL_DATA, COUNTRY_DATA>(
    countries: any,
    years: string[],
    allData: ALL_DATA,
    countryFn: (allData: ALL_DATA, countryCode: string) => COUNTRY_DATA,
    yearFn: (countryData: COUNTRY_DATA, countryCode: string, year: string, value: number) => void) {

    for (const countryCode of Object.keys(countries)) {

      let countryData: COUNTRY_DATA;

      if (countryFn) {
        countryData = countryFn(allData, countryCode);
      }

      this.forEachYear(countries, years, countryCode, countryData, yearFn);
    }
  }

  // Iterate over years in JSON input
  private forEachYear<DATA>(
    countries: any,
    years: string[],
    countryCode: string,
    data: DATA,
    yearFn: (data: DATA, countryCode: string, year: string, value: number) => void) {

    const countryYears = countries[countryCode];

    for (const year of years) {

      const value: number = countryYears.countByYear[year];

      if (yearFn) {
        yearFn(data, countryCode, year, value);
      }
    }
  }

  private getJSDataSetSortedByYear(label: string, numberByYear: object): YearsAndDataSet {

    const years: string[] = Object.keys(numberByYear);

    years.sort();

    const datasetArray: number[] = [];

    for (const year of years) {
      datasetArray.push(numberByYear[year]);
    }

    return new YearsAndDataSet(years, new ChartJSDataset(label, datasetArray));
  }

  private getTotalByYear(data: any): object {

    const totalByYear = {};

    for (const countryCode of Object.keys(data.countries)) {

      const countryYears = data.countries[countryCode];

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

  constructor(private maxC, private minCP: number, private maxCP: number) {

  }

  public get maxCountriesToReturn() {
    return this.maxC;
  }

  public get minChargePower(): number {
    return this.minCP;
  }

  public get maxChargePower(): number {
    return this.maxCP;
  }
}
