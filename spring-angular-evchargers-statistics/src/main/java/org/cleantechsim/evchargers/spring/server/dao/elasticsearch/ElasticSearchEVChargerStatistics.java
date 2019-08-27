package org.cleantechsim.evchargers.spring.server.dao.elasticsearch;

import java.io.IOException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.BiFunction;
import java.util.function.Function;

import org.apache.http.HttpHost;
import org.cleantechsim.evchargers.spring.server.dao.EVChargerStatistics;
import org.cleantechsim.evchargers.spring.server.rest.model.CountryCapacityYears;
import org.cleantechsim.evchargers.spring.server.rest.model.CountryChargerYears;
import org.cleantechsim.evchargers.spring.server.rest.model.CountryYears;
import org.elasticsearch.action.search.SearchRequest;
import org.elasticsearch.action.search.SearchResponse;
import org.elasticsearch.client.RequestOptions;
import org.elasticsearch.client.RestClient;
import org.elasticsearch.client.RestHighLevelClient;
import org.elasticsearch.index.query.QueryBuilder;
import org.elasticsearch.index.query.QueryBuilders;
import org.elasticsearch.search.aggregations.Aggregation;
import org.elasticsearch.search.aggregations.AggregationBuilder;
import org.elasticsearch.search.aggregations.AggregationBuilders;
import org.elasticsearch.search.aggregations.Aggregations;
import org.elasticsearch.search.aggregations.bucket.histogram.DateHistogramAggregationBuilder;
import org.elasticsearch.search.aggregations.bucket.histogram.DateHistogramInterval;
import org.elasticsearch.search.aggregations.bucket.histogram.Histogram;
import org.elasticsearch.search.aggregations.bucket.terms.Terms;
import org.elasticsearch.search.aggregations.bucket.terms.TermsAggregationBuilder;
import org.elasticsearch.search.aggregations.metrics.NumericMetricsAggregation.SingleValue;
import org.elasticsearch.search.aggregations.metrics.avg.AvgAggregationBuilder;
import org.elasticsearch.search.builder.SearchSourceBuilder;

public class ElasticSearchEVChargerStatistics implements EVChargerStatistics {

	private static final String AGGREGATION_COUNTRY = "country";
	private static final String AGGREGATION_YEARLY = "yearly";
	private static final String AGGREGATION_AVERAGE_CAPACITY = "average_capacity";
	
	private final RestHighLevelClient client;
	
	public ElasticSearchEVChargerStatistics(String hostname, int port) {
		this.client = new RestHighLevelClient(RestClient.builder(new HttpHost(hostname, port)));
	}
	
	@Override
	public Map<String, CountryChargerYears> getChargersByYear(
			Function<String, Integer> getCountryPopulation,
			Function<String, Integer> getCountryRoadNetworkSize
			) throws IOException {
		
		final Aggregations aggregations = queryAggregations(makeCountryAndYearAggregation(null));

		return getPerCountryYearResult(
				aggregations,
				yearBucket -> (int)yearBucket.getDocCount(),
				(countryName, valueByYear) -> new CountryChargerYears(
					countryName,
					valueByYear,
					getCountryPopulation.apply(countryName),
					getCountryRoadNetworkSize.apply(countryName)));
	}
	
	
	@Override
	public Map<String, CountryCapacityYears> getAverageCapacityByYear(Function<String, Integer> getCountryPopulation,
			Function<String, Integer> getCountryRoadNetworkSize) throws IOException {

		final AvgAggregationBuilder averageAggregationBuilder = AggregationBuilders.avg(AGGREGATION_AVERAGE_CAPACITY);
		
		averageAggregationBuilder.field("Connections.PowerKW");
		
		final Aggregations aggregations = queryAggregations(makeCountryAndYearAggregation(averageAggregationBuilder));

		return getPerCountryYearResult(
				aggregations,
				yearBucket -> {
					
					final SingleValue singleValue = (SingleValue)yearBucket.getAggregations().get(AGGREGATION_AVERAGE_CAPACITY);
					
					return 
							Double.isFinite(singleValue.value())
								? BigDecimal.valueOf(singleValue.value()).setScale(0, RoundingMode.HALF_UP).intValueExact()
								: null;
				},
				CountryCapacityYears::new);
	}
	
	private Aggregations queryAggregations(TermsAggregationBuilder aggregationBuilder) throws IOException {
		final SearchRequest request = new SearchRequest("evchargers");
		
		// Get aggregation counts for all countries so match all documents
		final QueryBuilder queryBuilder = QueryBuilders.matchAllQuery();
		
		final SearchSourceBuilder sourceBuilder = request.source();
		
		sourceBuilder.query(queryBuilder);
		sourceBuilder.size(0); // Only interested in aggregations
		
		sourceBuilder.aggregation(aggregationBuilder);
		
		final SearchResponse response = client.search(request, RequestOptions.DEFAULT);
	
		return response.getAggregations();
	}

	private static TermsAggregationBuilder makeCountryAndYearAggregation(AggregationBuilder yearlySubAggregation) {
		
		final TermsAggregationBuilder countryAggregation = AggregationBuilders.terms(AGGREGATION_COUNTRY);
		
		countryAggregation.size(1000);
		
		countryAggregation.field("AddressInfo.Country.Title.keyword");
		
		final DateHistogramAggregationBuilder yearly = AggregationBuilders.dateHistogram(AGGREGATION_YEARLY);
		
		countryAggregation.subAggregation(yearly);
		
		yearly.field("DateCreated");
		yearly.format("yyyy");
		yearly.dateHistogramInterval(DateHistogramInterval.YEAR);
		
		if (yearlySubAggregation != null) {
			yearly.subAggregation(yearlySubAggregation);
		}
		
		return countryAggregation;
	}
	
	private static <T extends CountryYears> Map<String, T> getPerCountryYearResult(
			Aggregations aggregations,
			Function<Histogram.Bucket, Integer> getByYearValue,
			BiFunction<String, Map<Integer, Integer>, T> create) {
		
		final Aggregation countryAggregationResult = aggregations.get(AGGREGATION_COUNTRY);

		final Terms terms = (Terms)countryAggregationResult;
		
		final List<? extends Terms.Bucket> countryBuckets = terms.getBuckets();
		
		final Map<String, T> countries = new HashMap<>();
		
		for (Terms.Bucket countryBucket : countryBuckets) {
			
			final Aggregation yearsResult = countryBucket.getAggregations().get(AGGREGATION_YEARLY);
		
			final Histogram histogram = (Histogram)yearsResult;
			
			final List<? extends Histogram.Bucket> yearBuckets = histogram.getBuckets();
			
			final Map<Integer, Integer> valueByYear = new HashMap<>();
			
			for (Histogram.Bucket yearBucket : yearBuckets) {
				
				final Integer value = getByYearValue.apply(yearBucket);

				if (value != null) {
					final int year = Integer.parseInt(yearBucket.getKeyAsString());
					
					valueByYear.put(year, value);
				}
			}
			
			if (!valueByYear.isEmpty()) {
				final String countryName = countryBucket.getKeyAsString();
				
				final T entry = create.apply(countryName, valueByYear);
				
				countries.put(countryName, entry);
			}
		}
		
		return countries;
	}
}
