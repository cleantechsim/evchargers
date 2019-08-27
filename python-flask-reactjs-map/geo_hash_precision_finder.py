class GeoHashPrecisionFinder:

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
