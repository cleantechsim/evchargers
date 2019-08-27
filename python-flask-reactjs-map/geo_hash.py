import json

from geo_types import GeoPoint, GeoBounds


class GeoHash:

    def __init__(self, hash, bits, bounds, value):
        self.hash = hash
        self.bits = bits
        self.bounds = bounds
        self.value = value

    @staticmethod
    def generate_base32_lookup(values):

        lookup = {}

        values_len = len(values)
        for i in range(0, values_len):
            c = values[i]

            lookup[c] = i

        return lookup

    base32_values = "0123456789bcdefghjkmnpqrstuvwxyz"
    base32_lookup = generate_base32_lookup.__func__(base32_values)

    @staticmethod
    def decode(hash):

        bits = GeoHash._decode_base32_to_bitarray(hash)

        bits_len = len(bits)

        latitude_range = 90.0
        longitude_range = 180.0

        latitude = 0.0
        longitude = 0.0

        even_bit = True

        longitude_left = 0.0
        longitude_width = 0.0

        latitude_top = 0.0
        latitude_height = 0.0

        for i in range(0, bits_len):

            bit = bits[i]

            if (even_bit):
                val = longitude_range / 2
                if bit:
                    to_add = val
                    longitude_left = 0 if i == 0 else longitude_left
                else:
                    to_add = -val
                    longitude_left = -180 if i == 0 else longitude

                longitude_width = longitude_range

                longitude += to_add
                longitude_range = val
            else:
                val = latitude_range / 2
                if bit:
                    to_add = val
                    latitude_top = 90 if i == 1 else latitude_top
                else:
                    to_add = -val
                    latitude_top = 0 if i == 1 else latitude

                latitude_height = latitude_range

                latitude += to_add
                latitude_range = val

            even_bit = not even_bit

            '''
            print('latitude ' + str(latitude) + ' longitude ' + str(longitude) +
                  ' left ' + str(longitude_left) + ' width ' + str(longitude_width) +
                  ' top ' + str(latitude_top) + ' height ' +
                  str(latitude_height)
                  )
            '''

        bounds = GeoBounds(latitude_top, longitude_left,
                           latitude_height, longitude_width)

        return GeoHash(hash, bits, bounds, GeoPoint(latitude, longitude))

    @staticmethod
    def _decode_base32_to_bitarray(hash):

        # Decode out of base32
        hash_len = len(hash)
        if (hash_len == 0):
            raise "Empty string"

        # Create a binary array representing the bits
        bits = []

        for i in range(0, hash_len):
            c = hash[i]

            value = GeoHash.base32_lookup[c]

            for bit in range(4, -1, -1):

                is_set = (1 << bit) & value != 0

                bits.append(is_set)

        return bits
