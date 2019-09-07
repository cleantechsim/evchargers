
import unittest

from geo_clustering.geo_distances_from_points_buckets import _compute_factors


class GeoDistancesFromPointsBuckets(unittest.TestCase):

    def test_compute_factors(self):

        kms_per_bucket, num_buckets, degrees_per_bucket = _compute_factors(
            0, 90, -90, 18000, 600)

        self.assertEquals(1800, kms_per_bucket)
        self.assertEquals(10, num_buckets)
        self.assertEquals(18, degrees_per_bucket)

    def test_compute_factors_with_rounding(self):

        kms_per_bucket, num_buckets, degrees_per_bucket = _compute_factors(
            0, 90, -90, 18000, 630)

        self.assertEquals(1890, kms_per_bucket)
        self.assertEquals(10, num_buckets)
        self.assertEquals(18, degrees_per_bucket)

    def test_compute_factors_with_rounding_less(self):

        kms_per_bucket, num_buckets, degrees_per_bucket = _compute_factors(
            0, 90, -90, 18000, 580)

        self.assertEquals(1740, kms_per_bucket)
        self.assertEquals(11, num_buckets)
        self.assertAlmostEquals(16.363636363636, degrees_per_bucket)


if __name__ == '__main__':
    unittest.main()
