import { ChargersByCountryAndYearServiceHelper } from './chargers-by-country-and-year.service-helper';
import { ChargersByCountryAndYearParams } from './chargers-by-country-and-year.service';
import { ChartJSData } from './chart-data';

export class ChargersByCountryAndYearRoadServiceHelper extends ChargersByCountryAndYearServiceHelper {

    static getPerRoad(params: ChargersByCountryAndYearParams, data: any): ChartJSData {

        return this.getChartData(
            data.countries,
            params,
            [],
            country => Object.keys(country.countByYear),
            (country, numberOfChargers) => numberOfChargers / (country.roadNetworkLength / 1000));
    }
}
