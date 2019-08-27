package org.cleantechsim.evchargers.spring.server.rest.model;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

public abstract class BaseByYearStatisticsResult<T extends CountryYears> extends ChargingStatisticsResult {

	// Map from country display name to map from year to number of entries
	private final Map<String, T> countries;

	public BaseByYearStatisticsResult(ChargingFilterOptions filterOptions, Map<String, T> countries) {
		super(filterOptions);

		this.countries = Collections.unmodifiableMap(new HashMap<>(countries));
	}

	public final Map<String, T> getCountries() {
		return countries;
	}

}
