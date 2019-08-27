
import unittest

from geo_types import GeoBounds


class GeoBoundsTest(unittest.TestCase):

    def test_from_sw_ne_both_positive(self):
        self.assertEquals(
            GeoBounds.from_sw_ne(swLatitude=20, swLongitude=40,
                                 neLatitude=85, neLongitude=150),

            GeoBounds(top=85, left=40, height=65, width=110)
        )

    def test_from_sw_ne_positive_and_negative(self):
        self.assertEquals(
            GeoBounds.from_sw_ne(swLatitude=-20, swLongitude=-40,
                                 neLatitude=85, neLongitude=150),

            GeoBounds(top=85, left=-40, height=105, width=190)
        )

    def test_from_sw_ne_both_negative(self):
        self.assertEquals(
            GeoBounds.from_sw_ne(swLatitude=-85, swLongitude=-150,
                                 neLatitude=-40, neLongitude=-40),

            GeoBounds(top=-40, left=-150, height=45, width=110)
        )


if __name__ == '__main__':
    unittest.main()
