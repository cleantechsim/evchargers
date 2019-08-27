package org.cleantechsim.evchargers.spring.server.dao.azuretablestorage;

import java.net.URISyntaxException;
import java.security.InvalidKeyException;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import com.microsoft.azure.storage.CloudStorageAccount;
import com.microsoft.azure.storage.StorageException;
import com.microsoft.azure.storage.table.CloudTable;
import com.microsoft.azure.storage.table.CloudTableClient;
import com.microsoft.azure.storage.table.TableQuery;
import com.microsoft.azure.storage.table.TableServiceEntity;
import com.microsoft.azure.storage.table.TableQuery.QueryComparisons;

public abstract class BaseAzureTableStorageClient {

	private final CloudTable table;

	public BaseAzureTableStorageClient(String tableName)
			throws InvalidKeyException, URISyntaxException, StorageException {
		
		final String connectionString = System.getenv("AZURE_TABLE_STORAGE_CONNECTION_STRING");
		
		final CloudStorageAccount storageAccount = CloudStorageAccount.parse(connectionString);
		final CloudTableClient tableClient = storageAccount.createCloudTableClient();

		this.table = tableClient.getTableReference(tableName);
	}
	
	protected final CloudTable getTable() {
		return table;
	}

	protected final Optional<Integer> findIntegerRowKeyByPartitionKey(String partitionKey) {
		
		Integer value = null;
		
		final TableQuery<TableServiceEntity> query = TableQuery.from(TableServiceEntity.class).where(
				TableQuery.generateFilterCondition("PartitionKey", QueryComparisons.EQUAL, partitionKey));
		
		final Iterable<TableServiceEntity> result = getTable().execute(query);
		
		for (TableServiceEntity entity : result) {
			if (value != null) {
				throw new IllegalStateException("More than one result");
			}
			
			value = Integer.parseInt(entity.getRowKey());
		}
		
		return Optional.ofNullable(value);
	}
	
	protected final Map<String, Integer> getRowKeyByPartitionKey() {
		
		final TableQuery<TableServiceEntity> query = TableQuery.from(TableServiceEntity.class);
		
		final Map<String, Integer> map = new HashMap<>();
		
		final Iterable<TableServiceEntity> result = getTable().execute(query);
		
		for (TableServiceEntity entity : result) {
			map.put(entity.getPartitionKey(), Integer.parseInt(entity.getRowKey()));
		}

		return map;
	}
}
