package org.cleantechsim.evchargers.aws.lambda.sqs.to.dynamodb;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Objects;

import com.amazonaws.auth.DefaultAWSCredentialsProviderChain;
import com.amazonaws.regions.Regions;
import com.amazonaws.services.dynamodbv2.AmazonDynamoDB;
import com.amazonaws.services.dynamodbv2.AmazonDynamoDBClientBuilder;
import com.amazonaws.services.dynamodbv2.model.AttributeValue;
import com.amazonaws.services.dynamodbv2.model.ScanRequest;
import com.amazonaws.services.dynamodbv2.model.ScanResult;
import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.sqs.AmazonSQS;
import com.amazonaws.services.sqs.AmazonSQSClientBuilder;
import com.amazonaws.services.sqs.model.SendMessageBatchRequestEntry;
import com.fasterxml.jackson.core.JsonFactory;
import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.JsonNodeFactory;
import com.fasterxml.jackson.databind.node.ObjectNode;

/**
 * AWS Lambda function that downloads stored data from DynamoDB and adds to SQS queue
 * for ACID storage.
 * 
 */

public class DownloadFunction {

	private static final char SEPARATOR = '#';
	
	public static void main(String [] args) {
		new DownloadFunction().handleRequest(new ByteArrayInputStream(new byte[0]), null);
	}
	
	public void handleRequest(InputStream json, Context context) {
		
		try {
			final AmazonDynamoDB dynamoDB = AmazonDynamoDBClientBuilder.standard()
					.withCredentials(DefaultAWSCredentialsProviderChain.getInstance())
					.withRegion(Regions.EU_WEST_1)
					.build();
		
			final AmazonSQSClientBuilder clientBuilder = AmazonSQSClientBuilder.standard();
			
			clientBuilder.setRegion(Regions.EU_WEST_1.getName());
			
			final AmazonSQS sqs = clientBuilder.build();
			
			final ByteArrayOutputStream baos = new ByteArrayOutputStream();
			
			final JsonFactory jsonFactory = new JsonFactory();
			final JsonNodeFactory jsonNodeFactory = new JsonNodeFactory(true);
			final ObjectMapper mapper = new ObjectMapper();
			
			final JsonGenerator jsonGenerator = jsonFactory.createGenerator(baos);

			boolean done = false;
					
			final List<SendMessageBatchRequestEntry> entries = new ArrayList<>();

			final String queueUrl = "https://sqs.eu-west-1.amazonaws.com/684820422607/cleantechsim_evchargers_queue";

			Map<String, AttributeValue> lastKeyEvaluated = null;

			while (!done) {
				
				final ScanRequest scanRequest = new ScanRequest()
						.withTableName("EVChargers")
						.withExclusiveStartKey(lastKeyEvaluated);
				
				final ScanResult scanResult = dynamoDB.scan(scanRequest);
				final List<Map<String, AttributeValue>> items = scanResult.getItems();
				
				System.out.println("## converting " + items.size());
				
				
				for (Map<String, AttributeValue> item : items) {
					
					convertItem(item, mapper, jsonGenerator, jsonNodeFactory);
	
					final String jsonString = new String(baos.toByteArray());

					final String id = item.get("ID").getN();
					
					entries.add(new SendMessageBatchRequestEntry(id, jsonString));

					if (entries.size() == 10) {
						sqs.sendMessageBatch(queueUrl, entries);
						entries.clear();
					}
					
					baos.reset();
				}

				lastKeyEvaluated = scanResult.getLastEvaluatedKey();
				
				if (lastKeyEvaluated == null) {
					done = true;
				}
			}
			sqs.sendMessageBatch(queueUrl, entries);
		}
		catch (IOException ex) {
			throw new IllegalStateException(ex);
		}
		finally {
			try {
				json.close();
			} catch (IOException ex) {
				throw new RuntimeException(ex);
			}
		}
	}
	
	private static ArrayNode convertItemArray(Collection<AttributeValue> items, JsonNodeFactory jsonNodeFactory) throws JsonProcessingException, IOException {

		final ArrayNode arrayNode = jsonNodeFactory.arrayNode();
		
		for (AttributeValue item : items) {
			arrayNode.add(convertAttributeValue(item, jsonNodeFactory));
		}
		
		return arrayNode;
	}

	
	private static void convertItem(
			Map<String, AttributeValue> item,
			ObjectMapper mapper,
			JsonGenerator jsonGenerator,
			JsonNodeFactory jsonNodeFactory) throws JsonProcessingException, IOException {
		
		final JsonNode node = convertItemMap(item, jsonNodeFactory);
		
		mapper.writeTree(jsonGenerator, node);
	}

	private static JsonNode convertItemMap(
			Map<String, AttributeValue> item,
			JsonNodeFactory jsonNodeFactory) throws JsonProcessingException, IOException {

		final ObjectNode node = jsonNodeFactory.objectNode();
		
		for (Map.Entry<String, AttributeValue> entry : item.entrySet()) {
			
			final String fieldName = entry.getKey();
			final AttributeValue value = entry.getValue();
			
			final JsonNode valueNode = convertAttributeValue(value, jsonNodeFactory);
			
			node.set(fieldName, valueNode);
		}

		return node;
	}
	
	private static JsonNode convertAttributeValue(AttributeValue value, JsonNodeFactory jsonNodeFactory) throws JsonProcessingException, IOException {

		Objects.requireNonNull(value);
		
		final JsonNode valueNode;
		
		if (value.getBOOL() != null) {
			valueNode = jsonNodeFactory.booleanNode(value.getBOOL());
		}
		else if (value.getS() != null) {
			valueNode = jsonNodeFactory.textNode(value.getS());
		}
		else if (value.getN() != null) {
			valueNode = jsonNodeFactory.numberNode(new BigDecimal(value.getN()));
		}
		else if (value.getL() != null) {
			valueNode = convertItemArray(value.getL(), jsonNodeFactory);
		}
		else if (value.getM() != null) {
			valueNode = convertItemMap(value.getM(), jsonNodeFactory);
		}
		else {
			throw new UnsupportedOperationException("Unknown item " + value);
		}
		
		return valueNode;
	}
	
	@SuppressWarnings("unused")
	private static String buildLocationString(JsonNode addressInfo) {
		
		final String state = addressInfo.get("StateOrProvince").asText();
		final String postCode = addressInfo.get("Postcode").asText();
		final String addressLine1 = addressInfo.get("AddressLine1").asText();
		final String addressLine2 = addressInfo.get("AddressLine2").asText();
		
		final StringBuilder sb = new StringBuilder();
		
		addIfNotNullOrEmpty(sb, state);
		
		sb.append(SEPARATOR);
		
		addIfNotNullOrEmpty(sb, postCode);
		
		sb.append(SEPARATOR);
		
		addIfNotNullOrEmpty(sb, addressLine1);
		
		sb.append(SEPARATOR);
		
		addIfNotNullOrEmpty(sb, addressLine2);

		return sb.toString();
	}

	private static StringBuilder addIfNotNullOrEmpty(StringBuilder sb, String string) {

		if (string.contains(String.valueOf(SEPARATOR))) {
			throw new IllegalArgumentException();
		}
		
		if (string != null) {
			
			final String trimmed = string.trim();
			
			if (!trimmed.isEmpty()) {
				sb.append(trimmed);
			}
		}

		return sb;
	}
}
