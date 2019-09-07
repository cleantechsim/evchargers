#ifndef DISTANCES_FROM_POINTS_GROUPING_H
#define DISTANCES_FROM_POINTS_GROUPING_H

#include "scratchbuf.h"
#include "geo_clustering_types.h"

int make_distances_with_max(
    const geo_clustered_point_t *const points,
    uint32_t num_points,
    const int max_km,

    scratch_buf_t *distances_scratch_buf

);

#endif
