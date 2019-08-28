import { ChartJSDataset } from './chart.model';
import { CountryChartJSData, Country, CountryWithValue, CommonByCountryAndYearParams } from './common.model';

export class JSONCountryBase {
    countryDisplayName: string;
    valueByYear: object;
}


export class CountryAndCount {
    constructor(public country: string, public count: number) {
    }
}

export class BaseByCountryAndYearServiceHelper {

    private static getMaxValueByCountry<COUNTRY_JSON extends JSONCountryBase>(
        jsonCountries: object,
        makeDataPoint: (country: COUNTRY_JSON, value: number, sum: number) => number): object {

        // Get maximum per country
        const maxValueByCountry = {};
        this.forEachCountryYear<object, COUNTRY_JSON, COUNTRY_JSON>(
            jsonCountries,
            null,
            country => Object.keys(country.valueByYear),
            (allData, countryCode, country) => { maxValueByCountry[countryCode] = 0; return country; },
            (country, countryCode, year, numberOfChargers, sumNumberOfChargers) => {

                const chargers = makeDataPoint(country, numberOfChargers, sumNumberOfChargers);

                if (maxValueByCountry[countryCode] < chargers) {
                    maxValueByCountry[countryCode] = chargers;
                }
            });

        return maxValueByCountry;
    }

    // Iterate over countries and years in JSON input
    private static forEachCountryYear<ALL_DATA, COUNTRY_DATA, COUNTRY_JSON extends JSONCountryBase>(
        countries: any,
        allData: ALL_DATA,
        yearsFn: (country: COUNTRY_JSON) => string[],
        countryFn: (allData: ALL_DATA, countryCode: string, country: COUNTRY_JSON) => COUNTRY_DATA,
        yearFn: (countryData: COUNTRY_DATA, countryCode: string, year: string, value: number, sum: number) => void) {

        for (const countryCode of Object.keys(countries)) {

            let countryData: COUNTRY_DATA;

            const country: COUNTRY_JSON = countries[countryCode];

            if (countryFn) {
                countryData = countryFn(allData, countryCode, country);
            }

            const years: string[] = yearsFn(country);

            this.forEachYear(country, countryCode, years, countryData, yearFn);
        }
    }

