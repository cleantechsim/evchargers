# Algorithm for clustering points, based on hierachial clustering of geohashed buckets from Elasticsearch

from geo_hash import GeoHash
from geo_types import GeoPoint, GeoBounds
from geo_hash_precision_finder import GeoHashPrecisionFinder
from geo_distances import GeoDistances
from geo_clustering_point_merger import GeoClusteringPointMerger

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

    def __init__(self, es):
        self.es = es

    def compute_clusters(self, indent, max_diameter_km, geo_sw_ne):

        enter(indent, 'GeoClustering.compute_clusters', '')

        geo_bounds = geo_sw_ne.to_geo_bounds()

        cur_geohash_precision = GeoHashPrecisionFinder.find_geohash_precision_from_width_degrees(
            geo_bounds.width(),
            50
        )

        debug(indent, 'get_map_params', 'got precision ' + str(cur_geohash_precision) +
              ' for ' + str(geo_bounds.width))

        result = self.compute_clusters_with_geohash_precision(
            indent + 1,
            cur_geohash_precision,
            max_diameter_km,
            geo_sw_ne.to_geo_bounds())

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
            cur_geohash_precision,
            max_diameter_km,
            geo_bounds):

        enter(indent, 'GeoClustering.compute_clusters_with_geohash_precision', '')

        # Get data from ES at more precise level but still aggregated
        # so that are fewer points to get distance between

        geo_hash_aggregations = self.es.aggregate_points_with_filter(
            cur_geohash_precision, geo_bounds)

        debug(indent, 'GeoClustering.compute_clusters_with_geohash_precision', 'geo hash aggregations ' +
              str(len(geo_hash_aggregations)))

        debug(indent, 'GeoClustering.compute_clusters_with_geohash_precision', 'aggregations ' + str(type(geo_hash_aggregations)) +
              '/' + str(len(geo_hash_aggregations)))

        # Result is geo hash string to count, decode into separate map
        decoded_hashes = {}

        # Create initial array of all points from Elasticsearch result
        points = []

        for key, value in geo_hash_aggregations.items():
            points.append(_SearchResultClusteringPoint(key, value))

        for hash in geo_hash_aggregations.keys():
            decoded_hashes[hash] = GeoHash.decode(hash)

        points = GeoClustering.merge_aggregations(
            indent + 1,
            points,
            max_diameter_km)

        exit(indent, 'GeoClustering.compute_clusters_with_geohash_precision', str(
            len(points)))

        return points

    @staticmethod
    def merge_aggregations(indent, points, max_diameter_km):

        enter(indent, 'GeoClustering.merge_aggregations', '')

        distances = GeoDistances.make_distances_with_max(indent + 1,
                                                         points,
                                                         max_diameter_km)

        # Should merge points that are closer than specfied km

        # distances = GeoDistances.make_distances(points)

        debug(indent, 'GeoClustering.merge_aggregations',
              'made distances with max ' + str(distances.count()))

        done = False

        while not done:
            debug(indent, 'GeoClustering.merge_aggregations',
                  '---------- start of outer iteration ----------')

            distances.sort()

            merged_points, updated_distances = GeoClusteringPointMerger.merge_points_with_distances_below_max(
                indent,
                distances,
                max_diameter_km)

            if len(merged_points) == 0:
                done = True
                found_points = updated_distances.get_distinct_points(
                    indent + 1)

                debug(indent, 'GeoClustering.merge_aggregations',
                      'Iteration done, returning ' + str(len(found_points)))

            else:
                # Only compute distances for merged points since none merged are out of distance from anything else anyways
                distances_for_merged = GeoDistances.make_distances(
                    merged_points)

                # Add updated and merged
                distances = updated_distances.merge(distances_for_merged)

                debug(indent, 'GeoClustering.merge_aggregations', 'Added merged distances ' +
                      str(distances_for_merged.count()) + ' to ' + str(updated_distances.count()) + ' gives ' + str(distances.count()))

        exit(indent, 'GeoClustering.merge_aggregations', str(len(found_points)))

        return found_points
