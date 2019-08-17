import { ChargersByCountryAndYearServiceHelper, JSONCountryChargerYears } from './chargers-by-country-and-year.service-helper';
import { ChargersByCountryAndYearParams } from './chargers-by-country-and-year.service';
import { CountryChartJSData } from './common.model';

export class ChargersByCountryAndYearRoadServiceHelper extends ChargersByCountryAndYearServiceHelper {

    static getPerRoad(params: ChargersByCountryAndYearParams, data: any): CountryChartJSData {

        return this.getChartData<JSONCountryChargerYears>(
            data.countries,
            params,
            [],
            country => Object.keys(country.valueByYear),
            (country, numberOfChargers) => numberOfChargers / (country.roadNetworkLength / 1000));
    }
}
