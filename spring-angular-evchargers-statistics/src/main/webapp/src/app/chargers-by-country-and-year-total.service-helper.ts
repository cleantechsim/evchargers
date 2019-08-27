
import { ChargersByCountryAndYearParams } from './chargers-by-country-and-year.service';
import { ChartJSDataset } from './chart.model';
import { CountryChartJSData } from './common.model';
import { ChargersByCountryAndYearServiceHelper } from './chargers-by-country-and-year.service-helper';

class YearsAndDataSet {
    constructor(public years: string[], public dataset: ChartJSDataset) {
    }
}

export class ChargersByCountryAndYearTotalServiceHelper extends ChargersByCountryAndYearServiceHelper {

    static getTotal(params: ChargersByCountryAndYearParams, data: any): CountryChartJSData {

        const jsonCountries: any = data.countries;

        const globalTotalByYear: object = this.getTotalByYear(data);
        const globalTotal: YearsAndDataSet = this.getJSDataSetSortedByYear('Total', globalTotalByYear);

        const datasets: ChartJSDataset[] = [];

        datasets.push(globalTotal.dataset);

        return this.getChartData(
            jsonCountries,
            params,
            datasets,
            country => globalTotal.years,
            (country, value) => value);
    }

    private static getJSDataSetSortedByYear(label: string, numberByYear: object): YearsAndDataSet {

        const years: string[] = Object.keys(numberByYear);

        years.sort();

        const datasetArray: number[] = [];

        for (const year of years) {
            datasetArray.push(numberByYear[year]);
        }

        return new YearsAndDataSet(years, new ChartJSDataset(label, datasetArray));
    }

    private static getTotalByYear(data: any): object {

        const totalByYear = {};

        for (const countryCode of Object.keys(data.countries)) {

            const countryYears = data.countries[countryCode];

            for (const year of Object.keys(countryYears.valueByYear)) {

                const count: number = countryYears.valueByYear[year];

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

