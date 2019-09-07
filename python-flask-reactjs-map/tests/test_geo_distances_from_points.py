
import unittest

from haversine import haversine

from utils import millis
from geo_types import GeoBounds, GeoPoint
from geo_point_gen import GeoPointGen
from geo_clustering.geo_distance import Distance
from geo_clustering.geo_distances_from_points_buckets import GeoDistancesFromPointsBuckets
from geo_clustering.geo_distances_from_points_grouping import GeoDistancesFromPointsGrouping
from geo_clustering.geo_distances_from_points_combinatorial import GeoDistancesFromPointsCombinatorial
from test_point import TestPoint


class GeoDistancesFromPointsTest(unittest.TestCase):

    def setUp(self):
        self.geo_distances_algorithms = {
            'buckets': GeoDistancesFromPointsBuckets(),
            'grouping': GeoDistancesFromPointsGrouping(),
            # 'combinatorial': GeoDistancesFromPointsCombinatorial()
        }

        self.world_bounds = GeoBounds(90, -180, 180, 360)

    def test_with_random_data(self):

        geo_bounds = self.world_bounds

        self.check_with_random_data(3500, geo_bounds, 2000)

    def check_with_random_data(self, num_points, geo_bounds, max_diameter_km):

        gen = GeoPointGen.generate_with_bounds(num_points, geo_bounds)

        points = make_test_points(gen.points)

        results = {}

        for algorithm_name, implementation in self.geo_distances_algorithms.items():

            start = millis()

            all_distances = []

            implementation.make_distances_with_max(
                0,
                points,
                geo_bounds,
                max_diameter_km,
                lambda distance: all_distances.append(distance))

            points_set = set()
            all_distances.sort()

            results[algorithm_name] = _Result(points_set, all_distances)

            print('Executed ' + algorithm_name +
                  ' in ' + str(millis() - start) +
                  ', got ' + str(len(all_distances)))

    def test_correctness(self):

        geo_bounds = self.world_bounds

        point1 = TestPoint(0, 15)
        point2 = TestPoint(-10, 0)
        point3 = TestPoint(-11, 14)

        points = [
            point1,
            point2,
            point3
        ]

        expected_distances = [
            make_distance(point1, point2),
            make_distance(point1, point3),
            make_distance(point2, point3)
        ]

        for algorithm_name, implementation in self.geo_distances_algorithms.items():

            all_distances, points_with_no_close_points = implementation.make_distances_with_max(
                0,
                points,
                geo_bounds,
                2000)

            print('Executed ' + algorithm_name +
                  ', got ' + str(len(all_distances)) + '/' + str(len(points_with_no_close_points)))

            for distance in all_distances:
                print('produced distance ' + str(distance))

            for point in points_with_no_close_points:
                print('points with no close points ' + str(point))

            self.assertEquals(len(expected_distances), len(all_distances))
            self.assertEquals(0, len(points_with_no_close_points))


def make_distance(point, other):

    d = haversine(
        (
            point.get_point().latitude,
            point.get_point().longitude
        ),
        (
            other.get_point().latitude,
            other.get_point().longitude
        )
    )

    return Distance(d, point, other)


def make_test_points(geo_points):
    points = []

    for geo_point in geo_points:
        points.append(TestPoint(geo_point.latitude, geo_point.longitude))

    return points


class _Result:

    def __init__(self, distances_sorted, points_set):

        self.distances_sorted = distances_sorted
        self.points_set = points_set


if __name__ == '__main__':
    unittest.main()
