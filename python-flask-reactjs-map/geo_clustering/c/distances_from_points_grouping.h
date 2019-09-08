#ifndef DISTANCES_FROM_POINTS_GROUPING_H
#define DISTANCES_FROM_POINTS_GROUPING_H

#include "scratchbuf.h"
#include "geo_scratch_types.h"
#include "debug.h"

int make_distances_with_max(
    indent_t indent,
    const geo_scratch_clustered_point_t *const points,
    uint32_t num_points,
    float max_km,

    scratch_buf_t *distances_scratch_buf

);

#endif
