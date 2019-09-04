
import unittest

from geo_distance import Distance
from geo_point_gen import GeoPointGen

from haversine import haversine


class DistanceTest(unittest.TestCase):

    def test_points(self):

        gen = GeoPointGen.generate_with_world_bounds(3)

        points = gen.points

        distance_list = []

        for iteration in range(0, 100):
            for i in range(0, len(points) - 1):
                for j in range(i + 1, len(points)):
                    d = haversine(
                        (points[i].latitude, points[i].longitude),
                        (points[j].latitude, points[j].longitude)
                    )

                    distance = Distance(d, points[i], points[j])

                    distance_list.append(distance)

            iteration

        self.assertEquals(300, len(distance_list))

        distance_set = set(distance_list)

        self.assertEquals(3, len(distance_set))


if __name__ == '__main__':
    unittest.main()
