# Algorithm for clustering points, based on hierachial clustering of geohashed buckets from Elasticsearch

from geo_hash import GeoHash
from geo_types import GeoPoint, GeoBounds

from c.geo_clustering_c import merge_aggregations_c

from utils import enter, exit, debug

import json

# Abstract class for clustering points

'''
class _ClusteringPoint:

    def __init__(self, count):
        self.count = count

    def get_point(self):
        raise 'abstract method'
'''


class _SearchResultClusteringPoint:  # (_ClusteringPoint):

    def __init__(self, geo_hash, count):
        # super(_SearchResultClusteringPoint, self).__init__()

        self.decoded_hash = GeoHash.decode(geo_hash)

        self.count = count

    def get_point(self):
        return self.decoded_hash.value

    def __str__(self):
        return self.get_point().__str__()

    def __repr__(self):
        return self.__str__


class GeoClustering:

    def compute_clusters(self, indent, geo_sw_ne, max_diameter_km, geo_hash_aggregations):

        geo_bounds = geo_sw_ne.to_geo_bounds()

        enter(indent, 'GeoClustering.compute_clusters', '')

        result = self.compute_clusters_with_geohash_precision(
            indent + 1,
            max_diameter_km,
            geo_sw_ne.to_geo_bounds(),
            geo_hash_aggregations)

        exit(indent, 'GeoClustering.compute_clusters', '')

        return result

    # Computes clusters using elasticsearch geohashing
    #
    # Uses hierarchial clustering by finding distance from one point to any other and sort by shortes distance first, then merging these
    # Hierarchial clustering is good for returning the same result on every run since we sort results by distance between points
    #
    # This could be an expensive operation but we do the following to optimize

    # - retrieve geohash cluster aggregations at a higher precision from Elasticsearch so we already operate on groups
    #   we then find distances between the center of these and the mean distance, weighted by the number of points in the hashed clusters
    # - when looking for distances between geohash cluster aggregations from Elasticsearch, we only care about geohashes that are
    #   in the vicinity of the one we are finding distances from, given by max_radius_meters param. This because when showing clusters on a map,
    #   we will not have clusters larger than a certain amount of pixels on the screen (the minimum amount of pixels/meters on map
    #   it takes to show a cluster marker without overlap)

    def compute_clusters_with_geohash_precision(
            self,
            indent,
            max_diameter_km,
            geo_bounds,
            geo_hash_aggregations):

        enter(indent, 'GeoClustering.compute_clusters_with_geohash_precision', '')

        # Get data from ES at more precise level but still aggregated
        # so that are fewer points to get distance between

        debug(indent, 'GeoClustering.compute_clusters_with_geohash_precision', 'geo hash aggregations returned from ElasticSearch ' +
              str(len(geo_hash_aggregations)))

        # Result is geo hash string to count, decode into separate map
        decoded_hashes = {}

        # Create initial array of all points from Elasticsearch result
        points = []

        for key, value in geo_hash_aggregations.items():
            points.append(_SearchResultClusteringPoint(key, value))

        for hash in geo_hash_aggregations.keys():
            decoded_hashes[hash] = GeoHash.decode(hash)

        if len(points) > 0:
            points = merge_aggregations_c(
                "geo_clustering.c.merged_point",
                "MergedPoint",
                points,
                max_diameter_km)

        exit(indent, 'GeoClustering.compute_clusters_with_geohash_precision', str(
            len(points)))

        return points
