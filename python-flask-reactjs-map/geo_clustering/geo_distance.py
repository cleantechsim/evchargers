
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

    def __hash__(self):
        return int(self.distance) + id(self.from_point) + id(self.to_point)

    def __eq__(self, other):
        return self.distance.__eq__(other.distance) and self.from_point == other.from_point and self.to_point == other.to_point
