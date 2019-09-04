# Simple test point class with same API as clustering points

from geo_types import GeoPoint


class TestPoint:

    def __init__(self, latitude, longitude):
        self.point = GeoPoint(latitude, longitude)

    def get_point(self):
        return self.point

    def __str__(self):
        return self.point.__str__()
