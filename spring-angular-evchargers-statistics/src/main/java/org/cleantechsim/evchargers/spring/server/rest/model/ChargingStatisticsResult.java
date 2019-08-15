package org.cleantechsim.evchargers.spring.server.rest.model;

import java.util.Objects;

public abstract class ChargingStatisticsResult {

	private final ChargingFilterOptions filterOptions;

	public ChargingStatisticsResult(ChargingFilterOptions filterOptions) {

		Objects.requireNonNull(filterOptions);
		
		this.filterOptions = filterOptions;
	}

	public final ChargingFilterOptions getFilterOptions() {
		return filterOptions;
	}
}
