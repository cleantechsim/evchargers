
from elasticsearch6 import Elasticsearch
import json

from range import Range

class GeoElasticSearch:

    GEO_POINTS = 'geopoints'

    def __init__(self, host, port, index_param, field):

        self.field = field
        self.index = index_param

        self.es = Elasticsearch([host + ':' + str(port)])

        if not self.es.indices.exists(index=index_param):
            self.es.indices.create(index=index_param, body={
                "mappings": {
                    "_doc": {
                        "properties": {
                            field: {
                                "type": "geo_point"
                            }
                        }
                    }
                }
            })

    def search(self, place):

        es_result = self.es.search(
            index=self.index,
            body={
                "query": {
                    "multi_match": {
                        "query": place,
                        "fields": [
                            "AddressInfo.Country.Title^4",
                            "AddressInfo.StateOrProvince^3",
                            "AddressInfo.Town^2",
                            "AddressInfo.AddressLine1^1",
                            "AddressInfo.Title^1"
                        ]
                    }
                },
                "_source": [
                    "AddressInfo.Country.Title",
                    "AddressInfo.StateOrProvince",
                    "AddressInfo.Town",
                    "AddressInfo.AddressLine1",
                    "AddressInfo.Title",
                    "location"
                ],
                "size": 30
            }
        )

        results = []
        
        total_hits = int(es_result['hits']['total'])

        if total_hits > 0:
            es_hits = es_result['hits']['hits']

            for es_hit in es_hits:

                es_source = es_hit['_source']
                location = es_source['location']

                if location != '' and ',' in location:

                    split = location.split(',')
                    address_info = es_source['AddressInfo']

                    result_entry = {
                        "country" : address_info['Country']['Title'],
                        "title" : address_info['Title'],
                        
                        "latitude": float(split[0]),
                        "longitude": float(split[1])
                    }

                    if 'StateOrProvince' in address_info:
                        result_entry["stateOrProvince"] = address_info['StateOrProvince']

                    if 'Town' in address_info:
                        result_entry["town"] = address_info['Town']

                    if 'addressLine1' in address_info:
                        result_entry["addressLine1"] = address_info['AddressLine1']

                    results.append(result_entry)

        return { "results" : results }

    def upload_points(self, geo_points):

        es_points = ''
        for i in range(0, len(geo_points.points)):
            es_points += '{"index":{"_id":'
            es_points += str(i + 1) + ', "_type":"_doc"}}\n'

            point = geo_points.points[i]
            es_points += '{"location":"' + str(point.latitude)
            es_points += ',' + str(point.longitude) + '"}\n'

        print 'Add points "' + es_points + '"'
        self.es.bulk(index=self.index, body=es_points)

    def aggregate_points(self, precision):
        result = self.es.search(
            index=self.index,
            body={
                "aggregations": {
                    "large-grid": {
                        "geohash_grid": {
                            "field": self.field,
                            "precision": precision
                        }
                    }
                }
            },
            params={"size": 0}
        )

        buckets = result['aggregations']['large-grid']['buckets']

        return buckets

    def aggregate_search_with_filter(self, precision, geo_bounds, operators, kw_range, connection_types):
        
        geo_hash_filters = []
        operators_filters = []
        kw_range_filters = []
        connection_types_filters = []

        if operators and len(operators) > 0:
            operators_filter = {
                "terms" : {
                    "OperatorID" : operators
                }
            }

            geo_hash_filters.append(operators_filter)
            kw_range_filters.append(operators_filter)
            connection_types_filters.append(operators_filter)

        if kw_range:
            kw_range_filter = {
                "range" : {
                    "Connections.PowerKW" : { "gte" : kw_range.min, "lte" : kw_range.max }
                }
            }

            geo_hash_filters.append(kw_range_filter)
            operators_filters.append(kw_range_filter)
            connection_types_filters.append(kw_range_filter)

        if connection_types and len(connection_types) > 0:
            connection_types_filter = {
                "terms" : {
                    "Connections.ConnectionTypeID" : connection_types
                }
            }

            operators_filters.append(connection_types_filter)
            geo_hash_filters.append(connection_types_filter)
            kw_range_filters.append(connection_types_filter)

        # Filter out nonsense values, so highest max below 1000KW
        kw_range_filters.append({ "range" : { "Connections.PowerKW" : { "lte" : 1000 } } })

        geo_hash_filter        = GeoElasticSearch._get_filter_from_list(geo_hash_filters)
        operator_values_filter = GeoElasticSearch._get_filter_from_list(operators_filters)
        kw_range_values_filter = GeoElasticSearch._get_filter_from_list(kw_range_filters)
        connection_types_values_filter = GeoElasticSearch._get_filter_from_list(connection_types_filters)

        result = self.es.search(
            index=self.index,
            body={
                "aggregations": {
                    "zoomed-in": {
                        "filter": {
                            "geo_bounding_box": {
                                self.field: {
                                    "top_left": str(geo_bounds.top()) + ", " + str(geo_bounds.left()),
                                    "bottom_right": str(geo_bounds.bottom()) + ", " + str(geo_bounds.right())
                                }
                            }
                        },
                        "aggregations": {
                            "zoom1": {
                                "filter" : geo_hash_filter,
                                "aggregations" : {
                                    "geohash_entry" : {
                                        "geohash_grid": {
                                            "field": self.field,
                                            "precision": precision
                                        }
                                    }
                                }
                            },
                            "operators" : {
                                "filter" : operator_values_filter,
                                "aggregations" : {
                                    "operators-filtered" : {
                                        "terms": {
                                            "field": "OperatorID",
                                            "size": 50
                                        }
                                    }
                                }
                            },
                            "missing-operators" : {
                                "missing" : { "field" : "OperatorID" }
                            },
                            "power-kw-min" : {
                                "filter" : kw_range_values_filter,
                                "aggregations" : {
                                    "power-kw-min-filtered" : {
                                        "min" : { "field" : "Connections.PowerKW" }
                                    }
                                }
                            },
                            "power-kw-max" : {
                                "filter" : kw_range_values_filter,
                                "aggregations" : {
                                    "power-kw-max-filtered" : {
                                        "max" : { "field" : "Connections.PowerKW" }
                                    }
                                }
                            },
                            "connector-types" : {
                                "filter" : connection_types_values_filter,
                                "aggregations" : {
                                    "connector-types-filtered" : {
                                        "terms": {
                                            "field": "Connections.ConnectionTypeID",
                                            "size": 50
                                        }
                                    }
                                }
                            },
                        }
                    }
                }
            },
            params={"size": 0})

        geo_hash_to_count = GeoElasticSearch._get_geo_hash_to_count(result)
        operator_to_count = GeoElasticSearch._operator_to_count(result)
        connection_type_to_count = GeoElasticSearch._connection_type_to_count(result)

        kw_min = result['aggregations']['zoomed-in']['power-kw-min']['power-kw-min-filtered']['value']
        kw_max = result['aggregations']['zoomed-in']['power-kw-max']['power-kw-max-filtered']['value']

        return AggregateResult(
            geo_hash_to_count,
            operator_to_count,
            Range(kw_min, kw_max),
            connection_type_to_count)

    @staticmethod
    def _get_filter_from_list(filters):
        num_filters = len(filters)
        
        if num_filters == 0:
            result_filter = { "match_all" }

        elif num_filters == 1:
            result_filter = filters[0]

        elif num_filters > 1:

            result_filter = {
                "bool" : {
                    "must" : []
                }
            }

            for filter in filters:
                result_filter['bool']['must'].append(filter)

        return result_filter


    
    @staticmethod
    def _get_geo_hash_to_count(result):
        buckets = result['aggregations']['zoomed-in']['zoom1']['geohash_entry']['buckets']

        result = {}

        for bucket in buckets:
            geo_hash = bucket['key']
            count = bucket['doc_count']

            result[geo_hash] = count

        return result

    @staticmethod
    def _operator_to_count(es_result):
        buckets = es_result['aggregations']['zoomed-in']['operators']['operators-filtered']['buckets']

        result = GeoElasticSearch._buckets_to_list(buckets)

        missing = es_result['aggregations']['zoomed-in']['missing-operators']
        
        count = int(missing['doc_count'])

        if count > 0:
            result.append({
                "count": count
            })

        return result

    @staticmethod
    def _connection_type_to_count(es_result):
        buckets = es_result['aggregations']['zoomed-in']['connector-types']['connector-types-filtered']['buckets']

        return GeoElasticSearch._buckets_to_list(buckets)

    @staticmethod
    def _buckets_to_list(buckets):
        result = []

        for bucket in buckets:
            operator_id = bucket['key']
            count = bucket['doc_count']

            result.append({
                "id" : operator_id,
                "count": count
            })

        return result


class AggregateResult:
    def __init__(self, geo_hash_to_count, operator_to_count, kw_min_max, connection_type_to_count):

        self.geo_hash_to_count = geo_hash_to_count
        self.operator_to_count = operator_to_count
        self.kw_min_max = kw_min_max
        self.connection_type_to_count = connection_type_to_count
        

'''
    def upload_points(self, geo_points):
        actions = [
            {
                "_index": self.GEO_POINTS,
                "_type": "_doc",
                "_id": i,
                "_source": {
                    "location": [
                        str(geo_points.points[i].latitude),
                        str(geo_points.points[i].longitude)
                    ]
                }
            }
            for i in range(0, len(geo_points.points))
        ]

        self.es.bulk(self, actions)
'''
