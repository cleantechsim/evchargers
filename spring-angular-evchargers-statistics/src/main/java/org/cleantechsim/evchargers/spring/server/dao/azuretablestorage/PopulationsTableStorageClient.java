package org.cleantechsim.evchargers.spring.server.dao.azuretablestorage;

import java.net.URISyntaxException;
import java.security.InvalidKeyException;
import java.util.Map;
import java.util.Optional;

import org.cleantechsim.evchargers.spring.server.dao.PopulationSizes;

import com.microsoft.azure.storage.StorageException;

public final class PopulationsTableStorageClient extends BaseAzureTableStorageClient implements PopulationSizes {
	
	public PopulationsTableStorageClient()
			throws InvalidKeyException, URISyntaxException, StorageException {
		super("Population");
	}

	@Override
	public Optional<Integer> getPopulationSizes(String countryName) {
		return findIntegerRowKeyByPartitionKey(countryName);
	}

	@Override
	public Map<String, Integer> getAll() {
		return getRowKeyByPartitionKey();
	}
}
