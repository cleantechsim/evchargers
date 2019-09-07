
from utils import enter, exit, debug, set_debug, float_gt, float_lt

from geo_types import GeoBounds

from geo_distances_from_points_util import GeoDistancesFromPointsUtil
from geo_distances_from_points_grouping import GeoDistancesFromPointsGrouping
from haversine import haversine

from geo_utils import validate_latitude, validate_longitude, find_longitude_distance, verify_distances_and_not_close_points

'''
Find all distances below max for a number of points by sorting into buckets on latitude,
then nested buckets for longitude.

 - points may be sorted in a bucket and neighbouring one if closer than max_km
 - buckets are 3 times larger than max distance to increase chance of being in ony one bucket
'''

BUCKET_DISTANCE_FACTOR = 3

DEBUG_COMPUTE_FACTORS = False
DEBUG_ADD_TO_BUCKET = False
DEBUG_LATITUDE_BUCKETS = False
DEBUG_LONGITUDE_BUCKETS = False


class GeoDistancesFromPointsBuckets:

    def __init__(self):

        self.distances_from_points_one_bucket = GeoDistancesFromPointsGrouping()

    @staticmethod
    def _adjust_bounds(points, geo_bounds):
        min_latitude = 90
        max_latitude = -90

        min_longitude = 180
        max_longitude = -180

        for point in points:
            latitude = point.get_point().latitude
            longitude = point.get_point().longitude

            if latitude < min_latitude:
                min_latitude = latitude

            if latitude > max_latitude:
                max_latitude = latitude

            if longitude < min_longitude:
                min_longitude = longitude

            if longitude > max_longitude:
                max_longitude = longitude

        if max_latitude - geo_bounds.top() > 1:
            raise Exception('')

        if max_longitude - geo_bounds.right() > 1:
            raise Exception('')

        height = max_latitude - min_latitude
        width = max_longitude - min_longitude

        if height - geo_bounds.height() > 1:
            raise Exception('')

        if width - geo_bounds.width() > 1:
            raise Exception('')

        adjusted_bounds = GeoBounds(
            max_latitude,
            min_longitude,
            height,
            width)

        return adjusted_bounds

    def make_distances_with_max(self, indent, points, geo_bounds, max_distance_km, add_distance_function):

        adjusted_bounds = GeoDistancesFromPointsBuckets._adjust_bounds(
            points, geo_bounds)

        debug_value = set_debug(False)

        enter(indent, 'GeoDistancesFromPointsBuckets.make_distances_with_max', 'points=' + str(len(points)) +
              ' max_km=' + str(max_distance_km))

        latitude_buckets = _LatitudeBuckets(
            indent + 1,
            adjusted_bounds.top(),
            adjusted_bounds.bottom(),
            adjusted_bounds.right(),
            adjusted_bounds.left(),
            max_distance_km)

        for point in points:
            latitude_buckets.index(indent + 1, point)

        '''
        verify_points = True

        verified_points_set = set()

        if verify_points:
            latitude_buckets.for_each_inner_bucket(
                lambda points: GeoDistancesFromPointsBuckets._collect_points(points, verified_points_set))

        if len(points) != len(verified_points_set):
            raise Exception('Mismatch in points added ' + str(len(points)) +
                            '/' + str(len(verified_points_set)))
        '''

        all_distances = set()
        # points_added_set = set()

        latitude_buckets.for_each_inner_bucket(
            lambda points: self._add_point_combinations(
                indent + 1,
                points,
                max_distance_km,
                add_distance_function))

        # points_with_no_close_points = []

        print('## got points ' + str(len(points)))

        exit(indent, 'GeoDistancesFromPointsBuckets.make_distances_with_max',
             str(len(all_distances)))

        '''
        verify_distances_and_not_close_points(
            len(points),
            all_distances,
            points_with_no_close_points)

        '''

        set_debug(debug_value)

    @staticmethod
    def _collect_points(points, points_set):
        for point in points:
            points_set.add(point)

    def _add_point_combinations(self, indent, points, max_distance_km, add_distance_function):

        enter(indent, '_add_point_combinations',
              'points=' + str(len(points))
              #                 +
              #                 ', points_added_set' + str(len(points_added_set)))
              )

        self.distances_from_points_one_bucket.make_distances_with_max(
            indent + 1,
            points,
            None,
            max_distance_km,
            add_distance_function
        )

        exit(indent, '_add_point_combinations',
             'total_added=' + str(len(points)))


