package org.cleantechsim.evchargers.spring.server.dao;

import java.io.IOException;
import java.util.Map;
import java.util.function.Function;

import org.cleantechsim.evchargers.spring.server.rest.model.CountryCapacityYears;
import org.cleantechsim.evchargers.spring.server.rest.model.CountryChargerYears;

public interface EVChargerStatistics {

	/**
	 * Get number of chargers added per year for each country
	 * 
	 * @param getCountryPopulation function to get country population for adding to result object
	 * @param getCountryRoadNetworkSize function to get country road network size for adding to result object
	 * 
	 * @return map from country name to charger information
	 * 
	 * @throws IOException
	 */
	
	Map<String, CountryChargerYears> getChargersByYear(
			Function<String, Integer> getCountryPopulation,
			Function<String, Integer> getCountryRoadNetworkSize
			) throws IOException;

	/**
	 * Get average power in kw of connection for chargers added per year for each country
	 * 
	 * @param getCountryPopulation function to get country population for adding to result object
	 * @param getCountryRoadNetworkSize function to get country road network size for adding to result object
	 * 
	 * @return map from country name to charger information
	 * 
	 * @throws IOException
	 */
	
	Map<String, CountryCapacityYears> getAverageCapacityByYear(
			Function<String, Integer> getCountryPopulation,
			Function<String, Integer> getCountryRoadNetworkSize
			) throws IOException;
}
