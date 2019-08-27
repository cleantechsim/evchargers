package org.cleantechsim.evchargers.spring.server.rest.model;

import java.util.Map;

public class CapacityByYearResult extends BaseByYearStatisticsResult<CountryCapacityYears> {

	public CapacityByYearResult(ChargingFilterOptions filterOptions, Map<String, CountryCapacityYears> countries) {
		super(filterOptions, countries);
	}
}
