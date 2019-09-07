#include <math.h>

#include "haversine.h"

static const float AVG_EARTH_RADIUS_KM = 6371.0088;

static const float CONVERSIONS [] = {
    1.0
};

#define RADIANS(x) (((x) * M_PI) / 180.0)

float haversine(
    float latitude,
    float longitude,
    float other_latitude,
    float other_longitude,
    unit_t unit) {

    const float avg_earth_radius = AVG_EARTH_RADIUS_KM * CONVERSIONS[unit];

    const float r_latitude = RADIANS(latitude);
    const float r_longitude = RADIANS(longitude);
    const float r_other_latitude = RADIANS(other_latitude);
    const float r_other_longitude = RADIANS(other_longitude);

    const float latitude_diff = r_other_latitude - r_latitude;
    const float longitude_diff = r_other_longitude - r_longitude;

    const float d = powf(sinf(latitude_diff * 0.5), 2) + cosf(r_latitude) *
                        cosf(r_other_latitude) * powf(sinf(longitude_diff * 0.5), 2);

    return 2 * avg_earth_radius * asinf(sqrtf(d));
}

