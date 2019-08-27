from haversine import haversine

from utils import enter, exit, debug


class GeoDistancesGroupPoints:

    @staticmethod
    def group_points(indent, points, max_km):

        enter(indent, 'GeoDistancesGroupPoints.group_points', 'points=' + str(len(points)) +
              ', max_km=' + str(max_km))

        # Sort the points by latitude
        sorted_by_latitude = [] + points

        sorted_by_latitude.sort(GeoDistancesGroupPoints._point_by_latitude)

        # Have all points sorted by latitude, create list of lists for all points
        # that are latitude-wise less than max_km away from each point
        points_to_close_points = {}

        num_points = len(sorted_by_latitude)

        # max_degrees is the number of degrees that is the max diff from a point
        # one degreee is between 110 and 112 km, set to 100 for good measure
        # so get a higher value for degrees to be on safe side
        max_degrees = max_km / 100.0

        total = 0

        for i in range(0, num_points):

            point = sorted_by_latitude[i]
            geo_point = point.get_point()

            latitude = geo_point.latitude

            one_longitude_degree_km = haversine((latitude, 0), (latitude, 1))

            close_points = None

            '''
                        close_points, up_iter = GeoDistancesGroupPoints._add_if_close(
                            sorted_by_latitude,
                            max_degrees,
                            max_km,
                            i - 1, -1, -1,
                            geo_point,
                            one_longitude_degree_km,
                            close_points)
            '''

            close_points, down_iter = GeoDistancesGroupPoints._add_if_close(
                sorted_by_latitude,
                max_degrees,
                max_km,
                i + 1, num_points, 1,
                geo_point,
                one_longitude_degree_km,
                close_points)

            points_to_close_points[point] = close_points

            total = total + down_iter  # up_iter + down_iter

            # debug(indent, '', 'filtered through ' +
            #      str(total) + ' inner iterations')

            # Now has sorted points with candidates where distance might apply
            if False:
                for i in range(0, num_points):
                    point = sorted_by_latitude[i]

                    if not points_to_close_points.has_key(point):
                        debug(indent, 'GeoDistanceGroupPoints.group_points',
                              'Unknown key ' + str(point))
                    else:

                        found_points = points_to_close_points[point]

                        points_len = found_points = 0 if found_points == None else len(
                            found_points)

                        debug(indent, 'GeoDistanceGroupPoints.group_points', 'sorted points at ' + str(i) + ' ' +
                              str(points_len))

        exit(indent, 'GeoDistancesGroupPoints.group_points',
             str(len(points_to_close_points)))

        return points_to_close_points

    @staticmethod
    def _add_if_close(
        sorted_by_latitude,
        max_degrees_latitude,
        max_km,
        range_start,
        range_end,
        range_step,
        geo_point,
        one_longitude_degree_km,
        close_points
    ):
        latitude = geo_point.latitude
        latitude_plus_90 = latitude + 90.0

        longitude = geo_point.longitude
        longitude_plus_180 = longitude + 180.0

        count = 0

        for j in range(range_start, range_end, range_step):

            count = count + 1

            other = sorted_by_latitude[j]
            other_latitude_plus_90 = other.get_point(
            ).latitude + 90.0

            latitude_diff = GeoDistancesGroupPoints._diff(latitude_plus_90,
                                                          other_latitude_plus_90)

            if latitude_diff < max_degrees_latitude:

                # print('## match at ' + str(j) + ' / ' + str(latitude_diff))

                other_longitude = other.get_point().longitude
                other_longitude_plus_180 = other_longitude + 180.0

                longitude_diff = GeoDistancesGroupPoints._diff(longitude_plus_180,
                                                               other_longitude_plus_180)

                longitude_diff_km = longitude_diff * one_longitude_degree_km

                if longitude_diff_km < max_km:
                    if close_points == None:
                        close_points = []

                    close_points.append(other)

            else:
                break

        return close_points, count

    @staticmethod
    def _point_by_latitude(point, other):

        # add 90 to latitude for avoiding positive /negative around equator
        pl = point.get_point().latitude + 90.0
        ol = other.get_point().latitude + 90.0

        if pl < ol:
            result = -1
        elif pl > ol:
            result = 1
        else:
            result = 0

        # Sort descending order
        return -result

    @staticmethod
    def _diff(val, other):
        return val - other if other < val else other - val
