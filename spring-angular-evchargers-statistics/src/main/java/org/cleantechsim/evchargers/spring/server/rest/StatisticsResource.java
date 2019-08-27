package org.cleantechsim.evchargers.spring.server.rest;

import java.io.IOException;
import java.net.URISyntaxException;
import java.security.InvalidKeyException;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;

import org.cleantechsim.evchargers.spring.server.dao.EVChargerStatistics;
import org.cleantechsim.evchargers.spring.server.dao.azuretablestorage.PopulationsTableStorageClient;
import org.cleantechsim.evchargers.spring.server.dao.azuretablestorage.RoadNetworkSizeTableStorageClient;
import org.cleantechsim.evchargers.spring.server.dao.elasticsearch.ElasticSearchEVChargerStatistics;
import org.cleantechsim.evchargers.spring.server.rest.model.CapacityByYearResult;
import org.cleantechsim.evchargers.spring.server.rest.model.ChargersByYearResult;
import org.cleantechsim.evchargers.spring.server.rest.model.ChargingFilter;
import org.cleantechsim.evchargers.spring.server.rest.model.ChargingFilterOptions;
import org.cleantechsim.evchargers.spring.server.rest.model.Country;
import org.cleantechsim.evchargers.spring.server.rest.model.CountryCapacityYears;
import org.cleantechsim.evchargers.spring.server.rest.model.CountryChargerYears;
import org.cleantechsim.evchargers.spring.server.rest.model.CountryYears;
import org.springframework.stereotype.Service;

import com.microsoft.azure.storage.StorageException;

@Service
@Path("/statistics")
public class StatisticsResource {
	
	private static final long MAX_CACHING_MILLIS = 60 * 60 * 1000;

	private static final String ES_HOST;
	private static final int ES_PORT;
	
	static {
		ES_HOST = System.getenv("ES_HOST");
		ES_PORT = Integer.parseInt(System.getenv("ES_PORT"));
	}
	
	private long lastTimeCacheUpdated;

	private Map<String, Integer> populationSizes;
	private Map<String, Integer> roadNetworkSizes;
	
	public StatisticsResource() throws InvalidKeyException, URISyntaxException, StorageException {
		cachePopulationAndRoadNetworkSizes();
	}
	
	private void cachePopulationAndRoadNetworkSizes() throws InvalidKeyException, URISyntaxException, StorageException {
		
		if (System.currentTimeMillis() - lastTimeCacheUpdated > MAX_CACHING_MILLIS) {
			this.populationSizes = new PopulationsTableStorageClient().getAll();
			this.roadNetworkSizes = new RoadNetworkSizeTableStorageClient().getAll();
		}
	}
	
	private static EVChargerStatistics getEVChargerStatistics() {
		return new ElasticSearchEVChargerStatistics(ES_HOST, ES_PORT);
	}
	
	@Path("chargersByYear")
	@POST
	@Consumes("application/json")
	@Produces("application/json")
	public ChargersByYearResult getChargersByYear(ChargingFilter filter) throws InvalidKeyException, URISyntaxException, StorageException, IOException {
		
		cachePopulationAndRoadNetworkSizes();
		
		final Map<String, CountryChargerYears> countryYears = getEVChargerStatistics().getChargersByYear(
				countryName -> populationSizes.get(countryName),
				countryName -> roadNetworkSizes.get(countryName));
		
		return new ChargersByYearResult(makeFilterOptions(countryYears), countryYears);
	}

	@Path("capacityByYear")
	@GET
	@Produces("application/json")
	public CapacityByYearResult getCapacityByYear() throws InvalidKeyException, URISyntaxException, StorageException, IOException {

		cachePopulationAndRoadNetworkSizes();
		
		final Map<String, CountryCapacityYears> countryYears = getEVChargerStatistics().getAverageCapacityByYear(
				countryName -> populationSizes.get(countryName),
				countryName -> roadNetworkSizes.get(countryName));
		
		return new CapacityByYearResult(makeFilterOptions(countryYears), countryYears);
	}

	private static ChargingFilterOptions makeFilterOptions(Map<String, ? extends CountryYears> map) {
		
		final List<Country> countries = map.entrySet().stream()
				.map(entry -> new Country(entry.getKey(), entry.getValue().getCountryDisplayName()))
				.collect(Collectors.toList());
		
		final ChargingFilterOptions filterOptions = new ChargingFilterOptions(countries);

		return filterOptions;
	}
}