class _LatitudeBuckets:

    def __init__(self, indent, max_latitude, min_latitude, max_longitude, min_longitude, max_distance_km):
        if DEBUG_LATITUDE_BUCKETS:
            enter(indent, '_LatitudeBuckets.__init__',
                  'max_latitude=' + str(max_latitude) + ', min_latitude=' + str(min_latitude) +
                  ', max_longitude=' + str(max_longitude) + ', min_longitude=' + str(min_longitude))

        if max_latitude < min_latitude:
            raise Exception('max_latitude < min_latitude')

        self.max_latitude = max_latitude
        self.min_latitude = min_latitude
        self.max_distance_km = max_distance_km

        total_kms_latitude = haversine(
            (min_latitude, 0),
            (max_latitude, 0)
        )

        self.kms_per_bucket, self.num_buckets, self.degrees_per_bucket = _compute_factors(
            indent + 1,
            max_latitude,
            min_latitude,
            total_kms_latitude,
            max_distance_km
        )

        total_degrees = max_latitude - min_latitude
        covered_degrees = self.num_buckets * self.degrees_per_bucket
        if covered_degrees < total_degrees:
            raise Exception(
                'Does not cover all latitudes covered_degrees=' + str(covered_degrees))

        self.buckets = []

        bucket_max_latitude = max_latitude

        for i in range(0, self.num_buckets):
            bucket_min_latitude = bucket_max_latitude - self.degrees_per_bucket

            bucket = _LatitudeBucket(
                indent + 1,
                bucket_max_latitude,
                bucket_min_latitude,
                max_longitude,
                min_longitude,
                max_distance_km
            )
            self.buckets.append(bucket)

            bucket_max_latitude = bucket_max_latitude - self.degrees_per_bucket

            i

        if DEBUG_LATITUDE_BUCKETS:
            exit(indent, '_LatitudeBuckets.__init__', None)

    def index(self, indent, point):

        latitude = point.get_point().latitude

        if float_gt(latitude, self.max_latitude):
            raise Exception('latitude > max_latitude')

        if float_lt(latitude, self.min_latitude):
            raise Exception('latitude < min_latitude')

        kms_per_degree_latitude = 112

        diff = self.max_latitude - latitude

        _add_to_bucket(
            indent + 1,
            'latitude',
            point,
            self.buckets,
            self.num_buckets,
            self.degrees_per_bucket,
            diff,
            kms_per_degree_latitude,
            self.max_distance_km,
            lambda last_bucket: last_bucket.min_latitude - latitude,
            lambda next_bucket: latitude - next_bucket.max_latitude)

    def for_each_inner_bucket(self, function):

        for bucket in self.buckets:
            bucket.for_each_inner_bucket(function)


