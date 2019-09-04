from haversine import haversine

from geo_distance import Distance


class GeoDistancesFromPointsUtil:

    @staticmethod
    def _make_distance_from_outer(outer, points, range_start, range_length, max_distance_to_append, distances):

        appended = 0
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

            if max_distance_to_append != None and distance_km <= max_distance_to_append:
                distances.append(Distance(distance_km, outer, inner))

                appended = appended + 1

        return appended
