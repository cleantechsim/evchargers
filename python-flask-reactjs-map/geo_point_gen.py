
import random
from geo_types import GeoPoint, GeoPoints, GeoBounds


class GeoPointGen:

    @staticmethod
    def generate_with_world_bounds(num_points):
        world_bounds = GeoBounds(90, -180, 180, 360)

        return GeoPointGen.generate_in_bounds(num_points, world_bounds)

    @staticmethod
    def generate_in_bounds(num_points, geo_bounds):

        points = []

        for i in range(0, num_points):
            latitude = random.random() * geo_bounds.height() - 90
            longitude = random.random() * geo_bounds.width() - 180

            point = GeoPoint(latitude, longitude)

            # print('Generated point ' + str(point))

            points.append(point)

            i

        return GeoPoints(points)
