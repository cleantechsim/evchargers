package org.cleantechsim.evchargers.spring.server.rest.model;

import java.util.Map;

public final class ChargersByYearResult extends BaseByYearStatisticsResult<CountryChargerYears> {

	public ChargersByYearResult(ChargingFilterOptions filterOptions, Map<String, CountryChargerYears> countries) {
		super(filterOptions, countries);
	}
}
