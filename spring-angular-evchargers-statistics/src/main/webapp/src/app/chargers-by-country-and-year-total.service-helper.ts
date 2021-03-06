
import { ChargersByCountryAndYearParams } from './chargers-by-country-and-year.service';
import { ChartJSDataset } from './chart.model';
import { CountryChartJSData } from './common.model';
import { Color } from './color.util';
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
            1,
            country => globalTotal.years,
            (country, value, sum) => sum);
    }

    private static getJSDataSetSortedByYear(label: string, numberByYear: object): YearsAndDataSet {

        const years: string[] = Object.keys(numberByYear);

        years.sort();

        const datasetArray: number[] = [];

        let sum = 0;

        for (const year of years) {

            sum += numberByYear[year];

            datasetArray.push(sum);
        }

        const dataset: ChartJSDataset = new ChartJSDataset(
            label,
            Color.GREY,
            datasetArray);

        return new YearsAndDataSet(years, dataset);
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

