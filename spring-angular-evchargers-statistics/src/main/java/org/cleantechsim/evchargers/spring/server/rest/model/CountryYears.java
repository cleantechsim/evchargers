package org.cleantechsim.evchargers.spring.server.rest.model;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

public abstract class CountryYears {

	private final String countryDisplayName;
	private final Map<Integer, Integer> valueByYear;

	public CountryYears(String countryDisplayName, Map<Integer, Integer> valueByYear) {
		this.countryDisplayName = countryDisplayName;
		this.valueByYear = Collections.unmodifiableMap(new HashMap<>(valueByYear));
	}

	public final String getCountryDisplayName() {
		return countryDisplayName;
	}

	public final Map<Integer, Integer> getValueByYear() {
		return valueByYear;
	}
}
