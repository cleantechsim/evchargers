package org.cleantechsim.evchargers.spring.server.rest;

import java.util.HashMap;
import java.util.Map;

import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;

import org.cleantechsim.evchargers.spring.server.rest.model.ChargersByYearResult;
import org.cleantechsim.evchargers.spring.server.rest.model.ChargingFilter;
import org.cleantechsim.evchargers.spring.server.rest.model.ChargingFilterOptions;
import org.cleantechsim.evchargers.spring.server.rest.model.Country;
import org.cleantechsim.evchargers.spring.server.rest.model.CountryChargerYears;
import org.springframework.stereotype.Service;

@Service
@Path("/statistics")
public class StatisticsResource {

	@Path("test")
	@GET
	@Produces("text/plain")
	public String getTestData() {
		return "test";
	}
	
	@Path("chargersByYear")
	@POST
	@Consumes("application/json")
	@Produces("application/json")
	public ChargersByYearResult getChargersByYear(ChargingFilter filter) {
		
		final ChargingFilterOptions filterOptions = new ChargingFilterOptions(
				new Country("NO", "Norway"),
				new Country("SE", "Sweden"),
				new Country("FI", "Finland")
				);
		
		final Map<String, CountryChargerYears> countryYears = new HashMap<>();
		
		addTestData(countryYears);
		
		return new ChargersByYearResult(filterOptions, countryYears);
	}
	
	private static void addTestData(Map<String, CountryChargerYears> countryYears) {
		
		Map<Integer, Integer> map = new HashMap<>();
		
		map.put(2016, 1204);
		map.put(2017, 1503);
		map.put(2018, 2334);
		map.put(2019, 3189);
		
		countryYears.put("NO", new CountryChargerYears("Norway", map));
	}
}
