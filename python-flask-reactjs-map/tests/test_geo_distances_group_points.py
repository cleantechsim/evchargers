import unittest

from geo_point_gen import GeoPointGen
from geo_distances_group_points import GeoDistancesGroupPoints

from utils import millis

from test_point import TestPoint

from haversine import haversine


class GeoDistancesGroupPointsTest(unittest.TestCase):

    def test_group_a_few_points(self):

        gen = GeoPointGen.generate_with_world_bounds(1000)

        points = []

        start = millis()

        for i in range(0, len(gen.points) - 1):

            haversine(
                (gen.points[i].latitude, gen.points[i].longitude),
                (gen.points[i + 1].latitude, gen.points[i + 1].longitude)
            )

        print('haversine took ' + str(millis() - start))

        for geo_point in gen.points:
            points.append(TestPoint(geo_point.latitude, geo_point.longitude))

        start = millis()

        proximate_points_map = GeoDistancesGroupPoints.group_points(
            0, points, 1000)

        count = 0
        for value in proximate_points_map.values():
            if value != None:
                count = count + len(value)

        diff = millis() - start

        print('Took ' + str(diff) + ' milliseconds for ' +
              str(len(proximate_points_map)) + '/' + str(count))


if __name__ == '__main__':
    unittest.main()
