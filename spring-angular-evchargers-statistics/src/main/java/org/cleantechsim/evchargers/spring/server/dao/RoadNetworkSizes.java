package org.cleantechsim.evchargers.spring.server.dao;

import java.util.Map;
import java.util.Optional;

public interface RoadNetworkSizes {

	/**
	 * Return road network size in km
	 * 
	 * @param countryName country name in English (not country code since only name on web page downloaded from)
	 * @return
	 */
	Optional<Integer> getRoadNetworkSize(String countryName);

	/**
	 * Return all network sizes
	 * 
	 * @return map from country name to network size in km
	 */
	Map<String, Integer> getAll();

}
