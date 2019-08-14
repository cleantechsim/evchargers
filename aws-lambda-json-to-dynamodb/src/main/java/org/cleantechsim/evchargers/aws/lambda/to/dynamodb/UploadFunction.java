package org.cleantechsim.evchargers.aws.lambda.to.dynamodb;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Objects;

import com.amazonaws.auth.DefaultAWSCredentialsProviderChain;
import com.amazonaws.services.dynamodbv2.AmazonDynamoDB;
import com.amazonaws.services.dynamodbv2.AmazonDynamoDBClientBuilder;
import com.amazonaws.services.dynamodbv2.model.AttributeValue;
import com.amazonaws.services.dynamodbv2.model.PutItemRequest;
import com.amazonaws.services.lambda.runtime.Context;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * AWS Lambda function that uploads EV charger info to Amazon DynamoDB
 * for ACID storage.
 * 
 */

public class UploadFunction {

	private static final char SEPARATOR = '#';
	
	public void handleRequest(InputStream json, Context context) {
		
		try {
			final AmazonDynamoDB client = AmazonDynamoDBClientBuilder.standard()
					.withCredentials(DefaultAWSCredentialsProviderChain.getInstance())
					.build();
			
			final Map<String, AttributeValue> item = convertJson(json);
			
			final PutItemRequest request = new PutItemRequest("EVChargers", item);
			
			client.putItem(request);
		}
		finally {
			try {
				json.close();
			} catch (IOException ex) {
				throw new RuntimeException(ex);
			}
		}
	}
	
	private static void jsonToAttributes(JsonNode node, Map<String, AttributeValue> fields) {
		
		final Iterator<Map.Entry<String, JsonNode>> nodeIter = node.fields();
		
		while (nodeIter.hasNext()) {
			final Map.Entry<String, JsonNode> entry = nodeIter.next();
			
			final String fieldName = entry.getKey();
			final JsonNode fieldNode = entry.getValue();
			
			if (fieldNode.isNull()) {
				continue;
			}
			
			final AttributeValue value = new AttributeValue();
			
			if (fieldNode.isNumber()) {
				value.setN(fieldNode.asText());
			}
			else if (fieldNode.isTextual()) {
				value.setS(fieldNode.asText());
			}
			else if (fieldNode.isBoolean()) {
				value.setBOOL(fieldNode.asBoolean());
			}
			else if (fieldNode.isArray()) {
				
				if (fieldNode.size() > 0) {
					value.setL(convertJsonArray(fieldNode));
				}
			}
			else if (fieldNode.isObject()) {
				final Map<String, AttributeValue> subFields = new HashMap<>();
				
				jsonToAttributes(fieldNode, subFields);
				
				value.setM(subFields);
			}
			else {
				throw new IllegalArgumentException("field is a " + fieldNode.getNodeType());
			}
			
			fields.put(fieldName, value);
		}
	}
	
	
	private static List<AttributeValue> convertJsonArray(JsonNode jsonNode) {
		
		final List<AttributeValue> result = new ArrayList<>(jsonNode.size());
		
		for (int i = 0; i < jsonNode.size(); ++ i) {
			
			final JsonNode element = jsonNode.get(i);
			
			if (element.isObject()) {
				final Map<String, AttributeValue> map = new HashMap<>(element.size());
				
				jsonToAttributes(element, map);
				
				final AttributeValue value = new AttributeValue();
			
				value.setM(map);
				
				result.add(value);
			}
			else {
				throw new IllegalArgumentException();
			}
		}
		
		return result;
	}
	
	static Map<String, AttributeValue> convertJson(InputStream json) {

		final ObjectMapper mapper = new ObjectMapper();
		
		final JsonNode node;
		
		try {
			node = mapper.readTree(json);
		} catch (IOException ex) {
			throw new IllegalStateException(ex);
		}
		
		final JsonNode addressInfo = node.get("AddressInfo");
		
		final String country = addressInfo.get("Country").get("ISOCode").asText();
		
		final String id = node.get("ID").asText();
		
		final Map<String, AttributeValue> item = new HashMap<>();
		
		Objects.requireNonNull(country);
		
		item.put("Country", new AttributeValue(country));
		// item.put("Location", new AttributeValue(sb.toString()));
		
		final AttributeValue value = new AttributeValue();
		
		value.setN(id);
		
		item.put("ID", value);

		jsonToAttributes(node, item);

		return item;
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
