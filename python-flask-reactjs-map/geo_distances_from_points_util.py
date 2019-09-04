from haversine import haversine

from geo_distance import Distance


class GeoDistancesFromPointsUtil:

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

            distances.append(Distance(distance_km, outer, inner))

            count = count + 1

        return count
