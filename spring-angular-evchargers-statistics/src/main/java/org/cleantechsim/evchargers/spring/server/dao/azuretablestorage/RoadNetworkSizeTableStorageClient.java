package org.cleantechsim.evchargers.spring.server.dao.azuretablestorage;

import java.net.URISyntaxException;
import java.security.InvalidKeyException;
import java.util.Map;
import java.util.Optional;

import org.cleantechsim.evchargers.spring.server.dao.RoadNetworkSizes;

import com.microsoft.azure.storage.StorageException;

public class RoadNetworkSizeTableStorageClient extends BaseAzureTableStorageClient implements RoadNetworkSizes {

	public RoadNetworkSizeTableStorageClient()
			throws InvalidKeyException, URISyntaxException, StorageException {
		super("RoadNetworkSize");
	}

	@Override
	public Optional<Integer> getRoadNetworkSize(String countryName) {

		return findIntegerRowKeyByPartitionKey(countryName);
	}

	@Override
	public Map<String, Integer> getAll() {
		return getRowKeyByPartitionKey();
	}
}
