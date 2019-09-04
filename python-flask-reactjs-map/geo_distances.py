from haversine import haversine
import math

from utils import millis, enter, exit, debug, print_array_in_columns

from geo_distances_from_points_grouping import GeoDistancesFromPointsGrouping
from geo_distances_from_points_util import GeoDistancesFromPointsUtil
from geo_distance import Distance

'''
For finding all distances between points and sorting those.
Useful for hierarchial clustering algorithm where we have to find which points can be merged
'''


class GeoDistances:

    def __init__(self, distances):

        self.distances = distances
        self.sorted = False

    def __str__(self):
        return str(self.distances)

    def is_empty(self):
        return len(self.distances) == 0

    def count(self):
        return len(self.distances)

    def sort(self):
        GeoDistances._sort_distances_array(self.distances)
        self.sorted = True

    def to_set(self):
        return set(self.distances)

    def to_array(self):
        return [] + self.distances

    def get_distinct_points(self, indent):

        enter(indent, 'GeoDistances.get_distinct_points',
              'distances=' + str(len(self.distances)))

        points = set()

        for distance in self.distances:
            points.add(distance.from_point)
            points.add(distance.to_point)

        exit(indent, 'GeoDistances.get_distinct_points', str(len(points)))

        return points

    def print_distances(self, columns):
        print_array_in_columns(len(self.distances),
                               columns,
                               lambda i: str(self.distances[i].distance))

    '''
        Extract all distances below certain max and also return
        updated distances without any distances that refer to any of the removed points

    '''

    def find_below_max(self, max_distance_km):

        distances = []

        for distance in self.distances:
            if distance.distance < max_distance_km:
                distances.append(distance)
            else:
                if self.sorted:
                    break

        result = GeoDistances(distances)

        result.sorted = self.sorted

        return result

    def count_below_max(self, max_diameter_km):
        count = 0

        for distance in self.distances:
            if distance.distance < max_diameter_km:
                count = count + 1

        return count

    def merge(self, distances):

        if not isinstance(distances, GeoDistances):
            raise Exception('Expected distances ' + str(type(distances)))

        return self.merge_list(distances.distances)

    def merge_list(self, distances_array):

        if not type(distances_array) is list:
            raise Exception('Expected array ' + str(type(distances_array)))

        return GeoDistances(self.distances + distances_array)

    '''
        Return an updated object with removed any
        distances that contain the passed in points

    '''

    def remove_distances_with_points(self, points):

        if not type(points) is set:
            raise Exception('Expected set ' + str(type(points)))

        updated = []

        # Must check point if any of from or to point has been merged, if so must be removed
        # print('## found exit distance at ' + str(distance.distance))

        for distance in self.distances:
            contains_point = distance.from_point in points or distance.to_point in points

            if not contains_point:
                updated.append(distance)

        return GeoDistances(updated)

    @staticmethod
    def make_distances_with_max(indent, points, max_km):
        enter(indent, 'GeoDistances.make_distances_with_max', 'points=' + str(len(points)) +
              ' max_km=' + str(max_km))

        all_distances, points_with_no_close_points = GeoDistancesFromPointsGrouping.make_distances_with_max(
            indent + 1,
            points,
            max_km)

        distances = GeoDistances(all_distances)

        exit(indent, 'GeoDistances.make_distances_with_max',
             str(distances.count()) + '/' + str(len(points_with_no_close_points)))

        return distances, points_with_no_close_points

    @staticmethod
    def make_distances(points, debug=False):
        return GeoDistances(GeoDistances._make_distances_array(points, debug))

    @staticmethod
    def _make_distances_array(points, debug=False):

        if debug:
            time = millis()

        distances = []

        length = len(points)

        # Combinatorics: Unordered samples without replacement
        # (1, 2) and (2, 1) is the same sample and should not reuse same number in samples
        for i in range(0, length):
            outer = points[i]

            # Must find distances between all geo hashes
            GeoDistancesFromPointsUtil._make_distance_from_outer(outer,
                                                                 points,
                                                                 i + 1,
                                                                 length,
                                                                 distances)

        if debug:
            print('Number of distances ' + str(len(distances)) +
                  ', took ' + str(millis() - time))

        return distances

    @staticmethod
    def _sort_distances_array(distances):
        # sort the distances by shortest first
        distances.sort(key=Distance.get_distance)
