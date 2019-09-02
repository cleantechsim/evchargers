
from elasticsearch6 import Elasticsearch
import json


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

    def upload_points(self, geo_points):

        es_points = ''
        for i in range(0, len(geo_points.points)):
            es_points += '{"index":{"_id":' + \
                str(i + 1) + ', "_type":"_doc"}}\n'

            point = geo_points.points[i]
            es_points += '{"location":"' + \
                str(point.latitude) + ',' + str(point.longitude) + '"}\n'

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

        print('Got buckets ' +
              str(len(buckets)))

        return buckets

    def aggregate_points_with_filter(self, precision, geo_bounds):
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
                                "geohash_grid": {
                                    "field": self.field,
                                    "precision": precision
                                }
                            }
                        }
                    }
                }
            },
            params={"size": 0})

        # print('## got result ' + json.dumps(result))

        buckets = result['aggregations']['zoomed-in']['zoom1']['buckets']

        # print('Got buckets ' + str(len(buckets)))
        result = {}

        for bucket in buckets:
            geo_hash = bucket['key']
            count = bucket['doc_count']

            result[geo_hash] = count

        return result


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
