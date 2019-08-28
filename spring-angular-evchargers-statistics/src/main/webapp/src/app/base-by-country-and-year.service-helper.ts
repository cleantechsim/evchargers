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

        let countriesToReturn: string[];

        const countryCodes: object = {};

        for (const cac of countryAndCount) {
            countryCodes[cac.country] = cac.count;
        }

        if (params.countriesToReturn != null) {
            countriesToReturn = params.countriesToReturn;
        } else {
            const numCountries = params && params.maxCountriesToReturn
                ? Math.min(countryAndCount.length, params.maxCountriesToReturn)
                : countryAndCount.length;

            countriesToReturn = [];

            // Get countries to display in graph
            for (let i = 0; i < numCountries; ++i) {
                if (countryAndCount[i].count === 0) {
                    break;
                }

                countriesToReturn.push(countryAndCount[i].country);
            }
        }

        // Now have countries sorted, make datasets for the countries with most chargers

        const allYearsMap: object = {};

        const displayedCountries: Country[] = [];

        // Figure all years involved over all countries
        for (const countryCode of countriesToReturn) {
            const country: COUNTRY_JSON = jsonCountries[countryCode];
            const years: string[] = yearsFn(country);

            years.forEach(year => allYearsMap[year] = null);
        }

        const allYears: string[] = Object.keys(allYearsMap);
        allYears.sort();

        // Use max value for countries as sort criteria
        const maxValueByCountry = {};

        // Get data for each country
        for (const countryCode of Object.keys(countryCodes)) {

            const isDisplayedCountry: boolean = countriesToReturn.indexOf(countryCode) >= 0;

            const countryDataset: number[] = [];
            const country: COUNTRY_JSON = jsonCountries[countryCode];

            if (isDisplayedCountry) {
                displayedCountries.push(new Country(countryCode, country.countryDisplayName));
            }

            // Iterate over each year from total
            this.forEachYear(country, countryCode, allYears, countryDataset,
                (dataset, code, year, value, sum) => {

                    const countForYear: number = value;

                    const yearDataPoint = makeDataPoint(country, countForYear, sum);

                    if (yearDataPoint != null) {
                        const alreadyAdded: CountryWithValue = maxValueByCountry[countryCode];

                        if (alreadyAdded == null || alreadyAdded.value < yearDataPoint) {
                            maxValueByCountry[countryCode] = new CountryWithValue(
                                countryCode,
                                country.countryDisplayName,
                                yearDataPoint);
                        }
                    }

                    // If displayed, create dataset for graph
                    if (isDisplayedCountry) {
                        dataset.push(yearDataPoint);
                    }
                });


            // If displayed, create dataset for graph
            if (isDisplayedCountry) {
                datasets.push(new ChartJSDataset(jsonCountries[countryCode].countryDisplayName, countryDataset));
            }
        }

        // List of all countries, for selection
        const allCountries: CountryWithValue[] = Object.values(maxValueByCountry);

        // Sort by max
        const comparator: (country: CountryWithValue, other: CountryWithValue) => number
            = (country, other) => (country.value < other.value ? - 1 : (country.value > other.value ? 1 : 0));

        allCountries.sort((country, other) => - comparator(country, other));

        return new CountryChartJSData(allYears, datasets, displayedCountries, allCountries);
    }
}


