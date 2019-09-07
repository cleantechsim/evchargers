
from utils import enter, exit, debug

from geo_distances_group_points import GeoDistancesGroupPoints
from geo_distances_from_points_util import GeoDistancesFromPointsUtil


class GeoDistancesFromPointsGrouping:

    def make_distances_with_max(self, indent, points, geo_bounds, max_km, add_distance_function):

        enter(indent, 'GeoDistancesFromPointsGrouping.make_distances_with_max', 'points=' + str(len(points)) +
              ' max_km=' + str(max_km))

        grouped_points = GeoDistancesGroupPoints.group_points(indent + 1,
                                                              points,
                                                              max_km)

        outer_count = 0

        items = grouped_points.items()

        if len(items) != len(points):
            raise 'Did not return mapping for all points'

        for point, close_points in items:

            if close_points != None and len(close_points) > 0:
                # Find the distances for all close points
                count = GeoDistancesFromPointsUtil.make_distance_from_outer(
                    point,
                    close_points,
                    0,
                    len(close_points),
                    max_km,
                    add_distance_function)

                outer_count = outer_count + count

        debug(indent, 'GeoDistancesFromPointsGrouping.make_distances_with_max',
              'found outer count ' + str(outer_count))

        exit(indent, 'GeoDistancesFromPointsGrouping.make_distances_with_max', None)
