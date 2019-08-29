package org.cleantechsim.evchargers.spring.server.rest.model;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

public abstract class CountryYears {

	private final String countryDisplayName;
	private final int numberOfChargers;
	private final Map<Integer, Integer> valueByYear;

	public CountryYears(String countryDisplayName, int numberOfChargers, Map<Integer, Integer> valueByYear) {
		this.countryDisplayName = countryDisplayName;
		this.numberOfChargers = numberOfChargers;
		this.valueByYear = Collections.unmodifiableMap(new HashMap<>(valueByYear));
	}

	public final String getCountryDisplayName() {
		return countryDisplayName;
	}

	public final int getNumberOfChargers() {
		return numberOfChargers;
	}

	public final Map<Integer, Integer> getValueByYear() {
		return valueByYear;
	}
}
