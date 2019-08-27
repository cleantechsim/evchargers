
import unittest

from geo_distances import GeoDistances
from geo_types import GeoPoint

# Simple test point class with same API as clustering points


class TestPoint:

    def __init__(self, latitude, longitude):
        self.point = GeoPoint(latitude, longitude)

    def get_point(self):
        return self.point


class GeoDistancesTest(unittest.TestCase):

    def test_compute_distances(self):

        points = [TestPoint(24.01, 56.41), TestPoint(65.32, 90.87)]
        distances = GeoDistances.make_distances(points)
        self.assertEquals(distances.count(), 1)


if __name__ == '__main__':
    unittest.main()
