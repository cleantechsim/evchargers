from geo_types import GeoPoint

class MergedPoint:

    def __init__(self, count, latitude, longitude):
        self.count = count
        self.point = GeoPoint(latitude, longitude)

    def get_point(self):
        return self.point

    def __str__(self):
        return 'count = ' + str(self.count) + ', point =' + str(self.point)

