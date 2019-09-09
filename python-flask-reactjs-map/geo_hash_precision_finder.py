from haversine import haversine


class GeoHashPrecisionFinder:

    @staticmethod
    def find_geohash_bits_from_width_geo_bounds_kms(geo_bounds):

        mid_latitude = geo_bounds.top() - (geo_bounds.height() / 2)

        kms = haversine(
            (
                mid_latitude,
                geo_bounds.left(),
            ),
            (
                mid_latitude,
                geo_bounds.right(),
            )
        )

        # width found as shortest path on other side of globe
        if (geo_bounds.width() > 180):
            half_world_width = haversine((0, -90), (0, 90))
            updated = (2 * half_world_width) - kms
            print('width > 180, return ' + str(updated) + ' from ' + str(kms))
            kms = updated

        print('## find from kms ' + str(kms))

        return GeoHashPrecisionFinder.find_geohash_bits_from_width_kms(kms)

    @staticmethod
    def find_geohash_bits_from_width_kms(width_kms):

        # Use a simple lookup for at what width of display to use which precision
        # width_kms is width of display in kms at the mid height of the display

        mapping = {
            35000: 2,  # above 35000
            10000: 3,
            1000: 4,
            250: 5,
            50: 6,
            10: 7,
            3: 8,
            0.5: 9,
            0.1: 10
        }

        precision = -1

        sorted_keys = [] + mapping.keys()

        sorted_keys.sort(lambda key, other: 1 if key <
                         other else (-1 if key > other else 0))

        for key in sorted_keys:
            if width_kms > key:
                precision = mapping[key]
                break

        if precision == -1:
            sorted = [] + mapping.values()
            sorted.sort()

            precision = sorted[len(sorted) - 1]

        return precision

    # Find the bit precision level at which it is suitable to return geohash points
    # that is we split in such and such many grid cells
    # We define this as the level where there is more than 100 geohash grid cells horizontally

    @staticmethod
    def find_geohash_bits_from_width_degrees(width_degrees, requested_grid_cells):

        cur_geohash_width_degrees = 180.0

        found = -1

        for bits in range(1, 150):

            # divide by cur geohash grid cell width
            num_cells = width_degrees / cur_geohash_width_degrees

            if num_cells >= requested_grid_cells:
                found = bits
                break

            cur_geohash_width_degrees /= 2

        return found

    @staticmethod
    def find_geohash_precision_from_width_bits(bits):

        if bits <= 0:
            raise Exception('bits must be positive integer > 0 ' + str(bits))

        precision = 0
        even_bit = True

        count = 0

        done = False
        bit = 0

        while not done:
            if bit % 5 == 0:
                precision = precision + 1

            if even_bit:
                count = count + 1

            if count >= bits:
                done = True

            even_bit = not even_bit
            bit = bit + 1

        return precision

    @staticmethod
    def find_geohash_precision_from_width_degrees(width_degrees, requested_grid_cells):

        bits = GeoHashPrecisionFinder.find_geohash_bits_from_width_degrees(
            width_degrees, requested_grid_cells)

        return GeoHashPrecisionFinder.find_geohash_precision_from_width_bits(bits)
