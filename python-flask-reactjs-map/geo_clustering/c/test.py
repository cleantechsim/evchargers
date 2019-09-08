
import sys

sys.path.append('.')

from geo_clustering_c import merge_aggregations

class GeoPoint:

    def __init__(self, latitude, longitude):
        self.latitude = latitude
        self.longitude = longitude

    def __str__(self):
        return '(' + str(self.latitude) + ', ' + str(self.longitude) + ')'        


class TestPoint:

    def __init__(self, count, latitude, longitude):
        self.count = count
        self.point = GeoPoint(latitude, longitude)

    def get_point(self):
        return self.point

    def __str__(self):
        return '' # 'count=' + str(self.count) + ', point=' + str(self.point)


points = [TestPoint(123, 1.5, 3.5)]

result = merge_aggregations('__main__', 'TestPoint', points, 2000.0)

if result == None:
    print('result is None')

else:

    for point in result:
        print('got result ' + str(point.get_point().latitude))



