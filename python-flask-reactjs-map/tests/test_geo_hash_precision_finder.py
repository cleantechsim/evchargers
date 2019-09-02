
import unittest

from geo_hash_precision_finder import GeoHashPrecisionFinder


class GeoHashPrecisionFinderTest(unittest.TestCase):

    def test_bits1(self):
        self.assertEquals(
            GeoHashPrecisionFinder.find_geohash_bits_from_width_degrees(
                360, 1),
            1)

    def test_bits2(self):
        self.assertEquals(
            GeoHashPrecisionFinder.find_geohash_bits_from_width_degrees(
                360, 2),
            1)

    def test_bits2_3(self):
        self.assertEquals(
            GeoHashPrecisionFinder.find_geohash_bits_from_width_degrees(
                360, 3),
            2)

    def test_bits2_4(self):
        self.assertEquals(
            GeoHashPrecisionFinder.find_geohash_bits_from_width_degrees(
                360, 4),
            2)

    def test_bits3(self):
        self.assertEquals(
            GeoHashPrecisionFinder.find_geohash_bits_from_width_degrees(
                360, 5),
            3)

    def test_bits3_8(self):
        self.assertEquals(
            GeoHashPrecisionFinder.find_geohash_bits_from_width_degrees(
                360, 8),
            3)

    def test_bits4(self):
        self.assertEquals(
            GeoHashPrecisionFinder.find_geohash_bits_from_width_degrees(
                360, 9),
            4)

    def test_bits_split_100(self):
        self.assertEquals(
            GeoHashPrecisionFinder.find_geohash_bits_from_width_degrees(
                360, 100),
            7)  # 2^7 = 128

    def test_bits_split_200(self):
        self.assertEquals(
            GeoHashPrecisionFinder.find_geohash_bits_from_width_degrees(
                360, 200),
            8)  # 2^8 = 256

    def test_bits_split_300(self):
        self.assertEquals(
            GeoHashPrecisionFinder.find_geohash_bits_from_width_degrees(
                360, 300),
            9)  # 2^9 = 512

    def test_bits_split_120_by_100(self):
        self.assertEquals(
            GeoHashPrecisionFinder.find_geohash_bits_from_width_degrees(
                120, 100),
            9)  # 2^9 = 512

    def test_precision_bits0(self):

        try:
            GeoHashPrecisionFinder.find_geohash_precision_from_width_bits(0),

            self.fail('Expected exception')
        except:
            True  # lint

    def test_precision_bits1(self):
        self.assertEquals(
            GeoHashPrecisionFinder.find_geohash_precision_from_width_bits(1),
            1
        )

    def test_precision_bits2(self):
        self.assertEquals(
            GeoHashPrecisionFinder.find_geohash_precision_from_width_bits(2),
            1
        )

    def test_precision_bits3(self):
        self.assertEquals(
            GeoHashPrecisionFinder.find_geohash_precision_from_width_bits(3),
            1
        )

    def test_precision_bits4(self):
        self.assertEquals(
            GeoHashPrecisionFinder.find_geohash_precision_from_width_bits(4),
            2
        )

    def test_precision_bits5(self):
        self.assertEquals(
            GeoHashPrecisionFinder.find_geohash_precision_from_width_bits(5),
            2
        )

    def test_precision_bits6(self):
        self.assertEquals(
            GeoHashPrecisionFinder.find_geohash_precision_from_width_bits(6),
            3
        )

    def test_find_geohash_bits_from_width_kms_40000(self):
        self.assertEquals(
            GeoHashPrecisionFinder.find_geohash_bits_from_width_kms(40000),
            1)

    def test_find_geohash_bits_from_width_kms_5000(self):
        self.assertEquals(
            GeoHashPrecisionFinder.find_geohash_bits_from_width_kms(5000),
            2)

    def test_find_geohash_bits_from_width_kms_1000(self):
        self.assertEquals(
            GeoHashPrecisionFinder.find_geohash_bits_from_width_kms(1000),
            3)

    def test_find_geohash_bits_from_width_kms_0_1(self):
        self.assertEquals(
            GeoHashPrecisionFinder.find_geohash_bits_from_width_kms(0.1),
            6)


if __name__ == '__main__':
    unittest.main()
