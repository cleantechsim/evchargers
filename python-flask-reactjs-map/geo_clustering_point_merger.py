
from geo_types import GeoPoint

from utils import enter, exit, debug


class _MergedClusteringPoint:

    def __init__(self, from_point, to_point):
        self.count = from_point.count + to_point.count

        self.from_point = from_point
        self.to_point = to_point

        # Compute mid point weighted for count
        self.mid_point = _MergedClusteringPoint._compute_mid_point(
            from_point, to_point)

    def get_point(self):
        return self.mid_point

    def __str__(self):
        return self.get_point().__str__()

    def __repr__(self):
        return self.__str__()

    @staticmethod
    def _compute_mid_point(from_point, to_point):

        fp = from_point.get_point()
        tp = to_point.get_point()

        # Multiply by count for weighting
        from_latitude = fp.latitude * from_point.count
        from_longitude = fp.longitude * from_point.count

        to_latitude = tp.latitude * to_point.count
        to_longitude = tp.longitude * to_point.count

        sum_count = from_point.count + to_point.count

        computed_latitude = (from_latitude + to_latitude) / sum_count
        computed_longitude = (from_longitude + to_longitude) / sum_count

        return GeoPoint(computed_latitude, computed_longitude)


'''

Helper class for merging a series of points from distances below a certain max

'''


class GeoClusteringPointMerger:

    @staticmethod
    def merge_points_with_distances_below_max(indent, distances, max_diameter_km):

        enter(indent, 'GeoClusteringPointMerger.merge_points_with_distances_below_max',
              'distances=' + str(distances.count()))

        # List of only the points that have shorter distance than max
        distances_below_max = distances.find_below_max(max_diameter_km)

        debug(indent, 'GeoClusteringPointMerger.merge_points_with_distances_below_max', 'Got distances below max ' +
              str(distances_below_max.count()))

        # Merge those distance points, and return a set of removed points from merged distances
        merged_points, removed_points = GeoClusteringPointMerger._merge_distances(
            distances_below_max)

        debug(indent, 'GeoClusteringPointMerger.merge_points_with_distances_below_max', 'after merging got merged ' + str(len(merged_points)) + ', removed ' +
              str(len(removed_points)))

        updated_distances = distances.remove_distances_with_points(
            removed_points)

        debug(indent, 'GeoClusteringPointMerger.merge_points_with_distances_below_max',
              'removing points from ' + str(distances.count()) + ' to ' + str(updated_distances.count()))

        exit(indent, 'GeoClusteringPointMerger.merge_points_with_distances_below_max',
             'returning ' + str(len(merged_points)) + ' from ' + str(distances_below_max.count()))

        return merged_points, updated_distances

    @staticmethod
    def _merge_distances(distances, debug=False):

        distances_set = distances.to_set()
        merged_points = []
        removed_points = set()

        while len(distances_set) != 0:

            to_iterate = list(distances_set)

            for distance in to_iterate:
                # Can merge points unless one of them were already removed
                if distance.from_point in removed_points or distance.to_point in removed_points:
                    if debug:
                        print 'Already removed'

                    distances_set.remove(distance)
                else:
                    # Merge point and remove
                    removed_points.add(distance.from_point)
                    removed_points.add(distance.to_point)

                    distances_set.remove(distance)

                    merged = _MergedClusteringPoint(
                        distance.from_point,
                        distance.to_point)

                    merged_points.append(merged)

        if len(distances_set) != 0:
            raise Exception('Expected empty set')

        return merged_points, removed_points
