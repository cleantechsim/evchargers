
from geo_distances_from_points_util import GeoDistancesFromPointsUtil


class GeoDistancesFromPointsCombinatorial:

    def make_distances_with_max(self, indent, points, geo_bounds, max_distance_km, add_distance_function):

        total_added = 0

        for i in range(0, len(points) - 1):
            point = points[i]

            num_points_added = GeoDistancesFromPointsUtil.make_distance_from_outer(
                point,
                points,
                i + 1,
                len(points),
                max_distance_km,
                add_distance_function
            )

            if num_points_added > 0:
                total_added = total_added + num_points_added