class _LatitudeBucket:

    def __init__(self, indent, max_latitude, min_latitude, max_longitude, min_longitude, max_distance_km):

        if DEBUG_LATITUDE_BUCKETS:
            enter(indent, '_LatitudeBucket.__init__',
                  'max_latitude=' + str(max_latitude) + ', min_latitude=' + str(min_latitude) +
                  ', max_longitude=' + str(max_longitude) + ', min_longitude=' + str(min_longitude) +
                  ', max_distance_km=' + str(max_distance_km))

        validate_latitude(max_latitude)
        validate_latitude(min_latitude)

        if max_latitude < min_latitude:
            raise Exception('max_latitude < min_latitude')

        self.max_latitude = max_latitude
        self.min_latitude = min_latitude

        self.longitude_buckets = _LongitudeBuckets(
            indent + 1,
            (max_latitude + min_latitude) / 2,
            max_longitude,
            min_longitude,
            max_distance_km)

        if DEBUG_LATITUDE_BUCKETS:
            exit(indent, '_LatitudeBucket.__init__', None)

    def add(self, indent, point):
        self.longitude_buckets.index(indent, point)

    def for_each_inner_bucket(self, function):

        self.longitude_buckets.for_each_inner_bucket(function)

    def __str__(self):
        return 'max_latitude=' + str(self.max_latitude) + ', min_latitude=' + str(self.min_latitude)


class _LongitudeBuckets:

    def __init__(self, indent, latitude, max_longitude, min_longitude, max_distance_km):

        if DEBUG_LONGITUDE_BUCKETS:
            enter(indent, '_LongitudeBuckets.__init__',
                  'latitude=' + str(latitude) +
                  ', max_longitude=' + str(max_longitude) + ', min_longitude=' + str(min_longitude) +
                  ', max_distance_km=' + str(max_distance_km))

        validate_latitude(latitude)

        validate_longitude(max_longitude)
        validate_longitude(min_longitude)

        if max_longitude < min_longitude:
            raise Exception('max_longitude < min_longitude')

        self.max_longitude = max_longitude
        self.min_longitude = min_longitude

        self.max_distance_km = max_distance_km

        total_kms_longitude = find_longitude_distance(
            latitude, min_longitude, max_longitude)

        self.kms_per_bucket, self.num_buckets, self.degrees_per_bucket = _compute_factors(
            indent + 1,
            max_longitude,
            min_longitude,
            total_kms_longitude,
            max_distance_km
        )

        self.kms_per_degree_longitude = haversine(
            (latitude, 0),
            (latitude, 1))

        self.buckets = []

        bucket_max_longitude = max_longitude
        for i in range(0, self.num_buckets):
            bucket_min_longitude = bucket_max_longitude - self.degrees_per_bucket

            bucket = _LongitudeBucket(
                indent + 1,
                bucket_max_longitude,
                bucket_min_longitude
            )
            self.buckets.append(bucket)

            bucket_max_longitude = bucket_max_longitude - self.degrees_per_bucket

            i

        if DEBUG_LONGITUDE_BUCKETS:
            exit(indent, '_LongitudeBuckets.__init__', None)

    def index(self, indent, point):
        longitude = point.get_point().longitude

        if float_gt(longitude, self.max_longitude):
            raise Exception('longitude > max_longitude')

        if float_lt(longitude, self.min_longitude):
            raise Exception('longitude < min_longitude')

        validate_longitude(longitude)

        diff = self.max_longitude - longitude

        if float_lt(diff, 0):
            raise Exception('diff < 0')

        _add_to_bucket(
            indent + 1,
            'longitude',
            point,
            self.buckets,
            self.num_buckets,
            self.degrees_per_bucket,
            diff,
            self.kms_per_degree_longitude,
            self.max_distance_km,
            lambda last_bucket: last_bucket.min_longitude - longitude,
            lambda next_bucket: longitude - next_bucket.max_longitude)

    def for_each_inner_bucket(self, function):

        for bucket in self.buckets:

            function(bucket.points)


class _LongitudeBucket:

    def __init__(self, indent, max_longitude, min_longitude):

        if DEBUG_LONGITUDE_BUCKETS:
            enter(indent, '_LongitudeBucket.__init__',
                  'max_longitude=' + str(max_longitude) + ', min_longitude=' + str(min_longitude))

        validate_longitude(max_longitude)
        validate_longitude(min_longitude)

        if max_longitude < min_longitude:
            raise Exception('max_longitude < min_longitude')

        self.max_longitude = max_longitude
        self.min_longitude = min_longitude

        self.points = []

        if DEBUG_LONGITUDE_BUCKETS:
            exit(indent, '_LongitudeBucket.__init__', None)

    def add(self, indent, point):
        self.points.append(point)

    def __str__(self):
        return 'max_longitude=' + str(self.max_longitude) + ', min_longitude=' + str(self.min_longitude)


