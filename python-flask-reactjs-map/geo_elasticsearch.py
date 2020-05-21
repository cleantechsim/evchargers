
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

    def aggregate_search_with_filter(self, precision, geo_bounds, operators, kw_range):
        
        filters = []

        if operators and len(operators) > 0:

            operators_filter = {
                "terms" : {
                    "OperatorID" : operators
                }
            }

            filters.append(operators_filter)

        
        if kw_range:

            kw_range_filter = {
                "range" : {
                    "Connections.PowerKW" : { "gte" : kw_range.min, "lte" : kw_range.max }
                }
            }

            filters.append(kw_range_filter)


        num_filters = len(filters)

        if num_filters == 0:
            geo_hash_filter = { "match_all" }

        elif num_filters == 1:
            geo_hash_filter = filters[0]

        elif num_filters > 1:

            geo_hash_filter = {
                "bool" : {
                    "must" : []
                }
            }

            for filter in filters:
                geo_hash_filter['bool']['must'].append(filter)


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
                                "terms": {
                                    "field": "OperatorID",
                                    "size": 50
                                }
                            },
                            "missing-operators" : {
                                "missing" : { "field" : "OperatorID" }
                            },
                            "power-kw-min" : {
                                "min" : { "field" : "Connections.PowerKW" }
                            },
                            "power-kw-max" : {
                                # Filter out nonsense values, so highest max below 1000KW
                                "filter" : {
                                    "range" : { "Connections.PowerKW" : { "lte" : 1000 } }
                                },
                                "aggregations" : {
                                    "power-kw-max-filtered" : {
                                        "max" : { "field" : "Connections.PowerKW" }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            params={"size": 0})

        geo_hash_to_count = GeoElasticSearch._get_geo_hash_to_count(result)
        operator_to_count = GeoElasticSearch._operator_to_count(result)

        kw_min = result['aggregations']['zoomed-in']['power-kw-min']['value']
        kw_max = result['aggregations']['zoomed-in']['power-kw-max']['power-kw-max-filtered']['value']

        return AggregateResult(
            geo_hash_to_count,
            operator_to_count,
            Range(kw_min, kw_max))

    
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
        buckets = es_result['aggregations']['zoomed-in']['operators']['buckets']

        result = []

        for bucket in buckets:
            operator_id = bucket['key']
            count = bucket['doc_count']

            result.append({
                "id" : operator_id,
                "count": count
            })

        missing = es_result['aggregations']['zoomed-in']['missing-operators']
        
        count = int(missing['doc_count'])

        if count > 0:
            result.append({
                "count": count
            })

        return result


class AggregateResult:
    def __init__(self, geo_hash_to_count, operator_to_count, kw_min_max):

        self.geo_hash_to_count = geo_hash_to_count
        self.operator_to_count = operator_to_count
        self.kw_min_max = kw_min_max
        

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
