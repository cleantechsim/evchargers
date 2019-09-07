#ifndef GEO_CLUSTERING_POINT_MERGER_H
#define GEO_CLUSTERING_POINT_MERGER_H

#include "bitmap.h"
#include "scratchbuf.h"
#include "geo_scratch_types.h"
#include "debug.h"

int32_t merge_distances_below_max(
    indent_t indent,
    const geo_scratch_distance_t *const distances,
    uint32_t num_distances,
    float max_diameter_km,
    scratch_buf_t *out_merged_points,
    bitmap_t out_removed_points
);

#endif