def _compute_factors(indent, max_degrees, min_degrees, total_kms, max_distance_km):

    if DEBUG_COMPUTE_FACTORS:
        enter(indent, '_compute_factors',
              'max_degrees=' + str(max_degrees) + ', min_degrees=' + str(min_degrees) +
              ', total_kms=' + str(total_kms) + ', max_distance_km=' + str(max_distance_km))

    kms_per_bucket = max_distance_km * BUCKET_DISTANCE_FACTOR
    num_buckets = int(total_kms / kms_per_bucket)

    # Extra bucket if had to round
    if total_kms > num_buckets * kms_per_bucket:
        num_buckets = num_buckets + 1

    degrees_per_bucket = (max_degrees - min_degrees) / float(num_buckets)

    if DEBUG_COMPUTE_FACTORS:
        exit(indent, '_compute_factors',
             'kms_per_bucket=' + str(kms_per_bucket) +
             ', num_buckets=' + str(num_buckets) +
             ', degrees_per_bucket=' + str(degrees_per_bucket))

    return kms_per_bucket, num_buckets, degrees_per_bucket


def _add_to_bucket(
    indent,
    caller,
    point,
    buckets,
    num_buckets,
    degrees_per_bucket,
    diff_degrees,
    kms_per_degree,
    max_distance_km,
    get_distance_last_degrees,
    get_distance_next_degrees


):

    main_bucket_index = int(diff_degrees / degrees_per_bucket)

    if degrees_per_bucket * len(buckets) == diff_degrees:
        # exactly at end of last bucket
        main_bucket_index = main_bucket_index - 1

    if main_bucket_index >= len(buckets):
        raise Exception('Index out of range ' +
                        str(main_bucket_index) + '/' +
                        str(len(buckets)) + '/' +
                        str(diff_degrees) + '/' +
                        str(degrees_per_bucket))

    debug_str = caller + ' index ' + str(main_bucket_index)
    debug_str = debug_str + ' diff=' + str(diff_degrees)
    debug_str = debug_str + ' per_bucket=' + str(degrees_per_bucket)

    if main_bucket_index > 0:

        last_bucket = buckets[main_bucket_index - 1]

        distance_last_degrees = get_distance_last_degrees(last_bucket)

        if distance_last_degrees < 0:
            raise Exception('distance_last_degrees < 0')

        distance_to_last_kms = distance_last_degrees * kms_per_degree

        debug_str = debug_str + ' last ' + str(distance_to_last_kms)

        # Add to previous bucket too?
        # 1.15 for some safety margin
        if (0.90 * distance_to_last_kms) < max_distance_km:
            debug_str = debug_str + ' add_last'
            last_bucket.add(indent, point)

    if main_bucket_index < num_buckets - 1:
        next_bucket = buckets[main_bucket_index + 1]

#        print ('## add to bucket ' + str(next_bucket) +
#               '/' + str(main_bucket_index + 1))
        distance_next_degrees = get_distance_next_degrees(next_bucket)

        if distance_next_degrees < 0:
            raise Exception('distance_next_degrees < 0')

        distance_to_next_kms = distance_next_degrees * kms_per_degree

        debug_str = debug_str + ' next ' + str(distance_to_next_kms)

        if (0.90 * distance_to_next_kms) < max_distance_km:
            debug_str = debug_str + ' add_next'
            next_bucket.add(indent, point)

    if DEBUG_ADD_TO_BUCKET:
        debug(indent, '_add_to_bucket', debug_str)

    # add to main index
    buckets[main_bucket_index].add(indent, point)