    // Iterate over years in JSON input
    static forEachYear<DATA, COUNTRY_JSON extends JSONCountryBase>(
        country: COUNTRY_JSON,
        countryCode: string,
        years: string[],
        data: DATA,
        yearFn: (data: DATA, countryCode: string, year: string, value: number, sum: number) => void) {

        let sum = 0;

        for (const year of years) {

            const value: number = country.valueByYear[year];

            if (value) {
                sum += value;
            }

            if (yearFn) {
                yearFn(data, countryCode, year, value, sum);
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

    static getChartData<COUNTRY_JSON extends JSONCountryBase>(
        jsonCountries: any,
        params: CommonByCountryAndYearParams,
        datasets: ChartJSDataset[],
        yearsFn: (country: COUNTRY_JSON) => string[],
        makeDataPoint: (country: COUNTRY_JSON, value: number, sum: number) => number): CountryChartJSData {

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


    private static makeChartData<COUNTRY_JSON extends JSONCountryBase>(
        jsonCountries: any,
        countryAndCount: CountryAndCount[],
        params: CommonByCountryAndYearParams,
        datasets: ChartJSDataset[],
        yearsFn: (country: COUNTRY_JSON) => string[],
        makeDataPoint: (country: COUNTRY_JSON, value: number, sum: number) => number): CountryChartJSData {


        const countryCodes: object = {};

        for (const cac of countryAndCount) {
            countryCodes[cac.country] = cac.count;
        }


        // Now have countries sorted, make datasets for the countries with most chargers
        const displayedCountries: Country[] = [];

        // Countries to return graph data for, null if not returning any graph data
        const countriesToReturn: string[] = this.getCountriesToReturnGraphDataSetsFor(params, countryAndCount);

        // Find max value for all countries and all years for sorting selection list
        // independent of whether or not country is selected

        const allYears: string[] = this.getYearsFromCountriesSorted(
            jsonCountries,
            Object.keys(jsonCountries),
            yearsFn);

        const maxValueByCountry = this.getMaxValueByCountryForAllYears(jsonCountries, allYears, makeDataPoint);

        let chartYears: string[];

        if (countriesToReturn == null) {
            chartYears = allYears;
        } else {

            const yearsForDisplayedCountries: string[] = this.getYearsFromCountriesSorted(
                jsonCountries,
                countriesToReturn,
                yearsFn);

            chartYears = yearsForDisplayedCountries;

            // Get data for each country
            for (const countryCode of countriesToReturn) {

                const countryDataset: number[] = [];
                const country: COUNTRY_JSON = jsonCountries[countryCode];

                displayedCountries.push(new Country(countryCode, country.countryDisplayName));

                // Iterate over each year from total
                this.forEachYear(country, countryCode, yearsForDisplayedCountries, countryDataset,
                    (dataset, code, year, value, sum) => {
                        // If displayed, create dataset for graph

                        const yearDataPoint: number = makeDataPoint(country, value, sum);

                        dataset.push(yearDataPoint);
                    });


                // If displayed, create dataset for graph
                datasets.push(new ChartJSDataset(jsonCountries[countryCode].countryDisplayName, countryDataset));
            }
        }

        // List of all countries, for selection
        const allCountries: CountryWithValue[] = Object.values(maxValueByCountry);

        // Sort by max
        const comparator: (country: CountryWithValue, other: CountryWithValue) => number
            = (country, other) => (country.value < other.value ? - 1 : (country.value > other.value ? 1 : 0));

        allCountries.sort((country, other) => - comparator(country, other));

        return new CountryChartJSData(chartYears, datasets, displayedCountries, allCountries);
    }

    private static getCountriesToReturnGraphDataSetsFor(
        params: CommonByCountryAndYearParams,
        countryAndCount: CountryAndCount[]): string[] {

        let countriesToReturn: string[];

        // Has user selected countries?
        if (params.countriesToReturn != null) {
            if (params.countriesToReturn.length === 0) {
                // User selected countries but all deselected, set to null for check later in function
                countriesToReturn = null;
            } else {
                countriesToReturn = params.countriesToReturn;
            }
        } else {
            const numCountries = params && params.maxCountriesToReturn
                ? Math.min(countryAndCount.length, params.maxCountriesToReturn)
                : countryAndCount.length;

            countriesToReturn = [];

            // Get countries to display in graph based on max
            for (let i = 0; i < numCountries; ++i) {
                if (countryAndCount[i].count === 0) {
                    break;
                }

                countriesToReturn.push(countryAndCount[i].country);
            }
        }

        return countriesToReturn;
    }

    private static getMaxValueByCountryForAllYears<COUNTRY_JSON extends JSONCountryBase>(
        jsonCountries: any,
        allYears: string[],
        makeDataPoint: (country: COUNTRY_JSON, value: number, sum: number) => number): object {

        const maxValueByCountry = {};

        for (const countryCode of Object.keys(jsonCountries)) {

            const country: COUNTRY_JSON = jsonCountries[countryCode];

            this.forEachYear(country, countryCode, allYears, null,
                (param, code, year, value, sum) => {
                    const yearDataPoint = makeDataPoint(country, value, sum);

                    if (yearDataPoint != null) {
                        const alreadyAdded: CountryWithValue = maxValueByCountry[countryCode];

                        if (alreadyAdded == null || alreadyAdded.value < yearDataPoint) {
                            maxValueByCountry[countryCode] = new CountryWithValue(
                                countryCode,
                                country.countryDisplayName,
                                yearDataPoint);
                        }
                    }
                });
        }

        return maxValueByCountry;
    }

    private static getYearsFromCountriesSorted<COUNTRY_JSON>(
        jsonCountries: any,
        countryCodes: string[],
        yearsFn: (country: COUNTRY_JSON) => string[]): string[] {

        const allYearsMap: object = {};

        // Figure all years involved over all countries from above
        for (const countryCode of countryCodes) {

            const country: COUNTRY_JSON = jsonCountries[countryCode];
            const years: string[] = yearsFn(country);

            years.forEach(year => allYearsMap[year] = null);
        }

        const allYears: string[] = Object.keys(allYearsMap);
        allYears.sort();

        return allYears;
    }
}


