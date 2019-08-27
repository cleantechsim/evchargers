
import random
from geo_types import GeoPoint, GeoPoints


class GeoPointGen:

    @staticmethod
    def generate(num_points):

        points = []

        for i in range(0, num_points):
            latitude = random.random() * 180 - 90
            longitude = random.random() * 360 - 180

            point = GeoPoint(latitude, longitude)

            # print('Generated point ' + str(point))

            points.append(point)

        return GeoPoints(points)
