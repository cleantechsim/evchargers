package org.cleantechsim.evchargers.spring.server.rest.model;

import java.util.Map;

public final class CountryChargerYears extends CountryYears {

	private final Integer population;
	private final Integer roadNetworkLength;

	public CountryChargerYears(
			String countryDisplayName,
			int numberOfChargers,
			Map<Integer, Integer> valueByYear,
			Integer population,
			Integer roadNetworkLength
			) {
		
		super(countryDisplayName, numberOfChargers, valueByYear);
		
		this.population = population;
		this.roadNetworkLength = roadNetworkLength;
	}

	public Integer getPopulation() {
		return population;
	}

	public Integer getRoadNetworkLength() {
		return roadNetworkLength;
	}
}
