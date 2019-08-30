
import unittest

from geo_distances import GeoDistances
from geo_types import GeoPoint

# Simple test point class with same API as clustering points


class TestPoint:

    def __init__(self, latitude, longitude):
        self.point = GeoPoint(latitude, longitude)

    def get_point(self):
        return self.point

    def __str__(self):
        return self.point.__str__()


class GeoDistancesTest(unittest.TestCase):

    def test_compute_distances(self):

        points = [TestPoint(24.01, 56.41), TestPoint(65.32, 90.87)]
        distances = GeoDistances.make_distances(points)
        self.assertEquals(distances.count(), 1)

    def test_remove_distances_with_points(self):

        a = TestPoint(24.01, 56.41)
        b = TestPoint(65.32, 90.87)
        c = TestPoint(45.23, -32.68)
        d = TestPoint(54.24, 56.46)
        e = TestPoint(-23.45, -48.85)
        f = TestPoint(34.5, 63.8)

        points = [a, b, c, d, e, f]

        distances = GeoDistances.make_distances(points)

        self.assertEquals(distances.count(), 15)

        to_remove = set([a, d, f])

        remaining = distances.remove_distances_with_points(to_remove)

        self.assertEquals(remaining.count(), 3)


if __name__ == '__main__':
    unittest.main()
