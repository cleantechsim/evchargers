package org.cleantechsim.evchargers.spring.server.rest.model;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

public final class CountryChargerYears {

	private final String countryDisplayName;
	private final Map<Integer, Integer> countByYear;

	public CountryChargerYears(String countryDisplayName, Map<Integer, Integer> countByYear) {
		this.countryDisplayName = countryDisplayName;
		this.countByYear = Collections.unmodifiableMap(new HashMap<>(countByYear));
	}

	public String getCountryDisplayName() {
		return countryDisplayName;
	}

	public Map<Integer, Integer> getCountByYear() {
		return countByYear;
	}
}
