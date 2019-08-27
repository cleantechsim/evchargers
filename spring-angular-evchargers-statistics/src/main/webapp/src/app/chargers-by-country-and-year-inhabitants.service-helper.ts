
import { ChargersByCountryAndYearServiceHelper, JSONCountryChargerYears } from './chargers-by-country-and-year.service-helper';

import { ChargersByCountryAndYearParams } from './chargers-by-country-and-year.service';
import { CountryChartJSData } from './common.model';

export class ChargersByCountryAndYearInhabitantsServiceHelper extends ChargersByCountryAndYearServiceHelper {

    static getPerInhabitants(params: ChargersByCountryAndYearParams, data: any): CountryChartJSData {

        return this.getChartData<JSONCountryChargerYears>(
            data.countries,
            params,
            [],
            country => Object.keys(country.valueByYear),
            (country, numberOfChargers) => {

                let result: number;

                if (numberOfChargers && country.population) {
                    result = numberOfChargers / (country.population / 1000);
                } else {
                    result = 0;
                }

                return result;
            });
    }
}
