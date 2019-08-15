package org.cleantechsim.evchargers.spring.server.rest.model;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

public final class ChargingFilterOptions {

	private final List<Country> countries;

	public ChargingFilterOptions(Country ... countries) {
		this.countries = Collections.unmodifiableList(Arrays.asList(countries));
	}

	public ChargingFilterOptions(List<Country> countries) {
		this.countries = Collections.unmodifiableList(new ArrayList<>(countries));
	}

	public List<Country> getCountries() {
		return countries;
	}
}
