package org.cleantechsim.evchargers.spring.server.dao;

import java.util.Map;
import java.util.Optional;

public interface PopulationSizes {

	/**
	 * Get population size in number of people for a country, given by country code and name
	 * @param countryName English name of country (not country code since only name on web page downloaded fro
	 * 
	 * @return Population size if known
	 */
	
	Optional<Integer> getPopulationSizes(String countryName);

	/**
	 * Return all population sizes
	 * 
	 * @return map from country name to population size
	 */
	Map<String, Integer> getAll();
}
