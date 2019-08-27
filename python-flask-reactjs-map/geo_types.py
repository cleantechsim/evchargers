
class GeoPoint:

    def __init__(self, latitude, longitude):
        self.latitude = latitude
        self.longitude = longitude

    def __str__(self):
        return '(' + str(self.latitude) + ', ' + str(self.longitude) + ')'

    def to_tuple(self):
        return (self.latitude, self.longitude)


class GeoSwNe:

    def __init__(
        self,
        swLatitude,
        swLongitude,
        neLatitude,
        neLongitude
    ):
        if swLatitude > neLatitude:
            raise Exception('swLatitude > neLatitude')

        if swLongitude > neLongitude:
            raise Exception('swLongitude > neLongitude')

        self.swLatitude = swLatitude
        self.swLongitude = swLongitude
        self.neLatitude = neLatitude
        self.neLongitude = neLongitude

    def to_geo_bounds(self):
        return GeoBounds._from_sw_ne(self.swLatitude, self.swLongitude, self.neLatitude, self.neLongitude)


class GeoPoints:
    def __init__(self, points):
        self.points = points


class GeoBounds:

    # top, left, height, width because of lat, lng prefered order
    def __init__(self, _top, _left, _height, _width):
        self.t = _top
        self.l = _left
        self.h = _height
        self.w = _width

        if self.top() < -90:
            raise Exception('top < -90 ' + str(self.top()))

        if self.top() > 90:
            raise Exception('top > 90 ' + str(self.top()))

        if self.left() < -180:
            raise Exception('left < -180 ' + str(self.left()))

        if self.left() > 180:
            raise Exception('left > 180 ' + str(self.left()))

        if self.height() < 0:
            raise Exception('height < 0 ' + str(self.height()))

        if self.height() > 180:
            raise Exception('height > 180 ' + str(self.height()))

        if self.width() < 0:
            raise Exception('width < 0 ' + str(self.width()))

        if self.width() > 360:
            raise Exception('width > 360 ' + str(self.width()))

        if self.bottom() < -90:
            raise Exception('bottom < -90 ' + str(self.bottom()))

        if self.bottom() > 90:
            raise Exception('bottom > 90 ' + str(self.bottom()))

        if self.right() < -180:
            raise Exception('right < -180 ' + str(self.right()))

        if self.right() > 180:
            raise Exception('right > 180 ' + str(self.right()))

    def top(self):
        return self.t

    def left(self):
        return self.l

    def height(self):
        return self.h

    def width(self):
        return self.w

    def bottom(self):
        return self.t - self.h

    def right(self):
        return self.l + self.w

    @staticmethod
    def _from_sw_ne(swLatitude, swLongitude, neLatitude, neLongitude):
        return GeoBounds(
            neLatitude,
            swLongitude,
            GeoBounds._degrees(neLatitude, swLatitude),
            GeoBounds._degrees(neLongitude, swLongitude))

    @staticmethod
    def _degrees(upper, lower):
        if lower > upper:
            raise Exception('upper > lower')

        if upper < 0:
            degrees = abs(lower) - abs(upper)
        else:
            degrees = upper - lower

        return degrees

    def __eq__(self, other):

        if not isinstance(other, GeoBounds):
            equals = False
        else:
            equals = (self.t == other.t
                      and self.l == other.l
                      and self.h == other.h
                      and self.w == other.w)

        return equals

    def __ne__(self, other):
        return not self.__eq__(other)

    def __str__(self):
        return '(' + str(self.t) + ', ' + str(self.l) + ', ' + str(self.h) + ', ' + str(self.w) + ')'

    def __repr__(self):
        return self.__str__()


class GeoPointAggregation(GeoPoint):

    def __init_(self, latitude, longitude, bounds, count):
        super(latitude, longitude)

        self.bounds = bounds
        self.count = count


class GeoHashAggregation:
    def __init(self, hash, count):
        self.hash = hash
        self.count = count


class GeoHashPointAggregation:
    def __init_(self, latitude, longitude, hash, count):
        super(latitude, longitude)

        self.hash = hash
        self.count = count
