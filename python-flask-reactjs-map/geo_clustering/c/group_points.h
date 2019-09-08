#ifndef GROUP_POINTS_H
#define GROUP_POINTS_H

#include "types.h"
#include "geo_types.h"
#include "geo_clustering_types.h"
#include "geo_scratch_types.h"
#include "debug.h"

int32_t group_points(
    indent_t indent,
    const geo_scratch_clustered_point_t *const points, 
    const size_t num_points,
    geo_scratch_point_array_t *const dst,
    const float max_km,
    scratch_buf_t *scratch_buf);

void free_grouped_points(geo_scratch_point_array_t *const array, uint32_t num_points);
 
#endif

