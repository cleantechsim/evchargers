import { ChartJSData, ChartJSDataset } from './chart-data';
import { ChargersByCountryAndYearParams } from './chargers-by-country-and-year.service';

export class JSONCountryChargerYears {

    countryDisplayName: string;
    population: number;
    roadNetworkLength: number;
    countByYear: object;
}

export class CountryAndCount {
    constructor(public country: string, public count: number) {
    }
}

export class ChargersByCountryAndYearServiceHelper {

    private static getMaxValueByCountry(
        jsonCountries: object,
        makeDataPoint: (country: JSONCountryChargerYears, value: number) => number): object {

        // Get maximum per country
        const maxValueByCountry = {};
        this.forEachCountryYear(
            jsonCountries,
            null,
            country => Object.keys(country.countByYear),
            (allData, countryCode, country) => { maxValueByCountry[countryCode] = 0; return country; },
            (country, countryCode, year, numberOfChargers) => {

                const chargers = makeDataPoint(country, numberOfChargers);

                if (maxValueByCountry[countryCode] < chargers) {
                    maxValueByCountry[countryCode] = chargers;
                }
            });

        return maxValueByCountry;
    }

    // Iterate over countries and years in JSON input
    static forEachCountryYear<ALL_DATA, COUNTRY_DATA>(
        countries: any,
        allData: ALL_DATA,
        yearsFn: (country: JSONCountryChargerYears) => string[],
        countryFn: (allData: ALL_DATA, countryCode: string, country: JSONCountryChargerYears) => COUNTRY_DATA,
        yearFn: (countryData: COUNTRY_DATA, countryCode: string, year: string, value: number) => void) {

        for (const countryCode of Object.keys(countries)) {

            let countryData: COUNTRY_DATA;

            const country: JSONCountryChargerYears = countries[countryCode];

            if (countryFn) {
                countryData = countryFn(allData, countryCode, country);
            }

            const years: string[] = yearsFn(country);

            this.forEachYear(country, countryCode, years, countryData, yearFn);
        }
    }

    // Iterate over years in JSON input
    static forEachYear<DATA>(
        country: JSONCountryChargerYears,
        countryCode: string,
        years: string[],
        data: DATA,
        yearFn: (data: DATA, countryCode: string, year: string, value: number) => void) {

        for (const year of years) {

            const value: number = country.countByYear[year];

            if (yearFn) {
                yearFn(data, countryCode, year, value);
            }
        }
    }

    private static sortNumberByCountryDescending(map: object): CountryAndCount[] {

        // Now have the count for each country, need to sort these
        const countryAndCount: CountryAndCount[] = [];
        const countries: string[] = Object.keys(map);

        for (const country of countries) {
            countryAndCount.push(new CountryAndCount(country, map[country]));
        }

        const ascendingComparator: (c1: CountryAndCount, c2: CountryAndCount) => number
            = (c1, c2) => c1.count < c2.count ? -1 : (c1.count > c2.count ? 1 : 0);

        countryAndCount.sort((c1, c2) => - ascendingComparator(c1, c2));

        return countryAndCount;
    }

    static getChartData(
        jsonCountries: any,
        params: ChargersByCountryAndYearParams,
        datasets: ChartJSDataset[],
        yearsFn: (country: JSONCountryChargerYears) => string[],
        makeDataPoint: (country: JSONCountryChargerYears, value: number) => number): ChartJSData {

        const maxValueByCountry: object = this.getMaxValueByCountry(jsonCountries, makeDataPoint);

        // Sort data
        const sorted: CountryAndCount[] = this.sortNumberByCountryDescending(maxValueByCountry);

        return this.makeChartData(
            jsonCountries,
            sorted,
            params,
            datasets,
            yearsFn,
            makeDataPoint);
    }


    private static makeChartData(
        jsonCountries: any,
        countryAndCount: CountryAndCount[],
        params: ChargersByCountryAndYearParams,
        datasets: ChartJSDataset[],
        yearsFn: (country: JSONCountryChargerYears) => string[],
        makeDataPoint: (country: JSONCountryChargerYears, value: number) => number): ChartJSData {

        const numCountries = params && params.maxCountriesToReturn
            ? Math.min(countryAndCount.length, params.maxCountriesToReturn)
            : countryAndCount.length;

        // Now have countries sorted, make datasets for the countries with most chargers

        const allYearsMap: object = {};

        // Figure all years involved over all countries
        for (let i = 0; i < numCountries; ++i) {
            const countryCode: string = countryAndCount[i].country;
            const country: JSONCountryChargerYears = jsonCountries[countryCode];
            const years: string[] = yearsFn(country);

            years.forEach(year => allYearsMap[year] = null);
        }

        const allYears: string[] = Object.keys(allYearsMap);
        allYears.sort();

        // Get data for each country
        for (let i = 0; i < numCountries; ++i) {

            const countryDataset: number[] = [];

            const countryCode: string = countryAndCount[i].country;
            const country: JSONCountryChargerYears = jsonCountries[countryCode];
            const years: string[] = yearsFn(country);

            // Iterate over each yer from total
            this.forEachYear(country, countryCode, allYears, countryDataset,
                (dataset, code, year, value) => {

                    const countForYear: number = country.countByYear[year];

                    dataset.push(countForYear ? makeDataPoint(country, countForYear) : null);
                });

            datasets.push(new ChartJSDataset(jsonCountries[countryCode].countryDisplayName, countryDataset));
        }

        const chartJS: ChartJSData = new ChartJSData(allYears, datasets);

        return chartJS;
    }
}


