package org.cleantechsim.evchargers.spring.server.rest.model;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

public final class ChargersByYearResult extends ChargingStatisticsResult {

	// Map from country display name to map from year to number of entries
	private final Map<String, CountryChargerYears> countries;

	public ChargersByYearResult(ChargingFilterOptions filterOptions, Map<String, CountryChargerYears> countries) {
		super(filterOptions);

		this.countries = Collections.unmodifiableMap(new HashMap<>(countries));
	}

	public final Map<String,CountryChargerYears> getCountries() {
		return countries;
	}
}
