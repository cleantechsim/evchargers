
import { ChargersByCountryAndYearServiceHelper, JSONCountryChargerYears } from './chargers-by-country-and-year.service-helper';

import { ChargersByCountryAndYearParams } from './chargers-by-country-and-year.service';
import { CountryChartJSData } from './common.model';

export class ChargersByCountryAndYearInhabitantsServiceHelper extends ChargersByCountryAndYearServiceHelper {

    static getPerInhabitants(params: ChargersByCountryAndYearParams, data: any): CountryChartJSData {

        return this.getChartData<JSONCountryChargerYears>(
            data.countries,
            params,
            [],
            0,
            country => Object.keys(country.valueByYear),
            (country, numberOfChargers, sum) => {

                let result: number;

                if (sum && country.population) {
                    result = sum / (country.population / 1000);
                } else {
                    result = 0;
                }

                return result;
            });
    }
}
