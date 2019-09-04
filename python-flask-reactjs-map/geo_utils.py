from haversine import haversine


def validate_latitude(latitude):

    if latitude > 90.000000001:
        raise Exception('latitude > 90')

    if latitude < -90.000000001:
        raise Exception('latitude < -90')


def validate_longitude(longitude):

    if longitude > 180.00000001:
        raise Exception('longitude > 180')

    if longitude < -180.00000001:
        raise Exception('longitude < -180')


# Distance between min and max taking heed of situation where max - min
# is > 180 in case haversine finds distance 'on the other side of the globe' ie shortest distance

def find_longitude_distance(latitude, min_longitude, max_longitude):

    diff = max_longitude - min_longitude

    if diff < 180:
        distance = haversine(
            (latitude, min_longitude),
            (latitude, max_longitude)
        )

    else:
        distance_other_side_of_globe = haversine(
            (latitude, min_longitude),
            (latitude, max_longitude)
        )

        distance_round_globe = haversine((latitude, 0), (latitude, 180)) * 2

        distance = distance_round_globe - distance_other_side_of_globe

    return distance


def verify_distances_and_not_close_points(
        expected_number_of_points,
        all_distances,
        not_close_points):

    points_set = set()

    for distance in all_distances:
        points_set.add(distance.from_point)
        points_set.add(distance.to_point)

    for point in not_close_points:
        points_set.add(point)

    if expected_number_of_points != len(points_set):
        raise Exception('Number of points mismatch')


def find_points_with_no_close_points(points, distances):
    points_with_no_close_points = []
    points_added_set = set()

    for distance in distances:
        points_added_set.add(distance.from_point)
        points_added_set.add(distance.to_point)

    for point in points:
        if point not in points_added_set:
            points_with_no_close_points.append(point)

    return points_with_no_close_points
