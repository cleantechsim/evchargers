package org.cleantechsim.evchargers.aws.sqs.to.elasticsearch;

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
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

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

		for (;;) {
			
			final ConnectionRequest connRequest = connectionManager.requestConnection(route, null);
			
			HttpClientConnection connection = null;

			final String queueUrl = "cleantechsim_evchargers_queue";
			
			try {
				connection = connRequest.get(30, TimeUnit.SECONDS);
				
				final ReceiveMessageRequest request = new ReceiveMessageRequest(queueUrl);
				
				request.setVisibilityTimeout(1);
				
				System.out.println("## call receiveMessage");
				final ReceiveMessageResult result = client.receiveMessage(request);
			
				System.out.println("## got result " + result);
				
				if (result == null || result.getMessages().isEmpty()) {
					break;
				}
				
				for (Message message : result.getMessages()) {
					
					final String messageBody = message.getBody();

					System.out.println("## got message body " + messageBody);
					
					final JsonNode jsonNode = objectMapper.readTree(messageBody);
					
					System.out.println("## got json node " + jsonNode);
					jsonNode.fieldNames().forEachRemaining(name -> System.out.println(name));
					
					final String publishedMessage = jsonNode.get("Message").asText();
					
					
					System.out.println("## published message " + publishedMessage);

					final JsonNode published = objectMapper.readTree(publishedMessage);
					
					final String id = published.get("ID").asText();
					
					// Post this to ES index
					
					if (!connection.isOpen()) {
						connectionManager.connect(connection, route, 1000, httpContext);
						
						connectionManager.routeComplete(connection, route, httpContext);
					}
					
					final String url = "/evchargers/_doc/" + id;
					
					System.out.println("## posting to " + url);
					
					final HttpPut put = new HttpPut(url);
					
					final StringEntity entity = new StringEntity(publishedMessage, ContentType.APPLICATION_JSON);
					
					put.setEntity(entity);
					
					put.setHeader("Host", route.getTargetHost().getHostName() + ':' + route.getTargetHost().getPort());
					
					put.addHeader("Content-type", "application/json");
					put.addHeader("Content-length", String.valueOf(entity.getContentLength()));
					
					connection.sendRequestHeader(put);
					connection.sendRequestEntity(put);
					
					final HttpResponse response = connection.receiveResponseHeader();

					if (response.getEntity() != null) {
						
						System.out.println("## response " + response.getEntity());
						
						EntityUtils.consume(response.getEntity());
					}

					if (response.getStatusLine().getStatusCode() >= 300) {
						throw new IllegalStateException("Non-OK response " + response.getStatusLine().getStatusCode() + ' ' + response.getStatusLine().getReasonPhrase());
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
}
