package org.cleantechsim.evchargers.spring.server.rest.model;

import java.util.Map;

public final class CountryCapacityYears extends CountryYears {

	public CountryCapacityYears(String countryDisplayName, int numberOfChargers, Map<Integer, Integer> valueByYear) {
		super(countryDisplayName, numberOfChargers, valueByYear);
	}
}
