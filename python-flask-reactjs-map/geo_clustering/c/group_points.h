#ifndef GROUP_POINTS_H
#define GROUP_POINTS_H

#include "geo_types.h"

boolean group_points(
    const geo_point_t *const points, 
    const size_t num_points,
    geo_point_array_t *const dst,
    const float max_km,
    scratch_buf_t *scratch_buf);

#endif

