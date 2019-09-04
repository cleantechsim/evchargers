
class Distance:

    def __init__(self, distance, from_point, to_point):
        self.distance = distance
        self.from_point = from_point
        self.to_point = to_point

    def get_distance(self):
        return self.distance

    def __str__(self):
        return '{ d=' + str(self.distance) + ', from=' + str(self.from_point) + ', to=' + str(self.to_point) + ' }'

    def __repr__(self):
        return self.__str__()
