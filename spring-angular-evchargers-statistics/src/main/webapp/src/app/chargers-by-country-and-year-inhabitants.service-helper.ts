
import { ChargersByCountryAndYearServiceHelper } from './chargers-by-country-and-year.service-helper';
import { ChargersByCountryAndYearParams } from './chargers-by-country-and-year.service';
import { ChartJSData } from './chart-data';

export class ChargersByCountryAndYearInhabitantsServiceHelper extends ChargersByCountryAndYearServiceHelper {

    static getPerInhabitants(params: ChargersByCountryAndYearParams, data: any): ChartJSData {

        return this.getChartData(
            data.countries,
            params,
            [],
            country => Object.keys(country.countByYear),
            (country, numberOfChargers) => numberOfChargers / (country.population / 1000));
    }
}
