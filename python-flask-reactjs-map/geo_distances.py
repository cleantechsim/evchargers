from haversine import haversine
import math

from utils import millis, enter, exit, debug, print_array_in_columns

from geo_distances_group_points import GeoDistancesGroupPoints

'''
For finding all distances between points and sorting those.
Useful for hierarchial clustering algorithm where we have to find which points can be merged
'''


class _Distance:

    def __init__(self, distance, from_point, to_point):
        self.distance = distance
        self.from_point = from_point
        self.to_point = to_point

    def get_distance(self):
        return self.distance

    def __str__(self):
        return '{ d=' + str(self.distance) + ', from=' + str(self.from_point) + ', to=' + str(self.to_point) + ' }'

    def __repr__(self):
        return self.__str__()


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

        grouped_points = GeoDistancesGroupPoints.group_points(indent + 1,
                                                              points,
                                                              max_km)

        all_distances = []

        outer_count = 0

        items = grouped_points.items()

        if len(items) != len(points):
            raise 'Did not return mapping for all points'

        for point, close_points in items:

            if close_points != None:
                # Find the distances for all close points
                count = GeoDistances._make_distance_from_outer(
                    point,
                    close_points,
                    0,
                    len(close_points),
                    all_distances)

                outer_count = outer_count + count

                # print('## found distances ' + str(count) +
                #       ' for ' + str(len(close_points)))

            # print('## adding ' + str(len(close_points)) +
            #      ' resulting in ' + str(len(all_distances)))

        debug(indent, 'GeoDistances.make_distances_with_max',
              'found outer count ' + str(outer_count))

        result = GeoDistances(all_distances)

        exit(indent, 'GeoDistances.make_distances_with_max',
             str(result.count()))

        return result

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
            GeoDistances._make_distance_from_outer(outer,
                                                   points,
                                                   i + 1,
                                                   length,
                                                   distances)

        if debug:
            print('Number of distances ' + str(len(distances)) +
                  ', took ' + str(millis() - time))

        return distances

    @staticmethod
    def _make_distance_from_outer(outer, points, range_start, range_length, distances):

        count = 0
        for j in range(range_start, range_length):

            inner = points[j]

            # skip if comparing to same
            if (outer is inner):
                continue

            # find geographical distance

            outer_point = outer.get_point()
            inner_point = inner.get_point()

            distance_km = haversine(
                outer_point.to_tuple(), inner_point.to_tuple())

            # print('## distance ' + str(distance_km))

            distances.append(_Distance(distance_km, outer, inner))

            count = count + 1

        return count

    @staticmethod
    def _sort_distances_array(distances):
        # sort the distances by shortest first
        distances.sort(key=_Distance.get_distance)
