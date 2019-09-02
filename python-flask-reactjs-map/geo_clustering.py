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
            10
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

        debug(indent, 'GeoClustering.merge_aggregations',
              '--- first find all distances between points at max diameter of ' + str(max_diameter_km) + ' km')
        debug(indent, 'GeoClustering.merge_aggregations',
              '--- by checking latitude and longitude distances')

        distances = GeoDistances.make_distances_with_max(indent + 1,
                                                         points,
                                                         max_diameter_km)

        if False:
            distances.sort()
            distances.print_distances(5)

        # Should merge points that are closer than specfied km

        # distances = GeoDistances.make_distances(points)

        debug(indent, 'GeoClustering.merge_aggregations',
              'made distances ' + str(distances.count()))

        done = False

        debug(indent, '', '')

        debug(indent, 'GeoClustering.merge_aggregations',
              '--- group points together in outer and inner loop until no more points within max diameter')

        while not done:
            debug(indent, '', '')

            debug(indent, 'GeoClustering.merge_aggregations',
                  '--- at start of outer operation has ' + str(distances.count()) + ' to merge')

            # For each iteration, sort distances in ascending order
            distances.sort()

            # For any distances below max, merge this to merged (clustered) points and returned these (merged_points)
            # and all distances that were not merged
            merged_points, not_merged_distances = GeoClusteringPointMerger.merge_points_with_distances_below_max(
                indent + 1,
                distances,
                max_diameter_km)

            debug(indent, 'GeoClustering.merge_aggregations', 'got merged points ' +
                  str(len(merged_points)) + ', not merged distances ' + str(not_merged_distances.count()))

            if len(merged_points) == 0:
                # If no points were merged, we have merged all distances that are less than max_diameter_km in distance
                # not_merged_distances shall then contain all distances
                done = True
                found_points = not_merged_distances.get_distinct_points(
                    indent + 1)

                debug(indent, 'GeoClustering.merge_aggregations',
                      'Iteration done, returning ' + str(len(found_points)))

            else:
                # Only compute distances for merged points since none merged are out of distance from anything else anyways
                distances_for_merged = GeoDistances.make_distances(
                    merged_points)

                debug(indent, 'GeoClustering.merge_aggregations', 'Computed ' + str(
                    distances_for_merged.count()) + ' distances for merged from ' + str(len(merged_points)) + ' created merge points')

                # Add updated and merged
                distances = not_merged_distances.merge(distances_for_merged)

                debug(indent, 'GeoClustering.merge_aggregations', '--- added merged distances ' +
                      str(distances_for_merged.count()) + ' to not merged ' + str(not_merged_distances.count()) + ' gives ' + str(distances.count()))

        exit(indent, 'GeoClustering.merge_aggregations', str(len(found_points)))

        return found_points
