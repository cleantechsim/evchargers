package org.cleantechsim.evchargers.aws.sqs.to.elasticsearch;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeUnit;

import org.apache.http.HttpClientConnection;
import org.apache.http.HttpException;
import org.apache.http.HttpHost;
import org.apache.http.HttpResponse;
import org.apache.http.client.methods.HttpPut;
import org.apache.http.client.protocol.HttpClientContext;
import org.apache.http.conn.ConnectionRequest;
import org.apache.http.conn.HttpClientConnectionManager;
import org.apache.http.conn.routing.HttpRoute;
import org.apache.http.entity.ContentType;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.conn.BasicHttpClientConnectionManager;
import org.apache.http.util.EntityUtils;

import com.amazonaws.regions.Regions;
import com.amazonaws.services.sqs.AmazonSQS;
import com.amazonaws.services.sqs.AmazonSQSClientBuilder;
import com.amazonaws.services.sqs.model.Message;
import com.amazonaws.services.sqs.model.ReceiveMessageRequest;
import com.amazonaws.services.sqs.model.ReceiveMessageResult;
import com.fasterxml.jackson.core.JsonFactory;
import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.JsonNodeFactory;
import com.fasterxml.jackson.databind.node.ObjectNode;

public class SQSToElasticSearchMain {
	
	public static void main(String [] args) throws JsonProcessingException, IOException, InterruptedException, ExecutionException, HttpException {
		
		if (args.length < 3) {
			throw new IllegalArgumentException();
		}

		final HttpClientContext httpContext = HttpClientContext.create();

		final HttpRoute httpRoute = new HttpRoute(new HttpHost(args[0], Integer.parseInt(args[1])));
		final int interval = Integer.parseInt(args[2]);

		final AmazonSQSClientBuilder clientBuilder = AmazonSQSClientBuilder.standard();
		
		clientBuilder.setRegion(Regions.EU_WEST_1.getName());
		
		final AmazonSQS client = clientBuilder.build();

		final ObjectMapper objectMapper = new ObjectMapper();
		
		try (BasicHttpClientConnectionManager connectionManager = new BasicHttpClientConnectionManager()) {

			for (;;) {
				
				pollForMessages(client, httpContext, connectionManager, httpRoute, objectMapper);
				
				try {
					Thread.sleep(interval * 1000L);
				} catch (InterruptedException e) {
				}
			}
		}
	}
	
	private static void pollForMessages(AmazonSQS client, HttpClientContext httpContext, HttpClientConnectionManager connectionManager, HttpRoute route, ObjectMapper objectMapper) throws IOException, InterruptedException, ExecutionException, HttpException {

		int count = 0;
		
		for (;;) {
			
			final ConnectionRequest connRequest = connectionManager.requestConnection(route, null);
			
			HttpClientConnection connection = null;

			final String queueUrl = "cleantechsim_evchargers_queue";
			
			try {
				connection = connRequest.get(30, TimeUnit.SECONDS);
				
				final ReceiveMessageRequest request = new ReceiveMessageRequest(queueUrl);
				
				request.setVisibilityTimeout(1);
				
				final ReceiveMessageResult result = client.receiveMessage(request);
			
				if (result == null || result.getMessages().isEmpty()) {
					break;
				}
				
				final JsonNodeFactory jsonNodeFactory = new JsonNodeFactory(true);
				final JsonFactory jsonFactory = new JsonFactory();
				final ByteArrayOutputStream baos = new ByteArrayOutputStream();
				for (Message message : result.getMessages()) {
					
					final String publishedMessage = message.getBody();

					final JsonNode published = objectMapper.readTree(publishedMessage);
					
					final String id = published.get("ID").asText();

                    final JsonNode addressInfo = published.get("AddressInfo");
                    final JsonNode latitude = addressInfo.get("Latitude");
                    final JsonNode longitude = addressInfo.get("Longitude");

                    final String jsonToIndex;

                    if (latitude != null && longitude != null) {

                        final String location = latitude.asText() + ',' + longitude.asText();
                        final JsonNode locationNode = jsonNodeFactory.textNode(location);

                        ((ObjectNode) published).set("location", locationNode);

                        final JsonGenerator generator = jsonFactory.createGenerator(baos);

                        objectMapper.writeTree(generator, published);

                        jsonToIndex = new String(baos.toByteArray());

                        baos.reset();
                    } else {
                        jsonToIndex = publishedMessage;
                    }

					// Post this to ES index
					
					if (!connection.isOpen()) {
						connectionManager.connect(connection, route, 1000, httpContext);
						
						connectionManager.routeComplete(connection, route, httpContext);
					}
					
					final String url = "/evchargers/_doc/" + id;
					
					final HttpResponse response = sendPutRequest(url, jsonToIndex	, route, connection);
					
					if (response.getEntity() != null) {
						EntityUtils.consume(response.getEntity());
					}

					if (response.getStatusLine().getStatusCode() >= 300) {
						throw new IllegalStateException("Non-OK response " + response.getStatusLine().getStatusCode() + ' ' + response.getStatusLine().getReasonPhrase());
					}
					
					++ count;
					
					if (count % 10000 == 0) {
						System.out.println("Processed " + count + " since start");
					}
					
					client.deleteMessage(queueUrl, message.getReceiptHandle());
				}
			}
			finally {
				if (connection != null) {
					if (connection.isOpen()) {
						connection.close();
					}
					connectionManager.releaseConnection(connection, null, 1, TimeUnit.MINUTES);
				}
			}
		}
	}
	
    private static HttpResponse sendPutRequest(String url, String publishedMessage, HttpRoute route,
	    HttpClientConnection connection) throws HttpException, IOException {

        final HttpPut put = new HttpPut(url);

    	final StringEntity entity = new StringEntity(publishedMessage, ContentType.APPLICATION_JSON);
    
    	put.setEntity(entity);
    
    	put.setHeader("Host", route.getTargetHost().getHostName() + ':' + route.getTargetHost().getPort());
    
    	put.addHeader("Content-type", "application/json");
    	put.addHeader("Content-length", String.valueOf(entity.getContentLength()));
    
    	connection.sendRequestHeader(put);
    	connection.sendRequestEntity(put);
    
    	final HttpResponse response = connection.receiveResponseHeader();
    
    	return response;
    }
	
}
